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
  CreditCard,
  Euro,
  BarChart3,
  User,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  ArrowRight
} from "lucide-react"

export default function HomePage() {
  const { user, hasPermission, isHydrated } = useAuth()
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

  if (!isHydrated || !user) {
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
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Вітаємо, {user?.fullName || user?.username}!
            </h1>
            <p className="text-gray-600">
              Огляд вашої активності та ключових показників.
            </p>
          </div>

          {/* Статистичні картки */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всього контактів</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.contacts}</div>
                <p className="text-xs text-gray-500">+20.1% з минулого місяця</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Відкриті угоди</CardTitle>
                <Briefcase className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.deals}</div>
                <p className="text-xs text-gray-500">+180.1% з минулого місяця</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Нові кандидати</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.candidates}</div>
                <p className="text-xs text-gray-500">+19% з минулого місяця</p>
              </CardContent>
            </Card>
          </div>

          {/* Швидкі дії */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Швидкі дії</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" /> Створити новий контакт
              </Button>
              <Button variant="outline" className="justify-start">
                <Briefcase className="mr-2 h-4 w-4" /> Створити нову угоду
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" /> Додати кандидата
              </Button>
            </div>
          </div>

          {/* Останні дії */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Останні дії</h2>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-700">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="flex-1">Менеджер Ігор Литвин створив новий контакт "Олена Коваль"</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">5 хв тому</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="flex-1">Адміністратор Андрій Котов затвердив угоду #12345</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">1 годину тому</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="flex-1">Менеджер Світлана Рянді оновила статус кандидата "Петро Іванов"</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">3 години тому</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CRMLayout>
    </ProtectedRoute>
  )
}