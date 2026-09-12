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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Change Password</h1>
          <p style={styles.subtitle}>Update your account password</p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.card}>
        <input
          type="password"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="New Password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.primaryBtn}>Update Password</button>
      </form>
    </Layout>
  );
}

const styles = {
  header: { marginBottom: 20 },
  title: { margin: 0, fontSize: 28, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  card: {
    background: '#fff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    maxWidth: 420,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fffdf9',
    outline: 'none',
    boxSizing: 'border-box',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
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