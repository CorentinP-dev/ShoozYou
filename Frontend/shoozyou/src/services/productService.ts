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
};

export type FetchProductsOptions = {
  genderSlug?: Category;
  limit?: number;
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

const buildQuery = async (options: FetchProductsOptions | undefined) => {
  const query: Record<string, unknown> = {
    limit: options?.limit ?? 60,
  };

  if (options?.genderSlug && options.genderSlug !== 'mixte') {
    const genders = await ensureGenders();
    const match = genders.find((g) => g.slug === options.genderSlug);
    if (match) {
      query.genderId = match.id;
    }
  }

  return query;
};

export async function fetchAllProducts(options?: FetchProductsOptions): Promise<Product[]> {
  const [genders, query] = await Promise.all([ensureGenders(), buildQuery(options)]);
  const response = await fetchAdminProducts(query as AdminProductFilter);

  const genderMap = new Map(genders.map((g) => [g.id, g]));

  return response.items.map((item) => {
    const genderMatch = item.genderId ? genderMap.get(item.genderId) : undefined;
    const category = genderMatch?.slug ?? 'mixte';
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.imageUrl ?? undefined,
      genderId: item.genderId ?? undefined,
      shoeTypeId: item.shoeTypeId ?? undefined,
      category,
    } satisfies Product;
  });
}
