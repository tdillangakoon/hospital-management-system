import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [recRes, patRes, appRes] = await Promise.all([
        api.get('/medical-records'),
        api.get('/patients'),
        api.get('/appointments'),
      ]);
      setRecords(recRes.data);
      setPatients(patRes.data);
      setAppointments(appRes.data);
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
      const payload = {
        ...form,
        appointmentId: form.appointmentId || null,
      };
      await api.post('/medical-records', payload);
      setSuccess('Medical record created successfully');
      setForm({
        patientId: '',
        appointmentId: '',
        diagnosis: '',
        prescription: '',
        notes: '',
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create medical record');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Medical Records</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.primaryBtn}>
          {showForm ? 'Cancel' : '+ Add Record'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>Add Medical Record</h3>
          <div style={styles.formGrid}>
            <select name="patientId" value={form.patientId} onChange={handleChange} required style={styles.input}>
              <option value="">Select Patient *</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select name="appointmentId" value={form.appointmentId} onChange={handleChange} style={styles.input}>
              <option value="">Select Appointment (optional)</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.patient?.name} - {new Date(a.date).toLocaleDateString()} {a.time}
                </option>
              ))}
            </select>

            <input
              name="diagnosis"
              placeholder="Diagnosis *"
              value={form.diagnosis}
              onChange={handleChange}
              required
              style={{ ...styles.input, gridColumn: '1 / -1' }}
            />
            <textarea
              name="prescription"
              placeholder="Prescription"
              value={form.prescription}
              onChange={handleChange}
              rows={3}
              style={{ ...styles.input, gridColumn: '1 / -1' }}
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              style={{ ...styles.input, gridColumn: '1 / -1' }}
            />
          </div>
          <button type="submit" style={styles.primaryBtn}>Save Record</button>
        </form>
      )}

      {loading ? (
        <p>Loading medical records...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Diagnosis</th>
                <th style={styles.th}>Prescription</th>
                <th style={styles.th}>Notes</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 20, textAlign: 'center' }}>No medical records found</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td style={styles.td}>{r.patient?.name}</td>
                    <td style={styles.td}>{r.diagnosis || '-'}</td>
                    <td style={styles.td}>{r.prescription || '-'}</td>
                    <td style={styles.td}>{r.notes || '-'}</td>
                    <td style={styles.td}>{new Date(r.createdAt).toLocaleDateString()}</td>
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
    fontFamily: 'inherit',
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

export default MedicalRecords;