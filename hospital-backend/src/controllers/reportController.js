const prisma = require('../utils/prisma');

const getPatientReport = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        appointments: true,
        medicalRecords: true,
        bills: true,
        labRequests: true,
        admissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      total: patients.length,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAppointmentReport = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { select: { name: true, phone: true } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
    });

    const summary = {
      total: appointments.length,
      scheduled: appointments.filter((a) => a.status === 'SCHEDULED').length,
      completed: appointments.filter((a) => a.status === 'COMPLETED').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
      noShow: appointments.filter((a) => a.status === 'NO_SHOW').length,
    };

    res.json({ summary, data: appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        patient: { select: { name: true, phone: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalBilled = bills.reduce((sum, b) => sum + b.amount, 0);
    const totalPaid = bills.reduce(
      (sum, b) => sum + b.payments.reduce((pSum, p) => pSum + p.amount, 0),
      0
    );

    res.json({
      summary: {
        totalBills: bills.length,
        totalBilled,
        totalPaid,
        outstanding: totalBilled - totalPaid,
        paidBills: bills.filter((b) => b.status === 'PAID').length,
        unpaidBills: bills.filter((b) => b.status === 'UNPAID').length,
        partialBills: bills.filter((b) => b.status === 'PARTIAL').length,
      },
      data: bills,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPharmacyReport = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({ orderBy: { name: 'asc' } });
    const dispenses = await prisma.dispense.findMany({
      include: {
        medicine: true,
        patient: { select: { name: true } },
      },
      orderBy: { dispensedAt: 'desc' },
    });

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    res.json({
      summary: {
        totalMedicines: medicines.length,
        lowStock: medicines.filter((m) => m.stockQuantity < 20).length,
        expired: medicines.filter((m) => m.expiryDate && new Date(m.expiryDate) < now).length,
        expiringSoon: medicines.filter(
          (m) => m.expiryDate && new Date(m.expiryDate) >= now && new Date(m.expiryDate) <= in30Days
        ).length,
        totalDispenses: dispenses.length,
        totalDispenseValue: dispenses.reduce((sum, d) => sum + d.totalPrice, 0),
      },
      medicines,
      dispenses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLaboratoryReport = async (req, res) => {
  try {
    const requests = await prisma.labRequest.findMany({
      include: {
        patient: { select: { name: true } },
        doctor: { include: { user: { select: { name: true } } } },
        test: true,
        result: true,
      },
      orderBy: { requestDate: 'desc' },
    });

    res.json({
      summary: {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'PENDING').length,
        completed: requests.filter((r) => r.status === 'COMPLETED').length,
        inProgress: requests.filter((r) => r.status === 'IN_PROGRESS').length,
      },
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStaffReport = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
        attendances: true,
        leaves: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      summary: {
        totalStaff: staff.length,
        active: staff.filter((s) => s.isActive).length,
        inactive: staff.filter((s) => !s.isActive).length,
      },
      data: staff,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPatientReport,
  getAppointmentReport,
  getRevenueReport,
  getPharmacyReport,
  getLaboratoryReport,
  getStaffReport,
};