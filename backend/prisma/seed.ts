import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const USERS = [
  {
    email: 'admin@shoozyou.com',
    password: 'Admin123!456',
    firstName: 'Admin',
    lastName: 'ShoozYou',
    role: 'ADMIN' as const,
    active: true,
  },
  {
    email: 'sophie@sellers.com',
    password: 'Seller123!456',
    firstName: 'Sophie',
    lastName: 'Vendeur',
    role: 'SELLER' as const,
    active: true,
  },
  {
    email: 'marc@sellers.com',
    password: 'Seller123!456',
    firstName: 'Marc',
    lastName: 'Vendeur',
    role: 'SELLER' as const,
    active: true,
  },
  {
    email: 'camille@client.com',
    password: 'Client123!456',
    firstName: 'Camille',
    lastName: 'Client',
    role: 'CLIENT' as const,
    active: true,
  },
  {
    email: 'inactive@sellers.com',
    password: 'Seller123!456',
    firstName: 'Inactif',
    lastName: 'Vendeur',
    role: 'SELLER' as const,
    active: false,
  },
];

async function main() {
  console.log('Seeding users...');

  for (const user of USERS) {
    const hashed = await hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        active: user.active,
        password: hashed,
      },
      create: {
        email: user.email,
        password: hashed,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        active: user.active,
      },
    });
  }

  console.log('Users seeded successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
