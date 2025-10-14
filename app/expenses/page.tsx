"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/use-auth'
import { BranchExpense } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BRANCHES } from '@/types'

export default function ExpensesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<BranchExpense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))

  useEffect(() => {
    loadExpenses()
  }, [selectedMonth, selectedYear])

  async function loadExpenses() {
    setIsLoading(true)
    try {
      const filters: Record<string, string> = {
        month: selectedMonth,
        year: selectedYear,
      }
      
      if (user?.branch && user.role === 'BRANCH_MANAGER') {
        filters.branch = user.branch
      }
      
      const data = await api.expenses.getAll(filters)
      setExpenses(data)
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити витрати',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.rent + e.utilities + e.office + e.advertising + e.other, 0)

  return (
    <ProtectedRoute requiredPermission={{ resource: 'expenses', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-purple-500 to-purple-700 text-white py-6 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 block">
              ← Повернутися на головну
            </Link>
            <h1 className="text-3xl font-bold">Витрати філій</h1>
            <p className="text-white/90 mt-1">Облік витрат на оренду, рекламу та інше</p>
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
              <CardTitle className="text-2xl font-bold text-purple-600">
                Всього витрат: {totalExpenses.toLocaleString()} ₴
              </CardTitle>
              <p className="text-gray-600">За {selectedMonth}/{selectedYear}</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Деталі витрат по філіях</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Завантаження...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold mb-2">Немає даних</h3>
                  <p className="text-gray-500">Оберіть інший період</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-purple-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Філія</th>
                        <th className="px-4 py-3 text-right">Оренда</th>
                        <th className="px-4 py-3 text-right">Комунальні</th>
                        <th className="px-4 py-3 text-right">Канцтовари</th>
                        <th className="px-4 py-3 text-right">Реклама</th>
                        <th className="px-4 py-3 text-right">Інше</th>
                        <th className="px-4 py-3 text-right font-bold">Всього</th>
                        <th className="px-4 py-3 text-left">Опис</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.map((expense) => {
                        const total = expense.rent + expense.utilities + expense.office + expense.advertising + expense.other
                        return (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{expense.branch}</td>
                            <td className="px-4 py-3 text-right">{expense.rent.toLocaleString()} ₴</td>
                            <td className="px-4 py-3 text-right">{expense.utilities.toLocaleString()} ₴</td>
                            <td className="px-4 py-3 text-right">{expense.office.toLocaleString()} ₴</td>
                            <td className="px-4 py-3 text-right">{expense.advertising.toLocaleString()} ₴</td>
                            <td className="px-4 py-3 text-right">{expense.other.toLocaleString()} ₴</td>
                            <td className="px-4 py-3 text-right font-bold text-purple-600">{total.toLocaleString()} ₴</td>
                            <td className="px-4 py-3 text-gray-500">{expense.description || '-'}</td>
                          </tr>
                        )
                      })}
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

