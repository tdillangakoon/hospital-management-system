import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

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
      setAppointments(appRes.data.filter((a) => a.status !== 'CANCELLED'));
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
      appointmentId: '',
      diagnosis: '',
      prescription: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (record) => {
    setForm({
      patientId: record.patientId || '',
      appointmentId: record.appointmentId || '',
      diagnosis: record.diagnosis || '',
      prescription: record.prescription || '',
      notes: record.notes || '',
    });
    setEditingId(record.id);
    setShowForm(true);
    setError('');
    setSuccess('');
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

      if (editingId) {
        await api.put(`/medical-records/${editingId}`, payload);
        setSuccess('Medical record updated successfully');
      } else {
        await api.post('/medical-records', payload);
        setSuccess('Medical record created successfully');
      }

      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical record');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/medical-records/${deleteId}`);
      setSuccess('Medical record deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medical record');
      setDeleteId(null);
    }
  };

  const filteredAppointments = form.patientId
    ? appointments.filter((a) => a.patientId === form.patientId)
    : appointments;

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Medical Records</h1>
          <p style={styles.subtitle}>Create and manage patient medical history</p>
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
          {showForm ? 'Cancel' : '+ Add Record'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId ? 'Edit Medical Record' : 'Add Medical Record'}</h3>
          <div style={styles.formGrid}>
            <select name="patientId" value={form.patientId} onChange={handleChange} required style={styles.input}>
              <option value="">Select Patient *</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>

            <select name="appointmentId" value={form.appointmentId} onChange={handleChange} style={styles.input}>
              <option value="">Select Appointment (optional)</option>
              {filteredAppointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.patient?.name} - {new Date(a.date).toLocaleDateString()} {a.time} ({a.status})
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
              style={{ ...styles.input, gridColumn: '1 / -1', resize: 'vertical' }}
            />

            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              style={{ ...styles.input, gridColumn: '1 / -1', resize: 'vertical' }}
            />
          </div>

          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Record' : 'Save Record'}
          </button>
        </form>
      )}

      <div style={styles.card}>
        {loading ? (
          <p>Loading medical records...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Diagnosis</th>
                  <th style={styles.th}>Prescription</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      No medical records found
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>{r.patient?.name}</td>
                      <td style={styles.td}>{r.diagnosis || '-'}</td>
                      <td style={styles.td}>{r.prescription || '-'}</td>
                      <td style={styles.td}>{r.notes || '-'}</td>
                      <td style={styles.td}>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleEdit(r)} style={styles.editBtn}>Edit</button>
                          <button onClick={() => setDeleteId(r.id)} style={styles.deleteBtn}>Delete</button>
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
            <p style={{ color: '#64748b' }}>Are you sure you want to delete this medical record?</p>
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
  input: {
    padding: '11px 12px',
    border: '1px solid #dbeafe',
    borderRadius: 10,
    fontSize: 14,
    background: 'rgba(255,255,255,0.95)',
    outline: 'none',
    fontFamily: 'inherit',
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

export default MedicalRecords;