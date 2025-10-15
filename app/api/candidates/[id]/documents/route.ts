import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Отримати документи кандидата
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const candidateId = parseInt(params.id)
    if (isNaN(candidateId)) {
      return NextResponse.json({ error: 'Invalid candidate ID' }, { status: 400 })
    }

    // Перевіряємо права доступу до кандидата
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        isDeleted: false,
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const documents = await prisma.document.findMany({
      where: { candidateId },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Завантажити новий документ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const candidateId = parseInt(params.id)
    if (isNaN(candidateId)) {
      return NextResponse.json({ error: 'Invalid candidate ID' }, { status: 400 })
    }

    // Перевіряємо права доступу до кандидата
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        isDeleted: false,
        ...(user.role !== 'ADMIN' && user.role !== 'DIRECTOR' && user.branch ? {
          branch: user.branch
        } : {})
      }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Створюємо директорію для файлів кандидата
    const uploadDir = join(process.cwd(), 'uploads', 'candidates', candidateId.toString())
    await mkdir(uploadDir, { recursive: true })

    // Генеруємо унікальне ім'я файлу
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${file.name}`
    const filePath = join(uploadDir, fileName)

    // Зберігаємо файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Створюємо запис в базі даних
    const document = await prisma.document.create({
      data: {
        candidateId,
        type,
        title: title || file.name,
        fileName: file.name,
        filePath: `uploads/candidates/${candidateId}/${fileName}`,
        fileSize: buffer.length,
        mimeType: file.type,
        description,
        uploadedBy: user.userId
      }
    })

    // Створюємо активність про завантаження документа
    await prisma.activity.create({
      data: {
        candidateId,
        type: 'document_uploaded',
        title: 'Завантажено документ',
        description: `Завантажено документ: ${title || file.name}`,
        userId: user.userId,
        userName: user.fullName,
        metadata: JSON.stringify({
          documentId: document.id,
          fileName: file.name,
          fileSize: buffer.length
        })
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
