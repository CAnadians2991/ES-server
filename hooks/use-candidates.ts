import { create } from 'zustand'
import type { Candidate, CandidateFilters } from '@/types'

interface CandidatesStore {
  candidates: Candidate[]
  filters: CandidateFilters
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalCount: number
  
  setCandidates: (candidates: Candidate[]) => void
  setFilters: (filters: CandidateFilters) => void
  clearFilters: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setPage: (page: number) => void
  setPagination: (total: number, totalPages: number) => void
  
  addCandidate: (candidate: Candidate) => void
  updateCandidate: (id: number, candidate: Partial<Candidate>) => void
  deleteCandidate: (id: number) => void
  reorderCandidates: (draggedId: number, targetId: number) => void
}

const currentDate = new Date()

export const useCandidatesStore = create<CandidatesStore>((set) => ({
  candidates: [],
  filters: {},
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  
  setCandidates: (candidates) => set({ candidates }),
  setFilters: (filters) => set({ filters, currentPage: 1 }),
  clearFilters: () => set({ filters: {}, currentPage: 1 }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ currentPage: page }),
  setPagination: (total, totalPages) => set({ totalCount: total, totalPages }),
  
  addCandidate: (candidate) =>
    set((state) => ({ candidates: [candidate, ...state.candidates] })),
  
  updateCandidate: (id, updatedFields) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, ...updatedFields } : c
      ),
    })),
  
  deleteCandidate: (id) =>
    set((state) => ({
      candidates: state.candidates.filter((c) => c.id !== id),
    })),

  reorderCandidates: (draggedId, targetId) =>
    set((state) => {
      const candidates = [...state.candidates]
      const draggedIndex = candidates.findIndex(c => c.id === draggedId)
      const targetIndex = candidates.findIndex(c => c.id === targetId)
      
      if (draggedIndex === -1 || targetIndex === -1) return state
      
      const [removed] = candidates.splice(draggedIndex, 1)
      candidates.splice(targetIndex, 0, removed)
      
      return { candidates }
    }),
}))

