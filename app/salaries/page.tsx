"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/use-auth'
import { MonthlySalary } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SalariesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [salaries, setSalaries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))

  useEffect(() => {
    loadSalaries()
  }, [selectedMonth, selectedYear])

  async function loadSalaries() {
    setIsLoading(true)
    try {
      const filters: Record<string, string> = {
        month: selectedMonth,
        year: selectedYear,
      }
      
      if (user?.branch && user.role === 'BRANCH_MANAGER') {
        filters.branch = user.branch
      }
      
      const data = await api.salaries.getAll(filters)
      setSalaries(data as any)
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити зарплати',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalSalaries = salaries.reduce((sum, s) => sum + s.total, 0)

  return (
    <ProtectedRoute requiredPermission={{ resource: 'salaries', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-6 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 block">
              ← Повернутися на головну
            </Link>
            <h1 className="text-3xl font-bold">Зарплати співробітників</h1>
            <p className="text-white/90 mt-1">Розрахунок зарплат та бонусів</p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-4 mb-6">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Січень</SelectItem>
                <SelectItem value="02">Лютий</SelectItem>
                <SelectItem value="03">Березень</SelectItem>
                <SelectItem value="04">Квітень</SelectItem>
                <SelectItem value="05">Травень</SelectItem>
                <SelectItem value="06">Червень</SelectItem>
                <SelectItem value="07">Липень</SelectItem>
                <SelectItem value="08">Серпень</SelectItem>
                <SelectItem value="09">Вересень</SelectItem>
                <SelectItem value="10">Жовтень</SelectItem>
                <SelectItem value="11">Листопад</SelectItem>
                <SelectItem value="12">Грудень</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-600">
                Всього: {totalSalaries.toLocaleString()} ₴
              </CardTitle>
              <p className="text-gray-600">Загальний фонд оплати праці за {selectedMonth}/{selectedYear}</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Деталі зарплат</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Завантаження...</p>
                </div>
              ) : salaries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-lg font-semibold mb-2">Немає даних</h3>
                  <p className="text-gray-500">Оберіть інший період</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Співробітник</th>
                        <th className="px-4 py-3 text-left">Роль</th>
                        <th className="px-4 py-3 text-left">Філія</th>
                        <th className="px-4 py-3 text-right">Ставка</th>
                        <th className="px-4 py-3 text-right">Бонус</th>
                        <th className="px-4 py-3 text-right">Бонус (візи)</th>
                        <th className="px-4 py-3 text-right">Бонус (безкошт.)</th>
                        <th className="px-4 py-3 text-center">Показники</th>
                        <th className="px-4 py-3 text-right font-bold">Всього</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salaries.map((salary: any) => (
                        <tr key={salary.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{salary.user?.fullName || '-'}</td>
                          <td className="px-4 py-3">{salary.user?.role || '-'}</td>
                          <td className="px-4 py-3">{salary.user?.branch || '-'}</td>
                          <td className="px-4 py-3 text-right">{salary.baseSalary.toLocaleString()} ₴</td>
                          <td className="px-4 py-3 text-right">{salary.bonus.toLocaleString()} ₴</td>
                          <td className="px-4 py-3 text-right">{salary.visaBonus.toLocaleString()} ₴</td>
                          <td className="px-4 py-3 text-right">{salary.freeBonus.toLocaleString()} ₴</td>
                          <td className="px-4 py-3 text-center">{salary.indicators}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-600">{salary.total.toLocaleString()} ₴</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

