const { z } = require('zod');

const createBarangSchema = z.object({
  nama_barang: z.string().min(1, 'Nama barang wajib diisi'),
  serial_number: z.string().max(50).nullable().optional(),
  m_pemakai_id: z.number().int().positive('Pemakai wajib dipilih'),
  kategori: z.enum([
    'komputer', 'laptop', 'ups', 'printer', 'monitor', 'mouse', 'keyboard',
    'scanner', 'stavolt', 'memory', 'storage', 'license', 'sparepart', 'cctv', 'lain_lain'
  ], { errorMap: () => ({ message: 'Kategori tidak valid' }) }),
  keterangan: z.string().nullable().optional(),
  status: z.enum(['aktif', 'tidak_aktif', 'sedang_service', 'rusak', 'dijual']).default('aktif'),
});

const updateBarangSchema = createBarangSchema.extend({
  kode_barang: z.string().max(10).optional(),
});

module.exports = { createBarangSchema, updateBarangSchema };
