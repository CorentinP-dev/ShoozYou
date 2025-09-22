import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateRequest';
import { updateProfileSchema } from '../dtos/user.dto';
import { deleteUserHandler, getMeHandler, listUsersHandler, updateProfileHandler } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/me', getMeHandler);
userRouter.patch('/me', validateBody(updateProfileSchema), updateProfileHandler);

userRouter.get('/', authorizeRoles('ADMIN'), listUsersHandler);
userRouter.delete('/:userId', authorizeRoles('ADMIN'), deleteUserHandler);
