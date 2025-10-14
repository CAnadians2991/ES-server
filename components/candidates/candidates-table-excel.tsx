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

export function CandidatesTableExcel({ candidates: initialCandidates, onAddNewRow, isFullscreen = false }: CandidatesTableExcelProps) {
  const { hasPermission, user } = useAuth()
  const { toast } = useToast()
  const { updateCandidate, deleteCandidate, addCandidate, reorderCandidates } = useCandidatesStore()
  // const { emitCandidateUpdate, emitCandidateReorder, emitCandidateCreate, emitCandidateDelete } = useWebSocket()
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

  const canWrite = hasPermission('candidates', 'write')
  const canDelete = hasPermission('candidates', 'delete')
  const isAdmin = user?.role === 'ADMIN'

  // Debounced update function - оптимізовано для слабких комп'ютерів
  const debouncedUpdate = useCallback(
    debounce(async (candidateId: number, field: string, newValue: any) => {
      try {
        const updateData: any = { [field]: newValue }
        
        if ((field === 'arrivalDate' || field === 'passportExpiry') && newValue) {
          updateData[field] = newValue instanceof Date ? newValue.toISOString() : newValue
        }
        
        await api.candidates.update(candidateId, updateData)
        
        toast({
          title: 'Успішно',
          description: 'Кандидата оновлено',
        })
      } catch (error) {
        console.error('Update error:', error)
        toast({
          title: 'Помилка',
          description: 'Не вдалося оновити',
          variant: 'destructive',
        })
      }
    }, 500), // Зменшуємо до 500ms для кращого відчуття
    [toast]
  )

  useEffect(() => {
    setCandidates(initialCandidates)
  }, [initialCandidates])

  // Зберігаємо порядок при закритті сторінки
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Зберігаємо поточний порядок в localStorage
      const currentOrder = candidates.map((c, index) => ({ id: c.id, sortOrder: index }))
      localStorage.setItem('candidates_order', JSON.stringify(currentOrder))
      
      // Відправляємо на сервер (неблокуючий запит)
      try {
        navigator.sendBeacon('/api/candidates/bulk-reorder', JSON.stringify({ orders: currentOrder }))
      } catch (error) {
        console.log('Failed to save order on page unload')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [candidates])

// Функція рендерингу клітинки
const renderCell = (candidate: Candidate, field: string, editingCell: { id: number; field: string } | null, editValue: string, handleInputChange: (value: string) => void, handleCellBlur: (candidate: Candidate, field: keyof Candidate) => void, handleKeyDown: (e: React.KeyboardEvent, candidate: Candidate, field: string) => void): React.ReactNode => {
  const value = candidate[field as keyof Candidate]
  
  // Перевіряємо чи клітинка в режимі редагування
  const isEditing = editingCell && editingCell.id === candidate.id && editingCell.field === field
  
  if (isEditing) {
    if (field === 'arrivalDate' || field === 'passportExpiry') {
      return (
        <input
          type="date"
          value={editValue || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => handleCellBlur(candidate, field as keyof Candidate)}
          onKeyDown={(e) => handleKeyDown(e, candidate, field)}
          className="w-full h-4 px-1 text-xs border-none outline-none bg-transparent"
          autoFocus
        />
      )
    }
    
    if (field === 'age' || field === 'paymentAmount' || field === 'children') {
      return (
        <input
          type="number"
          value={editValue || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => handleCellBlur(candidate, field as keyof Candidate)}
          onKeyDown={(e) => handleKeyDown(e, candidate, field)}
          className="w-full h-4 px-1 text-xs border-none outline-none bg-transparent text-right"
          autoFocus
        />
      )
    }
    
    return (
      <input
        type="text"
        value={editValue || ''}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={() => handleCellBlur(candidate, field as keyof Candidate)}
        onKeyDown={(e) => handleKeyDown(e, candidate, field)}
        className="w-full h-4 px-1 text-xs border-none outline-none bg-transparent"
        autoFocus
      />
    )
  }
  
  // Звичайний рендеринг
  if (field === 'arrivalDate' || field === 'passportExpiry') {
    return value ? formatDate(String(value)) : '-'
  }
  
  if (field === 'age' || field === 'paymentAmount' || field === 'children') {
    return String(value || '-')
  }
  
  return String(value || '-')
}

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

  useEffect(() => {
    const initialWidths: Record<string, number> = {}
    columns.forEach(col => {
      initialWidths[col.key] = col.width
    })
    setColumnWidths(initialWidths)
  }, [])

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  function formatCandidateId(id: number): string {
    return String(id).padStart(6, '0')
  }


  function handleCellClick(candidate: Candidate, field: keyof Candidate) {
    if (!canWrite) return
    const col = columns.find(c => c.key === field)
    if (!col?.editable) return

    setEditingCell({ id: candidate.id, field })
    setEditValue(String(candidate[field] || ''))
  }

  const handleCellBlur = useCallback(async (candidate: Candidate, field: keyof Candidate) => {
    if (!editingCell) return

    const oldValue = candidate[field]
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

    // Миттєве оновлення UI
    updateCandidate(candidate.id, { [field]: newValue })
    setEditingCell(null)

    // Debounced API call
    debouncedUpdate(candidate.id, field, newValue)
  }, [editingCell, editValue, updateCandidate, debouncedUpdate])

  // Миттєве оновлення при введенні тексту - виправлено
  const handleInputChange = useCallback((value: string) => {
    setEditValue(value)
    
    // Миттєве оновлення UI для всіх полів
    if (editingCell) {
      const candidate = candidates.find(c => c.id === editingCell.id)
      if (candidate) {
        const field = editingCell.field as keyof Candidate
        let newValue: any = value
        
        // Обробка для числових полів
        if (field === 'age' || field === 'paymentAmount' || field === 'children') {
          const parsed = Number(value)
          newValue = isNaN(parsed) ? null : parsed
        }
        
        // Миттєве оновлення UI для всіх полів
        updateCandidate(candidate.id, { [field]: newValue })
      }
    }
  }, [editingCell, candidates, updateCandidate])

  function handleKeyDown(e: React.KeyboardEvent, candidate: Candidate, field: string) {
    if (e.key === 'Enter') {
      handleCellBlur(candidate, field as keyof Candidate)
      e.preventDefault()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleCellBlur(candidate, field as keyof Candidate)
      
      const currentColIndex = columns.findIndex(c => c.key === field)
      const currentRowIndex = candidates.findIndex(c => c.id === candidate.id)
      
      if (e.shiftKey) {
        if (currentColIndex > 0) {
          const nextCol = columns[currentColIndex - 1]
          if (nextCol.editable) {
            setTimeout(() => handleCellClick(candidate, nextCol.key as keyof Candidate), 0)
          }
        } else if (currentRowIndex > 0) {
          const prevCandidate = candidates[currentRowIndex - 1]
          const lastEditableCol = [...columns].reverse().find(c => c.editable)
          if (lastEditableCol) {
            setTimeout(() => handleCellClick(prevCandidate, lastEditableCol.key as keyof Candidate), 0)
          }
        }
      } else {
        if (currentColIndex < columns.length - 1) {
          const nextCol = columns[currentColIndex + 1]
          if (nextCol.editable) {
            setTimeout(() => handleCellClick(candidate, nextCol.key as keyof Candidate), 0)
          }
        } else if (currentRowIndex < candidates.length - 1) {
          const nextCandidate = candidates[currentRowIndex + 1]
          const firstEditableCol = columns.find(c => c.editable)
          if (firstEditableCol) {
            setTimeout(() => handleCellClick(nextCandidate, firstEditableCol.key as keyof Candidate), 0)
          }
        }
      }
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

  function handleColumnResize(columnKey: string, startX: number, startWidth: number) {
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(50, startWidth + diff)
      setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }))
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    setResizingColumn(columnKey)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  function handleDragStart(candidateId: number) {
    setDraggedRow(candidateId)
  }

  function handleDragOver(e: React.DragEvent, candidateId: number) {
    e.preventDefault()
    if (draggedRow !== candidateId) {
      setDropTarget(candidateId)
    }
  }

  // Debounced reorder function - оптимізовано для слабких комп'ютерів
  const debouncedReorder = useCallback(
    debounce(async (draggedId: number, targetId: number) => {
      try {
        await api.candidates.reorder(draggedId, targetId)
      } catch (error) {
        console.error('Reorder error:', error)
        toast({
          title: 'Помилка',
          description: 'Не вдалося перемістити',
          variant: 'destructive',
        })
      }
    }, 1000), // Зменшуємо до 1 секунди для кращого відчуття
    [toast]
  )

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

    // Миттєве оновлення UI без жодних затримок
    const newCandidates = [...candidates]
    const [removed] = newCandidates.splice(draggedIndex, 1)
    newCandidates.splice(targetIndex, 0, removed)
    setCandidates(newCandidates)

    // Скидаємо стани drag & drop
    setDraggedRow(null)
    setDropTarget(null)

    // Оновлюємо глобальний стан
    updateCandidate(draggedRow, { sortOrder: targetIndex } as any)
    
    // Debounced API call
    debouncedReorder(draggedRow, targetId)
  }, [draggedRow, candidates, setCandidates, updateCandidate, debouncedReorder])

  function handleRowClick(candidateId: number, e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('input, select, button')) return
    setSelectedRow(candidateId)
  }

  function handleShowHistory(candidateId: number) {
    setHistoryModalCandidateId(candidateId)
    setHistoryModalOpen(true)
  }

  function handleCopyRow(candidate: Candidate) {
    const rowData = [
      formatCandidateId(candidate.id),
      candidate.branch,
      candidate.responsible,
      candidate.firstName,
      candidate.lastName,
      candidate.phone,
      candidate.age,
      candidate.candidateCountry,
      candidate.vacancyCountry,
      candidate.projectName,
      candidate.partnerNumber || '',
      candidate.arrivalDate ? formatDate(String(candidate.arrivalDate)) : '',
      candidate.candidateStatus,
      candidate.paymentAmount || '',
      candidate.paymentStatus || '',
      candidate.recipientType || '',
      candidate.comment || '',
    ].join('\t')

    navigator.clipboard.writeText(rowData)
    toast({
      title: 'Скопійовано',
      description: 'Рядок скопійовано в буфер обміну',
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedRow && !editingCell) {
        const candidate = candidates.find(c => c.id === selectedRow)
        if (candidate) {
          handleCopyRow(candidate)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedRow, candidates, editingCell])


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

  const tableHeight = isFullscreen ? 'calc(100vh - 180px)' : 'calc(100vh - 220px)'

  return (
    <div>
      <div className="border rounded-lg overflow-auto" style={{ height: tableHeight }}>
        <table ref={tableRef} className="w-full border-collapse table-fixed" style={{ fontSize: '9.8px' }}>
          <thead className="bg-gradient-to-r from-green-700 to-green-600 text-white sticky top-0 z-10">
            <tr>
              {canWrite && <th className="px-1.5 py-0.5 w-8"></th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-1.5 py-0.5 text-left border-r border-green-500 font-semibold relative select-none overflow-hidden"
                  style={{ width: columnWidths[col.key] || col.width }}
                >
                  <div className="flex items-center justify-between truncate">
                    <span className="truncate">{col.label}</span>
                    <div
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-green-400 transition-colors"
                      onMouseDown={(e) => handleColumnResize(col.key, e.clientX, columnWidths[col.key] || col.width)}
                    />
                  </div>
                </th>
              ))}
              {canDelete && <th className="px-1.5 py-0.5 text-center font-semibold w-20">Дії</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {candidates.map((candidate, idx) => (
              <tr
                key={candidate.id}
                draggable={canWrite}
                onDragStart={() => handleDragStart(candidate.id)}
                onDragOver={(e) => handleDragOver(e, candidate.id)}
                onDrop={() => handleDrop(candidate.id)}
                onDragEnd={() => {
                  setDraggedRow(null)
                  setDropTarget(null)
                }}
                onClick={(e) => handleRowClick(candidate.id, e)}
                className={`
                  border-b hover:bg-gray-50 transition-colors cursor-pointer
                  ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  ${draggedRow === candidate.id ? 'opacity-50' : ''}
                  ${dropTarget === candidate.id ? 'border-t-4 border-blue-500' : ''}
                  ${selectedRow === candidate.id ? 'bg-blue-50' : ''}
                `}
                style={{ height: '20px' }}
              >
                {canWrite && (
                  <td className="px-1.5 py-0 cursor-move hover:bg-gray-200">
                    <GripVertical className="h-3 w-3 text-gray-400" />
                  </td>
                )}
                {columns.map((col) => {
                  const field = col.key as keyof Candidate
                  
                  return (
                    <td
                      key={col.key}
                      className={`px-1.5 py-0 border-r overflow-hidden ${col.editable && canWrite ? 'cursor-pointer hover:bg-blue-50' : ''} ${field === 'id' ? 'text-gray-600 font-mono' : ''} ${field === 'paymentAmount' ? 'text-right' : ''}`}
                      style={{ width: columnWidths[col.key] || col.width, maxHeight: '20px' }}
                      onClick={() => col.editable && handleCellClick(candidate, field)}
                    >
                      {field === 'id' ? (
                        <span className="truncate block">{formatCandidateId(candidate.id)}</span>
                      ) : field === 'candidateStatus' || field === 'paymentStatus' ? (
                        candidate[field] && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium truncate inline-block ${getStatusClass(String(candidate[field]))}`}>
                            {candidate[field]}
                          </span>
                        )
                      ) : (
                        <span>{renderCell(candidate, field, editingCell, editValue, handleInputChange, handleCellBlur, handleKeyDown)}</span>
                      )}
                    </td>
                  )
                })}
                {canDelete && (
                  <td className="px-1.5 py-0 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShowHistory(candidate.id)
                          }}
                          className="h-5 w-5 p-0 hover:bg-purple-100 hover:text-purple-600"
                          title="Історія змін"
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyRow(candidate)
                        }}
                        className="h-5 w-5 p-0 hover:bg-blue-100 hover:text-blue-600"
                        title="Копіювати рядок (Ctrl+C)"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(candidate.id)
                        }}
                        className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CandidateHistoryModal
        candidateId={historyModalCandidateId}
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false)
          setHistoryModalCandidateId(null)
        }}
      />
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
