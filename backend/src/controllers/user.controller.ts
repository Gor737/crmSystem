import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class UserController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await userService.findAll(req.query as never);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userService.findById(paramId(req.params.id));
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userService.create(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userService.update(
        paramId(req.params.id),
        req.body,
        req.user!.userId,
        req.user!.role,
      );
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await userService.delete(paramId(req.params.id), req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  suspend = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userService.suspend(paramId(req.params.id), req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
