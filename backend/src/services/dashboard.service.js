const prisma = require('../config/database');

async function getSummary(yearPembelian, yearPenjualan, yearService) {
  const currentYear = new Date().getFullYear();
  const yPembelian = parseInt(yearPembelian, 10) || currentYear;
  const yPenjualan = parseInt(yearPenjualan, 10) || currentYear;
  const yService = parseInt(yearService, 10) || currentYear;

  // 1. Total Harga Pembelian Tahun
  const pembelianDetails = await prisma.dtMutasi.findMany({
    where: {
      mtMutasi: {
        jenisMutasi: 'pembelian',
        tglMutasi: {
          gte: new Date(yPembelian, 0, 1),
          lte: new Date(yPembelian, 11, 31, 23, 59, 59),
        },
      },
    },
    select: { harga: true },
  });
  const totalHargaPembelian = pembelianDetails.reduce((sum, item) => sum + Number(item.harga || 0), 0);

  // 2. Total Harga Penjualan Tahun
  const penjualanDetails = await prisma.dtMutasi.findMany({
    where: {
      mtMutasi: {
        jenisMutasi: 'penjualan',
        tglMutasi: {
          gte: new Date(yPenjualan, 0, 1),
          lte: new Date(yPenjualan, 11, 31, 23, 59, 59),
        },
      },
    },
    select: { harga: true },
  });
  const totalHargaPenjualan = penjualanDetails.reduce((sum, item) => sum + Number(item.harga || 0), 0);

  // 3. Total Biaya Service Tahun
  const services = await prisma.service.findMany({
    where: {
      tglService: {
        gte: new Date(yService, 0, 1),
        lte: new Date(yService, 11, 31, 23, 59, 59),
      },
    },
    select: { biaya: true },
  });
  const totalBiayaService = services.reduce((sum, item) => sum + Number(item.biaya || 0), 0);

  return {
    totalHargaPembelian,
    totalHargaPenjualan,
    totalBiayaService,
    currentYear,
    years: [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5],
  };
}

async function getChartKategori() {
  const result = await prisma.barang.groupBy({
    by: ['kategori'],
    _count: { id: true },
  });
  return result.map((item) => ({
    kategori: item.kategori,
    total: item._count.id,
  }));
}

async function getChartTopService() {
  const result = await prisma.service.groupBy({
    by: ['mBarangId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const barangIds = result.map((r) => r.mBarangId);
  const barangs = await prisma.barang.findMany({
    where: { id: { in: barangIds } },
    select: { id: true, namaBarang: true },
  });

  const barangMap = {};
  barangs.forEach((b) => (barangMap[b.id] = b.namaBarang));

  return result.map((item) => ({
    namaBarang: barangMap[item.mBarangId] || 'Barang #' + item.mBarangId,
    total: item._count.id,
  }));
}

async function getChartBarangBaru() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const result = await prisma.barang.groupBy({
    by: ['namaBarang'],
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  return result.map((item) => ({
    namaBarang: item.namaBarang,
    total: item._count.id,
  }));
}

module.exports = {
  getSummary,
  getChartKategori,
  getChartTopService,
  getChartBarangBaru,
};
