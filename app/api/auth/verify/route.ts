import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username: 'admin' },
    })

    if (!user) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Error verifying password:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

