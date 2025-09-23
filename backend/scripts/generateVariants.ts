import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

const SIZE_PRESETS: Record<string, string[]> = {
  HOMME: ['40', '41', '42', '43', '44', '45'],
  FEMME: ['36', '37', '38', '39', '40', '41'],
  ENFANT: ['30', '31', '32', '33', '34', '35'],
  MIXTE: ['36', '37', '38', '39', '40', '41', '42'],
};

const normaliseGender = (name: string | null | undefined): keyof typeof SIZE_PRESETS => {
  const base = name?.toUpperCase() ?? '';
  if (base.includes('HOMME')) return 'HOMME';
  if (base.includes('FEMME')) return 'FEMME';
  if (base.includes('ENF')) return 'ENFANT';
  return 'MIXTE';
};

const pickSizes = (product: Product, genderName: string | null | undefined): string[] => {
  const key = normaliseGender(genderName);
  const base = SIZE_PRESETS[key];
  const shuffled = [...base].sort(() => Math.random() - 0.5);
  const min = 3;
  const max = Math.min(base.length, 10);
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return shuffled.slice(0, count);
};

const distributeStock = (sizeCount: number): number[] => {
  const stocks: number[] = [];
  for (let i = 0; i < sizeCount; i += 1) {
    stocks.push(Math.floor(Math.random() * 51));
  }
  return stocks;
};

const createOrFindSize = async (label: string): Promise<string> => {
  const value = label.toUpperCase();
  const existing = await prisma.shoeSize.findUnique({ where: { value } });
  if (existing) {
    return existing.id;
  }
  const created = await prisma.shoeSize.create({
    data: {
      label: `${label} EU`,
      value,
    },
  });
  return created.id;
};

async function generateVariants() {
  const products = await prisma.product.findMany({
    include: {
      gender: true,
      variants: true,
    },
  });

  console.log(`Found ${products.length} products to process`);
  let createdVariants = 0;

  for (const product of products) {
    if (product.variants.length > 0) {
      // Skip products that already have variants
      continue;
    }

    const genderName = product.gender?.name ?? null;
    const sizes = pickSizes(product, genderName);
    const stocks = distributeStock(sizes.length);

    const variantPayloads = await Promise.all(
      sizes.map(async (size, index) => {
        const sizeId = await createOrFindSize(size);
        return {
          productId: product.id,
          sizeId,
          sizeValue: size,
          stock: stocks[index],
          metadata: {
            generated: true,
            source: 'script',
            generatedAt: new Date().toISOString(),
          },
        };
      }),
    );

    if (variantPayloads.length > 0) {
      await prisma.productVariant.createMany({ data: variantPayloads });
      createdVariants += variantPayloads.length;
      console.log(`Product ${product.id} → ${variantPayloads.length} variants created`);
    }
  }

  console.log(`Completed. Total variants created: ${createdVariants}`);
}

if (require.main === module) {
  generateVariants()
    .catch((error) => {
      console.error('Variant generation failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default generateVariants;
