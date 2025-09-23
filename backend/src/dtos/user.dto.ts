import { z } from 'zod';

const roleValues = ['CLIENT', 'SELLER', 'ADMIN'] as const;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional()
});

export const updateUserRoleSchema = z.object({
  role: z.enum(roleValues)
});

export const updateUserStatusSchema = z.object({
  active: z.boolean()
});

export const listUsersQuerySchema = z.object({
  role: z
    .string()
    .transform((value) => value.toUpperCase())
    .refine((value): value is (typeof roleValues)[number] => (roleValues as readonly string[]).includes(value), {
      message: 'Invalid role'
    })
    .optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;
