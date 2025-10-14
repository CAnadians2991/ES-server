import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import type { UserRole } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  userId: number
  username: string
  role: UserRole
  branch?: string
  fullName?: string
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function checkPermission(
  userRole: UserRole,
  resource: string,
  action: 'read' | 'write' | 'delete'
): boolean {
  const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
    ADMIN: {
      candidates: ['read', 'write', 'delete'],
      payments: ['read', 'write', 'delete'],
      statistics: ['read'],
      users: ['read', 'write', 'delete'],
      settings: ['read', 'write'],
    },
    DIRECTOR: {
      candidates: ['read', 'write'],
      payments: ['read'],
      statistics: ['read'],
      users: ['read'],
      settings: ['read'],
    },
    ACCOUNTANT: {
      candidates: ['read'],
      payments: ['read', 'write'],
      statistics: ['read'],
      users: [],
      settings: [],
    },
    RECRUITMENT_DIRECTOR: {
      candidates: [],
      payments: [],
      statistics: ['read'],
      users: [],
      settings: [],
    },
    BRANCH_MANAGER: {
      candidates: ['read', 'write'],
      payments: [],
      statistics: ['read'],
      users: ['read'],
      settings: [],
    },
    ADMINISTRATOR: {
      candidates: ['read', 'write', 'delete'],
      payments: [],
      statistics: [],
      users: [],
      settings: [],
    },
    MANAGER: {
      candidates: ['read', 'write'],
      payments: [],
      statistics: [],
      users: [],
      settings: [],
    },
  }

  const permissions = ROLE_PERMISSIONS[userRole]
  if (!permissions) return false

  const resourcePermissions = permissions[resource as keyof typeof permissions]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}
