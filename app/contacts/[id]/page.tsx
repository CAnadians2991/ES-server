"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Contact } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Edit, Phone, Mail, User, Calendar, MapPin } from 'lucide-react'
import EditContactModal from '@/components/contacts/edit-contact-modal'

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const { toast } = useToast()
  
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const contactId = parseInt(params.id as string)

  useEffect(() => {
    if (contactId) {
      fetchContact()
    }
  }, [contactId])

  const fetchContact = async () => {
    try {
      setLoading(true)
      const response = await api.contacts.getById(contactId)
      setContact(response)
    } catch (error) {
      console.error('Error fetching contact:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити контакт',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async (updatedContact: Contact) => {
    try {
      await api.contacts.update(contactId, updatedContact)
      setContact(updatedContact)
      setEditing(false)
      toast({
        title: 'Успішно',
        description: 'Контакт оновлено',
      })
    } catch (error) {
      console.error('Error updating contact:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити контакт',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Працює':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'В угоді':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Готовий до виїзду':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження контакту...</p>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Контакт не знайдено</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h1>
                <p className="text-gray-600">
                  Контакт #{contact.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(contact.candidateStatus || 'Новий контакт')}`}>
                {contact.candidateStatus || 'Новий контакт'}
              </span>
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Редагувати
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Основна інформація</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ім'я</label>
                  <p className="text-sm text-gray-900">{contact.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Прізвище</label>
                  <p className="text-sm text-gray-900">{contact.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Телефон</label>
                  <p className="text-sm text-gray-900">{contact.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Вік</label>
                  <p className="text-sm text-gray-900">{contact.age} років</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Країна кандидата</label>
                  <p className="text-sm text-gray-900">{contact.candidateCountry || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Країна вакансії</label>
                  <p className="text-sm text-gray-900">{contact.vacancyCountry || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Проект</label>
                  <p className="text-sm text-gray-900">{contact.projectName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Статус</label>
                  <p className="text-sm text-gray-900">{contact.candidateStatus || 'Новий контакт'}</p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {contact.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Нотатки</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{contact.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Метадані</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Менеджер</label>
                  <p className="text-sm text-gray-900">{contact.managerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Філія</label>
                  <p className="text-sm text-gray-900">{contact.branch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Створено</label>
                  <p className="text-sm text-gray-900">{new Date(contact.createdAt).toLocaleDateString('uk-UA')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Оновлено</label>
                  <p className="text-sm text-gray-900">{new Date(contact.updatedAt).toLocaleDateString('uk-UA')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Modal */}
        {editing && contact && (
          <EditContactModal
            contact={contact}
            isOpen={editing}
            onClose={() => setEditing(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}