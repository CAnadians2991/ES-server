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
  Upload,
  Eye,
  Trash2,
  Image as ImageIcon,
  File as FileIcon
} from 'lucide-react'
import { Contact } from '@/types'

interface CreateContactSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  currentManager?: {
    id: number
    name: string
    branch: string
  }
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  age: number | ''
  candidateCountry: string
  vacancyCountry: string
  projectName: string
  candidateStatus: string
  notes: string
}

interface UploadedFile {
  id: string
  name: string
  url: string
  type: string
  size: number
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  age: '',
  candidateCountry: '',
  vacancyCountry: '',
  projectName: '',
  candidateStatus: '',
  notes: ''
}

export default function CreateContactSidebar({ isOpen, onClose, onSave, currentManager }: CreateContactSidebarProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['basic']))
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks)
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId)
    } else {
      newExpanded.add(blockId)
    }
    setExpandedBlocks(newExpanded)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: e.target?.result as string,
          type: file.type,
          size: file.size
        }
        setUploadedFiles(prev => [...prev, newFile])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const openPreview = (file: UploadedFile) => {
    setPreviewFile(file)
  }

  const closePreview = () => {
    setPreviewFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.age) {
      alert('Будь ласка, заповніть обов\'язкові поля: ім\'я, прізвище, телефон та вік')
      return
    }

    setLoading(true)
    try {
      await onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        age: Number(formData.age),
        candidateCountry: formData.candidateCountry,
        vacancyCountry: formData.vacancyCountry,
        projectName: formData.projectName,
        candidateStatus: 'Новий контакт',
        notes: formData.notes,
        managerId: currentManager?.id || 0,
        managerName: currentManager?.name || 'Менеджер',
        branch: currentManager?.branch || 'Філія'
      })
      
      setFormData(initialFormData)
      setUploadedFiles([])
      onClose()
    } catch (error) {
      console.error('Error creating contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const blocks = [
    {
      id: 'basic',
      title: 'Основна інформація',
      icon: User,
      emoji: '👤',
      required: true,
      color: 'from-blue-400 to-indigo-500',
      fields: [
        { id: 'firstName', label: 'Ім\'я*', type: 'text', required: true },
        { id: 'lastName', label: 'Прізвище*', type: 'text', required: true },
        { id: 'phone', label: 'Телефон*', type: 'text', required: true },
        { id: 'age', label: 'Вік*', type: 'number', required: true }
      ]
    },
    {
      id: 'work',
      title: 'Робота',
      icon: Briefcase,
      emoji: '💼',
      color: 'from-orange-400 to-red-400',
      fields: [
        { id: 'candidateCountry', label: 'Країна проживання', type: 'text' },
        { id: 'vacancyCountry', label: 'Країна роботи', type: 'text' },
        { id: 'projectName', label: 'Назва проекту', type: 'text' },
        { id: 'candidateStatus', label: 'Статус', type: 'select', options: ['Новий', 'В роботі', 'Готовий', 'Відхилений'] }
      ]
    },
    {
      id: 'notes',
      title: 'Примітки',
      icon: FileText,
      emoji: '📝',
      color: 'from-gray-400 to-slate-500',
      fields: [
        { id: 'notes', label: 'Примітки', type: 'textarea' }
      ]
    }
  ]

  if (!isOpen) return null

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
            <h2 className="text-sm font-semibold text-gray-900">Новий контакт</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="h-6 w-6 p-0 rounded-full hover:bg-green-100"
            >
              <span className="text-sm">💾</span>
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
                {currentManager?.name?.charAt(0) || 'M'}
              </div>
              <div>
                <p className="text-xs font-medium text-blue-900">{currentManager?.name || 'Менеджер'}</p>
                <p className="text-xs text-blue-700">{currentManager?.branch || 'Філія'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Блоки форми */}
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
                        {block.required && <span className="text-red-500 text-xs">*</span>}
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
                            <Label htmlFor={field.id} className="text-xs font-medium text-gray-700">
                              {field.label}
                            </Label>
                            
                            {field.type === 'textarea' ? (
                              <textarea
                                id={field.id}
                                value={formData[field.id as keyof FormData] as string}
                                onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                                            placeholder=""
                                className="w-full p-3 text-sm border border-gray-300 min-h-[60px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : field.type === 'select' ? (
                              <Select
                                value={formData[field.id as keyof FormData] as string}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
                              >
                                <SelectTrigger className="h-8 text-sm bg-white border-gray-300">
                                  <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                  {'options' in field && field.options?.map((option: string) => (
                                    <SelectItem key={option} value={option} className="text-sm">
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={field.id}
                                type={field.type}
                                value={formData[field.id as keyof FormData] as string}
                                onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                                            placeholder=""
                                required={'required' in field ? field.required : false}
                                className="h-8 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Завантаження файлів */}
            <div className="border border-gray-300 rounded-lg bg-white shadow-md">
              <div className="p-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg opacity-60">📎</span>
                  <Upload className="w-4 h-4 text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text" />
                  <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Файли</span>
                </div>
              </div>
              <div className="p-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-6 text-sm rounded-md px-3 shadow-sm bg-white hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Завантажити
                  </Button>
                  <span className="text-sm text-gray-600">Фото паспорта, документи</span>
                </div>
                
                {/* Список завантажених файлів */}
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedFiles.map((file) => (
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
                          
                          {/* Кнопки дій */}
                          <div className="flex items-center gap-1 mt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openPreview(file)}
                              className="h-5 w-5 p-0 rounded-full hover:bg-blue-100"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
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
