import axios from 'axios';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface CourirListingProduct {
  sku: string;
  name: string | null;
  brand: string | null;
  gender: string | null;
  shoeType: string | null;
  price_default: number | null;
  price_promo: number | null;
  discount: string | null;
  url: string | null;
  image: string | null;
  rating: string | null;
  metadata: Record<string, unknown>;
}

export interface CourirScrapeSummary {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  pages: number;
}

export interface CourirScrapeResult {
  products: CourirListingProduct[];
  summary: CourirScrapeSummary;
}

const DEFAULT_SOURCE_URL = 'https://www.courir.com/fr/c/chaussures/?sz=500';
const SOURCE_URL = env.SCRAPE_SOURCE_URL ?? DEFAULT_SOURCE_URL;
const BASE_URL = 'https://www.courir.com';
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
} as const;
const USE_APP_LOGGER = env.NODE_ENV !== 'development';

const safeLogInfo = (properties: Record<string, unknown>, message: string) => {
  if (USE_APP_LOGGER) {
    try {
      logger.info(properties, message);
      return;
    } catch (error) {
      // Fall back to console below.
    }
  }
  console.info(message, properties);
};

const startCase = (input: string): string => {
  return input
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatCategory = (raw: string | undefined | null): string | null => {
  if (!raw) {
    return null;
  }
  const segments = raw
    .split('-')
    .map((segment) => startCase(segment))
    .filter(Boolean);
  return segments.length ? segments.join(' / ') : null;
};

const compactObject = (input: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

const toStringSafe = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }
  return null;
};

const ensureLabel = (value: string | null, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length ? trimmed : fallback;
};

const resolveImageUrl = (img: cheerio.Cheerio<AnyNode>): string | null => {
  const candidates = [
    img.attr('data-frz-src'),
    img.attr('data-src'),
    img.attr('src')
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const trimmed = candidate.trim();
    if (!trimmed || trimmed.startsWith('data:')) {
      continue;
    }
    const absolute = toAbsoluteUrl(trimmed);
    if (absolute) {
      return absolute;
    }
  }

  return null;
};

// Trim whitespace and collapse repeated blanks from scraped strings.
const cleanText = (value: string | undefined | null): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed.replace(/\s+/g, ' ') : null;
};

// Convert relative or protocol-relative URLs into absolute URLs.
const toAbsoluteUrl = (href: string | undefined | null): string | null => {
  if (!href) {
    return null;
  }
  try {
    return new URL(href, BASE_URL).href;
  } catch (error) {
    return null;
  }
};

// Parse numeric price values while handling French decimal commas.
const parsePrice = (rawValue: string | undefined | null): number | null => {
  if (!rawValue) {
    return null;
  }

  const cleaned = rawValue
    .replace(/[^0-9,.-]/g, '')
    .replace(/,(?=\d{1,2}(?:\D|$))/g, '.')
    .replace(/\s+/g, '');

  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
};

const splitCategorySegments = (path: string | null): string[] => {
  if (!path) {
    return [];
  }

  return path
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const deriveGenderLabel = (genderText: string | null, segments: string[]): string | null => {
  if (genderText && genderText.length > 0) {
    return startCase(genderText);
  }

  if (segments.length > 0) {
    return segments[0];
  }

  return null;
};

const deriveTypeLabel = (segments: string[]): string | null => {
  if (segments.length >= 3) {
    return segments.slice(2).join(' / ');
  }

  if (segments.length >= 2) {
    return segments[segments.length - 1];
  }

  return segments.length ? segments[segments.length - 1] : null;
};

// Extract Courir products from the listing DOM while skipping ads or invalid cards.
const extractCourirProducts = ($: cheerio.CheerioAPI): CourirListingProduct[] => {
  const products: CourirListingProduct[] = [];

  $('div.product__tile__container').each((_, element) => {
    const container = $(element);
    const productTile = container.parents('div.product__tile').first();

    const linkHref = container.find('a.product__link').first().attr('href');
    if (!linkHref) {
      return;
    }

    const gtmRaw = productTile.attr('data-gtm');
    let gtmData: Record<string, unknown> | null = null;
    if (gtmRaw) {
      try {
        gtmData = JSON.parse(gtmRaw);
      } catch (error) {
        // Ignore malformed GTM payloads.
      }
    }

    const skuCandidate =
      toStringSafe(gtmData?.sku) ??
      toStringSafe(productTile.attr('data-itemid')) ??
      toStringSafe(productTile.attr('data-productid')) ??
      toStringSafe(container.attr('data-itemid'));
    const sku = cleanText(skuCandidate);
    if (!sku) {
      return;
    }

    const defaultPriceRaw = container.find('span.js-product__default-price').attr('data-value');

    const defaultPriceText = container
      .find('span[data-update-key="defaultPrice"]').first()
      .text();
    const promoPriceAttr = container
      .find('span.js-product__promotional-price')
      .first()
      .attr('data-value');
    const promoPriceText = container
      .find('span[data-update-key="promotionalPrice"]').first()
      .text();

    const priceDefault =
      parsePrice(defaultPriceRaw) ??
      parsePrice(defaultPriceText) ??
      parsePrice(toStringSafe(gtmData?.price));

    if (priceDefault === null) {
      return;
    }

    const pricePromo =
      parsePrice(promoPriceAttr) ??
      parsePrice(promoPriceText);

    const nameText =
      cleanText(container.find('span.product__name__product').first().text()) ??
      cleanText(toStringSafe(gtmData?.name));
    const brandText =
      cleanText(container.find('span.product__name__brand').first().text()) ??
      cleanText(toStringSafe(gtmData?.brand));
    const genderText = cleanText(container.find('span.product__gender').first().text());
    const discountText = cleanText(
      container.find('span[data-update-key="extendedPromotionalTag"]').first().text()
    );
    const ratingText = cleanText(
      container.find('span.refinement-bazaarvoice-rating-wording').first().text()
    );

    const categoryPath =
      formatCategory(toStringSafe(gtmData?.category)) ??
      formatCategory(productTile.attr('data-product-category')) ??
      null;
    const categorySegments = splitCategorySegments(categoryPath);

    const genderLabel = deriveGenderLabel(genderText, categorySegments);
    const typeLabel = deriveTypeLabel(categorySegments) ?? 'Chaussures';

    const productUrl = toAbsoluteUrl(linkHref);
    const imageUrl = resolveImageUrl(container.find('div.product__image img').first());

    if (!productUrl) {
      return;
    }

    const metadata = compactObject({
      gender: genderLabel ?? undefined,
      type: typeLabel,
      discount: discountText,
      rating: ratingText,
      price_promo: pricePromo,
      source_url: productUrl,
      image_original: imageUrl,
      category_path: categoryPath ?? undefined,
      category_segments: categorySegments.length ? categorySegments : undefined,
      gtm: gtmData ?? undefined,
      raw_category: productTile.attr('data-product-category') ?? undefined
    });

    const product: CourirListingProduct = {
      sku,
      name: nameText,
      brand: brandText,
      gender: genderLabel,
      shoeType: typeLabel,
      price_default: priceDefault,
      price_promo: pricePromo,
      discount: discountText,
      url: productUrl,
      image: imageUrl,
      rating: ratingText,
      metadata
    };

    products.push(product);
  });

  return products;
};

const upsertReference = async (
  name: string | null,
  kind: 'brand' | 'gender' | 'type'
): Promise<string | null> => {
  const fallbackMap: Record<'brand' | 'gender' | 'type', string> = {
    brand: 'Courir',
    gender: 'Mixte',
    type: 'Chaussures'
  };

  const label = ensureLabel(name, fallbackMap[kind]);

  if (kind === 'brand') {
    const brand = await prisma.brand.upsert({
      where: { name: label },
      update: {},
      create: { name: label }
    });
    return brand.id;
  }

  if (kind === 'gender') {
    const gender = await prisma.gender.upsert({
      where: { name: label },
      update: {},
      create: { name: label }
    });
    return gender.id;
  }

  const productType = await prisma.productType.upsert({
    where: { name: label },
    update: {},
    create: { name: label }
  });
  return productType.id;
};

const persistProducts = async (
  products: CourirListingProduct[]
): Promise<{ created: number; updated: number }> => {
  let created = 0;
  let updated = 0;

  for (const product of products) {
    const brandLabel = ensureLabel(product.brand, 'Courir');
    const genderLabel = ensureLabel(product.gender, 'Mixte');
    const typeLabel = ensureLabel(product.shoeType, 'Chaussures');

    const [brandId, genderId, shoeTypeId] = await Promise.all([
      upsertReference(brandLabel, 'brand'),
      upsertReference(genderLabel, 'gender'),
      upsertReference(typeLabel, 'type')
    ]);

    const description = product.name
      ? `Chaussure ${product.name} par ${brandLabel}`
      : `Chaussure ${brandLabel}`;

    const payload = {
      name: product.name ?? `${brandLabel} ${product.sku}`,
      description,
      price: new Prisma.Decimal(product.price_default ?? 0),
      imageUrl: product.image ?? undefined,
      stock: 50,
      brandId,
      genderId,
      shoeTypeId,
      metadata: product.metadata as Prisma.InputJsonValue
    };

    try {
      await prisma.product.update({
        where: { sku: product.sku },
        data: payload
      });
      updated += 1;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        await prisma.product.create({
          data: {
            sku: product.sku,
            ...payload
          }
        });
        created += 1;
      } else {
        throw error;
      }
    }
  }

  return { created, updated };
};

const collectNextPageUrls = ($: cheerio.CheerioAPI): string[] => {
  const urls: string[] = [];

  $('div.infinite-scroll-placeholder[data-grid-url]').each((_, element) => {
    const nextUrl = $(element).attr('data-grid-url');
    const absolute = toAbsoluteUrl(nextUrl ?? null);
    if (!absolute) {
      return;
    }

    try {
      const parsed = new URL(absolute);
      parsed.searchParams.delete('format');
      parsed.searchParams.delete('template');
      const sanitized = parsed.toString();
      urls.push(sanitized);
    } catch (error) {
      urls.push(absolute);
    }
  });

  return urls;
};

const fetchPageHtml = async (url: string): Promise<string> => {
  const { data } = await axios.get<string>(url, {
    headers: REQUEST_HEADERS
  });
  return data;
};

export const scrapeProducts = async (
  sourceUrl: string = SOURCE_URL
): Promise<CourirScrapeResult> => {
  if (!sourceUrl) {
    throw new Error('SCRAPE_SOURCE_URL is not defined');
  }

  const queue: string[] = [sourceUrl];
  const visited = new Set<string>();
  const products: CourirListingProduct[] = [];
  let processedPages = 0;

  while (queue.length > 0) {
    const currentUrl = queue.shift()!;
    if (visited.has(currentUrl)) {
      continue;
    }
    visited.add(currentUrl);

    safeLogInfo({ currentUrl }, 'Fetching Courir listing page');
    const html = await fetchPageHtml(currentUrl);
    const $ = cheerio.load(html);

    const pageProducts = extractCourirProducts($);
    processedPages += 1;
    safeLogInfo({ currentUrl, pageCount: pageProducts.length }, 'Collected Courir products from page');
    products.push(...pageProducts);

    const nextUrls = collectNextPageUrls($);
    for (const nextUrl of nextUrls) {
      if (!visited.has(nextUrl) && !queue.includes(nextUrl)) {
        queue.push(nextUrl);
      }
    }
  }

  const uniqueBySku = new Map<string, CourirListingProduct>();
  for (const product of products) {
    if (!product.sku) {
      continue;
    }
    if (!uniqueBySku.has(product.sku)) {
      uniqueBySku.set(product.sku, product);
    }
  }

  const uniqueProducts = Array.from(uniqueBySku.values());
  const skipped = products.length - uniqueProducts.length;

  const { created, updated } = await persistProducts(uniqueProducts);

  safeLogInfo(
    { total: uniqueProducts.length, created, updated, skipped, pages: processedPages },
    'Stored Courir listing items'
  );

  return {
    products: uniqueProducts,
    summary: {
      total: uniqueProducts.length,
      created,
      updated,
      skipped,
      pages: processedPages
    }
  };
};

if (require.main === module) {
  scrapeProducts()
    .then((result) => {
      console.log(JSON.stringify(result.products, null, 2));
      console.log(
        `Résumé: ${result.summary.total} produits synchronisés (${result.summary.created} créés, ${result.summary.updated} mis à jour, ${result.summary.skipped} doublons ignorés, ${result.summary.pages} pages parcourues)`
      );
    })
    .catch((error: unknown) => {
      let logged = false;

      if (USE_APP_LOGGER) {
        try {
          logger.error({ error }, 'Failed to scrape Courir products');
          logged = true;
        } catch (loggingError) {
          // Fall back to console below.
        }
      }

      if (!logged) {
        console.error('Failed to scrape Courir products', error);
      }
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
