import { Router } from 'express';
import { loginHandler, registerHandler } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validateRequest';
import { loginSchema, registerSchema } from '../dtos/auth.dto';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), registerHandler);
authRouter.post('/login', validateBody(loginSchema), loginHandler);
