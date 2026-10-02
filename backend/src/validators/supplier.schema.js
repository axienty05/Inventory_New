const { z } = require('zod');

const supplierSchema = z.object({
  nama_supplier: z.string().min(1, 'Nama supplier wajib diisi').max(50),
  alamat: z.string().min(1, 'Alamat wajib diisi').max(100),
  no_telp: z.string().max(20).nullable().optional(),
  email: z.string().email('Format email tidak valid').nullable().optional().or(z.literal('')),
  cp: z.string().max(50).nullable().optional(),
  no_hp: z.string().max(20).nullable().optional(),
  keterangan: z.string().nullable().optional(),
  status: z.boolean().default(false),
});

module.exports = { supplierSchema };
