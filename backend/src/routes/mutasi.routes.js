const express = require('express');
const router = express.Router();
const mutasiController = require('../controllers/mutasi.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { createMutasiSchema, updateMutasiSchema } = require('../validators/mutasi.schema');

router.use(authenticateToken);

router.get('/', mutasiController.index);
router.get('/generate-nomor', mutasiController.getNomor);
router.get('/:id', mutasiController.show);
router.post('/', validate(createMutasiSchema), mutasiController.store);
router.put('/:id', validate(updateMutasiSchema), mutasiController.update);
router.delete('/:id', mutasiController.destroy);

module.exports = router;
