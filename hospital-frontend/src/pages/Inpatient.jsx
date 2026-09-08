import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Inpatient() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('admissions');
  const [doctors, setDoctors] = useState([]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Inpatient</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('admissions')} style={tab === 'admissions' ? styles.activeTab : styles.tab}>Admissions</button>
          <button onClick={() => setTab('beds')} style={tab === 'beds' ? styles.activeTab : styles.tab}>Beds</button>
          <button onClick={() => setTab('wards')} style={tab === 'wards' ? styles.activeTab : styles.tab}>Wards</button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* ========== ADMISSIONS TAB ========== */}
      {tab === 'admissions' && (
        <>
          <div style={{ marginBottom: 16 }}>
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
            <form onSubmit={handleAdmitOrUpdate} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Admission' : 'Admit Patient'}</h3>
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
                  {/* Show current bed when editing */}
                  {editingId && admitForm.bedId && (
                    <option value={admitForm.bedId}>Current Bed</option>
                  )}
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

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={styles.tableWrapper}>
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
                      <td colSpan="7" style={{ padding: 20, textAlign: 'center' }}>No admissions</td>
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
                            ...styles.badge,
                            background: a.status === 'ADMITTED' ? '#dbeafe' : '#dcfce7',
                            color: a.status === 'ADMITTED' ? '#1d4ed8' : '#16a34a',
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
        </>
      )}

      {/* ========== BEDS TAB ========== */}
      {tab === 'beds' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowBedForm(!showBedForm)} style={styles.primaryBtn}>
              {showBedForm ? 'Cancel' : '+ Add Bed'}
            </button>
          </div>

          {showBedForm && (
            <form onSubmit={handleCreateBed} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>Add Bed</h3>
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

          <div style={styles.tableWrapper}>
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
                        ...styles.badge,
                        background: b.status === 'AVAILABLE' ? '#dcfce7' : '#fee2e2',
                        color: b.status === 'AVAILABLE' ? '#16a34a' : '#dc2626',
                      }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== WARDS TAB ========== */}
      {tab === 'wards' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowWardForm(!showWardForm)} style={styles.primaryBtn}>
              {showWardForm ? 'Cancel' : '+ Add Ward'}
            </button>
          </div>

          {showWardForm && (
            <form onSubmit={handleCreateWard} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>Add Ward</h3>
              <div style={styles.formGrid}>
                <input placeholder="Ward Name *" value={wardForm.name} onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} required style={styles.input} />
                <input type="number" placeholder="Total Beds" value={wardForm.totalBeds} onChange={(e) => setWardForm({ ...wardForm, totalBeds: e.target.value })} style={styles.input} />
                <input placeholder="Description" value={wardForm.description} onChange={(e) => setWardForm({ ...wardForm, description: e.target.value })} style={{ ...styles.input, gridColumn: '1 / -1' }} />
              </div>
              <button type="submit" style={styles.primaryBtn}>Save Ward</button>
            </form>
          )}

          <div style={styles.tableWrapper}>
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
        </>
      )}

      {/* Delete Confirmation Popup */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this admission? The bed will be freed.</p>
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
  dischargeBtn: {
    background: '#10b981',
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
  tab: {
    background: '#e2e8f0',
    color: '#334155',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  activeTab: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
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

export default Inpatient;