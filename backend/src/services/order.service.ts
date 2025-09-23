import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';
import { CreateOrderInput, UpdateOrderStatusInput } from '../dtos/order.dto';
import { processPayment } from './payment.service';

export const createOrder = async (userId: string, payload: CreateOrderInput) => {
  const { items, paymentProvider, shippingAddress, billingAddress, paymentMethod } = payload;
  const productIds = items.map((item) => item.productId);

  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    throw new HttpError(404, 'One or more products not found');
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    if (product.stock < item.quantity) {
      throw new HttpError(422, `Insufficient stock for product ${product.name}`);
    }
  }

  const total = items.reduce((acc, item) => {
    const product = productMap.get(item.productId)!;
    return acc.plus(new Prisma.Decimal(product.price).times(item.quantity));
  }, new Prisma.Decimal(0));

  const normalizedCardNumber = paymentMethod.cardNumber.replace(/\s+/g, '');
  const paymentSummary = {
    provider: paymentProvider,
    cardholderName: paymentMethod.cardholderName,
    cardLast4: normalizedCardNumber.slice(-4),
    expMonth: paymentMethod.expMonth,
    expYear: paymentMethod.expYear
  } satisfies Record<string, unknown>;

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        total,
        shippingAddress: shippingAddress as Prisma.InputJsonValue,
        billingAddress: (billingAddress ?? shippingAddress) as Prisma.InputJsonValue,
        paymentSummary: paymentSummary as Prisma.InputJsonValue,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: productMap.get(item.productId)!.price
          }))
        }
      },
      include: { items: true }
    });

    await Promise.all(
      items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    );

    await tx.cartItem.deleteMany({
      where: {
        cart: { userId },
        productId: { in: productIds }
      }
    });

    return createdOrder;
  });

  const paymentResult = await processPayment(order.id, paymentProvider, {
    ...paymentSummary
  });

  return { orderId: order.id, orderStatus: paymentResult.orderStatus, payment: paymentResult.payment };
};

export const listOrdersForUser = (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              price: true,
              sku: true
            }
          }
        }
      },
      payment: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getOrderById = async (orderId: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, payment: true }
  });

  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  if (role !== 'ADMIN' && role !== 'SELLER' && order.userId !== userId) {
    throw new HttpError(403, 'Not allowed to access this order');
  }

  return order;
};

export const updateOrderStatus = async (orderId: string, payload: UpdateOrderStatusInput) => {
  try {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: payload.status },
      include: { items: true, payment: true }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Order not found');
    }
    throw error;
  }
};

export const listAllOrders = () => {
  return prisma.order.findMany({
    include: { items: { include: { product: true } }, payment: true, user: true },
    orderBy: { createdAt: 'desc' }
  });
};
