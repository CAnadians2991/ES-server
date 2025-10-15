"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Deal, DealDetail, Candidate, DEAL_STAGES, DEAL_STATUSES, DEAL_CANDIDATE_ROLES } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  MapPin,
  Euro,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function DealsPage() {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const { toast } = useToast()
  
  const [deals, setDeals] = useState<Deal[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('deals')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const canWrite = hasPermission('candidates', 'write')

  useEffect(() => {
    fetchDeals()
    fetchCandidates()
  }, [])

  const fetchDeals = async () => {
    try {
      const response = await api.deals.getAll()
      setDeals(response.deals)
    } catch (error) {
      console.error('Error fetching deals:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити угоди',
        variant: 'destructive',
      })
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await api.candidates.getAll()
      setCandidates(response)
    } catch (error) {
      console.error('Error fetching candidates:', error)
    }
  }

  const handleCreateDeal = async (dealData: any) => {
    try {
      const newDeal = await api.deals.create(dealData)
      setDeals(prev => [newDeal, ...prev])
      setShowCreateForm(false)
      toast({
        title: 'Успішно',
        description: 'Угоду створено',
      })
    } catch (error) {
      console.error('Error creating deal:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося створити угоду',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateDealStage = async (dealId: number, newStage: string) => {
    try {
      await api.deals.update(dealId, { dealStage: newStage })
      setDeals(prev => prev.map(deal => 
        deal.id === dealId ? { ...deal, dealStage: newStage } : deal
      ))
      toast({
        title: 'Успішно',
        description: 'Стадію угоди оновлено',
      })
    } catch (error) {
      console.error('Error updating deal stage:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити стадію',
        variant: 'destructive',
      })
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Створена': return <Clock className="w-4 h-4 text-blue-500" />
      case 'Внесення даних': return <Edit className="w-4 h-4 text-yellow-500" />
      case 'Готово для адміна': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'Схвалено адміном': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Подано партнеру': return <AlertCircle className="w-4 h-4 text-purple-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Створена': return 'bg-blue-100 text-blue-800'
      case 'Внесення даних': return 'bg-yellow-100 text-yellow-800'
      case 'Готово для адміна': return 'bg-green-100 text-green-800'
      case 'Схвалено адміном': return 'bg-green-200 text-green-900'
      case 'Подано партнеру': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Угоди</h1>
              <p className="text-sm text-gray-500">
                Управління угодами з груповими кандидатами
              </p>
            </div>
            {canWrite && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Створити угоду
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deals">Мої угоди</TabsTrigger>
            <TabsTrigger value="candidates">Кандидати</TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-6">
            {/* Статистика угод */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">В роботі</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {deals.filter(d => ['Створена', 'Внесення даних'].includes(d.dealStage)).length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Готові</p>
                    <p className="text-2xl font-bold text-green-600">
                      {deals.filter(d => d.dealStage === 'Готово для адміна').length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">На розгляді</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {deals.filter(d => ['Схвалено адміном', 'Подано партнеру'].includes(d.dealStage)).length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center">
                  <Euro className="w-8 h-8 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Загальна сума</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {deals.reduce((sum, deal) => sum + deal.totalAmount, 0).toLocaleString()} грн
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Список угод */}
            <div className="space-y-4">
              {deals.map((deal) => (
                <Card key={deal.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{deal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(deal.dealStage)}`}>
                          {deal.dealStage}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {deal.vacancyCountry} • {deal.projectName}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {deal.candidates?.length || 0} кандидатів
                        </div>
                        <div className="flex items-center">
                          <Euro className="w-4 h-4 mr-2" />
                          {deal.totalAmount.toLocaleString()} {deal.dealCurrency}
                        </div>
                      </div>
                      
                      {deal.arrivalDate && (
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          Дата прибуття: {new Date(deal.arrivalDate).toLocaleDateString('uk-UA')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/deals/${deal.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Переглянути
                      </Button>
                      
                      {canWrite && deal.dealStage !== 'Завершена' && (
                        <Select
                          value={deal.dealStage}
                          onValueChange={(value) => handleUpdateDealStage(deal.id, value)}
                        >
                          <SelectTrigger className="w-40">
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
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {deals.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Немає угод</h3>
                    <p className="mb-4">Створіть першу угоду для початку роботи</p>
                    {canWrite && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Створити угоду
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            {/* Перехід до кандидатів */}
            <Card className="p-6">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Управління кандидатами</h3>
                <p className="text-gray-600 mb-4">
                  Перейдіть до модуля кандидатів для створення та редагування профілів
                </p>
                <Button onClick={() => router.push('/candidates')}>
                  Перейти до кандидатів
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Модальне вікно створення угоди */}
      {showCreateForm && (
        <CreateDealModal
          candidates={candidates}
          onClose={() => setShowCreateForm(false)}
          onCreate={handleCreateDeal}
        />
      )}
    </div>
  )
}

// Компонент для створення нової угоди
function CreateDealModal({ 
  candidates, 
  onClose, 
  onCreate 
}: { 
  candidates: Candidate[]
  onClose: () => void
  onCreate: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vacancyCountry: 'Польща',
    projectName: '',
    partnerNumber: '',
    workCity: '',
    workAddress: '',
    arrivalDate: '',
    transportType: 'Самостійно',
    contacts: '',
    totalAmount: 0,
    dealCurrency: 'грн',
    candidateIds: [] as number[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  const handleCandidateSelect = (candidateId: number) => {
    const newIds = [...formData.candidateIds]
    
    const index = newIds.indexOf(candidateId)
    if (index > -1) {
      newIds.splice(index, 1)
    } else {
      newIds.push(candidateId)
    }
    
    setFormData(prev => ({
      ...prev,
      candidateIds: newIds
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Створити нову угоду</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Назва угоди</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Наприклад: Робота в Польщі - Склад"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="projectName">Назва проекту</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Назва проекту"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="vacancyCountry">Країна</Label>
              <Select
                value={formData.vacancyCountry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, vacancyCountry: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Польща">Польща</SelectItem>
                  <SelectItem value="Німеччина">Німеччина</SelectItem>
                  <SelectItem value="Чехія">Чехія</SelectItem>
                  <SelectItem value="Латвія">Латвія</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="totalAmount">Сума угоди</Label>
              <Input
                id="totalAmount"
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Виберіть кандидатів (їдуть разом)</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2">
              {candidates.filter(c => !c.isInDeal).map((candidate) => (
                <div key={candidate.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.candidateIds.includes(candidate.id)}
                    onChange={() => handleCandidateSelect(candidate.id)}
                  />
                  <span className="text-sm">
                    {candidate.firstName} {candidate.lastName} ({candidate.phone})
                  </span>
                </div>
              ))}
            </div>
            {formData.candidateIds.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Вибрано {formData.candidateIds.length} кандидатів для спільної поїздки
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit">
              Створити угоду
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
