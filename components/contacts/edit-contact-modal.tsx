'use client'

import { useState, useEffect } from 'react'
import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ChevronDown, ChevronRight, User, Phone, MapPin, Briefcase, FileText, Calendar, CreditCard, Car, Home, Users } from 'lucide-react'
import { api } from '@/lib/api'

interface EditContactModalProps {
  contact: Contact
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Contact) => void
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
  candidateStatus: string
}

export default function EditContactModal({ contact, isOpen, onClose, onSave }: EditContactModalProps) {
  const [formData, setFormData] = useState<FormData>({
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
    notes: '',
    candidateStatus: 'Новий контакт'
  })

  const [loading, setLoading] = useState(false)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['basic']))

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        phone: contact.phone || '',
        age: contact.age || '',
        email: contact.email || '',
        viber: contact.viber || '',
        polishPhone: contact.polishPhone || '',
        passportSeries: contact.passportSeries || '',
        passportNumber: contact.passportNumber || '',
        passportValidFrom: contact.passportValidFrom || '',
        passportValidTo: contact.passportValidTo || '',
        birthPlace: contact.birthPlace || '',
        postalCode: contact.postalCode || '',
        registration: contact.registration || '',
        pesel: contact.pesel || '',
        candidateCountry: contact.candidateCountry || 'Україна',
        vacancyCountry: contact.vacancyCountry || 'Польща',
        projectName: contact.projectName || '',
        workExperience: contact.workExperience || '',
        languageSkills: contact.languageSkills || '',
        driverLicense: contact.driverLicense || '',
        maritalStatus: contact.maritalStatus || '',
        children: contact.children || '',
        notes: contact.notes || '',
        candidateStatus: contact.candidateStatus || 'Новий контакт'
      })
    }
  }, [contact])

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
      const updatedContact = await api.contacts.update(contact.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        age: Number(formData.age),
        email: formData.email,
        viber: formData.viber,
        polishPhone: formData.polishPhone,
        passportSeries: formData.passportSeries,
        passportNumber: formData.passportNumber,
        passportValidFrom: formData.passportValidFrom,
        passportValidTo: formData.passportValidTo,
        birthPlace: formData.birthPlace,
        postalCode: formData.postalCode,
        registration: formData.registration,
        pesel: formData.pesel,
        candidateCountry: formData.candidateCountry,
        vacancyCountry: formData.vacancyCountry,
        projectName: formData.projectName,
        workExperience: formData.workExperience,
        languageSkills: formData.languageSkills,
        driverLicense: formData.driverLicense,
        maritalStatus: formData.maritalStatus,
        children: formData.children,
        notes: formData.notes,
        candidateStatus: formData.candidateStatus
      })
      
      onSave(updatedContact)
      onClose()
    } catch (error) {
      console.error('Error updating contact:', error)
      alert('Помилка при оновленні контакту')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Редагування контакту: {contact.firstName} {contact.lastName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основна інформація */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => toggleBlock('basic')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Основна інформація</span>
              </div>
              {expandedBlocks.has('basic') ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedBlocks.has('basic') && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Ім'я *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Прізвище *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Вік *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => updateFormData('age', parseInt(e.target.value) || '')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="candidateStatus">Статус</Label>
                  <Select value={formData.candidateStatus} onValueChange={(value) => updateFormData('candidateStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Новий контакт">Новий контакт</SelectItem>
                      <SelectItem value="В угоді">В угоді</SelectItem>
                      <SelectItem value="Готовий до виїзду">Готовий до виїзду</SelectItem>
                      <SelectItem value="Працює">Працює</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Контактна інформація */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => toggleBlock('contact')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Контактна інформація</span>
              </div>
              {expandedBlocks.has('contact') ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedBlocks.has('contact') && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="viber">Viber</Label>
                    <Input
                      id="viber"
                      value={formData.viber}
                      onChange={(e) => updateFormData('viber', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="polishPhone">Польський телефон</Label>
                  <Input
                    id="polishPhone"
                    value={formData.polishPhone}
                    onChange={(e) => updateFormData('polishPhone', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Робота */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => toggleBlock('work')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Робота</span>
              </div>
              {expandedBlocks.has('work') ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedBlocks.has('work') && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="candidateCountry">Країна кандидата</Label>
                    <Input
                      id="candidateCountry"
                      value={formData.candidateCountry}
                      onChange={(e) => updateFormData('candidateCountry', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vacancyCountry">Країна роботи</Label>
                    <Input
                      id="vacancyCountry"
                      value={formData.vacancyCountry}
                      onChange={(e) => updateFormData('vacancyCountry', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="projectName">Назва проекту</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => updateFormData('projectName', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workExperience">Досвід роботи</Label>
                    <Input
                      id="workExperience"
                      value={formData.workExperience}
                      onChange={(e) => updateFormData('workExperience', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="languageSkills">Мовні навички</Label>
                    <Input
                      id="languageSkills"
                      value={formData.languageSkills}
                      onChange={(e) => updateFormData('languageSkills', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="driverLicense">Водійські права</Label>
                  <Input
                    id="driverLicense"
                    value={formData.driverLicense}
                    onChange={(e) => updateFormData('driverLicense', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Додаткова інформація */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => toggleBlock('additional')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">Додаткова інформація</span>
              </div>
              {expandedBlocks.has('additional') ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedBlocks.has('additional') && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maritalStatus">Сімейний стан</Label>
                    <Input
                      id="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={(e) => updateFormData('maritalStatus', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="children">Діти</Label>
                    <Input
                      id="children"
                      value={formData.children}
                      onChange={(e) => updateFormData('children', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Примітки</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
