const prisma = require('../utils/prisma');

// Main Dashboard Summary
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalPatients,
      totalDoctors,
      totalStaff,
      todayAppointments,
      pendingLabRequests,
      unpaidBills,
      availableBeds,
      totalBeds,
      totalRevenue,
      recentAppointments,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.staff.count(),
      prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.labRequest.count({
        where: {
          status: {
            in: ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS'],
          },
        },
      }),
      prisma.bill.count({
        where: {
          status: {
            in: ['UNPAID', 'PARTIAL'],
          },
        },
      }),
      prisma.bed.count({
        where: { status: 'AVAILABLE' },
      }),
      prisma.bed.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { name: true } },
          doctor: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    res.json({
      summary: {
        totalPatients,
        totalDoctors,
        totalStaff,
        todayAppointments,
        pendingLabRequests,
        unpaidBills,
        availableBeds,
        totalBeds,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      recentAppointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Appointments Report
const getAppointmentsReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Revenue Report
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.paidAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        bill: {
          include: {
            patient: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalRevenue,
      totalPayments: payments.length,
      payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Patients Report
const getPatientsReport = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        _count: {
          select: {
            appointments: true,
            bills: true,
            medicalRecords: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      total: patients.length,
      patients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Lab Report
const getLabReport = async (req, res) => {
  try {
    const requests = await prisma.labRequest.findMany({
      include: {
        patient: { select: { name: true } },
        test: true,
        result: true,
      },
      orderBy: { requestDate: 'desc' },
    });

    const summary = {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      completed: requests.filter((r) => r.status === 'COMPLETED').length,
      inProgress: requests.filter((r) =>
        ['SAMPLE_COLLECTED', 'IN_PROGRESS'].includes(r.status)
      ).length,
    };

    res.json({
      summary,
      requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAppointmentsReport,
  getRevenueReport,
  getPatientsReport,
  getLabReport,
};