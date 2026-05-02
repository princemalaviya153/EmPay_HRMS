import { useState, useEffect } from 'react';
import { getEmployeesAPI, createEmployeeAPI, updateEmployeeStatusAPI } from '../../api';
import { Users, Search, Plus, Filter, UserCheck, UserX, X, Mail, Phone, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const roleLabels = { admin: 'Admin', hr_officer: 'HR Officer', payroll_officer: 'Payroll Officer', employee: 'Employee' };
const roleColors = { admin: '#f472b6', hr_officer: '#818cf8', payroll_officer: '#fb923c', employee: '#34d399' };

const depts = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'];
const positions = ['Manager', 'Senior Engineer', 'Engineer', 'Analyst', 'Designer', 'Executive'];

// Status indicators per wireframe:
// 🟢 Green = Present (checked in)   🟠 Amber = On Leave   🟡 Yellow = Absent (no leave applied)
const statusConfig = {
  present: { color: '#34d399', label: 'Present', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  on_leave: { color: '#f59e0b', label: 'On Leave', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  absent: { color: '#eab308', label: 'Absent', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)' },
};
// Simulate status per employee (in real app, fetch from attendance API)
function getEmployeeStatus(emp) {
  if (!emp.is_active) return 'absent';
  // Simple simulation: hash the id to get a consistent but varied status
  const hash = (emp.id || 0) % 3;
  return hash === 0 ? 'present' : hash === 1 ? 'on_leave' : 'absent';
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [form, setForm] = useState({ name: '', email: '', password: 'Employee@123', role: 'employee', department: '', position: '', salary: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(employees.filter(e =>
      e.user?.name?.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q) ||
      e.position?.toLowerCase().includes(q) || e.employee_code?.toLowerCase().includes(q)
    ));
  }, [search, employees]);

  const load = async () => {
    setLoading(true);
    try { const r = await getEmployeesAPI(); setEmployees(r.data.employees || []); }
    catch { } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await createEmployeeAPI(form); setShowAdd(false); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f8fafc', borderRadius: '12px', padding: '12px 14px', fontSize: '14px',
    outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px' }}>

      {/* Header */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
              <Users size={18} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Employees
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '14px' }}>{employees.length} team members total</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '10px 14px', width: '240px' }}>
            <Search size={15} color="#334155" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
              style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: '13px', width: '100%' }}
            />
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
            {['grid', 'list'].map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: '9px 14px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                background: viewMode === v ? 'rgba(129,140,248,0.2)' : 'transparent',
                color: viewMode === v ? '#818cf8' : '#475569', fontFamily: 'Inter, sans-serif',
              }}>{v === 'grid' ? '⊞ Grid' : '≡ List'}</button>
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '12px', padding: '10px 18px',
              color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            <Plus size={15} /> Add Employee
          </motion.button>
        </div>
      </motion.div>

      {/* Grid view */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(167,139,250,0.2)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.map((emp, i) => {
            const role = emp.user?.role || 'employee';
            const initials = (emp.user?.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const color = roleColors[role] || '#818cf8';
            const status = getEmployeeStatus(emp);
            const st = statusConfig[status];
            return (
              <motion.div key={emp.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/employees/${emp.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px',
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}30`; e.currentTarget.style.boxShadow = `0 16px 48px ${color}15`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Status indicator dot (top-right per wireframe) */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '5px', background: st.bg, border: `1px solid ${st.border}`, borderRadius: '100px', padding: '3px 10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
                  <span style={{ fontSize: '11px', color: st.color, fontWeight: '600' }}>{st.label}</span>
                </div>

                {/* Avatar */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '20px', marginBottom: '16px',
                  background: `linear-gradient(135deg, ${color}30, ${color}15)`,
                  border: `2px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: '800', color: color,
                  fontFamily: 'Space Grotesk, sans-serif',
                }}>{initials}</div>

                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px', fontFamily: 'Space Grotesk, sans-serif' }}>{emp.user?.name}</h3>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>{emp.employee_code}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {emp.department && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                      <Building2 size={13} /> <span>{emp.department}</span>
                    </div>
                  )}
                  {emp.position && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                      <Briefcase size={13} /> <span>{emp.position}</span>
                    </div>
                  )}
                  {emp.user?.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                      <Mail size={13} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.user.email}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: `${color}15`, border: `1px solid ${color}30`, color: color, borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>
                    {roleLabels[role]}
                  </span>
                  <ChevronRight size={15} color="#334155" />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Employee', 'Code', 'Department', 'Position', 'Role', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const role = emp.user?.role || 'employee';
                const color = roleColors[role] || '#818cf8';
                const initials = (emp.user?.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color, flexShrink: 0 }}>{initials}</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{emp.user?.name}</div>
                          <div style={{ fontSize: '12px', color: '#475569' }}>{emp.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{emp.employee_code}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8' }}>{emp.department || '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8' }}>{emp.position || '—'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: `${color}15`, border: `1px solid ${color}30`, color, borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>{roleLabels[role]}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <ChevronRight size={16} color="#334155" />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#334155' }}>
              <Users size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>No employees found</p>
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
              <button onClick={() => setShowAdd(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
              <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc', marginBottom: '6px' }}>Add Employee</h2>
              <p style={{ color: '#475569', fontSize: '13px', marginBottom: '28px' }}>Create a new team member account</p>

              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { field: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                  { field: 'email', label: 'Email', type: 'email', placeholder: 'john@company.com' },
                  { field: 'password', label: 'Password', type: 'text', placeholder: 'Temp password' },
                ].map(({ field, label, type, placeholder }) => (
                  <div key={field}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{label}</label>
                    <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} style={inputStyle} required />
                  </div>
                ))}

                {[
                  { field: 'role', label: 'Role', options: [['employee', 'Employee'], ['hr_officer', 'HR Officer'], ['payroll_officer', 'Payroll Officer'], ['admin', 'Admin']] },
                  { field: 'department', label: 'Department', options: depts.map(d => [d, d]) },
                  { field: 'position', label: 'Position', options: positions.map(p => [p, p]) },
                ].map(({ field, label, options }) => (
                  <div key={field}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{label}</label>
                    <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={{ ...inputStyle }}>
                      <option value="">Select {label}</option>
                      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Base Salary (₹)</label>
                  <input type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="50000" style={inputStyle} />
                </div>

                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ marginTop: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
                >
                  {submitting ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <><Plus size={16} /> Create Employee</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
