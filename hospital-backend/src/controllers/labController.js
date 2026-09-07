const prisma = require('../utils/prisma');

// ========== Lab Tests (Catalog) ==========

// Create Lab Test
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

// Get All Lab Tests
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

// Update Lab Test
const updateLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    const test = await prisma.labTest.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        category,
      },
    });

    res.json({ message: 'Lab test updated successfully', test });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Lab Test
const deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.labTest.delete({ where: { id } });
    res.json({ message: 'Lab test deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== Lab Requests ==========

// Create Lab Request
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

// Get All Lab Requests
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

// Update Lab Request Status
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

// ========== Lab Results ==========

// Add Lab Result
const addLabResult = async (req, res) => {
  try {
    const { labRequestId, result, remarks } = req.body;

    if (!labRequestId || !result) {
      return res.status(400).json({ message: 'labRequestId and result are required' });
    }

    // Create result
    const labResult = await prisma.labResult.create({
      data: {
        labRequestId,
        result,
        remarks,
      },
    });

    // Update request status to COMPLETED
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

// Get Lab Result by Request ID
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