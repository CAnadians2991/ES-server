import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branch = searchParams.get('branch')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {}

    if (branch) where.branch = branch
    if (month) where.month = Number(month)
    if (year) where.year = Number(year)

    const expenses = await prisma.branchExpense.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const expense = await prisma.branchExpense.create({
      data: body,
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

