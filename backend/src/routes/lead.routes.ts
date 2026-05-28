import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  leadQuerySchema,
} from '../validators/lead.validator';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(leadQuerySchema), leadController.getAll);
router.get('/kanban', leadController.getKanban);
router.get('/export/csv', leadController.exportCsv);
router.get('/:id', leadController.getById);
router.post('/', validateBody(createLeadSchema), leadController.create);
router.put('/:id', validateBody(updateLeadSchema), leadController.update);
router.patch('/:id/status', validateBody(updateLeadStatusSchema), leadController.updateStatus);
router.delete('/:id', leadController.delete);

export default router;
