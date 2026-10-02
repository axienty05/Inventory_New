const Department = {
  IT: 'it',
  FA: 'fa',
  EXIM: 'exim',
  HRD: 'hrd',
  RND: 'rnd',
  LAB: 'lab',
  PPIC: 'ppic',
  ISO: 'iso',
  PRODUKSI: 'produksi',
  MARKETING: 'marketing',
  TEKNIK: 'teknik',
};

const Kategori = {
  Komputer: 'komputer',
  Laptop: 'laptop',
  UPS: 'ups',
  Printer: 'printer',
  Monitor: 'monitor',
  Mouse: 'mouse',
  Keyboard: 'keyboard',
  Scanner: 'scanner',
  Stavolt: 'stavolt',
  Memory: 'memory',
  Storage: 'storage',
  License: 'license',
  Sparepart: 'sparepart',
  CCTV: 'cctv',
  LainLain: 'lain_lain',
};

const StatusBarang = {
  Aktif: 'aktif',
  TidakAktif: 'tidak_aktif',
  SedangService: 'sedang_service',
  Rusak: 'rusak',
  Dijual: 'dijual',
};

const JenisMutasi = {
  Pembelian: 'pembelian',
  Penjualan: 'penjualan',
  Perpindahan: 'perpindahan',
};

module.exports = {
  Department,
  Kategori,
  StatusBarang,
  JenisMutasi,
};
