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
      { noSj: { contains: search, mode: 'insensitive' } },
      { pemakai: { nama: { contains: search, mode: 'insensitive' } } },
      { barang: { namaBarang: { contains: search, mode: 'insensitive' } } },
      { barang: { serialNumber: { contains: search, mode: 'insensitive' } } },
      { serviceCenter: { namaService: { contains: search, mode: 'insensitive' } } },
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
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
      include: {
        pemakai: true,
        barang: true,
        serviceCenter: true,
      },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function getById(id) {
  const item = await prisma.service.findUnique({
    where: { id: parseInt(id, 10) },
    include: { pemakai: true, barang: true, serviceCenter: true },
  });
  if (!item) throw { statusCode: 404, message: 'Data service tidak ditemukan' };
  return item;
}

async function create(data) {
  const created = await prisma.service.create({
    data: {
      noSj: data.no_sj || null,
      mPemakaiId: data.m_pemakai_id,
      mBarangId: data.m_barang_id,
      mServiceCenterId: data.m_service_center_id,
      tglService: new Date(data.tgl_service),
      tglSelesai: data.tgl_selesai ? new Date(data.tgl_selesai) : null,
      biaya: data.biaya ? BigInt(data.biaya) : BigInt(0),
      kerusakan: data.kerusakan,
      analisa: data.analisa || null,
      solusi: data.solusi || null,
    },
  });

  // Observer side-effect: update status barang
  const newStatus = data.tgl_selesai ? 'aktif' : 'sedang_service';
  await prisma.barang.update({
    where: { id: data.m_barang_id },
    data: { status: newStatus },
  });

  return created;
}

async function update(id, data) {
  const serviceId = parseInt(id, 10);
  const updated = await prisma.service.update({
    where: { id: serviceId },
    data: {
      noSj: data.no_sj || null,
      mPemakaiId: data.m_pemakai_id,
      mBarangId: data.m_barang_id,
      mServiceCenterId: data.m_service_center_id,
      tglService: new Date(data.tgl_service),
      tglSelesai: data.tgl_selesai ? new Date(data.tgl_selesai) : null,
      biaya: data.biaya !== undefined ? BigInt(data.biaya) : undefined,
      kerusakan: data.kerusakan,
      analisa: data.analisa || null,
      solusi: data.solusi || null,
    },
  });

  // Observer side-effect
  const newStatus = data.tgl_selesai ? 'aktif' : 'sedang_service';
  await prisma.barang.update({
    where: { id: data.m_barang_id },
    data: { status: newStatus },
  });

  return updated;
}

async function remove(id) {
  const serviceId = parseInt(id, 10);
  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) throw { statusCode: 404, message: 'Data service tidak ditemukan' };

  await prisma.service.delete({ where: { id: serviceId } });

  // Observer side-effect: reset barang ke aktif
  await prisma.barang.update({
    where: { id: existing.mBarangId },
    data: { status: 'aktif' },
  });

  return { message: 'Data service berhasil dihapus' };
}

module.exports = { getAll, getById, create, update, remove };
