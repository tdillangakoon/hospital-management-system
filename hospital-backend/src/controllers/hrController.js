const prisma = require('../utils/prisma');

// ---------- ATTENDANCE ----------
const markAttendance = async (req, res) => {
  try {
    const { staffId, date, checkIn, checkOut, status, notes } = req.body;

    if (!staffId || !date) {
      return res.status(400).json({ message: 'staffId and date are required' });
    }

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        staffId_date: {
          staffId,
          date: day,
        },
      },
      update: {
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        status: status || 'PRESENT',
        notes: notes || null,
      },
      create: {
        staffId,
        date: day,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        status: status || 'PRESENT',
        notes: notes || null,
      },
      include: {
        staff: {
          include: {
            user: { select: { name: true, role: true } },
          },
        },
      },
    });

    res.status(201).json({ message: 'Attendance saved', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        staff: {
          include: {
            user: { select: { name: true, role: true, email: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { checkIn, checkOut, status, notes, date } = req.body;

    const data = {
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      status: status || 'PRESENT',
      notes: notes || null,
    };

    if (date) {
      const day = new Date(date);
      day.setHours(0, 0, 0, 0);
      data.date = day;
    }

    const attendance = await prisma.attendance.update({
      where: { id: req.params.id },
      data,
      include: {
        staff: {
          include: {
            user: { select: { name: true, role: true } },
          },
        },
      },
    });

    res.json({ message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    await prisma.attendance.delete({ where: { id: req.params.id } });
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------- LEAVE ----------
const createLeave = async (req, res) => {
  try {
    const { staffId, leaveType, startDate, endDate, reason } = req.body;

    if (!staffId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: 'staffId, leaveType, startDate and endDate are required' });
    }

    const leave = await prisma.leave.create({
      data: {
        staffId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
        status: 'PENDING',
      },
      include: {
        staff: {
          include: {
            user: { select: { name: true, role: true } },
          },
        },
      },
    });

    res.status(201).json({ message: 'Leave request created', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: {
        staff: {
          include: {
            user: { select: { name: true, role: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        staff: {
          include: {
            user: { select: { name: true, role: true } },
          },
        },
      },
    });

    res.json({ message: 'Leave status updated', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    await prisma.leave.delete({ where: { id: req.params.id } });
    res.json({ message: 'Leave deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  createLeave,
  getLeaves,
  updateLeaveStatus,
  deleteLeave,
};