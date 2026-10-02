const { z } = require('zod');

const dtMutasiItemSchema = z.object({
  m_barang_id: z.number().int().positive('Barang wajib dipilih'),
  pemakai_lama: z.number().int('Pemakai lama wajib ada'),
  pemakai_baru: z.number().int().nullable().optional(),
  harga: z.number().min(0).default(0).optional(),
});

const createMutasiSchema = z.object({
  no_mutasi: z.string().min(1, 'Nomor mutasi wajib diisi').max(12).optional(),
  m_supplier_id: z.number().int().nullable().optional(),
  jenis_mutasi: z.enum(['pembelian', 'penjualan', 'perpindahan'], {
    errorMap: () => ({ message: 'Jenis mutasi tidak valid' }),
  }),
  tgl_mutasi: z.string().min(1, 'Tanggal mutasi wajib diisi'),
  keterangan: z.string().nullable().optional(),
  dtMutasis: z.array(dtMutasiItemSchema).min(1, 'Minimal satu barang harus dipilih'),
});

const updateMutasiSchema = z.object({
  m_supplier_id: z.number().int().nullable().optional(),
  tgl_mutasi: z.string().min(1, 'Tanggal mutasi wajib diisi'),
  keterangan: z.string().nullable().optional(),
  dtMutasis: z.array(dtMutasiItemSchema).min(1, 'Minimal satu barang harus dipilih'),
});

module.exports = { createMutasiSchema, updateMutasiSchema };
