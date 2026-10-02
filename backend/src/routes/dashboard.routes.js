const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/summary', dashboardController.summary);
router.get('/chart/kategori', dashboardController.chartKategori);
router.get('/chart/top-service', dashboardController.chartTopService);
router.get('/chart/barang-baru', dashboardController.chartBarangBaru);

module.exports = router;
