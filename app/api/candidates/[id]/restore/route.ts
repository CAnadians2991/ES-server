import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = parseInt(params.id)

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    })

    // Логуємо відновлення
    await createAuditLog({
      entityType: 'Candidate',
      entityId: candidateId,
      action: 'RESTORE',
      newData: candidate,
    })

    return NextResponse.json({ success: true, candidate })
  } catch (error) {
    console.error('Error restoring candidate:', error)
    return NextResponse.json(
      { error: 'Failed to restore candidate' },
      { status: 500 }
    )
  }
}

