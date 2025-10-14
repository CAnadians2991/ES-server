import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const managerId = searchParams.get('managerId')
    const status = searchParams.get('status')
    const packageType = searchParams.get('packageType')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {}

    if (managerId) where.managerId = Number(managerId)
    if (status) where.status = status
    if (packageType) where.packageType = packageType

    if (month || year) {
      where.createdAt = {}
      if (month && year) {
        const startDate = new Date(Number(year), Number(month) - 1, 1)
        const endDate = new Date(Number(year), Number(month), 1)
        where.createdAt = {
          gte: startDate,
          lt: endDate,
        }
      } else if (year) {
        const startDate = new Date(Number(year), 0, 1)
        const endDate = new Date(Number(year) + 1, 0, 1)
        where.createdAt = {
          gte: startDate,
          lt: endDate,
        }
      }
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        candidate: true,
        vacancy: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const application = await prisma.application.create({
      data: body,
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}

