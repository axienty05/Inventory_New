const prisma = require('../config/database');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { generateKodeBarang } = require('../utils/autoNumber');

async function getAll(req) {
  const { page, limit, skip } = getPagination(req);
  const search = req.query.search ? req.query.search.trim() : '';
  const status = req.query.status;
  const kategori = req.query.kategori;
  const pemakaiId = req.query.m_pemakai_id || req.query.pemakai_id || req.query.pemakaiId;
  const sortBy = req.query.sortBy || 'id';
  const sortDir = (req.query.sortDir || 'desc').toLowerCase();

  const where = {};
  if (status) where.status = status;
  if (kategori) {
    if (kategori.includes(',')) {
      where.kategori = { in: kategori.split(',').map((k) => k.trim()) };
    } else {
      where.kategori = kategori;
    }
  }
  if (pemakaiId) where.mPemakaiId = parseInt(pemakaiId, 10);
  if (search) {
    where.OR = [
      { kodeBarang: { contains: search, mode: 'insensitive' } },
      { namaBarang: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
      { keterangan: { contains: search, mode: 'insensitive' } },
      { pemakai: { nama: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.barang.count({ where }),
    prisma.barang.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
      include: {
        pemakai: true,
        dtMutasis: {
          include: {
            mtMutasi: {
              include: { supplier: true },
            },
          },
        },
      },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function getByPemakai(pemakaiId, excludeKategori = []) {
  const where = { mPemakaiId: parseInt(pemakaiId, 10) };
  if (excludeKategori && excludeKategori.length > 0) {
    where.kategori = { notIn: excludeKategori };
  }
  return prisma.barang.findMany({
    where,
    orderBy: { kategori: 'desc' },
    include: { pemakai: true },
  });
}

async function getById(id) {
  const barang = await prisma.barang.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      pemakai: true,
      dtMutasis: {
        include: { mtMutasi: { include: { supplier: true } } },
        orderBy: { createdAt: 'desc' },
      },
      services: {
        include: { serviceCenter: true },
        orderBy: { tglService: 'desc' },
      },
      serviceInternals: {
        orderBy: { tglService: 'desc' },
      },
    },
  });
  if (!barang) throw { statusCode: 404, message: 'Barang tidak ditemukan' };

  // Resolve pemakai names for dtMutasis
  const pemakaiIds = new Set();
  barang.dtMutasis.forEach((d) => {
    if (d.pemakaiLama) pemakaiIds.add(d.pemakaiLama);
    if (d.pemakaiBaru) pemakaiIds.add(d.pemakaiBaru);
  });

  const pemakais = await prisma.pemakai.findMany({
    where: { id: { in: Array.from(pemakaiIds) } },
  });
  const pemakaiMap = new Map(pemakais.map((p) => [p.id, p]));

  const dtMutasisWithPemakai = barang.dtMutasis.map((d) => ({
    ...d,
    pemakaiLamaData: pemakaiMap.get(d.pemakaiLama) || null,
    pemakaiBaruData: pemakaiMap.get(d.pemakaiBaru) || null,
  }));

  return {
    ...barang,
    dtMutasis: dtMutasisWithPemakai,
  };
}

async function create(data) {
  const kodeBarang = await generateKodeBarang();
  return prisma.barang.create({
    data: {
      kodeBarang,
      namaBarang: data.nama_barang,
      serialNumber: data.serial_number || null,
      mPemakaiId: data.m_pemakai_id,
      kategori: data.kategori,
      keterangan: data.keterangan || null,
      status: data.status || 'aktif',
    },
  });
}

async function update(id, data) {
  return prisma.barang.update({
    where: { id: parseInt(id, 10) },
    data: {
      namaBarang: data.nama_barang,
      serialNumber: data.serial_number || null,
      mPemakaiId: data.m_pemakai_id,
      kategori: data.kategori,
      keterangan: data.keterangan || null,
      status: data.status,
    },
  });
}

async function remove(id) {
  const barangId = parseInt(id, 10);

  const [hasMutasi, hasService, hasServiceInternal] = await Promise.all([
    prisma.dtMutasi.findFirst({ where: { mBarangId: barangId } }),
    prisma.service.findFirst({ where: { mBarangId: barangId } }),
    prisma.serviceInternal.findFirst({ where: { mBarangId: barangId } }),
  ]);

  if (hasMutasi) {
    throw { statusCode: 400, message: 'Data barang tidak bisa dihapus karena memiliki riwayat mutasi!' };
  }
  if (hasService) {
    throw { statusCode: 400, message: 'Data barang tidak bisa dihapus karena memiliki riwayat service!' };
  }
  if (hasServiceInternal) {
    throw { statusCode: 400, message: 'Data barang tidak bisa dihapus karena memiliki riwayat service internal!' };
  }

  return prisma.barang.delete({ where: { id: barangId } });
}

module.exports = { getAll, getByPemakai, getById, create, update, remove };
