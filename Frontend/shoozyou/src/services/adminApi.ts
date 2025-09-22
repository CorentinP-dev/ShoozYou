import { httpRequest } from './httpClient';
import type { PaginatedResult } from './httpClient';

type UUID = string;

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

export interface CreateAdminProductPayload {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  brandId?: UUID;
  genderId?: UUID;
  shoeTypeId?: UUID;
  metadata?: unknown;
}

export type UpdateAdminProductPayload = Partial<CreateAdminProductPayload>;

export async function fetchAdminProducts(
  filters: AdminProductFilter = {},
): Promise<PaginatedResult<AdminProductDto>> {
  return httpRequest<PaginatedResult<AdminProductDto>>('/products', {
    method: 'GET',
    query: filters as Record<string, unknown>,
  });
}

export async function fetchAdminProduct(productId: string): Promise<AdminProductDto> {
  return httpRequest<AdminProductDto>(`/products/${productId}`, {
    method: 'GET',
  });
}

export async function createAdminProduct(payload: CreateAdminProductPayload): Promise<AdminProductDto> {
  return httpRequest<AdminProductDto>('/products', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAdminProduct(
  productId: string,
  payload: UpdateAdminProductPayload,
): Promise<AdminProductDto> {
  return httpRequest<AdminProductDto>(`/products/${productId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await httpRequest(`/products/${productId}`, {
    method: 'DELETE',
  });
}
