const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post('/', authorize('ADMIN'), createSchedule);
router.get('/', authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), getSchedules);
router.put('/:id', authorize('ADMIN'), updateSchedule);
router.delete('/:id', authorize('ADMIN'), deleteSchedule);

module.exports = router;