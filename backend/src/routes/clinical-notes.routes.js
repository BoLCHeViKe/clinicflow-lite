const router = require('express').Router();
const controller = require('../controllers/clinical-notes.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { createNoteValidators, updateNoteValidators } = require('../validators/clinical-notes.validators');

router.use(authMiddleware);

router.get('/patient/:patientId', controller.getByPatient);
router.post('/', createNoteValidators, controller.create);
router.put('/:id', updateNoteValidators, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
