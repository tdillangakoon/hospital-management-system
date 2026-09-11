import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Bills() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    patientId: '',
    serviceType: '',
    labTestId: '',
    customDescription: '',
    customAmount: '',
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fixedServices = [
    { id: 'consultation', name: 'Consultation', price: 1500 },
    { id: 'followup', name: 'Follow-up Consultation', price: 1000 },
    { id: 'emergency', name: 'Emergency Consultation', price: 3000 },
    { id: 'ecg', name: 'ECG', price: 1200 },
    { id: 'xray', name: 'X-Ray', price: 2000 },
  ];

  const fetchData = async () => {
    try {
      const [billRes, patRes, testRes] = await Promise.all([
        api.get('/bills'),
        api.get('/patients'),
        api.get('/lab/tests'),
      ]);
      setBills(billRes.data);
      setPatients(patRes.data);
      setLabTests(testRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const resetForm = () => {
    setForm({
      patientId: '',
      serviceType: '',
      labTestId: '',
      customDescription: '',
      customAmount: '',
    });
    setSelectedItems([]);
    setEditingId(null);
    setShowForm(false);
  };

  const addFixedService = () => {
    if (!form.serviceType) return;
    const service = fixedServices.find((s) => s.id === form.serviceType);
    if (!service) return;
    if (selectedItems.find((i) => i.id === service.id)) {
      setError('This service is already added');
      return;
    }
    setSelectedItems([...selectedItems, service]);
    setForm({ ...form, serviceType: '' });
    setError('');
  };

  const addLabTest = () => {
    if (!form.labTestId) return;
    const test = labTests.find((t) => t.id === form.labTestId);
    if (!test) return;
    if (selectedItems.find((i) => i.id === test.id)) {
      setError('This lab test is already added');
      return;
    }
    setSelectedItems([...selectedItems, { id: test.id, name: test.name, price: test.price }]);
    setForm({ ...form, labTestId: '' });
    setError('');
  };

  const addCustom = () => {
    if (!form.customAmount || parseFloat(form.customAmount) <= 0) {
      setError('Enter a valid custom amount');
      return;
    }
    setSelectedItems([
      ...selectedItems,
      {
        id: `custom-${Date.now()}`,
        name: form.customDescription || 'Custom Charge',
        price: parseFloat(form.customAmount),
      },
    ]);
    setForm({ ...form, customDescription: '', customAmount: '' });
    setError('');
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.patientId) {
      setError('Please select a patient');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Please add at least one service');
      return;
    }

    const description = selectedItems.map((i) => i.name).join(' + ');

    try {
      if (editingId) {
        await api.put(`/bills/${editingId}`, {
          amount: totalAmount,
          description,
        });
        setSuccess('Bill updated successfully');
      } else {
        await api.post('/bills', {
          patientId: form.patientId,
          amount: totalAmount,
          description,
        });
        setSuccess('Bill created successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bill');
    }
  };

  const handleEdit = (bill) => {
    setForm({
      patientId: bill.patientId,
      serviceType: '',
      labTestId: '',
      customDescription: '',
      customAmount: '',
    });
    setSelectedItems([
      {
        id: 'existing',
        name: bill.description || 'Existing Bill',
        price: bill.amount,
      },
    ]);
    setEditingId(bill.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/bills/${deleteId}`);
      setSuccess('Bill deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bill');
      setDeleteId(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post(`/bills/${showPayment}/payments`, {
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
      });
      setSuccess('Payment recorded successfully');
      setPaymentForm({ amount: '', method: 'Cash' });
      setShowPayment(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const statusStyle = (status) => {
    if (status === 'PAID') return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    if (status === 'PARTIAL') return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    return { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' };
  };

  const filteredBills = bills.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.patient?.name?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q) ||
      String(b.amount).includes(q)
    );
  });

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Billing</h1>
          <p style={styles.subtitle}>Create bills and record payments</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          style={styles.primaryBtn}
        >
          {showForm ? 'Cancel' : '+ Create Bill'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId ? 'Edit Bill' : 'Create New Bill'}</h3>

          <div style={{ marginBottom: 14 }}>
            <select
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              required
              style={styles.input}
              disabled={!!editingId}
            >
              <option value="">Select Patient *</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.addRow}>
            <select
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Consultation / Service</option>
              {fixedServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - Rs. {s.price}
                </option>
              ))}
            </select>
            <button type="button" onClick={addFixedService} style={styles.addBtn}>Add</button>
          </div>

          <div style={styles.addRow}>
            <select
              value={form.labTestId}
              onChange={(e) => setForm({ ...form, labTestId: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Lab Test</option>
              {labTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} - Rs. {t.price}
                </option>
              ))}
            </select>
            <button type="button" onClick={addLabTest} style={styles.addBtn}>Add</button>
          </div>

          <div style={styles.addRow}>
            <input
              type="number"
              placeholder="Custom Amount"
              value={form.customAmount}
              onChange={(e) => setForm({ ...form, customAmount: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Custom Description"
              value={form.customDescription}
              onChange={(e) => setForm({ ...form, customDescription: e.target.value })}
              style={styles.input}
            />
            <button type="button" onClick={addCustom} style={styles.addBtn}>Add</button>
          </div>

          {selectedItems.length > 0 && (
            <div style={styles.selectedBox}>
              <h4 style={{ marginTop: 0, marginBottom: 10 }}>Selected Items</h4>
              {selectedItems.map((item) => (
                <div key={item.id} style={styles.selectedItem}>
                  <span>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <strong>Rs. {item.price.toLocaleString()}</strong>
                    <button type="button" onClick={() => removeItem(item.id)} style={styles.removeBtn}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div style={styles.totalLine}>
                <strong>Total</strong>
                <strong style={{ color: '#ea580c', fontSize: 18 }}>
                  Rs. {totalAmount.toLocaleString()}
                </strong>
              </div>
            </div>
          )}

          <button type="submit" style={{ ...styles.primaryBtn, marginTop: 14 }}>
            {editingId ? 'Update Bill' : `Create Bill (Rs. ${totalAmount.toLocaleString()})`}
          </button>
        </form>
      )}

      {showPayment && (
        <form onSubmit={handlePayment} style={styles.card}>
          <h3 style={styles.cardTitle}>Record Payment</h3>
          <div style={styles.formGrid}>
            <input
              type="number"
              placeholder="Payment Amount *"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
              style={styles.input}
            />
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              style={styles.input}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={styles.primaryBtn}>Save Payment</button>
            <button type="button" onClick={() => setShowPayment(null)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.card}>
        <input
          type="text"
          placeholder="Search bills by patient, description, status, amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {loading ? (
          <p>Loading bills...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      No bills found
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => {
                    const s = statusStyle(b.status);
                    return (
                      <tr key={b.id}>
                        <td style={styles.td}>{b.patient?.name}</td>
                        <td style={styles.td}>{b.description || '-'}</td>
                        <td style={styles.td}>Rs. {b.amount.toLocaleString()}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.pill,
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                          }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {b.status !== 'PAID' && (
                              <button
                                onClick={() => {
                                  setShowPayment(b.id);
                                  setPaymentForm({ amount: b.amount, method: 'Cash' });
                                }}
                                style={styles.payBtn}
                              >
                                Pay
                              </button>
                            )}
                            <button onClick={() => handleEdit(b)} style={styles.editBtn}>Edit</button>
                            <button onClick={() => setDeleteId(b.id)} style={styles.deleteBtn}>Delete</button>
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
            <p style={{ color: '#64748b' }}>Are you sure you want to delete this bill?</p>
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
  addBtn: {
    background: 'linear-gradient(135deg, #12b886, #0ca678)',
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
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
  payBtn: {
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
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
  removeBtn: {
    background: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
    padding: '4px 8px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
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
  addRow: { display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' },
  input: {
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    background: '#fffdf9',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
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
  selectedBox: {
    background: '#fff7ed',
    border: '1px solid #ffedd5',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  selectedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #ffedd5',
  },
  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
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

export default Bills;