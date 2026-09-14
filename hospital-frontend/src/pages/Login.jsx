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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
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
              placeholder="admin@hospital.com"
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              autoComplete="current-password"
            />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>

        <div style={styles.right}>
          <div style={styles.blob}>
            <img
              src="/Doctors.png"
              alt="Doctors"
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
    background: '#faf7f2',
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
    boxShadow: '0 18px 50px rgba(17, 24, 39, 0.08)',
    border: '1px solid #ede6dc',
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
    background: '#e11d48',
    boxShadow: '0 0 0 6px rgba(225, 29, 72, 0.15)',
  },
  brand: {
    fontWeight: 700,
    color: '#111111',
    fontSize: 15,
  },
  title: {
    margin: 0,
    fontSize: 34,
    color: '#111111',
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
    border: '1px solid #ede6dc',
    background: '#fffdfb',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    marginTop: 8,
    padding: '13px 14px',
    border: 'none',
    borderRadius: 12,
    background: '#e11d48',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(225, 29, 72, 0.25)',
  },
  error: {
    background: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fecdd3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  right: {
    background: '#faf7f2',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
  },
  blob: {
    width: '100%',
    maxWidth: 430,
    height: 430,
    background: 'linear-gradient(160deg, #fff1f2 0%, #ffe4e6 40%, #faf7f2 100%)',
    borderRadius: '42% 58% 48% 52% / 48% 42% 58% 52%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 28,
    border: '5px solid #e11d48',
    boxShadow: '0 20px 50px rgba(225, 29, 72, 0.18)',
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