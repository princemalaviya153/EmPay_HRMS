import { useState, useEffect } from 'react';
import { getMyAttendanceAPI, getEmployeeAttendanceAPI, getEmployeesAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Clock, UserCheck, UserX, Coffee, CalendarDays, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const statusMap = {
  present:  { label: 'Present',  color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)',  icon: <UserCheck size={14}/> },
  absent:   { label: 'Absent',   color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)', icon: <UserX size={14}/> },
  half_day: { label: 'Half Day', color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.25)',  icon: <Coffee size={14}/> },
  on_leave: { label: 'On Leave', color: '#818cf8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.25)', icon: <CalendarDays size={14}/> },
};

const summaryCards = [
  { key: 'present',  label: 'Present',  color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  icon: UserCheck },
  { key: 'absent',   label: 'Absent',   color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: UserX },
  { key: 'half_day', label: 'Half Day', color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)',  icon: Coffee },
  { key: 'on_leave', label: 'On Leave', color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)', icon: CalendarDays },
];

const cardStyle = (c) => ({
  background: c.bg, border: `1px solid ${c.border}`,
  borderRadius: '18px', padding: '20px 24px',
  display: 'flex', alignItems: 'center', gap: '16px',
  transition: 'all 0.3s',
});

export default function AttendanceLogs() {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [summary, setSummary] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const isAdmin = ['admin', 'hr_officer', 'payroll_officer'].includes(user?.role);

  useEffect(() => {
    if (isAdmin) getEmployeesAPI().then(r => setEmployees(r.data.employees || [])).catch(() => {});
    load();
  }, [month, year, selectedEmp]);

  const load = async () => {
    setLoading(true);
    try {
      const res = isAdmin && selectedEmp
        ? await getEmployeeAttendanceAPI(selectedEmp, { month, year })
        : await getMyAttendanceAPI({ month, year });
      setAttendances(res.data.attendances || []);
      setSummary(res.data.summary || {});
    } catch { } finally { setLoading(false); }
  };

  const selectStyle = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8', borderRadius: '10px', padding: '9px 14px', fontSize: '13px',
    outline: 'none', cursor: 'pointer',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px' }}>

      {/* Header */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Clock size={18} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isAdmin ? 'Attendance Records' : 'My Attendance'}
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '14px' }}>Track and monitor daily attendance logs</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {isAdmin && (
            <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} style={selectStyle}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name} ({e.employee_code})</option>)}
            </select>
          )}
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={selectStyle}>
            {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={selectStyle}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            onClick={() => {
              if (!attendances.length) return;
              const headers = ['Date', 'Check In', 'Check Out', 'Working Hours', 'Status'];
              const rows = attendances.map(a => [
                new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                a.check_in || '—',
                a.check_out || '—',
                a.working_hours ? a.working_hours.toFixed(1) : '—',
                a.status || 'absent'
              ]);
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `attendance_${new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}_${year}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '10px', padding: '9px 16px', color: '#818cf8', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Download size={14} /> Export
          </button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {summaryCards.map((c, i) => (
          <motion.div key={c.key} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.07 }}
            style={cardStyle(c)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 40px ${c.color}20`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
              <c.icon size={21} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: c.color }}>{summary[c.key] || 0}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{c.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}
      >
        {/* Table header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>
            {attendances.length} Records
          </span>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '6px 12px', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
            <Filter size={12} /> Filter
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(56,189,248,0.2)', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Date', 'Check In', 'Check Out', 'Working Hours', 'Status'].map(h => (
                    <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendances.map((a, i) => {
                  const s = statusMap[a.status] || statusMap.absent;
                  return (
                    <motion.tr key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 24px', fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
                        {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{a.check_in || '—'}</td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{a.check_out || '—'}</td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8' }}>{a.working_hours ? `${a.working_hours.toFixed(1)}h` : '—'}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '12px', fontWeight: '600' }}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
                {!attendances.length && (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                      <CalendarDays size={48} color="#1e3a5f" style={{ margin: '0 auto 16px', display: 'block' }} />
                      <p style={{ color: '#334155', fontSize: '14px' }}>No records for this period</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
