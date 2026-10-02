const prisma = require('../config/database');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');

async function getAll(req) {
  const { page, limit, skip } = getPagination(req);
  const search = req.query.search ? req.query.search.trim() : '';
  const sortBy = req.query.sortBy || 'id';
  const sortDir = (req.query.sortDir || 'desc').toLowerCase();

  const where = {};
  if (search) {
    where.OR = [
      { pemakai: { nama: { contains: search, mode: 'insensitive' } } },
      { barang: { namaBarang: { contains: search, mode: 'insensitive' } } },
      { barang: { serialNumber: { contains: search, mode: 'insensitive' } } },
      { kerusakan: { contains: search, mode: 'insensitive' } },
    ];
  }

  const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
  const year = req.query.year ? parseInt(req.query.year, 10) : undefined;

  if (month && year) {
    where.tglService = {
      gte: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
      lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
    };
  } else if (year) {
    where.tglService = {
      gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
      lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
    };
  }

  const [total, data] = await Promise.all([
    prisma.serviceInternal.count({ where }),
    prisma.serviceInternal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
      include: {
        pemakai: true,
        barang: true,
      },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function getById(id) {
  const item = await prisma.serviceInternal.findUnique({
    where: { id: parseInt(id, 10) },
    include: { pemakai: true, barang: true },
  });
  if (!item) throw { statusCode: 404, message: 'Data service internal tidak ditemukan' };
  return item;
}

async function create(data) {
  const created = await prisma.serviceInternal.create({
    data: {
      mPemakaiId: data.m_pemakai_id,
      mBarangId: data.m_barang_id,
      tglService: new Date(data.tgl_service),
      tglSelesai: data.tgl_selesai ? new Date(data.tgl_selesai) : null,
      kerusakan: data.kerusakan,
    },
  });

  // Observer side-effect
  const newStatus = data.tgl_selesai ? 'aktif' : 'sedang_service';
  await prisma.barang.update({
    where: { id: data.m_barang_id },
    data: { status: newStatus },
  });

  return created;
}

async function update(id, data) {
  const serviceId = parseInt(id, 10);
  const updated = await prisma.serviceInternal.update({
    where: { id: serviceId },
    data: {
      mPemakaiId: data.m_pemakai_id,
      mBarangId: data.m_barang_id,
      tglService: new Date(data.tgl_service),
      tglSelesai: data.tgl_selesai ? new Date(data.tgl_selesai) : null,
      kerusakan: data.kerusakan,
    },
  });

  const newStatus = data.tgl_selesai ? 'aktif' : 'sedang_service';
  await prisma.barang.update({
    where: { id: data.m_barang_id },
    data: { status: newStatus },
  });

  return updated;
}

async function remove(id) {
  const serviceId = parseInt(id, 10);
  const existing = await prisma.serviceInternal.findUnique({ where: { id: serviceId } });
  if (!existing) throw { statusCode: 404, message: 'Data service internal tidak ditemukan' };

  await prisma.serviceInternal.delete({ where: { id: serviceId } });

  await prisma.barang.update({
    where: { id: existing.mBarangId },
    data: { status: 'aktif' },
  });

  return { message: 'Data service internal berhasil dihapus' };
}

module.exports = { getAll, getById, create, update, remove };
