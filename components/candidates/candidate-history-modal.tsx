"use client"

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Clock, RotateCcw, User } from 'lucide-react'

interface AuditLog {
  id: number
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  userName?: string
  createdAt: string
}

interface CandidateHistoryModalProps {
  candidateId: number | null
  isOpen: boolean
  onClose: () => void
}

export function CandidateHistoryModal({ candidateId, isOpen, onClose }: CandidateHistoryModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  
  const isAdmin = user?.role === 'ADMIN'

  const loadHistory = useCallback(async () => {
    if (!candidateId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/audit-logs?entityType=Candidate&entityId=${candidateId}`)
      if (!response.ok) throw new Error('Помилка завантаження історії')
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося завантажити історію',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [candidateId, toast])

  useEffect(() => {
    if (isOpen && candidateId) {
      loadHistory()
    }
  }, [isOpen, candidateId, loadHistory])

  async function handleRevert(logId: number) {
    if (!isAdmin) {
      toast({
        title: 'Доступ заборонено',
        description: 'Тільки системний адміністратор може відкочувати зміни',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(`/api/audit-logs/revert/${logId}`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Помилка відкату')
      
      toast({
        title: 'Успішно',
        description: 'Зміну відкочено',
      })
      
      loadHistory()
      window.location.reload() // Оновлюємо сторінку щоб показати зміни
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося відкотити зміну',
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

  function getActionLabel(action: string) {
    switch (action) {
      case 'CREATE': return 'Створено'
      case 'UPDATE': return 'Змінено'
      case 'DELETE': return 'Видалено'
      case 'RESTORE': return 'Відновлено'
      default: return action
    }
  }

  function getActionColor(action: string) {
    switch (action) {
      case 'CREATE': return 'text-green-600'
      case 'UPDATE': return 'text-blue-600'
      case 'DELETE': return 'text-red-600'
      case 'RESTORE': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  function translateFieldName(fieldName: string) {
    const translations: Record<string, string> = {
      branch: 'Філія',
      responsible: 'Відповідальний',
      firstName: "Ім'я",
      lastName: 'Прізвище',
      phone: 'Телефон',
      age: 'Вік',
      candidateCountry: 'Країна кандидата',
      vacancyCountry: 'Країна вакансії',
      projectName: 'Проект',
      partnerNumber: 'Партнер',
      arrivalDate: 'Дата заїзду',
      candidateStatus: 'Статус',
      paymentAmount: 'Сума оплати',
      paymentStatus: 'Статус оплати',
      recipientType: 'Реквізити',
      comment: 'Коментар',
    }
    return translations[fieldName] || fieldName
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Історія змін кандидата #{candidateId}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Немає історії змін</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-semibold ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      {log.fieldName && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium text-gray-700">
                            {translateFieldName(log.fieldName)}
                          </span>
                        </>
                      )}
                    </div>

                    {log.fieldName && log.action === 'UPDATE' && (
                      <div className="text-sm space-y-1 bg-white p-3 rounded border">
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-medium min-w-[60px]">Було:</span>
                          <span className="text-gray-700 line-through">{log.oldValue || '(порожньо)'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-medium min-w-[60px]">Стало:</span>
                          <span className="text-gray-900 font-medium">{log.newValue || '(порожньо)'}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.createdAt)}
                      </div>
                      {log.userName && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.userName}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {isAdmin && log.action === 'UPDATE' && (
                    <Button
                      size="sm"
                      onClick={() => handleRevert(log.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Відкотити
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isAdmin && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            ℹ️ Тільки системний адміністратор може відкочувати зміни
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

