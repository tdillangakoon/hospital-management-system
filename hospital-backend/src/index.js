const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const billingRoutes = require('./routes/billingRoutes');
const labRoutes = require('./routes/labRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const inpatientRoutes = require('./routes/inpatientRoutes');
const staffRoutes = require('./routes/staffRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const hrRoutes = require('./routes/hrRoutes');
const path = require('path');
const documentRoutes = require('./routes/documentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/bills', billingRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/inpatient', inpatientRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/hr', hrRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/schedules', scheduleRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hospital Management System API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});