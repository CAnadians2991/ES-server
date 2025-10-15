import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const candidateId = parseInt(params.id)
    if (isNaN(candidateId)) {
      return NextResponse.json({ error: 'Invalid candidate ID' }, { status: 400 })
    }

    // Отримуємо детальну інформацію про кандидата з активностями та документами
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        isDeleted: false,
        // Перевіряємо права доступу
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Останні 50 активностей
        },
        documents: {
          orderBy: { uploadedAt: 'desc' }
        },
        applications: {
          include: {
            vacancy: true
          }
        },
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('Error fetching candidate detail:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const candidateId = parseInt(params.id)
    if (isNaN(candidateId)) {
      return NextResponse.json({ error: 'Invalid candidate ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      dealStage,
      dealAmount,
      dealCurrency,
      workCity,
      workAddress,
      transportType,
      contacts,
      completionDate,
      dealStatus,
      ...otherFields
    } = body

    // Перевіряємо права доступу
    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        isDeleted: false,
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      }
    })

    if (!existingCandidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Оновлюємо кандидата
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        dealStage,
        dealAmount,
        dealCurrency,
        workCity,
        workAddress,
        transportType,
        contacts,
        completionDate: completionDate ? new Date(completionDate) : null,
        dealStatus,
        ...otherFields,
        updatedAt: new Date()
      }
    })

    // Логуємо зміни в аудит
    await prisma.auditLog.create({
      data: {
        entityType: 'Candidate',
        entityId: candidateId,
        action: 'UPDATE',
        userId: user.id,
        userName: user.fullName,
        oldData: JSON.stringify(existingCandidate),
        newData: JSON.stringify(updatedCandidate),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json(updatedCandidate)
  } catch (error) {
    console.error('Error updating candidate detail:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
