import { prisma } from '../config/prisma';

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
  imageUrl?: string;
  category: InventoryCategory;
  totalStock: number;
  status: InventoryStatus;
  variants: SellerInventoryVariant[];
  updatedAt: Date;
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

const normalize = (value: string | null | undefined): string => {
  return value?.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase() ?? '';
};

const mapGenderToCategory = (name: string | null | undefined): InventoryCategory => {
  const normalized = normalize(name);
  if (normalized.includes('homme')) return 'homme';
  if (normalized.includes('femme')) return 'femme';
  if (normalized.includes('junior') || normalized.includes('enfant')) return 'enfant';
  return 'mixte';
};

const classifyVariantStock = (stock: number): InventoryStatus => {
  if (stock <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (stock <= 3) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
};

const mapStockToStatus = (stocks: number[]): InventoryStatus => {
  if (!stocks.length) {
    return 'OUT_OF_STOCK';
  }

  let aggregated: InventoryStatus = 'IN_STOCK';

  for (const stock of stocks) {
    const status = classifyVariantStock(stock);
    if (status === 'OUT_OF_STOCK') {
      return 'OUT_OF_STOCK';
    }
    if (status === 'LOW_STOCK' && aggregated === 'IN_STOCK') {
      aggregated = 'LOW_STOCK';
    }
  }

  return aggregated;
};

export const getSellerInventory = async (): Promise<SellerInventoryResponse> => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      stock: true,
      imageUrl: true,
      gender: { select: { name: true } },
      variants: {
        select: {
          id: true,
          sizeValue: true,
          stock: true,
          size: { select: { label: true } }
        }
      },
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const inventory: SellerInventoryProduct[] = products.map((product) => {
    const variants = product.variants.map((variant) => ({
      id: variant.id,
      sizeValue: variant.sizeValue,
      sizeLabel: variant.size?.label ?? `${variant.sizeValue} EU`,
      stock: variant.stock
    }));

    const stockSource = variants.length > 0 ? variants.map((variant) => variant.stock) : [product.stock];
    const totalStock = stockSource.reduce((sum, value) => sum + value, 0);
    const status = mapStockToStatus(stockSource);

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl ?? undefined,
      category: mapGenderToCategory(product.gender?.name),
      totalStock,
      status,
      variants,
      updatedAt: product.updatedAt
    } satisfies SellerInventoryProduct;
  });

  const stats = inventory.reduce<SellerInventoryStats>(
    (acc, product) => {
      acc.totalProducts += 1;
      acc.totalStock += product.totalStock;
      if (product.status === 'OUT_OF_STOCK') {
        acc.outOfStockProducts += 1;
      } else if (product.status === 'LOW_STOCK') {
        acc.lowStockProducts += 1;
      } else {
        acc.inStockProducts += 1;
      }
      return acc;
    },
    {
      totalProducts: 0,
      totalStock: 0,
      inStockProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    }
  );

  return {
    products: inventory,
    stats
  };
};
