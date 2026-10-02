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
      { namaSupplier: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { alamat: { contains: search, mode: 'insensitive' } },
      { noTelp: { contains: search, mode: 'insensitive' } },
      { cp: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function getActive() {
  return prisma.supplier.findMany({
    where: { status: true },
    orderBy: { namaSupplier: 'asc' },
  });
}

async function getById(id) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!supplier) throw { statusCode: 404, message: 'Supplier tidak ditemukan' };
  return supplier;
}

async function create(data) {
  return prisma.supplier.create({
    data: {
      namaSupplier: data.nama_supplier,
      alamat: data.alamat,
      noTelp: data.no_telp || null,
      email: data.email || null,
      cp: data.cp || null,
      noHp: data.no_hp || null,
      keterangan: data.keterangan || null,
      status: data.status || false,
    },
  });
}

async function update(id, data) {
  return prisma.supplier.update({
    where: { id: parseInt(id, 10) },
    data: {
      namaSupplier: data.nama_supplier,
      alamat: data.alamat,
      noTelp: data.no_telp || null,
      email: data.email || null,
      cp: data.cp || null,
      noHp: data.no_hp || null,
      keterangan: data.keterangan || null,
      status: data.status,
    },
  });
}

async function remove(id) {
  return prisma.supplier.delete({ where: { id: parseInt(id, 10) } });
}

module.exports = { getAll, getActive, getById, create, update, remove };
