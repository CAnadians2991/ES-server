"use client"

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { Candidate } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useCandidatesStore } from '@/hooks/use-candidates'
import { Trash2, GripVertical, Copy, Clock } from 'lucide-react'
import { CandidateHistoryModal } from './candidate-history-modal'
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
  COUNTRIES,
  CANDIDATE_STATUSES,
  PAYMENT_STATUSES,
  RECIPIENT_TYPES,
  CANDIDATE_COUNTRIES,
} from '@/types'

interface CandidatesTableExcelProps {
  candidates: Candidate[]
  onAddNewRow?: () => void
  isFullscreen?: boolean
}

// Константи для оптимізації
const ROW_HEIGHT = 40
const BUFFER_SIZE = 5
const DEBOUNCE_DELAY = 150

// Мемоізований рядок таблиці
const TableRow = memo(({ 
  candidate, 
  columns, 
  columnWidths, 
  editingCell, 
  editValue, 
  setEditValue, 
  handleCellClick, 
  handleCellBlur, 
  handleKeyDown, 
  handleDragStart, 
  handleDragOver, 
  handleDrop, 
  handleDelete, 
  handleShowHistory, 
  canWrite, 
  canDelete, 
  isAdmin, 
  draggedRow, 
  dropTarget, 
  selectedRow 
}: any) => {
  const rowRef = useRef<HTMLTableRowElement>(null)

  return (
    <tr
      ref={rowRef}
      className={`hover:bg-gray-50 transition-colors duration-75 ${
        selectedRow === candidate.id ? 'bg-blue-50' : ''
      } ${
        draggedRow === candidate.id ? 'opacity-50' : ''
      } ${
        dropTarget === candidate.id ? 'bg-green-50 border-t-2 border-green-400' : ''
      }`}
      onClick={(e) => handleRowClick(candidate.id, e)}
      draggable={canWrite}
      onDragStart={() => handleDragStart(candidate.id)}
      onDragOver={(e) => handleDragOver(e, candidate.id)}
      onDrop={() => handleDrop(candidate.id)}
      style={{ height: ROW_HEIGHT }}
    >
      {columns.map((column: any) => (
        <td
          key={column.key}
          className={`px-1.5 py-0 border-r border-gray-200 text-sm ${
            column.editable && canWrite ? 'cursor-pointer hover:bg-gray-100' : ''
          }`}
          style={{ width: columnWidths[column.key] || column.width }}
          onClick={() => handleCellClick(candidate, column.key)}
        >
          {editingCell?.id === candidate.id && editingCell?.field === column.key ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleCellBlur(candidate, column.key)}
              onKeyDown={(e) => handleKeyDown(e, candidate, column.key)}
              className="w-full h-full px-1 border-none outline-none bg-transparent text-sm"
              autoFocus
            />
          ) : (
            <div className="truncate">
              {renderCell(candidate, column.key)}
            </div>
          )}
        </td>
      ))}
      
      {/* Кнопки дій */}
      <td className="px-2 py-1 border-r border-gray-200">
        <div className="flex items-center gap-1">
          {canWrite && (
            <GripVertical 
              className="h-4 w-4 text-gray-400 cursor-move hover:text-gray-600" 
              onMouseDown={(e) => e.preventDefault()}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(candidate.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShowHistory(candidate.id)}
              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              <Clock className="h-3 w-3" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
})

TableRow.displayName = 'TableRow'

// Мемоізована функція рендерингу клітинки
const renderCell = memo((candidate: Candidate, field: string) => {
  const value = candidate[field as keyof Candidate]
  
  if (field === 'arrivalDate' || field === 'passportExpiry') {
    return value ? formatDate(String(value)) : '-'
  }
  
  if (field === 'age' || field === 'paymentAmount' || field === 'children') {
    return value || '-'
  }
  
  return String(value || '-')
})

renderCell.displayName = 'RenderCell'

// Virtual scrolling hook
const useVirtualScrolling = (items: any[], containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleStart = Math.floor(scrollTop / ROW_HEIGHT)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_SIZE,
    items.length
  )
  
  const visibleItems = items.slice(visibleStart, visibleEnd)
  const offsetY = visibleStart * ROW_HEIGHT
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * ROW_HEIGHT,
    onScroll: useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }, [])
  }
}

export function CandidatesTableExcel({ candidates: initialCandidates, onAddNewRow, isFullscreen = false }: CandidatesTableExcelProps) {
  const { hasPermission, user } = useAuth()
  const { toast } = useToast()
  const { updateCandidate, deleteCandidate, addCandidate } = useCandidatesStore()
  const [candidates, setCandidates] = useState(initialCandidates)
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [draggedRow, setDraggedRow] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyModalCandidateId, setHistoryModalCandidateId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const canWrite = hasPermission('candidates', 'write')
  const canDelete = hasPermission('candidates', 'delete')
  const isAdmin = user?.role === 'ADMIN'

  // Virtual scrolling
  const { visibleItems, offsetY, totalHeight, onScroll } = useVirtualScrolling(
    candidates, 
    containerRef.current?.clientHeight || 600
  )

  useEffect(() => {
    setCandidates(initialCandidates)
  }, [initialCandidates])

  // Мемоізовані колонки
  const columns = useMemo(() => [
    { key: 'id', label: 'ID', width: 70, editable: false },
    { key: 'applicationNumber', label: '№ Заявки', width: 80, editable: true },
    { key: 'branch', label: 'Філія', width: 65, editable: true },
    { key: 'responsible', label: 'Відповідальний', width: 110, editable: true },
    { key: 'firstName', label: "Ім'я", width: 90, editable: true },
    { key: 'lastName', label: 'Прізвище', width: 100, editable: true },
    { key: 'phone', label: 'Телефон', width: 105, editable: true },
    { key: 'email', label: 'Email', width: 120, editable: true },
    { key: 'age', label: 'Вік', width: 45, editable: true },
    { key: 'candidateCountry', label: 'Країна К', width: 75, editable: true },
    { key: 'vacancyCountry', label: 'Країна В', width: 75, editable: true },
    { key: 'projectName', label: 'Проект', width: 120, editable: true },
    { key: 'partnerNumber', label: 'Партнер', width: 70, editable: true },
    { key: 'arrivalDate', label: 'Дата', width: 90, editable: true },
    { key: 'candidateStatus', label: 'Статус', width: 110, editable: true },
    { key: 'paymentAmount', label: 'Сума', width: 70, editable: true },
    { key: 'paymentStatus', label: 'Оплата', width: 85, editable: true },
    { key: 'recipientType', label: 'Реквізити', width: 95, editable: true },
    { key: 'passportNumber', label: 'Паспорт', width: 100, editable: true },
    { key: 'passportExpiry', label: 'Термін паспорта', width: 110, editable: true },
    { key: 'education', label: 'Освіта', width: 100, editable: true },
    { key: 'workExperience', label: 'Досвід', width: 100, editable: true },
    { key: 'languageSkills', label: 'Мови', width: 100, editable: true },
    { key: 'familyStatus', label: 'Сімейний стан', width: 110, editable: true },
    { key: 'children', label: 'Діти', width: 50, editable: true },
    { key: 'comment', label: 'Коментар', width: 180, editable: true },
  ], [])

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(async (candidateId: number, field: string, newValue: any) => {
      try {
        await api.candidates.update(candidateId, { [field]: newValue })
      } catch (error) {
        console.error('Update error:', error)
        toast({
          title: 'Помилка',
          description: 'Не вдалося оновити',
          variant: 'destructive',
        })
      }
    }, DEBOUNCE_DELAY),
    [toast, api.candidates.update]
  )

  // Оптимізовані обробники подій
  const handleCellClick = useCallback((candidate: Candidate, field: string) => {
    if (!canWrite) return
    const col = columns.find(c => c.key === field)
    if (!col?.editable) return

    setEditingCell({ id: candidate.id, field })
    setEditValue(String(candidate[field as keyof Candidate] || ''))
  }, [canWrite, columns])

  const handleCellBlur = useCallback(async (candidate: Candidate, field: string) => {
    if (!editingCell) return

    const oldValue = candidate[field as keyof Candidate]
    let newValue: any = editValue

    // Обробка порожніх рядків
    if (editValue === '' || editValue === null || editValue === undefined) {
      if (field === 'age' || field === 'paymentAmount' || field === 'children') {
        newValue = null
      } else if (field === 'arrivalDate' || field === 'passportExpiry') {
        newValue = null
      } else {
        newValue = ''
      }
    } else if (field === 'age' || field === 'paymentAmount' || field === 'children') {
      const parsed = Number(editValue)
      newValue = isNaN(parsed) ? null : parsed
    } else if (field === 'arrivalDate' || field === 'passportExpiry') {
      newValue = editValue ? new Date(editValue) : null
    }

    if (String(oldValue) === String(newValue)) {
      setEditingCell(null)
      return
    }

    // Оптимістичне оновлення UI
    updateCandidate(candidate.id, { [field]: newValue } as any)
    setEditingCell(null)

    // Debounced API call
    debouncedUpdate(candidate.id, field, newValue)
  }, [editingCell, editValue, updateCandidate, debouncedUpdate])

  const handleDrop = useCallback((targetId: number) => {
    if (draggedRow === null || draggedRow === targetId) {
      setDraggedRow(null)
      setDropTarget(null)
      return
    }

    const draggedIndex = candidates.findIndex(c => c.id === draggedRow)
    const targetIndex = candidates.findIndex(c => c.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedRow(null)
      setDropTarget(null)
      return
    }

    // Миттєве оновлення UI
    const newCandidates = [...candidates]
    const [removed] = newCandidates.splice(draggedIndex, 1)
    newCandidates.splice(targetIndex, 0, removed)
    setCandidates(newCandidates)

    setDraggedRow(null)
    setDropTarget(null)

    // Оновлюємо глобальний стан
    updateCandidate(draggedRow, { sortOrder: targetIndex } as any)
  }, [draggedRow, candidates, setCandidates, updateCandidate])

  // Інші обробники...
  const handleRowClick = useCallback((candidateId: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, select, button')) return
    setSelectedRow(candidateId)
  }, [])

  const handleDragStart = useCallback((candidateId: number) => {
    setDraggedRow(candidateId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, candidateId: number) => {
    e.preventDefault()
    if (draggedRow !== candidateId) {
      setDropTarget(candidateId)
    }
  }, [draggedRow])

  const handleDelete = useCallback(async (id: number) => {
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
  }, [deleteCandidate, toast])

  const handleShowHistory = useCallback((candidateId: number) => {
    setHistoryModalCandidateId(candidateId)
    setHistoryModalOpen(true)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок таблиці */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Кандидати</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">
              Показано {visibleItems.length} з {candidates.length}
            </span>
            {canWrite && (
              <Button
                onClick={onAddNewRow}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + Додати кандидата
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Таблиця з virtual scrolling */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto border border-gray-200"
        onScroll={onScroll}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-1.5 py-2 text-left text-xs font-medium uppercase tracking-wider border-r border-gray-300"
                  style={{ width: columnWidths[column.key] || column.width }}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border-r border-gray-300">
                Дії
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Spacer для virtual scrolling */}
            <tr style={{ height: offsetY }}>
              <td colSpan={columns.length + 1}></td>
            </tr>
            
            {/* Видимі рядки */}
            {visibleItems.map((candidate) => (
              <TableRow
                key={candidate.id}
                candidate={candidate}
                columns={columns}
                columnWidths={columnWidths}
                editingCell={editingCell}
                editValue={editValue}
                setEditValue={setEditValue}
                handleCellClick={handleCellClick}
                handleCellBlur={handleCellBlur}
                handleKeyDown={() => {}}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDelete={handleDelete}
                handleShowHistory={handleShowHistory}
                canWrite={canWrite}
                canDelete={canDelete}
                isAdmin={isAdmin}
                draggedRow={draggedRow}
                dropTarget={dropTarget}
                selectedRow={selectedRow}
                handleRowClick={handleRowClick}
              />
            ))}
            
            {/* Spacer для virtual scrolling */}
            <tr style={{ height: totalHeight - offsetY - (visibleItems.length * ROW_HEIGHT) }}>
              <td colSpan={columns.length + 1}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Модальне вікно історії */}
      {historyModalOpen && historyModalCandidateId && (
        <CandidateHistoryModal
          candidateId={historyModalCandidateId}
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false)
            setHistoryModalCandidateId(null)
          }}
        />
      )}
    </div>
  )
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
