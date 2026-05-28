import bcrypt from 'bcryptjs';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { NotFoundError, AppError, ForbiddenError } from '../utils/errors';
import { createAuditLog } from './audit.service';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  role: true,
  status: true,
  avatar: true,
  emailVerified: true,
  lastActivity: true,
  lastOnline: true,
  createdAt: true,
  updatedAt: true,
};

export class UserService {
  async findAll(query: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async create(
    data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      company?: string;
      role?: Role;
      status?: UserStatus;
    },
    actorId: string,
  ) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Email already exists', 'EMAIL_EXISTS');

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        company: data.company,
        role: data.role ?? 'EMPLOYEE',
        status: data.status ?? 'ACTIVE',
      },
      select: userSelect,
    });

    await createAuditLog({
      userId: actorId,
      action: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      details: { email: user.email, role: user.role },
    });

    return user;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      phone: string | null;
      company: string | null;
      role: Role;
      status: UserStatus;
    }>,
    actorId: string,
    actorRole: Role,
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    if (actorRole !== 'ADMIN' && actorRole !== 'MANAGER') {
      if (actorId !== id) throw new ForbiddenError();
      delete data.role;
      delete data.status;
    }

    if (data.role && actorRole !== 'ADMIN') {
      throw new ForbiddenError('Only admins can change roles');
    }

    const updateData: Prisma.UserUpdateInput = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, config.bcryptRounds);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    await createAuditLog({
      userId: actorId,
      action: 'UPDATE',
      entity: 'USER',
      entityId: id,
      details: data as Record<string, unknown>,
    });

    return updated;
  }

  async delete(id: string, actorId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    await prisma.user.delete({ where: { id } });
    await createAuditLog({
      userId: actorId,
      action: 'DELETE',
      entity: 'USER',
      entityId: id,
    });
    return { message: 'User deleted' };
  }

  async suspend(id: string, actorId: string) {
    return this.update(id, { status: 'SUSPENDED' }, actorId, 'ADMIN');
  }

  async updateAvatar(id: string, avatarPath: string) {
    return prisma.user.update({
      where: { id },
      data: { avatar: avatarPath },
      select: userSelect,
    });
  }
}

export const userService = new UserService();
