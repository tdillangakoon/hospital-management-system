const prisma = require('../utils/prisma');

// ========== Wards ==========

const createWard = async (req, res) => {
  try {
    const { name, description, totalBeds } = req.body;

    const ward = await prisma.ward.create({
      data: {
        name,
        description,
        totalBeds: parseInt(totalBeds) || 0,
      },
    });

    res.status(201).json({ message: 'Ward created successfully', ward });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllWards = async (req, res) => {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        beds: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(wards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== Beds ==========

const createBed = async (req, res) => {
  try {
    const { wardId, bedNumber } = req.body;

    const bed = await prisma.bed.create({
      data: {
        wardId,
        bedNumber,
        status: 'AVAILABLE',
      },
      include: {
        ward: true,
      },
    });

    res.status(201).json({ message: 'Bed created successfully', bed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllBeds = async (req, res) => {
  try {
    const beds = await prisma.bed.findMany({
      include: {
        ward: true,
      },
      orderBy: { bedNumber: 'asc' },
    });
    res.json(beds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAvailableBeds = async (req, res) => {
  try {
    const beds = await prisma.bed.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        ward: true,
      },
    });
    res.json(beds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== Admissions ==========

const admitPatient = async (req, res) => {
  try {
    const { patientId, bedId, admittedBy, reason, notes } = req.body;

    if (!patientId || !bedId) {
      return res.status(400).json({ message: 'patientId and bedId are required' });
    }

    // Check if bed is available
    const bed = await prisma.bed.findUnique({ where: { id: bedId } });

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Bed is not available' });
    }

    // Create admission + mark bed as OCCUPIED
    const [admission] = await prisma.$transaction([
      prisma.admission.create({
        data: {
          patientId,
          bedId,
          admittedBy,
          reason,
          notes,
          status: 'ADMITTED',
        },
        include: {
          patient: { select: { id: true, name: true, phone: true } },
          bed: {
            include: { ward: true },
          },
        },
      }),
      prisma.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' },
      }),
    ]);

    res.status(201).json({
      message: 'Patient admitted successfully',
      admission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await prisma.admission.findMany({
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        bed: {
          include: { ward: true },
        },
      },
      orderBy: { admissionDate: 'desc' },
    });

    res.json(admissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const dischargePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const admission = await prisma.admission.findUnique({
      where: { id },
    });

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    if (admission.status === 'DISCHARGED') {
      return res.status(400).json({ message: 'Patient already discharged' });
    }

    // Discharge + free the bed
    const [updatedAdmission] = await prisma.$transaction([
      prisma.admission.update({
        where: { id },
        data: {
          status: 'DISCHARGED',
          dischargeDate: new Date(),
        },
        include: {
          patient: { select: { name: true } },
          bed: true,
        },
      }),
      prisma.bed.update({
        where: { id: admission.bedId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    res.json({
      message: 'Patient discharged successfully',
      admission: updatedAdmission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createWard,
  getAllWards,
  createBed,
  getAllBeds,
  getAvailableBeds,
  admitPatient,
  getAllAdmissions,
  dischargePatient,
};