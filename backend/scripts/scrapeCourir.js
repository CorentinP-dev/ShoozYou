'use strict';

// Simple Courir listing scraper using axios + cheerio.
const axios = require('axios');
const cheerio = require('cheerio');

const LISTING_URL = 'https://www.courir.com/fr/c/chaussures/?sz=500';
const BASE_URL = 'https://www.courir.com';

// Normalize text nodes: trim whitespace and collapse spaces.
const cleanText = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed.replace(/\s+/g, ' ') : null;
};

// Resolve relative URLs against the site base.
const toAbsoluteUrl = (href) => {
  if (!href) return null;
  try {
    return new URL(href, BASE_URL).href;
  } catch (err) {
    return null;
  }
};

// Attempt to parse price strings into numbers, fall back to null.
const parsePrice = (raw) => {
  if (!raw) return null;
  const normalized = String(raw).replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
};

async function scrapeCourirListing() {
  try {
    // Fetch page HTML. Set UA to avoid potential blocking.
    const { data: html } = await axios.get(LISTING_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    const $ = cheerio.load(html);
    const products = [];

    $('div.product__tile__container').each((_, element) => {
      const container = $(element);
      const linkHref = container.find('a.product__link').attr('href');
      const defaultPriceRaw = container.find('span.js-product__default-price').attr('data-value');

      // Skip ads or invalid entries.
      if (!linkHref || !defaultPriceRaw) {
        return;
      }

      const promoPriceRaw = container
        .find('span.js-product__promotional-price')
        .attr('data-value');

      const imageSrc = container.find('div.product__image img').first().attr('src')
        || container.find('div.product__image img').first().attr('data-src')
        || null;

      const product = {
        name: cleanText(container.find('span.product__name__product').text()),
        brand: cleanText(container.find('span.product__name__brand').text()),
        gender: cleanText(container.find('span.product__gender').text()),
        price_default: parsePrice(defaultPriceRaw),
        price_promo: parsePrice(promoPriceRaw),
        discount: cleanText(container.find('span[data-update-key="extendedPromotionalTag"]').text()),
        url: toAbsoluteUrl(linkHref),
        image: imageSrc ? toAbsoluteUrl(imageSrc) : null,
        rating: cleanText(container.find('span.refinement-bazaarvoice-rating-wording').text()),
      };

      products.push(product);
    });

    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Scraping failed:', error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  scrapeCourirListing();
}
