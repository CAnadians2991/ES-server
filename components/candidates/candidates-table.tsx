"use client"

import { Trash2 } from 'lucide-react'
import { useCandidatesStore } from '@/hooks/use-candidates'
import { api } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Candidate } from '@/types'

interface CandidatesTableProps {
  candidates: Candidate[]
}

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const { toast } = useToast()
  const { deleteCandidate } = useCandidatesStore()

  async function handleDelete(id: number) {
    if (!confirm('Ви впевнені, що хочете видалити цього кандидата?')) {
      return
    }

    try {
      await api.candidates.delete(id)
      deleteCandidate(id)
      toast({
        title: 'Успіх',
        description: 'Кандидата видалено',
      })
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити кандидата',
        variant: 'destructive',
      })
    }
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'Зареєстровано': 'bg-blue-100 text-blue-800',
      'Не зареєстрован': 'bg-red-100 text-red-800',
      'Готовий до виїзду': 'bg-green-100 text-green-800',
      'В дорозі': 'bg-orange-100 text-orange-800',
      'Прибув': 'bg-cyan-100 text-cyan-800',
      'Працює': 'bg-green-100 text-green-800',
      'Завершив роботу': 'bg-purple-100 text-purple-800',
      'Не доїхав': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">Немає кандидатів</h3>
        <p className="text-gray-500">Додайте перший кандидат натиснувши кнопку &quot;+ Додати кандидата&quot;</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-success text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Філія</th>
              <th className="px-4 py-3 text-left">Відповідальний</th>
              <th className="px-4 py-3 text-left">ПІБ</th>
              <th className="px-4 py-3 text-left">Телефон</th>
              <th className="px-4 py-3 text-left">Вік</th>
              <th className="px-4 py-3 text-left">Країна</th>
              <th className="px-4 py-3 text-left">Проект</th>
              <th className="px-4 py-3 text-left">Партнер</th>
              <th className="px-4 py-3 text-left">Дата заїзду</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-left">Статус оплати</th>
              <th className="px-4 py-3 text-left">Реквізити</th>
              <th className="px-4 py-3 text-left">Примітка</th>
              <th className="px-4 py-3 text-center">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{String(candidate.id).padStart(6, '0')}</td>
                <td className="px-4 py-3">{candidate.branch}</td>
                <td className="px-4 py-3">{candidate.responsible}</td>
                <td className="px-4 py-3 font-medium">{candidate.firstName} {candidate.lastName}</td>
                <td className="px-4 py-3">{candidate.phone}</td>
                <td className="px-4 py-3">{candidate.age}</td>
                <td className="px-4 py-3">{candidate.vacancyCountry}</td>
                <td className="px-4 py-3">{candidate.projectName}</td>
                <td className="px-4 py-3">{candidate.partnerNumber}</td>
                <td className="px-4 py-3">{candidate.arrivalDate ? formatDate(String(candidate.arrivalDate)) : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.candidateStatus)}`}>
                    {candidate.candidateStatus}
                  </span>
                </td>
                <td className="px-4 py-3">{candidate.paymentStatus || '-'}</td>
                <td className="px-4 py-3">{candidate.recipientType || '-'}</td>
                <td className="px-4 py-3 max-w-[200px] truncate" title={candidate.comment || ''}>
                  {candidate.comment || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(candidate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

