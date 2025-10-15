import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Отримати всі угоди
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const stage = searchParams.get('stage')
    const status = searchParams.get('status')
    const branch = searchParams.get('branch')
    const skip = (page - 1) * limit

    // Базовий фільтр
    const where: any = {}
    
    // Фільтр по філії для менеджерів
    if (user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch) {
      where.branch = user.branch
    }
    
    // Додаткові фільтри
    if (stage) where.dealStage = stage
    if (status) where.dealStatus = status
    if (branch && (user.role === 'ADMIN' || user.role === 'DIRECTOR')) {
      where.branch = branch
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        dealContacts: {
          include: {
            contact: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.deal.count({ where })

    return NextResponse.json({
      deals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Створити нову угоду
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
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
      totalAmount,
      dealCurrency,
      contactIds = [] // Масив ID контактів
    } = body

    // Створюємо угоду
    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        managerId: user.userId,
        managerName: user.fullName || user.username,
        branch: user.branch || 'ЦО',
        vacancyCountry,
        projectName,
        partnerNumber,
        workCity,
        workAddress,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        transportType,
        totalAmount: totalAmount || 0,
        dealCurrency: dealCurrency || 'грн',
        dealStage: 'Створена',
        dealStatus: 'Активна'
      }
    })

    // Додаємо контакти до угоди
    if (contactIds.length > 0) {
      const dealContacts = contactIds.map((contactId: number) => ({
        dealId: deal.id,
        contactId
      }))

      await prisma.dealContact.createMany({
        data: dealContacts
      })
    }

    // Створюємо активність про створення угоди
    await prisma.dealActivity.create({
      data: {
        dealId: deal.id,
        type: 'deal_created',
        title: 'Створено угоду',
        description: `Створено угоду "${title}" з ${contactIds.length} контактами`,
        userId: user.userId,
        userName: user.fullName
      }
    })

    // Повертаємо угоду з контактами
    const createdDeal = await prisma.deal.findUnique({
      where: { id: deal.id },
      include: {
        dealContacts: {
          include: {
            contact: true
          }
        }
      }
    })

    return NextResponse.json(createdDeal)
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
