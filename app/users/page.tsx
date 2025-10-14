"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import type { User, UserRole } from '@/types'

export default function UsersPage() {
  const { hasPermission } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast({
          title: 'Помилка',
          description: 'Не вдалося завантажити користувачів',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Помилка з\'єднання з сервером',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getRoleLabel(role: UserRole): string {
    const labels: Record<string, string> = {
      ADMIN: 'Адміністратор',
      DIRECTOR: 'Директор',
      ACCOUNTANT: 'Бухгалтер',
      RECRUITMENT_DIRECTOR: 'Директор рекрутації',
      BRANCH_MANAGER: 'Керівник філії',
      ADMINISTRATOR: 'Адміністратор',
      MANAGER: 'Менеджер',
    }
    return labels[role] || role
  }

  function getRoleColor(role: UserRole): string {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800',
      DIRECTOR: 'bg-blue-100 text-blue-800',
      ACCOUNTANT: 'bg-green-100 text-green-800',
      RECRUITMENT_DIRECTOR: 'bg-purple-100 text-purple-800',
      BRANCH_MANAGER: 'bg-orange-100 text-orange-800',
      ADMINISTRATOR: 'bg-cyan-100 text-cyan-800',
      MANAGER: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 block">
              ← Повернутися на головну
            </Link>
            <h1 className="text-3xl font-bold">Управління користувачами</h1>
            <p className="text-white/90 mt-1">Система ролей та прав доступу</p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Список користувачів</span>
                {hasPermission('users', 'write') && (
                  <Button>
                    + Додати користувача
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Завантаження...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="text-lg font-semibold mb-2">Немає користувачів</h3>
                  <p className="text-gray-500">Додайте першого користувача</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Логін</th>
                        <th className="px-4 py-3 text-left">ПІБ</th>
                        <th className="px-4 py-3 text-left">Роль</th>
                        <th className="px-4 py-3 text-left">Статус</th>
                        <th className="px-4 py-3 text-left">Дата створення</th>
                        <th className="px-4 py-3 text-center">Дії</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{String(user.id).padStart(3, '0')}</td>
                          <td className="px-4 py-3 font-medium">{user.username}</td>
                          <td className="px-4 py-3">{user.fullName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Активний' : 'Неактивний'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {hasPermission('users', 'write') && (
                                <Button size="sm" variant="outline">
                                  Редагувати
                                </Button>
                              )}
                              {hasPermission('users', 'delete') && (
                                <Button size="sm" variant="destructive">
                                  Видалити
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Інформація про ролі */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Права доступу за ролями</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Адміністратор</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Повний доступ до всіх модулів</li>
                    <li>• Управління користувачами</li>
                    <li>• Зміна паролів</li>
                    <li>• Системні налаштування</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Директор</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Перегляд кандидатів</li>
                    <li>• Редагування кандидатів</li>
                    <li>• Перегляд статистики</li>
                    <li>• Перегляд оплат</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Бухгалтер</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Перегляд кандидатів</li>
                    <li>• Управління оплатами</li>
                    <li>• Перегляд статистики</li>
                    <li>• Обмежений доступ</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
