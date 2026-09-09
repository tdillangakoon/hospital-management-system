import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Users,
  Stethoscope,
  CalendarDays,
  FlaskConical,
  CreditCard,
  BedDouble,
  Banknote,
  UserCog,
} from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(4);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Responsive columns:
  // full screen = 4 even cards
  // medium = 2
  // narrow/split = 1
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 900) setColumns(1);
      else if (width < 1250) setColumns(2);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const cards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients ?? 0,
      icon: Users,
      color: '#0284c7',
      soft: '#e0f2fe',
    },
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors ?? 0,
      icon: Stethoscope,
      color: '#059669',
      soft: '#d1fae5',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: Banknote,
      color: '#16a34a',
      soft: '#dcfce7',
    },
    {
      title: 'Available Beds',
      value: `${stats?.availableBeds ?? 0} / ${stats?.totalBeds ?? 0}`,
      icon: BedDouble,
      color: '#0d9488',
      soft: '#ccfbf1',
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments ?? 0,
      icon: CalendarDays,
      color: '#0891b2',
      soft: '#cffafe',
    },
    {
      title: 'Pending Lab Requests',
      value: stats?.pendingLabRequests ?? 0,
      icon: FlaskConical,
      color: '#d97706',
      soft: '#fef3c7',
    },
    {
      title: 'Unpaid Bills',
      value: stats?.unpaidBills ?? 0,
      icon: CreditCard,
      color: '#dc2626',
      soft: '#fee2e2',
    },
    {
      title: 'Total Staff',
      value: stats?.totalStaff ?? 0,
      icon: UserCog,
      color: '#4f46e5',
      soft: '#e0e7ff',
    },
  ];

  return (
    <Layout>
      <div style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Hospital Overview</p>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, <strong>{user?.name}</strong> · {user?.role}
          </p>
        </div>
        <div style={styles.heroRight}>
          <div style={styles.liveBadge}>Live System</div>
          <div style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading dashboard...</div>
      ) : (
        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.iconBox, background: card.soft, color: card.color }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ ...styles.dot, background: card.color }} />
                </div>
                <div style={styles.cardLabel}>{card.title}</div>
                <div style={{ ...styles.cardValue, color: card.color }}>{card.value}</div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

const styles = {
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24,
    padding: '20px 22px',
    borderRadius: 18,
    background: 'linear-gradient(135deg, rgba(224,242,254,0.95), rgba(209,250,229,0.8))',
    border: '1px solid rgba(255,255,255,0.85)',
    boxShadow: '0 10px 30px rgba(14,165,233,0.08)',
  },
  eyebrow: {
    margin: 0,
    color: '#0284c7',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    margin: '6px 0 0',
    fontSize: 30,
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: 14,
  },
  heroRight: {
    textAlign: 'right',
  },
  liveBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.85)',
    color: '#0f766e',
    border: '1px solid #99f6e4',
    padding: '7px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
  },
  loading: {
    background: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    padding: 24,
  },
  grid: {
    display: 'grid',
    gap: 16,
  },
  card: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 10px 28px rgba(2,132,199,0.06)',
    minHeight: 130,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: 600,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 800,
  },
};

export default Dashboard;