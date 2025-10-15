import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { LoginRequest, LoginResponse, UserRole } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { username, password }: LoginRequest = await request.json()

    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Логін та пароль обов\'язкові' 
      } as LoginResponse, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ 
        success: false, 
        error: 'Невірний логін або пароль' 
      } as LoginResponse, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Невірний логін або пароль' 
      } as LoginResponse, { status: 401 })
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        branch: user.branch,
        fullName: user.fullName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('Login successful for user:', user.username)
    console.log('Token generated:', token.substring(0, 20) + '...')
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role as UserRole,
        fullName: user.fullName,
      },
      token,
    } as LoginResponse)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Помилка сервера' 
    } as LoginResponse, { status: 500 })
  }
}
