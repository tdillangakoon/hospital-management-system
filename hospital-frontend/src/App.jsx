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

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute>
                <Patients />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <PrivateRoute>
                <Doctors />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/medical-records"
            element={
              <PrivateRoute>
                <MedicalRecords />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <PrivateRoute>
                <Bills />
              </PrivateRoute>
            }
          />
          <Route
            path="/lab"
            element={
              <PrivateRoute>
                <Laboratory />
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacy"
            element={
              <PrivateRoute>
                <Pharmacy />
              </PrivateRoute>
            }
          />
          <Route
            path="/inpatient"
            element={
              <PrivateRoute>
                <Inpatient />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute>
                <Staff />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;