import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';
import {
  ListUsersQueryInput,
  UpdateProfileInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput
} from '../dtos/user.dto';
import { hashPassword } from '../utils/password';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

export const listUsers = (filters: ListUsersQueryInput = {}) => {
  const where: Prisma.UserWhereInput = {};
  if (filters.role) {
    where.role = filters.role;
  }
  return prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: 'desc' }
  });
};

export const updateUserProfile = async (userId: string, payload: UpdateProfileInput) => {
  const data: Prisma.UserUpdateInput = {};

  if (payload.firstName) data.firstName = payload.firstName;
  if (payload.lastName) data.lastName = payload.lastName;
  if (payload.email) data.email = payload.email;
  if (payload.password) data.password = await hashPassword(payload.password);

  if (Object.keys(data).length === 0) {
    return getUserById(userId);
  }
  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Email already in use');
    }
    throw error;
  }
};

export const updateUserRole = async (userId: string, payload: UpdateUserRoleInput) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role: payload.role },
    select: userSelect
  });
};

export const updateUserStatus = async (userId: string, payload: UpdateUserStatusInput) => {
  return prisma.user.update({
    where: { id: userId },
    data: { active: payload.active },
    select: userSelect
  });
};

export const deleteUser = async (userId: string) => {
  await prisma.user.delete({ where: { id: userId } });
};
