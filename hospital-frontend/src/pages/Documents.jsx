import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Documents() {
  const [patients, setPatients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    title: '',
    file: null,
  });

  const fetchData = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        api.get('/patients'),
        api.get('/documents'),
      ]);
      setPatients(patRes.data);
      setDocuments(docRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.patientId || !form.title || !form.file) {
      setError('Patient, title and file are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('patientId', form.patientId);
      data.append('title', form.title);
      data.append('file', form.file);

      await api.post('/documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Document uploaded successfully');
      setForm({ patientId: '', title: '', file: null });
      e.target.reset();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/documents/${deleteId}`);
      setSuccess('Document deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.fileName?.toLowerCase().includes(q) ||
      d.patient?.name?.toLowerCase().includes(q)
    );
  });

  const fileUrl = (url) => {
    // backend local URL
    const base = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Patient Documents</h1>
          <p style={styles.subtitle}>Upload and manage patient files</p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleUpload} style={styles.card}>
        <h3 style={styles.cardTitle}>Upload Document</h3>
        <div style={styles.formGrid}>
          <select
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            required
            style={styles.input}
          >
            <option value="">Select Patient *</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.phone})
              </option>
            ))}
          </select>

          <input
            placeholder="Document Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={styles.input}
          />

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            required
            style={{ ...styles.input, gridColumn: '1 / -1' }}
          />
        </div>
        <button type="submit" style={styles.primaryBtn}>Upload</button>
      </form>

      <div style={styles.card}>
        <input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>File</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Uploaded</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                    No documents found
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.patient?.name}</td>
                    <td style={styles.td}>{d.title}</td>
                    <td style={styles.td}>{d.fileName}</td>
                    <td style={styles.td}>{d.fileType || '-'}</td>
                    <td style={styles.td}>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={fileUrl(d.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.viewBtn}
                        >
                          View
                        </a>
                        <button onClick={() => setDeleteId(d.id)} style={styles.deleteBtn}>
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
      </div>

      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p style={{ color: '#64748b' }}>Delete this document?</p>
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
    fontWeight: 600,
  },
  viewBtn: {
    background: '#ecfdf5',
    color: '#0f766e',
    border: '1px solid #a7f3d0',
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
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
  cancelBtn: {
    background: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  },
  card: {
    background: '#fff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: { marginTop: 0, marginBottom: 14 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  input: {
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fffdf9',
    outline: 'none',
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
  },
  td: { padding: '12px 14px', borderBottom: '1px solid #f8fafc', fontSize: 14 },
  error: {
    background: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
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
  },
};

export default Documents;