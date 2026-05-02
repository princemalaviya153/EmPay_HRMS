import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import { useState, useEffect, useRef } from 'react';
import { getMyAttendanceAPI, checkInAPI, checkOutAPI } from '../../api';
import { Clock, UserCheck, CalendarDays, Wallet, ChevronRight, Fingerprint } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import toast from 'react-hot-toast';

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

// Employee self-service dashboard
function EmployeeDashboard() {
  const { user, employee } = useAuth();
  const [todayAtt, setTodayAtt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadToday(); }, []);

  const loadToday = async () => {
    try {
      const r = await getMyAttendanceAPI({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      const today = new Date().toISOString().split('T')[0];
      setTodayAtt((r.data.attendances || []).find(a => a.date?.startsWith(today)) || null);
    } catch { }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try { await checkInAPI(); toast.success('Checked in! Have a great day 🚀'); loadToday(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try { await checkOutAPI(); toast.success('Checked out! See you tomorrow 👋'); loadToday(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px' }}>
      {/* Welcome */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '32px' }}>
        <p style={{ color: '#475569', fontSize: '13px', marginBottom: '6px' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
          <span style={{ color: '#f8fafc' }}>Hello, </span>
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user?.name?.split(' ')[0]}! 👋
          </span>
        </h1>
      </motion.div>

      {/* Check In/Out card */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} style={{ marginBottom: '24px' }}>
        <TiltCard glowColor="#6366f1">
          <div style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '24px', flexWrap: 'wrap',
            boxShadow: '0 20px 60px rgba(99,102,241,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: '#fff', boxShadow: '0 8px 30px rgba(99,102,241,0.4)', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc' }}>{user?.name}</div>
                <div style={{ fontSize: '14px', color: '#475569', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')} · {employee?.department || 'No Department'}</div>
                <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{employee?.employee_code}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!todayAtt?.check_in && (
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleCheckIn} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #059669, #34d399)', border: 'none', borderRadius: '12px', padding: '12px 22px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(52,211,153,0.4)' }}
                  >
                    <Fingerprint size={16} /> Check In
                  </motion.button>
                )}
                {todayAtt?.check_in && !todayAtt?.check_out && (
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleCheckOut} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #dc2626, #f87171)', border: 'none', borderRadius: '12px', padding: '12px 22px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(248,113,113,0.4)' }}
                  >
                    <Fingerprint size={16} /> Check Out
                  </motion.button>
                )}
                {todayAtt?.check_in && todayAtt?.check_out && (
                  <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '14px', fontWeight: '600' }}>
                    <UserCheck size={16} /> Day Complete · {todayAtt.working_hours?.toFixed(1)}h
                  </div>
                )}
              </div>
              {todayAtt?.check_in && (
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Checked in at {todayAtt.check_in}
                  {todayAtt.check_out && ` · Out at ${todayAtt.check_out}`}
                </div>
              )}
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'My Attendance', sub: 'View your logs', icon: Clock, color: '#38bdf8', path: '/my-attendance' },
          { label: 'My Leaves', sub: 'Apply & track', icon: CalendarDays, color: '#34d399', path: '/my-leaves' },
          { label: 'My Payslips', sub: 'View earnings', icon: Wallet, color: '#fb923c', path: '/my-payslips' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}>
            <TiltCard glowColor={card.color}>
              <motion.a href={card.path} 
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${card.color}30`; e.currentTarget.style.boxShadow = `0 12px 40px ${card.color}15`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: `${card.color}15`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                    <card.icon size={21} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>{card.label}</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{card.sub}</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#334155" />
              </motion.a>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return ['admin', 'hr_officer', 'payroll_officer'].includes(user.role)
    ? <AdminDashboard />
    : <EmployeeDashboard />;
}
