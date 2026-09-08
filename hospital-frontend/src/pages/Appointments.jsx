import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    status: 'SCHEDULED',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [appRes, patRes, docRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setAppointments(appRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      notes: '',
      status: 'SCHEDULED',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (appointment) => {
    setForm({
      patientId: appointment.patientId || '',
      doctorId: appointment.doctorId || '',
      date: appointment.date ? appointment.date.split('T')[0] : '',
      time: appointment.time || '',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'SCHEDULED',
    });
    setEditingId(appointment.id);
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
        await api.put(`/appointments/${editingId}`, form);
        setSuccess('Appointment updated successfully');
      } else {
        await api.post('/appointments', form);
        setSuccess('Appointment booked successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      setSuccess(`Appointment marked as ${status}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/appointments/${deleteId}`);
      setSuccess('Appointment deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Appointments</h1>
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
          {showForm ? 'Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Appointment' : 'Book New Appointment'}</h3>
          <div style={styles.formGrid}>
            <select name="patientId" value={form.patientId} onChange={handleChange} required style={styles.input}>
              <option value="">Select Patient *</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>

            <select name="doctorId" value={form.doctorId} onChange={handleChange} required style={styles.input}>
              <option value="">Select Doctor *</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user?.name} - {d.specialization}
                </option>
              ))}
            </select>

            <input name="date" type="date" value={form.date} onChange={handleChange} required style={styles.input} />
            <input name="time" type="time" value={form.time} onChange={handleChange} required style={styles.input} />
            <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} style={styles.input} />
            
            {editingId && (
              <select name="status" value={form.status} onChange={handleChange} style={styles.input}>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="NO_SHOW">NO_SHOW</option>
              </select>
            )}

            <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} style={styles.input} />
          </div>
          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Appointment' : 'Book Appointment'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Doctor</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Reason</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 20, textAlign: 'center' }}>No appointments found</td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id}>
                    <td style={styles.td}>{a.patient?.name}</td>
                    <td style={styles.td}>{a.doctor?.user?.name}</td>
                    <td style={styles.td}>{new Date(a.date).toLocaleDateString()}</td>
                    <td style={styles.td}>{a.time}</td>
                    <td style={styles.td}>{a.reason || '-'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: a.status === 'SCHEDULED' ? '#dbeafe' : a.status === 'COMPLETED' ? '#dcfce7' : '#fee2e2',
                        color: a.status === 'SCHEDULED' ? '#1d4ed8' : a.status === 'COMPLETED' ? '#16a34a' : '#dc2626',
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => handleEdit(a)} style={styles.editBtn}>Edit</button>
                        {a.status === 'SCHEDULED' && (
                          <>
                            <button onClick={() => updateStatus(a.id, 'COMPLETED')} style={styles.completeBtn}>Complete</button>
                            <button onClick={() => updateStatus(a.id, 'CANCELLED')} style={styles.cancelStatusBtn}>Cancel</button>
                          </>
                        )}
                        <button onClick={() => setDeleteId(a.id)} style={styles.deleteBtn}>Delete</button>
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
            <p>Are you sure you want to delete this appointment?</p>
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
  completeBtn: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
  },
  cancelStatusBtn: {
    background: '#f59e0b',
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

export default Appointments;