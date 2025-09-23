import { z } from 'zod';

const variantBaseSchema = z.object({
  id: z.string().uuid().optional(),
  sizeId: z.string().uuid().optional(),
  sizeValue: z.string().min(1),
  sizeLabel: z.string().min(1).optional(),
  stock: z.number().int().nonnegative(),
  metadata: z.record(z.any()).optional()
});

const createVariantSchema = variantBaseSchema.omit({ id: true });
const updateVariantSchema = variantBaseSchema;

export const createProductSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
  brandId: z.string().uuid().optional(),
  genderId: z.string().uuid().optional(),
  shoeTypeId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  variants: z.array(createVariantSchema).optional()
});

export const updateProductSchema = createProductSchema.partial().extend({
  variants: z.array(updateVariantSchema).optional()
});

export const productFilterSchema = z.object({
  genderId: z.string().uuid().optional(),
  shoeTypeId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1)
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type CreateProductVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateVariantSchema>;
