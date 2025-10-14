"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const { user, logout, hasPermission } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-3xl">🇪🇺</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">
                      Європа Сервіс
                    </h1>
                    <p className="text-slate-600 text-sm">Ліцензоване кадрове агенство</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-600 mt-4 pl-[72px]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Ліцензія МОН України</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>5 філій по Україні</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Працюємо з 2018 року</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right border-l border-gray-200 pl-4">
                  <p className="text-sm text-slate-500 mb-1">Авторизовано як</p>
                  <p className="font-semibold text-slate-800">{user?.fullName}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {user?.role}
                  </span>
                </div>
                <Button 
                  onClick={logout}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300"
                >
                  Вийти
                </Button>
              </div>
            </div>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Кандидати */}
            {hasPermission('candidates', 'read') && (
              <Link href="/candidates">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span className="text-4xl group-hover:scale-110 transition-transform">👥</span>
                      <span className="text-slate-800">Кандидати</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Управління базою кандидатів, статуси, фільтрація та статистика
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md transition-all duration-300">
                      Відкрити модуль
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Оплати */}
            {hasPermission('payments', 'read') && (
              <Link href="/payments">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-4xl group-hover:scale-110 transition-transform">💰</span>
                      <span className="text-slate-800">Оплати</span>
                    </CardTitle>
                    <CardDescription>
                      Облік платежів від партнерів, фінансова статистика
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Статистика */}
            {hasPermission('statistics', 'read') && (
              <Link href="/statistics">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-3xl">📊</span>
                      Статистика
                    </CardTitle>
                    <CardDescription>
                      Детальна аналітика, воронка конверсії, звіти
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Вакансії */}
            {hasPermission('vacancies', 'read') && (
              <Link href="/vacancies">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-3xl">💼</span>
                      Вакансії
                    </CardTitle>
                    <CardDescription>
                      Актуальні вакансії партнерів в Європі
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Подання */}
            {hasPermission('applications', 'read') && (
              <Link href="/applications">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-3xl">📋</span>
                      Подання
                    </CardTitle>
                    <CardDescription>
                      Подання кандидатів на вакансії партнерів
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Виплати партнерів */}
            {hasPermission('partnerPayments', 'read') && (
              <Link href="/partner-payments">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-3xl">💸</span>
                      Виплати партнерів
                    </CardTitle>
                    <CardDescription>
                      Виплати від партнерів (конфіденційно)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Зарплати */}
            {hasPermission('salaries', 'read') && (
              <Link href="/salaries">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-3xl">💰</span>
                      Зарплати
                    </CardTitle>
                    <CardDescription>
                      Зарплати співробітників та бонуси
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Витрати */}
            {hasPermission('expenses', 'read') && (
              <Link href="/expenses">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-3xl">📊</span>
                      Витрати філій
                    </CardTitle>
                    <CardDescription>
                      Витрати на оренду, рекламу, канцтовари
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Користувачі */}
            {hasPermission('users', 'read') && (
              <Link href="/users">
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <span className="text-3xl">👤</span>
                      Користувачі
                    </CardTitle>
                    <CardDescription>
                      Управління користувачами системи
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300">Відкрити модуль</Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Видалені записи (тільки для ADMIN) */}
            {user?.role === 'ADMIN' && (
              <Link href="/deleted-records">
                <Card className="bg-white border border-red-200 shadow-md hover:shadow-lg hover:border-red-300 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span className="text-4xl group-hover:scale-110 transition-transform">🗑️</span>
                      <span className="text-slate-800">Видалені записи</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Перегляд та відновлення видалених кандидатів
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300">
                      Відкрити модуль
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

