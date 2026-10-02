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
      { namaService: { contains: search, mode: 'insensitive' } },
      { alamat: { contains: search, mode: 'insensitive' } },
      { noTelp: { contains: search, mode: 'insensitive' } },
      { cp: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.serviceCenter.count({ where }),
    prisma.serviceCenter.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function getActive() {
  return prisma.serviceCenter.findMany({
    where: { status: true },
    orderBy: { namaService: 'asc' },
  });
}

async function getById(id) {
  const sc = await prisma.serviceCenter.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!sc) throw { statusCode: 404, message: 'Service Center tidak ditemukan' };
  return sc;
}

async function create(data) {
  return prisma.serviceCenter.create({
    data: {
      namaService: data.nama_service,
      noTelp: data.no_telp,
      alamat: data.alamat,
      cp: data.cp || null,
      noHp: data.no_hp || null,
      keterangan: data.keterangan || null,
      status: data.status || false,
    },
  });
}

async function update(id, data) {
  return prisma.serviceCenter.update({
    where: { id: parseInt(id, 10) },
    data: {
      namaService: data.nama_service,
      noTelp: data.no_telp,
      alamat: data.alamat,
      cp: data.cp || null,
      noHp: data.no_hp || null,
      keterangan: data.keterangan || null,
      status: data.status,
    },
  });
}

async function remove(id) {
  return prisma.serviceCenter.delete({ where: { id: parseInt(id, 10) } });
}

module.exports = { getAll, getActive, getById, create, update, remove };
