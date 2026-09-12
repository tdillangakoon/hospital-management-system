const prisma = require('../utils/prisma');

const createSchedule = async (req, res) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime, isAvailable } = req.body;

    if (!doctorId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        message: 'doctorId, dayOfWeek, startTime and endTime are required',
      });
    }

    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    res.status(201).json({ message: 'Schedule created', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.doctorSchedule.findMany({
      include: {
        doctor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;

    const schedule = await prisma.doctorSchedule.update({
      where: { id: req.params.id },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    res.json({ message: 'Schedule updated', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    await prisma.doctorSchedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
};