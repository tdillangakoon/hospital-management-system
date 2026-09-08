import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '123456',
    role: 'NURSE',
    employeeId: '',
    phone: '',
    department: '',
    designation: '',
    joiningDate: '',
    address: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '123456',
      role: 'NURSE',
      employeeId: '',
      phone: '',
      department: '',
      designation: '',
      joiningDate: '',
      address: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (staff) => {
    setForm({
      name: staff.user?.name || '',
      email: staff.user?.email || '',
      password: '',
      role: staff.user?.role || 'NURSE',
      employeeId: staff.employeeId || '',
      phone: staff.phone || '',
      department: staff.department || '',
      designation: staff.designation || '',
      joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : '',
      address: staff.address || '',
    });
    setEditingId(staff.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/staff/${editingId}`, payload);
        setSuccess('Staff updated successfully');
      } else {
        await api.post('/staff', form);
        setSuccess('Staff member added successfully');
      }
      resetForm();
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/staff/${deleteId}`);
      setSuccess('Staff deleted successfully');
      setDeleteId(null);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff');
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Staff</h1>
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
          {showForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Staff' : 'Add Staff Member'}</h3>
          <div style={styles.formGrid}>
            <input name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} required style={styles.input} />
            <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} required style={styles.input} />
            <input
              name="password"
              type="password"
              placeholder={editingId ? 'New Password (leave blank to keep)' : 'Password'}
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              autoComplete="new-password"
            />
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="NURSE">Nurse</option>
              <option value="LAB_TECHNICIAN">Lab Technician</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="ADMIN">Admin</option>
            </select>
            <input name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={handleChange} style={styles.input} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={styles.input} />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} style={styles.input} />
            <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} style={styles.input} />
            <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} style={styles.input} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={styles.input} />
          </div>
          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Staff' : 'Save Staff'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <div style={{ ...styles.tableWrapper, overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: 20, textAlign: 'center' }}>
                    No staff found
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.user?.name}</td>
                    <td style={styles.td}>{s.user?.email}</td>
                    <td style={styles.td}>{s.user?.role}</td>
                    <td style={styles.td}>{s.employeeId || '-'}</td>
                    <td style={styles.td}>{s.department || '-'}</td>
                    <td style={styles.td}>{s.designation || '-'}</td>
                    <td style={styles.td}>{s.phone || '-'}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: s.isActive ? '#dcfce7' : '#fee2e2',
                          color: s.isActive ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(s)} style={styles.editBtn}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(s.id)} style={styles.deleteBtn}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this staff member?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setDeleteId(null)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={styles.deleteBtn}>
                Yes, Delete
              </button>
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
    minWidth: 900,
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
  badge: {
    padding: '4px 8px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
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

export default Staff;