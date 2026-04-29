const router = require('express').Router();
const controller = require('../controllers/patients.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { logAccess } = require('../middleware/access-log.middleware');
const { createPatientValidators, updatePatientValidators } = require('../validators/patients.validators');

router.use(authMiddleware);

router.get('/',
  logAccess('patients', 'view_list'),
  controller.getAll
);

router.get('/:id',
  logAccess('patients', 'view_detail'),
  controller.getById
);

// Solo admin y receptionist pueden crear, editar y eliminar
router.post('/',
  requireRole('admin', 'receptionist'),
  createPatientValidators,
  controller.create
);

router.put('/:id',
  requireRole('admin', 'receptionist'),
  updatePatientValidators,
  controller.update
);

router.delete('/:id',
  requireRole('admin', 'receptionist'),
  controller.remove
);

module.exports = router;
