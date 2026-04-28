const pool = require('../db/connection');

exports.getAll = async (req, res) => {
  try {
    const [patients] = await pool.query(
      "SELECT * FROM patients WHERE status = 'active' ORDER BY name ASC"
    );
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [[patient]] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
};
