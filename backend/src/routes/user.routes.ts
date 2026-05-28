import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createUserSchema, updateUserSchema, userQuerySchema } from '../validators/user.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', authorize(Role.ADMIN, Role.MANAGER), validateQuery(userQuerySchema), userController.getAll);
router.get('/:id', authorize(Role.ADMIN, Role.MANAGER), userController.getById);
router.post('/', authorize(Role.ADMIN), validateBody(createUserSchema), userController.create);
router.put('/:id', validateBody(updateUserSchema), userController.update);
router.delete('/:id', authorize(Role.ADMIN), userController.delete);
router.patch('/:id/suspend', authorize(Role.ADMIN), userController.suspend);

export default router;
