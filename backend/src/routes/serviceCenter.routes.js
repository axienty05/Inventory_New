const express = require('express');
const router = express.Router();
const scController = require('../controllers/serviceCenter.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { serviceCenterSchema } = require('../validators/serviceCenter.schema');

router.use(authenticateToken);

router.get('/', scController.index);
router.get('/active', scController.active);
router.get('/:id', scController.show);
router.post('/', validate(serviceCenterSchema), scController.store);
router.put('/:id', validate(serviceCenterSchema), scController.update);
router.delete('/:id', scController.destroy);

module.exports = router;
