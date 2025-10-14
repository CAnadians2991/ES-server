import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, checkPermission } from '@/lib/auth'

// Кеш для часто запитуваних даних
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30000 // 30 секунд

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser || !checkPermission(authUser.role, 'candidates', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500) // Максимум 500
    const search = searchParams.get('search')
    const branch = searchParams.get('branch')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'sortOrder'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Створюємо ключ кешу
    const cacheKey = `candidates-${page}-${limit}-${search}-${branch}-${status}-${sortBy}-${sortOrder}`
    
    // Перевіряємо кеш
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const skip = (page - 1) * limit

    // Будуємо where умову
    const where: any = {
      isDeleted: false
    }

    if (branch && branch !== 'all') {
      where.branch = branch
    }

    if (status && status !== 'all') {
      where.candidateStatus = status
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { projectName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Будуємо orderBy
    const orderBy: any = {}
    if (sortBy === 'sortOrder') {
      orderBy.sortOrder = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Паралельні запити для оптимізації
    const [candidates, totalCount] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          applicationNumber: true,
          branch: true,
          responsible: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          age: true,
          candidateCountry: true,
          vacancyCountry: true,
          projectName: true,
          partnerNumber: true,
          arrivalDate: true,
          candidateStatus: true,
          paymentAmount: true,
          paymentStatus: true,
          recipientType: true,
          passportNumber: true,
          passportExpiry: true,
          education: true,
          workExperience: true,
          languageSkills: true,
          familyStatus: true,
          children: true,
          comment: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.candidate.count({ where })
    ])

    const result = {
      data: candidates,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    }

    // Зберігаємо в кеш
    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser || !checkPermission(authUser.role, 'candidates', 'write')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const candidate = await prisma.candidate.create({
      data: {
        ...body,
        sortOrder: Date.now() // Простий спосіб отримати унікальний порядок
      }
    })

    // Очищаємо кеш
    clearCache()

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('Error creating candidate:', error)
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
  }
}

// Функція для очищення кешу
function clearCache() {
  cache.clear()
}

// Експортуємо функцію для використання в інших місцях
export { clearCache }
