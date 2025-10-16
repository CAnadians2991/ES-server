'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  Image as ImageIcon,
  File as FileIcon
} from 'lucide-react'
import { Contact } from '@/types'

interface ContactViewSidebarProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onEdit: (contact: Contact) => void
  currentManager?: {
    id: number
    name: string
    branch: string
  }
}

interface UploadedFile {
  id: string
  name: string
  url: string
  type: string
}

export default function ContactViewSidebar({ isOpen, onClose, contact, onEdit, currentManager }: ContactViewSidebarProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['basic']))
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks)
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId)
    } else {
      newExpanded.add(blockId)
    }
    setExpandedBlocks(newExpanded)
  }

  const openPreview = (file: UploadedFile) => {
    setPreviewFile(file)
  }

  const closePreview = () => {
    setPreviewFile(null)
  }

  const handleEdit = () => {
    if (contact) {
      onEdit(contact)
      onClose()
    }
  }

  if (!isOpen || !contact) return null

  const blocks = [
    {
      id: 'basic',
      title: 'Основна інформація',
      icon: User,
      emoji: '👤',
      color: 'from-blue-400 to-indigo-500',
      fields: [
        { id: 'firstName', label: 'Ім\'я', value: contact.firstName },
        { id: 'lastName', label: 'Прізвище', value: contact.lastName },
        { id: 'phone', label: 'Телефон', value: contact.phone },
        { id: 'age', label: 'Вік', value: contact.age?.toString() }
      ]
    },
    {
      id: 'work',
      title: 'Робота',
      icon: Briefcase,
      emoji: '💼',
      color: 'from-orange-400 to-red-400',
      fields: [
        { id: 'candidateCountry', label: 'Країна проживання', value: contact.candidateCountry },
        { id: 'vacancyCountry', label: 'Країна роботи', value: contact.vacancyCountry },
        { id: 'projectName', label: 'Назва проекту', value: contact.projectName },
        { id: 'candidateStatus', label: 'Статус', value: contact.candidateStatus }
      ]
    },
    {
      id: 'notes',
      title: 'Примітки',
      icon: FileText,
      emoji: '📝',
      color: 'from-gray-400 to-slate-500',
      fields: [
        { id: 'notes', label: 'Примітки', value: contact.notes }
      ]
    }
  ]

  // Мокові файли для демонстрації
  const mockFiles: UploadedFile[] = [
    {
      id: '1',
      name: 'passport_photo.jpg',
      url: '/api/placeholder/200/150',
      type: 'image/jpeg'
    },
    {
      id: '2',
      name: 'document.pdf',
      url: '/api/placeholder/200/150',
      type: 'application/pdf'
    }
  ]

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-2/5 bg-white backdrop-blur-xl shadow-2xl z-50 flex flex-col rounded-l-2xl border border-gray-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">{contact.firstName} {contact.lastName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 rounded-full hover:bg-blue-100"
            >
              <span className="text-sm">✏️</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 rounded-full hover:bg-red-100"
            >
              <span className="text-sm">❌</span>
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Відповідальний менеджер */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {contact.managerName?.charAt(0) || 'M'}
              </div>
              <div>
                <p className="text-xs font-medium text-blue-900 leading-tight">{contact.managerName || 'Менеджер'}</p>
                <p className="text-xs text-blue-700 leading-tight">{contact.branch || 'Філія'}</p>
              </div>
            </div>
          </div>

          {/* Блоки інформації */}
          {blocks.map((block) => {
            const Icon = block.icon
            const isExpanded = expandedBlocks.has(block.id)
            
            return (
              <div key={block.id} className="border border-gray-300 rounded-lg bg-white shadow-md">
                <div 
                  className="p-2 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
                  onClick={() => toggleBlock(block.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg opacity-60">{block.emoji}</span>
                      <Icon className={`w-4 h-4 text-transparent bg-gradient-to-r ${block.color} bg-clip-text`} />
                      <span className={`text-sm font-bold bg-gradient-to-r ${block.color} bg-clip-text text-transparent`}>{block.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-gray-700" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-700" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {block.fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            {field.label}
                          </Label>
                          <div className="h-8 text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-900 flex items-center">
                            {field.value || '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Файли */}
          <div className="border border-gray-300 rounded-lg bg-white shadow-md">
            <div className="p-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-lg opacity-60">📎</span>
                <FileText className="w-4 h-4 text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text" />
                <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Файли</span>
              </div>
            </div>
            <div className="p-2 space-y-2">
              {mockFiles.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {mockFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="bg-white border border-gray-300 rounded-lg p-2 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-3 h-3 text-gray-600" />
                          ) : (
                            <FileIcon className="w-3 h-3 text-gray-600" />
                          )}
                          <span className="text-xs text-gray-700 truncate">{file.name}</span>
                        </div>
                        
                        {/* Мініатюра файлу */}
                        <div 
                          className="w-full h-16 bg-gray-100 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center overflow-hidden"
                          onClick={() => openPreview(file)}
                        >
                          {file.type.startsWith('image/') ? (
                            <img 
                              src={file.url} 
                              alt={file.name} 
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="text-center">
                              <FileIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <span className="text-xs text-gray-500">PDF</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Кнопка перегляду */}
                        <div className="flex items-center justify-center mt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreview(file)}
                            className="h-5 w-5 p-0 rounded-full hover:bg-blue-100"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Файли не додано</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={closePreview}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{previewFile.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closePreview}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              {previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Попередній перегляд недоступний для цього типу файлу</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
