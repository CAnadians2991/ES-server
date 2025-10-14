import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = parseInt(params.id)

    // Перевіряємо чи запис вже видалений (soft delete)
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    if (!candidate.isDeleted) {
      return NextResponse.json(
        { error: 'Candidate must be soft-deleted first' },
        { status: 400 }
      )
    }

    // Логуємо перед видаленням
    await createAuditLog({
      entityType: 'Candidate',
      entityId: candidateId,
      action: 'DELETE',
      oldData: candidate,
    })

    // Видаляємо назавжди
    await prisma.candidate.delete({
      where: { id: candidateId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error permanently deleting candidate:', error)
    return NextResponse.json(
      { error: 'Failed to permanently delete candidate' },
      { status: 500 }
    )
  }
}

