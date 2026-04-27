const router = require('express').Router();

// GET /api/appointments — lista de prueba
router.get('/', (req, res) => {
  res.json({ message: 'Ruta de citas funcionando', data: [] });
});

module.exports = router;
