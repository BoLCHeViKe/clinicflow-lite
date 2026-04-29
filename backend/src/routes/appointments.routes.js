const router = require('express').Router();
const controller = require('../controllers/appointments.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { logAccess } = require('../middleware/access-log.middleware');
const { createAppointmentValidators, updateAppointmentValidators } = require('../validators/appointments.validators');

router.use(authMiddleware);

// Stats — antes de /:id para evitar que 'summary' se interprete como id
router.get('/stats/summary', async (req, res) => {
  try {
    const pool = require('../db/connection');
    const professionalId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // ── Contadores de hoy (toda la clínica) ──────────────────────
    const [[{ todayCount }]] = await pool.query(
      'SELECT COUNT(*) as todayCount FROM appointments WHERE DATE(appointmentDate) = ?', [today]
    );
    const [[{ confirmedCount }]] = await pool.query(
      "SELECT COUNT(*) as confirmedCount FROM appointments WHERE DATE(appointmentDate) = ? AND status = 'confirmed'", [today]
    );
    const [[{ pendingCount }]] = await pool.query(
      "SELECT COUNT(*) as pendingCount FROM appointments WHERE DATE(appointmentDate) = ? AND status = 'scheduled'", [today]
    );
    const [[{ cancelledCount }]] = await pool.query(
      "SELECT COUNT(*) as cancelledCount FROM appointments WHERE DATE(appointmentDate) = ? AND status IN ('cancelled','no_show')", [today]
    );

    // ── Citas en las próximas 2 horas ────────────────────────────
    const [next2hAppointments] = await pool.query(
      `SELECT a.id, p.name AS patientName, a.type, a.appointmentDate, a.duration, a.status, u.name AS professionalName
       FROM appointments a
       JOIN patients p ON a.patientId = p.id
       JOIN users u ON a.professionalId = u.id
       WHERE a.appointmentDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
         AND a.status NOT IN ('cancelled','no_show')
       ORDER BY a.appointmentDate ASC`
    );

    // ── Pacientes nuevos esta semana ──────────────────────────────
    const [[{ newPatientsThisWeek }]] = await pool.query(
      'SELECT COUNT(*) as newPatientsThisWeek FROM patients WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );

    // ── Pacientes activos ─────────────────────────────────────────
    const [[{ activePatientsCount }]] = await pool.query(
      'SELECT COUNT(DISTINCT patientId) as activePatientsCount FROM appointments'
    );

    // ── Top profesionales este mes ────────────────────────────────
    const [topProfessionals] = await pool.query(
      `SELECT u.id, u.name,
              COUNT(a.id) AS totalAppointments,
              SUM(CASE WHEN a.status IN ('cancelled','no_show') THEN 1 ELSE 0 END) AS cancelledAppointments
       FROM users u
       LEFT JOIN appointments a ON a.professionalId = u.id
         AND MONTH(a.appointmentDate) = MONTH(NOW())
         AND YEAR(a.appointmentDate)  = YEAR(NOW())
       WHERE u.role = 'professional'
       GROUP BY u.id, u.name
       ORDER BY totalAppointments DESC
       LIMIT 5`
    );

    // ── Tasa de cancelación este mes ─────────────────────────────
    const [[{ totalMonth, cancelledMonth }]] = await pool.query(
      `SELECT COUNT(*) AS totalMonth,
              SUM(CASE WHEN status IN ('cancelled','no_show') THEN 1 ELSE 0 END) AS cancelledMonth
       FROM appointments
       WHERE MONTH(appointmentDate) = MONTH(NOW())
         AND YEAR(appointmentDate)  = YEAR(NOW())`
    );
    const cancellationRate = Number(totalMonth) > 0
      ? Math.round((Number(cancelledMonth) / Number(totalMonth)) * 100)
      : 0;

    // ── Lista de citas de hoy del profesional logado ──────────────
    const [todayAppointments] = await pool.query(
      `SELECT a.id, p.name AS patientName, a.type, a.appointmentDate, a.duration, a.status
       FROM appointments a
       JOIN patients p ON a.patientId = p.id
       WHERE a.professionalId = ? AND DATE(a.appointmentDate) = ?
       ORDER BY a.appointmentDate ASC`,
      [professionalId, today]
    );

    // ── Pacientes recientes del profesional ───────────────────────
    const [recentPatients] = await pool.query(
      `SELECT p.id, p.name, p.birthDate,
              (SELECT a2.type FROM appointments a2
               WHERE a2.patientId = p.id AND a2.professionalId = ?
               ORDER BY a2.appointmentDate DESC LIMIT 1) AS lastType,
              (SELECT a3.appointmentDate FROM appointments a3
               WHERE a3.patientId = p.id AND a3.professionalId = ? AND a3.appointmentDate >= NOW()
               ORDER BY a3.appointmentDate ASC LIMIT 1) AS nextAppointment
       FROM appointments a
       JOIN patients p ON a.patientId = p.id
       WHERE a.professionalId = ?
       GROUP BY p.id, p.name, p.birthDate
       ORDER BY MAX(a.appointmentDate) DESC
       LIMIT 5`,
      [professionalId, professionalId, professionalId]
    );

    res.json({
      todayCount, confirmedCount, pendingCount, cancelledCount,
      activePatientsCount, newPatientsThisWeek, cancellationRate,
      next2hAppointments, topProfessionals,
      todayAppointments, recentPatients,
    });
  } catch (error) {
    console.error('Error en stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/',
  logAccess('appointments', 'view_list'),
  controller.getAll
);

router.get('/:id',
  logAccess('appointments', 'view_detail'),
  controller.getById
);

router.post('/', createAppointmentValidators, controller.create);

// Profesionales pueden actualizar sus propias citas; admin/receptionist pueden actualizar cualquiera
router.put('/:id', updateAppointmentValidators, controller.update);

// Solo admin y receptionist pueden eliminar citas
router.delete('/:id', requireRole('admin', 'receptionist'), controller.remove);

module.exports = router;
