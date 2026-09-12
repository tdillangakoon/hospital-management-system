const fs = require('fs');
const path = require('path');
const prisma = require('./prisma');

const dailyDir = path.join(__dirname, '../../backups/daily');
const weeklyDir = path.join(__dirname, '../../backups/weekly');

function ensureDirs() {
  [dailyDir, weeklyDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

async function exportDatabase() {
  const data = {
    createdAt: new Date().toISOString(),
    users: await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    }),
    doctors: await prisma.doctor.findMany(),
    patients: await prisma.patient.findMany(),
    appointments: await prisma.appointment.findMany(),
    medicalRecords: await prisma.medicalRecord.findMany(),
    bills: await prisma.bill.findMany(),
    payments: await prisma.payment.findMany(),
    labTests: await prisma.labTest.findMany(),
    labRequests: await prisma.labRequest.findMany(),
    labResults: await prisma.labResult.findMany(),
    medicines: await prisma.medicine.findMany(),
    dispenses: await prisma.dispense.findMany(),
    wards: await prisma.ward.findMany(),
    beds: await prisma.bed.findMany(),
    admissions: await prisma.admission.findMany(),
    staff: await prisma.staff.findMany(),
    attendances: await prisma.attendance.findMany(),
    leaves: await prisma.leave.findMany(),
    patientDocuments: await prisma.patientDocument.findMany(),
    doctorSchedules: await prisma.doctorSchedule.findMany(),
    auditLogs: await prisma.auditLog.findMany(),
  };

  return data;
}

async function createBackup(type = 'daily') {
  ensureDirs();
  const data = await exportDatabase();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${type}-backup-${stamp}.json`;
  const targetDir = type === 'weekly' ? weeklyDir : dailyDir;
  const filePath = path.join(targetDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  return {
    type,
    fileName,
    filePath,
    size: fs.statSync(filePath).size,
    createdAt: new Date().toISOString(),
  };
}

function listBackups() {
  ensureDirs();

  const readDir = (dir, type) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((fileName) => {
        const filePath = path.join(dir, fileName);
        const stat = fs.statSync(filePath);
        return {
          type,
          fileName,
          size: stat.size,
          createdAt: stat.mtime.toISOString(),
        };
      });
  };

  return [...readDir(dailyDir, 'daily'), ...readDir(weeklyDir, 'weekly')]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  createBackup,
  listBackups,
  dailyDir,
  weeklyDir,
};