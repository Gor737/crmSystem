import { Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service';
import { AuthRequest } from '../middleware/auth';

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class LeadController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.findAll(
        req.query as never,
        req.user!.userId,
        req.user!.role,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getKanban = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const columns = await leadService.findByKanban(req.user!.userId, req.user!.role);
      res.json({ success: true, data: columns });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.findById(paramId(req.params.id), req.user!.userId, req.user!.role);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.create(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.update(
        paramId(req.params.id),
        req.body,
        req.user!.userId,
        req.user!.role,
      );
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateStatus(
        paramId(req.params.id),
        req.body.status,
        req.user!.userId,
        req.user!.role,
      );
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.delete(paramId(req.params.id), req.user!.userId, req.user!.role);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  exportCsv = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const csv = await leadService.exportCsv(req.user!.userId, req.user!.role);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  };
}

export const leadController = new LeadController();
