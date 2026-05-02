import { useState, useEffect, useMemo } from 'react';
import { getAllLeavesAPI, getMyLeavesAPI, updateLeaveStatusAPI, applyLeaveAPI, allocateLeaveAPI, getEmployeesAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, CheckCircle, XCircle, Plus, X, Hourglass, Briefcase, ChevronRight, Search, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  pending:  { label: 'Pending',  color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.2)',  icon: <Hourglass size={13}/> },
  approved: { label: 'Approved', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  icon: <CheckCircle size={13}/> },
  rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', icon: <XCircle size={13}/> },
};

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

export default function LeaveManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timeOff'); // 'timeOff' | 'allocation'
  const [leaves, setLeaves] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
  const [allocForm, setAllocForm] = useState({ employee_id: '', leave_type: 'Annual Leave', year: new Date().getFullYear(), allocated: 10 });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = ['admin', 'hr_officer'].includes(user?.role);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Always fetch my leaves to get personal allocations
      const myData = await getMyLeavesAPI();
      setAllocations(myData.data.allocations || []);

      if (isAdmin) {
        const allData = await getAllLeavesAPI({});
        setLeaves(allData.data.leaves || []);
        
        // Fetch employees for allocation dropdown
        const empData = await getEmployeesAPI({});
        setEmployees(empData.data.employees || []);
        if (empData.data.employees?.length > 0 && !allocForm.employee_id) {
          setAllocForm(prev => ({ ...prev, employee_id: empData.data.employees[0].id }));
        }
      } else {
        setLeaves(myData.data.leaves || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (new Date(form.start_date) > new Date(form.end_date)) {
      alert('End date cannot be before start date');
      return;
    }
    setSubmitting(true);
    try { 
      await applyLeaveAPI(form); 
      alert('Leave request submitted successfully!');
      setShowApply(false); 
      setForm({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
      load(); 
    }
    catch (error) { 
      alert(error.response?.data?.message || 'Failed to submit leave request. Please check your allocation.'); 
    }
    finally { setSubmitting(false); }
  };

  const handleAllocate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await allocateLeaveAPI(allocForm); alert('Leave allocated successfully!'); load(); setAllocForm(prev => ({ ...prev, allocated: 10 })); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateLeaveStatusAPI(id, status); load(); }
    catch { }
  };

  const filteredLeaves = useMemo(() => {
    if (!searchTerm) return leaves;
    return leaves.filter(l => 
      l.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (l.employee?.user?.name && l.employee.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [leaves, searchTerm]);

  const baseInputStyle = { 
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
    color: '#f8fafc', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', 
    outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box'
  };

  const selectStyle = {
    ...baseInputStyle,
    WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', backgroundSize: '16px'
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px' }}>
      
      {/* Top Header & Tabs */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <CalendarDays size={20} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Time Off & Allocations
          </h1>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
            {['timeOff', 'allocation'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ 
                  background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none', borderRadius: '8px', padding: '10px 20px', color: activeTab === tab ? '#fff' : '#94a3b8', 
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' 
                }}
              >
                {tab === 'timeOff' ? 'Time Off' : 'Allocations'}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(52,211,153,0.2)', borderTop: '3px solid #34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : activeTab === 'timeOff' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Available Balances */}
          {!isAdmin && allocations.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
              {allocations.map(alloc => {
                const available = alloc.allocated - alloc.used;
                return (
                  <div key={alloc.id} style={{ minWidth: '220px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{alloc.leave_type}</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc' }}>
                      {available < 10 ? `0${available}` : available} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Days Available</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowApply(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', border: 'none', borderRadius: '10px', padding: '12px 20px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(236,72,153,0.3)' }}
            >
              <Plus size={16} /> NEW
            </motion.button>

            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search leaves..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ ...baseInputStyle, paddingLeft: '40px', borderRadius: '100px' }} 
              />
            </div>
          </div>

          {/* Premium Table */}
          <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End Date</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Off Type</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    {isAdmin && <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => {
                    const s = statusConfig[leave.status] || statusConfig.pending;
                    return (
                      <tr key={leave.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#f8fafc', fontWeight: '600' }}>
                          {leave.employee?.user?.name || user.name}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#cbd5e1' }}>{new Date(leave.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#cbd5e1' }}>{new Date(leave.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '13px' }}>
                            {leave.leave_type}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '12px', fontWeight: '600' }}>
                            {s.icon} {s.label}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            {leave.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleStatus(leave.id, 'approved')} style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.1)'}>
                                  <CheckCircle size={15} />
                                </button>
                                <button onClick={() => handleStatus(leave.id, 'rejected')} style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}>
                                  <XCircle size={15} />
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#475569', fontSize: '13px' }}>Processed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {!filteredLeaves.length && (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        No leave records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Allocation Form */}
          <div style={{ flex: '1 1 400px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#8b5cf6" /> New Allocation
            </h2>
            <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Employee</label>
                <select value={allocForm.employee_id} onChange={e => setAllocForm(p => ({ ...p, employee_id: e.target.value }))} style={selectStyle} required>
                  {employees.map(e => <option key={e.id} value={e.id} style={{ background: '#0f172a' }}>{e.user?.name} ({e.user?.email})</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Time Off Type</label>
                <select value={allocForm.leave_type} onChange={e => setAllocForm(p => ({ ...p, leave_type: e.target.value }))} style={selectStyle}>
                  {leaveTypes.map(t => <option key={t} value={t} style={{ background: '#0f172a' }}>{t}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Validity Year</label>
                  <input type="number" value={allocForm.year} onChange={e => setAllocForm(p => ({ ...p, year: e.target.value }))} style={baseInputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Allocation (Days)</label>
                  <input type="number" min="1" value={allocForm.allocated} onChange={e => setAllocForm(p => ({ ...p, allocated: e.target.value }))} style={baseInputStyle} required />
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', padding: '12px 28px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif' }}
                >
                  {submitting ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : 'Save Allocation'}
                </motion.button>
              </div>
            </form>
          </div>

          <div style={{ flex: '1 1 300px', background: 'rgba(63, 102, 241, 0.05)', border: '1px solid rgba(63, 102, 241, 0.1)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ color: '#818cf8', fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18}/> Allocation Guidelines</h3>
            <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Allocations determine how many paid days off an employee receives per year.</li>
              <li style={{ marginBottom: '8px' }}>Standard Annual Leave is typically 24 days per calendar year.</li>
              <li style={{ marginBottom: '8px' }}>Sick Leave is allocated separately as per company policy (usually 7-14 days).</li>
              <li>Unpaid leaves do not require allocation but must be approved.</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showApply && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowApply(false); }}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '500px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            >
              <button onClick={() => setShowApply(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
              
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc', margin: '0 0 6px 0' }}>Request Time Off</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Submit a new time off request for approval.</p>
              </div>

              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Employee</label>
                  <input type="text" value={user.name} disabled style={{ ...baseInputStyle, opacity: 0.7, background: 'rgba(0,0,0,0.2)' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Time Off Type</label>
                  <select value={form.leave_type} onChange={e => setForm(p => ({ ...p, leave_type: e.target.value }))} style={selectStyle}>
                    {leaveTypes.map(t => <option key={t} value={t} style={{ background: '#0f172a' }}>{t}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>From Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} style={baseInputStyle} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>To Date</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} style={baseInputStyle} required />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Note / Reason</label>
                  <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Provide details..." rows={3}
                    style={{ ...baseInputStyle, resize: 'vertical', lineHeight: '1.6' }} required
                  />
                </div>

                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ marginTop: '8px', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(236,72,153,0.35)' }}
                >
                  {submitting ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : 'Submit Request'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
