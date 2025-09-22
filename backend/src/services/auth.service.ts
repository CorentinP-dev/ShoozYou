import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';
import { HttpError } from '../utils/httpError';
import { LoginInput, RegisterInput } from '../dtos/auth.dto';

export const registerUser = async (payload: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new HttpError(409, 'Email already in use');
  }

  const password = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: (payload.role as Role | undefined) ?? Role.CLIENT,
      cart: { create: {} }
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  });

  const token = signJwt({ sub: user.id, role: user.role });

  return { user, token };
};

export const loginUser = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const valid = await comparePassword(payload.password, user.password);

  if (!valid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = signJwt({ sub: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    token
  };
};
