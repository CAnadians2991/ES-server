'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ChevronDown, ChevronRight, User, Phone, MapPin, Briefcase, FileText, Calendar, CreditCard, Car, Home, Users } from 'lucide-react'
import { Contact } from '@/types'

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  currentManager?: {
    id: number
    name: string
    branch: string
  }
}

interface FormData {
  // Основна інформація
  firstName: string
  lastName: string
  phone: string
  age: number | ''
  
  // Контактна інформація
  email: string
  viber: string
  polishPhone: string
  
  // Документи
  passportSeries: string
  passportNumber: string
  passportValidFrom: string
  passportValidTo: string
  birthPlace: string
  postalCode: string
  registration: string
  pesel: string
  
  // Робота
  candidateCountry: string
  vacancyCountry: string
  projectName: string
  workExperience: string
  languageSkills: string
  driverLicense: string
  
  // Додаткова інформація
  maritalStatus: string
  children: string
  notes: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  age: '',
  email: '',
  viber: '',
  polishPhone: '',
  passportSeries: '',
  passportNumber: '',
  passportValidFrom: '',
  passportValidTo: '',
  birthPlace: '',
  postalCode: '',
  registration: '',
  pesel: '',
  candidateCountry: 'Україна',
  vacancyCountry: 'Польща',
  projectName: '',
  workExperience: '',
  languageSkills: '',
  driverLicense: '',
  maritalStatus: '',
  children: '',
  notes: ''
}

export default function CreateContactModal({ isOpen, onClose, onSave, currentManager }: CreateContactModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['basic']))

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks)
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId)
    } else {
      newExpanded.add(blockId)
    }
    setExpandedBlocks(newExpanded)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.age) {
      alert('Будь ласка, заповніть обов\'язкові поля: ім\'я, прізвище, телефон та вік')
      return
    }

    setLoading(true)
    try {
      await onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        age: Number(formData.age),
        candidateCountry: formData.candidateCountry,
        vacancyCountry: formData.vacancyCountry,
        projectName: formData.projectName,
        candidateStatus: 'Новий контакт',
        notes: formData.notes,
        managerId: currentManager?.id || 0,
        managerName: currentManager?.name || 'Менеджер',
        branch: currentManager?.branch || 'Філія'
      })
      
      setFormData(initialFormData)
      onClose()
    } catch (error) {
      console.error('Error creating contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const blocks = [
    {
      id: 'basic',
      title: 'Основна інформація',
      icon: User,
      required: true,
      fields: [
        { id: 'firstName', label: 'Ім\'я*', type: 'text', required: true },
        { id: 'lastName', label: 'Прізвище*', type: 'text', required: true },
        { id: 'phone', label: 'Телефон*', type: 'text', required: true },
        { id: 'age', label: 'Вік*', type: 'number', required: true }
      ]
    },
    {
      id: 'contact',
      title: 'Контактна інформація',
      icon: Phone,
      fields: [
        { id: 'email', label: 'Email', type: 'email' },
        { id: 'viber', label: 'Viber', type: 'text' },
        { id: 'polishPhone', label: 'Польський номер', type: 'text' }
      ]
    },
    {
      id: 'documents',
      title: 'Документи',
      icon: FileText,
      fields: [
        { id: 'passportSeries', label: 'Серія паспорта', type: 'text' },
        { id: 'passportNumber', label: 'Номер паспорта', type: 'text' },
        { id: 'passportValidFrom', label: 'Паспорт дійсний від', type: 'date' },
        { id: 'passportValidTo', label: 'Паспорт дійсний до', type: 'date' },
        { id: 'birthPlace', label: 'Місто народження', type: 'text' },
        { id: 'postalCode', label: 'Поштовий індекс', type: 'text' },
        { id: 'registration', label: 'Прописка', type: 'textarea' },
        { id: 'pesel', label: 'PESEL', type: 'text' }
      ]
    },
    {
      id: 'work',
      title: 'Робота',
      icon: Briefcase,
      fields: [
        { id: 'candidateCountry', label: 'Країна проживання', type: 'select', options: ['Україна', 'Польща', 'Німеччина', 'Чехія'] },
        { id: 'vacancyCountry', label: 'Країна роботи', type: 'select', options: ['Польща', 'Німеччина', 'Чехія', 'Австрія'] },
        { id: 'projectName', label: 'Назва проекту', type: 'text' },
        { id: 'workExperience', label: 'Досвід роботи', type: 'textarea' },
        { id: 'languageSkills', label: 'Знання мов', type: 'textarea' },
        { id: 'driverLicense', label: 'Водійські права', type: 'text' }
      ]
    },
    {
      id: 'personal',
      title: 'Особиста інформація',
      icon: Users,
      fields: [
        { id: 'maritalStatus', label: 'Сімейний стан', type: 'select', options: ['Неодружений/незаміжня', 'Одружений/заміжня', 'Розлучений/розлучена', 'Вдівець/вдова'] },
        { id: 'children', label: 'Діти', type: 'textarea' }
      ]
    },
    {
      id: 'additional',
      title: 'Додаткова інформація',
      icon: FileText,
      fields: [
        { id: 'notes', label: 'Примітки', type: 'textarea' }
      ]
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Створення контакту
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Відповідальний менеджер */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <User className="w-4 h-4" />
                Відповідальний менеджер
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentManager.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="font-medium text-blue-900">{currentManager.name || 'Менеджер'}</p>
                  <p className="text-sm text-blue-700">{currentManager.branch || 'Філія'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Блоки форми */}
          {blocks.map((block) => {
            const Icon = block.icon
            const isExpanded = expandedBlocks.has(block.id)
            
            return (
              <Card key={block.id} className="border-gray-200">
                <CardHeader 
                  className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleBlock(block.id)}
                >
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {block.title}
                      {block.required && <span className="text-red-500">*</span>}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CardTitle>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {block.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id} className="text-sm">
                            {field.label}
                          </Label>
                          
                          {field.type === 'textarea' ? (
                            <textarea
                              id={field.id}
                              value={formData[field.id as keyof FormData] as string}
                              onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                              placeholder={`Введіть ${field.label.toLowerCase()}`}
                              className="w-full p-2 border border-gray-300 rounded-md min-h-[80px]"
                            />
                          ) : field.type === 'select' ? (
                            <Select
                              value={formData[field.id as keyof FormData] as string}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Оберіть ${field.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              value={formData[field.id as keyof FormData] as string}
                              onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                              placeholder={`Введіть ${field.label.toLowerCase()}`}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Створення...' : 'Створити контакт'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
