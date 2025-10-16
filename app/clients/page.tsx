"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Contact } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Users, 
  AlertCircle,
  AlertTriangle,
  MessageCircle
} from 'lucide-react'
import CreateContactSidebar from '@/components/contacts/create-contact-sidebar'
import ContactsTableExcel from '@/components/contacts/contacts-table-excel'
import CRMLayout from '@/components/layout/crm-layout'

export default function ClientsPage() {
  const router = useRouter()
  const { user, hasPermission, isHydrated } = useAuth()
  const { toast } = useToast()
  
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateContactForm, setShowCreateContactForm] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateContact, setDuplicateContact] = useState<any>(null)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canWrite = hasPermission('contacts', 'write')

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
      fetchContacts()
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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


  const handleEditContact = async (updateData: any) => {
    try {
      // Знаходимо контакт для отримання ID
      const contactToUpdate = contacts.find(c => c.id === editingContact?.id)
      if (!contactToUpdate) return

      const updatedContact = await api.contacts.update(contactToUpdate.id, updateData)
      setContacts(prev => prev.map(c => c.id === contactToUpdate.id ? updatedContact : c))
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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
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
                  fetchContacts()
                    .finally(() => setLoading(false))
                }}
                className="text-xs px-2 py-1 h-6"
              >
                Спробувати знову
              </Button>
            </div>
          </div>
        )}
        
        {/* Контент клієнтів */}
        <div className="space-y-2">
            {/* Компактний заголовок з кнопкою */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-800">Контакти ({contacts.length})</h3>
              </div>
              <Button 
                onClick={() => setShowCreateContactForm(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs px-3 py-1.5 h-7"
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
              editingContact={editingContact}
              setEditingContact={setEditingContact}
              currentManager={{
                id: user?.id || 0,
                name: user?.fullName || user?.username || 'Менеджер',
                branch: user?.branch || 'Філія'
              }}
            />
        </div>

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

        {/* Sidebar для створення контакту */}
        {showCreateContactForm && user && (
          <CreateContactSidebar
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

