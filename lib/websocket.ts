import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CandidateUpdate {
  id: number
  field: string
  value: any
  userId: number
  userName: string
}

interface CandidateReorder {
  draggedId: number
  targetId: number
  userId: number
  userName: string
}

export function setupWebSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  // Кімнати для різних модулів
  const CANDIDATES_ROOM = 'candidates'
  const PAYMENTS_ROOM = 'payments'
  const USERS_ROOM = 'users'

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Приєднання до кімнати кандидатів
    socket.on('join-candidates', () => {
      socket.join(CANDIDATES_ROOM)
      console.log('User joined candidates room')
    })

    // Приєднання до кімнати платежів
    socket.on('join-payments', () => {
      socket.join(PAYMENTS_ROOM)
      console.log('User joined payments room')
    })

    // Приєднання до кімнати користувачів
    socket.on('join-users', () => {
      socket.join(USERS_ROOM)
      console.log('User joined users room')
    })

    // Оновлення кандидата
    socket.on('candidate-update', async (data: CandidateUpdate) => {
      try {
        // Оновлюємо в базі даних
        await prisma.candidate.update({
          where: { id: data.id },
          data: { [data.field]: data.value }
        })

        // Відправляємо оновлення всім іншим користувачам в кімнаті
        socket.to(CANDIDATES_ROOM).emit('candidate-updated', {
          id: data.id,
          field: data.field,
          value: data.value,
          updatedBy: {
            id: data.userId,
            name: data.userName
          },
          timestamp: new Date()
        })

        console.log(`Candidate ${data.id} updated by ${data.userName}`)
      } catch (error) {
        console.error('Error updating candidate:', error)
        socket.emit('error', { message: 'Failed to update candidate' })
      }
    })

    // Переміщення кандидата
    socket.on('candidate-reorder', async (data: CandidateReorder) => {
      try {
        // Оновлюємо порядок в базі даних
        const dragged = await prisma.candidate.findUnique({ 
          where: { id: data.draggedId },
          select: { sortOrder: true }
        })
        const target = await prisma.candidate.findUnique({ 
          where: { id: data.targetId },
          select: { sortOrder: true }
        })

        if (dragged && target) {
          await prisma.candidate.update({
            where: { id: data.draggedId },
            data: { sortOrder: target.sortOrder + 1 } as any
          })
        }

        // Відправляємо оновлення всім іншим користувачам
        socket.to(CANDIDATES_ROOM).emit('candidate-reordered', {
          draggedId: data.draggedId,
          targetId: data.targetId,
          reorderedBy: {
            id: data.userId,
            name: data.userName
          },
          timestamp: new Date()
        })

        console.log(`Candidate ${data.draggedId} reordered by ${data.userName}`)
      } catch (error) {
        console.error('Error reordering candidate:', error)
        socket.emit('error', { message: 'Failed to reorder candidate' })
      }
    })

    // Додавання нового кандидата
    socket.on('candidate-create', async (data: any) => {
      try {
        const newCandidate = await prisma.candidate.create({
          data: {
            ...data,
            sortOrder: Date.now() // Простий спосіб отримати унікальний порядок
          }
        })

        // Відправляємо новий кандидат всім користувачам
        io.to(CANDIDATES_ROOM).emit('candidate-created', {
          candidate: newCandidate,
          createdBy: {
            id: data.userId,
            name: data.userName
          },
          timestamp: new Date()
        })

        console.log(`New candidate created by ${data.userName}`)
      } catch (error) {
        console.error('Error creating candidate:', error)
        socket.emit('error', { message: 'Failed to create candidate' })
      }
    })

    // Видалення кандидата
    socket.on('candidate-delete', async (data: { id: number; userId: number; userName: string }) => {
      try {
        // Soft delete
        await prisma.candidate.update({
          where: { id: data.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: data.userId
          } as any
        })

        // Відправляємо інформацію про видалення
        socket.to(CANDIDATES_ROOM).emit('candidate-deleted', {
          id: data.id,
          deletedBy: {
            id: data.userId,
            name: data.userName
          },
          timestamp: new Date()
        })

        console.log(`Candidate ${data.id} deleted by ${data.userName}`)
      } catch (error) {
        console.error('Error deleting candidate:', error)
        socket.emit('error', { message: 'Failed to delete candidate' })
      }
    })

    // Відключення
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

// Функція для відправки системних повідомлень
export function broadcastSystemMessage(message: string, room?: string) {
  const io = global.io as SocketIOServer
  if (io) {
    if (room) {
      io.to(room).emit('system-message', { message, timestamp: new Date() })
    } else {
      io.emit('system-message', { message, timestamp: new Date() })
    }
  }
}
