'use client'

import { useState } from 'react'
import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
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
  const [sortField, setSortField] = useState<keyof Contact>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  // Фільтрація та сортування
  const filteredContacts = contacts
    .filter(contact => {
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || contact.candidateStatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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

  const getManagerInitials = (managerName: string) => {
    if (!managerName) return 'M'
    const names = managerName.split(' ')
    return names.map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Контакти ({filteredContacts.length})
            </CardTitle>
            
            {/* Фільтри */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Пошук..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-6 w-48 h-8 text-sm"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі статуси</SelectItem>
                  <SelectItem value="Новий контакт">Новий контакт</SelectItem>
                  <SelectItem value="В угоді">В угоді</SelectItem>
                  <SelectItem value="Готовий до виїзду">Готовий до виїзду</SelectItem>
                  <SelectItem value="Працює">Працює</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Excel-подібна таблиця */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Контакт
                      {sortField === 'firstName' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Телефон
                      {sortField === 'phone' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Вік
                      {sortField === 'age' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('projectName')}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Проект
                      {sortField === 'projectName' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Email
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Вік
                      {sortField === 'age' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('candidateCountry')}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Країна кандидата
                      {sortField === 'candidateCountry' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('vacancyCountry')}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Країна вакансії
                      {sortField === 'vacancyCountry' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('candidateStatus')}
                  >
                    Статус
                    {sortField === 'candidateStatus' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Менеджер
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    Створено
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    {/* Контакт */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-blue-600 font-semibold text-xs">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <button
                            onClick={() => onView(contact)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {contact.firstName} {contact.lastName}
                          </button>
                          <div className="text-sm text-gray-500">
                            {contact.candidateCountry}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email || 'Не вказано'}</div>
                    </td>

                    {/* Вік */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.age} років</div>
                    </td>

                    {/* Країна кандидата */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.candidateCountry}</div>
                    </td>

                    {/* Країна вакансії */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.vacancyCountry}</div>
                    </td>

                    {/* Проект */}
                    <td className="px-2 py-2">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={contact.projectName}>
                        {contact.projectName}
                      </div>
                    </td>

                    {/* Статус */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(contact.candidateStatus)}`}>
                        {contact.candidateStatus}
                      </span>
                    </td>

                    {/* Менеджер */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-blue-600 font-medium text-xs">
                            {getManagerInitials(contact.managerName)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contact.managerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {contact.branch}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Створено */}
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString('uk-UA')}
                    </td>

                    {/* Дії */}
                    <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(contact)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingContact(contact)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(contact.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
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
        </CardContent>
      </Card>

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
