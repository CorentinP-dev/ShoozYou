import { httpRequest } from './httpClient';

export interface GenderDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoeTypeDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchGenders(): Promise<GenderDto[]> {
  return httpRequest<GenderDto[]>('/references/genders', { method: 'GET' });
}

export async function fetchShoeTypes(): Promise<ShoeTypeDto[]> {
  return httpRequest<ShoeTypeDto[]>('/references/shoe-types', { method: 'GET' });
}

export async function fetchBrands(): Promise<BrandDto[]> {
  return httpRequest<BrandDto[]>('/references/brands', { method: 'GET' });
}
