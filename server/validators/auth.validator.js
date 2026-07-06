import { z } from 'zod';
const roleEnum = z.enum(['citizen', 'officer', 'admin']);
export const registerSchema = z.object({
  body: z.object({
    name:       z.string().min(2, 'Name must be at least 2 characters'),
    email:      z.string().email('Invalid email address'),
    password:   z.string().min(6, 'Password must be at least 6 characters'),
    role:       roleEnum,
    employeeId: z.string().optional(),
    department: z.string().optional(),
    state:      z.string().optional(),
  }),
});
export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role:     roleEnum,
  }),
});
export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp:   z.string().length(6, 'OTP must be 6 digits'),
    role:  roleEnum,
  }),
});
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role:  roleEnum,
  }),
});
export const resetPasswordSchema = z.object({
  body: z.object({
    email:       z.string().email('Invalid email address'),
    otp:         z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    role:        roleEnum,
  }),
});