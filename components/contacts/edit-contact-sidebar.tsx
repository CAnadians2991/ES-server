'use client'

import { useState, useEffect } from 'react'
import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Phone, 
  Briefcase, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Upload,
  Eye,
  Trash2,
  Image as ImageIcon,
  File as FileIcon
} from 'lucide-react'

interface EditContactSidebarProps {
  contact: Contact
  isOpen: boolean
  onClose: () => void
  onSave: (updateData: any) => void
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
  age: string
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
}

export default function EditContactSidebar({ 
  contact, 
  isOpen, 
  onClose, 
  onSave,
  currentManager 
}: EditContactSidebarProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    candidateCountry: '',
    vacancyCountry: '',
    projectName: '',
    candidateStatus: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['basic']))
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        phone: contact.phone || '',
        age: contact.age?.toString() || '',
        candidateCountry: contact.candidateCountry || '',
        vacancyCountry: contact.vacancyCountry || '',
        projectName: contact.projectName || '',
        candidateStatus: contact.candidateStatus || '',
        notes: contact.notes || ''
      })
    }
  }, [contact])

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blockId)) {
        newSet.delete(blockId)
      } else {
        newSet.add(blockId)
      }
      return newSet
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: URL.createObjectURL(file),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
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

    if (!contact) return

    setLoading(true)
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        age: Number(formData.age),
        candidateCountry: formData.candidateCountry,
        vacancyCountry: formData.vacancyCountry,
        projectName: formData.projectName,
        candidateStatus: formData.candidateStatus,
        notes: formData.notes,
      }

      await onSave(updateData)
      onClose()
    } catch (error) {
      console.error('Error updating contact:', error)
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-2/5 bg-white border-l border-gray-200 shadow-2xl z-50 rounded-l-2xl font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-tl-2xl">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Редагування контакту</h2>
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
        <div className="p-4 space-y-3 overflow-y-auto h-full pb-20">
          {/* Responsible Manager */}
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <div className="text-xs">
                <div className="font-medium text-gray-700">Відповідальний менеджер</div>
                <div className="text-gray-500">{currentManager?.name || 'Не вказано'}</div>
              </div>
            </div>
          </div>

          {/* Form Blocks */}
          {blocks.map((block) => {
            const isExpanded = expandedBlocks.has(block.id)
            const Icon = block.icon
            
            return (
              <div key={block.id} className="border border-gray-300 rounded-lg bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleBlock(block.id)}
                  className="w-full p-2 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg opacity-60">{block.emoji}</span>
                    <Icon className={`w-4 h-4 bg-gradient-to-r ${block.color} bg-clip-text text-transparent`} />
                    <span className={`text-sm font-bold bg-gradient-to-r ${block.color} bg-clip-text text-transparent`}>
                      {block.title}
                    </span>
                    {block.required && <span className="text-red-500 text-xs">*</span>}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-2 space-y-2 border-t border-gray-200">
                    {block.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id} className="text-xs font-medium text-gray-700">
                          {field.label}
                        </Label>
                        {field.type === 'textarea' ? (
                          <textarea
                            id={field.id}
                            value={formData[field.id as keyof FormData]}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full h-8 text-sm p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
                            rows={3}
                          />
                        ) : field.type === 'select' && 'options' in field ? (
                          <Select
                            value={formData[field.id as keyof FormData]}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
                          >
                            <SelectTrigger className="h-8 text-sm p-3 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            value={formData[field.id as keyof FormData]}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="h-8 text-sm p-3 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={'required' in field ? field.required : false}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* File Upload Section */}
          <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Файли</span>
              </div>
              
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-700 text-sm rounded-md cursor-pointer hover:from-cyan-200 hover:to-blue-200 transition-colors"
              >
                Завантажити файли
              </label>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-16 bg-gray-100 rounded border border-gray-200 cursor-pointer hover:bg-gray-200" onClick={() => openPreview(file)}>
                          {file.type.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileIcon className="w-6 h-6 text-gray-500" />
                              <span className="text-xs text-gray-500 ml-1">PDF</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 truncate max-w-32">{file.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPreview(file)}
                          className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div 
            className="max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {previewFile.type.startsWith('image/') ? (
              <img 
                src={previewFile.url} 
                alt={previewFile.name} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="p-8 text-center">
                <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">{previewFile.name}</p>
                <p className="text-sm text-gray-500">PDF файл</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}