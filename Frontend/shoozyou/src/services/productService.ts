import { fetchAdminProducts, type AdminProductFilter } from './adminApi';
import { fetchGenders } from './referenceApi';

export const CATEGORIES = ['homme', 'femme', 'enfant', 'mixte'] as const;
export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image?: string;
  genderId?: string;
  shoeTypeId?: string;
  stock: number;
  variants: Array<{
    id: string;
    sizeValue: string;
    sizeLabel: string;
    stock: number;
  }>;
};

export type FetchProductsOptions = {
  genderSlug?: Category;
  limit?: number;
  page?: number;
  search?: string;
};

export type ProductsMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ProductsResult = {
  items: Product[];
  meta: ProductsMeta;
};

let gendersCache: { id: string; slug: Category; name: string }[] | null = null;

const normalize = (input: string): string =>
  input.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const mapGenderToSlug = (name?: string | null): Category => {
  if (!name) return 'mixte';
  const slug = normalize(name);
  if (slug.includes('homme')) return 'homme';
  if (slug.includes('femme')) return 'femme';
  if (slug.includes('junior') || slug.includes('enfant')) return 'enfant';
  return 'mixte';
};

const ensureGenders = async () => {
  if (gendersCache) return gendersCache;
  const genders = await fetchGenders();
  gendersCache = genders.map((gender) => ({
    id: gender.id,
    name: gender.name,
    slug: mapGenderToSlug(gender.name),
  }));
  return gendersCache;
};

const buildQuery = async (options: FetchProductsOptions | undefined): Promise<AdminProductFilter> => {
  const query: AdminProductFilter = {
    limit: options?.limit ?? 60,
    page: options?.page ?? 1,
  };

  if (options?.search) {
    query.search = options.search;
  }

  if (options?.genderSlug && options.genderSlug !== 'mixte') {
    const genders = await ensureGenders();
    const match = genders.find((g) => g.slug === options.genderSlug);
    if (match) {
      query.genderId = match.id;
    }
  }

  return query;
};

export async function fetchProducts(options?: FetchProductsOptions): Promise<ProductsResult> {
  const [genders, query] = await Promise.all([ensureGenders(), buildQuery(options)]);
  const response = await fetchAdminProducts(query);

  const genderMap = new Map(genders.map((g) => [g.id, g]));

  const items = response.items.map((item) => {
    const genderMatch = item.genderId ? genderMap.get(item.genderId) : undefined;
    const category = genderMatch?.slug ?? 'mixte';
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description,
      price: typeof item.price === 'number' ? item.price : Number(item.price),
      image: item.imageUrl ?? undefined,
      genderId: item.genderId ?? undefined,
      shoeTypeId: item.shoeTypeId ?? undefined,
      category,
      stock: typeof item.stock === 'number' ? item.stock : Number(item.stock),
      variants: item.variants.map((variant) => ({
        id: variant.id,
        sizeValue: variant.sizeValue,
        sizeLabel: variant.sizeLabel,
        stock: typeof variant.stock === 'number' ? variant.stock : Number(variant.stock),
      })),
    } satisfies Product;
  });

  return {
    items,
    meta: {
      total: response.meta.total,
      page: response.meta.page,
      limit: response.meta.limit,
      pages: response.meta.pages,
    },
  };
}
