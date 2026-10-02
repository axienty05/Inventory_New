const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  password: z.string().min(6, 'Password baru minimal 6 karakter'),
  password_confirmation: z.string().min(6, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

module.exports = { loginSchema, registerSchema, changePasswordSchema };
