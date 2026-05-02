import { useState, useEffect } from 'react';
import { getAllUsersAPI, updateUserRoleAPI, deleteUserAPI, registerAPI } from '../../api';
import { Settings, Users, Shield, UserPlus, Trash2, Check, ChevronDown, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { value: 'admin', label: 'Admin', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)' },
  { value: 'hr_officer', label: 'HR Officer', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
  { value: 'payroll_officer', label: 'Payroll Officer', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  { value: 'employee', label: 'Employee', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
];

const MODULES = [
  { key: 'employees', label: 'Employees', roles: ['admin', 'hr_officer'] },
  { key: 'attendance', label: 'Attendance', roles: ['admin', 'hr_officer', 'payroll_officer', 'employee'] },
  { key: 'time_off', label: 'Time Off', roles: ['admin', 'hr_officer', 'payroll_officer', 'employee'] },
  { key: 'payroll', label: 'Payroll', roles: ['admin', 'payroll_officer'] },
  { key: 'reports', label: 'Reports', roles: ['admin', 'hr_officer', 'payroll_officer'] },
  { key: 'settings', label: 'Settings', roles: ['admin'] },
];

function getRoleMeta(role) {
  return ROLES.find(r => r.value === role) || ROLES[3];
}

function RoleDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const current = getRoleMeta(value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: current.bg, border: `1px solid ${current.border}`,
          borderRadius: '10px', padding: '6px 14px', cursor: disabled ? 'not-allowed' : 'pointer',
          color: current.color, fontSize: '12px', fontWeight: '600',
          fontFamily: 'Inter, sans-serif', opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
      >
        {current.label}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '4px',
              background: 'rgba(2,8,23,0.97)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
              padding: '6px', minWidth: '180px', zIndex: 100,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {ROLES.map(r => (
              <button key={r.value}
                onClick={() => { onChange(r.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '10px 12px', borderRadius: '10px', border: 'none',
                  background: value === r.value ? `${r.color}15` : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${r.color}15`}
                onMouseLeave={e => { if (value !== r.value) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: r.color }}>{r.label}</span>
                {value === r.value && <Check size={13} color={r.color} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsersAPI();
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleAPI(userId, { role: newRole });
      toast.success('Role updated successfully');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return;
    try {
      await deleteUserAPI(userId);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill all fields');
      return;
    }
    setAdding(true);
    try {
      await registerAPI(newUser);
      toast.success('User created successfully');
      setNewUser({ name: '', email: '', password: '', role: 'employee' });
      setShowAddUser(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const baseInputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f8fafc', borderRadius: '12px', padding: '12px 14px', fontSize: '14px',
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

      {/* Header */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <Settings size={18} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Settings
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '14px' }}>Manage users, roles, and module access rights</p>
        </div>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddUser(!showAddUser)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: '12px', padding: '10px 20px',
            color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}
        >
          <UserPlus size={15} /> Add User
        </motion.button>
      </motion.div>

      {/* Add User Panel */}
      <AnimatePresence>
        {showAddUser && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(129,140,248,0.2)', borderRadius: '20px', padding: '24px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}>
                Create New User
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" style={baseInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Email</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="john@empay.com" style={baseInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Password</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" style={baseInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Role</label>
                  <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                    style={{ ...selectStyle, cursor: 'pointer' }}
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value} style={{ background: '#0f172a' }}>{r.label}</option>)}
                  </select>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleAddUser} disabled={adding}
                  style={{
                    background: '#34d399', border: 'none', borderRadius: '12px',
                    padding: '12px 20px', color: '#fff', fontSize: '13px', fontWeight: '700',
                    cursor: adding ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
                    opacity: adding ? 0.7 : 1, whiteSpace: 'nowrap',
                  }}
                >
                  {adding ? 'Creating...' : 'Create'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Setting Table */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
        style={{
          background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px',
          overflow: 'hidden', marginBottom: '24px',
        }}
      >
        {/* Table Header Bar */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Users size={15} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>User Setting</h3>
              <p style={{ fontSize: '12px', color: '#475569' }}>Select user access rights as per their role and responsibilities</p>
            </div>
          </div>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              style={{ ...baseInputStyle, paddingLeft: '36px', fontSize: '13px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(129,140,248,0.2)', borderTop: '3px solid #818cf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['User Name', 'Login Id', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '14px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700',
                      color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const isSelf = u.id === currentUser?.id;
                  const roleMeta = getRoleMeta(u.role);
                  return (
                    <motion.tr key={u.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${roleMeta.color}30, ${roleMeta.color}10)`,
                            border: `1px solid ${roleMeta.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: '700', color: roleMeta.color,
                          }}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
                              {u.name} {isSelf && <span style={{ fontSize: '10px', color: '#818cf8', background: 'rgba(129,140,248,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>You</span>}
                            </div>
                            {u.employee?.employee_code && (
                              <div style={{ fontSize: '11px', color: '#475569' }}>{u.employee.employee_code}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                        {u.email?.split('@')[0]}
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <RoleDropdown
                          value={u.role}
                          onChange={(newRole) => handleRoleChange(u.id, newRole)}
                          disabled={isSelf}
                        />
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <motion.button
                          whileHover={!isSelf ? { scale: 1.1 } : {}}
                          whileTap={!isSelf ? { scale: 0.9 } : {}}
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={isSelf}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: isSelf ? 'rgba(255,255,255,0.02)' : 'rgba(248,113,113,0.08)',
                            border: isSelf ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(248,113,113,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSelf ? '#334155' : '#f87171',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                      <Users size={48} color="#1e3a5f" style={{ margin: '0 auto 16px', display: 'block' }} />
                      <p style={{ color: '#334155', fontSize: '14px' }}>No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Module Access Rights Matrix */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <Shield size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>Module Access Rights</h3>
            <p style={{ fontSize: '12px', color: '#475569' }}>Access rights configured per role. These define what users are allowed to access.</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>Module</th>
                {ROLES.map(r => (
                  <th key={r.value} style={{ padding: '14px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: r.color, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod, i) => (
                <motion.tr key={mod.key}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{mod.label}</td>
                  {ROLES.map(r => {
                    const hasAccess = mod.roles.includes(r.value);
                    return (
                      <td key={r.value} style={{ padding: '14px 24px', textAlign: 'center' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px', margin: '0 auto',
                          background: hasAccess ? `${r.color}15` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${hasAccess ? `${r.color}30` : 'rgba(255,255,255,0.05)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: hasAccess ? r.color : '#1e293b',
                        }}>
                          {hasAccess ? <Check size={14} /> : '—'}
                        </div>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Access Rights Info */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={14} color="#fb923c" />
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Access rights are configured on a module basis, allowing specific permissions for each module.
            Roles: <strong style={{ color: '#f472b6' }}>Admin</strong> (full access) · <strong style={{ color: '#818cf8' }}>HR Officer</strong> (employee & leave management) · <strong style={{ color: '#fb923c' }}>Payroll Officer</strong> (payroll & attendance) · <strong style={{ color: '#34d399' }}>Employee</strong> (self-service only)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
