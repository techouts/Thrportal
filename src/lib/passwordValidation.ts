import { z } from 'zod';

// Password requirements:
// - At least 6 characters
// - At least 1 number
// - At least 1 special character
export const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/, 'Password must contain at least 1 special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type PasswordFormData = z.infer<typeof passwordSchema>;

// Validation helpers for real-time feedback
export const hasMinLength = (password: string): boolean => password.length >= 6;
export const hasNumber = (password: string): boolean => /[0-9]/.test(password);
export const hasSpecialChar = (password: string): boolean => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password);
export const passwordsMatch = (password: string, confirm: string): boolean => 
  password.length > 0 && password === confirm;

// Check if new password is same as the default/old password (prevent reuse)
export const isDefaultPassword = (newPassword: string, usedPassword: string): boolean => {
  return newPassword === usedPassword;
};
