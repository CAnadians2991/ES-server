"use client"

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Trash2, RotateCcw, Clock } from 'lucide-react'
import Link from 'next/link'

interface DeletedCandidate {
  id: number
  firstName: string
  lastName: string
  phone: string
  branch: string
  deletedAt: string
  deletedBy: number | null
}

export default function DeletedRecordsPage() {
  const [deletedCandidates, setDeletedCandidates] = useState<DeletedCandidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadDeletedRecords = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/candidates/deleted')
      if (!response.ok) throw new Error('Помилка завантаження')
      const data = await response.json()
      setDeletedCandidates(data)
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося завантажити видалені записи',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadDeletedRecords()
  }, [loadDeletedRecords])


  async function handleRestore(candidateId: number) {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/restore`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Помилка відновлення')
      
      toast({
        title: 'Успішно',
        description: 'Запис відновлено',
      })
      
      loadDeletedRecords()
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося відновити запис',
        variant: 'destructive',
      })
    }
  }

  async function handlePermanentDelete(candidateId: number) {
    if (!confirm('Ви впевнені? Це видалення буде НАЗАВЖДИ і неможливо буде відновити!')) {
      return
    }

    try {
      const response = await fetch(`/api/candidates/${candidateId}/permanent`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Помилка видалення')
      
      toast({
        title: 'Успішно',
        description: 'Запис видалено назавжди',
      })
      
      loadDeletedRecords()
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося видалити запис',
        variant: 'destructive',
      })
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ProtectedRoute requiredPermission={{ resource: 'candidates', action: 'delete' }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white py-4 shadow-md border-b border-slate-700">
          <div className="max-w-[98%] mx-auto px-4 flex items-center justify-between">
            <div>
              <Link href="/" className="text-white/80 hover:text-white text-sm mb-1 block">
                ← Повернутися на головну
              </Link>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trash2 className="h-6 w-6" />
                Видалені записи
              </h1>
              <p className="text-white/90 text-sm">Всього: {deletedCandidates.length}</p>
            </div>
          </div>
        </header>

        <div className="max-w-[98%] mx-auto px-4 py-6">
          <Card className="mb-4 bg-slate-50 border-slate-200">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                  <span className="text-lg">ℹ️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Важлива інформація</h3>
                  <p className="text-sm text-slate-600">
                    Ці записи були м&apos;яко видалені та можуть бути відновлені. 
                    Тільки системний адміністратор може видаляти записи назавжди.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
                <p className="text-gray-500">Завантаження...</p>
              </div>
            </div>
          ) : deletedCandidates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trash2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Немає видалених записів</h3>
                <p className="text-gray-500">Всі записи в безпеці!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deletedCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </span>
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Видалено
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Телефон:</span>{' '}
                            <span className="font-medium">{candidate.phone}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Філія:</span>{' '}
                            <span className="font-medium">{candidate.branch}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(candidate.deletedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRestore(candidate.id)}
                          className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Відновити
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handlePermanentDelete(candidate.id)}
                          className="bg-red-600 hover:bg-red-700 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Видалити назавжди
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

