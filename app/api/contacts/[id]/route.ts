import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Отримати один контакт
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

    const contactId = parseInt(params.id)
    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Перевіряємо права доступу
    if (user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && contact.managerId !== user.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Оновити контакт
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

    const contactId = parseInt(params.id)
    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 })
    }

    const body = await request.json()
    
    // Перевіряємо права доступу
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId }
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && existingContact.managerId !== user.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        age: body.age,
        candidateCountry: body.candidateCountry,
        vacancyCountry: body.vacancyCountry,
        projectName: body.projectName,
        candidateStatus: body.candidateStatus,
        notes: body.notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}