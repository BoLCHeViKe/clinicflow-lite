const { body } = require('express-validator');

const OPTIONAL_DNI = body('dni')
  .optional({ checkFalsy: true })
  .isLength({ max: 20 }).withMessage('El DNI no puede superar 20 caracteres');

const NAME_RULE = body('name')
  .trim()
  .notEmpty().withMessage('El nombre es obligatorio')
  .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres');

const OPTIONAL_EMAIL = body('email')
  .optional({ checkFalsy: true })
  .isEmail().withMessage('El email no es válido')
  .isLength({ max: 150 }).withMessage('El email no puede superar 150 caracteres');

const OPTIONAL_PHONE = body('phone')
  .optional({ checkFalsy: true })
  .isLength({ max: 20 }).withMessage('El teléfono no puede superar 20 caracteres');

const OPTIONAL_BIRTHDATE = body('birthDate')
  .optional({ checkFalsy: true })
  .isDate().withMessage('La fecha de nacimiento no es válida');

const OPTIONAL_GENDER = body('gender')
  .optional({ checkFalsy: true })
  .isIn(['male', 'female', 'other']).withMessage('Género inválido');

const OPTIONAL_ADDRESS = body('address')
  .optional({ checkFalsy: true })
  .isLength({ max: 500 }).withMessage('La dirección no puede superar 500 caracteres');

const OPTIONAL_NOTES = body('medicalNotes')
  .optional({ checkFalsy: true })
  .isLength({ max: 5000 }).withMessage('Las notas médicas no pueden superar 5000 caracteres');

exports.createPatientValidators = [
  NAME_RULE, OPTIONAL_DNI, OPTIONAL_EMAIL, OPTIONAL_PHONE, OPTIONAL_BIRTHDATE,
  OPTIONAL_GENDER, OPTIONAL_ADDRESS, OPTIONAL_NOTES,
];

exports.updatePatientValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  OPTIONAL_DNI, OPTIONAL_EMAIL, OPTIONAL_PHONE, OPTIONAL_BIRTHDATE,
  OPTIONAL_GENDER, OPTIONAL_ADDRESS, OPTIONAL_NOTES,
  body('status').optional().isIn(['active', 'inactive', 'discharged']).withMessage('Estado inválido'),
];
