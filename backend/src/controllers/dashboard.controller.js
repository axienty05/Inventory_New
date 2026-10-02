const dashboardService = require('../services/dashboard.service');

async function summary(req, res, next) {
  try {
    const { yearPembelian, yearPenjualan, yearService } = req.query;
    const result = await dashboardService.getSummary(yearPembelian, yearPenjualan, yearService);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function chartKategori(req, res, next) {
  try {
    const result = await dashboardService.getChartKategori();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function chartTopService(req, res, next) {
  try {
    const result = await dashboardService.getChartTopService();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function chartBarangBaru(req, res, next) {
  try {
    const result = await dashboardService.getChartBarangBaru();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, chartKategori, chartTopService, chartBarangBaru };
