import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

interface AuditParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditParams) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details as Prisma.InputJsonValue | undefined,
      ipAddress: params.ipAddress,
    },
  });
}
