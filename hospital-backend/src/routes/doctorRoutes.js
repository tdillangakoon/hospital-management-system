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

router.use(auth);

router.post('/', authorize('ADMIN'), createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', authorize('ADMIN'), updateDoctor);
router.delete('/:id', authorize('ADMIN'), deleteDoctor);

module.exports = router;