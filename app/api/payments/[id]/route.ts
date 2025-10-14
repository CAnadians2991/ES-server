import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const paymentUpdateSchema = z.object({
  amount: z.number().min(0).optional(),
  paymentDate: z.string().optional(),
  paymentStatus: z.string().min(1).optional(),
  expectedDate: z.string().nullable().optional(),
  recipientType: z.string().min(1).optional(),
  bankAccount: z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  referenceNumber: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = paymentUpdateSchema.parse(body)

    const payment = await prisma.payment.update({
      where: { id: parseInt(params.id) },
      data: {
        ...validatedData,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : undefined,
        expectedDate: validatedData.expectedDate ? new Date(validatedData.expectedDate) : undefined,
      },
      include: {
        candidate: true,
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating payment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.payment.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}

