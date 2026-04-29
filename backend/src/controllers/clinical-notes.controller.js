const pool = require('../db/connection');
const { validationResult } = require('express-validator');

const NOTE_SELECT = `
  SELECT cn.*, u.name AS professionalName
  FROM clinical_notes cn
  JOIN users u ON cn.professionalId = u.id`;

exports.getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const professionalId = req.user.id;

    const [rows] = await pool.query(
      `${NOTE_SELECT}
       WHERE cn.patientId = ? AND cn.professionalId = ?
       ORDER BY cn.createdAt DESC`,
      [patientId, professionalId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getByPatient:', error);
    res.status(500).json({ success: false, error: 'Error al obtener notas clínicas' });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const { patientId, content, type = 'observation' } = req.body;
    const professionalId = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO clinical_notes (patientId, professionalId, content, type) VALUES (?, ?, ?, ?)',
      [patientId, professionalId, content, type]
    );

    const [[note]] = await pool.query(`${NOTE_SELECT} WHERE cn.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({ success: false, error: 'Error al crear la nota' });
  }
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const professionalId = req.user.id;

    const [[existing]] = await pool.query(
      'SELECT id FROM clinical_notes WHERE id = ? AND professionalId = ?',
      [id, professionalId]
    );
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Nota no encontrada o sin permiso' });
    }

    const { content, type } = req.body;
    await pool.query(
      'UPDATE clinical_notes SET content = ?, type = ? WHERE id = ?',
      [content, type, id]
    );

    const [[updated]] = await pool.query(`${NOTE_SELECT} WHERE cn.id = ?`, [id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error en update:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar la nota' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalId = req.user.id;

    const [[existing]] = await pool.query(
      'SELECT id FROM clinical_notes WHERE id = ? AND professionalId = ?',
      [id, professionalId]
    );
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Nota no encontrada o sin permiso' });
    }

    await pool.query('DELETE FROM clinical_notes WHERE id = ?', [id]);
    res.json({ success: true, message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error('Error en remove:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar la nota' });
  }
};
