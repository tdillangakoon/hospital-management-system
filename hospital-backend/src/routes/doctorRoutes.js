const express = require('express');
const router = express.Router();
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');

// All routes require login
router.use(auth);

// Only Admin can create/delete doctors (optional - you can remove authorize if you want)
router.post('/', authorize('ADMIN'), createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', authorize('ADMIN'), updateDoctor);
router.delete('/:id', authorize('ADMIN'), deleteDoctor);

module.exports = router;