import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '123456',
    specialization: '',
    phone: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/doctors', form);
      setSuccess('Doctor added successfully');
      setForm({
        name: '',
        email: '',
        password: '123456',
        specialization: '',
        phone: '',
        department: '',
      });
      setShowForm(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Doctors</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.primaryBtn}>
          {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>Add New Doctor</h3>
          <div style={styles.formGrid}>
            <input name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} required style={styles.input} />
            <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} required style={styles.input} />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={styles.input} />
            <input name="specialization" placeholder="Specialization *" value={form.specialization} onChange={handleChange} required style={styles.input} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={styles.input} />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} style={styles.input} />
          </div>
          <button type="submit" style={styles.primaryBtn}>Save Doctor</button>
        </form>
      )}

      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Specialization</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 20, textAlign: 'center' }}>No doctors found</td>
                </tr>
              ) : (
                doctors.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.user?.name}</td>
                    <td style={styles.td}>{d.user?.email}</td>
                    <td style={styles.td}>{d.specialization}</td>
                    <td style={styles.td}>{d.department || '-'}</td>
                    <td style={styles.td}>{d.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  primaryBtn: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  form: {
    background: 'white',
    padding: 24,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
  },
  tableWrapper: {
    background: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    background: '#f1f5f9',
    fontSize: 13,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  success: {
    background: '#dcfce7',
    color: '#16a34a',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
};

export default Doctors;