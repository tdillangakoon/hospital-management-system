const express = require('express');
const router = express.Router();
const {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  dispenseMedicine,
  getAllDispenses,
  getDispensesByPatient,
} = require('../controllers/pharmacyController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post('/medicines', authorize('ADMIN'), createMedicine);
router.get('/medicines', getAllMedicines);
router.get('/medicines/:id', getMedicineById);
router.put('/medicines/:id', authorize('ADMIN'), updateMedicine);
router.delete('/medicines/:id', authorize('ADMIN'), deleteMedicine);

router.post('/dispense', dispenseMedicine);
router.get('/dispenses', getAllDispenses);
router.get('/dispenses/patient/:patientId', getDispensesByPatient);

module.exports = router;