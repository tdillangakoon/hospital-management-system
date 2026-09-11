import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays, ClipboardList,
  CreditCard, FlaskConical, Pill, BedDouble, UserCog, LogOut, FileText
} from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleAccess = {
    ADMIN: ['/dashboard', '/patients', '/doctors', '/appointments', '/medical-records', '/bills', '/lab', '/pharmacy', '/inpatient', '/staff', '/reports', '/hr'],
    DOCTOR: ['/dashboard', '/patients', '/appointments', '/medical-records', '/lab', '/inpatient'],
    RECEPTIONIST: ['/dashboard', '/patients', '/appointments', '/bills', '/inpatient'],
    NURSE: ['/dashboard', '/patients', '/appointments', '/medical-records', '/inpatient'],
    LAB_TECHNICIAN: ['/dashboard', '/lab'],
    PHARMACIST: ['/dashboard', '/pharmacy'],
    ACCOUNTANT: ['/dashboard', '/bills', '/reports'],
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/appointments', label: 'Appointments', icon: CalendarDays },
    { path: '/medical-records', label: 'Medical Records', icon: ClipboardList },
    { path: '/bills', label: 'Billing', icon: CreditCard },
    { path: '/lab', label: 'Laboratory', icon: FlaskConical },
    { path: '/pharmacy', label: 'Pharmacy', icon: Pill },
    { path: '/inpatient', label: 'Inpatient', icon: BedDouble },
    { path: '/staff', label: 'Staff', icon: UserCog },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/hr', label: 'HR', icon: UserCog },
  ];

  const allowedPaths = roleAccess[user?.role] || ['/dashboard'];
  const visibleMenu = menuItems.filter((item) => allowedPaths.includes(item.path));

  return (
    <div style={styles.container}>
      <aside className="no-print" style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandDot}></div>
          <div>
            <div style={styles.brandTitle}>MediCare</div>
            <div style={styles.brandSub}>Hospital System</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {visibleMenu.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  background: active ? '#fff7ed' : 'transparent',
                  color: active ? '#c2410c' : '#475569',
                  borderColor: active ? '#fed7aa' : 'transparent',
                  fontWeight: active ? 700 : 500,
                }}
              >
                <Icon size={18} style={{ marginRight: 10 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{(user?.name || 'U').charAt(0)}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={15} style={{ marginRight: 8 }} />
          Logout
        </button>
      </aside>

      <main className="print-area" style={styles.main}>
        <div style={styles.mainInner}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff7ed 0%, #ecfdf5 45%, #f8fafc 100%)',
  },
  sidebar: {
    width: 250,
    background: '#ffffff',
    borderRight: '1px solid #e7e5e4',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 8px 16px',
    borderBottom: '1px solid #f5f5f4',
    marginBottom: 12,
  },
  brandDot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#f59e0b',
    boxShadow: '0 0 0 6px rgba(245,158,11,0.15)',
  },
  brandTitle: { fontWeight: 700, color: '#0f766e' },
  brandSub: { fontSize: 12, color: '#94a3b8' },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    overflowY: 'auto',
    minHeight: 0,
    paddingRight: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '11px 12px',
    borderRadius: 10,
    border: '1px solid transparent',
    fontSize: 14,
  },
  userBox: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    background: '#fff7ed',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
  },
  userName: { fontSize: 13, fontWeight: 600, color: '#0f172a' },
  userRole: { fontSize: 11, color: '#94a3b8' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  main: { flex: 1, padding: 22, overflowY: 'auto' },
  mainInner: { maxWidth: 1400, margin: '0 auto' },
};

export default Layout;