const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const prisma = require('../config/database');

async function exportBarangExcel(status, kategori, search, pemakaiId) {
  const where = {};
  if (status) where.status = status;
  if (kategori) where.kategori = kategori;
  if (pemakaiId) where.mPemakaiId = parseInt(pemakaiId, 10);
  if (search) {
    where.OR = [
      { kodeBarang: { contains: search, mode: 'insensitive' } },
      { namaBarang: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
      { pemakai: { nama: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const barangs = await prisma.barang.findMany({
    where,
    include: { pemakai: true },
    orderBy: { namaBarang: 'asc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data Barang');

  sheet.columns = [
    { header: 'Kode Barang', key: 'kodeBarang', width: 15 },
    { header: 'Pemakai', key: 'pemakai', width: 25 },
    { header: 'Nama Barang', key: 'namaBarang', width: 30 },
    { header: 'S/N', key: 'serialNumber', width: 20 },
    { header: 'Kategori', key: 'kategori', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Keterangan', key: 'keterangan', width: 30 },
  ];

  barangs.forEach((b) => {
    sheet.addRow({
      kodeBarang: b.kodeBarang,
      pemakai: b.pemakai ? b.pemakai.nama : '-',
      namaBarang: b.namaBarang,
      serialNumber: b.serialNumber || '-',
      kategori: b.kategori,
      status: b.status.replace(/_/g, ' '),
      keterangan: b.keterangan || '-',
    });
  });

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

async function exportMutasiExcel(month, year, jenisMutasi) {
  const where = {};
  if (jenisMutasi) where.jenisMutasi = jenisMutasi;
  if (month && year) {
    where.tglMutasi = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59),
    };
  } else if (year) {
    where.tglMutasi = {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59),
    };
  }

  const mutasis = await prisma.mtMutasi.findMany({
    where,
    include: {
      supplier: true,
      dtMutasis: {
        include: { barang: true },
      },
    },
    orderBy: { tglMutasi: 'asc' },
  });

  const pemakaiMap = {};
  const pemakais = await prisma.pemakai.findMany();
  pemakais.forEach((p) => (pemakaiMap[p.id] = p.nama));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Laporan Mutasi');

  if (jenisMutasi === 'perpindahan') {
    sheet.columns = [
      { header: 'Tanggal Mutasi', key: 'tgl', width: 15 },
      { header: 'No Mutasi', key: 'noMutasi', width: 18 },
      { header: 'Nama Barang', key: 'namaBarang', width: 25 },
      { header: 'Serial Number', key: 'serialNumber', width: 20 },
      { header: 'Pemakai Lama', key: 'pemakaiLama', width: 20 },
      { header: 'Pemakai Baru', key: 'pemakaiBaru', width: 20 },
    ];
  } else {
    sheet.columns = [
      { header: 'Tanggal Mutasi', key: 'tgl', width: 15 },
      { header: 'No Mutasi', key: 'noMutasi', width: 18 },
      { header: 'Nama Barang', key: 'namaBarang', width: 25 },
      { header: 'Serial Number', key: 'serialNumber', width: 20 },
      { header: 'Supplier', key: 'supplier', width: 25 },
      { header: 'Harga', key: 'harga', width: 18 },
    ];
  }

  mutasis.forEach((m) => {
    const tglStr = m.tglMutasi.toISOString().split('T')[0];
    m.dtMutasis.forEach((d) => {
      if (jenisMutasi === 'perpindahan') {
        sheet.addRow({
          tgl: tglStr,
          noMutasi: m.noMutasi,
          namaBarang: d.barang?.namaBarang || '-',
          serialNumber: d.barang?.serialNumber || '-',
          pemakaiLama: pemakaiMap[d.pemakaiLama] || '-',
          pemakaiBaru: pemakaiMap[d.pemakaiBaru] || '-',
        });
      } else {
        sheet.addRow({
          tgl: tglStr,
          noMutasi: m.noMutasi,
          namaBarang: d.barang?.namaBarang || '-',
          serialNumber: d.barang?.serialNumber || '-',
          supplier: m.supplier?.namaSupplier || '-',
          harga: Number(d.harga || 0),
        });
      }
    });
  });

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

async function exportServiceExcel(month, year) {
  const where = {};
  if (month && year) {
    where.tglService = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59),
    };
  } else if (year) {
    where.tglService = {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59),
    };
  }

  const services = await prisma.service.findMany({
    where,
    include: { pemakai: true, barang: true, serviceCenter: true },
    orderBy: { tglService: 'asc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Laporan Service');

  sheet.columns = [
    { header: 'Mulai', key: 'mulai', width: 15 },
    { header: 'Selesai', key: 'selesai', width: 15 },
    { header: 'No SJ', key: 'noSj', width: 15 },
    { header: 'Nama Barang', key: 'namaBarang', width: 25 },
    { header: 'S/N', key: 'serialNumber', width: 20 },
    { header: 'User', key: 'user', width: 20 },
    { header: 'Biaya', key: 'biaya', width: 15 },
    { header: 'Tempat', key: 'tempat', width: 25 },
    { header: 'Kerusakan', key: 'kerusakan', width: 30 },
  ];

  services.forEach((s) => {
    sheet.addRow({
      mulai: s.tglService ? s.tglService.toISOString().split('T')[0] : '-',
      selesai: s.tglSelesai ? s.tglSelesai.toISOString().split('T')[0] : '-',
      noSj: s.noSj || '-',
      namaBarang: s.barang?.namaBarang || '-',
      serialNumber: s.barang?.serialNumber || '-',
      user: s.pemakai?.nama || '-',
      biaya: Number(s.biaya || 0),
      tempat: s.serviceCenter?.namaService || '-',
      kerusakan: s.kerusakan || '-',
    });
  });

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

async function exportServiceInternalExcel(month, year) {
  const where = {};
  if (month && year) {
    where.tglService = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59),
    };
  } else if (year) {
    where.tglService = {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59),
    };
  }

  const services = await prisma.serviceInternal.findMany({
    where,
    include: { pemakai: true, barang: true },
    orderBy: { tglService: 'asc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Laporan Service Internal');

  sheet.columns = [
    { header: 'Mulai', key: 'mulai', width: 15 },
    { header: 'Selesai', key: 'selesai', width: 15 },
    { header: 'Nama Barang', key: 'namaBarang', width: 25 },
    { header: 'S/N', key: 'serialNumber', width: 20 },
    { header: 'User', key: 'user', width: 20 },
    { header: 'Kerusakan', key: 'kerusakan', width: 30 },
  ];

  services.forEach((s) => {
    sheet.addRow({
      mulai: s.tglService ? s.tglService.toISOString().split('T')[0] : '-',
      selesai: s.tglSelesai ? s.tglSelesai.toISOString().split('T')[0] : '-',
      namaBarang: s.barang?.namaBarang || '-',
      serialNumber: s.barang?.serialNumber || '-',
      user: s.pemakai?.nama || '-',
      kerusakan: s.kerusakan || '-',
    });
  });

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

module.exports = {
  exportBarangExcel,
  exportMutasiExcel,
  exportServiceExcel,
  exportServiceInternalExcel,
};
