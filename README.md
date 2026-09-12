# MediCare – Hospital Management System

A full-stack **Hospital Management System (HMS)** developed for internship and academic requirements.

MediCare is designed to digitize and streamline hospital operations, including patient management, doctor management, appointment scheduling, electronic medical records, laboratory management, pharmacy management, billing and payments, inpatient management, staff management, reporting, auditing, and database backup and recovery.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#1-backend-setup)
  - [Environment Variables](#2-environment-variables)
  - [Database Setup](#3-database-setup)
  - [Start Backend](#4-start-backend)
  - [Frontend Setup](#5-frontend-setup)
- [Default Login](#default-login)
- [API Overview](#api-overview)
- [Security](#security)
- [Backup and Recovery](#backup-and-recovery)
- [Performance and Availability](#performance-and-availability)
- [Documentation](#documentation)
- [Development Notes](#development-notes)
- [Future Enhancements](#future-enhancements)
- [Author](#author)

---

## Project Overview

**MediCare** is a web-based Hospital Management System developed to provide a centralized platform for managing hospital operations and patient information.

The system provides different levels of access for administrators, doctors, nurses, receptionists, laboratory technicians, pharmacists, and accountants through **Role-Based Access Control (RBAC)**.

The application consists of:

- React-based frontend
- Node.js and Express backend
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Role-based authorization
- Audit logging
- Scheduled background jobs
- Document upload management
- Reporting and analytics
- Automated database backup and recovery support

---

## Objectives

The main objectives of MediCare are to:

- Digitize hospital administrative processes.
- Centralize patient and medical information.
- Improve appointment scheduling and management.
- Maintain electronic medical records.
- Manage laboratory requests and results.
- Manage pharmacy inventory and medicine dispensing.
- Manage hospital billing and payments.
- Manage inpatient admissions, wards, and beds.
- Manage staff attendance and leave records.
- Provide role-based access to hospital employees.
- Maintain an audit trail of important system activities.
- Provide reports and analytics.
- Protect hospital data through authentication and authorization.
- Provide automated database backup and recovery mechanisms.
- Improve hospital operational efficiency and reduce manual paperwork.

---

# Features

## Authentication & Security

- Secure login and logout
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Password hashing using bcrypt
- Password change functionality
- Automatic session timeout after 30 minutes of inactivity
- Protected frontend routes
- Protected backend API endpoints
- Audit logging
- Role-based menu and route access

---

## Dashboard

The dashboard provides an overview of hospital activities and important operational information.

Features include:

- Patient statistics
- Appointment statistics
- Revenue information
- Laboratory information
- Pharmacy alerts
- Charts and analytics
- Hospital activity summaries

---

## Patient Management

- Register new patients
- Update patient information
- Search patients
- View patient details
- View medical history
- Upload patient documents
- Manage patient records

---

## Doctor Management

- Add doctors
- Update doctor information
- Assign doctors to departments
- Manage doctor schedules
- View doctor information
- Manage doctor availability

---

## Appointment Management

- Book appointments
- Reschedule appointments
- Cancel appointments
- Track appointment status
- Assign doctors
- View scheduled appointments
- Manage appointment workflows

Supported appointment statuses include:

- Scheduled
- Completed
- Cancelled
- No Show

---

## Electronic Medical Records

- Create medical records
- Record diagnoses
- Record prescriptions
- Add treatment notes
- Maintain treatment history
- View patient medical history
- Manage medical information according to user permissions

---

## Laboratory Management

- Manage laboratory tests
- Create laboratory requests
- Manage sample collection
- Track laboratory request status
- Enter laboratory results
- Generate laboratory reports
- Provide authorized access to laboratory information

---

## Pharmacy Management

- Manage medicine inventory
- Add and update medicines
- Monitor medicine stock
- Process prescriptions
- Dispense medicines
- Monitor medicine expiry dates
- Track pharmacy transactions
- Monitor low-stock medicines
- Monitor expired or soon-to-expire medicines

---

## Billing & Payments

- Generate patient bills
- Record consultation charges
- Record laboratory charges
- Record pharmacy charges
- Record admission charges
- Record payments
- Track outstanding balances
- Track bill status
- Generate billing information and receipts

---

## Inpatient Management

- Manage hospital wards
- Manage beds
- Track bed availability
- Admit patients
- Manage active admissions
- Record discharge information
- Track admission status

---

## Staff Management

- Register hospital employees
- Manage staff information
- Assign employees to departments
- Maintain employee records

---

## Human Resources

- Record staff attendance
- Track attendance status
- Manage leave records
- Track leave status
- Maintain employee-related HR information

---

## Patient Documents

- Upload patient-related documents
- Store uploaded documents
- View patient documents
- Delete documents according to permissions
- Restrict document operations using role-based authorization

---

## Reports & Analytics

MediCare provides reports for:

- Patients
- Appointments
- Revenue
- Pharmacy
- Laboratory
- Staff

Reports are restricted according to user roles.

---

## Audit Logs

The system maintains an audit trail of important activities.

Audit information includes:

- User
- Action
- Module
- Details
- IP address
- Timestamp

Audit logging helps administrators monitor system activity and maintain accountability.

---

# User Roles

MediCare supports the following user roles:

| Role | Main Responsibilities |
|---|---|
| **ADMIN** | Full system administration and management |
| **DOCTOR** | Patients, appointments, medical records and clinical functions |
| **RECEPTIONIST** | Patient registration, appointments, billing and inpatient administration |
| **NURSE** | Patient information, appointments, medical records and inpatient operations |
| **LAB_TECHNICIAN** | Laboratory tests, requests and results |
| **PHARMACIST** | Medicine inventory and dispensing |
| **ACCOUNTANT** | Billing, payments and financial reports |

Each role has restricted:

- Navigation menu access
- Frontend route access
- Backend API access
- Module permissions

---

# Technology Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Lucide Icons
- Recharts

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Neon PostgreSQL
- JWT Authentication
- bcrypt password hashing
- Multer
- node-cron

## Hosting & Development Tools

- Git
- GitHub / Bitbucket
- Neon.tech
- Vercel
- Koyeb

---

# System Architecture

MediCare follows a layered full-stack architecture:

```text
┌──────────────────────────────────┐
│          React Frontend          │
│                                  │
│ Pages / Components / Router      │
└────────────────┬─────────────────┘
                 │
                 │ HTTP / REST API
                 ▼
┌──────────────────────────────────┐
│         Express Backend          │
│                                  │
│ Routes / Controllers / Middleware│
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│          Business Logic          │
│                                  │
│ Authorization / Validation       │
│ Audit Logging / Scheduled Jobs   │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│            Prisma ORM            │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│       PostgreSQL / Neon          │
└──────────────────────────────────┘
```

---

# Project Structure

```text
Project/
│
├── hospital-backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── jobs/
│   │   └── index.js
│   │
│   ├── backups/
│   │   ├── daily/
│   │   └── weekly/
│   │
│   └── uploads/
│
├── hospital-frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
│
├── DISASTER_RECOVERY.md
├── PERFORMANCE.md
├── HIGH_AVAILABILITY.md
└── README.md
```

---

# Prerequisites

Before running MediCare, make sure the following software is installed:

- Node.js
- npm
- Git
- PostgreSQL / Neon PostgreSQL account

Recommended versions:

```text
Node.js 18+
npm 9+
```

---

# Setup Instructions

## 1. Backend Setup

Navigate to the backend directory:

```bash
cd hospital-backend
```

Install backend dependencies:

```bash
npm install
```

---

## 2. Environment Variables

Create a `.env` file inside:

```text
hospital-backend/.env
```

Add the following variables:

```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL / Neon database connection string |
| `JWT_SECRET` | Secret key used for JWT authentication |
| `PORT` | Backend server port |

> Never commit your `.env` file or real credentials to GitHub.

---

## 3. Database Setup

Run Prisma database synchronization:

```bash
npx prisma db push
```

Generate the Prisma Client:

```bash
npx prisma generate
```

---

## 4. Start Backend

Start the backend development server:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

---

## 5. Frontend Setup

Open a new terminal.

Navigate to the frontend:

```bash
cd hospital-frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend will normally run at:

```text
http://localhost:5173
```

---

# Default Login

Use an administrator account created for the system.

Example:

```text
Email: admin@hospital.com
Password: Your configured password
```

> The example credentials above are placeholders. Use the actual administrator credentials configured for your environment.

---

# API Overview

Base API URL:

```text
http://localhost:5000/api
```

Main API modules:

```text
/api/auth
/api/patients
/api/doctors
/api/appointments
/api/medical-records
/api/bills
/api/lab
/api/pharmacy
/api/inpatient
/api/staff
/api/hr
/api/reports
/api/documents
/api/schedules
/api/audit
/api/backups
/api/dashboard
```

Protected endpoints require a valid JWT token and appropriate role permissions.

---

# Security

MediCare implements multiple security mechanisms.

## Authentication

- JWT-based authentication
- Protected API endpoints
- Token validation
- Secure login and logout

## Password Security

- Passwords are hashed using bcrypt.
- Passwords are never stored as plain text.
- Users can change their passwords.

## Authorization

Role-based authorization is enforced on protected backend routes.

Supported roles:

```text
ADMIN
DOCTOR
RECEPTIONIST
NURSE
LAB_TECHNICIAN
PHARMACIST
ACCOUNTANT
```

## Session Security

Users are automatically logged out after:

```text
30 minutes of inactivity
```

## Audit Logging

Important user activities are recorded in the Audit Logs module.

---

# Backup & Recovery

MediCare provides automated database backup functionality using scheduled background jobs.

## Daily Backup

A database backup is automatically created every day at:

```text
02:00
```

Daily backups are stored in:

```text
hospital-backend/backups/daily/
```

## Weekly Backup

A full weekly backup is automatically created every Sunday at:

```text
03:00
```

Weekly backups are stored in:

```text
hospital-backend/backups/weekly/
```

## Manual Backup

Administrators can also initiate database backups through the administrative backup functionality.

## Scheduled Jobs

Scheduled backup operations are handled using:

```text
node-cron
```

Detailed backup and recovery procedures are documented in:

```text
DISASTER_RECOVERY.md
```

---

# Performance & Availability

MediCare includes supporting documentation covering:

- Performance considerations
- Database optimization
- Concurrent-user considerations
- System availability
- Deployment considerations
- Backup and recovery
- Disaster recovery
- Scalability

Detailed information is available in:

- `PERFORMANCE.md`
- `HIGH_AVAILABILITY.md`
- `DISASTER_RECOVERY.md`

---

# Documentation

Additional project documentation is provided for technical, academic, and operational purposes.

### Disaster Recovery

See:

```text
DISASTER_RECOVERY.md
```

This document describes backup procedures, recovery procedures, and disaster recovery planning.

### Performance

See:

```text
PERFORMANCE.md
```

This document describes performance considerations, optimization, and system performance planning.

### High Availability

See:

```text
HIGH_AVAILABILITY.md
```

This document describes availability, deployment, scalability, and high-availability considerations.

---

# Development Notes

## Frontend

The frontend is developed using:

```text
React + Vite
```

React Router is used for navigation and protected routes.

Axios is used for communication with the backend REST API.

Recharts is used for dashboard charts and analytics.

Lucide Icons are used for interface icons.

## Backend

The backend is developed using:

```text
Node.js + Express.js
```

Prisma ORM is used for database access.

PostgreSQL is used as the primary database and is hosted using Neon.

JWT is used for authentication.

bcrypt is used for password hashing.

Multer is used for patient document uploads.

node-cron is used for scheduled background tasks.

## File Uploads

Patient documents are stored in:

```text
hospital-backend/uploads/
```

## Backups

Backup files are stored in:

```text
hospital-backend/backups/
```

---

# Future Enhancements

Possible future improvements include:

- Mobile application
- Patient portal
- SMS and email notifications
- Online appointment booking
- Telemedicine
- Insurance integration
- AI-assisted clinical decision support
- Biometric authentication
- Cloud-based deployment
- Advanced analytics
- Multi-hospital support

---

# Academic Project Scope

MediCare was developed as an internship/academic Hospital Management System project to demonstrate practical implementation of:

- Full-stack web development
- REST API development
- Database design
- Prisma ORM
- Authentication and authorization
- Role-Based Access Control
- Healthcare information management
- File upload management
- Reporting and analytics
- Audit logging
- Scheduled background jobs
- Database backup and recovery
- Security implementation
- Performance considerations
- System availability planning

---

# Author

**MediCare – Hospital Management System**

Developed as an **Internship / Academic Project**.

---

# License

This project was developed for educational and academic purposes.