const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporan.controller');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/barang/export/excel', laporanController.exportBarang);
router.get('/mutasi/export/excel', laporanController.exportMutasi);
router.get('/service/export/excel', laporanController.exportServiceReport);
router.get('/service-internal/export/excel', laporanController.exportServiceInternalReport);

module.exports = router;
