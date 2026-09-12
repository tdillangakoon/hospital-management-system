const prisma = require('../utils/prisma');

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAuditLogs };