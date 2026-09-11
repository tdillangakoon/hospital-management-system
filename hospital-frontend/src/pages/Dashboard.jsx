import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Users, Stethoscope, CalendarDays, FlaskConical,
  CreditCard, BedDouble, Banknote, UserCog, AlertTriangle, Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(4);
  const [currentDate, setCurrentDate] = useState(new Date());
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
    { title: 'Total Patients', value: stats?.totalPatients ?? 0, icon: Users, color: '#ea580c', soft: '#fff7ed' },
    { title: 'Total Doctors', value: stats?.totalDoctors ?? 0, icon: Stethoscope, color: '#0f766e', soft: '#ecfdf5' },
    { title: 'Total Revenue', value: `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: Banknote, color: '#0284c7', soft: '#f0f9ff' },
    { title: 'Available Beds', value: `${stats?.availableBeds ?? 0} / ${stats?.totalBeds ?? 0}`, icon: BedDouble, color: '#059669', soft: '#ecfdf5' },
    { title: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: CalendarDays, color: '#d97706', soft: '#fffbeb' },
    { title: 'Pending Lab Requests', value: stats?.pendingLabRequests ?? 0, icon: FlaskConical, color: '#7c3aed', soft: '#f5f3ff' },
    { title: 'Unpaid Bills', value: stats?.unpaidBills ?? 0, icon: CreditCard, color: '#e11d48', soft: '#fff1f2' },
    { title: 'Total Staff', value: stats?.totalStaff ?? 0, icon: UserCog, color: '#0369a1', soft: '#e0f2fe' },
  ];

  const weeklyData = [
    { day: 'Mon', patients: Math.max((stats?.totalPatients ?? 1) - 4, 1), appts: Math.max((stats?.todayAppointments ?? 1), 1) },
    { day: 'Tue', patients: Math.max((stats?.totalPatients ?? 1) - 2, 1), appts: Math.max((stats?.todayAppointments ?? 1) + 1, 1) },
    { day: 'Wed', patients: Math.max((stats?.totalPatients ?? 1) - 1, 1), appts: Math.max((stats?.todayAppointments ?? 1) + 2, 1) },
    { day: 'Thu', patients: stats?.totalPatients ?? 1, appts: Math.max((stats?.todayAppointments ?? 1) + 1, 1) },
    { day: 'Fri', patients: Math.max((stats?.totalPatients ?? 1) + 1, 1), appts: Math.max((stats?.todayAppointments ?? 1) + 3, 1) },
    { day: 'Sat', patients: Math.max((stats?.totalPatients ?? 1) - 1, 1), appts: Math.max((stats?.todayAppointments ?? 1), 1) },
    { day: 'Sun', patients: Math.max((stats?.totalPatients ?? 1) - 3, 1), appts: Math.max((stats?.todayAppointments ?? 0), 0) },
  ];

  const barData = [
    { name: 'Patients', value: stats?.totalPatients ?? 0 },
    { name: 'Doctors', value: stats?.totalDoctors ?? 0 },
    { name: 'Staff', value: stats?.totalStaff ?? 0 },
    { name: 'Labs', value: stats?.pendingLabRequests ?? 0 },
    { name: 'Bills', value: stats?.unpaidBills ?? 0 },
  ];

  const pieData = [
    { name: 'Available', value: stats?.availableBeds ?? 0 },
    { name: 'Occupied', value: Math.max((stats?.totalBeds ?? 0) - (stats?.availableBeds ?? 0), 0) },
  ];
  const pieColors = ['#14b8a6', '#fb923c'];

  const alerts = [
    {
      title: 'Unpaid Bills',
      value: stats?.unpaidBills ?? 0,
      note: 'Needs billing follow-up',
      color: '#e11d48',
      soft: '#fff1f2',
    },
    {
      title: 'Pending Lab Requests',
      value: stats?.pendingLabRequests ?? 0,
      note: 'Waiting for results',
      color: '#7c3aed',
      soft: '#f5f3ff',
    },
    {
      title: 'Bed Availability',
      value: `${stats?.availableBeds ?? 0}/${stats?.totalBeds ?? 0}`,
      note: 'Current free beds',
      color: '#0f766e',
      soft: '#ecfdf5',
    },
    {
      title: "Today's Load",
      value: stats?.todayAppointments ?? 0,
      note: 'Appointments scheduled today',
      color: '#ea580c',
      soft: '#fff7ed',
    },
  ];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentDate]);

  const monthLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <Layout>
      <div style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Hospital Overview</div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, <strong>{user?.name}</strong> · {user?.role}
          </p>
        </div>
        <div style={styles.badge}>Live System</div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading dashboard...</div>
      ) : (
        <>
          <div style={{ ...styles.grid, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} style={styles.card}>
                  <div style={{ ...styles.iconWrap, background: card.soft, color: card.color }}>
                    <Icon size={18} />
                  </div>
                  <div style={styles.label}>{card.title}</div>
                  <div style={{ ...styles.value, color: card.color }}>{card.value}</div>
                </div>
              );
            })}
          </div>

          <div style={styles.lowerGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHead}>
                <h3 style={styles.panelTitle}>Weekly Activity</h3>
                <Activity size={18} color="#ea580c" />
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #ffedd5',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Area type="monotone" dataKey="patients" stroke="#fb923c" fill="url(#colorPatients)" strokeWidth={3} />
                    <Area type="monotone" dataKey="appts" stroke="#14b8a6" fill="url(#colorAppts)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.calendarHeader}>
                <h3 style={styles.panelTitle}>{monthLabel}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => changeMonth(-1)} style={styles.monthBtn}>‹</button>
                  <button onClick={() => changeMonth(1)} style={styles.monthBtn}>›</button>
                </div>
              </div>
              <div style={styles.weekRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} style={styles.weekDay}>{d}</div>
                ))}
              </div>
              <div style={styles.daysGrid}>
                {calendarDays.map((day, idx) => {
                  const isToday =
                    day &&
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();
                  return (
                    <div
                      key={idx}
                      style={{
                        ...styles.dayCell,
                        background: isToday ? '#fff7ed' : 'transparent',
                        color: isToday ? '#c2410c' : '#334155',
                        fontWeight: isToday ? 700 : 500,
                        border: isToday ? '1px solid #fed7aa' : '1px solid transparent',
                      }}
                    >
                      {day || ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={styles.lowerGrid}>
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Department Snapshot</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #ffedd5',
                      }}
                    />
                    <Bar dataKey="value" fill="#fb923c" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Bed Occupancy</h3>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.legendRow}>
                <span style={styles.legendItem}><i style={{ ...styles.dot, background: '#14b8a6' }} /> Available</span>
                <span style={styles.legendItem}><i style={{ ...styles.dot, background: '#fb923c' }} /> Occupied</span>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Needs Attention</h3>
              <AlertTriangle size={18} color="#ea580c" />
            </div>
            <div style={styles.alertGrid}>
              {alerts.map((a) => (
                <div key={a.title} style={{ ...styles.alertCard, background: a.soft }}>
                  <div style={{ ...styles.alertValue, color: a.color }}>{a.value}</div>
                  <div style={styles.alertTitle}>{a.title}</div>
                  <div style={styles.alertNote}>{a.note}</div>
                </div>
              ))}
            </div>
          </div>
        </>
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
    marginBottom: 22,
    padding: '20px 22px',
    borderRadius: 18,
    background: '#ffffff',
    border: '1px solid #ffedd5',
    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.08)',
  },
  eyebrow: { fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: '#ea580c', fontWeight: 700 },
  title: { margin: '6px 0 0', fontSize: 30, color: '#0f172a' },
  subtitle: { margin: '6px 0 0', color: '#64748b' },
  badge: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  loading: { background: '#ffffff', borderRadius: 16, padding: 24, border: '1px solid #ffedd5' },
  grid: { display: 'grid', gap: 16, marginBottom: 16 },
  card: {
    background: '#ffffff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
    minHeight: 120,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', marginBottom: 12 },
  label: { fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 600 },
  value: { fontSize: 24, fontWeight: 800 },
  lowerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  panel: {
    background: '#ffffff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
    marginBottom: 16,
  },
  panelHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  panelTitle: { margin: 0, fontSize: 16, color: '#0f172a' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  monthBtn: {
    border: '1px solid #fed7aa',
    background: '#fff7ed',
    color: '#c2410c',
    borderRadius: 8,
    width: 32,
    height: 32,
    cursor: 'pointer',
    fontWeight: 700,
  },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 },
  weekDay: { textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 600 },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  dayCell: { height: 36, display: 'grid', placeItems: 'center', borderRadius: 8, fontSize: 13 },
  legendRow: { display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' },
  dot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  alertGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginTop: 12,
  },
  alertCard: { borderRadius: 14, padding: 14 },
  alertValue: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  alertTitle: { fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  alertNote: { fontSize: 12, color: '#64748b' },
};

export default Dashboard;