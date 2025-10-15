"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCandidatesStore } from '@/hooks/use-candidates'
import { api } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CandidatesTableExcel } from '@/components/candidates/candidates-table-excel'
import { CandidatesFilters } from '@/components/candidates/candidates-filters'
import { AddCandidateDialog } from '@/components/candidates/add-candidate-dialog'
import { useToast } from '@/hooks/use-toast'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/use-auth'

export default function CandidatesPage() {
  const { toast } = useToast()
  const { candidates, filters, isLoading, currentPage, totalPages, totalCount, setCandidates, setLoading, setError, setPage, setPagination } = useCandidatesStore()
  const { hasPermission } = useAuth()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState('candidates')

  useEffect(() => {
    loadCandidates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), currentPage])

  async function loadCandidates() {
    try {
      setLoading(true)
      setError(null)
      
      // Очищаємо параметри від undefined значень - оптимізовано для слабких комп'ютерів
      const cleanParams: Record<string, string> = {
        page: String(currentPage),
        limit: '100' // Зменшуємо до 100 записів для слабких комп'ютерів
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value)
        }
      })
      
      console.log('Loading candidates with params:', cleanParams)
      const response = await api.candidates.getAll(cleanParams) as any
      console.log('Received candidates:', response.data?.length || 0)
      setCandidates(response.data || response)
      if (response.pagination) {
        setPagination(response.pagination.total, response.pagination.totalPages)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Помилка завантаження'
      setError(message)
      toast({
        title: 'Помилка',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCandidate() {
    try {
      const newCandidate = {
        branch: 'ЦО',
        responsible: '',
        firstName: '',
        lastName: '',
        phone: '',
        age: 18,
        candidateCountry: 'Україна',
        vacancyCountry: 'Польща',
        projectName: '',
        partnerNumber: '',
        candidateStatus: 'Зареєстровано',
        paymentAmount: 0,
      }
      
      const result = await api.candidates.create(newCandidate)
      
      // Оптимістичне додавання без перезавантаження всієї таблиці
      const candidateWithId = {
        ...newCandidate,
        id: result.id,
        arrivalDate: null,
        paymentStatus: null,
        recipientType: null,
        comment: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Додаємо зверху без перезавантаження
      setCandidates([candidateWithId as any, ...candidates])
      
      toast({
        title: 'Додано',
        description: 'Новий рядок створено',
      })
    } catch (error) {
      console.error('Add candidate error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Не вдалося додати рядок'
      toast({
        title: 'Помилка',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <ProtectedRoute requiredPermission={{ resource: 'candidates', action: 'read' }}>
      <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <header className="bg-slate-800 text-white py-4 shadow-md border-b border-slate-700">
          <div className="max-w-[98%] mx-auto px-4 flex items-center justify-between">
          <div>
            {!isFullscreen && (
              <Link href="/" className="text-white/80 hover:text-white text-sm mb-1 block">
                ← Повернутися на головну
              </Link>
            )}
            <h1 className="text-2xl font-bold">Управління кандидатами</h1>
            <p className="text-white/90 text-sm">Всього: {totalCount} (показано: {candidates.length})</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border-white/30 text-white hover:bg-white/10 transition-all duration-300"
          >
            {isFullscreen ? '↙ Звичайний режим' : '↗ Повний екран'}
          </Button>
        </div>
      </header>

      <div className="max-w-[98%] mx-auto px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="candidates">Кандидати</TabsTrigger>
            <TabsTrigger value="deals">Угоди</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-4">
            <Card className="mb-2">
              <CardContent className="py-3">
                <CandidatesFilters onAddCandidate={handleAddCandidate} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success mx-auto mb-4"></div>
                      <p className="text-gray-500">Завантаження...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <CandidatesTableExcel candidates={candidates} isFullscreen={isFullscreen} />
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Всього: {totalCount} | Сторінка {currentPage} з {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-7 text-xs"
                          >
                            ← Попередня
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-7 text-xs"
                          >
                            Наступна →
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Модуль угод</h3>
                  <p className="text-gray-600 mb-4">
                    Перейдіть до модуля угод для створення та управління угодами з груповими кандидатами
                  </p>
                  <Link href="/deals">
                    <Button>
                      Перейти до угод
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddCandidateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={loadCandidates}
      />
      </div>
    </ProtectedRoute>
  )
}

