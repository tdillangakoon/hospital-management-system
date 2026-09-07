const prisma = require('../utils/prisma');

const createMedicine = async (req, res) => {
  try {
    const { name, genericName, category, unit, price, stockQuantity, expiryDate, manufacturer } = req.body;

    const medicine = await prisma.medicine.create({
      data: {
        name,
        genericName,
        category,
        unit,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity) || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        manufacturer,
      },
    });

    res.status(201).json({ message: 'Medicine added successfully', medicine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await prisma.medicine.findUnique({ where: { id } });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, genericName, category, unit, price, stockQuantity, expiryDate, manufacturer } = req.body;

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        name,
        genericName,
        category,
        unit,
        price: price ? parseFloat(price) : undefined,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        manufacturer,
      },
    });

    res.json({ message: 'Medicine updated successfully', medicine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.medicine.delete({ where: { id } });
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const dispenseMedicine = async (req, res) => {
  try {
    const { medicineId, patientId, quantity, prescribedBy, notes } = req.body;

    if (!medicineId || !patientId || !quantity) {
      return res.status(400).json({ message: 'medicineId, patientId and quantity are required' });
    }

    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const totalPrice = medicine.price * quantity;

    const [dispense] = await prisma.$transaction([
      prisma.dispense.create({
        data: {
          medicineId,
          patientId,
          quantity: parseInt(quantity),
          totalPrice,
          prescribedBy,
          notes,
        },
        include: {
          medicine: true,
          patient: { select: { id: true, name: true, phone: true } },
        },
      }),
      prisma.medicine.update({
        where: { id: medicineId },
        data: {
          stockQuantity: medicine.stockQuantity - parseInt(quantity),
        },
      }),
    ]);

    res.status(201).json({
      message: 'Medicine dispensed successfully',
      dispense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllDispenses = async (req, res) => {
  try {
    const dispenses = await prisma.dispense.findMany({
      include: {
        medicine: { select: { id: true, name: true, unit: true } },
        patient: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { dispensedAt: 'desc' },
    });

    res.json(dispenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDispensesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const dispenses = await prisma.dispense.findMany({
      where: { patientId },
      include: {
        medicine: true,
      },
      orderBy: { dispensedAt: 'desc' },
    });

    res.json(dispenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  dispenseMedicine,
  getAllDispenses,
  getDispensesByPatient,
};