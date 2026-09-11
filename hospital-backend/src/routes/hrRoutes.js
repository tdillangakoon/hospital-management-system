const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  createLeave,
  getLeaves,
  updateLeaveStatus,
  deleteLeave,
} = require('../controllers/hrController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post('/attendance', authorize('ADMIN'), markAttendance);
router.get('/attendance', authorize('ADMIN'), getAttendance);
router.delete('/attendance/:id', authorize('ADMIN'), deleteAttendance);

router.post('/leave', authorize('ADMIN'), createLeave);
router.get('/leave', authorize('ADMIN'), getLeaves);
router.put('/leave/:id/status', authorize('ADMIN'), updateLeaveStatus);
router.delete('/leave/:id', authorize('ADMIN'), deleteLeave);

router.put('/attendance/:id', authorize('ADMIN'), updateAttendance);
router.delete('/attendance/:id', authorize('ADMIN'), deleteAttendance);

module.exports = router;