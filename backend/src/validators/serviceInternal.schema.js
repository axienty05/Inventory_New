const { z } = require('zod');

const serviceInternalSchema = z.object({
  m_pemakai_id: z.number().int().positive('Pemakai wajib dipilih'),
  m_barang_id: z.number().int().positive('Barang wajib dipilih'),
  tgl_service: z.string().min(1, 'Tanggal service wajib diisi'),
  tgl_selesai: z.string().nullable().optional().or(z.literal('')),
  kerusakan: z.string().min(1, 'Kerusakan wajib diisi'),
});

module.exports = { serviceInternalSchema };
