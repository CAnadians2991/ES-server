import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getAuthUser, checkPermission } from '@/lib/auth'
import type { CreateUserRequest, UpdateUserRequest } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || !checkPermission(user.role, 'users', 'read')) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        fullName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || !checkPermission(user.role, 'users', 'write')) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const { username, password, role, fullName }: CreateUserRequest = await request.json()

    if (!username || !password || !role || !fullName) {
      return NextResponse.json({ error: 'Всі поля обов\'язкові' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Користувач з таким логіном вже існує' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        username,
        password: passwordHash,
        role,
        fullName,
      },
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

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
