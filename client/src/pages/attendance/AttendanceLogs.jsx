import { useState, useEffect } from 'react';
import { getMyAttendanceAPI, getAllAttendancesAPI, getEmployeesAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Clock, ChevronLeft, ChevronRight, Download, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const glass = {
  background: 'rgba(255,255,255,0.02)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '20px',
  overflow: 'hidden'
};

const inputStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#e2e8f0',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '13px',
  outline: 'none',
};

const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  return `${h}:${m}`;
};

const getExtraHours = (hours) => {
  if (!hours || hours <= 8) return '—';
  const extra = hours - 8;
  const h = Math.floor(extra);
  const m = Math.round((extra - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getWorkHours = (hours) => {
  if (!hours) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function AttendanceLogs() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'hr_officer', 'payroll_officer'].includes(user?.role);

  // Admin state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  
  // Employee state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendances, setAttendances] = useState([]);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      loadEmployeeData();
    }
  }, [isAdmin, selectedDate, currentMonth]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const empsRes = await getEmployeesAPI();
      const emps = empsRes.data.employees || [];

      const dateStr = selectedDate.toISOString().split('T')[0];
      const attRes = await getAllAttendancesAPI({ date: dateStr });
      const attMap = {};
      (attRes.data.attendances || []).forEach(a => {
        attMap[a.employee_id] = a;
      });

      const combined = emps.map(emp => ({
        ...emp,
        attendance: attMap[emp.id] || null
      }));

      setEmployees(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const res = await getMyAttendanceAPI({ month, year });
      setAttendances(res.data.attendances || []);
      setSummary(res.data.summary || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const shiftMonth = (months) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + months);
    setCurrentMonth(d);
  };

  const filteredEmployees = employees.filter(e => 
    e.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Clock size={18} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Attendance
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '14px' }}>
            {isAdmin ? 'Attendances List view (Admin)' : 'Day-wise attendance (Employee)'}
          </p>
        </div>
      </div>

      {isAdmin ? (
        // ================= ADMIN VIEW =================
        <motion.div {...glass} style={{ ...glass }}>
          {/* Controls Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => shiftDate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='none'}><ChevronLeft size={16}/></button>
                <button onClick={() => shiftDate(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='none'}><ChevronRight size={16}/></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                <Calendar size={16} color="#94a3b8" />
                {selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type="text" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px', width: '220px' }} />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(56,189,248,0.2)', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Emp', 'Check In', 'Check Out', 'Work Hours', 'Extra hours'].map(h => (
                      <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, i) => {
                    const att = emp.attendance;
                    return (
                      <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                              {emp.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '600' }}>{emp.user?.name || 'Unknown'}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>[{emp.employee_code}]</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{formatTime(att?.check_in)}</td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{formatTime(att?.check_out)}</td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#cbd5e1' }}>{getWorkHours(att?.working_hours)}</td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#f59e0b' }}>{getExtraHours(att?.working_hours)}</td>
                      </motion.tr>
                    );
                  })}
                  {!filteredEmployees.length && (
                    <tr>
                      <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No employees found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      ) : (
        // ================= EMPLOYEE VIEW =================
        <motion.div {...glass} style={{ ...glass }}>
          {/* Controls Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => shiftMonth(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='none'}><ChevronLeft size={16}/></button>
                <button onClick={() => shiftMonth(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='none'}><ChevronRight size={16}/></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                <Calendar size={16} color="#94a3b8" />
                {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: '8px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Count of days present</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: '800' }}>{summary.present || 0}</div>
              </div>
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', padding: '8px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#f87171', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Leaves count</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: '800' }}>{summary.on_leave || 0}</div>
              </div>
              <div style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', padding: '8px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Total working days</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: '800' }}>{(summary.present || 0) + (summary.half_day || 0) + (summary.absent || 0) + (summary.on_leave || 0)}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(56,189,248,0.2)', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Date', 'Check In', 'Check Out', 'Work Hours', 'Extra hours'].map(h => (
                      <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att, i) => (
                    <motion.tr key={att.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 24px', fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
                        {new Date(att.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{formatTime(att.check_in)}</td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{formatTime(att.check_out)}</td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#cbd5e1' }}>{getWorkHours(att.working_hours)}</td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#f59e0b' }}>{getExtraHours(att.working_hours)}</td>
                    </motion.tr>
                  ))}
                  {!attendances.length && (
                    <tr>
                      <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No records for this month</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
