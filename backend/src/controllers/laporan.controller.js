const exportService = require('../services/export.service');
const prisma = require('../config/database');

async function exportBarang(req, res, next) {
  try {
    const { status, kategori, search, m_pemakai_id, pemakai_id } = req.query;
    const pemakai = m_pemakai_id || pemakai_id;
    const buffer = await exportService.exportBarangExcel(status, kategori, search, pemakai);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=barang.xlsx');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function exportMutasi(req, res, next) {
  try {
    const { month, year, jenisMutasi } = req.query;
    const buffer = await exportService.exportMutasiExcel(month, year, jenisMutasi);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan-mutasi.xlsx');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function exportServiceReport(req, res, next) {
  try {
    const { month, year } = req.query;
    const buffer = await exportService.exportServiceExcel(month, year);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=service.xlsx');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function exportServiceInternalReport(req, res, next) {
  try {
    const { month, year } = req.query;
    const buffer = await exportService.exportServiceInternalExcel(month, year);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=serviceinternal.xlsx');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  exportBarang,
  exportMutasi,
  exportServiceReport,
  exportServiceInternalReport,
};
