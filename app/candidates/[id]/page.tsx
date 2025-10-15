"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CandidateDetail, Activity, Document, DEAL_STAGES, DEAL_STATUSES, TRANSPORT_TYPES } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CandidateEditModal } from '@/components/candidates/candidate-edit-modal'

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const { toast } = useToast()
  
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  const candidateId = parseInt(params.id as string)

  const canWrite = hasPermission('candidates', 'write')

  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetail()
    }
  }, [candidateId])

  const fetchCandidateDetail = async () => {
    try {
      setLoading(true)
      const response = await api.candidates.getDetail(candidateId)
      setCandidate(response)
      setActivities(response.activities || [])
      setDocuments(response.documents || [])
    } catch (error) {
      console.error('Error fetching candidate detail:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити дані кандидата',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCandidate = async (field: string, value: any) => {
    if (!candidate || !canWrite) return

    try {
      const updatedCandidate = await api.candidates.update(candidateId, {
        [field]: value
      })
      
      setCandidate(updatedCandidate)
      
      toast({
        title: 'Успішно',
        description: 'Дані кандидата оновлено',
      })
    } catch (error) {
      console.error('Error updating candidate:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити дані',
        variant: 'destructive',
      })
    }
  }

  const handleAddActivity = async (type: string, title: string, description?: string) => {
    try {
      const newActivity = await api.candidates.addActivity(candidateId, {
        type,
        title,
        description
      })
      
      setActivities(prev => [newActivity, ...prev])
      
      toast({
        title: 'Успішно',
        description: 'Активність додано',
      })
    } catch (error) {
      console.error('Error adding activity:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося додати активність',
        variant: 'destructive',
      })
    }
  }

  const handleUploadDocument = async (file: File, type: string, title: string) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('title', title)

      const newDocument = await api.candidates.uploadDocument(candidateId, formData)
      
      setDocuments(prev => [newDocument, ...prev])
      
      toast({
        title: 'Успішно',
        description: 'Документ завантажено',
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити документ',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Кандидат не знайдено</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Повернутися назад
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {candidate.firstName} {candidate.lastName}
                </h1>
                <p className="text-sm text-gray-500">
                  ID: {candidate.id.toString().padStart(6, '0')} • {candidate.dealStage}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canWrite && (
                <Button
                  onClick={() => setShowEditModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редагувати
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${candidate.phone}`)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Дзвінок
              </Button>
              {candidate.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`mailto:${candidate.email}`)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ліва панель - Деталі угоди */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Загальне</TabsTrigger>
                <TabsTrigger value="products">Товари</TabsTrigger>
                <TabsTrigger value="documents">Документи</TabsTrigger>
                <TabsTrigger value="history">Історія</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                {/* Про угоду */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">ПРО УГОДУ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Відповідальний</Label>
                      <div className="flex items-center mt-1">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{candidate.responsible}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Сума та валюта</Label>
                      <div className="flex items-center mt-1">
                        <Euro className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium">
                          {candidate.dealAmount || 0} {candidate.dealCurrency || 'грн'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Клієнт</Label>
                      <div className="mt-1">
                        <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-3 h-3 mr-1" />
                          {candidate.phone}
                        </div>
                        {candidate.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-3 h-3 mr-1" />
                            {candidate.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Дата реєстрації</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('uk-UA') : '-'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Країна знаходження</Label>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{candidate.candidateCountry}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Країна вакансії</Label>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{candidate.vacancyCountry}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Партнер №</Label>
                      <span className="text-sm">{candidate.partnerNumber || 'не заповнено'}</span>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Назва вакансії</Label>
                      <span className="text-sm">{candidate.projectName || 'не заповнено'}</span>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Дата заїзду</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {candidate.arrivalDate ? new Date(candidate.arrivalDate).toLocaleDateString('uk-UA') : 'не заповнено'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Місто роботи</Label>
                      <span className="text-sm">{candidate.workCity || 'не заповнено'}</span>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Доїзд</Label>
                      <div className="flex items-center mt-1">
                        <Car className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{candidate.transportType || 'не заповнено'}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Контакти</Label>
                      <span className="text-sm">{candidate.contacts || 'не заповнено'}</span>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Стадія</Label>
                      {canWrite ? (
                        <Select
                          value={candidate.dealStage || 'Внесення даних'}
                          onValueChange={(value) => handleUpdateCandidate('dealStage', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEAL_STAGES.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {stage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{candidate.dealStage || 'Внесення даних'}</span>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Дата завершення</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {candidate.completionDate ? new Date(candidate.completionDate).toLocaleDateString('uk-UA') : 'не заповнено'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">ТОВАРИ</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Вид оплати</Label>
                      <span className="text-sm ml-2">Платно</span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Товари</Label>
                      <div className="mt-1">
                        <span className="text-sm">1 поз. на суму {candidate.dealAmount || 0} {candidate.dealCurrency || 'грн'}</span>
                        <Button variant="outline" size="sm" className="ml-2">
                          змінити
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">ДОКУМЕНТИ</h3>
                    {canWrite && (
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Завантажити
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(doc.uploadedAt).toLocaleDateString('uk-UA')}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Переглянути
                        </Button>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Документи не завантажені
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">ІСТОРІЯ ЗМІН</h3>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {new Date(activity.createdAt).toLocaleDateString('uk-UA')}
                              </span>
                              {activity.isPinned && (
                                <Pin className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                          {activity.userName && (
                            <p className="text-xs text-gray-400 mt-1">— {activity.userName}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Активності не знайдено
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Права панель - Стрічка активності */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">СТРІЧКА АКТИВНОСТІ</h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Справу
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Коментар
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Онлайн-запис
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Завдання
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input placeholder="Що потрібно зробити" />
                  <Button className="w-full">
                    Обговорити в чаті
                  </Button>
                </div>

                <div className="text-center">
                  <Button variant="outline" className="w-full">
                    Створіть справу
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Заплануйте наступну дію в угоді, щоб не забути про клієнта
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">БІЗНЕС-ПРОЦЕСИ</h3>
                <Button size="sm" variant="outline">
                  Бізнес-процеси
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Поточний процес</div>
                  <div className="text-gray-600">{candidate.dealStage}</div>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium">Статус угоди</div>
                  <div className="text-gray-600">{candidate.dealStatus}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Поп-ап редагування кандидата */}
      {candidate && (
        <CandidateEditModal
          candidate={candidate}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedCandidate) => {
            setCandidate(updatedCandidate)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}
