import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const deletedCandidates = await prisma.candidate.findMany({
      where: {
        isDeleted: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        branch: true,
        deletedAt: true,
        deletedBy: true,
      },
      orderBy: {
        deletedAt: 'desc',
      },
    })

    return NextResponse.json(deletedCandidates)
  } catch (error) {
    console.error('Error fetching deleted candidates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deleted candidates' },
      { status: 500 }
    )
  }
}

