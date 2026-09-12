import { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.wrapper}>
        <div style={styles.shell}>
          <div style={styles.header}>
            <div style={styles.badge}>Security</div>
            <h1 style={styles.title}>Change Password</h1>
            <p style={styles.subtitle}>
              Keep your MediCare account secure by updating your password regularly.
            </p>
          </div>

          <div style={styles.content}>
            <div style={styles.tipsCard}>
              <h3 style={styles.tipsTitle}>Password tips</h3>
              <div style={styles.tipsGrid}>
                <div style={styles.tipItem}>Use at least 6 characters</div>
                <div style={styles.tipItem}>Mix letters and numbers</div>
                <div style={styles.tipItem}>Don’t reuse old passwords</div>
                <div style={styles.tipItem}>Never share your password</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.card}>
              <h2 style={styles.cardTitle}>Update credentials</h2>
              <p style={styles.cardSub}>Enter your current password and choose a new one.</p>

              {error && <div style={styles.error}>{error}</div>}
              {success && <div style={styles.success}>{success}</div>}

              <label style={styles.label}>Current Password</label>
              <div style={styles.inputWrap}>
                <input
                  type={show.current ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, current: !show.current })}
                  style={styles.eyeBtn}
                >
                  {show.current ? 'Hide' : 'Show'}
                </button>
              </div>

              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrap}>
                <input
                  type={show.next ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, next: !show.next })}
                  style={styles.eyeBtn}
                >
                  {show.next ? 'Hide' : 'Show'}
                </button>
              </div>

              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.inputWrap}>
                <input
                  type={show.confirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, confirm: !show.confirm })}
                  style={styles.eyeBtn}
                >
                  {show.confirm ? 'Hide' : 'Show'}
                </button>
              </div>

              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  wrapper: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 20,
  },
  shell: {
    width: '100%',
    maxWidth: 760,
  },
  header: {
    textAlign: 'center',
    marginBottom: 22,
  },
  badge: {
    display: 'inline-block',
    background: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 34,
    color: '#0f172a',
  },
  subtitle: {
    margin: '10px auto 0',
    color: '#64748b',
    lineHeight: 1.6,
    maxWidth: 480,
  },
  content: {
    display: 'grid',
    gap: 16,
  },
  tipsCard: {
    background: 'linear-gradient(160deg, #ecfdf5 0%, #fff7ed 100%)',
    border: '1px solid #ffedd5',
    borderRadius: 18,
    padding: 18,
  },
  tipsTitle: {
    margin: '0 0 12px',
    color: '#0f766e',
    textAlign: 'center',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  tipItem: {
    background: 'rgba(255,255,255,0.75)',
    border: '1px solid #ffedd5',
    borderRadius: 12,
    padding: '12px 14px',
    color: '#334155',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #ffedd5',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    color: '#0f172a',
    textAlign: 'center',
  },
  cardSub: {
    margin: '6px 0 18px',
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
  },
  inputWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  input: {
    width: '100%',
    padding: '13px 70px 13px 14px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    background: '#fffdf9',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: 14,
  },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: '#fff7ed',
    color: '#c2410c',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  },
  primaryBtn: {
    width: '100%',
    marginTop: 8,
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '13px 16px',
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 10px 20px rgba(245, 158, 11, 0.25)',
  },
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

export default ChangePassword;