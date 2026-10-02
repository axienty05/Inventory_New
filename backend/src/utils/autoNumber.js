const prisma = require('../config/database');

async function generateKodeBarang() {
  const lastBarang = await prisma.barang.findFirst({
    orderBy: { id: 'desc' },
  });
  if (lastBarang && lastBarang.kodeBarang && lastBarang.kodeBarang.startsWith('B/')) {
    const lastNumber = parseInt(lastBarang.kodeBarang.replace('B/', ''), 10) || 0;
    const nextNumber = (lastNumber + 1).toString().padStart(6, '0');
    return 'B/' + nextNumber;
  }
  return 'B/000001';
}

async function generateNomorMutasi(jenisMutasi) {
  let prefix = 'MB';
  if (jenisMutasi === 'penjualan') prefix = 'MJ';
  if (jenisMutasi === 'perpindahan') prefix = 'MP';

  const lastMutasi = await prisma.mtMutasi.findFirst({
    where: {
      noMutasi: {
        startsWith: prefix + '/',
      },
    },
    orderBy: { id: 'desc' },
  });

  let nextNumber = 1;
  if (lastMutasi) {
    const parts = lastMutasi.noMutasi.split('/');
    if (parts.length === 2) {
      nextNumber = (parseInt(parts[1], 10) || 0) + 1;
    }
  }

  return prefix + '/' + nextNumber.toString().padStart(5, '0');
}

module.exports = { generateKodeBarang, generateNomorMutasi };
