import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/audit-logs', authorize(Role.ADMIN), dashboardController.getAuditLogs);

export default router;
