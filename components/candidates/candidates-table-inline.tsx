"use client"

import { useState } from 'react'
import { Candidate } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useCandidatesStore } from '@/hooks/use-candidates'
import { Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { formatDate } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BRANCHES,
  RESPONSIBLE_PERSONS,
  COUNTRIES,
  CANDIDATE_STATUSES,
  PAYMENT_STATUSES,
  RECIPIENT_TYPES,
  CANDIDATE_COUNTRIES,
} from '@/types'

interface CandidatesTableProps {
  candidates: Candidate[]
}

export function CandidatesTableInline({ candidates }: CandidatesTableProps) {
  const { hasPermission } = useAuth()
  const { toast } = useToast()
  const { updateCandidate, deleteCandidate } = useCandidatesStore()
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  const canWrite = hasPermission('candidates', 'write')
  const canDelete = hasPermission('candidates', 'delete')

  function handleCellClick(candidate: Candidate, field: keyof Candidate) {
    if (!canWrite) return
    if (['id', 'createdAt', 'updatedAt'].includes(field)) return

    setEditingCell({ id: candidate.id, field })
    setEditValue(String(candidate[field] || ''))
  }

  async function handleCellBlur(candidate: Candidate, field: keyof Candidate) {
    if (!editingCell) return

    const oldValue = candidate[field]
    let newValue: any = editValue

    if (field === 'age' || field === 'paymentAmount') {
      newValue = editValue ? Number(editValue) : null
    } else if (field === 'arrivalDate') {
      newValue = editValue ? new Date(editValue) : null
    }

    if (String(oldValue) === String(newValue)) {
      setEditingCell(null)
      return
    }

    try {
      const updated = await api.candidates.update(candidate.id, {
        ...candidate,
        [field]: newValue,
      })
      updateCandidate(candidate.id, updated)
      toast({
        title: 'Оновлено',
        description: `Поле "${field}" змінено`,
      })
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося оновити',
        variant: 'destructive',
      })
    } finally {
      setEditingCell(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Видалити кандидата?')) return

    try {
      await api.candidates.delete(id)
      deleteCandidate(id)
      toast({
        title: 'Видалено',
        description: 'Кандидата видалено',
      })
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити',
        variant: 'destructive',
      })
    }
  }

  function renderCell(candidate: Candidate, field: keyof Candidate) {
    const isEditing = editingCell?.id === candidate.id && editingCell.field === field
    const value = candidate[field]

    if (isEditing) {
      if (['branch', 'responsible', 'candidateCountry', 'vacancyCountry', 'candidateStatus', 'paymentStatus', 'recipientType'].includes(field)) {
        let options: string[] = []
        if (field === 'branch') options = [...BRANCHES]
        else if (field === 'responsible') options = [...RESPONSIBLE_PERSONS]
        else if (field === 'candidateCountry') options = [...CANDIDATE_COUNTRIES]
        else if (field === 'vacancyCountry') options = [...COUNTRIES]
        else if (field === 'candidateStatus') options = [...CANDIDATE_STATUSES]
        else if (field === 'paymentStatus') options = ['', ...PAYMENT_STATUSES]
        else if (field === 'recipientType') options = ['', ...RECIPIENT_TYPES]

        return (
          <Select
            value={editValue}
            onValueChange={(v) => {
              setEditValue(v)
              setTimeout(() => handleCellBlur(candidate, field), 0)
            }}
            open={true}
          >
            <SelectTrigger className="h-6 text-xs border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt || '-'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }

      return (
        <input
          type={field === 'age' || field === 'paymentAmount' ? 'number' : field === 'arrivalDate' ? 'date' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCellBlur(candidate, field)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCellBlur(candidate, field)
            if (e.key === 'Escape') setEditingCell(null)
          }}
          className="w-full h-6 px-1 text-xs border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
      )
    }

    if (field === 'arrivalDate' && value) {
      return <span>{formatDate(String(value))}</span>
    }

    if (field === 'paymentAmount' && value) {
      return <span>{Number(value).toLocaleString()} ₴</span>
    }

    return <span>{String(value || '-')}</span>
  }

  function getStatusClass(status: string) {
    const statusMap: Record<string, string> = {
      'Зареєстровано': 'bg-blue-100 text-blue-800',
      'Не зареєстрован': 'bg-gray-100 text-gray-800',
      'Готовий до виїзду': 'bg-yellow-100 text-yellow-800',
      'В дорозі': 'bg-orange-100 text-orange-800',
      'Прибув': 'bg-purple-100 text-purple-800',
      'Працює': 'bg-green-100 text-green-800',
      'Завершив роботу': 'bg-gray-200 text-gray-700',
      'Не доїхав': 'bg-red-100 text-red-800',
      'Очікується': 'bg-yellow-100 text-yellow-700',
      'Отримано': 'bg-green-100 text-green-700',
      'Прострочено': 'bg-red-100 text-red-700',
    }
    return statusMap[status] || ''
  }

  return (
    <div className="border rounded-lg overflow-auto" style={{ height: 'calc(100vh - 320px)' }}>
      <table className="w-full text-xs border-collapse">
        <thead className="bg-gradient-to-r from-green-700 to-green-600 text-white sticky top-0 z-10">
          <tr>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">ID</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Філія</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Відповідальний</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Ім&apos;я</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Прізвище</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Телефон</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Вік</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Країна канд.</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Країна вак.</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Проект</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Партнер</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Дата заїзду</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Статус</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Сума</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Ст. оплати</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Реквізити</th>
            <th className="px-2 py-1 text-left border-r border-green-500 font-semibold">Коментар</th>
            {canDelete && <th className="px-2 py-1 text-center font-semibold">Дії</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {candidates.map((candidate, idx) => (
            <tr
              key={candidate.id}
              className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="px-2 py-1 border-r text-gray-600 font-mono">{candidate.id}</td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'branch')}
              >
                {renderCell(candidate, 'branch')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'responsible')}
              >
                {renderCell(candidate, 'responsible')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'firstName')}
              >
                {renderCell(candidate, 'firstName')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'lastName')}
              >
                {renderCell(candidate, 'lastName')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50 font-mono"
                onClick={() => handleCellClick(candidate, 'phone')}
              >
                {renderCell(candidate, 'phone')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50 text-center"
                onClick={() => handleCellClick(candidate, 'age')}
              >
                {renderCell(candidate, 'age')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'candidateCountry')}
              >
                {renderCell(candidate, 'candidateCountry')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'vacancyCountry')}
              >
                {renderCell(candidate, 'vacancyCountry')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'projectName')}
              >
                {renderCell(candidate, 'projectName')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'partnerNumber')}
              >
                {renderCell(candidate, 'partnerNumber')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'arrivalDate')}
              >
                {renderCell(candidate, 'arrivalDate')}
              </td>
              <td className="px-2 py-1 border-r">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusClass(candidate.candidateStatus)}`}>
                  {candidate.candidateStatus}
                </span>
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50 text-right"
                onClick={() => handleCellClick(candidate, 'paymentAmount')}
              >
                {renderCell(candidate, 'paymentAmount')}
              </td>
              <td className="px-2 py-1 border-r">
                {candidate.paymentStatus && (
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusClass(candidate.paymentStatus)}`}>
                    {candidate.paymentStatus}
                  </span>
                )}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'recipientType')}
              >
                {renderCell(candidate, 'recipientType')}
              </td>
              <td
                className="px-2 py-1 border-r cursor-pointer hover:bg-blue-50"
                onClick={() => handleCellClick(candidate, 'comment')}
              >
                {renderCell(candidate, 'comment')}
              </td>
              {canDelete && (
                <td className="px-2 py-1 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(candidate.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

