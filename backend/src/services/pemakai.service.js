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
      { nama: { contains: search, mode: 'insensitive' } },
    ];
    if (['it', 'fa', 'exim', 'hrd', 'rnd', 'lab', 'ppic', 'iso', 'produksi', 'marketing', 'teknik'].includes(search.toLowerCase())) {
      where.OR.push({ department: search.toLowerCase() });
    }
  }

  const [total, data] = await Promise.all([
    prisma.pemakai.count({ where }),
    prisma.pemakai.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function getAllList() {
  return prisma.pemakai.findMany({
    orderBy: { nama: 'asc' },
  });
}

async function getById(id) {
  const pemakai = await prisma.pemakai.findUnique({
    where: { id: parseInt(id, 10) },
    include: { barangs: true },
  });
  if (!pemakai) throw { statusCode: 404, message: 'Pemakai tidak ditemukan' };
  return pemakai;
}

async function create(data) {
  return prisma.pemakai.create({ data });
}

async function update(id, data) {
  return prisma.pemakai.update({
    where: { id: parseInt(id, 10) },
    data,
  });
}

async function remove(id) {
  const pemakaiId = parseInt(id, 10);
  const countBarang = await prisma.barang.count({ where: { mPemakaiId: pemakaiId } });
  if (countBarang > 0) {
    throw { statusCode: 400, message: 'Pemakai tidak bisa dihapus karena masih memiliki barang terkait.' };
  }
  return prisma.pemakai.delete({ where: { id: pemakaiId } });
}

module.exports = { getAll, getAllList, getById, create, update, remove };
