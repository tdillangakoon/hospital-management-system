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

  const [form, setForm] = useState({
    patientId: '',
    serviceType: '',
    labTestId: '',
    customDescription: '',
    customAmount: '',
  });

  const [selectedItems, setSelectedItems] = useState([]); // list of selected services
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

    // Prevent duplicates
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
        // Backend currently doesn't have full bill update with items,
        // so we update amount + description
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
    // We can't perfectly restore items, so we put the whole bill as one custom item
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

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Billing</h1>
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
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Bill' : 'Create New Bill'}</h3>

          <div style={{ marginBottom: 16 }}>
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

          {/* Add Consultation / Fixed Service */}
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
            <button type="button" onClick={addFixedService} style={styles.addBtn}>
              Add
            </button>
          </div>

          {/* Add Lab Test */}
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
            <button type="button" onClick={addLabTest} style={styles.addBtn}>
              Add
            </button>
          </div>

          {/* Custom charge */}
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
            <button type="button" onClick={addCustom} style={styles.addBtn}>
              Add
            </button>
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div style={styles.selectedBox}>
              <h4 style={{ marginTop: 0 }}>Selected Items</h4>
              {selectedItems.map((item) => (
                <div key={item.id} style={styles.selectedItem}>
                  <span>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 600 }}>Rs. {item.price.toLocaleString()}</span>
                    <button type="button" onClick={() => removeItem(item.id)} style={styles.removeBtn}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div style={styles.totalLine}>
                <strong>Total:</strong>
                <strong style={{ color: '#4f46e5', fontSize: 18 }}>
                  Rs. {totalAmount.toLocaleString()}
                </strong>
              </div>
            </div>
          )}

          <button type="submit" style={{ ...styles.primaryBtn, marginTop: 16 }}>
            {editingId ? 'Update Bill' : `Create Bill (Rs. ${totalAmount.toLocaleString()})`}
          </button>
        </form>
      )}

      {/* Payment Form */}
      {showPayment && (
        <form onSubmit={handlePayment} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>Record Payment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
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
            <button type="button" onClick={() => setShowPayment(null)} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Bills Table */}
      {loading ? (
        <p>Loading bills...</p>
      ) : (
        <div style={styles.tableWrapper}>
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
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>
                    No bills found
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.id}>
                    <td style={styles.td}>{b.patient?.name}</td>
                    <td style={styles.td}>{b.description || '-'}</td>
                    <td style={styles.td}>Rs. {b.amount.toLocaleString()}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            b.status === 'PAID'
                              ? '#dcfce7'
                              : b.status === 'PARTIAL'
                              ? '#fef9c3'
                              : '#fee2e2',
                          color:
                            b.status === 'PAID'
                              ? '#16a34a'
                              : b.status === 'PARTIAL'
                              ? '#ca8a04'
                              : '#dc2626',
                        }}
                      >
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
                        <button onClick={() => handleEdit(b)} style={styles.editBtn}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(b.id)} style={styles.deleteBtn}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this bill?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setDeleteId(null)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={styles.deleteBtn}>
                Yes, Delete
              </button>
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
  addBtn: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    whiteSpace: 'nowrap',
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
  payBtn: {
    background: '#10b981',
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
  removeBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    padding: '4px 8px',
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
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
  },
  addRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedBox: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  selectedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
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

export default Bills;