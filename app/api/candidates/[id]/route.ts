import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createAuditLog } from '@/lib/audit-log'

const candidateUpdateSchema = z.object({
  branch: z.string().optional(),
  responsible: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().nullable().optional(),
  age: z.union([z.number().min(1).max(120), z.null()]).optional(),
  candidateCountry: z.string().optional(),
  vacancyCountry: z.string().optional(),
  projectName: z.string().optional(),
  partnerNumber: z.string().optional(),
  arrivalDate: z.string().nullable().optional(),
  candidateStatus: z.string().optional(),
  paymentAmount: z.union([z.number(), z.null()]).optional(),
  paymentStatus: z.string().nullable().optional(),
  recipientType: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  
  // Нові поля
  applicationNumber: z.string().nullable().optional(),
  passportNumber: z.string().nullable().optional(),
  passportExpiry: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  workExperience: z.string().nullable().optional(),
  languageSkills: z.string().nullable().optional(),
  familyStatus: z.string().nullable().optional(),
  children: z.union([z.number().min(0), z.null()]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: parseInt(params.id) },
      include: { payments: true },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('Error fetching candidate:', error)
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = candidateUpdateSchema.parse(body)
    const candidateId = parseInt(params.id)

    // Отримуємо старі дані для audit log
    const oldCandidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    })

    if (!oldCandidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Очищаємо null значення для Int полів та обробляємо дати
    const updateData: any = { ...validatedData }
    if (updateData.age === null) delete updateData.age
    if (updateData.paymentAmount === null) delete updateData.paymentAmount
    if (updateData.children === null) delete updateData.children
    
    // Обробляємо дати
    if (updateData.arrivalDate) {
      updateData.arrivalDate = new Date(updateData.arrivalDate)
    } else if (updateData.arrivalDate === null) {
      delete updateData.arrivalDate
    }
    
    if (updateData.passportExpiry) {
      updateData.passportExpiry = new Date(updateData.passportExpiry)
    } else if (updateData.passportExpiry === null) {
      delete updateData.passportExpiry
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: updateData,
    })

    // Логуємо зміни для кожного поля
    for (const [key, newValue] of Object.entries(validatedData)) {
      const oldValue = oldCandidate[key as keyof typeof oldCandidate]
      if (oldValue !== newValue) {
        await createAuditLog({
          entityType: 'Candidate',
          entityId: candidateId,
          action: 'UPDATE',
          fieldName: key,
          oldValue: String(oldValue),
          newValue: String(newValue),
          oldData: { [key]: oldValue },
          newData: { [key]: newValue },
        })
      }
    }

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('Error updating candidate:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = parseInt(params.id)
    
    // Soft delete замість повного видалення
    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      } as any,
    })

    // Логуємо видалення
    await createAuditLog({
      entityType: 'Candidate',
      entityId: candidateId,
      action: 'DELETE',
      oldData: candidate,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting candidate:', error)
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 })
  }
}

