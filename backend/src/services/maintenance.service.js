const prisma = require('../config/database');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');

async function getAll(req) {
  const { page, limit, skip } = getPagination(req);
  const search = req.query.search ? req.query.search.trim() : '';

  const where = {
    barang: {
      kategori: { in: ['komputer', 'laptop'] },
    },
  };

  if (search) {
    where.OR = [
      { notes: { contains: search, mode: 'insensitive' } },
      { barang: { namaBarang: { contains: search, mode: 'insensitive' } } },
      { barang: { kodeBarang: { contains: search, mode: 'insensitive' } } },
      { barang: { serialNumber: { contains: search, mode: 'insensitive' } } },
      { barang: { pemakai: { nama: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.maintenance.count({ where }),
    prisma.maintenance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'desc' },
      include: { barang: { include: { pemakai: true } } },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function create(data) {
  return prisma.maintenance.create({
    data: {
      mBarangId: data.m_barang_id,
      scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : null,
      notes: data.notes || null,
      status: data.status || false,
    },
  });
}

async function update(id, data) {
  return prisma.maintenance.update({
    where: { id: parseInt(id, 10) },
    data: {
      mBarangId: data.m_barang_id,
      scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : null,
      notes: data.notes || null,
      status: data.status,
    },
  });
}

async function remove(id) {
  return prisma.maintenance.delete({ where: { id: parseInt(id, 10) } });
}

module.exports = { getAll, create, update, remove };
