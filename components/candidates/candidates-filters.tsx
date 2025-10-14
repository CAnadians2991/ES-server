"use client"

import { useCandidatesStore } from '@/hooks/use-candidates'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRANCHES, COUNTRIES, CANDIDATE_STATUSES, RESPONSIBLE_PERSONS } from '@/types'

// Генеруємо список місяців для навігації
const MONTHS = [
  { value: '10', label: 'Жовтень 2025' },
  { value: '09', label: 'Вересень 2025' },
  { value: '08', label: 'Серпень 2025' },
  { value: '07', label: 'Липень 2025' },
  { value: '06', label: 'Червень 2025' },
  { value: '05', label: 'Травень 2025' },
  { value: '04', label: 'Квітень 2025' },
  { value: '03', label: 'Березень 2025' },
  { value: '02', label: 'Лютий 2025' },
  { value: '01', label: 'Січень 2025' },
  { value: '12', label: 'Грудень 2024' },
  { value: '11', label: 'Листопад 2024' },
  { value: '10', label: 'Жовтень 2024' },
  { value: '09', label: 'Вересень 2024' },
  { value: '08', label: 'Серпень 2024' },
]

interface CandidatesFiltersProps {
  onAddCandidate?: () => void
}

export function CandidatesFilters({ onAddCandidate }: CandidatesFiltersProps) {
  const { filters, setFilters, clearFilters } = useCandidatesStore()
  const { hasPermission } = useAuth()

  const updateFilter = useCallback((key: string, value: string) => {
    const newFilters = { ...filters }
    
    if (value === 'all') {
      // Видаляємо фільтр якщо вибрано "all"
      delete newFilters[key]
      // Якщо це місяць, також видаляємо рік
      if (key === 'month') {
        delete newFilters.year
      }
    } else if (key === 'month') {
      // При зміні місяця також встановлюємо рік
      const year = value.startsWith('2024') ? '2024' : '2025'
      newFilters.month = value
      newFilters.year = year
    } else {
      newFilters[key] = value
    }
    
    setFilters(newFilters)
  }, [filters, setFilters])

  function handleClearFilters() {
    clearFilters()
  }

  // Перевіряємо чи є активні фільтри
  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select value={filters.month || 'all'} onValueChange={(v) => updateFilter('month', v)}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue placeholder="Місяць" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Останні 2 місяці</SelectItem>
          {MONTHS.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.branch || 'all'} onValueChange={(v) => updateFilter('branch', v)}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Філія" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі філії</SelectItem>
          {BRANCHES.map((branch) => (
            <SelectItem key={branch} value={branch}>
              {branch}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.vacancyCountry || 'all'} onValueChange={(v) => updateFilter('vacancyCountry', v)}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Країна" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі країни</SelectItem>
          {COUNTRIES.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.candidateStatus || 'all'} onValueChange={(v) => updateFilter('candidateStatus', v)}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі статуси</SelectItem>
          {CANDIDATE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.responsible || 'all'} onValueChange={(v) => updateFilter('responsible', v)}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue placeholder="Відповідальний" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі</SelectItem>
          {RESPONSIBLE_PERSONS.map((person) => (
            <SelectItem key={person} value={person}>
              {person}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.month || 'all'} onValueChange={(v) => updateFilter('month', v)}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue placeholder="Місяць" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі місяці</SelectItem>
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

      <Select value={filters.year || 'all'} onValueChange={(v) => updateFilter('year', v)}>
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue placeholder="Рік" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі роки</SelectItem>
          <SelectItem value="2024">2024</SelectItem>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2026">2026</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        onClick={handleClearFilters}
        size="sm"
        variant="outline"
        className={`h-8 text-xs transition-all duration-300 ${
          hasActiveFilters 
            ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900' 
            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
        }`}
      >
        Скинути
      </Button>

      {hasPermission('candidates', 'write') && onAddCandidate && (
        <Button 
          onClick={onAddCandidate}
          size="sm"
          className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
        >
          + Додати кандидата
        </Button>
      )}
    </div>
  )
}

