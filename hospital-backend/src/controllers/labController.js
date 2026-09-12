const prisma = require('../utils/prisma');

const createLabTest = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    const test = await prisma.labTest.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
      },
    });

    res.status(201).json({ message: 'Lab test created successfully', test });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllLabTests = async (req, res) => {
  try {
    const tests = await prisma.labTest.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateLabTest = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    const test = await prisma.labTest.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        category,
      },
    });

    res.json({ message: 'Lab test updated', test });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteLabTest = async (req, res) => {
  try {
    const used = await prisma.labRequest.findFirst({
      where: { testId: req.params.id },
    });

    if (used) {
      return res.status(400).json({
        message: 'Cannot delete test because it is used in lab requests',
      });
    }

    await prisma.labTest.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lab test deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createLabRequest = async (req, res) => {
  try {
    const { patientId, doctorId, testId, notes } = req.body;

    if (!patientId || !testId) {
      return res.status(400).json({ message: 'patientId and testId are required' });
    }

    const request = await prisma.labRequest.create({
      data: {
        patientId,
        doctorId: doctorId || null,
        testId,
        notes,
        status: 'PENDING',
      },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: {
          include: { user: { select: { name: true } } },
        },
        test: true,
      },
    });

    res.status(201).json({ message: 'Lab request created successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllLabRequests = async (req, res) => {
  try {
    const requests = await prisma.labRequest.findMany({
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: {
          include: { user: { select: { name: true } } },
        },
        test: true,
        result: true,
      },
      orderBy: { requestDate: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateLabRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await prisma.labRequest.update({
      where: { id },
      data: { status },
      include: {
        patient: { select: { name: true } },
        test: true,
      },
    });

    res.json({ message: 'Lab request status updated', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addLabResult = async (req, res) => {
  try {
    const { labRequestId, result, remarks } = req.body;

    if (!labRequestId || !result) {
      return res.status(400).json({ message: 'labRequestId and result are required' });
    }

    const labResult = await prisma.labResult.create({
      data: {
        labRequestId,
        result,
        remarks,
      },
    });

    await prisma.labRequest.update({
      where: { id: labRequestId },
      data: { status: 'COMPLETED' },
    });

    res.status(201).json({
      message: 'Lab result added successfully',
      labResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLabResult = async (req, res) => {
  try {
    const { labRequestId } = req.params;

    const result = await prisma.labResult.findUnique({
      where: { labRequestId },
      include: {
        labRequest: {
          include: {
            patient: { select: { name: true } },
            test: true,
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({ message: 'Lab result not found' });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createLabTest,
  getAllLabTests,
  updateLabTest,
  deleteLabTest,
  createLabRequest,
  getAllLabRequests,
  updateLabRequestStatus,
  addLabResult,
  getLabResult,
};