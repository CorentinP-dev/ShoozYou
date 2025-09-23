import { httpRequest } from './httpClient';

export type InventoryCategory = 'homme' | 'femme' | 'enfant' | 'mixte';
export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface SellerInventoryVariant {
  id: string;
  sizeValue: string;
  sizeLabel: string;
  stock: number;
}

export interface SellerInventoryProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category: InventoryCategory;
  totalStock: number;
  status: InventoryStatus;
  variants: SellerInventoryVariant[];
  updatedAt: string;
}

export interface SellerInventoryStats {
  totalProducts: number;
  totalStock: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface SellerInventoryResponse {
  products: SellerInventoryProduct[];
  stats: SellerInventoryStats;
}

export async function fetchSellerInventory(): Promise<SellerInventoryResponse> {
  return httpRequest<SellerInventoryResponse>('/seller/inventory');
}
