import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Bills from './pages/Bills';
import Laboratory from './pages/Laboratory';
import Pharmacy from './pages/Pharmacy';
import Inpatient from './pages/Inpatient';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import HR from './pages/HR';
import Documents from './pages/Documents';
import ChangePassword from './pages/ChangePassword';
import AuditLogs from './pages/AuditLogs';
import Schedules from './pages/Schedules';

const roleAccess = {
  ADMIN: [
    '/dashboard',
    '/patients',
    '/doctors',
    '/appointments',
    '/medical-records',
    '/bills',
    '/lab',
    '/pharmacy',
    '/inpatient',
    '/staff',
    '/documents',
    '/change-password',
    '/audit',
    '/schedules',
  ],
  DOCTOR: ['/dashboard', '/patients', '/appointments', '/medical-records', '/lab', '/inpatient', '/change-password', '/schedules',],
  RECEPTIONIST: ['/dashboard', '/patients', '/appointments', '/bills', '/inpatient', '/change-password', '/schedules',],
  NURSE: ['/dashboard', '/patients', '/appointments', '/medical-records', '/inpatient', '/change-password',],
  LAB_TECHNICIAN: ['/dashboard', '/lab', '/change-password',],
  PHARMACIST: ['/dashboard', '/pharmacy', '/change-password',],
  ACCOUNTANT: ['/dashboard', '/bills', '/change-password',],
};

function PrivateRoute({ children, path }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" />;

  const allowed = roleAccess[user?.role] || [];
  if (path && !allowed.includes(path)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<PrivateRoute path="/dashboard"><Dashboard /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute path="/patients"><Patients /></PrivateRoute>} />
          <Route path="/doctors" element={<PrivateRoute path="/doctors"><Doctors /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute path="/appointments"><Appointments /></PrivateRoute>} />
          <Route path="/medical-records" element={<PrivateRoute path="/medical-records"><MedicalRecords /></PrivateRoute>} />
          <Route path="/bills" element={<PrivateRoute path="/bills"><Bills /></PrivateRoute>} />
          <Route path="/lab" element={<PrivateRoute path="/lab"><Laboratory /></PrivateRoute>} />
          <Route path="/pharmacy" element={<PrivateRoute path="/pharmacy"><Pharmacy /></PrivateRoute>} />
          <Route path="/inpatient" element={<PrivateRoute path="/inpatient"><Inpatient /></PrivateRoute>} />
          <Route path="/staff" element={<PrivateRoute path="/staff"><Staff /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute path="/reports"><Reports /></PrivateRoute>} />
          <Route path="/hr" element={<PrivateRoute path="/hr"><HR /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute path="/documents"><Documents /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute path="/change-password"><ChangePassword /></PrivateRoute>} />
          <Route path="/audit" element={<PrivateRoute path="/audit"><AuditLogs /></PrivateRoute>} />
          <Route path="/schedules" element={<PrivateRoute path="/schedules"><Schedules /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;