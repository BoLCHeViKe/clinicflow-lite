const pool = require('../db/connection');
const { validationResult } = require('express-validator');

const LIST_FIELDS = 'p.id, p.name, p.dni, p.email, p.phone, p.birthDate, p.gender, p.status, p.createdAt';

exports.getAll = async (req, res) => {
  try {
    const { search, status } = req.query;

    const conditions = [];
    const params = [];

    // Por defecto excluir dados de alta; 'all' = sin filtro; cualquier otro = filtrar por ese status
    if (status === 'all') {
      // sin filtro de estado
    } else if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    } else {
      conditions.push("p.status != 'discharged'");
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.dni LIKE ? OR p.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let patients;
    if (req.user.role === 'professional') {
      const professionalCondition = 'EXISTS (SELECT 1 FROM appointments a WHERE a.patientId = p.id AND a.professionalId = ?)';
      const fullWhere = conditions.length
        ? `WHERE ${conditions.join(' AND ')} AND ${professionalCondition}`
        : `WHERE ${professionalCondition}`;

      [patients] = await pool.query(
        `SELECT ${LIST_FIELDS},
                (SELECT MAX(a2.appointmentDate) FROM appointments a2
                 WHERE a2.patientId = p.id AND a2.status = 'completed') AS lastVisit
         FROM patients p
         ${fullWhere}
         ORDER BY p.name ASC`,
        [...params, req.user.id]
      );
    } else {
      [patients] = await pool.query(
        `SELECT ${LIST_FIELDS},
                (SELECT MAX(a2.appointmentDate) FROM appointments a2
                 WHERE a2.patientId = p.id AND a2.status = 'completed') AS lastVisit
         FROM patients p
         ${where}
         ORDER BY p.name ASC`,
        params
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
    const [[patient]] = await pool.query(
      `SELECT p.*,
              (SELECT MAX(a2.appointmentDate) FROM appointments a2
               WHERE a2.patientId = p.id AND a2.status = 'completed') AS lastVisit
       FROM patients p WHERE p.id = ?`,
      [req.params.id]
    );
    if (!patient) return res.status(404).json({ success: false, error: 'Paciente no encontrado' });

    if (req.user.role === 'professional') {
      const [[access]] = await pool.query(
        'SELECT 1 FROM appointments WHERE patientId = ? AND professionalId = ? LIMIT 1',
        [req.params.id, req.user.id]
      );
      if (!access) {
        return res.status(403).json({ success: false, error: 'No tienes acceso a este paciente' });
      }
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ success: false, error: 'Error al obtener paciente' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const [[patient]] = await pool.query('SELECT id, name FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, error: 'Paciente no encontrado' });

    if (req.user.role === 'professional') {
      const [[access]] = await pool.query(
        'SELECT 1 FROM appointments WHERE patientId = ? AND professionalId = ? LIMIT 1',
        [req.params.id, req.user.id]
      );
      if (!access) {
        return res.status(403).json({ success: false, error: 'No tienes acceso a este paciente' });
      }
    }

    const [history] = await pool.query(
      `SELECT a.id, a.appointmentDate, a.duration, a.type, a.status, a.notes,
              u.name AS professionalName
       FROM appointments a
       JOIN users u ON a.professionalId = u.id
       WHERE a.patientId = ?
       ORDER BY a.appointmentDate DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ success: false, error: 'Error al obtener historial' });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const { name, dni, email, phone, birthDate, gender, address, medicalNotes } = req.body;

    const [result] = await pool.query(
      'INSERT INTO patients (name, dni, email, phone, birthDate, gender, address, medicalNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), dni || null, email || null, phone || null, birthDate || null, gender || null, address || null, medicalNotes || null]
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

    const ALLOWED = ['name', 'dni', 'email', 'phone', 'birthDate', 'gender', 'address', 'medicalNotes', 'status'];
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
