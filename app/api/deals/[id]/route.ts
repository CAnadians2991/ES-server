import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Отримати детальну інформацію про угоду
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
        candidates: {
          include: {
            candidate: true
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
    console.error('Error fetching deal detail:', error)
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
      contacts,
      dealStage,
      dealStatus,
      totalAmount,
      dealCurrency,
      paymentStatus,
      recipientType,
      isReadyForAdmin,
      adminApproved,
      submittedToPartner,
      candidateIds
    } = body

    // Перевіряємо права доступу
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

    // Оновлюємо угоду
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
        contacts,
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

    // Оновлюємо кандидатів якщо передано
    if (candidateIds && candidateRoles) {
      // Видаляємо старі зв'язки
      await prisma.dealCandidate.deleteMany({
        where: { dealId }
      })

      // Оновлюємо кандидатів - позначаємо що вони не в угоді
      await prisma.candidate.updateMany({
        where: { currentDealId: dealId },
        data: { 
          isInDeal: false,
          currentDealId: null
        }
      })

      // Додаємо нові зв'язки
      if (candidateIds.length > 0) {
        const dealCandidates = candidateIds.map((candidateId: number) => ({
          dealId,
          candidateId
        }))

        await prisma.dealCandidate.createMany({
          data: dealCandidates
        })

        // Оновлюємо кандидатів
        await prisma.candidate.updateMany({
          where: { id: { in: candidateIds } },
          data: { 
            isInDeal: true,
            currentDealId: dealId
          }
        })
      }
    }

    // Створюємо активність про оновлення
    await prisma.dealActivity.create({
      data: {
        dealId,
        type: 'deal_updated',
        title: 'Оновлено угоду',
        description: `Оновлено угоду "${title}"`,
        userId: user.id,
        userName: user.fullName
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

    // Оновлюємо кандидатів - позначаємо що вони не в угоді
    await prisma.candidate.updateMany({
      where: { currentDealId: dealId },
      data: { 
        isInDeal: false,
        currentDealId: null
      }
    })

    // Видаляємо угоду (каскадне видалення зв'язків)
    await prisma.deal.delete({
      where: { id: dealId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
