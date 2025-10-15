"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Deal, DealDetail, Contact, DEAL_STAGES, DEAL_STATUSES } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Eye, 
  Edit, 
  Users, 
  Calendar,
  MapPin,
  Euro,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowDown,
  Filter,
  Search,
  Trash2,
  AlertTriangle,
  MessageCircle,
  ArrowLeft
} from 'lucide-react'
import CreateContactModal from '@/components/contacts/create-contact-modal'
import ContactsTableExcel from '@/components/contacts/contacts-table-excel'
import CRMLayout from '@/components/layout/crm-layout'

export default function ClientsPage() {
  const router = useRouter()
  const { user, hasPermission, isHydrated } = useAuth()
  const { toast } = useToast()
  
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('contacts')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCreateContactForm, setShowCreateContactForm] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateContact, setDuplicateContact] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const canWrite = hasPermission('candidates', 'write')

  const fetchDeals = async () => {
    try {
      setError(null)
      const response = await api.deals.getAll()
      setDeals(response.deals || [])
    } catch (error) {
      console.error('Error fetching deals:', error)
      setDeals([])
      setError('Не вдалося завантажити угоди')
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити угоди',
        variant: 'destructive',
      })
    }
  }

  const fetchContacts = async () => {
    try {
      setError(null)
      const response = await api.contacts.getAll()
      // API вже фільтрує контакти по менеджеру
      setContacts(response.contacts || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts([])
      setError('Не вдалося завантажити контакти')
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити контакти',
        variant: 'destructive',
      })
    }
  }


  useEffect(() => {
    if (isHydrated) {
      Promise.all([fetchDeals(), fetchContacts()])
        .catch((error) => {
          console.error('Error loading data:', error)
          setError('Не вдалося завантажити дані')
        })
        .finally(() => setLoading(false))
    }
  }, [isHydrated])

  if (!isHydrated || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const handleCreateContact = async (contactData: any) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(contactData)
      })

      if (response.status === 409) {
        const errorData = await response.json()
        // Показати модальне вікно з дублем
        setDuplicateContact(errorData.existingContact)
        setShowDuplicateModal(true)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to create contact')
      }

      const newContact = await response.json()
      setContacts(prev => [newContact, ...prev])
      setShowCreateContactForm(false)
      toast({
        title: 'Успішно',
        description: 'Контакт створено',
      })
    } catch (error) {
      console.error('Error creating contact:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося створити контакт',
        variant: 'destructive',
      })
    }
  }

  const handleCreateDeal = async (dealData: any) => {
    try {
      const newDeal = await api.deals.create({
        ...dealData,
        contactIds: dealData.contactIds
      })
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

  const handleEditContact = async (contact: Contact) => {
    try {
      const updatedContact = await api.contacts.update(contact.id, contact)
      setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c))
      toast({
        title: 'Успіх',
        description: 'Контакт оновлено успішно',
      })
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити контакт',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей контакт?')) {
      return
    }

    try {
      await api.contacts.delete(contactId)
      setContacts(prev => prev.filter(c => c.id !== contactId))
      toast({
        title: 'Успіх',
        description: 'Контакт видалено успішно',
      })
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити контакт',
        variant: 'destructive',
      })
    }
  }

  const handleViewContact = (contact: Contact) => {
    router.push(`/contacts/${contact.id}`)
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
      case 'Створена': return <Clock className="w-5 h-5 text-blue-500" />
      case 'Внесення даних': return <Edit className="w-5 h-5 text-yellow-500" />
      case 'Готово для адміна': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Схвалено адміном': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'Подано партнеру': return <AlertCircle className="w-5 h-5 text-purple-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Створена': return 'bg-blue-50 border-blue-200'
      case 'Внесення даних': return 'bg-yellow-50 border-yellow-200'
      case 'Готово для адміна': return 'bg-green-50 border-green-200'
      case 'Схвалено адміном': return 'bg-green-100 border-green-300'
      case 'Подано партнеру': return 'bg-purple-50 border-purple-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getStageTextColor = (stage: string) => {
    switch (stage) {
      case 'Створена': return 'text-blue-700'
      case 'Внесення даних': return 'text-yellow-700'
      case 'Готово для адміна': return 'text-green-700'
      case 'Схвалено адміном': return 'text-green-800'
      case 'Подано партнеру': return 'text-purple-700'
      default: return 'text-gray-700'
    }
  }

  // Фільтрація угод
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || deal.dealStage === statusFilter
    return matchesSearch && matchesStatus
  })

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
    <CRMLayout>
      <div className="p-3">
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setLoading(true)
                  Promise.all([fetchDeals(), fetchContacts()])
                    .finally(() => setLoading(false))
                }}
                className="text-xs px-2 py-1 h-6"
              >
                Спробувати знову
              </Button>
            </div>
          </div>
        )}
        
        {/* Компактний перемикач табів */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-1 flex border border-green-200">
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === 'deals'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Угоди
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === 'contacts'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Клієнти
            </button>
          </div>
        </div>

        {/* Контент угод */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            {/* Статистика угод */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">В роботі</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {deals.filter(d => ['Створена', 'Внесення даних'].includes(d.dealStage)).length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Готові</p>
                    <p className="text-2xl font-bold text-green-700">
                      {deals.filter(d => d.dealStage === 'Готово для адміна').length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-600">На розгляді</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {deals.filter(d => ['Схвалено адміном', 'Подано партнеру'].includes(d.dealStage)).length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="flex items-center">
                  <Euro className="w-8 h-8 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Загальна сума</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {deals.reduce((sum, deal) => sum + deal.totalAmount, 0).toLocaleString()} грн
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Фільтри та пошук */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Пошук угод..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Фільтр по стадії" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі стадії</SelectItem>
                      {DEAL_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Сітка угод як квадратики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => (
                <Card key={deal.id} className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${getStageColor(deal.dealStage)}`}>
                  <div className="space-y-4">
                    {/* Заголовок та іконка стадії */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{deal.title}</h3>
                        <p className="text-sm text-gray-600">{deal.projectName}</p>
                      </div>
                      <div className="ml-4">
                        {getStageIcon(deal.dealStage)}
                      </div>
                    </div>
                    
                    {/* Стадія */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageTextColor(deal.dealStage)} bg-white/50`}>
                        {deal.dealStage}
                      </span>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {deal.contacts?.length || 0}
                      </div>
                    </div>
                    
                    {/* Деталі */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {deal.vacancyCountry}
                      </div>
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 mr-2" />
                        {deal.totalAmount.toLocaleString()} {deal.dealCurrency}
                      </div>
                      {deal.arrivalDate && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(deal.arrivalDate).toLocaleDateString('uk-UA')}
                        </div>
                      )}
                    </div>
                    
                    {/* Дії */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/30">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/deals/${deal.id}`)}
                        className="bg-white/50 hover:bg-white/70"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Переглянути
                      </Button>
                      
                      {canWrite && deal.dealStage !== 'Завершена' && (
                        <Select
                          value={deal.dealStage}
                          onValueChange={(value) => handleUpdateDealStage(deal.id, value)}
                        >
                          <SelectTrigger className="w-32 bg-white/50">
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
              
              {filteredDeals.length === 0 && (
                <div className="col-span-full">
                  <Card className="p-12 text-center">
                    <div className="text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Немає угод</h3>
                      <p className="mb-4">Створіть першу угоду для початку роботи</p>
                      {canWrite && (
                        <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Створити угоду
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Контент клієнтів */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            {/* Компактний заголовок з кнопкою */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-800">Контакти ({contacts.length})</h3>
              </div>
              <Button 
                onClick={() => setShowCreateContactForm(true)}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs px-3 py-1.5 h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Додати
              </Button>
            </div>
            
            <ContactsTableExcel
              contacts={contacts}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
              onView={handleViewContact}
              loading={loading}
            />
          </div>
        )}

        {/* Модальне вікно дублів */}
        {showDuplicateModal && duplicateContact && (
          <DuplicateContactModal
            isOpen={showDuplicateModal}
            onClose={() => setShowDuplicateModal(false)}
            duplicateContact={duplicateContact}
            onCreateAnyway={() => {
              // Логіка створення контакту все одно
              setShowDuplicateModal(false)
              setShowCreateContactForm(false)
            }}
            onRequestTransfer={() => {
              // Логіка запиту на передачу
              setShowDuplicateModal(false)
              setShowCreateContactForm(false)
            }}
          />
        )}

        {/* Модальне вікно створення контакту */}
        {showCreateContactForm && user && (
          <CreateContactModal
            isOpen={showCreateContactForm}
            onClose={() => setShowCreateContactForm(false)}
            onSave={handleCreateContact}
            currentManager={{
              id: user?.id || 0,
              name: user?.fullName || user?.username || 'Менеджер',
              branch: user?.branch || 'ЦО'
            }}
          />
        )}
      </div>
    </CRMLayout>
  )
}

// Компонент для обробки дублів контактів
function DuplicateContactModal({ 
  isOpen, 
  onClose, 
  duplicateContact,
  onCreateAnyway,
  onRequestTransfer
}: { 
  isOpen: boolean
  onClose: () => void
  duplicateContact: any
  onCreateAnyway: () => void
  onRequestTransfer: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Контакт вже існує</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Контакт з таким телефоном вже зареєстрований в системі:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">
                  {duplicateContact.firstName[0]}{duplicateContact.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{duplicateContact.firstName} {duplicateContact.lastName}</h3>
                <p className="text-sm text-gray-600">{duplicateContact.phone}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Вік:</strong> {duplicateContact.age} років</p>
              <p><strong>Менеджер:</strong> {duplicateContact.managerName}</p>
              <p><strong>Філія:</strong> {duplicateContact.branch}</p>
              <p><strong>Створено:</strong> {new Date(duplicateContact.createdAt).toLocaleDateString('uk-UA')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Button 
            onClick={onRequestTransfer}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Запросити передачу контакту
          </Button>
          
          <Button 
            onClick={onCreateAnyway}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Створити все одно
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Скасувати
          </Button>
        </div>
      </div>
    </div>
  )
}

