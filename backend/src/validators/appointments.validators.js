const { body } = require('express-validator');

exports.createAppointmentValidators = [
  body('patientId')
    .notEmpty().withMessage('El ID del paciente es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número positivo'),
  body('appointmentDate')
    .notEmpty().withMessage('La fecha de la cita es obligatoria')
    .isISO8601().withMessage('La fecha debe estar en formato ISO 8601 (YYYY-MM-DD HH:mm:ss)'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 }).withMessage('La duración debe estar entre 15 y 480 minutos'),
  body('type')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('El tipo debe tener entre 3 y 100 caracteres'),
  body('notes')
    .optional()
    .isLength({ max: 2000 }).withMessage('Las notas no pueden superar 2000 caracteres'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .withMessage('Estado inválido'),
];

exports.updateAppointmentValidators = [
  body('patientId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número positivo'),
  body('appointmentDate')
    .optional()
    .isISO8601().withMessage('La fecha debe estar en formato ISO 8601'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 }).withMessage('La duración debe estar entre 15 y 480 minutos'),
  body('type')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('El tipo debe tener entre 3 y 100 caracteres'),
  body('notes')
    .optional()
    .isLength({ max: 2000 }).withMessage('Las notas no pueden superar 2000 caracteres'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .withMessage('Estado inválido'),
];
