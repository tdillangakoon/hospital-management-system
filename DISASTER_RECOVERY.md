# Disaster Recovery Plan - MediCare HMS

## Backup Policy
- Daily automatic backup at 02:00
- Weekly full backup every Sunday at 03:00
- Manual admin-triggered backups available
- Backup files stored in backend/backups/daily and backend/backups/weekly

## Recovery Steps
1. Identify failure type
2. Stop affected services
3. Select latest valid backup
4. Restore in a recovery environment first
5. Verify patients, appointments, billing, and staff data
6. Switch production to restored system
7. Restart backend and frontend
8. Validate login and critical modules
9. Document the incident and actions taken

## Audit Trail
- Login, password changes, and key operations are recorded in Audit Logs
- Each entry stores user, action, module, details, and timestamp