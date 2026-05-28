import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export class DashboardController {
  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await dashboardService.getStats(req.user!.userId, req.user!.role);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { user: { select: { id: true, name: true, email: true } } },
        }),
        prisma.auditLog.count(),
      ]);
      res.json({
        success: true,
        data: {
          logs,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
