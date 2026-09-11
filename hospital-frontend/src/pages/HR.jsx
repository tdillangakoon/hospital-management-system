import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function HR() {
  const [tab, setTab] = useState('attendance');
  const [staffList, setStaffList] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [deleteAttendanceId, setDeleteAttendanceId] = useState(null);

  const [attendanceForm, setAttendanceForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
    notes: '',
  });

  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchData = async () => {
    try {
      const [staffRes, attRes, leaveRes] = await Promise.all([
        api.get('/staff'),
        api.get('/hr/attendance'),
        api.get('/hr/leave'),
      ]);
      setStaffList(staffRes.data);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingAttendanceId) {
        await api.put(`/hr/attendance/${editingAttendanceId}`, attendanceForm);
        setSuccess('Attendance updated');
      } else {
        await api.post('/hr/attendance', attendanceForm);
        setSuccess('Attendance saved');
      }

      setAttendanceForm({
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'PRESENT',
        notes: '',
      });
      setEditingAttendanceId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleEditAttendance = (a) => {
    setAttendanceForm({
      staffId: a.staffId,
      date: a.date ? a.date.split('T')[0] : '',
      checkIn: a.checkIn || '',
      checkOut: a.checkOut || '',
      status: a.status || 'PRESENT',
      notes: a.notes || '',
    });
    setEditingAttendanceId(a.id);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDeleteAttendance = async () => {
    try {
      await api.delete(`/hr/attendance/${deleteAttendanceId}`);
      setSuccess('Attendance deleted');
      setDeleteAttendanceId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete attendance');
      setDeleteAttendanceId(null);
    }
  };

  const handleLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/hr/leave', leaveForm);
      setSuccess('Leave request created');
      setLeaveForm({
        staffId: '',
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create leave');
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      await api.put(`/hr/leave/${id}/status`, { status });
      setSuccess(`Leave ${status.toLowerCase()}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave');
    }
  };

  const filteredAttendance = attendance.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.staff?.user?.name?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  });

  const filteredLeaves = leaves.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.staff?.user?.name?.toLowerCase().includes(q) ||
      l.leaveType?.toLowerCase().includes(q) ||
      l.status?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>HR</h1>
          <p style={styles.subtitle}>Attendance and leave management</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setTab('attendance')}
            style={tab === 'attendance' ? styles.activeTab : styles.tab}
          >
            Attendance
          </button>
          <button
            onClick={() => setTab('leave')}
            style={tab === 'leave' ? styles.activeTab : styles.tab}
          >
            Leave
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {tab === 'attendance' && (
        <>
          <form onSubmit={handleAttendance} style={styles.card}>
            <h3 style={styles.cardTitle}>
              {editingAttendanceId ? 'Edit Attendance' : 'Mark Attendance'}
            </h3>
            <div style={styles.formGrid}>
              <select
                value={attendanceForm.staffId}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, staffId: e.target.value })}
                required
                style={styles.input}
                disabled={!!editingAttendanceId}
              >
                <option value="">Select Staff *</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name} ({s.user?.role})
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={attendanceForm.date}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                required
                style={styles.input}
              />

              <input
                type="time"
                value={attendanceForm.checkIn}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, checkIn: e.target.value })}
                style={styles.input}
              />

              <input
                type="time"
                value={attendanceForm.checkOut}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOut: e.target.value })}
                style={styles.input}
              />

              <select
                value={attendanceForm.status}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                style={styles.input}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="LEAVE">Leave</option>
              </select>

              <input
                placeholder="Notes"
                value={attendanceForm.notes}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={styles.primaryBtn}>
                {editingAttendanceId ? 'Update Attendance' : 'Save Attendance'}
              </button>
              {editingAttendanceId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAttendanceId(null);
                    setAttendanceForm({
                      staffId: '',
                      date: new Date().toISOString().split('T')[0],
                      checkIn: '',
                      checkOut: '',
                      status: 'PRESENT',
                      notes: '',
                    });
                  }}
                  style={styles.cancelBtn}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div style={styles.card}>
            <input
              placeholder="Search attendance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                        No attendance records
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((a) => (
                      <tr key={a.id}>
                        <td style={styles.td}>{a.staff?.user?.name}</td>
                        <td style={styles.td}>{new Date(a.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{a.checkIn || '-'}</td>
                        <td style={styles.td}>{a.checkOut || '-'}</td>
                        <td style={styles.td}>{a.status}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleEditAttendance(a)} style={styles.editBtn}>
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteAttendanceId(a.id)}
                              style={styles.deleteBtn}
                            >
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
        </>
      )}

      {tab === 'leave' && (
        <>
          <form onSubmit={handleLeave} style={styles.card}>
            <h3 style={styles.cardTitle}>Create Leave Request</h3>
            <div style={styles.formGrid}>
              <select
                value={leaveForm.staffId}
                onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
                required
                style={styles.input}
              >
                <option value="">Select Staff *</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name}
                  </option>
                ))}
              </select>

              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                style={styles.input}
              >
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              <input
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
                style={styles.input}
              />

              <input
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
                style={styles.input}
              />

              <input
                placeholder="Reason"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                style={{ ...styles.input, gridColumn: '1 / -1' }}
              />
            </div>
            <button type="submit" style={styles.primaryBtn}>Submit Leave</button>
          </form>

          <div style={styles.card}>
            <input
              placeholder="Search leave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>From</th>
                    <th style={styles.th}>To</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                        No leave records
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((l) => (
                      <tr key={l.id}>
                        <td style={styles.td}>{l.staff?.user?.name}</td>
                        <td style={styles.td}>{l.leaveType}</td>
                        <td style={styles.td}>{new Date(l.startDate).toLocaleDateString()}</td>
                        <td style={styles.td}>{new Date(l.endDate).toLocaleDateString()}</td>
                        <td style={styles.td}>{l.status}</td>
                        <td style={styles.td}>
                          {l.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => updateLeaveStatus(l.id, 'APPROVED')}
                                style={styles.editBtn}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateLeaveStatus(l.id, 'REJECTED')}
                                style={styles.deleteBtn}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {deleteAttendanceId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p style={{ color: '#64748b' }}>Delete this attendance record?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setDeleteAttendanceId(null)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={confirmDeleteAttendance} style={styles.deleteBtn}>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
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
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  activeTab: {
    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  card: {
    background: '#fff',
    border: '1px solid #ffedd5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: { marginTop: 0, marginBottom: 14 },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 14,
  },
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 800 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#fff7ed',
    fontSize: 12,
    color: '#c2410c',
    borderBottom: '1px solid #ffedd5',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f8fafc',
    fontSize: 14,
  },
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
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
};

export default HR;