import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { oldPassword, newPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username: 'admin' },
    })

    if (!user) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isOldPasswordValid) {
      return NextResponse.json({ error: 'Invalid old password' }, { status: 401 })
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { username: 'admin' },
      data: { password: newPasswordHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 })
  }
}

