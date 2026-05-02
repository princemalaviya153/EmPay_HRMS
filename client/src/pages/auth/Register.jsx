import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../../api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Background3D from '../../components/Background3D';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await registerAPI({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'john@company.com', icon: Mail },
    { key: 'password', label: 'Password', type: showPw ? 'text' : 'password', placeholder: '••••••••', icon: Lock },
    { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••', icon: Lock },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020817', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <Background3D intensity="light" />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 60%)', zIndex: 1, pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '440px' }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '40px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', fontWeight: '900', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>E</div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EmPay X</div>
              <div style={{ fontSize: '10px', color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600' }}>HRMS Platform</div>
            </div>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#f8fafc', marginBottom: '6px' }}>Create Account</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>Join your team on EmPay X</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{label}</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: focused === key ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                  border: focused === key ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '13px 16px', transition: 'all 0.2s',
                  boxShadow: focused === key ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
                }}>
                  <Icon size={16} color={focused === key ? '#818cf8' : '#475569'} />
                  <input
                    type={type} value={form[key]} placeholder={placeholder} required
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '15px' }}
                  />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', padding: 0 }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ marginTop: '6px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}
            >
              {loading ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <>Create Account <ArrowRight size={17} /></>}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#475569' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>Sign In →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
