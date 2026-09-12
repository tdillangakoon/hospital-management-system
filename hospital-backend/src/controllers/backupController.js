const path = require('path');
const fs = require('fs');
const { createBackup, listBackups, dailyDir, weeklyDir } = require('../utils/backup');
const { logAction } = require('../utils/audit');

const runBackup = async (req, res) => {
  try {
    const type = req.body.type === 'weekly' ? 'weekly' : 'daily';
    const backup = await createBackup(type);

    await logAction({
      userId: req.user?.id,
      action: 'BACKUP',
      module: 'BACKUP',
      details: `Created ${type} backup: ${backup.fileName}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: `${type} backup created successfully`,
      backup,
    });
  } catch (error) {
    res.status(500).json({ message: 'Backup failed', error: error.message });
  }
};

const getBackups = async (req, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list backups', error: error.message });
  }
};

const downloadBackup = async (req, res) => {
  try {
    const { type, fileName } = req.params;
    const dir = type === 'weekly' ? weeklyDir : dailyDir;
    const filePath = path.join(dir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found' });
    }

    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
};

const getRecoveryPlan = async (req, res) => {
  res.json({
    title: 'Disaster Recovery Plan',
    steps: [
      '1. Identify failure type (database, server, application, accidental deletion)',
      '2. Stop affected services to prevent further damage',
      '3. Select latest valid daily or weekly backup',
      '4. Restore backup data into a recovery environment first',
      '5. Verify restored records (patients, bills, appointments, staff)',
      '6. Switch production to restored system after verification',
      '7. Restart backend and frontend services',
      '8. Confirm login, dashboard stats, and critical modules',
      '9. Record incident details in audit/documentation',
    ],
    backupPolicy: {
      daily: 'Automatic daily backup at 02:00',
      weekly: 'Automatic weekly full backup every Sunday at 03:00',
      retention: 'Keep daily and weekly JSON exports in /backups',
    },
  });
};

module.exports = {
  runBackup,
  getBackups,
  downloadBackup,
  getRecoveryPlan,
};