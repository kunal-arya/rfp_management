
import { z } from 'zod';
import { RoleName } from '../utils/enum';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email(),
  password: z.string().min(6),
  roleName: z.nativeEnum(RoleName),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});
