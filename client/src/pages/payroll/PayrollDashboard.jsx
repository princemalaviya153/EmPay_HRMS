import { useState, useEffect, useContext } from 'react';
import { getAllPayrollsAPI, generatePayrollAPI, getEmployeesAPI, validatePayrunAPI } from '../../api';
import { Wallet, Download, Plus, TrendingUp, IndianRupee, Users, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import PayslipDetail from './PayslipDetail';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'paid')      return { bg: '#dcfce7', color: '#16a34a', label: 'Done' };
  if (s === 'processed') return { bg: '#dbeafe', color: '#2563eb', label: 'Processed' };
  if (s === 'cancelled') return { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' };
  return { bg: '#fef9c3', color: '#ca8a04', label: 'Draft' };
};

export default function PayrollDashboard() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin' || user?.role === 'payroll_officer';

  const [payrolls,    setPayrolls]    = useState([]);
  const [employees,   setEmployees]   = useState([]);
  const [month,       setMonth]       = useState(new Date().getMonth() + 1);
  const [year,        setYear]        = useState(new Date().getFullYear());
  const [loading,     setLoading]     = useState(true);
  const [generating,  setGenerating]  = useState(false);
  const [validating,  setValidating]  = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => { load(); }, [month, year]);

  const load = async () => {
    setLoading(true);
    try {
      const [pr, empRes] = await Promise.all([
        getAllPayrollsAPI({ month, year }).catch(() => ({ data: { payrolls: [] } })),
        isAdmin ? getEmployeesAPI().catch(() => ({ data: { employees: [] } })) : Promise.resolve({ data: { employees: [] } }),
      ]);
      setPayrolls(pr.data.payrolls || []);
      setEmployees(empRes.data.employees || []);
    } finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generatePayrollAPI({ month, year });
      toast.success('Payrun generated successfully!');
      load();
    } catch { toast.error('Failed to generate payrun'); }
    finally { setGenerating(false); }
  };

  const handleValidateAll = async () => {
    setValidating(true);
    try {
      const r = await validatePayrunAPI({ month, year });
      toast.success(`${r.data.count} payslips validated!`);
      load();
    } catch { toast.error('Failed to validate payrun'); }
    finally { setValidating(false); }
  };

  const exportCSV = () => {
    if (!payrolls.length) return;
    const headers = ['Pay Period', 'Employee', 'Emp Code', 'Employer Cost', 'Basic Wage', 'Gross Wage', 'Net Wage', 'Status'];
    const rows = payrolls.map(p => [
      `${MONTHS_SHORT[p.pay_period_month - 1]} ${p.pay_period_year}`,
      p.employee?.user?.name || '—',
      p.employee?.employee_code || '—',
      p.employer_cost || 0,
      p.basic_salary || 0,
      p.gross_pay || p.gross_salary || 0,
      p.net_pay || 0,
      p.status,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csv));
    a.setAttribute('download', `payrun_${MONTHS_SHORT[month - 1]}_${year}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const totalNet      = payrolls.reduce((s, p) => s + (p.net_pay || 0), 0);
  const totalGross    = payrolls.reduce((s, p) => s + (p.gross_pay || p.gross_salary || 0), 0);
  const totalDeduct   = payrolls.reduce((s, p) => s + (p.total_deductions || 0), 0);
  const totalEmpCost  = payrolls.reduce((s, p) => s + (p.employer_cost || 0), 0);
  const paidIds       = payrolls.map(p => p.employee_id);
  const unpaid        = employees.filter(e => !paidIds.includes(e.id));
  const allValidated  = payrolls.length > 0 && payrolls.every(p => p.status === 'paid');

  const cards = [
    { label: 'Total Net Pay',    value: `₹${totalNet.toLocaleString('en-IN')}`,     icon: IndianRupee, color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)' },
    { label: 'Gross Payroll',    value: `₹${totalGross.toLocaleString('en-IN')}`,   icon: TrendingUp,  color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
    { label: 'Employer Cost',    value: `₹${totalEmpCost.toLocaleString('en-IN')}`, icon: Wallet,      color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)' },
    { label: 'Employees Paid',   value: payrolls.length,                             icon: Users,       color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)' },
  ];

  const sel = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', cursor: 'pointer' };
  const btnBase = { border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'Inter, sans-serif' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px' }}>
      <AnimatePresence mode="wait">
        {selectedPayslip ? (
          <PayslipDetail
            key="detail"
            payslip={selectedPayslip}
            onBack={() => { setSelectedPayslip(null); load(); }}
            onRefresh={load}
          />
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* ── Header ── */}
            <motion.div initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c' }}>
                    <Wallet size={17} />
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Payroll
                  </h1>
                </div>
                <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>{MONTHS[month - 1]} {year} payroll summary</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={month} onChange={e => setMonth(Number(e.target.value))} style={sel}>
                  {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(Number(e.target.value))} style={sel}>
                  {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {isAdmin && (
                  <>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleGenerate} disabled={generating}
                      style={{ ...btnBase, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', opacity: generating ? 0.7 : 1, boxShadow: '0 4px 18px rgba(99,102,241,0.3)' }}
                    >
                      <Plus size={15} /> {generating ? 'Generating…' : 'Generate Payrun'}
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleValidateAll} disabled={validating || !payrolls.length || allValidated}
                      style={{ ...btnBase, background: allValidated ? 'rgba(34,197,94,0.15)' : '#16a34a', color: allValidated ? '#22c55e' : '#fff', opacity: (validating || !payrolls.length) ? 0.6 : 1 }}
                    >
                      <CheckCircle size={15} /> {allValidated ? 'Validated' : validating ? 'Validating…' : 'Validate'}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>

            {/* ── Unpaid Alert ── */}
            {!loading && unpaid.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                style={{ marginBottom: '24px', background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '14px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '18px' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c', flexShrink: 0 }}>
                  <AlertCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fcd34d', margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>
                    Warning — Payroll Pending
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 10px' }}>
                    {unpaid.length} employee{unpaid.length > 1 ? 's have' : ' has'} no payslip for this period.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {unpaid.slice(0, 8).map((e, i) => (
                      <span key={i} style={{ fontSize: '11px', color: '#fb923c', background: 'rgba(251,146,60,0.1)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(251,146,60,0.2)' }}>
                        {e.user?.name || e.employee_code}
                      </span>
                    ))}
                    {unpaid.length > 8 && <span style={{ fontSize: '11px', color: '#64748b', padding: '3px 8px' }}>+{unpaid.length - 8} more</span>}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleGenerate} disabled={generating} style={{ ...btnBase, background: '#fb923c', color: '#fff', flexShrink: 0, opacity: generating ? 0.7 : 1 }}
                >
                  {generating ? <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Plus size={14} />}
                  {generating ? 'Processing…' : 'Generate Missing'}
                </motion.button>
              </motion.div>
            )}

            {/* ── Summary Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
              {cards.map((c, i) => (
                <motion.div key={c.label} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 + i * 0.06 }}
                  style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 10px 32px ${c.color}20`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                    <c.icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Space Grotesk', color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{c.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Payslip Table (Odoo-style) ── */}
            <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.36 }}
              style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden' }}
            >
              {/* Table Header Bar */}
              <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>
                    Payrun {MONTHS_SHORT[month - 1]} {year}
                  </span>
                  {payrolls.length > 0 && (
                    <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 10px', borderRadius: '100px', border: '1px solid rgba(99,102,241,0.2)' }}>
                      {payrolls.length} payslip{payrolls.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '8px', padding: '6px 14px', color: '#818cf8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  <Download size={12} /> Export CSV
                </button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <div style={{ width: '34px', height: '34px', border: '3px solid rgba(251,146,60,0.2)', borderTop: '3px solid #fb923c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Pay Period', 'Employee', 'Employer Cost', 'Basic Wage', 'Gross Wage', 'Net Wage', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((p, i) => {
                      const st = statusStyle(p.status);
                      const gross = p.gross_pay || p.gross_salary || 0;
                      return (
                        <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          onClick={() => setSelectedPayslip(p)}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Pay Period */}
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                            [{MONTHS_SHORT[p.pay_period_month - 1]} {p.pay_period_year}]
                          </td>
                          {/* Employee */}
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{p.employee?.user?.name || '—'}</div>
                            <div style={{ fontSize: '11px', color: '#475569' }}>{p.employee?.employee_code}</div>
                          </td>
                          {/* Employer Cost */}
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#f472b6', fontFamily: 'JetBrains Mono, monospace' }}>
                            ₹{(p.employer_cost || 0).toLocaleString('en-IN')}
                          </td>
                          {/* Basic Wage */}
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                            ₹{(p.basic_salary || 0).toLocaleString('en-IN')}
                          </td>
                          {/* Gross Wage */}
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>
                            ₹{gross.toLocaleString('en-IN')}
                          </td>
                          {/* Net Wage */}
                          <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700', color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>
                            ₹{(p.net_pay || 0).toLocaleString('en-IN')}
                          </td>
                          {/* Status */}
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: st.bg, color: st.color, borderRadius: '100px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
                              {p.status === 'paid' && <CheckCircle size={11} />} {st.label}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {!payrolls.length && (
                      <tr>
                        <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                          <Wallet size={44} color="#1e3a5f" style={{ margin: '0 auto 14px', display: 'block' }} />
                          <p style={{ color: '#334155', fontSize: '14px' }}>No payslips for this period. Click "Generate Payrun".</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Legend */}
              {payrolls.length > 0 && (
                <div style={{ padding: '12px 22px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexWrap: 'wrap', gap: '18px' }}>
                  {[
                    { label: 'Employer Cost = Employee gross + Employer PF', color: '#64748b' },
                    { label: 'Basic Wage = Employee basic salary', color: '#64748b' },
                    { label: 'Gross Wage = Basic + all allowances', color: '#64748b' },
                    { label: 'Net Wage = Gross − deductions', color: '#64748b' },
                  ].map((l, i) => (
                    <span key={i} style={{ fontSize: '11px', color: l.color }}>• {l.label}</span>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
