import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Bills() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(null); // bill id
  const [form, setForm] = useState({
    patientId: '',
    amount: '',
    description: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'Cash',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [billRes, patRes] = await Promise.all([
        api.get('/bills'),
        api.get('/patients'),
      ]);
      setBills(billRes.data);
      setPatients(patRes.data);
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

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/bills', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess('Bill created successfully');
      setForm({ patientId: '', amount: '', description: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bill');
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
        <button onClick={() => setShowForm(!showForm)} style={styles.primaryBtn}>
          {showForm ? 'Cancel' : '+ Create Bill'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>Create New Bill</h3>
          <div style={styles.formGrid}>
            <select name="patientId" value={form.patientId} onChange={handleChange} required style={styles.input}>
              <option value="">Select Patient *</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              name="amount"
              type="number"
              placeholder="Amount *"
              value={form.amount}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              style={{ ...styles.input, gridColumn: '1 / -1' }}
            />
          </div>
          <button type="submit" style={styles.primaryBtn}>Create Bill</button>
        </form>
      )}

      {showPayment && (
        <form onSubmit={handlePayment} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>Record Payment</h3>
          <div style={styles.formGrid}>
            <input
              name="amount"
              type="number"
              placeholder="Payment Amount *"
              value={paymentForm.amount}
              onChange={handlePaymentChange}
              required
              style={styles.input}
            />
            <select name="method" value={paymentForm.method} onChange={handlePaymentChange} style={styles.input}>
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
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>No bills found</td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.id}>
                    <td style={styles.td}>{b.patient?.name}</td>
                    <td style={styles.td}>{b.description || '-'}</td>
                    <td style={styles.td}>Rs. {b.amount.toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: b.status === 'PAID' ? '#dcfce7' : b.status === 'PARTIAL' ? '#fef9c3' : '#fee2e2',
                        color: b.status === 'PAID' ? '#16a34a' : b.status === 'PARTIAL' ? '#ca8a04' : '#dc2626',
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      {b.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setShowPayment(b.id);
                            setPaymentForm({ amount: b.amount, method: 'Cash' });
                          }}
                          style={styles.smallBtn}
                        >
                          Pay
                        </button>
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
  cancelBtn: {
    background: '#94a3b8',
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
    padding: '5px 12px',
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

export default Bills;