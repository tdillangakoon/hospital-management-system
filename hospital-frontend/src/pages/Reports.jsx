import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Reports() {
  const [type, setType] = useState('patients');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async (reportType = type) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/reports/${reportType}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport('patients');
  }, []);

  const handleTypeChange = (value) => {
    setType(value);
    loadReport(value);
  };

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reports</h1>
          <p style={styles.subtitle}>Hospital operational reports</p>
        </div>
        <button onClick={() => window.print()} style={styles.primaryBtn}>Print</button>
      </div>

      <div style={styles.tabs}>
        {[
          { key: 'patients', label: 'Patients' },
          { key: 'appointments', label: 'Appointments' },
          { key: 'revenue', label: 'Revenue' },
          { key: 'pharmacy', label: 'Pharmacy' },
          { key: 'laboratory', label: 'Laboratory' },
          { key: 'staff', label: 'Staff' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => handleTypeChange(t.key)}
            style={type === t.key ? styles.activeTab : styles.tab}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={styles.card}>Loading report...</div>}

      {!loading && data && (
        <div style={styles.card}>
          {data.summary && (
            <div style={styles.summaryGrid}>
              {Object.entries(data.summary).map(([key, value]) => (
                <div key={key} style={styles.summaryCard}>
                  <div style={styles.summaryLabel}>{key}</div>
                  <div style={styles.summaryValue}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === 'patients' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Gender</th>
                  <th style={styles.th}>Blood Group</th>
                  <th style={styles.th}>Appointments</th>
                  <th style={styles.th}>Bills</th>
                </tr>
              </thead>
              <tbody>
                {(data.data || []).map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>{p.phone}</td>
                    <td style={styles.td}>{p.gender || '-'}</td>
                    <td style={styles.td}>{p.bloodGroup || '-'}</td>
                    <td style={styles.td}>{p.appointments?.length || 0}</td>
                    <td style={styles.td}>{p.bills?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {type === 'appointments' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.data || []).map((a) => (
                  <tr key={a.id}>
                    <td style={styles.td}>{a.patient?.name}</td>
                    <td style={styles.td}>{a.doctor?.user?.name}</td>
                    <td style={styles.td}>{new Date(a.date).toLocaleDateString()}</td>
                    <td style={styles.td}>{a.time}</td>
                    <td style={styles.td}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {type === 'revenue' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.data || []).map((b) => (
                  <tr key={b.id}>
                    <td style={styles.td}>{b.patient?.name}</td>
                    <td style={styles.td}>{b.description || '-'}</td>
                    <td style={styles.td}>Rs. {b.amount}</td>
                    <td style={styles.td}>{b.status}</td>
                    <td style={styles.td}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {type === 'pharmacy' && (
            <>
              <h3>Medicines</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.medicines || []).map((m) => (
                    <tr key={m.id}>
                      <td style={styles.td}>{m.name}</td>
                      <td style={styles.td}>{m.stockQuantity}</td>
                      <td style={styles.td}>Rs. {m.price}</td>
                      <td style={styles.td}>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {type === 'laboratory' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Test</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.data || []).map((r) => (
                  <tr key={r.id}>
                    <td style={styles.td}>{r.patient?.name}</td>
                    <td style={styles.td}>{r.test?.name}</td>
                    <td style={styles.td}>{r.doctor?.user?.name || '-'}</td>
                    <td style={styles.td}>{r.status}</td>
                    <td style={styles.td}>{new Date(r.requestDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {type === 'staff' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.data || []).map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.user?.name}</td>
                    <td style={styles.td}>{s.user?.role}</td>
                    <td style={styles.td}>{s.department || '-'}</td>
                    <td style={styles.td}>{s.employeeId || '-'}</td>
                    <td style={styles.td}>{s.isActive ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Layout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { margin: 0, fontSize: 28, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  primaryBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  tab: {
    background: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  activeTab: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  card: {
    background: '#fff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    background: '#fff7ed',
    border: '1px solid #ffedd5',
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: { fontSize: 12, color: '#9a3412', textTransform: 'capitalize', marginBottom: 6 },
  summaryValue: { fontSize: 20, fontWeight: 800, color: '#c2410c' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 800 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#fff7ed',
    fontSize: 12,
    color: '#c2410c',
    borderBottom: '1px solid #ffedd5',
  },
  td: { padding: '12px 14px', borderBottom: '1px solid #f8fafc', fontSize: 14 },
  error: {
    background: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
};

export default Reports;