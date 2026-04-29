const router = require('express').Router();
const pool = require('../db/connection');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/professionals', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'professional' ORDER BY name"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getProfessionals:', error);
    res.status(500).json({ success: false, error: 'Error al obtener profesionales' });
  }
});

module.exports = router;
