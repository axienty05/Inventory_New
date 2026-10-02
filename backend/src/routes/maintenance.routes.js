const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { maintenanceSchema } = require('../validators/maintenance.schema');

router.use(authenticateToken);

router.get('/', maintenanceController.index);
router.post('/', validate(maintenanceSchema), maintenanceController.store);
router.put('/:id', validate(maintenanceSchema), maintenanceController.update);
router.delete('/:id', maintenanceController.destroy);

module.exports = router;
