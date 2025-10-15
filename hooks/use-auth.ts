"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types'

interface AuthUser {
  id: number
  username: string
  role: UserRole
  fullName: string
  branch?: string
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')

    console.log('useAuth useEffect - token:', token ? 'exists' : 'missing')
    console.log('useAuth useEffect - userData:', userData ? 'exists' : 'missing')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        console.log('useAuth - setting user:', user)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error('useAuth - error parsing user data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } else {
      console.log('useAuth - no token or user data')
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [isHydrated])

  const refreshAuth = () => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')

    console.log('refreshAuth - token:', token ? 'exists' : 'missing')
    console.log('refreshAuth - userData:', userData ? 'exists' : 'missing')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        console.log('refreshAuth - setting user:', user)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error('refreshAuth - error parsing user data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } else {
      console.log('refreshAuth - no token or user data')
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const login = (user: AuthUser, token: string) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    })
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
    router.push('/login')
  }

  const hasPermission = (resource: string, action: 'read' | 'write' | 'delete'): boolean => {
    if (!authState.user) return false

    const ROLE_PERMISSIONS = {
      ADMIN: {
        candidates: ['read', 'write', 'delete'],
        applications: ['read', 'write', 'delete'],
        vacancies: ['read', 'write', 'delete'],
        payments: ['read', 'write', 'delete'],
        partnerPayments: ['read', 'write', 'delete'],
        salaries: ['read', 'write', 'delete'],
        expenses: ['read', 'write', 'delete'],
        visas: ['read', 'write', 'delete'],
        statistics: ['read'],
        users: ['read', 'write', 'delete'],
      },
      DIRECTOR: {
        candidates: ['read', 'write', 'delete'],
        applications: ['read', 'write', 'delete'],
        vacancies: ['read', 'write', 'delete'],
        payments: ['read', 'write', 'delete'],
        partnerPayments: ['read', 'write', 'delete'],
        salaries: ['read', 'write', 'delete'],
        expenses: ['read', 'write', 'delete'],
        visas: ['read', 'write', 'delete'],
        statistics: ['read'],
        users: ['read', 'write', 'delete'],
      },
      RECRUITMENT_DIRECTOR: {
        candidates: [],
        applications: [],
        vacancies: [],
        payments: [],
        partnerPayments: ['read', 'write'],
        salaries: ['read'],
        expenses: [],
        visas: [],
        statistics: ['read'],
        users: [],
      },
      ACCOUNTANT: {
        candidates: [],
        applications: [],
        vacancies: [],
        payments: ['read', 'write'],
        partnerPayments: ['read', 'write'],
        salaries: ['read'],
        expenses: ['read', 'write'],
        visas: [],
        statistics: ['read'],
        users: [],
      },
      BRANCH_MANAGER: {
        candidates: ['read', 'write'],
        applications: ['read', 'write'],
        vacancies: ['read'],
        payments: [],
        partnerPayments: [],
        salaries: ['read'],
        expenses: ['read', 'write'],
        visas: [],
        statistics: ['read'],
        users: ['read'],
      },
      ADMINISTRATOR: {
        candidates: ['read', 'write', 'delete'],
        applications: ['read', 'write', 'delete'],
        vacancies: ['read', 'write', 'delete'],
        payments: [],
        partnerPayments: [],
        salaries: [],
        expenses: [],
        visas: [],
        statistics: [],
        users: [],
      },
      MANAGER: {
        candidates: ['read', 'write'],
        applications: ['read', 'write'],
        vacancies: ['read'],
        payments: [],
        partnerPayments: [],
        salaries: ['read'],
        expenses: [],
        visas: ['write'],
        statistics: ['read'],
        users: [],
      },
    }

    const permissions = ROLE_PERMISSIONS[authState.user.role]
    if (!permissions) return false

    const resourcePermissions = permissions[resource as keyof typeof permissions] as string[]
    if (!resourcePermissions) return false

    return resourcePermissions.includes(action)
  }

  const requireAuth = () => {
    if (!authState.isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }

  const requirePermission = (resource: string, action: 'read' | 'write' | 'delete') => {
    if (!requireAuth()) return false
    if (!hasPermission(resource, action)) {
      router.push('/')
      return false
    }
    return true
  }

  return {
    ...authState,
    isHydrated,
    login,
    logout,
    refreshAuth,
    hasPermission,
    requireAuth,
    requirePermission,
  }
}
