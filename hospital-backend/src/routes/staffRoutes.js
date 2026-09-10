const express = require('express');
const router = express.Router();
const {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
} = require('../controllers/staffController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post('/', authorize('ADMIN'), createStaff);
router.get('/', authorize('ADMIN'), getAllStaff);
router.put('/:id', authorize('ADMIN'), updateStaff);
router.delete('/:id', authorize('ADMIN'), deleteStaff);

module.exports = router;