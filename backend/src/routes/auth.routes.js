const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { registerValidators, loginValidators } = require('../validators/auth.validators');

router.post('/register', registerValidators, authController.register);
router.post('/login', loginValidators, authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
