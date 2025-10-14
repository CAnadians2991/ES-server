import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { orders } = await request.json()

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders format' }, { status: 400 })
    }

    // Використовуємо транзакцію для швидкого масового оновлення
    await prisma.$transaction(
      orders.map(({ id, sortOrder }) =>
        prisma.candidate.update({
          where: { id },
          data: { sortOrder } as any,
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating candidates order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
