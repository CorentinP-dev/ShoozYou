import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../config/logger';

interface ScrapedProduct {
  sku: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  imageUrl?: string;
}

const SOURCE_URL = env.SCRAPE_SOURCE_URL;

const fetchHtml = async (url: string) => {
  const response = await axios.get(url);
  return response.data as string;
};

const parseProducts = (html: string): ScrapedProduct[] => {
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  $('.product-card').each((_, element) => {
    const name = $(element).find('.product-title').text().trim();
    const priceText = $(element).find('.product-price').text().replace(/[^0-9.,]/g, '');
    const price = parseFloat(priceText.replace(',', '.')) || 0;
    const brand = $(element).find('.product-brand').text().trim() || 'Unknown';
    const category = $(element).find('.product-category').text().trim() || 'Sneakers';
    const description = $(element).find('.product-description').text().trim() || `Imported shoe ${name}`;
    const imageUrl = $(element).find('img').attr('src');
    const sku = $(element).attr('data-sku') || `${name}-${Date.now()}`;

    if (!name || !price) return;

    products.push({ sku, name, price, brand, category, description, imageUrl });
  });

  return products;
};

const upsertTaxonomy = async (name: string, type: 'brand' | 'category') => {
  if (type === 'brand') {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    return brand.id;
  }

  const category = await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name }
  });
  return category.id;
};

const persistProducts = async (products: ScrapedProduct[]) => {
  for (const product of products) {
    const [brandId, categoryId] = await Promise.all([
      upsertTaxonomy(product.brand, 'brand'),
      upsertTaxonomy(product.category, 'category')
    ]);

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: 50,
        brandId,
        categoryId
      },
      create: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: 50,
        imageUrl: product.imageUrl,
        brandId,
        categoryId
      }
    });
  }
};

export const scrapeProducts = async () => {
  if (!SOURCE_URL) {
    throw new Error('SCRAPE_SOURCE_URL is not defined');
  }

  logger.info({ SOURCE_URL }, 'Starting product scraping');
  const html = await fetchHtml(SOURCE_URL);
  const products = parseProducts(html);
  logger.info({ count: products.length }, 'Parsed products from source');
  await persistProducts(products);
  logger.info('Completed product scraping');
};

if (require.main === module) {
  scrapeProducts()
    .catch((error) => {
      logger.error({ error }, 'Failed to scrape products');
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
