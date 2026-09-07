const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, phone, department } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

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

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

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