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
      <div style={styles.shell}>
        {/* LEFT FORM */}
        <div style={styles.left}>
          <div style={styles.brandRow}>
            <div style={styles.logoDot}></div>
            <span style={styles.brand}>MediCare</span>
          </div>

          <h1 style={styles.title}>Hospital Login</h1>
          <p style={styles.subtitle}>Sign in to continue</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@hospital.com"
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={styles.input}
              autoComplete="current-password"
            />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* RIGHT MINT BLOB + IMAGE */}
        <div style={styles.right}>
          <div style={styles.blob}>
            <img
              src="/Hospital.png"              
              alt="Hospital"
              style={styles.illustration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 20,
    background: 'linear-gradient(135deg, #fff7ed 0%, #ecfdf5 45%, #f0fdfa 100%)',
  },
  shell: {
    width: '100%',
    maxWidth: 980,
    minHeight: 560,
    display: 'grid',
    gridTemplateColumns: '1fr 1.05fr',
    background: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
  },
  left: {
    padding: '46px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#f59e0b',
    boxShadow: '0 0 0 6px rgba(245, 158, 11, 0.18)',
  },
  brand: {
    fontWeight: 700,
    color: '#0f766e',
    fontSize: 15,
  },
  title: {
    margin: 0,
    fontSize: 34,
    color: '#0f172a',
  },
  subtitle: {
    margin: '8px 0 26px',
    color: '#64748b',
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    width: '100%',
    marginBottom: 14,
    padding: '13px 14px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    background: '#fffdf9',
    outline: 'none',
  },
  button: {
    width: '100%',
    marginTop: 8,
    padding: '13px 14px',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(245, 158, 11, 0.25)',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  right: {
    background: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
  },
  blob: {
  width: '100%',
  maxWidth: 430,
  height: 430,
  background: 'linear-gradient(160deg, #99f6e4 0%, #5eead4 40%, #a5f3fc 100%)',
  borderRadius: '42% 58% 48% 52% / 48% 42% 58% 52%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: 28,
  border: '5px solid #fdba74',
  boxShadow: '0 20px 50px rgba(251, 146, 60, 0.45), 0 8px 20px rgba(251, 146, 60, 0.25)',
},
illustration: {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
  display: 'block',
},
};

export default Login;