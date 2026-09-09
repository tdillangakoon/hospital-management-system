import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    phone: '',
    department: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const specializations = [
    'Cardiology',
    'Dermatology',
    'ENT',
    'General Medicine',
    'Gynecology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
    'Other',
  ];

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

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      specialization: '',
      phone: '',
      department: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (doctor) => {
    setForm({
      name: doctor.user?.name?.replace(/^Dr\.\s*/i, '') || '',
      email: doctor.user?.email || '',
      password: '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      department: doctor.department || '',
    });
    setEditingId(doctor.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/doctors/${deleteId}`);
      setSuccess('Doctor deleted successfully');
      setDeleteId(null);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        name: form.name.startsWith('Dr.') ? form.name : `Dr. ${form.name}`,
      };

      if (editingId) {
        if (!payload.password) delete payload.password;
        await api.put(`/doctors/${editingId}`, payload);
        setSuccess('Doctor updated successfully');
      } else {
        if (!payload.password) payload.password = '123456';
        await api.post('/doctors', payload);
        setSuccess('Doctor added successfully');
      }

      resetForm();
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor');
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Doctors</h1>
          <p style={styles.subtitle}>Manage doctor profiles and specializations</p>
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
          {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.card} autoComplete="off">
          <h3 style={styles.cardTitle}>{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
          <div style={styles.formGrid}>
            <div style={styles.nameField}>
              <span style={styles.drPrefix}>Dr.</span>
              <input
                name="name"
                placeholder="Full Name *"
                value={form.name}
                onChange={handleChange}
                required
                style={{ ...styles.input, flex: 1 }}
                autoComplete="off"
              />
            </div>

            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
              autoComplete="off"
            />

            <input
              name="password"
              type="password"
              placeholder={editingId ? 'New Password (leave blank to keep)' : 'Password'}
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              autoComplete="new-password"
            />

            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select Specialization *</option>
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Doctor' : 'Save Doctor'}
          </button>
        </form>
      )}

      <div style={styles.card}>
        {loading ? (
          <p>Loading doctors...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Specialization</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      No doctors found
                    </td>
                  </tr>
                ) : (
                  doctors.map((d) => (
                    <tr key={d.id}>
                      <td style={styles.td}>{d.user?.name}</td>
                      <td style={styles.td}>{d.user?.email}</td>
                      <td style={styles.td}>
                        <span style={styles.pill}>{d.specialization}</span>
                      </td>
                      <td style={styles.td}>{d.department || '-'}</td>
                      <td style={styles.td}>{d.phone || '-'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleEdit(d)} style={styles.editBtn}>Edit</button>
                          <button onClick={() => setDeleteId(d.id)} style={styles.deleteBtn}>Delete</button>
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
            <p style={{ color: '#64748b' }}>Are you sure you want to delete this doctor?</p>
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
  title: {
    margin: 0,
    fontSize: 28,
    color: '#0f172a',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#64748b',
    fontSize: 14,
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '0 8px 18px rgba(14,165,233,0.25)',
  },
  editBtn: {
    background: '#e0f2fe',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  deleteBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  cancelBtn: {
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  },
  card: {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    boxShadow: '0 10px 28px rgba(2,132,199,0.06)',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 14,
    color: '#0f172a',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 14,
  },
  nameField: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  drPrefix: {
    fontWeight: 700,
    color: '#0284c7',
    fontSize: 14,
  },
  input: {
    padding: '11px 12px',
    border: '1px solid #dbeafe',
    borderRadius: 10,
    fontSize: 14,
    background: 'rgba(255,255,255,0.95)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 900,
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#f0f9ff',
    fontSize: 12,
    color: '#0369a1',
    borderBottom: '1px solid #e0f2fe',
    fontWeight: 700,
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
    color: '#0f172a',
  },
  pill: {
    background: '#ecfeff',
    color: '#0e7490',
    border: '1px solid #a5f3fc',
    padding: '3px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

export default Doctors;