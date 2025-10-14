import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { draggedId, targetId } = await request.json()

    // Використовуємо транзакцію для швидшості
    await prisma.$transaction(async (tx) => {
      // Отримуємо тільки необхідні поля
      const dragged = await tx.candidate.findUnique({ 
        where: { id: draggedId },
        select: { id: true, sortOrder: true }
      })
      const target = await tx.candidate.findUnique({ 
        where: { id: targetId },
        select: { id: true, sortOrder: true }
      })

      if (!dragged || !target) {
        throw new Error('Candidates not found')
      }

      // Простий алгоритм перестановки
      const newOrder = (target as any).sortOrder + 1

      await tx.candidate.update({
        where: { id: draggedId },
        data: { sortOrder: newOrder } as any,
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering candidates:', error)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}

