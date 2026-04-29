const { body } = require('express-validator');

const NOTE_TYPES = ['observation', 'follow_up', 'diagnosis', 'internal'];

exports.createNoteValidators = [
  body('patientId').isInt({ min: 1 }).withMessage('ID de paciente inválido'),
  body('content').trim().notEmpty().withMessage('El contenido es obligatorio')
    .isLength({ max: 5000 }).withMessage('Máximo 5000 caracteres'),
  body('type').optional().isIn(NOTE_TYPES).withMessage('Tipo de nota inválido'),
];

exports.updateNoteValidators = [
  body('content').trim().notEmpty().withMessage('El contenido es obligatorio')
    .isLength({ max: 5000 }).withMessage('Máximo 5000 caracteres'),
  body('type').isIn(NOTE_TYPES).withMessage('Tipo de nota inválido'),
];
