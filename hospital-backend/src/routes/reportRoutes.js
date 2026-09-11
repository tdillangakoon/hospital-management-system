const express = require('express');
const router = express.Router();
const {
  getPatientReport,
  getAppointmentReport,
  getRevenueReport,
  getPharmacyReport,
  getLaboratoryReport,
  getStaffReport,
} = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/patients', authorize('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), getPatientReport);
router.get('/appointments', authorize('ADMIN', 'RECEPTIONIST', 'DOCTOR'), getAppointmentReport);
router.get('/revenue', authorize('ADMIN', 'ACCOUNTANT'), getRevenueReport);
router.get('/pharmacy', authorize('ADMIN', 'PHARMACIST'), getPharmacyReport);
router.get('/laboratory', authorize('ADMIN', 'LAB_TECHNICIAN', 'DOCTOR'), getLaboratoryReport);
router.get('/staff', authorize('ADMIN'), getStaffReport);

module.exports = router;