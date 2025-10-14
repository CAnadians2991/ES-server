import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const isPriority = searchParams.get('isPriority')
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (country) where.country = country
    if (isPriority) where.isPriority = isPriority === 'true'
    if (isActive) where.isActive = isActive === 'true'

    const vacancies = await prisma.vacancy.findMany({
      where,
      orderBy: [{ isPriority: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(vacancies)
  } catch (error) {
    console.error('Error fetching vacancies:', error)
    return NextResponse.json({ error: 'Failed to fetch vacancies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const vacancy = await prisma.vacancy.create({
      data: body,
    })

    return NextResponse.json(vacancy, { status: 201 })
  } catch (error) {
    console.error('Error creating vacancy:', error)
    return NextResponse.json({ error: 'Failed to create vacancy' }, { status: 500 })
  }
}

