import { Router } from 'express';
import { authRouter } from './auth.routes';
import { productRouter } from './product.routes';
import { userRouter } from './user.routes';
import { cartRouter } from './cart.routes';
import { orderRouter } from './order.routes';
import { referenceRouter } from './reference.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/references', referenceRouter);
