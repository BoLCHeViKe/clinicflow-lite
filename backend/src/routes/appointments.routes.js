const router = require('express').Router();
const controller = require('../controllers/appointments.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { createAppointmentValidators, updateAppointmentValidators } = require('../validators/appointments.validators');

router.use(authMiddleware);

router.get('/stats/summary', async (req, res) => {
  try {
    const pool = require('../db/connection');
    const professionalId = req.user.id;

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM appointments WHERE professionalId = ?', [professionalId]
    );
    const [byStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM appointments WHERE professionalId = ? GROUP BY status', [professionalId]
    );
    const [recent] = await pool.query(
      'SELECT * FROM appointments WHERE professionalId = ? ORDER BY createdAt DESC LIMIT 5', [professionalId]
    );
    const [[{ thisWeek }]] = await pool.query(
      'SELECT COUNT(*) as thisWeek FROM appointments WHERE professionalId = ? AND appointmentDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)', [professionalId]
    );

    res.json({ total, byStatus, recent, thisWeek });
  } catch (error) {
    console.error('Error en stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', createAppointmentValidators, controller.create);
router.put('/:id', updateAppointmentValidators, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
