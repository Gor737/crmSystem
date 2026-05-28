import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { AppError, UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors';
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
};

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        company: data.company,
      },
      select: userSelect,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await createAuditLog({ userId: user.id, action: 'REGISTER', entity: 'USER', entityId: user.id });

    return { user, ...tokens };
  }

  async login(email: string, password: string, meta?: { userAgent?: string; ip?: string }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account has been suspended');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActivity: new Date(), lastOnline: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, meta);
    const { password: _, ...safeUser } = user;

    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      ipAddress: meta?.ip,
    });

    return { user: safeUser, ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      throw new UnauthorizedError('Session expired');
    }

    if (session.user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account suspended');
    }

    await prisma.session.delete({ where: { id: session.id } });
    return this.generateTokens(session.user.id, session.user.email, session.user.role);
  }

  async logout(refreshToken: string, userId?: string) {
    await prisma.session.deleteMany({ where: { refreshToken } });
    if (userId) {
      await createAuditLog({ userId, action: 'LOGOUT', entity: 'USER', entityId: userId });
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If the email exists, a reset link will be sent' };
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordReset.deleteMany({ where: { email } });
    await prisma.passwordReset.create({
      data: { email, token, expiresAt },
    });

    // Email integration ready - log token in development
    if (config.nodeEnv === 'development') {
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
    }

    return {
      message: 'If the email exists, a reset link will be sent',
      ...(config.nodeEnv === 'development' ? { devToken: token } : {}),
    };
  }

  async resetPassword(token: string, password: string) {
    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);
    await prisma.$transaction([
      prisma.user.update({
        where: { email: reset.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
      prisma.session.deleteMany({
        where: { user: { email: reset.email } },
      }),
    ]);

    return { message: 'Password reset successful' };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: import('@prisma/client').Role,
    meta?: { userAgent?: string; ip?: string },
  ) {
    const payload = { userId, email, role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
