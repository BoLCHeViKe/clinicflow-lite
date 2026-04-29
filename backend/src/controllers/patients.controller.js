const pool = require('../db/connection');
const { validationResult } = require('express-validator');

// Campos que se devuelven en listados (sin medicalNotes ni address — datos sensibles/voluminosos)
const LIST_FIELDS = 'id, name, email, phone, birthDate, gender, status, createdAt';

exports.getAll = async (req, res) => {
  try {
    let patients;

    if (req.user.role === 'professional') {
      // Profesionales: solo ven pacientes con los que tienen citas
      [patients] = await pool.query(
        `SELECT DISTINCT ${LIST_FIELDS}
         FROM patients p
         WHERE status = 'active'
           AND EXISTS (
             SELECT 1 FROM appointments a
             WHERE a.patientId = p.id AND a.professionalId = ?
           )
         ORDER BY name ASC`,
        [req.user.id]
      );
    } else {
      // Admin / receptionist: todos los pacientes (sin medicalNotes en lista)
      [patients] = await pool.query(
        `SELECT ${LIST_FIELDS} FROM patients WHERE status = 'active' ORDER BY name ASC`
      );
    }

    res.json({ success: true, data: patients });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener pacientes' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [[patient]] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, error: 'Paciente no encontrado' });

    if (req.user.role === 'professional') {
      // Verificar que el profesional tiene al menos una cita con este paciente
      const [[access]] = await pool.query(
        'SELECT 1 FROM appointments WHERE patientId = ? AND professionalId = ? LIMIT 1',
        [req.params.id, req.user.id]
      );
      if (!access) {
        return res.status(403).json({ success: false, error: 'No tienes acceso a este paciente' });
      }
    }

    // El detalle incluye todos los campos (medicalNotes, address) — solo para usuarios autorizados
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ success: false, error: 'Error al obtener paciente' });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const { name, email, phone, birthDate, gender, address, medicalNotes } = req.body;

    const [result] = await pool.query(
      'INSERT INTO patients (name, email, phone, birthDate, gender, address, medicalNotes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), email || null, phone || null, birthDate || null, gender || null, address || null, medicalNotes || null]
    );

    const [[created]] = await pool.query('SELECT * FROM patients WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ success: false, error: 'Error al crear el paciente' });
  }
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const [[patient]] = await pool.query('SELECT id FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, error: 'Paciente no encontrado' });

    const ALLOWED = ['name', 'email', 'phone', 'birthDate', 'gender', 'address', 'medicalNotes', 'status'];
    const fields = Object.keys(req.body).filter(k => ALLOWED.includes(k) && req.body[k] !== undefined);
    if (fields.length === 0) {
      return res.status(422).json({ success: false, error: 'No hay campos válidos para actualizar' });
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => req.body[f] || null);
    await pool.query(`UPDATE patients SET ${setClause} WHERE id = ?`, [...values, req.params.id]);

    const [[updated]] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar el paciente' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [[patient]] = await pool.query('SELECT id, name FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, error: 'Paciente no encontrado' });

    const [[{ appointmentsCount }]] = await pool.query(
      'SELECT COUNT(*) as appointmentsCount FROM appointments WHERE patientId = ?',
      [req.params.id]
    );

    await pool.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Paciente eliminado correctamente', appointmentsDeleted: appointmentsCount });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar el paciente' });
  }
};
