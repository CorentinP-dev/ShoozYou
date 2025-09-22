import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { deleteUser, getUserById, listUsers, updateUserProfile } from '../services/user.service';

export const getMeHandler = async (req: AuthenticatedRequest, res: Response) => {
  const user = await getUserById(req.user!.id);
  res.json({ status: 'success', data: user });
};

export const listUsersHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const users = await listUsers();
  res.json({ status: 'success', data: users });
};

export const updateProfileHandler = async (req: AuthenticatedRequest, res: Response) => {
  const user = await updateUserProfile(req.user!.id, req.body);
  res.json({ status: 'success', data: user });
};

export const deleteUserHandler = async (req: AuthenticatedRequest, res: Response) => {
  await deleteUser(req.params.userId);
  res.status(204).send();
};
