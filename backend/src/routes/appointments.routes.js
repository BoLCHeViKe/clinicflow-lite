const router = require('express').Router();
const controller = require('../controllers/appointments.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { createAppointmentValidators, updateAppointmentValidators } = require('../validators/appointments.validators');

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', createAppointmentValidators, controller.create);
router.put('/:id', updateAppointmentValidators, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
