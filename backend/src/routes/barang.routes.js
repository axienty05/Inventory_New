const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barang.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { createBarangSchema, updateBarangSchema } = require('../validators/barang.schema');

router.use(authenticateToken);

router.get('/', barangController.index);
router.get('/generate-kode', barangController.getKode);
router.get('/by-pemakai/:pemakaiId', barangController.byPemakai);
router.get('/:id', barangController.show);
router.post('/', validate(createBarangSchema), barangController.store);
router.put('/:id', validate(updateBarangSchema), barangController.update);
router.delete('/:id', barangController.destroy);

module.exports = router;
