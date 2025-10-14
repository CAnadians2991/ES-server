import { NextRequest, NextResponse } from 'next/server'
import { revertChange } from '@/lib/audit-log'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditLogId = parseInt(params.id)
    await revertChange(auditLogId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reverting change:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revert change' },
      { status: 500 }
    )
  }
}

