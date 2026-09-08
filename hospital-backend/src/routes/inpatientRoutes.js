const express = require('express');
const router = express.Router();
const {
  createWard,
  getAllWards,
  createBed,
  getAllBeds,
  getAvailableBeds,
  admitPatient,
  getAllAdmissions,
  dischargePatient,
  updateAdmission,
  deleteAdmission,
} = require('../controllers/inpatientController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post('/wards', authorize('ADMIN'), createWard);
router.get('/wards', getAllWards);

router.post('/beds', authorize('ADMIN'), createBed);
router.get('/beds', getAllBeds);
router.get('/beds/available', getAvailableBeds);

router.post('/admissions', admitPatient);
router.get('/admissions', getAllAdmissions);
router.put('/admissions/:id', updateAdmission);
router.put('/admissions/:id/discharge', dischargePatient);
router.delete('/admissions/:id', deleteAdmission);

module.exports = router;