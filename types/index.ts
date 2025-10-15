export const BRANCHES = ['ЦО', 'Рівне', 'Київ', 'Одеса'] as const
export const COUNTRIES = [
  'Польща',
  'Чехія',
  'Німеччина',
  'Латвія',
  'Румунія',
  'Литва',
  'Угорщина',
  'Греція',
  'Австрія'
] as const
export const CANDIDATE_COUNTRIES = ['Україна', 'Білорусь', 'Грузія', 'Інше'] as const
export const RESPONSIBLE_PERSONS = [
  'Тетяна Чуприна',
  'Наталія Жиган',
  'Діана Сологуб'
] as const
export const CANDIDATE_STATUSES = [
  'Зареєстровано',
  'Не зареєстрован',
  'Готовий до виїзду',
  'В дорозі',
  'Прибув',
  'Працює',
  'Завершив роботу',
  'Не доїхав'
] as const
export const PAYMENT_STATUSES = ['Очікується', 'Отримано', 'Прострочено'] as const
export const RECIPIENT_TYPES = ['ТОВ ЕВ', 'ФОП Коктов', 'ФОП Литви', 'ТОВ ПерсоналВорк'] as const
export const PAYMENT_METHODS = ['Банківський переказ', 'Готівка', 'Криптовалюта', 'Інше'] as const
export const PACKAGE_TYPES = ['Базовий', 'Стандарт', 'Преміум', 'Безкоштовний'] as const
export const PACKAGE_PRICES = { 'Базовий': 999, 'Стандарт': 1499, 'Преміум': 2299, 'Безкоштовний': 0 } as const
export const APPLICATION_STATUSES = ['Поданий', 'Підтверджено', 'Відхилено', 'В обробці'] as const
export const WORK_TYPES = ['Логістика', 'Виробництво', 'Готель', 'Будівництво', 'Склад'] as const

// Нові константи для детальної картки клієнта
export const DEAL_STAGES = [
  'Створена',
  'Внесення даних',
  'Готово для адміна',
  'Схвалено адміном',
  'Подано партнеру',
  'Прийнято партнером',
  'Відхилено партнером',
  'Завершена'
] as const

export const DEAL_STATUSES = [
  'Активна',
  'Завершена',
  'Скасована',
  'Призупинена'
] as const

// Прибрано ролі - просто групування кандидатів

export const TRANSPORT_TYPES = [
  'Самостійно',
  'Організовано',
  'Змішано'
] as const

export const ACTIVITY_TYPES = [
  'comment',
  'call',
  'task',
  'stage_change',
  'direction_change',
  'deal_created',
  'document_uploaded',
  'payment_received'
] as const

export const DOCUMENT_TYPES = [
  'receipt',
  'invoice',
  'contract',
  'passport',
  'visa',
  'other'
] as const

// Нові константи для розширених полів
export const EDUCATION_LEVELS = [
  'Середня',
  'Середня спеціальна',
  'Вища',
  'Незакінчена вища',
  'Аспірантура'
] as const

export const FAMILY_STATUSES = [
  'Одружений/заміжня',
  'Неодружений/незаміжня',
  'Розлучений/розлучена',
  'Вдівець/вдова'
] as const

export const LANGUAGE_LEVELS = [
  'Початковий',
  'Середній',
  'Високий',
  'Рідна мова'
] as const

export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  RECRUITMENT_DIRECTOR = 'RECRUITMENT_DIRECTOR',
  ACCOUNTANT = 'ACCOUNTANT',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  MANAGER = 'MANAGER',
}

export interface User {
  id: number
  username: string
  password: string
  role: UserRole
  fullName: string
  isActive: boolean
  branch?: string
  salary: number
  createdAt: Date
  updatedAt: Date
}

export interface Candidate {
  id: number
  applicationNumber?: string | null
  branch: string
  responsible: string
  firstName: string
  lastName: string
  phone: string
  email?: string | null
  age: number
  candidateCountry: string
  vacancyCountry: string
  projectName: string
  partnerNumber?: string | null
  arrivalDate?: Date | string | null
  candidateStatus: string
  paymentAmount?: number | null
  paymentStatus?: string | null
  recipientType?: string | null
  comment?: string | null
  
  // Нові поля
  passportNumber?: string | null
  passportExpiry?: Date | string | null
  education?: string | null
  workExperience?: string | null
  languageSkills?: string | null
  familyStatus?: string | null
  children?: number | null
  
  // Поля для детальної картки
  dealStage?: string
  dealAmount?: number
  dealCurrency?: string
  workCity?: string | null
  workAddress?: string | null
  transportType?: string | null
  contacts?: string | null
  completionDate?: Date | string | null
  dealStatus?: string
  
  createdAt?: Date
  updatedAt?: Date
}

export interface Payment {
  id: number
  candidateId: number
  candidateName: string
  candidatePhone: string
  projectName: string
  partnerNumber?: string | null
  workStartDate?: Date | string | null
  workEndDate?: Date | string | null
  paymentAmount: number
  paymentDate: Date | string
  paymentStatus: string
  expectedDate?: Date | string | null
  recipientType?: string | null
  bankAccount?: string | null
  paymentMethod?: string | null
  referenceNumber?: string | null
  comment?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface Statistics {
  totalCandidates: number
  workingCandidates: number
  readyCandidates: number
  registeredCandidates: number
  travelingCandidates: number
  arrivedCandidates: number
  finishedCandidates: number
  notArrivedCandidates: number
  conversionRate: number
  byCountry: Array<{
    country: string
    count: number
    working: number
  }>
  byBranch: Array<{
    branch: string
    count: number
    working: number
  }>
  byRecipient: Array<{
    recipient: string
    count: number
    totalAmount: number
  }>
  totalReceived: number
  totalPending: number
  averagePayment: number
  paymentRate: number
  monthlyReceived: number
  pendingPayments: number
  avgPayment: number
  activePartners: number
  topPartner: string
  avgCandidatesPerPartner: number
  thisMonthCandidates: number
  thisYearCandidates: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: {
    id: number
    username: string
    role: UserRole
    fullName: string
    branch?: string
  }
  token?: string
  error?: string
}

export interface CreateUserRequest {
  username: string
  password: string
  role: UserRole
  fullName: string
  branch?: string
  salary?: number
}

export interface UpdateUserRequest {
  username?: string
  password?: string
  role?: UserRole
  fullName?: string
  isActive?: boolean
  branch?: string
  salary?: number
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: {
    candidates: ['read', 'write', 'delete'],
    applications: ['read', 'write', 'delete'],
    vacancies: ['read', 'write', 'delete'],
    payments: ['read', 'write', 'delete'],
    partnerPayments: ['read', 'write', 'delete'],
    salaries: ['read', 'write', 'delete'],
    expenses: ['read', 'write', 'delete'],
    visas: ['read', 'write', 'delete'],
    statistics: ['read'],
    users: ['read', 'write', 'delete'],
  },
  [UserRole.DIRECTOR]: {
    candidates: ['read', 'write', 'delete'],
    applications: ['read', 'write', 'delete'],
    vacancies: ['read', 'write', 'delete'],
    payments: ['read', 'write', 'delete'],
    partnerPayments: ['read', 'write', 'delete'],
    salaries: ['read', 'write', 'delete'],
    expenses: ['read', 'write', 'delete'],
    visas: ['read', 'write', 'delete'],
    statistics: ['read'],
    users: ['read', 'write', 'delete'],
  },
  [UserRole.RECRUITMENT_DIRECTOR]: {
    candidates: [],
    applications: [],
    vacancies: [],
    payments: [],
    partnerPayments: ['read', 'write'],
    salaries: ['read'],
    expenses: [],
    visas: [],
    statistics: ['read'],
    users: [],
  },
  [UserRole.ACCOUNTANT]: {
    candidates: [],
    applications: [],
    vacancies: [],
    payments: ['read', 'write'],
    partnerPayments: ['read', 'write'],
    salaries: ['read'],
    expenses: ['read', 'write'],
    visas: [],
    statistics: ['read'],
    users: [],
  },
  [UserRole.BRANCH_MANAGER]: {
    candidates: ['read', 'write'],
    applications: ['read', 'write'],
    vacancies: ['read'],
    payments: [],
    partnerPayments: [],
    salaries: ['read'],
    expenses: ['read', 'write'],
    visas: [],
    statistics: ['read'],
    users: ['read'],
  },
  [UserRole.ADMINISTRATOR]: {
    candidates: ['read', 'write', 'delete'],
    applications: ['read', 'write', 'delete'],
    vacancies: ['read', 'write', 'delete'],
    payments: [],
    partnerPayments: [],
    salaries: [],
    expenses: [],
    visas: [],
    statistics: [],
    users: [],
  },
  [UserRole.MANAGER]: {
    candidates: ['read', 'write'],
    applications: ['read', 'write'],
    vacancies: ['read'],
    payments: [],
    partnerPayments: [],
    salaries: ['read'],
    expenses: [],
    visas: ['write'],
    statistics: [],
    users: [],
  },
} as const

export interface Vacancy {
  id: number
  country: string
  projectName: string
  partnerName: string
  salary: string
  workType: string
  requirements?: string
  isPriority: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  id: number
  candidateId: number
  vacancyId: number
  managerId: number
  packageType: string
  packagePrice: number
  isFree: boolean
  status: string
  arrivedStatus?: string
  workedStatus?: string
  partnerPayment?: number
  paymentDays?: number
  createdAt: Date
  updatedAt: Date
}

export interface VisaSale {
  id: number
  candidateId: number
  managerId: number
  price: number
  commission: number
  saleDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface BranchExpense {
  id: number
  branch: string
  month: number
  year: number
  rent: number
  utilities: number
  office: number
  advertising: number
  other: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface MonthlySalary {
  id: number
  userId: number
  month: number
  year: number
  baseSalary: number
  bonus: number
  visaBonus: number
  freeBonus: number
  total: number
  indicators: number
  createdAt: Date
  updatedAt: Date
}

// Нові інтерфейси для детальної картки клієнта
export interface Activity {
  id: number
  candidateId: number
  type: string
  title: string
  description?: string | null
  userId?: number | null
  userName?: string | null
  metadata?: string | null
  isPinned: boolean
  createdAt: Date
}

export interface Document {
  id: number
  candidateId: number
  type: string
  title: string
  fileName: string
  filePath: string
  fileSize?: number | null
  mimeType?: string | null
  description?: string | null
  uploadedBy?: number | null
  uploadedAt: Date
}

export interface CandidateDetail extends Candidate {
  activities: Activity[]
  documents: Document[]
}

// Типи для контактів
export interface Contact {
  id: number
  firstName: string
  lastName: string
  phone: string
  age: number
  candidateCountry?: string
  vacancyCountry?: string
  projectName?: string
  candidateStatus?: string
  notes?: string
  
  // Метадані
  managerId: number
  managerName: string
  branch: string
  
  // Передача відповідальності
  originalManagerId?: number
  originalManagerName?: string
  transferredAt?: Date
  transferredBy?: number
  transferredByName?: string
  transferReason?: string
  
  createdAt: Date
  updatedAt: Date
}

// Типи для запитів на передачу контакту
export interface ContactTransferRequest {
  id: number
  contactId: number
  fromManagerId: number
  toManagerId: number
  fromManagerName: string
  toManagerName: string
  reason?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  approvedBy?: number
  approvedByName?: string
  approvedAt?: Date
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
  contact?: Contact
}

// Нові інтерфейси для угод
export interface Deal {
  id: number
  title: string
  description?: string | null
  managerId: number
  managerName: string
  branch: string
  vacancyCountry: string
  projectName: string
  partnerNumber?: string | null
  workCity?: string | null
  workAddress?: string | null
  arrivalDate?: Date | string | null
  transportType?: string | null
  contacts?: string | null
  dealStage: string
  dealStatus: string
  totalAmount: number
  dealCurrency: string
  paymentStatus?: string | null
  recipientType?: string | null
  isReadyForAdmin: boolean
  adminApproved: boolean
  submittedToPartner: boolean
  createdAt: Date
  updatedAt: Date
  candidates?: DealContact[]
  activities?: DealActivity[]
  documents?: DealDocument[]
}

export interface DealContact {
  id: number
  dealId: number
  contactId: number
  createdAt: Date
  contact?: Contact
}

export interface DealActivity {
  id: number
  dealId: number
  type: string
  title: string
  description?: string | null
  userId?: number | null
  userName?: string | null
  metadata?: string | null
  isPinned: boolean
  createdAt: Date
}

export interface DealDocument {
  id: number
  dealId: number
  type: string
  title: string
  fileName: string
  filePath: string
  fileSize?: number | null
  mimeType?: string | null
  description?: string | null
  uploadedBy?: number | null
  uploadedAt: Date
}

export interface DealDetail extends Deal {
  contacts: DealContact[]
  activities: DealActivity[]
  documents: DealDocument[]
}
