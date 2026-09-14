const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');

const createBill = async (req, res) => {
  try {
    const { patientId, amount, description } = req.body;

    if (!patientId || !amount) {
      return res.status(400).json({ message: 'patientId and amount are required' });
    }

    const bill = await prisma.bill.create({
      data: {
        patientId,
        amount: parseFloat(amount),
        description,
        status: 'UNPAID',
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    await logAction({
      userId: req.user?.id,
      action: 'CREATE',
      module: 'BILLING',
      details: `Created bill for patient ${patientId} amount ${amount}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Bill created successfully',
      bill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllBills = async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBillsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const bills = await prisma.bill.findMany({
      where: { patientId },
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        patient: true,
        payments: true,
      },
    });

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, status } = req.body;

    const bill = await prisma.bill.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description,
        status,
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        payments: true,
      },
    });

    await logAction({
      userId: req.user?.id,
      action: 'UPDATE',
      module: 'BILLING',
      details: `Updated bill ${id}`,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Bill updated successfully',
      bill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { amount, method } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'amount is required' });
    }

    const payment = await prisma.payment.create({
      data: {
        billId,
        amount: parseFloat(amount),
        method: method || 'Cash',
      },
    });

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { payments: true },
    });

    const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus = 'UNPAID';
    if (totalPaid >= bill.amount) {
      newStatus = 'PAID';
    } else if (totalPaid > 0) {
      newStatus = 'PARTIAL';
    }

    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: { status: newStatus },
      include: {
        patient: {
          select: { id: true, name: true },
        },
        payments: true,
      },
    });

    await logAction({
      userId: req.user?.id,
      action: 'PAYMENT',
      module: 'BILLING',
      details: `Recorded payment ${amount} for bill ${billId}`,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Payment recorded successfully',
      payment,
      bill: updatedBill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.payment.deleteMany({
      where: { billId: id },
    });

    await prisma.bill.delete({
      where: { id },
    });

    await logAction({
      userId: req.user?.id,
      action: 'DELETE',
      module: 'BILLING',
      details: `Deleted bill ${id}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBill,
  getAllBills,
  getBillsByPatient,
  getBillById,
  updateBill,
  recordPayment,
  deleteBill,
};