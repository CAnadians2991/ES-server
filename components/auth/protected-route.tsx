"use client"

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: {
    resource: string
    action: 'read' | 'write' | 'delete'
  }
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  fallback = <div>Завантаження...</div> 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, requirePermission, requireAuth } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (requiredPermission) {
      requirePermission(requiredPermission.resource, requiredPermission.action)
    } else {
      requireAuth()
    }
  }, [isLoading, requiredPermission, requirePermission, requireAuth])

  if (isLoading) {
    return <>{fallback}</>
  }

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  if (requiredPermission && !requirePermission(requiredPermission.resource, requiredPermission.action)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Доступ заборонено</h1>
          <p className="text-gray-600">У вас немає прав для доступу до цієї сторінки</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
