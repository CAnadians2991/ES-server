import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const branch = searchParams.get('branch')

    const where: any = {}

    if (userId) where.userId = Number(userId)
    if (month) where.month = Number(month)
    if (year) where.year = Number(year)

    let salaries = await prisma.monthlySalary.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })

    if (branch) {
      salaries = salaries.filter(s => s.user.branch === branch)
    }

    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching salaries:', error)
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const salary = await prisma.monthlySalary.create({
      data: body,
    })

    return NextResponse.json(salary, { status: 201 })
  } catch (error) {
    console.error('Error creating salary:', error)
    return NextResponse.json({ error: 'Failed to create salary' }, { status: 500 })
  }
}

