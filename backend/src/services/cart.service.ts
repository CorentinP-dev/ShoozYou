import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

export const getCart = (userId: string) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });
};

export const addItemToCart = async (userId: string, productId: string, quantity: number) => {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity }
  });

  return getCart(userId);
};

export const updateCartItem = async (userId: string, productId: string, quantity: number) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw new HttpError(404, 'Cart not found');
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });
    return getCart(userId);
  }

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity }
  });

  return getCart(userId);
};

export const removeItemFromCart = async (userId: string, productId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw new HttpError(404, 'Cart not found');
  }

  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } }
  });

  return getCart(userId);
};

export const clearCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
  return getCart(userId);
};
