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
} = require('../controllers/inpatientController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// Wards
router.post('/wards', authorize('ADMIN'), createWard);
router.get('/wards', getAllWards);

// Beds
router.post('/beds', authorize('ADMIN'), createBed);
router.get('/beds', getAllBeds);
router.get('/beds/available', getAvailableBeds);

// Admissions
router.post('/admissions', admitPatient);
router.get('/admissions', getAllAdmissions);
router.put('/admissions/:id/discharge', dischargePatient);

module.exports = router;