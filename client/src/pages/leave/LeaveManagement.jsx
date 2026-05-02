import { useState, useEffect } from 'react';
import { getAllLeavesAPI, updateLeaveStatusAPI, applyLeaveAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, CheckCircle, XCircle, Plus, X, Hourglass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  pending:  { label: 'Pending',  color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.2)',  icon: <Hourglass size={13}/> },
  approved: { label: 'Approved', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  icon: <CheckCircle size={13}/> },
  rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', icon: <XCircle size={13}/> },
};

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

export default function LeaveManagement() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const isAdmin = ['admin', 'hr_officer'].includes(user?.role);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = isAdmin ? await getAllLeavesAPI({}) : await getAllLeavesAPI({ employee: true });
      setLeaves(r.data.leaves || []);
    } catch { } finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await applyLeaveAPI(form); setShowApply(false); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateLeaveStatusAPI(id, status); load(); }
    catch { }
  };

  const filtered = statusFilter === 'all' ? leaves : leaves.filter(l => l.status === statusFilter);

  const counts = { pending: leaves.filter(l => l.status === 'pending').length, approved: leaves.filter(l => l.status === 'approved').length, rejected: leaves.filter(l => l.status === 'rejected').length };

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '12px', padding: '12px 14px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <CalendarDays size={18} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Time Off
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '14px' }}>{isAdmin ? 'Manage all leave requests' : 'Your leave history'}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowApply(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '10px 18px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
        >
          <Plus size={15} /> Apply for Leave
        </motion.button>
      </motion.div>

      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { key: 'pending', label: 'Pending', icon: Hourglass, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
          { key: 'approved', label: 'Approved', icon: CheckCircle, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
          { key: 'rejected', label: 'Rejected', icon: XCircle, color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
        ].map((c, i) => (
          <motion.button key={c.key} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.07 }}
            onClick={() => setStatusFilter(statusFilter === c.key ? 'all' : c.key)}
            style={{ background: statusFilter === c.key ? c.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${statusFilter === c.key ? c.border : 'rgba(255,255,255,0.06)'}`, borderRadius: '18px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 40px ${c.color}20`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
              <c.icon size={21} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: c.color }}>{counts[c.key]}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{c.label} Requests</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Leave Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(52,211,153,0.2)', borderTop: '3px solid #34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((leave, i) => {
            const s = statusConfig[leave.status] || statusConfig.pending;
            return (
              <motion.div key={leave.id} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.border = `1px solid ${s.color}30`}
                onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '2px' }}>{leave.leave_type}</div>
                    {isAdmin && <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: '600', marginBottom: '2px' }}>{leave.employee?.user?.name}</div>}
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      {new Date(leave.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(leave.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {leave.reason && (
                  <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{leave.reason}"
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '100px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '12px', fontWeight: '600' }}>
                    {s.icon} {s.label}
                  </span>
                  {isAdmin && leave.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleStatus(leave.id, 'approved')} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={15} />
                      </button>
                      <button onClick={() => handleStatus(leave.id, 'rejected')} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          {!filtered.length && (
            <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
              <CalendarDays size={48} color="#1e3a5f" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: '#334155', fontSize: '14px' }}>No leave requests found</p>
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {showApply && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowApply(false); }}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', position: 'relative' }}
            >
              <button onClick={() => setShowApply(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
              <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc', marginBottom: '6px' }}>Apply for Leave</h2>
              <p style={{ color: '#475569', fontSize: '13px', marginBottom: '28px' }}>Submit a new leave request</p>
              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Leave Type</label>
                  <select value={form.leave_type} onChange={e => setForm(p => ({ ...p, leave_type: e.target.value }))} style={inputStyle}>
                    {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>End Date</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} style={inputStyle} required />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Reason</label>
                  <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Brief reason for leave..." rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} required
                  />
                </div>
                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ marginTop: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
                >
                  {submitting ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <><CalendarDays size={16} /> Submit Request</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
