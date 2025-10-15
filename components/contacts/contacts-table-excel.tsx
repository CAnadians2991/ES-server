'use client'

import { useState } from 'react'
import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar
} from 'lucide-react'
import EditContactModal from './edit-contact-modal'

interface ContactsTableExcelProps {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
  onDelete: (contactId: number) => void
  onView: (contact: Contact) => void
  loading?: boolean
}

export default function ContactsTableExcel({ 
  contacts, 
  onEdit, 
  onDelete, 
  onView, 
  loading = false 
}: ContactsTableExcelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  // Фільтрація та сортування
  const filteredContacts = contacts
    .filter(contact => {
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-green-200 shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Завантаження контактів...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-green-200 shadow-sm">
        <div className="p-2 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Контакти ({filteredContacts.length})</span>
            </div>
            
            {/* Компактні фільтри */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Пошук..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-6 w-32 h-6 text-xs border-green-200 focus:border-green-400"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-20 h-6 text-xs border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Всі" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі</SelectItem>
                  <SelectItem value="Новий контакт">Новий</SelectItem>
                  <SelectItem value="В угоді">В угоді</SelectItem>
                  <SelectItem value="Готовий до виїзду">Готовий</SelectItem>
                  <SelectItem value="Працює">Працює</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Компактна таблиця */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <tr>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Контакт</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Телефон</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Вік</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Проект</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Email</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Країна</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Статус</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Менеджер</th>
                <th className="px-2 py-2 text-left font-medium text-gray-600">Створено</th>
                <th className="px-2 py-2 text-center font-medium text-gray-600">Дії</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-green-50/50">
                  <td className="px-2 py-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <User className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-xs">
                          {contact.firstName} {contact.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-gray-900 text-xs">{contact.phone}</td>
                  <td className="px-2 py-2 text-gray-900 text-xs">{contact.age}</td>
                  <td className="px-2 py-2 text-gray-900 text-xs">{contact.project || '-'}</td>
                  <td className="px-2 py-2 text-gray-900 text-xs">{contact.email || '-'}</td>
                  <td className="px-2 py-2 text-gray-900 text-xs">{contact.candidateCountry || '-'}</td>
                  <td className="px-2 py-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      contact.status === 'Працює' ? 'bg-green-100 text-green-800' :
                      contact.status === 'В угоді' ? 'bg-blue-100 text-blue-800' :
                      contact.status === 'Готовий до виїзду' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status || 'Новий контакт'}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-gray-900 text-xs">{contact.managerName || '-'}</td>
                  <td className="px-2 py-2 text-gray-900 text-xs">
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('uk-UA') : '-'}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(contact)}
                        className="p-1 h-6 w-6"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(contact)}
                        className="p-1 h-6 w-6"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(contact.id)}
                        className="p-1 h-6 w-6 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пустий стан */}
        {filteredContacts.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Контактив не знайдено</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Спробуйте змінити фільтри пошуку'
                : 'Додайте перший контакт для початку роботи'
              }
            </p>
          </div>
        )}
      </div>

      {/* Модальне вікно редагування */}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          isOpen={!!editingContact}
          onClose={() => setEditingContact(null)}
          onSave={(updatedContact) => {
            onEdit(updatedContact)
            setEditingContact(null)
          }}
        />
      )}
    </>
  )
}