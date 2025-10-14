"use client"

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/hooks/use-auth'
import { useCandidatesStore } from '@/hooks/use-candidates'
import { useToast } from '@/hooks/use-toast'

interface CandidateUpdate {
  id: number
  field: string
  value: any
  updatedBy: {
    id: number
    name: string
  }
  timestamp: string
}

interface CandidateReorder {
  draggedId: number
  targetId: number
  reorderedBy: {
    id: number
    name: string
  }
  timestamp: string
}

interface CandidateCreate {
  candidate: any
  createdBy: {
    id: number
    name: string
  }
  timestamp: string
}

interface CandidateDelete {
  id: number
  deletedBy: {
    id: number
    name: string
  }
  timestamp: string
}

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { user } = useAuth()
  const { updateCandidate, addCandidate, deleteCandidate, reorderCandidates } = useCandidatesStore()
  const { toast } = useToast()

  const connect = useCallback(() => {
    if (!user || socketRef.current?.connected) return

    const socket = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_WS_URL || 'wss://your-domain.com'
      : 'http://localhost:3000'
    )

    socketRef.current = socket

    // Приєднання до кімнати кандидатів
    socket.emit('join-candidates')

    // Обробка оновлень кандидатів
    socket.on('candidate-updated', (data: CandidateUpdate) => {
      // Не показуємо повідомлення для власних змін
      if (data.updatedBy.id !== user.id) {
        updateCandidate(data.id, { [data.field]: data.value })
        
        toast({
          title: 'Оновлено',
          description: `${data.updatedBy.name} оновив кандидата`,
          duration: 2000
        })
      }
    })

    // Обробка переміщення кандидатів
    socket.on('candidate-reordered', (data: CandidateReorder) => {
      if (data.reorderedBy.id !== user.id) {
        reorderCandidates(data.draggedId, data.targetId)
        
        toast({
          title: 'Переміщено',
          description: `${data.reorderedBy.name} перемістив кандидата`,
          duration: 2000
        })
      }
    })

    // Обробка створення кандидатів
    socket.on('candidate-created', (data: CandidateCreate) => {
      if (data.createdBy.id !== user.id) {
        addCandidate(data.candidate)
        
        toast({
          title: 'Додано',
          description: `${data.createdBy.name} додав нового кандидата`,
          duration: 2000
        })
      }
    })

    // Обробка видалення кандидатів
    socket.on('candidate-deleted', (data: CandidateDelete) => {
      if (data.deletedBy.id !== user.id) {
        deleteCandidate(data.id)
        
        toast({
          title: 'Видалено',
          description: `${data.deletedBy.name} видалив кандидата`,
          duration: 2000
        })
      }
    })

    // Обробка помилок
    socket.on('error', (error: { message: string }) => {
      toast({
        title: 'Помилка WebSocket',
        description: error.message,
        variant: 'destructive'
      })
    })

    // Обробка системних повідомлень
    socket.on('system-message', (data: { message: string; timestamp: string }) => {
      toast({
        title: 'Системне повідомлення',
        description: data.message,
        duration: 3000
      })
    })

    console.log('WebSocket connected')
  }, [user, updateCandidate, addCandidate, deleteCandidate, reorderCandidates, toast])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      console.log('WebSocket disconnected')
    }
  }, [])

  const emitCandidateUpdate = useCallback((data: {
    id: number
    field: string
    value: any
  }) => {
    if (socketRef.current && user) {
      socketRef.current.emit('candidate-update', {
        ...data,
        userId: user.id,
        userName: user.fullName || user.username
      })
    }
  }, [user])

  const emitCandidateReorder = useCallback((data: {
    draggedId: number
    targetId: number
  }) => {
    if (socketRef.current && user) {
      socketRef.current.emit('candidate-reorder', {
        ...data,
        userId: user.id,
        userName: user.fullName || user.username
      })
    }
  }, [user])

  const emitCandidateCreate = useCallback((data: any) => {
    if (socketRef.current && user) {
      socketRef.current.emit('candidate-create', {
        ...data,
        userId: user.id,
        userName: user.fullName || user.username
      })
    }
  }, [user])

  const emitCandidateDelete = useCallback((id: number) => {
    if (socketRef.current && user) {
      socketRef.current.emit('candidate-delete', {
        id,
        userId: user.id,
        userName: user.fullName || user.username
      })
    }
  }, [user])

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    socket: socketRef.current,
    emitCandidateUpdate,
    emitCandidateReorder,
    emitCandidateCreate,
    emitCandidateDelete,
    connect,
    disconnect
  }
}
