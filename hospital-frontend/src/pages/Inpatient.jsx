import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Inpatient() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('admissions');

  const [showWardForm, setShowWardForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [wardForm, setWardForm] = useState({ name: '', description: '', totalBeds: '' });
  const [bedForm, setBedForm] = useState({ wardId: '', bedNumber: '' });
  const [admitForm, setAdmitForm] = useState({
    patientId: '',
    bedId: '',
    admittedBy: '',
    reason: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [wardRes, bedRes, admRes, patRes, docRes] = await Promise.all([
        api.get('/inpatient/wards'),
        api.get('/inpatient/beds'),
        api.get('/inpatient/admissions'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setWards(wardRes.data);
      setBeds(bedRes.data);
      setAdmissions(admRes.data);
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

  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE');

  const resetAdmitForm = () => {
    setAdmitForm({
      patientId: '',
      bedId: '',
      admittedBy: '',
      reason: '',
      notes: '',
    });
    setEditingId(null);
    setShowAdmitForm(false);
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/inpatient/wards', {
        ...wardForm,
        totalBeds: parseInt(wardForm.totalBeds) || 0,
      });
      setSuccess('Ward created');
      setWardForm({ name: '', description: '', totalBeds: '' });
      setShowWardForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ward');
    }
  };

  const handleCreateBed = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/inpatient/beds', bedForm);
      setSuccess('Bed created');
      setBedForm({ wardId: '', bedNumber: '' });
      setShowBedForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bed');
    }
  };

  const handleEdit = (admission) => {
    setAdmitForm({
      patientId: admission.patientId || '',
      bedId: admission.bedId || '',
      admittedBy: admission.admittedBy || '',
      reason: admission.reason || '',
      notes: admission.notes || '',
    });
    setEditingId(admission.id);
    setShowAdmitForm(true);
    setError('');
    setSuccess('');
  };

  const handleAdmitOrUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/inpatient/admissions/${editingId}`, {
          admittedBy: admitForm.admittedBy,
          reason: admitForm.reason,
          notes: admitForm.notes,
        });
        setSuccess('Admission updated successfully');
      } else {
        await api.post('/inpatient/admissions', admitForm);
        setSuccess('Patient admitted successfully');
      }
      resetAdmitForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save admission');
    }
  };

  const handleDischarge = async (id) => {
    try {
      await api.put(`/inpatient/admissions/${id}/discharge`);
      setSuccess('Patient discharged');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to discharge');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/inpatient/admissions/${deleteId}`);
      setSuccess('Admission deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admission');
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Inpatient</h1>
          <p style={styles.subtitle}>Manage wards, beds and patient admissions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('admissions')} style={tab === 'admissions' ? styles.activeTab : styles.tab}>Admissions</button>
          <button onClick={() => setTab('beds')} style={tab === 'beds' ? styles.activeTab : styles.tab}>Beds</button>
          <button onClick={() => setTab('wards')} style={tab === 'wards' ? styles.activeTab : styles.tab}>Wards</button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {tab === 'admissions' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button
              onClick={() => {
                if (showAdmitForm) resetAdmitForm();
                else {
                  setShowAdmitForm(true);
                  setEditingId(null);
                }
              }}
              style={styles.primaryBtn}
            >
              {showAdmitForm ? 'Cancel' : '+ Admit Patient'}
            </button>
          </div>

          {showAdmitForm && (
            <form onSubmit={handleAdmitOrUpdate} style={styles.card}>
              <h3 style={styles.cardTitle}>{editingId ? 'Edit Admission' : 'Admit Patient'}</h3>
              <div style={styles.formGrid}>
                <select
                  value={admitForm.patientId}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                  required
                  style={styles.input}
                  disabled={!!editingId}
                >
                  <option value="">Select Patient *</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={admitForm.bedId}
                  onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                  required
                  style={styles.input}
                  disabled={!!editingId}
                >
                  <option value="">Select Available Bed *</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} ({b.ward?.name})
                    </option>
                  ))}
                </select>

                <select
                  value={admitForm.admittedBy}
                  onChange={(e) => setAdmitForm({ ...admitForm, admittedBy: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.user?.name}>
                      {d.user?.name} - {d.specialization}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Reason"
                  value={admitForm.reason}
                  onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                  style={styles.input}
                />

                <input
                  placeholder="Notes"
                  value={admitForm.notes}
                  onChange={(e) => setAdmitForm({ ...admitForm, notes: e.target.value })}
                  style={{ ...styles.input, gridColumn: '1 / -1' }}
                />
              </div>
              <button type="submit" style={styles.primaryBtn}>
                {editingId ? 'Update Admission' : 'Admit'}
              </button>
            </form>
          )}

          <div style={styles.card}>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Bed</th>
                      <th style={styles.th}>Ward</th>
                      <th style={styles.th}>Reason</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Admitted</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                          No admissions
                        </td>
                      </tr>
                    ) : (
                      admissions.map((a) => (
                        <tr key={a.id}>
                          <td style={styles.td}>{a.patient?.name}</td>
                          <td style={styles.td}>{a.bed?.bedNumber}</td>
                          <td style={styles.td}>{a.bed?.ward?.name}</td>
                          <td style={styles.td}>{a.reason || '-'}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.pill,
                              background: a.status === 'ADMITTED' ? '#e0f2fe' : '#dcfce7',
                              color: a.status === 'ADMITTED' ? '#0369a1' : '#15803d',
                              border: a.status === 'ADMITTED' ? '1px solid #bae6fd' : '1px solid #bbf7d0',
                            }}>
                              {a.status}
                            </span>
                          </td>
                          <td style={styles.td}>{new Date(a.admissionDate).toLocaleDateString()}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button onClick={() => handleEdit(a)} style={styles.editBtn}>Edit</button>
                              {a.status === 'ADMITTED' && (
                                <button onClick={() => handleDischarge(a.id)} style={styles.dischargeBtn}>
                                  Discharge
                                </button>
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
          </div>
        </>
      )}

      {tab === 'beds' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => setShowBedForm(!showBedForm)} style={styles.primaryBtn}>
              {showBedForm ? 'Cancel' : '+ Add Bed'}
            </button>
          </div>

          {showBedForm && (
            <form onSubmit={handleCreateBed} style={styles.card}>
              <h3 style={styles.cardTitle}>Add Bed</h3>
              <div style={styles.formGrid}>
                <select value={bedForm.wardId} onChange={(e) => setBedForm({ ...bedForm, wardId: e.target.value })} required style={styles.input}>
                  <option value="">Select Ward *</option>
                  {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <input placeholder="Bed Number (e.g. A-01) *" value={bedForm.bedNumber} onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} required style={styles.input} />
              </div>
              <button type="submit" style={styles.primaryBtn}>Save Bed</button>
            </form>
          )}

          <div style={styles.card}>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Bed Number</th>
                    <th style={styles.th}>Ward</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {beds.map((b) => (
                    <tr key={b.id}>
                      <td style={styles.td}>{b.bedNumber}</td>
                      <td style={styles.td}>{b.ward?.name}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.pill,
                          background: b.status === 'AVAILABLE' ? '#dcfce7' : '#fee2e2',
                          color: b.status === 'AVAILABLE' ? '#15803d' : '#dc2626',
                          border: b.status === 'AVAILABLE' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'wards' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => setShowWardForm(!showWardForm)} style={styles.primaryBtn}>
              {showWardForm ? 'Cancel' : '+ Add Ward'}
            </button>
          </div>

          {showWardForm && (
            <form onSubmit={handleCreateWard} style={styles.card}>
              <h3 style={styles.cardTitle}>Add Ward</h3>
              <div style={styles.formGrid}>
                <input placeholder="Ward Name *" value={wardForm.name} onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} required style={styles.input} />
                <input type="number" placeholder="Total Beds" value={wardForm.totalBeds} onChange={(e) => setWardForm({ ...wardForm, totalBeds: e.target.value })} style={styles.input} />
                <input placeholder="Description" value={wardForm.description} onChange={(e) => setWardForm({ ...wardForm, description: e.target.value })} style={{ ...styles.input, gridColumn: '1 / -1' }} />
              </div>
              <button type="submit" style={styles.primaryBtn}>Save Ward</button>
            </form>
          )}

          <div style={styles.card}>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Total Beds</th>
                  </tr>
                </thead>
                <tbody>
                  {wards.map((w) => (
                    <tr key={w.id}>
                      <td style={styles.td}>{w.name}</td>
                      <td style={styles.td}>{w.description || '-'}</td>
                      <td style={styles.td}>{w.totalBeds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p style={{ color: '#64748b' }}>Are you sure you want to delete this admission? The bed will be freed.</p>
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
  dischargeBtn: {
    background: '#dcfce7',
    color: '#15803d',
    border: '1px solid #bbf7d0',
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
  tab: {
    background: '#e0f2fe',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    padding: '8px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  },
  activeTab: {
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
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
    padding: '4px 8px',
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

export default Inpatient;