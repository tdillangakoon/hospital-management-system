# Performance & Concurrent Users

## Architecture support
- Stateless JWT authentication
- Role-based API access
- PostgreSQL relational database
- Separated frontend and backend

## Concurrent user support
The system is designed for multiple simultaneous users (Admin, Doctor, Nurse, Receptionist, etc.).

Recommended test cases for evaluation:
- 10 concurrent users
- 20 concurrent users
- 50 concurrent users

Measure:
- Login response time
- Dashboard load time
- Patient list response time
- Appointment create response time