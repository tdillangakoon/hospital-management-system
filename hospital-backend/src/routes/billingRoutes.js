const express = require('express');
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBillsByPatient,
  getBillById,
  recordPayment,
  deleteBill,
} = require('../controllers/billingController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', createBill);
router.get('/', getAllBills);
router.get('/patient/:patientId', getBillsByPatient);
router.get('/:id', getBillById);
router.post('/:billId/payments', recordPayment);
router.delete('/:id', deleteBill);

module.exports = router;