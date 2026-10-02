const express = require('express');
const router = express.Router();
const siController = require('../controllers/serviceInternal.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { serviceInternalSchema } = require('../validators/serviceInternal.schema');

router.use(authenticateToken);

router.get('/', siController.index);
router.get('/:id', siController.show);
router.post('/', validate(serviceInternalSchema), siController.store);
router.put('/:id', validate(serviceInternalSchema), siController.update);
router.delete('/:id', siController.destroy);

module.exports = router;
