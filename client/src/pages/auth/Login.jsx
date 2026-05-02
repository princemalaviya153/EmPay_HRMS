import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginAPI } from '../../api';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Background3D from '../../components/Background3D';

const DEMO = [
  { label: 'Admin', icon: '👑', email: 'admin@empay.com', pw: 'Admin@123', color: '#6366f1', desc: 'Full access' },
  { label: 'HR', icon: '👥', email: 'priya@empay.com', pw: 'Pass@123', color: '#8b5cf6', desc: 'HR module' },
  { label: 'Payroll', icon: '💰', email: 'rahul@empay.com', pw: 'Pass@123', color: '#06b6d4', desc: 'Payroll module' },
  { label: 'Employee', icon: '👤', email: 'anita@empay.com', pw: 'Pass@123', color: '#10b981', desc: 'Self-service' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const res = await loginAPI({ email, password });
      login(res.data.token, res.data.user, res.data.employee);
      toast.success(`Welcome back, ${res.data.user.name}! 🚀`);
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020817', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <Background3D intensity="full" />

      {/* Gradient overlays */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.06) 0%, transparent 60%)', zIndex: 1, pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1100px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '60px', alignItems: 'center' }}>

        {/* Left: Branding */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>


          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            style={{ fontSize: '52px', fontWeight: '900', lineHeight: 1.1, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}
          >
            <span style={{ color: '#f8fafc' }}>The Future of</span><br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}>
              HR Management
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: '17px', color: '#64748b', lineHeight: 1.7, marginBottom: '48px', maxWidth: '420px' }}
          >
            Unified payroll, attendance, and people analytics — designed for modern organizations.
          </motion.p>

          {/* Feature pills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            {[
              { icon: <Shield size={14} />, text: 'Role-based Access', color: '#6366f1' },
              { icon: <Zap size={14} />, text: 'Real-time Data', color: '#8b5cf6' },
              { icon: <Users size={14} />, text: 'Multi-role Support', color: '#06b6d4' },
            ].map((f) => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: f.color, fontSize: '13px', fontWeight: '500',
              }}>
                {f.icon} {f.text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Login card */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px',
            padding: '40px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Top glow line */}
          <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)', borderRadius: '1px' }} />

          <h2 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc', marginBottom: '6px' }}>Sign In</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Access your workspace</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Email</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: focusedField === 'email' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: focusedField === 'email' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '14px 16px', transition: 'all 0.2s',
                boxShadow: focusedField === 'email' ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
              }}>
                <Mail size={17} color={focusedField === 'email' ? '#818cf8' : '#475569'} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '15px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Password</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: focusedField === 'pw' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: focusedField === 'pw' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '14px 16px', transition: 'all 0.2s',
                boxShadow: focusedField === 'pw' ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
              }}>
                <Lock size={17} color={focusedField === 'pw' ? '#818cf8' : '#475569'} />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onFocus={() => setFocusedField('pw')}
                  onBlur={() => setFocusedField(null)}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '15px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              style={{
                marginTop: '6px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
                backgroundSize: '200% 200%',
                animation: loading ? 'gradient-shift 2s ease infinite' : 'none',
                color: '#fff', border: 'none', borderRadius: '14px', padding: '16px',
                fontSize: '15px', fontWeight: '700', cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {loading ? (
                <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={17} /></>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', textAlign: 'center' }}>
              ⚡ Quick Demo Access
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEMO.map((d) => (
                <motion.button
                  key={d.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '10px 12px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = d.color + '15'; e.currentTarget.style.borderColor = d.color + '40'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>{d.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: d.color }}>{d.label}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{d.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#475569' }}>
            No account? <Link to="/register" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>Create one →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
