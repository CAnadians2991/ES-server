import { prisma } from './prisma'

export interface AuditLogParams {
  entityType: string
  entityId: number
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
  userId?: number
  userName?: string
  oldData?: any
  newData?: any
  fieldName?: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        userName: params.userName,
        oldData: params.oldData ? JSON.stringify(params.oldData) : null,
        newData: params.newData ? JSON.stringify(params.newData) : null,
        fieldName: params.fieldName,
        oldValue: params.oldValue,
        newValue: params.newValue,
        ipAddress: params.ipAddress,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(entityType: string, entityId: number, limit = 50) {
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

export async function revertChange(auditLogId: number) {
  const log = await prisma.auditLog.findUnique({
    where: { id: auditLogId },
  })

  if (!log || !log.oldData) {
    throw new Error('Cannot revert: no old data found')
  }

  const oldData = JSON.parse(log.oldData)

  if (log.entityType === 'Candidate') {
    await prisma.candidate.update({
      where: { id: log.entityId },
      data: oldData,
    })

    await createAuditLog({
      entityType: log.entityType,
      entityId: log.entityId,
      action: 'RESTORE',
      oldData: log.newData ? JSON.parse(log.newData) : null,
      newData: oldData,
    })
  }

  return true
}

