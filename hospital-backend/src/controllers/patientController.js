const prisma = require('../utils/prisma');

// Create Patient
const createPatient = async (req, res) => {
  try {
    const { name, email, phone, gender, dateOfBirth, address, bloodGroup } = req.body;

    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        bloodGroup,
      },
    });

    res.status(201).json({
      message: 'Patient created successfully',
      patient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Patient
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: true,
        medicalRecords: true,
        bills: true,
      },
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, gender, dateOfBirth, address, bloodGroup } = req.body;

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        address,
        bloodGroup,
      },
    });

    res.json({
      message: 'Patient updated successfully',
      patient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.patient.delete({
      where: { id },
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};