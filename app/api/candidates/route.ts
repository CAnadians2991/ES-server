import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const candidateSchema = z.object({
  branch: z.string().default('ЦО'),
  responsible: z.string().default(''),
  firstName: z.string().default(''),
  lastName: z.string().default(''),
  phone: z.string().default(''),
  age: z.number().default(18),
  candidateCountry: z.string().default('Україна'),
  vacancyCountry: z.string().default('Польща'),
  projectName: z.string().default(''),
  partnerNumber: z.string().nullable().optional(),
  arrivalDate: z.string().nullable().optional(),
  candidateStatus: z.string().default('Зареєстровано'),
  paymentAmount: z.number().default(0),
  paymentStatus: z.string().nullable().optional(),
  recipientType: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
}).partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branch = searchParams.get('branch')
    const vacancyCountry = searchParams.get('vacancyCountry')
    const candidateStatus = searchParams.get('candidateStatus')
    const responsible = searchParams.get('responsible')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')

    const where: any = {
      isDeleted: false, // Показуємо тільки не видалені
    }

    if (branch) where.branch = branch
    if (vacancyCountry) where.vacancyCountry = vacancyCountry
    if (candidateStatus) where.candidateStatus = candidateStatus
    if (responsible) where.responsible = responsible
    
    // Фільтр по даті тільки якщо явно вказано
    if (month && year) {
      const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      }
    } else if (year) {
      const startDate = new Date(`${year}-01-01`)
      const endDate = new Date(`${parseInt(year) + 1}-01-01`)
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      }
    }
    // Якщо фільтри не вказані, показуємо всі дані без обмежень по даті

    const totalCount = await prisma.candidate.count({ where })

        const pageNum = page ? parseInt(page) : 1
        const limitNum = limit ? Math.min(parseInt(limit), 100) : 100 // Максимум 100 для слабких комп'ютерів
    const skip = (pageNum - 1) * limitNum

        const candidates = await prisma.candidate.findMany({
          where,
          orderBy: { id: 'desc' },
          skip,
          take: limitNum,
        })

    return NextResponse.json({
      data: candidates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received body:', body)
    
    const validatedData = candidateSchema.parse(body)
    console.log('Validated data:', validatedData)

    const dataToCreate: any = {
      branch: validatedData.branch ?? 'ЦО',
      responsible: validatedData.responsible ?? '',
      firstName: validatedData.firstName ?? '',
      lastName: validatedData.lastName ?? '',
      phone: validatedData.phone ?? '',
      age: validatedData.age ?? 18,
      candidateCountry: validatedData.candidateCountry ?? 'Україна',
      vacancyCountry: validatedData.vacancyCountry ?? 'Польща',
      projectName: validatedData.projectName ?? '',
      partnerNumber: validatedData.partnerNumber ?? '',
      candidateStatus: validatedData.candidateStatus ?? 'Зареєстровано',
      paymentAmount: validatedData.paymentAmount ?? 0,
    }

    if (validatedData.arrivalDate) dataToCreate.arrivalDate = new Date(validatedData.arrivalDate)
    if (validatedData.paymentStatus) dataToCreate.paymentStatus = validatedData.paymentStatus
    if (validatedData.recipientType) dataToCreate.recipientType = validatedData.recipientType
    if (validatedData.comment) dataToCreate.comment = validatedData.comment

    const candidate = await prisma.candidate.create({
      data: dataToCreate,
    })

    console.log('Created candidate:', candidate)
    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error('Error creating candidate:', error)
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create candidate', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

