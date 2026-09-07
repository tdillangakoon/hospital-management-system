const express = require('express');
const router = express.Router();
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} = require('../controllers/staffController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post('/', authorize('ADMIN'), createStaff);
router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.put('/:id', authorize('ADMIN'), updateStaff);
router.delete('/:id', authorize('ADMIN'), deleteStaff);

module.exports = router;