import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';
import { CreateProductInput, ProductFilterInput, UpdateProductInput } from '../dtos/product.dto';

export const createProduct = async (payload: CreateProductInput) => {
  return prisma.product.create({
    data: payload,
    include: { brand: true, gender: true, shoeType: true }
  });
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, gender: true, shoeType: true }
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  return product;
};

export const updateProduct = async (id: string, payload: UpdateProductInput) => {
  try {
    return await prisma.product.update({
      where: { id },
      data: payload,
      include: { brand: true, gender: true, shoeType: true }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Product not found');
    }
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Product not found');
    }
    throw error;
  }
};

export const listProducts = async (filters: ProductFilterInput) => {
  const { page, limit, search, minPrice, maxPrice, brandId, genderId, shoeTypeId } = filters;
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (brandId) {
    where.brandId = brandId;
  }

  if (genderId) {
    where.genderId = genderId;
  }

  if (shoeTypeId) {
    where.shoeTypeId = shoeTypeId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (minPrice !== undefined) {
      priceFilter.gte = new Prisma.Decimal(minPrice);
    }
    if (maxPrice !== undefined) {
      priceFilter.lte = new Prisma.Decimal(maxPrice);
    }
    where.price = priceFilter;
  }

  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { brand: true, gender: true, shoeType: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit))
    }
  };
};

export const adjustProductStock = async (productId: string, delta: number) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock: { increment: delta } }
  });

  if (product.stock < 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: delta } }
    });
    throw new HttpError(422, 'Insufficient stock for product');
  }

  return product;
};
