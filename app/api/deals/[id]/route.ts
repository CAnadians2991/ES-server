import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Отримати угоду за ID
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

    const dealId = parseInt(params.id)
    if (isNaN(dealId)) {
      return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 })
    }

    const deal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        // Перевіряємо права доступу
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      },
      include: {
        dealContacts: {
          include: {
            contact: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { uploadedAt: 'desc' }
        }
      }
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Оновити угоду
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

    const dealId = parseInt(params.id)
    if (isNaN(dealId)) {
      return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      title,
      description,
      vacancyCountry,
      projectName,
      partnerNumber,
      workCity,
      workAddress,
      arrivalDate,
      transportType,
      dealStage,
      dealStatus,
      totalAmount,
      dealCurrency,
      paymentStatus,
      recipientType,
      isReadyForAdmin,
      adminApproved,
      submittedToPartner
    } = body

    // Перевіряємо чи існує угода
    const existingDeal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      }
    })

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        title,
        description,
        vacancyCountry,
        projectName,
        partnerNumber,
        workCity,
        workAddress,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        transportType,
        dealStage,
        dealStatus,
        totalAmount,
        dealCurrency,
        paymentStatus,
        recipientType,
        isReadyForAdmin,
        adminApproved,
        submittedToPartner,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedDeal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Видалити угоду
export async function DELETE(
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

    const dealId = parseInt(params.id)
    if (isNaN(dealId)) {
      return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 })
    }

    // Перевіряємо права доступу
    if (user.role !== 'ADMIN' && user.role !== 'DIRECTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Перевіряємо чи існує угода
    const existingDeal = await prisma.deal.findFirst({
      where: { id: dealId }
    })

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    await prisma.deal.delete({
      where: { id: dealId }
    })

    return NextResponse.json({ message: 'Deal deleted successfully' })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}