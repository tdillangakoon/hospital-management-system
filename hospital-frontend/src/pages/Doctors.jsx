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
        // For update we don't send password if empty
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Doctors</h1>
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
        <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
          <div style={styles.formGrid}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: '#4f46e5' }}>Dr.</span>
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
              autoComplete="off"
            />

            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Doctor' : 'Save Doctor'}
          </button>
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
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>No doctors found</td>
                </tr>
              ) : (
                doctors.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.user?.name}</td>
                    <td style={styles.td}>{d.user?.email}</td>
                    <td style={styles.td}>{d.specialization}</td>
                    <td style={styles.td}>{d.department || '-'}</td>
                    <td style={styles.td}>{d.phone || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
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

      {/* Delete Confirmation Popup */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this doctor? This action cannot be undone.</p>
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
  primaryBtn: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  editBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
  },
  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
  },
  cancelBtn: {
    background: '#94a3b8',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
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
    width: '100%',
    boxSizing: 'border-box',
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
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    padding: 24,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
};

export default Doctors;