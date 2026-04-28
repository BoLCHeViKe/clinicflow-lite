const router = require('express').Router();
const controller = require('../controllers/patients.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);

module.exports = router;
