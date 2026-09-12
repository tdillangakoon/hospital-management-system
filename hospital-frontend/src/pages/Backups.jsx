import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Backups() {
  const [backups, setBackups] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [backupRes, planRes] = await Promise.all([
        api.get('/backups'),
        api.get('/backups/recovery-plan'),
      ]);
      setBackups(backupRes.data);
      setPlan(planRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runBackup = async (type) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/backups/run', { type });
      setSuccess(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Backup failed');
    }
  };

  const downloadBackup = async (type, fileName) => {
    try {
      const res = await api.get(`/backups/download/${type}/${fileName}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Download failed');
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Backup & Recovery</h1>
          <p style={styles.subtitle}>Daily/weekly backups and disaster recovery plan</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => runBackup('daily')} style={styles.primaryBtn}>Run Daily Backup</button>
          <button onClick={() => runBackup('weekly')} style={styles.secondaryBtn}>Run Weekly Backup</button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Backup Policy</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', lineHeight: 1.7 }}>
          <li>Automatic daily backup at 02:00</li>
          <li>Automatic weekly full backup every Sunday at 03:00</li>
          <li>Manual backup available anytime for admin</li>
          <li>Backup files stored under backend /backups folder</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Existing Backups</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>File</th>
                  <th style={styles.th}>Size</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      No backups yet. Run one now.
                    </td>
                  </tr>
                ) : (
                  backups.map((b) => (
                    <tr key={`${b.type}-${b.fileName}`}>
                      <td style={styles.td}>{b.type}</td>
                      <td style={styles.td}>{b.fileName}</td>
                      <td style={styles.td}>{(b.size / 1024).toFixed(1)} KB</td>
                      <td style={styles.td}>{new Date(b.createdAt).toLocaleString()}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => downloadBackup(b.type, b.fileName)}
                          style={styles.editBtn}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {plan && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{plan.title}</h3>
          <ol style={{ margin: 0, paddingLeft: 18, color: '#334155', lineHeight: 1.8 }}>
            {plan.steps.map((s) => (
              <li key={s}>{s.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
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
  secondaryBtn: {
    background: 'linear-gradient(135deg, #12b886, #0ca678)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  editBtn: {
    background: '#ecfdf5',
    color: '#0f766e',
    border: '1px solid #a7f3d0',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  card: {
    background: '#fff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: { marginTop: 0, marginBottom: 12 },
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
  success: {
    background: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
};

export default Backups;