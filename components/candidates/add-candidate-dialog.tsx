"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { api } from '@/lib/api'
import { useCandidatesStore } from '@/hooks/use-candidates'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  CANDIDATE_COUNTRIES,
  COUNTRIES,
  CANDIDATE_STATUSES,
  PAYMENT_STATUSES,
  RECIPIENT_TYPES,
} from '@/types'

const candidateSchema = z.object({
  branch: z.string().min(1, 'Оберіть філію'),
  responsible: z.string().min(1, 'Оберіть відповідального'),
  firstName: z.string().min(1, "Введіть ім'я"),
  lastName: z.string().min(1, 'Введіть прізвище'),
  phone: z.string().min(10, 'Введіть телефон'),
  age: z.coerce.number().min(18).max(65),
  candidateCountry: z.string().min(1, 'Оберіть країну кандидата'),
  vacancyCountry: z.string().min(1, 'Оберіть країну вакансії'),
  projectName: z.string().min(1, 'Введіть назву проекту'),
  partnerNumber: z.string(),
  arrivalDate: z.string().optional(),
  candidateStatus: z.string().min(1, 'Оберіть статус'),
  paymentAmount: z.coerce.number().default(0),
  paymentStatus: z.string().optional(),
  recipientType: z.string().optional(),
  comment: z.string().optional(),
})

type CandidateFormData = z.infer<typeof candidateSchema>

interface AddCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddCandidateDialog({ open, onOpenChange, onSuccess }: AddCandidateDialogProps) {
  const { toast } = useToast()
  const { addCandidate } = useCandidatesStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      branch: 'ЦО',
      candidateCountry: 'Україна',
      candidateStatus: 'Зареєстровано',
      paymentAmount: 0,
      paymentStatus: 'none',
      recipientType: 'none',
    },
  })

  async function onSubmit(data: CandidateFormData) {
    setIsSubmitting(true)
    try {
      const candidateData = {
        ...data,
        paymentStatus: data.paymentStatus === 'none' ? null : data.paymentStatus,
        recipientType: data.recipientType === 'none' ? null : data.recipientType,
      }
      const candidate = await api.candidates.create(candidateData)
      addCandidate(candidate)
      toast({
        title: 'Успіх',
        description: 'Кандидата додано',
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося додати кандидата',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Додати кандидата</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Філія *</Label>
              <Select value={watch('branch')} onValueChange={(v) => setValue('branch', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branch && <p className="text-sm text-red-500">{errors.branch.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Відповідальний *</Label>
              <Select value={watch('responsible')} onValueChange={(v) => setValue('responsible', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSIBLE_PERSONS.map((person) => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.responsible && <p className="text-sm text-red-500">{errors.responsible.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ім&apos;я *</Label>
              <Input {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Прізвище *</Label>
              <Input {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input {...register('phone')} placeholder="380XXXXXXXXX" />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Вік *</Label>
              <Input type="number" {...register('age')} min="18" max="65" />
              {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidateCountry">Країна кандидата *</Label>
              <Select value={watch('candidateCountry')} onValueChange={(v) => setValue('candidateCountry', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATE_COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.candidateCountry && <p className="text-sm text-red-500">{errors.candidateCountry.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacancyCountry">Країна вакансії *</Label>
              <Select value={watch('vacancyCountry')} onValueChange={(v) => setValue('vacancyCountry', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vacancyCountry && <p className="text-sm text-red-500">{errors.vacancyCountry.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Проект *</Label>
              <Input {...register('projectName')} />
              {errors.projectName && <p className="text-sm text-red-500">{errors.projectName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerNumber">Партнер №</Label>
              <Input {...register('partnerNumber')} placeholder="№1, №2, №3..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrivalDate">Дата заїзду</Label>
              <Input type="date" {...register('arrivalDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidateStatus">Статус *</Label>
              <Select value={watch('candidateStatus')} onValueChange={(v) => setValue('candidateStatus', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.candidateStatus && <p className="text-sm text-red-500">{errors.candidateStatus.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Сума оплати (₴)</Label>
              <Input type="number" {...register('paymentAmount')} step="0.01" min="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Статус оплати</Label>
              <Select value={watch('paymentStatus')} onValueChange={(v) => setValue('paymentStatus', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-</SelectItem>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientType">Реквізити</Label>
              <Select value={watch('recipientType')} onValueChange={(v) => setValue('recipientType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-</SelectItem>
                  {RECIPIENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Коментар</Label>
            <Input {...register('comment')} placeholder="Короткий коментар" />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

