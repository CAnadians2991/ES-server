'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Contact } from '@/types'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Upload,
  Eye,
  Download,
  MessageCircle,
  PhoneCall,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import EditContactModal from '@/components/contacts/edit-contact-modal'
import FileUpload from '@/components/ui/file-upload'

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [files, setFiles] = useState<Array<{
    id: string
    name: string
    type: string
    size: number
    url?: string
  }>>([])

  const contactId = parseInt(params.id as string)

  useEffect(() => {
    if (contactId) {
      fetchContact()
    }
  }, [contactId])

  const fetchContact = async () => {
    try {
      setLoading(true)
      const contact = await api.contacts.getById(contactId)
      setContact(contact)
    } catch (error) {
      console.error('Error fetching contact:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити контакт',
        variant: 'destructive',
      })
      router.push('/clients')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleSave = async (updatedContact: Contact) => {
    try {
      setContact(updatedContact)
      setShowEditModal(false)
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

  const handleFileUpload = async (file: File) => {
    try {
      // Тут буде логіка завантаження файлу на сервер
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file) // Тимчасовий URL для демонстрації
      }
      
      setFiles(prev => [...prev, newFile])
      
      toast({
        title: 'Успіх',
        description: 'Файл завантажено успішно',
      })
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити файл',
        variant: 'destructive',
      })
    }
  }

  const handleFileRemove = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
    toast({
      title: 'Успіх',
      description: 'Файл видалено',
    })
  }

  const getManagerInitials = (managerName: string) => {
    if (!managerName) return 'M'
    const names = managerName.split(' ')
    return names.map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Працює': return 'bg-green-100 text-green-800 border-green-200'
      case 'Готовий до виїзду': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'В угоді': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Новий контакт': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Контакт не знайдено</h3>
        <p className="mt-1 text-sm text-gray-500">Спробуйте повернутися до списку контактів</p>
        <Button onClick={() => router.push('/clients')} className="mt-4">
          Повернутися до списку
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/clients')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h1>
                <p className="text-sm text-gray-500">
                  Контакт #{contact.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(contact.candidateStatus)}`}>
                {contact.candidateStatus}
              </span>
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Редагувати
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Contact Information */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">Загальне</TabsTrigger>
                <TabsTrigger value="deals">Угоди</TabsTrigger>
                <TabsTrigger value="bonuses">Бонуси</TabsTrigger>
                <TabsTrigger value="connections">Зв'язки</TabsTrigger>
                <TabsTrigger value="history">Історія</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                {/* About Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      ПРО КОНТАКТ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Responsible Manager */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Відповідальний менеджер</h4>
                        <Button variant="outline" size="sm">
                          змінити
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {getManagerInitials(contact.managerName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{contact.managerName}</p>
                          <p className="text-sm text-gray-600">{contact.branch}</p>
                          <p className="text-xs text-gray-500">
                            Створено: {new Date(contact.createdAt).toLocaleDateString('uk-UA')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Контактні дані</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{contact.phone}</p>
                            <p className="text-xs text-gray-500">Робочий</p>
                          </div>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{contact.email}</p>
                              <p className="text-xs text-gray-500">Робочий</p>
                            </div>
                          </div>
                        )}
                        {contact.viber && (
                          <div className="flex items-center gap-3">
                            <MessageCircle className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{contact.viber}</p>
                              <p className="text-xs text-gray-500">Viber</p>
                            </div>
                          </div>
                        )}
                        {contact.polishPhone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{contact.polishPhone}</p>
                              <p className="text-xs text-gray-500">Польський номер</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Passport Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Перша сторінка закордонного паспорту</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
                          Плитка
                        </Button>
                        <Button variant="outline" size="sm">
                          Список
                        </Button>
                        <Button variant="outline" size="sm">
                          За шириною
                        </Button>
                      </div>
                      <FileUpload
                        onFileUpload={handleFileUpload}
                        onFileRemove={handleFileRemove}
                        files={files}
                        maxSize={10}
                        acceptedTypes={['image/*']}
                      />
                    </div>

                    {/* Personal Data */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Особисті дані</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Прізвище</label>
                          <p className="text-sm text-gray-900">{contact.lastName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Ім'я</label>
                          <p className="text-sm text-gray-900">{contact.firstName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Дата народження</label>
                          <p className="text-sm text-gray-900">15.08.1984</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Вік</label>
                          <p className="text-sm text-gray-900">{contact.age} років</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Серія, номер паспорта</label>
                          <p className="text-sm text-gray-900">{contact.passportSeries} {contact.passportNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Термін дії паспорта</label>
                          <p className="text-sm text-gray-900">
                            {contact.passportValidFrom} - {contact.passportValidTo}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Місто народження</label>
                          <p className="text-sm text-gray-900">{contact.birthPlace}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Прописка</label>
                          <p className="text-sm text-gray-900">{contact.registration}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Цивільний стан</label>
                          <p className="text-sm text-gray-900">{contact.maritalStatus}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Діти</label>
                          <p className="text-sm text-gray-900">{contact.children}</p>
                        </div>
                      </div>
                    </div>

                    {/* Work Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Робота</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Країна кандидата</label>
                          <p className="text-sm text-gray-900">{contact.candidateCountry}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Країна роботи</label>
                          <p className="text-sm text-gray-900">{contact.vacancyCountry}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700">Назва проекту</label>
                          <p className="text-sm text-gray-900">{contact.projectName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Досвід роботи</label>
                          <p className="text-sm text-gray-900">{contact.workExperience}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Мовні навички</label>
                          <p className="text-sm text-gray-900">{contact.languageSkills}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Водійські права</label>
                          <p className="text-sm text-gray-900">{contact.driverLicense}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {contact.notes && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Примітки</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-900">{contact.notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs placeholder */}
              <TabsContent value="deals">
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Угоди</h3>
                    <p className="text-gray-500">Тут будуть відображатися угоди цього контакту</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bonuses">
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Нараховані бонуси</h3>
                    <p className="text-gray-500">Тут будуть відображатися бонуси цього контакту</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections">
                <Card>
                  <CardContent className="p-6 text-center">
                    <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Зв'язки</h3>
                    <p className="text-gray-500">Тут будуть відображатися зв'язки цього контакту</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Історія</h3>
                    <p className="text-gray-500">Тут буде відображатися історія активностей</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Activity Feed */}
          <div className="space-y-6">
            {/* Communication Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Комунікація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Коментар
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Дзвінок
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Справу
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Завдання
                </Button>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Активність</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Поки що немає активностей</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && contact && (
        <EditContactModal
          contact={contact}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
