import { httpRequest } from './httpClient';
import type { PaginatedResult } from './httpClient';

type UUID = string;

type RawProductVariant = {
  id: string;
  productId: string;
  sizeId: string | null;
  sizeValue: string;
  stock: number;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
  size?: {
    id: string;
    label: string;
    value: string;
  } | null;
};

type RawAdminProduct = {
  id: UUID;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  brandId?: UUID | null;
  genderId?: UUID | null;
  shoeTypeId?: UUID | null;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
  variants: RawProductVariant[];
};

export interface AdminProductVariantDto {
  id: string;
  sizeId?: string;
  sizeValue: string;
  sizeLabel: string;
  stock: number;
  metadata?: unknown;
}

export interface AdminProductDto {
  id: UUID;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  brandId?: UUID | null;
  genderId?: UUID | null;
  shoeTypeId?: UUID | null;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
  variants: AdminProductVariantDto[];
}

export interface AdminProductFilter {
  search?: string;
  brandId?: UUID;
  genderId?: UUID;
  shoeTypeId?: UUID;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface AdminProductVariantInput {
  id?: string;
  sizeId?: string;
  sizeValue: string;
  sizeLabel?: string;
  stock: number;
  metadata?: unknown;
}

export interface CreateAdminProductPayload {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  brandId?: UUID;
  genderId?: UUID;
  shoeTypeId?: UUID;
  metadata?: unknown;
  variants?: AdminProductVariantInput[];
}

export interface UpdateAdminProductPayload extends Partial<CreateAdminProductPayload> {
  variants?: AdminProductVariantInput[];
}

const mapVariant = (variant: RawProductVariant): AdminProductVariantDto => ({
  id: variant.id,
  sizeId: variant.sizeId ?? undefined,
  sizeValue: variant.sizeValue,
  sizeLabel: variant.size?.label ?? variant.sizeValue,
  stock: variant.stock,
  metadata: variant.metadata
});

const mapProduct = (product: RawAdminProduct): AdminProductDto => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  description: product.description,
  price: typeof product.price === 'number' ? product.price : Number(product.price),
  stock: typeof product.stock === 'number' ? product.stock : Number(product.stock),
  imageUrl: product.imageUrl ?? undefined,
  brandId: product.brandId ?? undefined,
  genderId: product.genderId ?? undefined,
  shoeTypeId: product.shoeTypeId ?? undefined,
  metadata: product.metadata,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  variants: (product.variants ?? []).map((variant) => ({
    ...mapVariant(variant),
    stock: typeof variant.stock === 'number' ? variant.stock : Number(variant.stock)
  }))
});

export async function fetchAdminProducts(
  filters: AdminProductFilter = {},
): Promise<PaginatedResult<AdminProductDto>> {
  const response = await httpRequest<PaginatedResult<RawAdminProduct>>('/products', {
    method: 'GET',
    query: filters as Record<string, unknown>,
  });

  return {
    ...response,
    items: response.items.map(mapProduct),
  };
}

export async function fetchAdminProduct(productId: string): Promise<AdminProductDto> {
  const product = await httpRequest<RawAdminProduct>(`/products/${productId}`, {
    method: 'GET',
  });
  return mapProduct(product);
}

export async function createAdminProduct(payload: CreateAdminProductPayload): Promise<AdminProductDto> {
  const product = await httpRequest<RawAdminProduct>('/products', {
    method: 'POST',
    body: payload,
  });
  return mapProduct(product);
}

export async function updateAdminProduct(
  productId: string,
  payload: UpdateAdminProductPayload,
): Promise<AdminProductDto> {
  const product = await httpRequest<RawAdminProduct>(`/products/${productId}`, {
    method: 'PATCH',
    body: payload,
  });
  return mapProduct(product);
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await httpRequest(`/products/${productId}`, {
    method: 'DELETE',
  });
}

export interface OrderMetricsDto {
  totalOrders: number;
  totalRevenue: number;
}

export async function fetchOrderMetrics(): Promise<OrderMetricsDto> {
  return httpRequest<OrderMetricsDto>('/orders/metrics', {
    method: 'GET',
  });
}
