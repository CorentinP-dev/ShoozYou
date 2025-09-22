import { prisma } from '../config/prisma';

export const listGenders = async () => {
  return prisma.gender.findMany({
    orderBy: { name: 'asc' }
  });
};

export const listShoeTypes = async () => {
  return prisma.productType.findMany({
    orderBy: { name: 'asc' }
  });
};
