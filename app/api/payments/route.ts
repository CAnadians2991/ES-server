import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const paymentSchema = z.object({
  candidateId: z.number(),
  amount: z.number().min(0),
  paymentDate: z.string(),
  paymentStatus: z.string().min(1),
  expectedDate: z.string().nullable().optional(),
  recipientType: z.string().min(1),
  bankAccount: z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  referenceNumber: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const paymentStatus = searchParams.get('paymentStatus')
    const recipientType = searchParams.get('recipientType')

    const where: any = {}

    if (paymentStatus) where.paymentStatus = paymentStatus
    if (recipientType) where.recipientType = recipientType

    if (month || year) {
      where.paymentDate = {}
      if (month && year) {
        const startDate = new Date(`${year}-${month}-01`)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)
        where.paymentDate = {
          gte: startDate,
          lt: endDate,
        }
      } else if (year) {
        const startDate = new Date(`${year}-01-01`)
        const endDate = new Date(`${parseInt(year) + 1}-01-01`)
        where.paymentDate = {
          gte: startDate,
          lt: endDate,
        }
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        candidate: true,
      },
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    const payment = await prisma.payment.create({
      data: {
        ...validatedData,
        paymentDate: new Date(validatedData.paymentDate),
        expectedDate: validatedData.expectedDate ? new Date(validatedData.expectedDate) : null,
      },
      include: {
        candidate: true,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

