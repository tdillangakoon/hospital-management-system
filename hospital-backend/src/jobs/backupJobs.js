const cron = require('node-cron');
const { createBackup } = require('../utils/backup');

function startBackupJobs() {
  // Daily backup at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const backup = await createBackup('daily');
      console.log('Daily backup created:', backup.fileName);
    } catch (error) {
      console.error('Daily backup failed:', error.message);
    }
  });

  // Weekly full backup every Sunday at 3:00 AM
  cron.schedule('0 3 * * 0', async () => {
    try {
      const backup = await createBackup('weekly');
      console.log('Weekly backup created:', backup.fileName);
    } catch (error) {
      console.error('Weekly backup failed:', error.message);
    }
  });

  console.log('Backup jobs scheduled: daily 02:00, weekly Sunday 03:00');
}

module.exports = { startBackupJobs };