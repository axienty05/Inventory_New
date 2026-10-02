const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { loginSchema, registerSchema, changePasswordSchema } = require('../validators/auth.schema');

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.get('/me', authenticateToken, authController.getMe);
router.put('/password', authenticateToken, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
