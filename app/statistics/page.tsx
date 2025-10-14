"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import type { Statistics } from '@/types'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  async function loadStatistics() {
    try {
      const data = await api.statistics.get() as any
      setStatistics(data)
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success mx-auto mb-4"></div>
          <p className="text-gray-500">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return null
  }

  return (
    <ProtectedRoute requiredPermission={{ resource: 'statistics', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-success to-success-light text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 block">
            ← Повернутися на головну
          </Link>
          <h1 className="text-3xl font-bold">Статистика та аналітика</h1>
          <p className="text-white/90 mt-1">Детальна аналітика роботи з кандидатами</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-success">{statistics.totalCandidates}</CardTitle>
              <CardDescription>Всього кандидатів</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-green-600">{statistics.workingCandidates}</CardTitle>
              <CardDescription>Працюють зараз</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-orange-600">{statistics.readyCandidates}</CardTitle>
              <CardDescription>Готові до виїзду</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Воронка конверсії</CardTitle>
            <CardDescription>Відстеження кандидатів на кожному етапі</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Зареєстровано', count: statistics.registeredCandidates, color: 'bg-blue-500' },
                { label: 'Готові до виїзду', count: statistics.readyCandidates, color: 'bg-green-500' },
                { label: 'В дорозі', count: statistics.travelingCandidates, color: 'bg-orange-500' },
                { label: 'Прибули', count: statistics.arrivedCandidates, color: 'bg-cyan-500' },
                { label: 'Працюють', count: statistics.workingCandidates, color: 'bg-green-600' },
              ].map((stage) => {
                const percentage = statistics.totalCandidates > 0 
                  ? (stage.count / statistics.totalCandidates) * 100 
                  : 0
                return (
                  <div key={stage.label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{stage.label}</span>
                      <span className="font-bold">{stage.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full ${stage.color} flex items-center justify-center text-white text-xs font-bold`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && `${percentage.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="font-medium">
                Конверсія реєстрація → робота: <strong className="text-green-600">{statistics.conversionRate.toFixed(1)}%</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Оптимальна конверсія в рекрутингу становить 60-75%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фінансова ефективність</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{formatCurrency(statistics.monthlyReceived)}</div>
                <div className="text-sm text-gray-600 mt-1">Отримано цього місяця</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{statistics.pendingPayments}</div>
                <div className="text-sm text-gray-600 mt-1">Очікується оплат</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(statistics.avgPayment)}</div>
                <div className="text-sm text-gray-600 mt-1">Середня оплата</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="font-medium">
                Рівень оплачуваності: <strong className="text-blue-600">{statistics.paymentRate.toFixed(1)}%</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Високий рівень оплачуваності свідчить про якість розміщення та задоволеність партнерів
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ефективність обробки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Всього кандидатів:</span>
                  <span className="font-bold">{statistics.totalCandidates}</span>
                </div>
                <div className="flex justify-between">
                  <span>Працюють зараз:</span>
                  <span className="font-bold text-green-600">{statistics.workingCandidates}</span>
                </div>
                <div className="flex justify-between">
                  <span>Завершили роботу:</span>
                  <span className="font-bold">{statistics.finishedCandidates}</span>
                </div>
                <div className="flex justify-between">
                  <span>Не доїхали:</span>
                  <span className="font-bold text-red-600">{statistics.notArrivedCandidates}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Якість партнерств</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Активних партнерів:</span>
                  <span className="font-bold">{statistics.activePartners}</span>
                </div>
                <div className="flex justify-between">
                  <span>Топ партнер:</span>
                  <span className="font-bold">{statistics.topPartner}</span>
                </div>
                <div className="flex justify-between">
                  <span>Кандидатів на партнера:</span>
                  <span className="font-bold">{statistics.avgCandidatesPerPartner.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Цього місяця:</span>
                  <span className="font-bold">{statistics.thisMonthCandidates}</span>
                </div>
                <div className="flex justify-between">
                  <span>Цього року:</span>
                  <span className="font-bold">{statistics.thisYearCandidates}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}

