import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Pill,
  BedDouble,
  UserCog,
  LogOut,
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
    ADMIN: ['/dashboard', '/patients', '/doctors', '/appointments', '/medical-records', '/bills', '/lab', '/pharmacy', '/inpatient', '/staff'],
    DOCTOR: ['/dashboard', '/patients', '/appointments', '/medical-records', '/lab', '/inpatient'],
    RECEPTIONIST: ['/dashboard', '/patients', '/appointments', '/bills', '/inpatient'],
    NURSE: ['/dashboard', '/patients', '/appointments', '/medical-records', '/inpatient'],
    LAB_TECHNICIAN: ['/dashboard', '/lab'],
    PHARMACIST: ['/dashboard', '/pharmacy'],
    ACCOUNTANT: ['/dashboard', '/bills'],
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
  ];

  const allowedPaths = roleAccess[user?.role] || ['/dashboard'];
  const visibleMenu = menuItems.filter((item) => allowedPaths.includes(item.path));

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <div style={styles.logoBadge}>HMS</div>
          <div>
            <div style={styles.logoTitle}>MediCare</div>
            <div style={styles.logoSub}>Hospital System</div>
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
                  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                }}
              >
                <Icon size={18} strokeWidth={2} style={{ marginRight: 12, opacity: 0.95 }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={styles.userCard}>
          <div style={styles.avatar}>{(user?.name || 'U').charAt(0)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} style={{ marginRight: 8 }} />
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.mainInner}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 45%, #f0fdf4 100%)',
  },
  sidebar: {
    width: 260,
    background: 'linear-gradient(180deg, #0c4a6e 0%, #075985 55%, #0f766e 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 14px',
    boxShadow: '8px 0 30px rgba(12, 74, 110, 0.15)',
  },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '6px 10px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    marginBottom: 14,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #38bdf8, #34d399)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 14,
  },
  logoTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  logoSub: {
    fontSize: 11,
    opacity: 0.75,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '6px 0',
  },
  navItem: {
    color: 'white',
    textDecoration: 'none',
    padding: '11px 12px',
    borderRadius: 10,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    transition: '0.2s',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #38bdf8, #34d399)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: 11,
    opacity: 0.8,
  },
  logoutBtn: {
    background: 'rgba(239, 68, 68, 0.92)',
    color: 'white',
    border: 'none',
    padding: '10px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    padding: 24,
    overflowY: 'auto',
  },
  mainInner: {
    maxWidth: 1400,
    margin: '0 auto',
  },
};

export default Layout;