const prisma = require('./prisma');

const logAction = async ({ userId, action, module, details, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        module,
        details: details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};

module.exports = { logAction };