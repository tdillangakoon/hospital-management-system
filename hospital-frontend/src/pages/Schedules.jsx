import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    doctorId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const fetchData = async () => {
  try {
    const docRes = await api.get('/doctors');
    setDoctors(docRes.data || []);
  } catch (err) {
    console.error('Doctors load failed', err);
    setError(err.response?.data?.message || 'Failed to load doctors');
  }

  try {
    const schRes = await api.get('/schedules');
    setSchedules(schRes.data || []);
  } catch (err) {
    console.error('Schedules load failed', err);
  }
};

useEffect(() => {
  fetchData();
}, []);

  const resetForm = () => {
    setForm({
      doctorId: '',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/schedules/${editingId}`, form);
        setSuccess('Schedule updated');
      } else {
        await api.post('/schedules', form);
        setSuccess('Schedule created');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (s) => {
    setForm({
      doctorId: s.doctorId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isAvailable: s.isAvailable,
    });
    setEditingId(s.id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/schedules/${deleteId}`);
      setSuccess('Schedule deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
      setDeleteId(null);
    }
  };

  const filtered = schedules.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.doctor?.user?.name?.toLowerCase().includes(q) ||
      s.dayOfWeek?.toLowerCase().includes(q) ||
      s.startTime?.includes(q) ||
      s.endTime?.includes(q)
    );
  });

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Doctor Schedules</h1>
          <p style={styles.subtitle}>Manage doctor availability by day</p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.card}>
        <h3 style={styles.cardTitle}>{editingId ? 'Edit Schedule' : 'Add Schedule'}</h3>
        <div style={styles.formGrid}>
          <select
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            required
            style={styles.input}
            disabled={!!editingId}
          >
            <option value="">Select Doctor *</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user?.name} - {d.specialization}
              </option>
            ))}
          </select>

          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            style={styles.input}
          >
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
            style={styles.input}
          />

          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
            style={styles.input}
          />

          <select
            value={form.isAvailable ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, isAvailable: e.target.value === 'true' })}
            style={styles.input}
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Schedule' : 'Save Schedule'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={styles.cancelBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={styles.card}>
        <input
          placeholder="Search schedules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Doctor</th>
                <th style={styles.th}>Day</th>
                <th style={styles.th}>Start</th>
                <th style={styles.th}>End</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                    No schedules found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.doctor?.user?.name}</td>
                    <td style={styles.td}>{s.dayOfWeek}</td>
                    <td style={styles.td}>{s.startTime}</td>
                    <td style={styles.td}>{s.endTime}</td>
                    <td style={styles.td}>{s.isAvailable ? 'Available' : 'Unavailable'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(s)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => setDeleteId(s.id)} style={styles.deleteBtn}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p style={{ color: '#64748b' }}>Delete this schedule?</p>
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
  header: { marginBottom: 20 },
  title: { margin: 0, fontSize: 28, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  primaryBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
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
    background: '#fff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: { marginTop: 0, marginBottom: 14 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  input: {
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 800 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#fff7ed',
    fontSize: 12,
    color: '#c2410c',
    borderBottom: '1px solid #ffedd5',
  },
  td: { padding: '12px 14px', borderBottom: '1px solid #f8fafc', fontSize: 14 },
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
  },
};

export default Schedules;