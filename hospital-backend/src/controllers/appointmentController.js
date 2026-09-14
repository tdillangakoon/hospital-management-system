const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason, notes } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: 'patientId, doctorId, date and time are required' });
    }

    // Prevent double-booking same doctor on same date + time
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        time,
        status: { in: ['SCHEDULED'] },
        date: { gte: dayStart, lte: dayEnd },
      },
    });

    if (conflict) {
      return res.status(400).json({
        message: 'Doctor already has an appointment at this date and time',
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: new Date(date),
        time,
        reason,
        notes,
        status: 'SCHEDULED',
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        doctor: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    await logAction({
      userId: req.user?.id,
      action: 'CREATE',
      module: 'APPOINTMENT',
      details: `Created appointment for patient ${patientId}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        doctor: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        medicalRecord: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, status, reason, notes, doctorId } = req.body;

    // Optional: also block conflicts when rescheduling
    if (date && time) {
      const existing = await prisma.appointment.findUnique({ where: { id } });
      const checkDoctorId = doctorId || existing?.doctorId;

      if (checkDoctorId) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const conflict = await prisma.appointment.findFirst({
          where: {
            id: { not: id },
            doctorId: checkDoctorId,
            time,
            status: { in: ['SCHEDULED'] },
            date: { gte: dayStart, lte: dayEnd },
          },
        });

        if (conflict) {
          return res.status(400).json({
            message: 'Doctor already has an appointment at this date and time',
          });
        }
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        time,
        status,
        reason,
        notes,
      },
      include: {
        patient: {
          select: { id: true, name: true },
        },
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    await logAction({
      userId: req.user?.id,
      action: 'UPDATE',
      module: 'APPOINTMENT',
      details: `Updated appointment ${id}`,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id },
    });

    await logAction({
      userId: req.user?.id,
      action: 'DELETE',
      module: 'APPOINTMENT',
      details: `Deleted appointment ${id}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};