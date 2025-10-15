'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Contact, Deal } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Euro,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowLeft
} from 'lucide-react'

interface StatisticsData {
  totalContacts: number
  workingContacts: number
  readyContacts: number
  dealContacts: number
  totalDeals: number
  activeDeals: number
  pendingDeals: number
  completedDeals: number
  totalRevenue: number
  managersStats?: Array<{
    managerId: number
    managerName: string
    branch: string
    contactsCount: number
    dealsCount: number
    revenue: number
  }>
}

export default function StatisticsPage() {
  const router = useRouter()
  const { user, hasPermission, isHydrated } = useAuth()
  const { toast } = useToast()
  
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    if (isHydrated) {
      fetchStatistics()
    }
  }, [isHydrated, timeRange])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      
      // Отримуємо контакти та угоди
      const [contactsResponse, dealsResponse] = await Promise.all([
        api.contacts.getAll(),
        api.deals.getAll()
      ])
      
      const contacts = contactsResponse.contacts || []
      const deals = dealsResponse.deals || []
      
      // Розрахунок статистики залежно від ролі
      let stats: StatisticsData = {
        totalContacts: contacts.length,
        workingContacts: contacts.filter(c => c.candidateStatus === 'Працює').length,
        readyContacts: contacts.filter(c => c.candidateStatus === 'Готовий до виїзду').length,
        dealContacts: contacts.filter(c => c.candidateStatus === 'В угоді').length,
        totalDeals: deals.length,
        activeDeals: deals.filter(d => d.dealStage === 'ACTIVE').length,
        pendingDeals: deals.filter(d => d.dealStage === 'PENDING').length,
        completedDeals: deals.filter(d => d.dealStage === 'COMPLETED').length,
        totalRevenue: deals.reduce((sum, deal) => sum + deal.totalAmount, 0)
      }

      // Для директора та керівника філії - додаємо статистику по менеджерах
      if (user?.role === 'DIRECTOR' || user?.role === 'ADMIN') {
        const managersMap = new Map<number, {
          managerId: number
          managerName: string
          branch: string
          contactsCount: number
          dealsCount: number
          revenue: number
        }>()

        // Групуємо контакти по менеджерах
        contacts.forEach(contact => {
          const key = contact.managerId
          if (!managersMap.has(key)) {
            managersMap.set(key, {
              managerId: contact.managerId,
              managerName: contact.managerName,
              branch: contact.branch,
              contactsCount: 0,
              dealsCount: 0,
              revenue: 0
            })
          }
          managersMap.get(key)!.contactsCount++
        })

        // Групуємо угоди по менеджерах
        deals.forEach(deal => {
          const key = deal.managerId
          if (managersMap.has(key)) {
            managersMap.get(key)!.dealsCount++
            managersMap.get(key)!.revenue += deal.totalAmount
          }
        })

        stats.managersStats = Array.from(managersMap.values())
      }

      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити статистику',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isHydrated || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!hasPermission('statistics', 'read')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ заборонено</h1>
          <p className="text-gray-600 mb-4">У вас немає дозволу на перегляд статистики</p>
          <Button onClick={() => router.push('/')}>
            Повернутися на головну
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                До модулів
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Статистика</h1>
                <p className="text-xs text-gray-500">
                  {user.role === 'MANAGER' ? 'Ваша статистика' : 
                   user.role === 'DIRECTOR' ? `Статистика філії ${user.branch}` : 
                   'Загальна статистика'}
                </p>
              </div>
            </div>
            
            {/* Фільтр по часу */}
            <div className="flex items-center gap-2">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="week">Тиждень</option>
                <option value="month">Місяць</option>
                <option value="quarter">Квартал</option>
                <option value="year">Рік</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {statistics && (
          <>
            {/* Основна статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-blue-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-blue-600">Всього клієнтів</p>
                    <p className="text-lg font-bold text-blue-700">{statistics.totalContacts}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-green-600">Працюють</p>
                    <p className="text-lg font-bold text-green-700">{statistics.workingContacts}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-yellow-600">Готові до виїзду</p>
                    <p className="text-lg font-bold text-yellow-700">{statistics.readyContacts}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-purple-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-purple-600">В угодах</p>
                    <p className="text-lg font-bold text-purple-700">{statistics.dealContacts}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Статистика угод */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-indigo-50 border-indigo-200">
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 text-indigo-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-indigo-600">Всього угод</p>
                    <p className="text-lg font-bold text-indigo-700">{statistics.totalDeals}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-emerald-50 border-emerald-200">
                <div className="flex items-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-emerald-600">Активні</p>
                    <p className="text-lg font-bold text-emerald-700">{statistics.activeDeals}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-amber-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-amber-600">В очікуванні</p>
                    <p className="text-lg font-bold text-amber-700">{statistics.pendingDeals}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-rose-50 border-rose-200">
                <div className="flex items-center">
                  <Euro className="w-6 h-6 text-rose-500 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-rose-600">Дохід</p>
                    <p className="text-lg font-bold text-rose-700">
                      {statistics.totalRevenue.toLocaleString()} грн
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Статистика по менеджерах (тільки для директора та адміна) */}
            {statistics.managersStats && statistics.managersStats.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Статистика по менеджерах
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Менеджер</th>
                          <th className="text-left py-2">Філія</th>
                          <th className="text-right py-2">Клієнти</th>
                          <th className="text-right py-2">Угоди</th>
                          <th className="text-right py-2">Дохід</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statistics.managersStats.map((manager) => (
                          <tr key={manager.managerId} className="border-b hover:bg-gray-50">
                            <td className="py-2 font-medium">{manager.managerName}</td>
                            <td className="py-2 text-gray-600">{manager.branch}</td>
                            <td className="py-2 text-right">{manager.contactsCount}</td>
                            <td className="py-2 text-right">{manager.dealsCount}</td>
                            <td className="py-2 text-right font-medium">
                              {manager.revenue.toLocaleString()} грн
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
