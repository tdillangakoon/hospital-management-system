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
  const [search, setSearch] = useState('');

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

  const statusStyle = (status) => {
    if (status === 'SCHEDULED') return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
    if (status === 'COMPLETED') return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    return { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' };
  };

  const filteredAppointments = appointments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.patient?.name?.toLowerCase().includes(q) ||
      a.doctor?.user?.name?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q) ||
      a.time?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Appointments</h1>
          <p style={styles.subtitle}>Book and manage appointments</p>
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
          {showForm ? 'Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId ? 'Edit Appointment' : 'Book New Appointment'}</h3>
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

      <div style={styles.card}>
        <input
          type="text"
          placeholder="Search by patient, doctor, reason, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((a) => {
                    const s = statusStyle(a.status);
                    return (
                      <tr key={a.id}>
                        <td style={styles.td}>{a.patient?.name}</td>
                        <td style={styles.td}>{a.doctor?.user?.name}</td>
                        <td style={styles.td}>{new Date(a.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{a.time}</td>
                        <td style={styles.td}>{a.reason || '-'}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.pill,
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
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
                    );
                  })
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
            <p style={{ color: '#64748b' }}>Are you sure you want to delete this appointment?</p>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
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
  completeBtn: {
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  cancelStatusBtn: {
    background: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 950 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#fff7ed',
    fontSize: 12,
    color: '#c2410c',
    borderBottom: '1px solid #ffedd5',
    fontWeight: 700,
  },
  td: { padding: '12px 14px', borderBottom: '1px solid #f8fafc', fontSize: 14, color: '#0f172a' },
  pill: { padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600 },
  error: { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: 12, borderRadius: 10, marginBottom: 14 },
  success: { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: 12, borderRadius: 10, marginBottom: 14 },
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

export default Appointments;