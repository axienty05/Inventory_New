const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { supplierSchema } = require('../validators/supplier.schema');

router.use(authenticateToken);

router.get('/', supplierController.index);
router.get('/active', supplierController.active);
router.get('/:id', supplierController.show);
router.post('/', validate(supplierSchema), supplierController.store);
router.put('/:id', validate(supplierSchema), supplierController.update);
router.delete('/:id', supplierController.destroy);

module.exports = router;
