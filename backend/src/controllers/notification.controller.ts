import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth';

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class NotificationController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const result = await notificationService.findAll(req.user!.userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const notification = await notificationService.markAsRead(paramId(req.params.id), req.user!.userId);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
