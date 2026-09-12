# High Availability Notes

Current deployment is a standard single-instance academic setup:
- React frontend
- Node/Express backend
- Managed PostgreSQL (Neon)

## Current limitation
Full multi-region high availability is outside the scope of this academic implementation.

## Future improvement plan
- Deploy backend with process manager and health checks
- Use managed database automatic backups/replicas
- Add load balancer for multiple backend instances
- Keep daily/weekly application-level backups