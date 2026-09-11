import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
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

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      address: '',
      bloodGroup: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (patient) => {
    setForm({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      gender: patient.gender || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || '',
    });
    setEditingId(patient.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/patients/${deleteId}`);
      setSuccess('Patient deleted successfully');
      setDeleteId(null);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
        setSuccess('Patient updated successfully');
      } else {
        await api.post('/patients', form);
        setSuccess('Patient added successfully');
      }
      resetForm();
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.bloodGroup?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Patients</h1>
          <p style={styles.subtitle}>Manage patient records</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else {
              setShowForm(true);
              setEditingId(null);
            }
          }}
          style={styles.primaryBtn}
        >
          {showForm ? 'Cancel' : '+ Add Patient'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId ? 'Edit Patient' : 'Add New Patient'}</h3>
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
            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} style={styles.input}>
              <option value="">Select Blood Group</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={{ ...styles.input, gridColumn: '1 / -1' }} />
          </div>
          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Patient' : 'Save Patient'}
          </button>
        </form>
      )}

      <div style={styles.card}>
        <input
          type="text"
          placeholder="Search patients by name, phone, email, blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {loading ? (
          <p>Loading patients...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Gender</th>
                  <th style={styles.th}>Blood Group</th>
                  <th style={styles.th}>Address</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      No patients found
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>{p.phone}</td>
                      <td style={styles.td}>{p.email || '-'}</td>
                      <td style={styles.td}>{p.gender || '-'}</td>
                      <td style={styles.td}>
                        <span style={styles.pill}>{p.bloodGroup || '-'}</span>
                      </td>
                      <td style={styles.td}>{p.address || '-'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleEdit(p)} style={styles.editBtn}>Edit</button>
                          <button onClick={() => setDeleteId(p.id)} style={styles.deleteBtn}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p style={{ color: '#64748b' }}>Are you sure you want to delete this patient?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setDeleteId(null)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmDelete} style={styles.deleteBtn}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { margin: 0, fontSize: 28, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  primaryBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '0 8px 18px rgba(245,158,11,0.25)',
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
  deleteBtn: {
    background: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  cancelBtn: {
    background: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  },
  card: {
    background: '#ffffff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
  },
  cardTitle: { marginTop: 0, marginBottom: 14, color: '#0f172a' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 14,
  },
  input: {
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    background: '#fffdf9',
    outline: 'none',
  },
  search: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 14,
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#fffdf9',
    outline: 'none',
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#fff7ed',
    fontSize: 12,
    color: '#c2410c',
    borderBottom: '1px solid #ffedd5',
    fontWeight: 700,
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f8fafc',
    fontSize: 14,
    color: '#0f172a',
  },
  pill: {
    background: '#ecfdf5',
    color: '#0f766e',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: 999,
    fontSize: 12,
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
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
};

export default Patients;