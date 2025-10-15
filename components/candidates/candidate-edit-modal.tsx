"use client"

import { useState, useEffect } from 'react'
import { CandidateDetail, Activity, Document, DEAL_STAGES, DEAL_STATUSES, TRANSPORT_TYPES, EDUCATION_LEVELS, FAMILY_STATUSES, LANGUAGE_LEVELS } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  Upload, 
  FileText, 
  Pin, 
  Calendar,
  MapPin,
  Car,
  User,
  Euro,
  Edit,
  Save,
  X,
  Plus
} from 'lucide-react'

interface CandidateEditModalProps {
  candidate: CandidateDetail
  isOpen: boolean
  onClose: () => void
  onSave: (updatedCandidate: CandidateDetail) => void
}

export function CandidateEditModal({ candidate, isOpen, onClose, onSave }: CandidateEditModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<CandidateDetail>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (candidate) {
      setFormData({
        ...candidate,
        arrivalDate: candidate.arrivalDate ? new Date(candidate.arrivalDate).toISOString().split('T')[0] : '',
        passportExpiry: candidate.passportExpiry ? new Date(candidate.passportExpiry).toISOString().split('T')[0] : '',
        completionDate: candidate.completionDate ? new Date(candidate.completionDate).toISOString().split('T')[0] : '',
      })
    }
  }, [candidate])

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Підготовка даних для відправки
      const updateData = {
        ...formData,
        arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate) : null,
        passportExpiry: formData.passportExpiry ? new Date(formData.passportExpiry) : null,
        completionDate: formData.completionDate ? new Date(formData.completionDate) : null,
      }

      const updatedCandidate = await api.candidates.update(candidate.id, updateData)
      onSave({ ...candidate, ...updateData })
      toast({
        title: 'Успішно',
        description: 'Дані кандидата оновлено',
      })
      onClose()
    } catch (error) {
      console.error('Error updating candidate:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити дані кандидата',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Редагування кандидата: {candidate.firstName} {candidate.lastName}</h2>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Особисті дані</TabsTrigger>
              <TabsTrigger value="documents">Документи</TabsTrigger>
              <TabsTrigger value="work">Робота</TabsTrigger>
              <TabsTrigger value="deal">Угода</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Основна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Ім'я</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Прізвище</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Вік</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidateCountry">Країна кандидата</Label>
                      <Select
                        value={formData.candidateCountry || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, candidateCountry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть країну" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Україна">Україна</SelectItem>
                          <SelectItem value="Білорусь">Білорусь</SelectItem>
                          <SelectItem value="Грузія">Грузія</SelectItem>
                          <SelectItem value="Молдова">Молдова</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Документи
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="passportNumber">Номер паспорта</Label>
                      <Input
                        id="passportNumber"
                        value={formData.passportNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passportExpiry">Термін дії паспорта</Label>
                      <Input
                        id="passportExpiry"
                        type="date"
                        value={formData.passportExpiry instanceof Date ? formData.passportExpiry.toISOString().split('T')[0] : formData.passportExpiry || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, passportExpiry: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Освіта та досвід
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="education">Освіта</Label>
                      <Select
                        value={formData.education || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть освіту" />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATION_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="workExperience">Досвід роботи</Label>
                      <Textarea
                        id="workExperience"
                        value={formData.workExperience || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, workExperience: e.target.value }))}
                        placeholder="Опишіть досвід роботи"
                      />
                    </div>
                    <div>
                      <Label htmlFor="languageSkills">Мовні навички</Label>
                      <Textarea
                        id="languageSkills"
                        value={formData.languageSkills || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, languageSkills: e.target.value }))}
                        placeholder="Опишіть мовні навички"
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyStatus">Сімейний стан</Label>
                      <Select
                        value={formData.familyStatus || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, familyStatus: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть сімейний стан" />
                        </SelectTrigger>
                        <SelectContent>
                          {FAMILY_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="children">Кількість дітей</Label>
                      <Input
                        id="children"
                        type="number"
                        value={formData.children || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Документи кандидата
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input type="file" className="flex-1" />
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Завантажити
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Підтримувані формати: PDF, JPG, PNG, DOC, DOCX
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Робота
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vacancyCountry">Країна вакансії</Label>
                      <Select
                        value={formData.vacancyCountry || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, vacancyCountry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть країну" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Польща">Польща</SelectItem>
                          <SelectItem value="Німеччина">Німеччина</SelectItem>
                          <SelectItem value="Чехія">Чехія</SelectItem>
                          <SelectItem value="Латвія">Латвія</SelectItem>
                          <SelectItem value="Литва">Литва</SelectItem>
                          <SelectItem value="Румунія">Румунія</SelectItem>
                          <SelectItem value="Угорщина">Угорщина</SelectItem>
                          <SelectItem value="Греція">Греція</SelectItem>
                          <SelectItem value="Австрія">Австрія</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="projectName">Назва проекту</Label>
                      <Input
                        id="projectName"
                        value={formData.projectName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="partnerNumber">Номер партнера</Label>
                      <Input
                        id="partnerNumber"
                        value={formData.partnerNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, partnerNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arrivalDate">Дата прибуття</Label>
                      <Input
                        id="arrivalDate"
                        type="date"
                        value={formData.arrivalDate instanceof Date ? formData.arrivalDate.toISOString().split('T')[0] : formData.arrivalDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workCity">Місто роботи</Label>
                      <Input
                        id="workCity"
                        value={formData.workCity || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, workCity: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workAddress">Адреса роботи</Label>
                      <Input
                        id="workAddress"
                        value={formData.workAddress || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, workAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="transportType">Тип транспорту</Label>
                      <Select
                        value={formData.transportType || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, transportType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть тип транспорту" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSPORT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="contacts">Контакти на місці</Label>
                      <Textarea
                        id="contacts"
                        value={formData.contacts || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, contacts: e.target.value }))}
                        placeholder="Контактна інформація на місці роботи"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Фінанси
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentAmount">Сума оплати</Label>
                      <Input
                        id="paymentAmount"
                        type="number"
                        value={formData.paymentAmount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentStatus">Статус оплати</Label>
                      <Select
                        value={formData.paymentStatus || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть статус оплати" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Очікується">Очікується</SelectItem>
                          <SelectItem value="Отримано">Отримано</SelectItem>
                          <SelectItem value="Прострочено">Прострочено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="recipientType">Тип отримувача</Label>
                      <Input
                        id="recipientType"
                        value={formData.recipientType || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidateStatus">Статус кандидата</Label>
                      <Select
                        value={formData.candidateStatus || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, candidateStatus: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Зареєстровано">Зареєстровано</SelectItem>
                          <SelectItem value="Готовий до виїзду">Готовий до виїзду</SelectItem>
                          <SelectItem value="В дорозі">В дорозі</SelectItem>
                          <SelectItem value="Прибув">Прибув</SelectItem>
                          <SelectItem value="Працює">Працює</SelectItem>
                          <SelectItem value="Завершив роботу">Завершив роботу</SelectItem>
                          <SelectItem value="Не доїхав">Не доїхав</SelectItem>
                          <SelectItem value="Очікується">Очікується</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deal" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Угода
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dealStage">Стадія угоди</Label>
                      <Select
                        value={formData.dealStage || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, dealStage: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть стадію" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEAL_STAGES.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dealStatus">Статус угоди</Label>
                      <Select
                        value={formData.dealStatus || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, dealStatus: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть статус" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEAL_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dealAmount">Сума угоди</Label>
                      <Input
                        id="dealAmount"
                        type="number"
                        value={formData.dealAmount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dealAmount: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dealCurrency">Валюта угоди</Label>
                      <Select
                        value={formData.dealCurrency || 'грн'}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, dealCurrency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="грн">грн</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="completionDate">Дата завершення угоди</Label>
                      <Input
                        id="completionDate"
                        type="date"
                        value={formData.completionDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Коментарі
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.comment || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Додаткові коментарі про кандидата"
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Зберегти зміни
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
