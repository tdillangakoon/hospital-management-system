import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    bloodGroup: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/patients', form);
      setSuccess('Patient added successfully');
      setForm({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        bloodGroup: '',
      });
      setShowForm(false);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Patients</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.primaryBtn}>
          {showForm ? 'Cancel' : '+ Add Patient'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>Add New Patient</h3>
          <div style={styles.formGrid}>
            <input name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} required style={styles.input} />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} />
            <input name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} required style={styles.input} />
            <select name="gender" value={form.gender} onChange={handleChange} style={styles.input}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} style={styles.input} />
            <input name="bloodGroup" placeholder="Blood Group (e.g. O+)" value={form.bloodGroup} onChange={handleChange} style={styles.input} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={{ ...styles.input, gridColumn: '1 / -1' }} />
          </div>
          <button type="submit" style={styles.primaryBtn}>Save Patient</button>
        </form>
      )}

      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Gender</th>
                <th style={styles.th}>Blood Group</th>
                <th style={styles.th}>Address</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>No patients found</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>{p.phone}</td>
                    <td style={styles.td}>{p.email || '-'}</td>
                    <td style={styles.td}>{p.gender || '-'}</td>
                    <td style={styles.td}>{p.bloodGroup || '-'}</td>
                    <td style={styles.td}>{p.address || '-'}</td>
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

export default Patients;