import { useState } from 'react';
import { Settings, Bell, Shield, Palette, Database, Globe, ChevronRight, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const settingsSections = [
  { key: 'general', label: 'General', icon: Settings, color: '#94a3b8' },
  { key: 'notifications', label: 'Notifications', icon: Bell, color: '#fb923c' },
  { key: 'security', label: 'Security', icon: Shield, color: '#f472b6' },
  { key: 'appearance', label: 'Appearance', icon: Palette, color: '#818cf8' },
  { key: 'data', label: 'Data & Backup', icon: Database, color: '#38bdf8' },
  { key: 'localization', label: 'Localization', icon: Globe, color: '#34d399' },
];

function ToggleSwitch({ checked, onChange, color = '#6366f1' }) {
  return (
    <div onClick={onChange} style={{
      width: '44px', height: '24px', borderRadius: '100px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
      background: checked ? color : 'rgba(255,255,255,0.1)',
      border: `1px solid ${checked ? color : 'rgba(255,255,255,0.1)'}`,
      boxShadow: checked ? `0 0 12px ${color}50` : 'none',
    }}>
      <div style={{ position: 'absolute', top: '2px', left: checked ? '22px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState('general');
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'EmPay X Corp',
    companyEmail: 'admin@empay.com',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    emailNotifications: true,
    pushNotifications: false,
    leaveAlerts: true,
    payrollAlerts: true,
    twoFactor: false,
    sessionTimeout: '30',
    darkMode: true,
    compactMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '12px', padding: '12px 14px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' };
  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };

  const renderSection = () => {
    switch (active) {
      case 'general': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>General Settings</h3>
          {[
            { field: 'companyName', label: 'Company Name', type: 'text' },
            { field: 'companyEmail', label: 'Company Email', type: 'email' },
          ].map(({ field, label, type }) => (
            <div key={field}>
              <label style={labelStyle}>{label}</label>
              <input type={type} value={settings[field]} onChange={e => setSettings(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Timezone</label>
              <select value={settings.timezone} onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))} style={inputStyle}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select value={settings.currency} onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))} style={inputStyle}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>
      );
      case 'notifications': return (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}>Notification Preferences</h3>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email', color: '#818cf8' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', color: '#fb923c' },
            { key: 'leaveAlerts', label: 'Leave Request Alerts', desc: 'Notify on new leave requests', color: '#34d399' },
            { key: 'payrollAlerts', label: 'Payroll Alerts', desc: 'Alerts when payroll is processed', color: '#f472b6' },
          ].map(({ key, label, desc, color }) => (
            <div key={key} style={rowStyle}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>{desc}</div>
              </div>
              <ToggleSwitch checked={settings[key]} onChange={() => toggle(key)} color={color} />
            </div>
          ))}
        </div>
      );
      case 'security': return (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}>Security Settings</h3>
          <div style={rowStyle}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '3px' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>Add an extra layer of security</div>
            </div>
            <ToggleSwitch checked={settings.twoFactor} onChange={() => toggle('twoFactor')} color="#f472b6" />
          </div>
          <div style={{ paddingTop: '20px' }}>
            <label style={labelStyle}>Session Timeout (minutes)</label>
            <select value={settings.sessionTimeout} onChange={e => setSettings(p => ({ ...p, sessionTimeout: e.target.value }))} style={inputStyle}>
              {['15', '30', '60', '120'].map(v => <option key={v} value={v}>{v} minutes</option>)}
            </select>
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '14px' }}>
            <p style={{ fontSize: '13px', color: '#f472b6', fontWeight: '600', marginBottom: '4px' }}>⚠️ Danger Zone</p>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>These actions are irreversible. Proceed with caution.</p>
            <button style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', padding: '8px 16px', color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Reset All Data
            </button>
          </div>
        </div>
      );
      case 'appearance': return (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}>Appearance</h3>
          {[
            { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark theme across the platform', color: '#818cf8' },
            { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing for more content', color: '#38bdf8' },
          ].map(({ key, label, desc, color }) => (
            <div key={key} style={rowStyle}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>{desc}</div>
              </div>
              <ToggleSwitch checked={settings[key]} onChange={() => toggle(key)} color={color} />
            </div>
          ))}
          <div style={{ marginTop: '24px' }}>
            <label style={labelStyle}>Accent Color</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'].map(c => (
                <button key={c} style={{ width: '36px', height: '36px', borderRadius: '10px', background: c, border: '2px solid transparent', cursor: 'pointer', boxShadow: `0 4px 12px ${c}50`, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>
        </div>
      );
      default: return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#334155' }}>
          <Settings size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p>Section coming soon</p>
        </div>
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <Settings size={18} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Settings
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '14px' }}>Configure your EmPay X workspace</p>
        </div>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: saved ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '10px 20px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: saved ? '0 4px 20px rgba(5,150,105,0.35)' : '0 4px 20px rgba(99,102,241,0.35)', transition: 'all 0.3s' }}
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </motion.button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '12px', height: 'fit-content' }}>
          {settingsSections.map(s => (
            <button key={s.key} onClick={() => setActive(s.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                padding: '11px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: active === s.key ? `${s.color}15` : 'transparent',
                transition: 'all 0.15s', marginBottom: '2px', fontFamily: 'Inter, sans-serif',
                color: active === s.key ? s.color : '#475569',
              }}
              onMouseEnter={e => { if (active !== s.key) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (active !== s.key) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: active === s.key ? `${s.color}20` : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <s.icon size={15} />
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: active === s.key ? '700' : '500', flex: 1, textAlign: 'left' }}>{s.label}</span>
              {active === s.key && <ChevronRight size={14} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div key={active} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px' }}
        >
          {renderSection()}
        </motion.div>
      </div>
    </motion.div>
  );
}
