const router = require('express').Router();
const controller = require('../controllers/appointments.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { createAppointmentValidators, updateAppointmentValidators } = require('../validators/appointments.validators');

router.use(authMiddleware);

router.get('/stats/summary', async (req, res) => {
  try {
    const pool = require('../db/connection');
    const professionalId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [[{ todayCount }]] = await pool.query(
      'SELECT COUNT(*) as todayCount FROM appointments WHERE professionalId = ? AND DATE(appointmentDate) = ?',
      [professionalId, today]
    );
    const [[{ confirmedCount }]] = await pool.query(
      "SELECT COUNT(*) as confirmedCount FROM appointments WHERE professionalId = ? AND DATE(appointmentDate) = ? AND status = 'confirmed'",
      [professionalId, today]
    );
    const [[{ pendingCount }]] = await pool.query(
      "SELECT COUNT(*) as pendingCount FROM appointments WHERE professionalId = ? AND DATE(appointmentDate) = ? AND status = 'scheduled'",
      [professionalId, today]
    );
    const [[{ activePatientsCount }]] = await pool.query(
      'SELECT COUNT(DISTINCT patientId) as activePatientsCount FROM appointments WHERE professionalId = ?',
      [professionalId]
    );
    const [todayAppointments] = await pool.query(
      `SELECT a.id, p.name as patientName, a.type, a.appointmentDate, a.duration, a.status
       FROM appointments a
       JOIN patients p ON a.patientId = p.id
       WHERE a.professionalId = ? AND DATE(a.appointmentDate) = ?
       ORDER BY a.appointmentDate ASC`,
      [professionalId, today]
    );
    const [recentPatients] = await pool.query(
      `SELECT p.id, p.name, p.birthDate,
              (SELECT a2.type FROM appointments a2
               WHERE a2.patientId = p.id AND a2.professionalId = ?
               ORDER BY a2.appointmentDate DESC LIMIT 1) as lastType,
              (SELECT a3.appointmentDate FROM appointments a3
               WHERE a3.patientId = p.id AND a3.professionalId = ? AND a3.appointmentDate >= NOW()
               ORDER BY a3.appointmentDate ASC LIMIT 1) as nextAppointment
       FROM appointments a
       JOIN patients p ON a.patientId = p.id
       WHERE a.professionalId = ?
       GROUP BY p.id, p.name, p.birthDate
       ORDER BY MAX(a.appointmentDate) DESC
       LIMIT 5`,
      [professionalId, professionalId, professionalId]
    );

    res.json({ todayCount, confirmedCount, pendingCount, activePatientsCount, todayAppointments, recentPatients });
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
