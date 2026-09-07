import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Laboratory() {
  const [tests, setTests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('requests'); // requests | tests
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(null); // request id

  const [requestForm, setRequestForm] = useState({
    patientId: '',
    doctorId: '',
    testId: '',
    notes: '',
  });

  const [testForm, setTestForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const [resultForm, setResultForm] = useState({
    result: '',
    remarks: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [testRes, reqRes, patRes, docRes] = await Promise.all([
        api.get('/lab/tests'),
        api.get('/lab/requests'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setTests(testRes.data);
      setRequests(reqRes.data);
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

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/lab/tests', {
        ...testForm,
        price: parseFloat(testForm.price),
      });
      setSuccess('Lab test created');
      setTestForm({ name: '', description: '', price: '', category: '' });
      setShowTestForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create test');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/lab/requests', requestForm);
      setSuccess('Lab request created');
      setRequestForm({ patientId: '', doctorId: '', testId: '', notes: '' });
      setShowRequestForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    }
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/lab/results', {
        labRequestId: showResultForm,
        ...resultForm,
      });
      setSuccess('Lab result added');
      setResultForm({ result: '', remarks: '' });
      setShowResultForm(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add result');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Laboratory</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTab('requests')} style={tab === 'requests' ? styles.activeTab : styles.tab}>
            Requests
          </button>
          <button onClick={() => setTab('tests')} style={tab === 'tests' ? styles.activeTab : styles.tab}>
            Tests
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* ========== REQUESTS TAB ========== */}
      {tab === 'requests' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowRequestForm(!showRequestForm)} style={styles.primaryBtn}>
              {showRequestForm ? 'Cancel' : '+ New Lab Request'}
            </button>
          </div>

          {showRequestForm && (
            <form onSubmit={handleCreateRequest} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>Create Lab Request</h3>
              <div style={styles.formGrid}>
                <select name="patientId" value={requestForm.patientId} onChange={(e) => setRequestForm({ ...requestForm, patientId: e.target.value })} required style={styles.input}>
                  <option value="">Select Patient *</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="doctorId" value={requestForm.doctorId} onChange={(e) => setRequestForm({ ...requestForm, doctorId: e.target.value })} style={styles.input}>
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.user?.name}</option>)}
                </select>
                <select name="testId" value={requestForm.testId} onChange={(e) => setRequestForm({ ...requestForm, testId: e.target.value })} required style={styles.input}>
                  <option value="">Select Test *</option>
                  {tests.map((t) => <option key={t.id} value={t.id}>{t.name} (Rs. {t.price})</option>)}
                </select>
                <input name="notes" placeholder="Notes" value={requestForm.notes} onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })} style={styles.input} />
              </div>
              <button type="submit" style={styles.primaryBtn}>Create Request</button>
            </form>
          )}

          {showResultForm && (
            <form onSubmit={handleAddResult} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>Add Lab Result</h3>
              <textarea
                placeholder="Result *"
                value={resultForm.result}
                onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                required
                rows={3}
                style={{ ...styles.input, width: '100%', marginBottom: 12 }}
              />
              <input
                placeholder="Remarks"
                value={resultForm.remarks}
                onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                style={{ ...styles.input, width: '100%', marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={styles.primaryBtn}>Save Result</button>
                <button type="button" onClick={() => setShowResultForm(null)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          )}

          {loading ? <p>Loading...</p> : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Test</th>
                    <th style={styles.th}>Doctor</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>No lab requests</td></tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.id}>
                        <td style={styles.td}>{r.patient?.name}</td>
                        <td style={styles.td}>{r.test?.name}</td>
                        <td style={styles.td}>{r.doctor?.user?.name || '-'}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: r.status === 'COMPLETED' ? '#dcfce7' : '#dbeafe',
                            color: r.status === 'COMPLETED' ? '#16a34a' : '#1d4ed8',
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(r.requestDate).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          {r.status !== 'COMPLETED' && (
                            <button onClick={() => setShowResultForm(r.id)} style={styles.smallBtn}>
                              Add Result
                            </button>
                          )}
                          {r.result && <span style={{ fontSize: 12, color: '#16a34a' }}>Result added</span>}
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

      {/* ========== TESTS TAB ========== */}
      {tab === 'tests' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowTestForm(!showTestForm)} style={styles.primaryBtn}>
              {showTestForm ? 'Cancel' : '+ Add Lab Test'}
            </button>
          </div>

          {showTestForm && (
            <form onSubmit={handleCreateTest} style={styles.form}>
              <h3 style={{ marginTop: 0 }}>Add Lab Test</h3>
              <div style={styles.formGrid}>
                <input placeholder="Test Name *" value={testForm.name} onChange={(e) => setTestForm({ ...testForm, name: e.target.value })} required style={styles.input} />
                <input placeholder="Category" value={testForm.category} onChange={(e) => setTestForm({ ...testForm, category: e.target.value })} style={styles.input} />
                <input type="number" placeholder="Price *" value={testForm.price} onChange={(e) => setTestForm({ ...testForm, price: e.target.value })} required style={styles.input} />
                <input placeholder="Description" value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} style={styles.input} />
              </div>
              <button type="submit" style={styles.primaryBtn}>Save Test</button>
            </form>
          )}

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id}>
                    <td style={styles.td}>{t.name}</td>
                    <td style={styles.td}>{t.category || '-'}</td>
                    <td style={styles.td}>Rs. {t.price}</td>
                    <td style={styles.td}>{t.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
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

export default Laboratory;