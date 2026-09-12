const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadDocument,
  getDocumentsByPatient,
  getAllDocuments,
  deleteDocument,
} = require('../controllers/documentController');
const { auth, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.use(auth);

router.post(
  '/',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'),
  upload.single('file'),
  uploadDocument
);

router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'),
  getAllDocuments
);

router.get(
  '/patient/:patientId',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'),
  getDocumentsByPatient
);

router.delete(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  deleteDocument
);

module.exports = router;