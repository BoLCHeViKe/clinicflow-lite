const pool = require('../db/connection');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM appointments';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    if (search) {
      const searchCondition = ` ${status ? 'AND' : 'WHERE'} (a.type LIKE ? OR a.notes LIKE ? OR p.name LIKE ?)`;
      query = query.replace(/FROM appointments/, 'FROM appointments a LEFT JOIN patients p ON a.patientId = p.id');
      query += searchCondition;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY appointmentDate DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    let countQuery = 'SELECT COUNT(*) as total FROM appointments';
    const countParams = [];
    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }
    
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Error en getAll:', error);
    res.status(500).json({ success: false, error: 'Error al obtener citas' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cita no encontrada' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en getById:', error);
    res.status(500).json({ success: false, error: 'Error al obtener la cita' });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const { patientId, appointmentDate, duration = 30, type, notes, status = 'scheduled' } = req.body;
    const professionalId = req.user ? req.user.id : 1;

    const [result] = await pool.query(
      'INSERT INTO appointments (patientId, professionalId, appointmentDate, duration, type, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patientId, professionalId, appointmentDate, duration, type || null, notes || null, status]
    );

    const [newItem] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({ success: false, error: 'Error al crear la cita' });
  }
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const [existing] = await pool.query(
      'SELECT id FROM appointments WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Cita no encontrada' });
    }

    const fields = Object.keys(req.body).filter(k => req.body[k] !== undefined);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No hay campos para actualizar' });
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = [...fields.map(f => req.body[f]), req.params.id];

    await pool.query(
      `UPDATE appointments SET ${setClause} WHERE id = ?`,
      values
    );

    const [updated] = await pool.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error en update:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar la cita' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM appointments WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Cita no encontrada' });
    }

    await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error en remove:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar la cita' });
  }
};
