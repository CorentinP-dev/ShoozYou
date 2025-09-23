import { httpRequest } from './httpClient';
import type { Role } from './authService';

type UUID = string;

type RawAdminUser = {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'SELLER' | 'ADMIN';
  active: boolean;
  createdAt: string;
};

export interface AdminUserDto {
  id: UUID;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

const mapRole = (role: RawAdminUser['role']): Role => {
  switch (role) {
    case 'ADMIN':
      return 'admin';
    case 'SELLER':
      return 'seller';
    default:
      return 'client';
  }
};

const mapUser = (user: RawAdminUser): AdminUserDto => ({
  id: user.id,
  email: user.email,
  name: `${user.firstName} ${user.lastName}`.trim(),
  role: mapRole(user.role),
  active: user.active,
  createdAt: user.createdAt,
});

export async function fetchAdminUsers(): Promise<AdminUserDto[]> {
  const response = await httpRequest<RawAdminUser[]>('/users', {
    method: 'GET',
  });
  return response.map(mapUser);
}

export async function updateAdminUserRole(userId: string, role: Role): Promise<AdminUserDto> {
  const payload = {
    role: role === 'admin' ? 'ADMIN' : role === 'seller' ? 'SELLER' : 'CLIENT',
  };
  const response = await httpRequest<RawAdminUser>(`/users/${userId}/role`, {
    method: 'PATCH',
    body: payload,
  });
  return mapUser(response);
}

export async function updateAdminUserStatus(userId: string, active: boolean): Promise<AdminUserDto> {
  const response = await httpRequest<RawAdminUser>(`/users/${userId}/status`, {
    method: 'PATCH',
    body: { active },
  });
  return mapUser(response);
}
