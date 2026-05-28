import { Prisma, LeadStatus, Priority, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { createAuditLog } from './audit.service';

const leadInclude = {
  assignedTo: {
    select: { id: true, name: true, email: true, avatar: true },
  },
  createdBy: {
    select: { id: true, name: true, email: true },
  },
  _count: { select: { activities: true } },
};

export class LeadService {
  async findAll(
    query: {
      page: number;
      limit: number;
      search?: string;
      status?: LeadStatus;
      priority?: Priority;
      assignedToId?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    },
    userId: string,
    role: Role,
  ) {
    const where: Prisma.LeadWhereInput = {};

    if (role === 'EMPLOYEE') {
      where.assignedToId = userId;
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedToId) where.assignedToId = query.assignedToId;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: leadInclude,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      leads,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findByKanban(userId: string, role: Role) {
    const where: Prisma.LeadWhereInput = role === 'EMPLOYEE' ? { assignedToId: userId } : {};

    const leads = await prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: { updatedAt: 'desc' },
    });

    const columns: Record<LeadStatus, typeof leads> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      PROPOSAL_SENT: [],
      NEGOTIATION: [],
      WON: [],
      LOST: [],
    };

    for (const lead of leads) {
      columns[lead.status].push(lead);
    }

    return columns;
  }

  async findById(id: string, userId: string, role: Role) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        ...leadInclude,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!lead) throw new NotFoundError('Lead not found');
    if (role === 'EMPLOYEE' && lead.assignedToId !== userId) {
      throw new ForbiddenError('You can only view your assigned leads');
    }
    return lead;
  }

  async create(
    data: {
      fullName: string;
      company?: string;
      email?: string;
      phone?: string;
      source?: string;
      notes?: string;
      status?: LeadStatus;
      priority?: Priority;
      assignedToId?: string | null;
    },
    userId: string,
  ) {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        email: data.email || null,
        createdById: userId,
        assignedToId: data.assignedToId ?? userId,
      },
      include: leadInclude,
    });

    await this.logActivity(lead.id, userId, 'LEAD_CREATED', `Lead "${lead.fullName}" was created`);
    await createAuditLog({
      userId,
      action: 'CREATE',
      entity: 'LEAD',
      entityId: lead.id,
    });

    return lead;
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      company?: string;
      email?: string;
      phone?: string;
      source?: string;
      notes?: string;
      status?: LeadStatus;
      priority?: Priority;
      assignedToId?: string | null;
    }>,
    userId: string,
    role: Role,
  ) {
    const existing = await this.findById(id, userId, role);
    const lead = await prisma.lead.update({
      where: { id },
      data: { ...data, email: data.email === '' ? null : data.email },
      include: leadInclude,
    });

    if (data.status && data.status !== existing.status) {
      await this.logActivity(
        id,
        userId,
        'STATUS_CHANGE',
        `Status changed from ${existing.status} to ${data.status}`,
        { from: existing.status, to: data.status },
      );
    }

    await createAuditLog({ userId, action: 'UPDATE', entity: 'LEAD', entityId: id });
    return lead;
  }

  async updateStatus(id: string, status: LeadStatus, userId: string, role: Role) {
    return this.update(id, { status }, userId, role);
  }

  async delete(id: string, userId: string, role: Role) {
    await this.findById(id, userId, role);
    await prisma.lead.delete({ where: { id } });
    await createAuditLog({ userId, action: 'DELETE', entity: 'LEAD', entityId: id });
    return { message: 'Lead deleted' };
  }

  async exportCsv(userId: string, role: Role) {
    const where: Prisma.LeadWhereInput = role === 'EMPLOYEE' ? { assignedToId: userId } : {};
    const leads = await prisma.lead.findMany({
      where,
      include: { assignedTo: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Full Name',
      'Company',
      'Email',
      'Phone',
      'Source',
      'Status',
      'Priority',
      'Assigned To',
      'Created At',
    ];
    const rows = leads.map((l) =>
      [
        l.fullName,
        l.company || '',
        l.email || '',
        l.phone || '',
        l.source || '',
        l.status,
        l.priority,
        l.assignedTo?.name || '',
        l.createdAt.toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  private async logActivity(
    leadId: string,
    userId: string,
    type: string,
    description: string,
    metadata?: Record<string, unknown>,
  ) {
    return prisma.activity.create({
      data: { leadId, userId, type, description, metadata: metadata as Prisma.InputJsonValue | undefined },
    });
  }
}

export const leadService = new LeadService();
