import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [dispenses, setDispenses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);   // ← must be inside the function
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('medicines');
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [showDispenseForm, setShowDispenseForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    category: '',
    unit: 'Tablet',
    price: '',
    stockQuantity: '',
    expiryDate: '',
    manufacturer: '',
  });

  const [dispenseForm, setDispenseForm] = useState({
    medicineId: '',
    patientId: '',
    quantity: '',
    prescribedBy: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [medRes, disRes, patRes, docRes] = await Promise.all([
        api.get('/pharmacy/medicines'),
        api.get('/pharmacy/dispenses'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setMedicines(medRes.data);
      setDispenses(disRes.data);
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

  const resetMedicineForm = () => {
    setMedicineForm({
      name: '',
      genericName: '',
      category: '',
      unit: 'Tablet',
      price: '',
      stockQuantity: '',
      expiryDate: '',
      manufacturer: '',
    });
    setEditingId(null);
    setShowMedicineForm(false);
  };

  const handleEdit = (medicine) => {
    setMedicineForm({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      category: medicine.category || '',
      unit: medicine.unit || 'Tablet',
      price: medicine.price || '',
      stockQuantity: medicine.stockQuantity || '',
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
      manufacturer: medicine.manufacturer || '',
    });
    setEditingId(medicine.id);
    setShowMedicineForm(true);
    setError('');
    setSuccess('');
  };

  const handleCreateOrUpdateMedicine = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...medicineForm,
        price: parseFloat(medicineForm.price),
        stockQuantity: parseInt(medicineForm.stockQuantity),
      };

      if (editingId) {
        await api.put(`/pharmacy/medicines/${editingId}`, payload);
        setSuccess('Medicine updated successfully');
      } else {
        await api.post('/pharmacy/medicines', payload);
        setSuccess('Medicine added successfully');
      }

      resetMedicineForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/pharmacy/medicines/${deleteId}`);
      setSuccess('Medicine deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medicine');
      setDeleteId(null);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/pharmacy/dispense', {
        ...dispenseForm,
        quantity: parseInt(dispenseForm.quantity),
      });
      setSuccess('Medicine dispensed successfully');
      setDispenseForm({
        medicineId: '',
        patientId: '',
        quantity: '',
        prescribedBy: '',
        notes: '',
      });
      setShowDispenseForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispense medicine');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Pharmacy</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTab('medicines')} style={tab === 'medicines' ? styles.activeTab : styles.tab}>
            Medicines
          </button>
          <button onClick={() => setTab('dispenses')} style={tab === 'dispenses' ? styles.activeTab : styles.tab}>
            Dispenses
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* ========== MEDICINES TAB ========== */}
      {tab === 'medicines' && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                if (showMedicineForm) resetMedicineForm();
                else {
                  setShowMedicineForm(true);
                  setEditingId(null);
                }
              }}
              style={styles.primaryBtn}
            >
              {showMedicineForm ? 'Cancel' : '+ Add Medicine'}
            </button>
            <button onClick={() => setShowDispenseForm(!showDispenseForm)} style={styles.secondaryBtn}>
              {showDispenseForm ? 'Cancel' : 'Dispense Medicine'}
            </button>
          </div>

          {showMedicineForm && (
            <form onSubmit={handleCreateOrUpdateMedicine} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Medicine' : 'Add Medicine'}</h3>
              <div style={styles.formGrid}>
                <input placeholder="Medicine Name *" value={medicineForm.name} onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })} required style={styles.input} />
                <input placeholder="Generic Name" value={medicineForm.genericName} onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })} style={styles.input} />
                <input placeholder="Category" value={medicineForm.category} onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })} style={styles.input} />
                <select value={medicineForm.unit} onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })} style={styles.input}>
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Injection">Injection</option>
                  <option value="Bottle">Bottle</option>
                </select>
                <input type="number" placeholder="Price *" value={medicineForm.price} onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })} required style={styles.input} />
                <input type="number" placeholder="Stock Quantity *" value={medicineForm.stockQuantity} onChange={(e) => setMedicineForm({ ...medicineForm, stockQuantity: e.target.value })} required style={styles.input} />
                <input type="date" value={medicineForm.expiryDate} onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })} style={styles.input} />
                <input placeholder="Manufacturer" value={medicineForm.manufacturer} onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })} style={styles.input} />
              </div>
              <button type="submit" style={styles.primaryBtn}>
                {editingId ? 'Update Medicine' : 'Save Medicine'}
              </button>
            </form>
          )}

          {showDispenseForm && (
            <form onSubmit={handleDispense} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>Dispense Medicine</h3>
              <div style={styles.formGrid}>
                <select value={dispenseForm.medicineId} onChange={(e) => setDispenseForm({ ...dispenseForm, medicineId: e.target.value })} required style={styles.input}>
                  <option value="">Select Medicine *</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Stock: {m.stockQuantity})
                    </option>
                  ))}
                </select>
                <select value={dispenseForm.patientId} onChange={(e) => setDispenseForm({ ...dispenseForm, patientId: e.target.value })} required style={styles.input}>
                  <option value="">Select Patient *</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input type="number" placeholder="Quantity *" value={dispenseForm.quantity} onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: e.target.value })} required style={styles.input} />
                <select value={dispenseForm.prescribedBy} onChange={(e) => setDispenseForm({ ...dispenseForm, prescribedBy: e.target.value })} style={styles.input}> <option value="">Select Doctor</option> {doctors.map((d) => ( <option key={d.id} value={d.user?.name}>{d.user?.name} - {d.specialization}</option>))}</select>
                <input placeholder="Notes" value={dispenseForm.notes} onChange={(e) => setDispenseForm({ ...dispenseForm, notes: e.target.value })} style={{ ...styles.input, gridColumn: '1 / -1' }} />
              </div>
              <button type="submit" style={styles.primaryBtn}>Dispense</button>
            </form>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Unit</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Expiry</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: 20, textAlign: 'center' }}>No medicines found</td>
                    </tr>
                  ) : (
                    medicines.map((m) => (
                      <tr key={m.id}>
                        <td style={styles.td}>{m.name}</td>
                        <td style={styles.td}>{m.category || '-'}</td>
                        <td style={styles.td}>{m.unit}</td>
                        <td style={styles.td}>Rs. {m.price}</td>
                        <td style={styles.td}>
                          <span style={{ color: m.stockQuantity < 20 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                            {m.stockQuantity}
                          </span>
                        </td>
                        <td style={styles.td}>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '-'}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleEdit(m)} style={styles.editBtn}>Edit</button>
                            <button onClick={() => setDeleteId(m.id)} style={styles.deleteBtn}>Delete</button>
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

      {/* ========== DISPENSES TAB ========== */}
      {tab === 'dispenses' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Medicine</th>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Total Price</th>
                <th style={styles.th}>Prescribed By</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {dispenses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>No dispenses found</td>
                </tr>
              ) : (
                dispenses.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.medicine?.name}</td>
                    <td style={styles.td}>{d.patient?.name}</td>
                    <td style={styles.td}>{d.quantity}</td>
                    <td style={styles.td}>Rs. {d.totalPrice}</td>
                    <td style={styles.td}>{d.prescribedBy || '-'}</td>
                    <td style={styles.td}>{new Date(d.dispensedAt).toLocaleDateString()}</td>
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
            <p>Are you sure you want to delete this medicine?</p>
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
  secondaryBtn: {
    background: '#10b981',
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
  tab: {
    background: '#e2e8f0',
    color: '#334155',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  activeTab: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
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

export default Pharmacy;