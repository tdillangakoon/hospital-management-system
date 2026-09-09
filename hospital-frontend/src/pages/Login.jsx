import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* soft decorative circles */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
      <div style={styles.circle3}></div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>HMS</div>
          <h1 style={styles.title}>Hospital Management System</h1>
          <p style={styles.subtitle}>Secure staff access portal</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="admin@hospital.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerNote}>Authorized hospital staff only</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 35%, #ecfdf5 70%, #ffffff 100%)',
    padding: 20,
  },
  circle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: '50%',
    background: 'rgba(14, 165, 233, 0.15)',
    top: -80,
    left: -60,
  },
  circle2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.12)',
    bottom: -60,
    right: -40,
  },
  circle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'rgba(56, 189, 248, 0.12)',
    top: '40%',
    right: '15%',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    boxShadow: '0 20px 50px rgba(14, 165, 233, 0.12)',
    padding: '36px 32px',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 54,
    height: 54,
    margin: '0 auto 12px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
    boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
  },
  title: {
    margin: 0,
    fontSize: 22,
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    color: '#334155',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #dbeafe',
    background: 'rgba(255,255,255,0.9)',
    outline: 'none',
    fontSize: 14,
  },
  button: {
    width: '100%',
    marginTop: 8,
    padding: '12px 14px',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(14, 165, 233, 0.25)',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '10px 12px',
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 12,
    color: '#94a3b8',
  },
};

export default Login;