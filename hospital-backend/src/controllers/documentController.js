const prisma = require('../utils/prisma');
const path = require('path');
const fs = require('fs');

const uploadDocument = async (req, res) => {
  try {
    const { patientId, title } = req.body;

    if (!patientId || !title) {
      return res.status(400).json({ message: 'patientId and title are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const document = await prisma.patientDocument.create({
      data: {
        patientId,
        title,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        uploadedBy: req.user?.id || null,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDocumentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const documents = await prisma.patientDocument.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await prisma.patientDocument.findMany({
      include: {
        patient: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.patientDocument.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // remove file from disk if exists
    const filePath = path.join(__dirname, '../../', document.fileUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.patientDocument.delete({ where: { id } });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByPatient,
  getAllDocuments,
  deleteDocument,
};