"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/use-auth'

interface Candidate {
  id: number
  branch: string
  responsible: string
  firstName: string
  lastName: string
  phone: string
  vacancyCountry: string
  projectName: string
  partnerNumber: string
  arrivalDate: string | null
  candidateStatus: string
  paymentAmount: number | null
  paymentStatus: string | null
  recipientType: string | null
  comment: string | null
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingPayment, setEditingPayment] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ amount: string; status: string; recipient: string }>({
    amount: '',
    status: '',
    recipient: '',
  })

  const canWrite = hasPermission('payments', 'write')

  useEffect(() => {
    loadCandidates()
  }, [])

  async function loadCandidates() {
    setIsLoading(true)
    try {
      const data = await api.candidates.getAll() as Candidate[]
      // Фільтруємо тільки тих, хто працює або має оплату
      const withPayments = data.filter(c => 
        c.paymentAmount && c.paymentAmount > 0 && 
        (c.candidateStatus === 'Працює' || c.paymentStatus)
      )
      setCandidates(withPayments)
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити дані',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdatePayment(candidateId: number) {
    try {
      await api.candidates.update(candidateId, {
        paymentAmount: Number(editValues.amount),
        paymentStatus: editValues.status,
        recipientType: editValues.recipient,
      } as any)
      
      toast({
        title: 'Оновлено',
        description: 'Статус оплати змінено',
      })
      
      setEditingPayment(null)
      loadCandidates()
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити оплату',
        variant: 'destructive',
      })
    }
  }

  function startEdit(candidate: Candidate) {
    setEditingPayment(candidate.id)
    setEditValues({
      amount: String(candidate.paymentAmount || 0),
      status: candidate.paymentStatus || 'Очікується',
      recipient: candidate.recipientType || '',
    })
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'Очікується': 'bg-orange-100 text-orange-800',
      'Отримано': 'bg-green-100 text-green-800',
      'Прострочено': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const totalReceived = candidates
    .filter(c => c.paymentStatus === 'Отримано')
    .reduce((sum, c) => sum + (c.paymentAmount || 0), 0)

  const totalPending = candidates
    .filter(c => c.paymentStatus === 'Очікується')
    .reduce((sum, c) => sum + (c.paymentAmount || 0), 0)

  const totalOverdue = candidates
    .filter(c => c.paymentStatus === 'Прострочено')
    .reduce((sum, c) => sum + (c.paymentAmount || 0), 0)

  return (
    <ProtectedRoute requiredPermission={{ resource: 'payments', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-warning to-warning-light text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 block">
            ← Повернутися на головну
          </Link>
          <h1 className="text-3xl font-bold">Модуль оплат</h1>
          <p className="text-white/90 mt-1">Облік платежів від партнерів</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-green-600">
                {formatCurrency(totalReceived)}
              </CardTitle>
              <p className="text-gray-600">Загальний дохід (Отримано)</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-orange-600">
                {formatCurrency(totalPending)}
              </CardTitle>
              <p className="text-gray-600">Очікується</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-red-600">
                {formatCurrency(totalOverdue)}
              </CardTitle>
              <p className="text-gray-600">Прострочено</p>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Історія платежів</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warning mx-auto mb-4"></div>
                <p className="text-gray-500">Завантаження...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-lg font-semibold mb-2">Немає оплат</h3>
                <p className="text-gray-500">Додайте суми оплат в модулі кандидатів</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warning text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Філія</th>
                      <th className="px-4 py-3 text-left">Кандидат</th>
                      <th className="px-4 py-3 text-left">Телефон</th>
                      <th className="px-4 py-3 text-left">Проект</th>
                      <th className="px-4 py-3 text-left">Партнер</th>
                      <th className="px-4 py-3 text-left">Сума</th>
                      <th className="px-4 py-3 text-left">Статус</th>
                      <th className="px-4 py-3 text-left">Реквізити</th>
                      <th className="px-4 py-3 text-center">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{String(candidate.id).padStart(6, '0')}</td>
                        <td className="px-4 py-3">{candidate.branch}</td>
                        <td className="px-4 py-3 font-medium">
                          {candidate.firstName} {candidate.lastName}
                        </td>
                        <td className="px-4 py-3">{candidate.phone}</td>
                        <td className="px-4 py-3">{candidate.projectName}</td>
                        <td className="px-4 py-3">{candidate.partnerNumber || '-'}</td>
                        <td className="px-4 py-3 font-bold text-warning">
                          {editingPayment === candidate.id && canWrite ? (
                            <input
                              type="number"
                              value={editValues.amount}
                              onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                              className="w-24 px-2 py-1 border rounded text-sm"
                            />
                          ) : (
                            formatCurrency(candidate.paymentAmount || 0)
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingPayment === candidate.id && canWrite ? (
                            <select
                              value={editValues.status}
                              onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}
                              className="px-2 py-1 border rounded text-xs"
                            >
                              <option value="Очікується">Очікується</option>
                              <option value="Отримано">Отримано</option>
                              <option value="Прострочено">Прострочено</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.paymentStatus || '')}`}>
                              {candidate.paymentStatus || '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingPayment === candidate.id && canWrite ? (
                            <select
                              value={editValues.recipient}
                              onChange={(e) => setEditValues({ ...editValues, recipient: e.target.value })}
                              className="px-2 py-1 border rounded text-xs"
                            >
                              <option value="">-</option>
                              <option value="ТОВ ЕВ">ТОВ ЕВ</option>
                              <option value="ФОП Коктов">ФОП Коктов</option>
                              <option value="ФОП Литви">ФОП Литви</option>
                              <option value="ТОВ ПерсоналВорк">ТОВ ПерсоналВорк</option>
                            </select>
                          ) : (
                            candidate.recipientType || '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {canWrite && (
                            editingPayment === candidate.id ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleUpdatePayment(candidate.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Зберегти
                                </button>
                                <button
                                  onClick={() => setEditingPayment(null)}
                                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                  Скасувати
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(candidate)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Редагувати
                              </button>
                            )
                          )}
                        </td>
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

