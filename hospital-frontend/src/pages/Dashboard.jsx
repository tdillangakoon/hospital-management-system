import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <Layout>
      <div style={{ padding: 30, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#666' }}>
            Welcome, {user?.name} ({user?.role})
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.grid}>
        <StatCard title="Total Patients" value={stats?.totalPatients} color="#3b82f6" />
        <StatCard title="Total Doctors" value={stats?.totalDoctors} color="#10b981" />
        <StatCard title="Today's Appointments" value={stats?.todayAppointments} color="#f59e0b" />
        <StatCard title="Pending Lab Requests" value={stats?.pendingLabRequests} color="#ef4444" />
        <StatCard title="Unpaid Bills" value={stats?.unpaidBills} color="#8b5cf6" />
        <StatCard title="Available Beds" value={`${stats?.availableBeds} / ${stats?.totalBeds}`} color="#06b6d4" />
        <StatCard title="Total Revenue" value={`Rs. ${stats?.totalRevenue?.toLocaleString()}`} color="#22c55e" />
        <StatCard title="Total Staff" value={stats?.totalStaff} color="#ec4899" />
      </div>
    </div>
    </Layout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#111' }}>{value ?? '-'}</div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 20,
  },
  card: {
    background: 'white',
    padding: 20,
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
};

export default Dashboard;