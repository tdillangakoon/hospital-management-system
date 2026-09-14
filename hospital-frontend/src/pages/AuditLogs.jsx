import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.module?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Audit Logs</h1>
          <p style={styles.subtitle}>Track important system actions</p>
        </div>
      </div>

      <div style={styles.card}>
        <input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {loading ? (
          <p>Loading logs...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Module</th>
                  <th style={styles.th}>Details</th>
                  <th style={styles.th}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id}>
                      <td style={styles.td}>{l.user?.name || 'System'}</td>
                      <td style={styles.td}>{l.user?.role || '-'}</td>
                      <td style={styles.td}>{l.action}</td>
                      <td style={styles.td}>{l.module}</td>
                      <td style={styles.td}>{l.details || '-'}</td>
                      <td style={styles.td}>{new Date(l.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  header: { marginBottom: 20 },
  title: { margin: 0, fontSize: 28, color: '#111111' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  card: {
    background: '#ffffff',
    border: '1px solid #ede6dc',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 8px 24px rgba(17, 24, 39, 0.04)',
  },
  search: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 14,
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid #ede6dc',
    background: '#fffdfb',
    outline: 'none',
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#fff1f2',
    fontSize: 12,
    color: '#be123c',
    borderBottom: '1px solid #ede6dc',
    fontWeight: 700,
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f5f0ea',
    fontSize: 14,
    color: '#111111',
  },
};

export default AuditLogs;