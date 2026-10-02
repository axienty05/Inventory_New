const express = require('express');
const router = express.Router();
const pemakaiController = require('../controllers/pemakai.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { pemakaiSchema } = require('../validators/pemakai.schema');

router.use(authenticateToken);

router.get('/', pemakaiController.index);
router.get('/all', pemakaiController.allList);
router.get('/:id', pemakaiController.show);
router.post('/', validate(pemakaiSchema), pemakaiController.store);
router.put('/:id', validate(pemakaiSchema), pemakaiController.update);
router.delete('/:id', pemakaiController.destroy);

module.exports = router;
