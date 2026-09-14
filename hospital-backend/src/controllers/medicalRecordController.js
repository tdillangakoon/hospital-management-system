const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');

const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, prescription, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: 'patientId is required' });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        diagnosis,
        prescription,
        notes,
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        appointment: {
          select: { id: true, date: true, time: true },
        },
      },
    });

    await logAction({
      userId: req.user?.id,
      action: 'CREATE',
      module: 'MEDICAL_RECORD',
      details: `Created medical record for patient ${patientId}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Medical record created successfully',
      record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        appointment: {
          select: { id: true, date: true, time: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        appointment: {
          select: { id: true, date: true, time: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        appointment: true,
      },
    });

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescription, notes } = req.body;

    const record = await prisma.medicalRecord.update({
      where: { id },
      data: {
        diagnosis,
        prescription,
        notes,
      },
    });

    await logAction({
      userId: req.user?.id,
      action: 'UPDATE',
      module: 'MEDICAL_RECORD',
      details: `Updated medical record ${id}`,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Medical record updated successfully',
      record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.medicalRecord.delete({
      where: { id },
    });

    await logAction({
      userId: req.user?.id,
      action: 'DELETE',
      module: 'MEDICAL_RECORD',
      details: `Deleted medical record ${id}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createMedicalRecord,
  getAllMedicalRecords,
  getRecordsByPatient,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};