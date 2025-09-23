import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';
import {
  CreateProductInput,
  CreateProductVariantInput,
  ProductFilterInput,
  UpdateProductInput,
  UpdateProductVariantInput
} from '../dtos/product.dto';

const productInclude = {
  brand: true,
  gender: true,
  shoeType: true,
  variants: {
    include: {
      size: true
    }
  }
} as const;

const normalizeSizeValue = (value: string) => value.trim().toUpperCase();

const mapVariantCreateInput = (variant: CreateProductVariantInput | UpdateProductVariantInput) => ({
  sizeValue: variant.sizeValue.trim(),
  stock: variant.stock,
  metadata: variant.metadata as Prisma.InputJsonValue,
  size: variant.sizeId
    ? {
        connect: {
          id: variant.sizeId
        }
      }
    : {
        connectOrCreate: {
          where: { value: normalizeSizeValue(variant.sizeValue) },
          create: {
            value: normalizeSizeValue(variant.sizeValue),
            label: variant.sizeLabel ?? `${variant.sizeValue} EU`
          }
        }
      }
});

const computeStockFromVariants = (variants?: ReadonlyArray<CreateProductVariantInput | UpdateProductVariantInput>) => {
  if (!variants || variants.length === 0) {
    return undefined;
  }
  return variants.reduce((total, variant) => total + variant.stock, 0);
};

export const createProduct = async (payload: CreateProductInput) => {
  const { variants, stock, ...rest } = payload;
  const computedStock = computeStockFromVariants(variants) ?? stock ?? 0;

  return prisma.product.create({
    data: {
      ...rest,
      stock: computedStock,
      variants: variants?.length
        ? {
            create: variants.map(mapVariantCreateInput)
          }
        : undefined
    },
    include: productInclude
  });
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  return product;
};

export const updateProduct = async (id: string, payload: UpdateProductInput) => {
  const { variants, stock, ...rest } = payload;

  try {
    return await prisma.$transaction(async (tx) => {
      const data: Prisma.ProductUpdateInput = {
        ...rest
      };

      const variantsProvided = variants !== undefined;
      const computedStock = computeStockFromVariants(variants);

      if (variantsProvided) {
        data.stock = computedStock ?? stock ?? 0;
        data.variants = {
          deleteMany: {},
          create: variants?.map(mapVariantCreateInput)
        };
      } else if (stock !== undefined) {
        data.stock = stock;
      }

      return tx.product.update({
        where: { id },
        data,
        include: productInclude
      });
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
      include: productInclude,
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
