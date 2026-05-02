import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeAPI, updateEmployeeAPI, changePasswordAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Shield, Wallet, FileText, Save, Eye, EyeOff, Edit3 } from 'lucide-react';

export default function EmployeeProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('resume');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);

  const isAdmin = ['admin', 'hr_officer'].includes(user?.role);
  const isPayroll = user?.role === 'payroll_officer';
  const isSelf = employee?.user_id === user?.id;
  const canEdit = isAdmin || isSelf;
  const canSeeSalary = isAdmin || isPayroll;

  const TABS = [
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'private', label: 'Private Info', icon: User },
    ...(canSeeSalary ? [{ id: 'salary', label: 'Salary Info', icon: Wallet }] : []),
    { id: 'security', label: 'Security', icon: Shield },
  ];

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getEmployeeAPI(id);
      const e = res.data.employee;
      setEmployee(e);
      setForm({
        department: e.department || '', designation: e.designation || '',
        phone: e.phone || '', address: e.address || '',
        date_of_birth: e.date_of_birth || '', gender: e.gender || 'male',
        marital_status: e.marital_status || 'single', nationality: e.nationality || 'Indian',
        blood_group: e.blood_group || '',
        emergency_contact_name: e.emergency_contact_name || '',
        emergency_contact_phone: e.emergency_contact_phone || '',
        emergency_contact_relation: e.emergency_contact_relation || '',
        bank_name: e.bank_name || '', bank_account_no: e.bank_account_no || '',
        ifsc_code: e.ifsc_code || '', pan_number: e.pan_number || '',
        aadhar_number: e.aadhar_number || '',
        personal_email: e.personal_email || '', mailing_address: e.mailing_address || '',
        education: e.education || '', work_experience: e.work_experience || '',
        skills: e.skills || '', bio: e.bio || '',
        about_job: e.about_job || '', interests: e.interests || '',
        // Salary
        wage_type: e.wage_type || 'fixed',
        monthly_wage: e.monthly_wage || 0,
        working_days_per_month: e.working_days_per_month || 26,
        basic_salary: e.basic_salary || 0, hra: e.hra || 0,
        conveyance: e.conveyance || 0, medical_allowance: e.medical_allowance || 0,
        special_allowance: e.special_allowance || 0,
        performance_bonus: e.performance_bonus || 0,
        leave_travel_allowance: e.leave_travel_allowance || 0,
        pf_rate: e.pf_rate ?? 12, professional_tax: e.professional_tax ?? 200,
        state: e.state || 'Maharashtra',
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try { await updateEmployeeAPI(id, form); toast.success('Profile updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.new_password.length < 6) return toast.error('Minimum 6 characters');
    try {
      await changePasswordAPI({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // Auto-calculate salary components from monthly_wage
  const autoCalcSalary = (wage) => {
    const basic = Math.round(wage * 0.50);
    const hra = Math.round(basic * 0.50);
    const conveyance = Math.round(wage * 0.0467);
    const medical = Math.round(wage * 0.05);
    const lta = Math.round(wage * 0.0833);
    const perf = Math.round(wage * 0.0833);
    const special = Math.max(0, wage - basic - hra - conveyance - medical - lta - perf);
    setForm(f => ({
      ...f, monthly_wage: wage, basic_salary: basic, hra, conveyance,
      medical_allowance: medical, special_allowance: special,
      performance_bonus: perf, leave_travel_allowance: lta,
    }));
  };

  if (loading) return <div className="page-container"><div className="page-loader"><div className="loader"></div></div></div>;
  if (!employee) return <div className="page-container"><p>Employee not found</p></div>;

  const totalComp = (form.basic_salary||0)+(form.hra||0)+(form.conveyance||0)+(form.medical_allowance||0)+(form.special_allowance||0)+(form.performance_bonus||0)+(form.leave_travel_allowance||0);
  const pfAmount = Math.round((form.basic_salary||0) * (form.pf_rate||12) / 100);
  const netPay = totalComp - pfAmount - (form.professional_tax||0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1>My Profile</h1>
        </div>
        {canEdit && tab !== 'security' && (
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-header-card">
        <div style={{ position: 'relative' }}>
          <div className="profile-avatar-lg">{employee.user?.name?.charAt(0).toUpperCase()}</div>
          {canEdit && <button style={{ position:'absolute',bottom:-2,right:-2,width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'2px solid #020817',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff',padding:0 }}><Edit3 size={12}/></button>}
        </div>
        <div className="profile-meta">
          <h2>{employee.user?.name}</h2>
          <p className="text-muted" style={{fontSize:'13px'}}>{form.designation || 'No Position'}</p>
          {form.bio && <p style={{fontSize:'12px',color:'#64748b',marginTop:'4px',fontStyle:'italic'}}>"{form.bio}"</p>}
          <div className="profile-badges">
            <span className="code-badge">{employee.employee_code}</span>
            {employee.login_id && <span className="badge badge-indigo">ID: {employee.login_id}</span>}
            <span className="badge badge-blue">{employee.department || 'No Dept'}</span>
            <span className={`badge ${employee.is_active ? 'badge-green' : 'badge-red'}`}>{employee.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`profile-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {/* ===== RESUME TAB ===== */}
        {tab === 'resume' && (
          <div className="profile-section">
            <div className="section-card">
              <h3>Bio</h3>
              {canEdit ? <textarea className="profile-textarea" rows={2} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="A short bio about yourself..." />
                : <pre className="profile-pre">{form.bio || 'No bio'}</pre>}
            </div>
            <div className="section-card">
              <h3>Work Experience</h3>
              {canEdit ? <textarea className="profile-textarea" rows={5} value={form.work_experience} onChange={e => setForm({...form, work_experience: e.target.value})} placeholder='2022-2024: Software Engineer at TechCorp' />
                : <pre className="profile-pre">{form.work_experience || 'No experience listed'}</pre>}
            </div>
            <div className="section-card">
              <h3>Education</h3>
              {canEdit ? <textarea className="profile-textarea" rows={4} value={form.education} onChange={e => setForm({...form, education: e.target.value})} placeholder='B.Tech CS - MIT (2020)' />
                : <pre className="profile-pre">{form.education || 'No education listed'}</pre>}
            </div>
            <div className="section-card">
              <h3>Skills</h3>
              {canEdit ? <textarea className="profile-textarea" rows={2} value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder='React, Node.js, Python' />
                : <div className="skills-tags">{(form.skills||'').split(',').filter(Boolean).map((s,i) => <span key={i} className="skill-tag">{s.trim()}</span>)}</div>}
            </div>
            <div className="section-card">
              <h3>🎯 What I love about my job</h3>
              {canEdit ? <textarea className="profile-textarea" rows={3} value={form.about_job} onChange={e => setForm({...form, about_job: e.target.value})} placeholder="What makes you love coming to work every day?" />
                : <pre className="profile-pre">{form.about_job || 'Not added yet'}</pre>}
            </div>
            <div className="section-card">
              <h3>🎨 My interests and hobbies</h3>
              {canEdit ? <textarea className="profile-textarea" rows={3} value={form.interests} onChange={e => setForm({...form, interests: e.target.value})} placeholder="Photography, hiking, reading sci-fi novels..." />
                : <pre className="profile-pre">{form.interests || 'Not added yet'}</pre>}
            </div>
          </div>
        )}

        {/* ===== PRIVATE INFO TAB ===== */}
        {tab === 'private' && (
          <div className="profile-section">
            <div className="section-card">
              <h3>Personal Details</h3>
              <div className="form-grid">
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} disabled={!canEdit} /></div>
                <div className="form-group"><label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} disabled={!canEdit}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select></div>
                <div className="form-group"><label>Marital Status</label>
                  <select value={form.marital_status} onChange={e => setForm({...form, marital_status: e.target.value})} disabled={!canEdit}>
                    <option value="single">Single</option><option value="married">Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option>
                  </select></div>
                <div className="form-group"><label>Nationality</label><input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} disabled={!canEdit} /></div>
                <div className="form-group"><label>Blood Group</label><input value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} placeholder="e.g. O+" disabled={!canEdit} /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} disabled={!canEdit} /></div>
                <div className="form-group"><label>Personal Email</label><input type="email" value={form.personal_email} onChange={e => setForm({...form, personal_email: e.target.value})} placeholder="personal@gmail.com" disabled={!canEdit} /></div>
                <div className="form-group"><label>Date of Joining</label><input type="date" value={employee.joining_date || ''} disabled /></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Address</h3>
              <div className="form-grid">
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Mailing Address</label><textarea rows={2} value={form.mailing_address} onChange={e => setForm({...form, mailing_address: e.target.value})} placeholder="Mailing address" disabled={!canEdit} /></div>
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Permanent Address</label><textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Permanent address" disabled={!canEdit} /></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Bank Details</h3>
              <div className="form-grid">
                <div className="form-group"><label>Bank Name</label><input value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} disabled={!canEdit} /></div>
                <div className="form-group"><label>Account Number</label><input value={form.bank_account_no} onChange={e => setForm({...form, bank_account_no: e.target.value})} disabled={!canEdit} /></div>
                <div className="form-group"><label>IFSC Code</label><input value={form.ifsc_code} onChange={e => setForm({...form, ifsc_code: e.target.value})} disabled={!canEdit} /></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Government IDs</h3>
              <div className="form-grid">
                <div className="form-group"><label>PAN Number</label><input value={form.pan_number} onChange={e => setForm({...form, pan_number: e.target.value})} placeholder="ABCDE1234F" disabled={!canEdit} /></div>
                <div className="form-group"><label>Aadhar Number (UID/AD)</label><input value={form.aadhar_number} onChange={e => setForm({...form, aadhar_number: e.target.value})} placeholder="1234 5678 9012" disabled={!canEdit} /></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Emergency Contact</h3>
              <div className="form-grid">
                <div className="form-group"><label>Contact Name</label><input value={form.emergency_contact_name} onChange={e => setForm({...form, emergency_contact_name: e.target.value})} disabled={!canEdit} /></div>
                <div className="form-group"><label>Phone</label><input value={form.emergency_contact_phone} onChange={e => setForm({...form, emergency_contact_phone: e.target.value})} disabled={!canEdit} /></div>
                <div className="form-group"><label>Relation</label><input value={form.emergency_contact_relation} onChange={e => setForm({...form, emergency_contact_relation: e.target.value})} placeholder="e.g. Father" disabled={!canEdit} /></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Employee Info</h3>
              <div className="form-grid">
                <div className="form-group"><label>Employee Code</label><input value={employee.employee_code || ''} disabled /></div>
                <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} disabled={!isAdmin} /></div>
                <div className="form-group"><label>Designation</label><input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} disabled={!isAdmin} /></div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SALARY INFO TAB (Admin/Payroll Only) ===== */}
        {tab === 'salary' && canSeeSalary && (
          <div className="profile-section">
            {/* Wage Config */}
            <div className="section-card">
              <h3>💰 Wage Configuration</h3>
              <div className="form-grid">
                <div className="form-group"><label>Wage Type</label>
                  <select value={form.wage_type} onChange={e => setForm({...form, wage_type: e.target.value})} disabled={!isAdmin}>
                    <option value="fixed">Fixed Wage</option>
                  </select></div>
                <div className="form-group"><label>Monthly Wage (₹)</label>
                  <input type="number" value={form.monthly_wage} onChange={e => { const v=Number(e.target.value); autoCalcSalary(v); }} disabled={!isAdmin} /></div>
                <div className="form-group"><label>Yearly Wage (₹)</label>
                  <input type="number" value={(form.monthly_wage||0)*12} disabled /></div>
                <div className="form-group"><label>Working Days/Month</label>
                  <input type="number" value={form.working_days_per_month} onChange={e => setForm({...form, working_days_per_month: Number(e.target.value)})} disabled={!isAdmin} /></div>
              </div>
              <p style={{fontSize:'11px',color:'#475569',marginTop:'12px'}}>💡 Salary components auto-calculate when you update Monthly Wage. You can also edit individual components below.</p>
            </div>

            {/* Salary Components */}
            <div className="section-card">
              <h3>📊 Salary Components</h3>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0 4px',fontSize:'13px'}}>
                  <thead><tr style={{color:'#64748b',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.08em'}}>
                    <th style={{textAlign:'left',padding:'8px 12px'}}>Component</th>
                    <th style={{textAlign:'right',padding:'8px 12px'}}>Monthly (₹)</th>
                    <th style={{textAlign:'right',padding:'8px 12px'}}>Yearly (₹)</th>
                    <th style={{textAlign:'right',padding:'8px 12px'}}>% of Wage</th>
                  </tr></thead>
                  <tbody>
                    {[
                      {key:'basic_salary', label:'Basic Salary', pct:50},
                      {key:'hra', label:'HRA', pct: form.monthly_wage ? Math.round((form.hra||0)/form.monthly_wage*100) : 25},
                      {key:'conveyance', label:'Standard Allowance'},
                      {key:'medical_allowance', label:'Medical Allowance'},
                      {key:'performance_bonus', label:'Performance Bonus'},
                      {key:'leave_travel_allowance', label:'Leave Travel Allowance'},
                      {key:'special_allowance', label:'Fixed Allowance'},
                    ].map(c => {
                      const val = form[c.key]||0;
                      const pct = form.monthly_wage ? ((val/form.monthly_wage)*100).toFixed(1) : '0.0';
                      return (
                        <tr key={c.key} style={{background:'rgba(255,255,255,0.02)',borderRadius:'8px'}}>
                          <td style={{padding:'10px 12px',color:'#e2e8f0',fontWeight:500}}>{c.label}</td>
                          <td style={{textAlign:'right',padding:'10px 12px'}}>
                            {isAdmin ? <input type="number" value={val} onChange={e => setForm({...form, [c.key]: Number(e.target.value)})} style={{width:'120px',textAlign:'right'}} /> : <span style={{color:'#f8fafc'}}>₹{val.toLocaleString('en-IN')}</span>}
                          </td>
                          <td style={{textAlign:'right',padding:'10px 12px',color:'#94a3b8'}}>₹{(val*12).toLocaleString('en-IN')}</td>
                          <td style={{textAlign:'right',padding:'10px 12px',color:'#818cf8',fontWeight:600}}>{pct}%</td>
                        </tr>
                      );
                    })}
                    <tr style={{borderTop:'1px solid rgba(255,255,255,0.1)'}}>
                      <td style={{padding:'12px',color:'#34d399',fontWeight:700}}>Gross Salary</td>
                      <td style={{textAlign:'right',padding:'12px',color:'#34d399',fontWeight:700,fontSize:'15px'}}>₹{totalComp.toLocaleString('en-IN')}</td>
                      <td style={{textAlign:'right',padding:'12px',color:'#34d399',fontWeight:600}}>₹{(totalComp*12).toLocaleString('en-IN')}</td>
                      <td style={{textAlign:'right',padding:'12px',color:'#34d399'}}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deductions */}
            <div className="section-card">
              <h3>🔻 Deductions</h3>
              <div className="form-grid">
                <div className="form-group"><label>PF Rate (%)</label>
                  <input type="number" step="0.1" value={form.pf_rate} onChange={e => setForm({...form, pf_rate: Number(e.target.value)})} disabled={!isAdmin} /></div>
                <div className="form-group"><label>PF Amount (₹/month)</label>
                  <input type="number" value={pfAmount} disabled /></div>
                <div className="form-group"><label>Professional Tax (₹/month)</label>
                  <input type="number" value={form.professional_tax} onChange={e => setForm({...form, professional_tax: Number(e.target.value)})} disabled={!isAdmin} /></div>
                <div className="form-group"><label>State (for PT)</label>
                  <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} disabled={!isAdmin} /></div>
              </div>
            </div>

            {/* Net Pay Summary */}
            <div className="section-card ctc-card">
              <h3>Net Pay Summary</h3>
              <div className="ctc-breakdown">
                <div className="ctc-item"><span>Gross Salary</span><span>₹{totalComp.toLocaleString('en-IN')}</span></div>
                <div className="ctc-item" style={{color:'#f87171'}}><span>PF ({form.pf_rate}%)</span><span>-₹{pfAmount.toLocaleString('en-IN')}</span></div>
                <div className="ctc-item" style={{color:'#f87171'}}><span>Professional Tax</span><span>-₹{(form.professional_tax||0).toLocaleString('en-IN')}</span></div>
                <div className="ctc-item total"><span>Net Pay (Monthly)</span><span>₹{netPay.toLocaleString('en-IN')}</span></div>
                <div className="ctc-item"><span>Net Pay (Yearly)</span><span>₹{(netPay*12).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SECURITY TAB ===== */}
        {tab === 'security' && (
          <div className="profile-section">
            <div className="section-card">
              <h3>Account Information</h3>
              <div className="info-grid">
                {employee.login_id && <div className="info-row"><span>Login ID</span><span className="code-badge">{employee.login_id}</span></div>}
                <div className="info-row"><span>Email</span><span>{employee.user?.email}</span></div>
                <div className="info-row"><span>Role</span><span className="badge badge-indigo">{employee.user?.role?.replace('_', ' ')}</span></div>
                <div className="info-row"><span>Joining Date</span><span>{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span></div>
                <div className="info-row"><span>Employee Code</span><span>{employee.employee_code}</span></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Change Password</h3>
              <p style={{fontSize:'12px',color:'#475569',marginBottom:'16px'}}>
                {isAdmin && !isSelf ? 'As an admin, password changes must be done through the password management panel.' : 'Enter your current password and choose a new one.'}
              </p>
              {(isSelf || isAdmin) ? (
                <form onSubmit={handlePasswordChange} className="password-form">
                  {!isAdmin && <div className="form-group"><label>Login ID</label><input value={employee.login_id || employee.employee_code || ''} disabled /></div>}
                  <div className="form-group"><label>{isAdmin && !isSelf ? 'Admin Password' : 'Current Password'}</label>
                    <div className="password-input-wrap">
                      <input type={showPw ? 'text' : 'password'} required value={pwForm.current_password} onChange={e => setPwForm({...pwForm, current_password: e.target.value})} />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                    </div>
                  </div>
                  <div className="form-group"><label>New Password</label><input type="password" required value={pwForm.new_password} minLength={6} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} /></div>
                  <div className="form-group"><label>Confirm New Password</label><input type="password" required value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} /></div>
                  <button type="submit" className="btn-primary"><Shield size={16} /> Reset Password</button>
                </form>
              ) : (
                <p className="text-muted">Only the account owner can change their password.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
