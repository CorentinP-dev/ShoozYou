import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { validateBody, validateQuery } from '../middlewares/validateRequest';
import {
  listUsersQuerySchema,
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema
} from '../dtos/user.dto';
import {
  deleteUserHandler,
  getMeHandler,
  getUserHandler,
  listUsersHandler,
  updateProfileHandler,
  updateUserRoleHandler,
  updateUserStatusHandler
} from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/me', getMeHandler);
userRouter.patch('/me', validateBody(updateProfileSchema), updateProfileHandler);

userRouter.get('/', authorizeRoles('ADMIN'), validateQuery(listUsersQuerySchema), listUsersHandler);
userRouter.get('/:userId', authorizeRoles('ADMIN'), getUserHandler);
userRouter.patch(
  '/:userId/role',
  authorizeRoles('ADMIN'),
  validateBody(updateUserRoleSchema),
  updateUserRoleHandler
);
userRouter.patch(
  '/:userId/status',
  authorizeRoles('ADMIN'),
  validateBody(updateUserStatusSchema),
  updateUserStatusHandler
);
userRouter.delete('/:userId', authorizeRoles('ADMIN'), deleteUserHandler);
