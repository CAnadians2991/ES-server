import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const limit = searchParams.get('limit')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      )
    }

    const logs = await getAuditLogs(
      entityType,
      parseInt(entityId),
      limit ? parseInt(limit) : 50
    )

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

