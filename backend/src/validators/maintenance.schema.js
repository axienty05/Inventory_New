const { z } = require('zod');

const maintenanceSchema = z.object({
  m_barang_id: z.number().int().positive('Barang wajib dipilih').nullable().optional(),
  scheduled_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.boolean().default(false),
});

module.exports = { maintenanceSchema };
