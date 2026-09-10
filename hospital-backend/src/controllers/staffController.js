const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

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

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (employeeId) {
      const existingEmp = await prisma.staff.findUnique({
        where: { employeeId },
      });
      if (existingEmp) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'NURSE',
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          employeeId: employeeId || null,
          phone: phone || null,
          department: department || null,
          designation: designation || null,
          joiningDate: joiningDate ? new Date(joiningDate) : null,
          address: address || null,
          isActive: true,
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

      return staff;
    });

    res.status(201).json({
      message: 'Staff created successfully',
      staff: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
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

    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
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
      isActive,
    } = req.body;

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (email && email !== existingStaff.user.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    if (employeeId && employeeId !== existingStaff.employeeId) {
      const empTaken = await prisma.staff.findUnique({
        where: { employeeId },
      });
      if (empTaken) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    const userData = {};
    if (name !== undefined) userData.name = name;
    if (email !== undefined) userData.email = email;
    if (role !== undefined) userData.role = role;
    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    const staffData = {
      phone: phone !== undefined ? phone : existingStaff.phone,
      department: department !== undefined ? department : existingStaff.department,
      designation: designation !== undefined ? designation : existingStaff.designation,
      address: address !== undefined ? address : existingStaff.address,
      employeeId: employeeId !== undefined ? employeeId : existingStaff.employeeId,
      joiningDate: joiningDate ? new Date(joiningDate) : existingStaff.joiningDate,
    };

    if (isActive !== undefined) {
      staffData.isActive = isActive;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: existingStaff.userId },
          data: userData,
        });
      }

      const staff = await tx.staff.update({
        where: { id },
        data: staffData,
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

      return staff;
    });

    res.json({
      message: 'Staff updated successfully',
      staff: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await prisma.$transaction([
      prisma.staff.delete({ where: { id } }),
      prisma.user.delete({ where: { id: staff.userId } }),
    ]);

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
};