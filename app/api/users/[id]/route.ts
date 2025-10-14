import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getAuthUser, checkPermission } from '@/lib/auth'
import type { UpdateUserRequest, ChangePasswordRequest } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user || !checkPermission(user.role, 'users', 'read')) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Невірний ID користувача' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        fullName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Користувач не знайдений' }, { status: 404 })
    }

    return NextResponse.json(targetUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user || !checkPermission(user.role, 'users', 'write')) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Невірний ID користувача' }, { status: 400 })
    }

    const { username, role, fullName, isActive }: UpdateUserRequest = await request.json()

    const updateData: any = {}
    if (username) updateData.username = username
    if (role) updateData.role = role
    if (fullName) updateData.fullName = fullName
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        fullName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user || !checkPermission(user.role, 'users', 'delete')) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Невірний ID користувача' }, { status: 400 })
    }

    // Не можна видалити самого себе
    if (user.userId === userId) {
      return NextResponse.json({ error: 'Не можна видалити самого себе' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
