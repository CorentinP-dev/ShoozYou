import { httpRequest } from './httpClient';

export interface AccountProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAccountPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export async function fetchMyProfile(): Promise<AccountProfileDto> {
  return httpRequest<AccountProfileDto>('/users/me', { method: 'GET' });
}

export async function updateMyProfile(payload: UpdateAccountPayload): Promise<AccountProfileDto> {
  return httpRequest<AccountProfileDto>('/users/me', { method: 'PATCH', body: payload });
}
