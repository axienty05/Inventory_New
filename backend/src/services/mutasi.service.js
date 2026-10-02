const prisma = require('../config/database');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { generateNomorMutasi } = require('../utils/autoNumber');

async function getAll(req) {
  const { page, limit, skip } = getPagination(req);
  const search = req.query.search ? req.query.search.trim() : '';
  const sortBy = req.query.sortBy || 'id';
  const sortDir = (req.query.sortDir || 'desc').toLowerCase();

  const where = {};
  if (search) {
    where.OR = [
      { noMutasi: { contains: search, mode: 'insensitive' } },
      { supplier: { namaSupplier: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const jenis = req.query.jenis || req.query.jenisMutasi;
  if (jenis) {
    where.jenisMutasi = jenis;
  }

  const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
  const year = req.query.year ? parseInt(req.query.year, 10) : undefined;

  if (month && year) {
    where.tglMutasi = {
      gte: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
      lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
    };
  } else if (year) {
    where.tglMutasi = {
      gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
      lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
    };
  }

  const [total, data] = await Promise.all([
    prisma.mtMutasi.count({ where }),
    prisma.mtMutasi.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
      include: {
        supplier: true,
        dtMutasis: {
          include: {
            barang: true,
          },
        },
      },
    }),
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

async function getById(id) {
  const mutasi = await prisma.mtMutasi.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      supplier: true,
      dtMutasis: {
        include: {
          barang: {
            include: { pemakai: true },
          },
        },
      },
    },
  });
  if (!mutasi) throw { statusCode: 404, message: 'Data mutasi tidak ditemukan' };

  const pemakaiIds = new Set();
  mutasi.dtMutasis.forEach((d) => {
    if (d.pemakaiLama) pemakaiIds.add(d.pemakaiLama);
    if (d.pemakaiBaru) pemakaiIds.add(d.pemakaiBaru);
  });

  const pemakais = await prisma.pemakai.findMany({
    where: { id: { in: Array.from(pemakaiIds) } },
  });
  const pemakaiMap = new Map(pemakais.map((p) => [p.id, p]));

  const dtMutasisWithPemakai = mutasi.dtMutasis.map((d) => ({
    ...d,
    pemakaiLamaData: pemakaiMap.get(d.pemakaiLama) || null,
    pemakaiBaruData: pemakaiMap.get(d.pemakaiBaru) || null,
  }));

  return {
    ...mutasi,
    dtMutasis: dtMutasisWithPemakai,
  };
}

async function create(data) {
  const noMutasi = data.no_mutasi || (await generateNomorMutasi(data.jenis_mutasi));

  return prisma.$transaction(async (tx) => {
    // 1. Validation for pembelian / penjualan
    if (data.jenis_mutasi !== 'perpindahan') {
      for (const item of data.dtMutasis) {
        const existingMutasi = await tx.dtMutasi.findFirst({
          where: {
            mBarangId: item.m_barang_id,
            mtMutasi: {
              jenisMutasi: data.jenis_mutasi,
            },
          },
          include: { barang: true },
        });
        if (existingMutasi) {
          throw {
            statusCode: 400,
            message: 'Mutasi ' + data.jenis_mutasi + ' untuk ' + (existingMutasi.barang?.namaBarang || 'barang ini') + ' sudah ada.',
          };
        }
      }
    }

    // 2. Create Header
    const mtMutasi = await tx.mtMutasi.create({
      data: {
        noMutasi,
        mSupplierId: data.m_supplier_id || null,
        jenisMutasi: data.jenis_mutasi,
        tglMutasi: new Date(data.tgl_mutasi),
        keterangan: data.keterangan || null,
      },
    });

    // 3. Create Details & Handle Side Effects
    for (const item of data.dtMutasis) {
      await tx.dtMutasi.create({
        data: {
          mtMutasiId: mtMutasi.id,
          mBarangId: item.m_barang_id,
          pemakaiLama: item.pemakai_lama,
          pemakaiBaru: item.pemakai_baru || null,
          harga: item.harga ? BigInt(item.harga) : BigInt(0),
        },
      });

      if (data.jenis_mutasi === 'perpindahan' && item.pemakai_baru) {
        await tx.barang.update({
          where: { id: item.m_barang_id },
          data: { mPemakaiId: item.pemakai_baru },
        });
      } else if (data.jenis_mutasi === 'penjualan') {
        await tx.barang.update({
          where: { id: item.m_barang_id },
          data: { status: 'dijual' },
        });
      }
    }

    return mtMutasi;
  });
}

async function update(id, data) {
  const mutasiId = parseInt(id, 10);
  const existing = await prisma.mtMutasi.findUnique({
    where: { id: mutasiId },
    include: { dtMutasis: true },
  });
  if (!existing) throw { statusCode: 404, message: 'Data mutasi tidak ditemukan' };

  return prisma.$transaction(async (tx) => {
    // 1. Rollback previous side effects on barang
    if (existing.jenisMutasi === 'perpindahan') {
      for (const oldDetail of existing.dtMutasis) {
        if (oldDetail.pemakaiLama) {
          await tx.barang.update({
            where: { id: oldDetail.mBarangId },
            data: { mPemakaiId: oldDetail.pemakaiLama },
          });
        }
      }
    } else if (existing.jenisMutasi === 'penjualan') {
      for (const oldDetail of existing.dtMutasis) {
        await tx.barang.update({
          where: { id: oldDetail.mBarangId },
          data: { status: 'aktif' },
        });
      }
    }

    // 2. Validate for pembelian / penjualan duplicate (excluding this mutasi)
    if (existing.jenisMutasi !== 'perpindahan') {
      for (const item of data.dtMutasis) {
        const existingMutasi = await tx.dtMutasi.findFirst({
          where: {
            mBarangId: item.m_barang_id,
            mtMutasiId: { not: mutasiId },
            mtMutasi: {
              jenisMutasi: existing.jenisMutasi,
            },
          },
          include: { barang: true },
        });
        if (existingMutasi) {
          throw {
            statusCode: 400,
            message: 'Mutasi ' + existing.jenisMutasi + ' untuk ' + (existingMutasi.barang?.namaBarang || 'barang ini') + ' sudah ada di transaksi lain.',
          };
        }
      }
    }

    // 3. Update Header
    const mtMutasi = await tx.mtMutasi.update({
      where: { id: mutasiId },
      data: {
        mSupplierId: data.m_supplier_id || null,
        tglMutasi: new Date(data.tgl_mutasi),
        keterangan: data.keterangan || null,
      },
    });

    // 4. Replace Details
    await tx.dtMutasi.deleteMany({ where: { mtMutasiId: mutasiId } });

    for (const item of data.dtMutasis) {
      await tx.dtMutasi.create({
        data: {
          mtMutasiId: mutasiId,
          mBarangId: item.m_barang_id,
          pemakaiLama: item.pemakai_lama,
          pemakaiBaru: item.pemakai_baru || null,
          harga: item.harga ? BigInt(item.harga) : BigInt(0),
        },
      });

      // Apply new side effects
      if (existing.jenisMutasi === 'perpindahan' && item.pemakai_baru) {
        await tx.barang.update({
          where: { id: item.m_barang_id },
          data: { mPemakaiId: item.pemakai_baru },
        });
      } else if (existing.jenisMutasi === 'penjualan') {
        await tx.barang.update({
          where: { id: item.m_barang_id },
          data: { status: 'dijual' },
        });
      }
    }

    return mtMutasi;
  });
}

async function remove(id) {
  const mutasiId = parseInt(id, 10);
  const mutasi = await prisma.mtMutasi.findUnique({
    where: { id: mutasiId },
    include: { dtMutasis: true },
  });
  if (!mutasi) throw { statusCode: 404, message: 'Data mutasi tidak ditemukan' };

  return prisma.$transaction(async (tx) => {
    // Rollback pemakai if perpindahan
    if (mutasi.jenisMutasi === 'perpindahan') {
      for (const detail of mutasi.dtMutasis) {
        if (detail.pemakaiLama) {
          await tx.barang.update({
            where: { id: detail.mBarangId },
            data: { mPemakaiId: detail.pemakaiLama },
          });
        }
      }
    } else if (mutasi.jenisMutasi === 'penjualan') {
      for (const detail of mutasi.dtMutasis) {
        await tx.barang.update({
          where: { id: detail.mBarangId },
          data: { status: 'aktif' },
        });
      }
    }

    await tx.dtMutasi.deleteMany({ where: { mtMutasiId: mutasiId } });
    await tx.mtMutasi.delete({ where: { id: mutasiId } });

    return { message: 'Data mutasi berhasil dihapus' };
  });
}

module.exports = { getAll, getById, create, update, remove };
