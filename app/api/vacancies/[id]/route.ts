import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: Number(params.id) },
    })

    if (!vacancy) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 })
    }

    return NextResponse.json(vacancy)
  } catch (error) {
    console.error('Error fetching vacancy:', error)
    return NextResponse.json({ error: 'Failed to fetch vacancy' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const vacancy = await prisma.vacancy.update({
      where: { id: Number(params.id) },
      data: body,
    })

    return NextResponse.json(vacancy)
  } catch (error) {
    console.error('Error updating vacancy:', error)
    return NextResponse.json({ error: 'Failed to update vacancy' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vacancy.delete({
      where: { id: Number(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vacancy:', error)
    return NextResponse.json({ error: 'Failed to delete vacancy' }, { status: 500 })
  }
}

