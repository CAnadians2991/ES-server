import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getAuthUser, checkPermission } from '@/lib/auth'
import type { ChangePasswordRequest } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 401 })
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Невірний ID користувача' }, { status: 400 })
    }

    const { oldPassword, newPassword }: ChangePasswordRequest = await request.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Старий та новий пароль обов\'язкові' }, { status: 400 })
    }

    // Користувач може змінити тільки свій пароль, адміністратор може змінити будь-який
    if (user.userId !== userId && !checkPermission(user.role, 'users', 'write')) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Користувач не знайдений' }, { status: 404 })
    }

    // Якщо це не адміністратор, перевіряємо старий пароль
    if (user.userId === userId) {
      const isValidPassword = await bcrypt.compare(oldPassword, targetUser.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Невірний старий пароль' }, { status: 400 })
      }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
