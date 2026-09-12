const express = require('express');
const router = express.Router();
const {
  runBackup,
  getBackups,
  downloadBackup,
  getRecoveryPlan,
} = require('../controllers/backupController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('ADMIN'));

router.post('/run', runBackup);
router.get('/', getBackups);
router.get('/recovery-plan', getRecoveryPlan);
router.get('/download/:type/:fileName', downloadBackup);

module.exports = router;