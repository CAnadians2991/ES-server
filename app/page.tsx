"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import CRMLayout from "@/components/layout/crm-layout"
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  ChevronDown,
  ChevronUp,
  Send
} from "lucide-react"

export default function HomePage() {
  const { user, hasPermission, isHydrated } = useAuth()
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [stats, setStats] = useState({
    contacts: 0,
    deals: 0,
    candidates: 0,
    todayContacts: 0
  })

  useEffect(() => {
    // Завантаження статистики
    const fetchStats = async () => {
      try {
        // Тут буде API для отримання статистики
        setStats({
          contacts: 156,
          deals: 23,
          candidates: 89,
          todayContacts: 5
        })
      } catch (error) {
        console.error('Помилка завантаження статистики:', error)
      }
    }

    if (isHydrated) {
      fetchStats()
    }
  }, [isHydrated])

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <CRMLayout>
        <div className="flex h-full">
          {/* Основний контент - Дашборд */}
          <div className={`transition-all duration-300 ${chatCollapsed ? 'w-full' : 'w-3/5'}`}>
            <div className="p-6">
              {/* Заголовок */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Дашборд
                </h1>
                <p className="text-gray-600">
                  Вітаємо, {user.fullName || user.username}! Ось ваша статистика
                </p>
              </div>

              {/* Статистичні картки */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Контакти</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.contacts}</p>
                        <p className="text-xs text-green-600">+{stats.todayContacts} сьогодні</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Угоди</p>
                        <p className="text-2xl font-bold text-green-600">{stats.deals}</p>
                        <p className="text-xs text-gray-500">Активні</p>
                      </div>
                      <Briefcase className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Кандидати</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.candidates}</p>
                        <p className="text-xs text-gray-500">В обробці</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Конверсія</p>
                        <p className="text-2xl font-bold text-orange-600">24%</p>
                        <p className="text-xs text-green-600">+2% цього місяця</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Швидкі дії */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {hasPermission('clients', 'write') && (
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Plus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Новий контакт</h3>
                          <p className="text-sm text-gray-600">Додати клієнта</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hasPermission('deals', 'write') && (
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Нова угода</h3>
                          <p className="text-sm text-gray-600">Створити угоду</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Чат</h3>
                        <p className="text-sm text-gray-600">Комунікація з командою</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Останні дії */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Останні дії</CardTitle>
                  <CardDescription>Нещодавні зміни в системі</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Створено новий контакт</p>
                        <p className="text-xs text-gray-500">Іван Петренко • 2 години тому</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Оновлено угоду #123</p>
                        <p className="text-xs text-gray-500">Марія Коваленко • 4 години тому</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Бічна панель чату */}
          {!chatCollapsed && (
            <div className="w-2/5 border-l border-gray-200 bg-white">
              <div className="h-full flex flex-col">
                {/* Заголовок чату */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Командний чат</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChatCollapsed(true)}
                    className="p-1"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Канали */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Канали</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">#загальний</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">#маркетинг</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">#техпідтримка</span>
                    </div>
                  </div>
                </div>

                {/* Повідомлення */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">А</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">Антон Подaш</span>
                          <span className="text-xs text-gray-500">10:30</span>
                        </div>
                        <p className="text-sm text-gray-700">Привіт! Є нові заявки на роботу</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">М</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">Марія Коваленко</span>
                          <span className="text-xs text-gray-500">10:32</span>
                        </div>
                        <p className="text-sm text-gray-700">Перевірю зараз</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Поле введення */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Написати повідомлення..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button size="sm" className="px-3">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка розгортання чату */}
          {chatCollapsed && (
            <div className="w-12 border-l border-gray-200 bg-gray-50 flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatCollapsed(false)}
                className="p-2"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CRMLayout>
    </ProtectedRoute>
  )
}