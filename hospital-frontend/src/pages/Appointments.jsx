import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/appointments', form);
      setSuccess('Appointment booked successfully');
      setForm({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        reason: '',
        notes: '',
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Appointments</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.primaryBtn}>
          {showForm ? 'Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>Book New Appointment</h3>
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
            <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} style={styles.input} />
          </div>
          <button type="submit" style={styles.primaryBtn}>Book Appointment</button>
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
                      {a.status === 'SCHEDULED' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => updateStatus(a.id, 'COMPLETED')} style={styles.smallBtn}>Complete</button>
                          <button onClick={() => updateStatus(a.id, 'CANCELLED')} style={{ ...styles.smallBtn, background: '#ef4444' }}>Cancel</button>
                        </div>
                      )}
                    </td>
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
  smallBtn: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
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
};

export default Appointments;