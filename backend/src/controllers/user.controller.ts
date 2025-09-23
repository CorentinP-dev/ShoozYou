import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import {
  deleteUser,
  getUserById,
  listUsers,
  updateUserProfile,
  updateUserRole,
  updateUserStatus
} from '../services/user.service';
import {
  ListUsersQueryInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput
} from '../dtos/user.dto';
import { logger } from '../config/logger';

export const getMeHandler = async (req: AuthenticatedRequest, res: Response) => {
  const user = await getUserById(req.user!.id);
  res.json({ status: 'success', data: user });
};

export const getUserHandler = async (req: AuthenticatedRequest, res: Response) => {
  const user = await getUserById(req.params.userId);
  res.json({ status: 'success', data: user });
};

export const listUsersHandler = async (req: AuthenticatedRequest, res: Response) => {
  const users = await listUsers(req.query as ListUsersQueryInput);
  res.json({ status: 'success', data: users });
};

export const updateProfileHandler = async (req: AuthenticatedRequest, res: Response) => {
  const user = await updateUserProfile(req.user!.id, req.body);
  res.json({ status: 'success', data: user });
};

export const updateUserRoleHandler = async (req: AuthenticatedRequest, res: Response) => {
  const payload = req.body as UpdateUserRoleInput;
  const adminId = req.user!.id;
  const targetId = req.params.userId;
  const user = await updateUserRole(targetId, payload);
  logger.info({ adminId, targetId, role: payload.role }, 'Admin updated user role');
  res.json({ status: 'success', data: user });
};

export const updateUserStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  const payload = req.body as UpdateUserStatusInput;
  const adminId = req.user!.id;
  const targetId = req.params.userId;
  const user = await updateUserStatus(targetId, payload);
  logger.info({ adminId, targetId, active: payload.active }, 'Admin updated user status');
  res.json({ status: 'success', data: user });
};

export const deleteUserHandler = async (req: AuthenticatedRequest, res: Response) => {
  await deleteUser(req.params.userId);
  res.status(204).send();
};
