const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// Create Staff (creates User + Staff profile)
const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      employeeId,
      phone,
      department,
      designation,
      joiningDate,
      address,
    } = req.body;

    // Check if email already exists
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
        role: role || 'RECEPTIONIST',
        staff: {
          create: {
            employeeId,
            phone,
            department,
            designation,
            joiningDate: joiningDate ? new Date(joiningDate) : null,
            address,
          },
        },
      },
      include: {
        staff: true,
      },
    });

    res.status(201).json({
      message: 'Staff created successfully',
      staff: {
        id: user.staff.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.staff.employeeId,
        phone: user.staff.phone,
        department: user.staff.department,
        designation: user.staff.designation,
        joiningDate: user.staff.joiningDate,
        isActive: user.staff.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Staff
const getAllStaff = async (req, res) => {
  try {
    const staffList = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(staffList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Staff
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, department, designation, joiningDate, address, isActive, name } = req.body;

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        phone,
        department,
        designation,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        address,
        isActive,
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
            role: true,
          },
        },
      },
    });

    res.json({
      message: 'Staff updated successfully',
      staff,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Deactivate / Delete Staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Delete the user (cascades to staff)
    await prisma.user.delete({
      where: { id: staff.userId },
    });

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};