import { useState, useEffect, useRef } from 'react';
import { getEmployeesAPI, getTodayStatusAPI, getAllLeavesAPI, getAllPayrollsAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, CalendarDays, Wallet, TrendingUp, TrendingDown, ArrowUpRight, Clock, Star, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const COLORS = ['#818cf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#38bdf8'];

// 3D Tilt Card
function TiltCard({ children, style = {}, glowColor = '#6366f1' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouse = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(nx); y.set(ny);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        rotateX: springRotateX, rotateY: springRotateY,
        transformStyle: 'preserve-3d', transformPerspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}

// Animated counter
function Counter({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (start === end) { setDisplay(end); return; }
    const duration = 1200;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{typeof value === 'string' && value.includes('.') ? display.toFixed(1) : Math.floor(display)}{suffix}</>;
}

const statCards = [
  { key: 'totalEmp', label: 'Total Employees', icon: Users, color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', trend: '+12%', up: true },
  { key: 'present', label: 'Present Today', icon: UserCheck, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', trend: '87%', up: true },
  { key: 'pendingLeaves', label: 'Pending Leaves', icon: CalendarDays, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', trend: '3 new', up: false },
  { key: 'totalPayroll', label: 'Monthly Payroll', icon: Wallet, color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)', trend: '↑ 8%', up: true, format: 'currency' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(2,8,23,0.95)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
      padding: '12px 16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#818cf8', fontWeight: '700', fontSize: '15px' }}>
          {p.name === 'payroll' ? `₹${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalEmp: 0, present: 0, pendingLeaves: 0, totalPayroll: 0 });
  const [warnings, setWarnings] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [activityData] = useState([
    { day: 'Mon', present: 42, absent: 8 },
    { day: 'Tue', present: 45, absent: 5 },
    { day: 'Wed', present: 38, absent: 12 },
    { day: 'Thu', present: 47, absent: 3 },
    { day: 'Fri', present: 43, absent: 7 },
    { day: 'Sat', present: 20, absent: 30 },
    { day: 'Sun', present: 5, absent: 45 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [empRes, todayRes, leaveRes, payrollRes] = await Promise.all([
        getEmployeesAPI().catch(() => ({ data: { employees: [] } })),
        getTodayStatusAPI().catch(() => ({ data: { present: 0 } })),
        getAllLeavesAPI({ status: 'pending' }).catch(() => ({ data: { leaves: [] } })),
        getAllPayrollsAPI({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }).catch(() => ({ data: { payrolls: [] } })),
      ]);
      const employees = empRes.data.employees || [];
      const deptMap = {};
      const missingBankNames = [];
      const missingManagerNames = [];

      employees.forEach(e => { 
        const d = e.department || 'Other'; 
        deptMap[d] = (deptMap[d] || 0) + 1; 
        if (!e.bank_account_no) missingBankNames.push(e.user?.name || e.employee_code);
        if (!e.manager_id && employees.length > 1 && e.user?.role !== 'admin') missingManagerNames.push(e.user?.name || e.employee_code);
      });
      setDeptData(Object.entries(deptMap).map(([name, value]) => ({ name, value })));
      
      const payrolls = payrollRes.data.payrolls || [];
      const totalPayroll = payrolls.reduce((s, p) => s + (p.net_pay || 0), 0);
      setStats({ totalEmp: employees.length, present: todayRes.data.present || 0, pendingLeaves: (leaveRes.data.leaves || []).length, totalPayroll });

      const newWarnings = [];
      if (missingBankNames.length > 0) newWarnings.push(`Missing Bank Account: ${missingBankNames.join(', ')}`);
      if (missingManagerNames.length > 0) newWarnings.push(`Unassigned Manager: ${missingManagerNames.join(', ')}`);
      
      const presentIds = (todayRes.data.records || []).map(r => r.employee_id);
      const absentNames = employees.filter(e => !presentIds.includes(e.id)).map(e => e.user?.name || e.employee_code);
      if (absentNames.length > 0) newWarnings.push(`Absent Today: ${absentNames.join(', ')}`);

      const paidIds = payrolls.map(p => p.employee_id);
      const unpaidNames = employees.filter(e => !paidIds.includes(e.id)).map(e => e.user?.name || e.employee_code);
      if (unpaidNames.length > 0) newWarnings.push(`Unpaid this month: ${unpaidNames.join(', ')}`);

      if (payrolls.filter(p => p.status === 'draft').length > 0) newWarnings.push('Payrun has draft entries waiting for approval.');

      setWarnings(newWarnings);
    } finally { setLoading(false); }
  };

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'; };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '44px', height: '44px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#334155', fontSize: '14px' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1, marginBottom: '6px' }}>
            <span style={{ color: '#f8fafc' }}>{greeting()}, </span>
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.name?.split(' ')[0]}!
            </span>
          </h1>
          <p style={{ color: '#475569', fontSize: '15px' }}>Here's your organization at a glance.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: '100px', padding: '8px 16px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.6)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '600' }}>All Systems Operational</span>
          </div>
        </div>
      </motion.div>

      {/* Warnings Panel */}
      {warnings.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          style={{
            marginBottom: '28px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fca5a5', marginBottom: '8px' }}>Action Items & Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: '13px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f87171' }} />
                  {w}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {statCards.map((card, i) => {
          const val = stats[card.key];
          const display = card.format === 'currency' ? `₹${(val / 100000).toFixed(1)}L` : val;
          return (
            <motion.div key={card.key} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.08 }}>
              <TiltCard glowColor={card.color}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${card.border}`,
                  borderRadius: '20px',
                  padding: '24px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 60px ${card.color}20`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* BG glow */}
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: card.bg, filter: 'blur(30px)', pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: card.bg, border: `1px solid ${card.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                      <card.icon size={21} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: card.up ? 'rgba(52,211,153,0.1)' : 'rgba(251,146,60,0.1)', border: card.up ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(251,146,60,0.2)', borderRadius: '100px', padding: '3px 10px' }}>
                      {card.up ? <TrendingUp size={11} color="#34d399" /> : <TrendingDown size={11} color="#fb923c" />}
                      <span style={{ fontSize: '11px', fontWeight: '700', color: card.up ? '#34d399' : '#fb923c' }}>{card.trend}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '34px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc', lineHeight: 1, marginBottom: '6px' }}>
                    <Counter value={card.format === 'currency' ? (val / 100000) : val} prefix={card.format === 'currency' ? '₹' : ''} suffix={card.format === 'currency' ? 'L' : ''} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{card.label}</div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Weekly Attendance Area Chart */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>Weekly Attendance</h3>
              <p style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>Present vs Absent this week</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '8px', padding: '6px 12px' }}>
              <Activity size={14} color="#818cf8" />
              <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '600' }}>Live</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" stroke="#1e3a5f" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#1e3a5f" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="present" stroke="#818cf8" strokeWidth={2} fill="url(#colorPresent)" name="Present" />
              <Area type="monotone" dataKey="absent" stroke="#f472b6" strokeWidth={2} fill="url(#colorAbsent)" name="Absent" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Pie */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}
          style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '4px' }}>Department Split</h3>
          <p style={{ fontSize: '13px', color: '#334155', marginBottom: '16px' }}>Headcount by department</p>
          {deptData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={deptData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} stroke="none">
                    {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {deptData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: '#334155' }}>
              <Users size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px' }}>No employee data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Department Bar Chart */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
        style={{
          background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>Department Headcount</h3>
            <p style={{ fontSize: '13px', color: '#334155' }}>Employee distribution across departments</p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
            borderRadius: '8px', padding: '6px 14px', color: '#818cf8', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>
            <ArrowUpRight size={13} /> View All
          </button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={deptData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" stroke="#1e3a5f" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#1e3a5f" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
