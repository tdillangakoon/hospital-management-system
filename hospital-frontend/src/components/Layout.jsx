import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/patients', label: 'Patients' },
    { path: '/doctors', label: 'Doctors' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/medical-records', label: 'Medical Records' },
    { path: '/bills', label: 'Billing' },
    { path: '/lab', label: 'Laboratory' },
    { path: '/pharmacy', label: 'Pharmacy' },
    { path: '/inpatient', label: 'Inpatient' },
    { path: '/staff', label: 'Staff' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h2 style={{ margin: 0, fontSize: 18 }}>HMS</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>Hospital System</p>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                background: location.pathname === item.path ? '#4f46e5' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={styles.userSection}>
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: 240,
    background: '#1e1b4b',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
  },
  logo: {
    padding: '0 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: 6,
    fontSize: 14,
  },
  userSection: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  logoutBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  main: {
    flex: 1,
    background: '#f8fafc',
    padding: 30,
    overflowY: 'auto',
  },
};

export default Layout;