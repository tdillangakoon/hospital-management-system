const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', authorize('ADMIN'), getAuditLogs);

module.exports = router;