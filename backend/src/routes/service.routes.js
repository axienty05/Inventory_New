const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { serviceSchema } = require('../validators/service.schema');

router.use(authenticateToken);

router.get('/', serviceController.index);
router.get('/:id', serviceController.show);
router.post('/', validate(serviceSchema), serviceController.store);
router.put('/:id', validate(serviceSchema), serviceController.update);
router.delete('/:id', serviceController.destroy);

module.exports = router;
