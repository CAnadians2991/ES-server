import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Отримати активності кандидата
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Перевіряємо права доступу до кандидата
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        isDeleted: false,
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const activities = await prisma.activity.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.activity.count({
      where: { candidateId }
    })

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Створити нову активність
export async function POST(
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
    const { type, title, description, metadata, isPinned = false } = body

    // Перевіряємо права доступу до кандидата
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        isDeleted: false,
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Створюємо активність
    const activity = await prisma.activity.create({
      data: {
        candidateId,
        type,
        title,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isPinned,
        userId: user.userId,
        userName: user.fullName
      }
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
