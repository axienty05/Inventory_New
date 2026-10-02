const { z } = require('zod');

const pemakaiSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  department: z.enum(['it', 'fa', 'exim', 'hrd', 'rnd', 'lab', 'ppic', 'iso', 'produksi', 'marketing', 'teknik'], {
    errorMap: () => ({ message: 'Department tidak valid' }),
  }),
  status: z.boolean().default(false),
});

module.exports = { pemakaiSchema };
