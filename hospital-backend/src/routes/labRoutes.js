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

router.post('/tests', authorize('ADMIN'), createLabTest);
router.get('/tests', getAllLabTests);
router.put('/tests/:id', authorize('ADMIN'), updateLabTest);
router.delete('/tests/:id', authorize('ADMIN'), deleteLabTest);

router.post('/requests', createLabRequest);
router.get('/requests', getAllLabRequests);
router.put('/requests/:id/status', updateLabRequestStatus);

router.post('/results', addLabResult);
router.get('/results/:labRequestId', getLabResult);

module.exports = router;