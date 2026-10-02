const { z } = require('zod');

const serviceCenterSchema = z.object({
  nama_service: z.string().min(1, 'Nama service center wajib diisi').max(50),
  no_telp: z.string().min(1, 'No telepon wajib diisi').max(20),
  alamat: z.string().min(1, 'Alamat wajib diisi').max(100),
  cp: z.string().max(50).nullable().optional(),
  no_hp: z.string().max(20).nullable().optional(),
  keterangan: z.string().nullable().optional(),
  status: z.boolean().default(false),
});

module.exports = { serviceCenterSchema };
