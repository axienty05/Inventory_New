const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const pemakaiRoutes = require('./pemakai.routes');
const supplierRoutes = require('./supplier.routes');
const serviceCenterRoutes = require('./serviceCenter.routes');
const barangRoutes = require('./barang.routes');
const serviceRoutes = require('./service.routes');
const serviceInternalRoutes = require('./serviceInternal.routes');
const mutasiRoutes = require('./mutasi.routes');
const maintenanceRoutes = require('./maintenance.routes');
const dashboardRoutes = require('./dashboard.routes');
const laporanRoutes = require('./laporan.routes');

router.use('/auth', authRoutes);
router.use('/pemakais', pemakaiRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/service-centers', serviceCenterRoutes);
router.use('/barangs', barangRoutes);
router.use('/services', serviceRoutes);
router.use('/service-internals', serviceInternalRoutes);
router.use('/mutasis', mutasiRoutes);
router.use('/maintenances', maintenanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/laporan', laporanRoutes);

module.exports = router;
