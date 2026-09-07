const express = require('express');
const router = express.Router();
const {
  createLabTest,
  getAllLabTests,
  updateLabTest,
  deleteLabTest,
  createLabRequest,
  getAllLabRequests,
  updateLabRequestStatus,
  addLabResult,
  getLabResult,
} = require('../controllers/labController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// Lab Tests
router.post('/tests', authorize('ADMIN'), createLabTest);
router.get('/tests', getAllLabTests);
router.put('/tests/:id', authorize('ADMIN'), updateLabTest);
router.delete('/tests/:id', authorize('ADMIN'), deleteLabTest);

// Lab Requests
router.post('/requests', createLabRequest);
router.get('/requests', getAllLabRequests);
router.put('/requests/:id/status', updateLabRequestStatus);

// Lab Results
router.post('/results', addLabResult);
router.get('/results/:labRequestId', getLabResult);

module.exports = router;