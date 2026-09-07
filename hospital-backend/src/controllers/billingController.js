const prisma = require('../utils/prisma');

// Create Bill
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

    res.status(201).json({
      message: 'Bill created successfully',
      bill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Bills
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

// Get Bills by Patient
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

// Get Single Bill
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

// Record Payment
const recordPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { amount, method } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'amount is required' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        billId,
        amount: parseFloat(amount),
        method: method || 'Cash',
      },
    });

    // Get the bill with all payments
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { payments: true },
    });

    // Calculate total paid
    const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);

    // Update bill status
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

// Delete Bill
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete related payments
    await prisma.payment.deleteMany({
      where: { billId: id },
    });

    await prisma.bill.delete({
      where: { id },
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
  recordPayment,
  deleteBill,
};