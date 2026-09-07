const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// Create Doctor (also creates a User account)
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, phone, department } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    // Create User + Doctor together
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'DOCTOR',
        doctor: {
          create: {
            specialization,
            phone,
            department,
          },
        },
      },
      include: {
        doctor: true,
      },
    });

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: {
        id: user.doctor.id,
        name: user.name,
        email: user.email,
        specialization: user.doctor.specialization,
        phone: user.doctor.phone,
        department: user.doctor.department,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Doctor
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        appointments: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization, phone, department, name } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        specialization,
        phone,
        department,
        user: name
          ? {
              update: { name },
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Doctor updated successfully',
      doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the doctor to get userId
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Delete the user (this will also delete the doctor because of onDelete: Cascade)
    await prisma.user.delete({
      where: { id: doctor.userId },
    });

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};