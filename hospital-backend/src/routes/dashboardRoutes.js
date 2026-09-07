const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAppointmentsReport,
  getRevenueReport,
  getPatientsReport,
  getLabReport,
} = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/stats', getDashboardStats);
router.get('/reports/appointments', getAppointmentsReport);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/patients', getPatientsReport);
router.get('/reports/lab', getLabReport);

module.exports = router;