const { z } = require('zod');

const serviceSchema = z.object({
  no_sj: z.string().max(15).nullable().optional(),
  m_pemakai_id: z.number().int().positive('Pemakai wajib dipilih'),
  m_barang_id: z.number().int().positive('Barang wajib dipilih'),
  m_service_center_id: z.number().int().positive('Service center wajib dipilih'),
  tgl_service: z.string().min(1, 'Tanggal service wajib diisi'),
  tgl_selesai: z.string().nullable().optional().or(z.literal('')),
  biaya: z.number().min(0, 'Biaya minimal 0').default(0).optional(),
  kerusakan: z.string().min(1, 'Kerusakan wajib diisi'),
  analisa: z.string().nullable().optional(),
  solusi: z.string().nullable().optional(),
});

module.exports = { serviceSchema };
