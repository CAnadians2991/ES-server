import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Отримати всі контакти
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

    console.log('User fetching contacts:', {
      userId: user.userId,
      username: user.username,
      role: user.role,
      branch: user.branch
    })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const branch = searchParams.get('branch')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Базовий фільтр
    const where: any = {}
    
    // Фільтр по менеджеру для менеджерів (показуємо тільки їх контакти)
    if (user.role !== 'ADMIN' && user.role !== 'DIRECTOR') {
      where.managerId = user.userId
    }
    
    // Додаткові фільтри
    if (branch && (user.role === 'ADMIN' || user.role === 'DIRECTOR')) {
      where.branch = branch
    }
    if (status) {
      where.candidateStatus = status
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.contact.count({ where })

    console.log('Contacts query result:', {
      where,
      contactsCount: contacts.length,
      total,
      contacts: contacts.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, branch: c.branch }))
    })

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Створити новий контакт
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

    console.log('User creating contact:', {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      branch: user.branch
    })

    const body = await request.json()
    const {
      firstName,
      lastName,
      phone,
      age,
      candidateCountry,
      vacancyCountry,
      projectName,
      candidateStatus,
      notes
    } = body

    // Перевіряємо дублі по телефону
    const existingContact = await prisma.contact.findUnique({
      where: { phone }
    })

    if (existingContact) {
      return NextResponse.json({ 
        error: 'Contact with this phone already exists',
        existingContact: {
          id: existingContact.id,
          firstName: existingContact.firstName,
          lastName: existingContact.lastName,
          phone: existingContact.phone,
          age: existingContact.age,
          managerName: existingContact.managerName,
          branch: existingContact.branch,
          createdAt: existingContact.createdAt
        }
      }, { status: 409 })
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        phone,
        age: parseInt(age),
        candidateCountry,
        vacancyCountry,
        projectName,
        candidateStatus,
        notes,
        managerId: user.userId,
        managerName: user.fullName || user.username,
        branch: user.branch || 'ЦО'
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
