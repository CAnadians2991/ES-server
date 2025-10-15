import type { Candidate, CandidateDetail, Activity, Document, Deal, DealDetail, Contact, LoginResponse, Statistics, User, Application, Vacancy, MonthlySalary, BranchExpense } from '@/types'

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  
  return response.json()
}

export const api = {
  contacts: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher<{ contacts: Contact[]; pagination: any }>(`/api/contacts${params ? `?${params}` : ''}`)
    },
    getById: (id: number) => fetcher<Contact>(`/api/contacts/${id}`),
    create: (data: any) => fetcher<Contact>('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher<Contact>(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/contacts/${id}`, {
      method: 'DELETE',
    }),
  },
  
  candidates: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher<Candidate[]>(`/api/candidates${params ? `?${params}` : ''}`)
    },
    getOne: (id: number) => fetcher<Candidate>(`/api/candidates/${id}`),
    create: (data: any) => fetcher<Candidate>('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher<Candidate>(`/api/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/candidates/${id}`, {
      method: 'DELETE',
    }),
    reorder: (draggedId: number, targetId: number) => fetcher('/api/candidates/reorder', {
      method: 'POST',
      body: JSON.stringify({ draggedId, targetId }),
    }),
    bulkReorder: (orders: Array<{ id: number; sortOrder: number }>) => fetcher('/api/candidates/bulk-reorder', {
      method: 'POST',
      body: JSON.stringify({ orders }),
    }),
    getDetail: (id: number) => fetcher<CandidateDetail>(`/api/candidates/${id}/detail`),
    getActivities: (id: number, page = 1, limit = 20) => 
      fetcher<{ activities: Activity[]; pagination: any }>(`/api/candidates/${id}/activities?page=${page}&limit=${limit}`),
    addActivity: (id: number, data: { type: string; title: string; description?: string; metadata?: any; isPinned?: boolean }) =>
      fetcher<Activity>(`/api/candidates/${id}/activities`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getDocuments: (id: number) => fetcher<Document[]>(`/api/candidates/${id}/documents`),
    uploadDocument: (id: number, formData: FormData) => fetcher<Document>(`/api/candidates/${id}/documents`, {
      method: 'POST',
      body: formData,
    }),
  },
  deals: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher<{ deals: Deal[]; pagination: any }>(`/api/deals${params ? `?${params}` : ''}`)
    },
    getOne: (id: number) => fetcher<DealDetail>(`/api/deals/${id}`),
    create: (data: any) => fetcher<Deal>('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher<Deal>(`/api/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/deals/${id}`, {
      method: 'DELETE',
    }),
  },
  payments: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher(`/api/payments${params ? `?${params}` : ''}`)
    },
    create: (data: any) => fetcher('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher(`/api/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/payments/${id}`, {
      method: 'DELETE',
    }),
  },
  statistics: {
    get: () => fetcher<Statistics>('/api/statistics'),
  },
  auth: {
    login: (data: { username: string; password: string }) => fetcher<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    verify: (password: string) => fetcher('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
    changePassword: (data: { verificationCode: string; oldPassword: string; newPassword: string }) =>
      fetcher('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
  users: {
    getAll: () => fetcher<User[]>('/api/users'),
    getOne: (id: number) => fetcher<User>(`/api/users/${id}`),
    create: (data: any) => fetcher('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/users/${id}`, {
      method: 'DELETE',
    }),
    changePassword: (id: number, data: { oldPassword: string; newPassword: string }) =>
      fetcher(`/api/users/${id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
  applications: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher<Application[]>(`/api/applications${params ? `?${params}` : ''}`)
    },
    getOne: (id: number) => fetcher<Application>(`/api/applications/${id}`),
    create: (data: any) => fetcher<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher<Application>(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/applications/${id}`, {
      method: 'DELETE',
    }),
  },
  vacancies: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher<Vacancy[]>(`/api/vacancies${params ? `?${params}` : ''}`)
    },
    getOne: (id: number) => fetcher<Vacancy>(`/api/vacancies/${id}`),
    create: (data: any) => fetcher<Vacancy>('/api/vacancies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher<Vacancy>(`/api/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/vacancies/${id}`, {
      method: 'DELETE',
    }),
  },
  salaries: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher<MonthlySalary[]>(`/api/salaries${params ? `?${params}` : ''}`)
    },
  },
  expenses: {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters).toString()
      return fetcher<BranchExpense[]>(`/api/expenses${params ? `?${params}` : ''}`)
    },
    create: (data: any) => fetcher<BranchExpense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetcher<BranchExpense>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => fetcher(`/api/expenses/${id}`, {
      method: 'DELETE',
    }),
  },
}

