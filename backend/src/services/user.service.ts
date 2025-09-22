import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';
import { UpdateProfileInput } from '../dtos/user.dto';
import { hashPassword } from '../utils/password';

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

export const listUsers = () => {
  return prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
  });
};

export const updateUserProfile = async (userId: string, payload: UpdateProfileInput) => {
  const data: Record<string, unknown> = {};

  if (payload.firstName) data.firstName = payload.firstName;
  if (payload.lastName) data.lastName = payload.lastName;
  if (payload.password) data.password = await hashPassword(payload.password);

  if (Object.keys(data).length === 0) {
    return getUserById(userId);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
  });

  return user;
};

export const deleteUser = async (userId: string) => {
  await prisma.user.delete({ where: { id: userId } });
};
