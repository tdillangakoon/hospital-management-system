import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Laboratory() {
  const [tests, setTests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(null);
  const [search, setSearch] = useState('');

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

  const statusStyle = (status) => {
    if (status === 'COMPLETED') return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
  };

  const filteredRequests = requests.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.patient?.name?.toLowerCase().includes(q) ||
      r.test?.name?.toLowerCase().includes(q) ||
      r.doctor?.user?.name?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    );
  });

  const filteredTests = tests.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      String(t.price).includes(q)
    );
  });

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Laboratory</h1>
          <p style={styles.subtitle}>Manage lab tests, requests and results</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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

      {tab === 'requests' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => setShowRequestForm(!showRequestForm)} style={styles.primaryBtn}>
              {showRequestForm ? 'Cancel' : '+ New Lab Request'}
            </button>
          </div>

          {showRequestForm && (
            <form onSubmit={handleCreateRequest} style={styles.card}>
              <h3 style={styles.cardTitle}>Create Lab Request</h3>
              <div style={styles.formGrid}>
                <select
                  value={requestForm.patientId}
                  onChange={(e) => setRequestForm({ ...requestForm, patientId: e.target.value })}
                  required
                  style={styles.input}
                >
                  <option value="">Select Patient *</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={requestForm.doctorId}
                  onChange={(e) => setRequestForm({ ...requestForm, doctorId: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.user?.name}</option>
                  ))}
                </select>

                <select
                  value={requestForm.testId}
                  onChange={(e) => setRequestForm({ ...requestForm, testId: e.target.value })}
                  required
                  style={styles.input}
                >
                  <option value="">Select Test *</option>
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (Rs. {t.price})</option>
                  ))}
                </select>

                <input
                  placeholder="Notes"
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                  style={styles.input}
                />
              </div>
              <button type="submit" style={styles.primaryBtn}>Create Request</button>
            </form>
          )}

          {showResultForm && (
            <form onSubmit={handleAddResult} style={styles.card}>
              <h3 style={styles.cardTitle}>Add Lab Result</h3>
              <textarea
                placeholder="Result *"
                value={resultForm.result}
                onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                required
                rows={3}
                style={{ ...styles.input, width: '100%', marginBottom: 12, resize: 'vertical' }}
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

          <div style={styles.card}>
            <input
              type="text"
              placeholder="Search requests by patient, test, doctor, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
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
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                          No lab requests
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((r) => {
                        const s = statusStyle(r.status);
                        return (
                          <tr key={r.id}>
                            <td style={styles.td}>{r.patient?.name}</td>
                            <td style={styles.td}>{r.test?.name}</td>
                            <td style={styles.td}>{r.doctor?.user?.name || '-'}</td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.pill,
                                background: s.bg,
                                color: s.color,
                                border: `1px solid ${s.border}`,
                              }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={styles.td}>{new Date(r.requestDate).toLocaleDateString()}</td>
                            <td style={styles.td}>
                              {r.status !== 'COMPLETED' ? (
                                <button onClick={() => setShowResultForm(r.id)} style={styles.editBtn}>
                                  Add Result
                                </button>
                              ) : (
                                <span style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Result added</span>
                              )}
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
        </>
      )}

      {tab === 'tests' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => setShowTestForm(!showTestForm)} style={styles.primaryBtn}>
              {showTestForm ? 'Cancel' : '+ Add Lab Test'}
            </button>
          </div>

          {showTestForm && (
            <form onSubmit={handleCreateTest} style={styles.card}>
              <h3 style={styles.cardTitle}>Add Lab Test</h3>
              <div style={styles.formGrid}>
                <input
                  placeholder="Test Name *"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  required
                  style={styles.input}
                />
                <input
                  placeholder="Category"
                  value={testForm.category}
                  onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Price *"
                  value={testForm.price}
                  onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                  required
                  style={styles.input}
                />
                <input
                  placeholder="Description"
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  style={styles.input}
                />
              </div>
              <button type="submit" style={styles.primaryBtn}>Save Test</button>
            </form>
          )}

          <div style={styles.card}>
            <input
              type="text"
              placeholder="Search tests by name, category, price..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />

            <div style={{ overflowX: 'auto' }}>
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
                  {filteredTests.map((t) => (
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
          </div>
        </>
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
  cancelBtn: {
    background: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  },
  tab: {
    background: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
    padding: '8px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  activeTab: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
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
  input: {
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    background: '#fffdf9',
    outline: 'none',
    fontFamily: 'inherit',
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
};

export default Laboratory;