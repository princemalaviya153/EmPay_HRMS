import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Upload, User, Building2, Mail, Phone, Lock, ArrowRight, UserPlus, Info, CheckCircle, Copy, Shield } from 'lucide-react';
import AuthBackground3D from '../../components/AuthBackground3D';
import { useAuth } from '../../context/AuthContext';
import { loginAPI, registerAPI } from '../../api';

function genId(co = '', name = '', yr = new Date().getFullYear(), s = 1) {
  const c = co.replace(/\s+/g, '').substring(0, 2).toUpperCase();
  const p = name.trim().split(/\s+/);
  const f = (p[0] || '').substring(0, 2).toUpperCase();
  const l = (p[1] || '').substring(0, 2).toUpperCase();
  return `${c}${f}${l}${yr}${String(s).padStart(4, '0')}`;
}

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '24px',
};

const inputStyle = (err) => ({
  width: '100%', padding: '12px 12px 12px 40px', borderRadius: '14px', fontSize: '14px',
  background: 'rgba(255,255,255,0.07)', border: `1px solid ${err ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
  color: '#f1f5f9', outline: 'none', transition: 'all 0.2s',
});

const btnPrimary = {
  width: '100%', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', fontWeight: '700',
  fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  boxShadow: '0 8px 32px rgba(124,58,237,0.4)', letterSpacing: '0.5px',
};

function PwField({ value, onChange, placeholder = '••••••••', error }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} style={{ ...inputStyle(error), paddingRight: '42px' }} />
      <button type="button" onClick={() => setShow(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function Lbl({ children }) {
  return <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{children}</div>;
}

function IconInput({ icon: Icon, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
      <input {...props} style={{ ...inputStyle(props.error), ...(props.style || {}) }} />
    </div>
  );
}

const card = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.95 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const Spinner = () => <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;

/* ═══ SIGN IN ═══ */
function SignIn({ onSwitch }) {
  const [loginId, setLoginId] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!loginId || !pw) { setErr('Fill all fields'); return; }
    setErr(''); setLoading(true);
    try {
      const res = await loginAPI({ email: loginId, password: pw });
      const { token, user, employee } = res.data;
      login(token, user, employee);
      navigate('/employees');
    } catch (error) {
      setErr(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...card} style={{ ...glass, padding: '40px 36px', width: '100%', maxWidth: '420px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
          <Shield size={28} style={{ color: '#fff' }} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '4px 14px', marginBottom: '16px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Secure Sign In</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>Welcome back</h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Sign in to your EmPay workspace</p>
      </div>

      {/* Logo */}
      <div style={{ width: '100%', height: '48px', border: '1.5px dashed rgba(124,58,237,0.4)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', background: 'rgba(124,58,237,0.06)' }}>
        <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '600' }}>App / Web Logo</span>
      </div>

      {err && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#fca5a5' }}>⚠️ {err}</div>}

      <form onSubmit={submit}>
        <div style={{ marginBottom: '16px' }}>
          <Lbl>Login Id / Email :-</Lbl>
          <IconInput icon={User} type="text" value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="e.g. OIJODO20220001" />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Lbl>Password :-</Lbl>
            <button type="button" style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Forgot?</button>
          </div>
          <PwField value={pw} onChange={e => setPw(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: '20px' }}>
          {loading ? <Spinner /> : <><span>SIGN IN</span><ArrowRight size={16} /></>}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '24px' }}>
        Don't have an Account?{' '}
        <button onClick={onSwitch} style={{ color: '#a78bfa', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sign Up</button>
      </p>

      <div style={{ marginTop: '20px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '10px' }}>
        <Info size={14} style={{ color: '#a78bfa', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '11px', color: '#c4b5fd', lineHeight: 1.7 }}>
          Use the <strong>Login ID</strong> from your HR officer and the <strong>temporary password</strong> for first sign-in.
        </p>
      </div>
    </motion.div>
  );
}

/* ═══ SIGN UP ═══ */
function SignUp({ onSwitch }) {
  const [form, setForm] = useState({ companyName: '', name: '', email: '', phone: '', password: '', confirm: '' });
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);
  const logoRef = useRef();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const preview = form.companyName || form.name ? genId(form.companyName, form.name) : '';

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 1;
    if (!form.name.trim()) e.name = 1;
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 1;
    if (!form.phone.trim()) e.phone = 1;
    if (form.password.length < 6) e.password = 1;
    if (form.password !== form.confirm) e.confirm = 1;
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      const generatedId = genId(form.companyName, form.name);
      const tempPw = `Temp@${new Date().getFullYear()}`;
      await registerAPI({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'employee',
        company_name: form.companyName,
        phone: form.phone,
      });
      setDone({ id: generatedId, pw: tempPw, name: form.name });
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const copyId = (t) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  /* Success */
  if (done) return (
    <motion.div {...card} style={{ ...glass, padding: '40px 36px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <CheckCircle size={30} style={{ color: '#34d399' }} />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>Account Created! 🎉</h2>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Share credentials with <strong style={{ color: '#c4b5fd' }}>{done.name}</strong></p>

      <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '18px', marginBottom: '12px', textAlign: 'left' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Generated Login ID</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff', fontFamily: 'monospace', letterSpacing: '2px' }}>{done.id}</span>
          <button onClick={() => copyId(done.id)} style={{ background: 'rgba(124,58,237,0.2)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#c4b5fd', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '16px', padding: '18px', marginBottom: '24px', textAlign: 'left' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Temporary Password</div>
        <span style={{ fontSize: '18px', fontWeight: '900', color: '#fde68a', fontFamily: 'monospace' }}>{done.pw}</span>
        <p style={{ fontSize: '11px', color: '#fbbf24', marginTop: '6px' }}>⚠️ Must change on first login</p>
      </div>

      <button onClick={() => { setDone(null); setForm({ companyName: '', name: '', email: '', phone: '', password: '', confirm: '' }); }} style={btnPrimary}>+ Create Another</button>
      <button onClick={onSwitch} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#a78bfa', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>← Back to Sign In</button>
    </motion.div>
  );

  /* Form */
  return (
    <motion.div {...card} style={{ ...glass, padding: '32px 36px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '4px 14px', marginBottom: '12px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase' }}>HR / Admin Only</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>Create Employee</h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Login ID will be auto-generated</p>
      </div>

      {/* Logo row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, height: '44px', border: '1.5px dashed rgba(124,58,237,0.4)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.06)', overflow: 'hidden' }}>
          {logoPreview ? <img src={logoPreview} alt="logo" style={{ height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>App / Web Logo</span>}
        </div>
        <button type="button" onClick={() => logoRef.current?.click()} style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
          <Upload size={16} />
        </button>
        <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setLogoPreview(ev.target.result); r.readAsDataURL(f); }} />
      </div>

      {errors.submit && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#fca5a5' }}>⚠️ {errors.submit}</div>}

      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><Lbl>Company Name :-</Lbl><IconInput icon={Building2} value={form.companyName} onChange={set('companyName')} placeholder="Odoo India" error={errors.companyName} /></div>
          <div><Lbl>Name :-</Lbl><IconInput icon={User} value={form.name} onChange={set('name')} placeholder="John Doe" error={errors.name} /></div>
          <div><Lbl>Email :-</Lbl><IconInput icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="john@company.com" error={errors.email} /></div>
          <div><Lbl>Phone :-</Lbl><IconInput icon={Phone} type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" error={errors.phone} /></div>
          <div><Lbl>Password :-</Lbl><PwField value={form.password} onChange={set('password')} error={errors.password} /></div>
          <div><Lbl>Confirm Password :-</Lbl><PwField value={form.confirm} onChange={set('confirm')} error={errors.confirm} /></div>
        </div>

        {preview && (
          <div style={{ marginTop: '16px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '14px', padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Preview — Login ID</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', fontFamily: 'monospace', letterSpacing: '2px' }}>{preview}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>[CO][FN][LN][YEAR][0001]</div>
          </div>
        )}

        <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: '18px' }}>
          {loading ? <Spinner /> : <><UserPlus size={16} /> Sign Up</>}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '16px' }}>
        Already have an account?{' '}
        <button onClick={onSwitch} style={{ color: '#a78bfa', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sign In</button>
      </p>

      <div style={{ marginTop: '16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '12px 14px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#fbbf24', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={12} /> Note</p>
        <ul style={{ fontSize: '11px', color: '#fde68a', lineHeight: 1.7, paddingLeft: '14px', margin: 0 }}>
          <li>Normal users <strong>cannot</strong> self-register.</li>
          <li>Login ID & temp password are <strong>auto-generated</strong>.</li>
          <li>Employee changes password on <strong>first login</strong>.</li>
        </ul>
      </div>
    </motion.div>
  );
}

/* ═══ ROOT ═══ */
export default function Auth() {
  const [view, setView] = useState('signin');
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <AuthBackground3D />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {view === 'signin'
            ? <SignIn key="si" onSwitch={() => setView('signup')} />
            : <SignUp key="su" onSwitch={() => setView('signin')} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
