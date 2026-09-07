const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getAllMedicalRecords,
  getRecordsByPatient,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', createMedicalRecord);
router.get('/', getAllMedicalRecords);
router.get('/patient/:patientId', getRecordsByPatient);
router.get('/:id', getMedicalRecordById);
router.put('/:id', updateMedicalRecord);
router.delete('/:id', deleteMedicalRecord);

module.exports = router;