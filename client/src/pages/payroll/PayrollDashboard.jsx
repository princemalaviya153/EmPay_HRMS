import { useState, useEffect } from 'react';
import { getAllPayrollsAPI, generatePayrollAPI, getEmployeesAPI } from '../../api';
import { Wallet, Download, Plus, TrendingUp, IndianRupee, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PayrollDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { load(); }, [month, year]);

  const load = async () => {
    setLoading(true);
    try { 
      const [r, empRes] = await Promise.all([
        getAllPayrollsAPI({ month, year }).catch(() => ({ data: { payrolls: [] } })),
        getEmployeesAPI().catch(() => ({ data: { employees: [] } }))
      ]);
      setPayrolls(r.data.payrolls || []); 
      setEmployees(empRes.data.employees || []);
    }
    catch { } finally { setLoading(false); }
  };

  const totalNet = payrolls.reduce((s, p) => s + (p.net_pay || 0), 0);
  const totalGross = payrolls.reduce((s, p) => s + (p.gross_pay || 0), 0);
  const totalDeductions = payrolls.reduce((s, p) => s + ((p.gross_pay || 0) - (p.net_pay || 0)), 0);

  const summaryCards = [
    { label: 'Total Net Pay', value: `₹${totalNet.toLocaleString()}`, icon: IndianRupee, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
    { label: 'Gross Payroll', value: `₹${totalGross.toLocaleString()}`, icon: TrendingUp, color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
    { label: 'Total Deductions', value: `₹${totalDeductions.toLocaleString()}`, icon: Wallet, color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)' },
    { label: 'Employees Paid', value: payrolls.length, icon: Users, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  ];

  const selectStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', outline: 'none', cursor: 'pointer' };

  const paidIds = payrolls.map(p => p.employee_id);
  const unpaidEmployees = employees.filter(e => !paidIds.includes(e.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c' }}>
              <Wallet size={18} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Payroll
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '14px' }}>{months[month - 1]} {year} payroll summary</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={selectStyle}>
            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={selectStyle}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={async () => { setGenerating(true); try { await generatePayrollAPI({ month, year }); load(); } catch { } finally { setGenerating(false); } }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '10px 18px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
          >
            <Plus size={15} /> {generating ? 'Generating...' : 'Generate Payroll'}
          </motion.button>
        </div>
      </motion.div>

      {/* Unpaid Employees Alert */}
      {!loading && unpaidEmployees.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          style={{
            marginBottom: '28px', background: 'rgba(251, 146, 60, 0.05)', border: '1px solid rgba(251, 146, 60, 0.2)',
            borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px'
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(251, 146, 60, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c', flexShrink: 0 }}>
            <AlertCircle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fcd34d', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
              Pending Payroll Generation
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
              {unpaidEmployees.length} employee{unpaidEmployees.length > 1 ? 's have' : ' has'} not been paid for this period.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {unpaidEmployees.slice(0, 8).map((e, i) => (
                <span key={i} style={{ fontSize: '12px', color: '#fb923c', background: 'rgba(251,146,60,0.1)', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(251,146,60,0.2)' }}>
                  {e.user?.name || e.employee_code}
                </span>
              ))}
              {unpaidEmployees.length > 8 && (
                <span style={{ fontSize: '12px', color: '#94a3b8', padding: '4px 8px' }}>+{unpaidEmployees.length - 8} more</span>
              )}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={async () => { setGenerating(true); try { await generatePayrollAPI({ month, year }); load(); } catch { } finally { setGenerating(false); } }}
            disabled={generating}
            style={{ 
              background: '#fb923c', color: '#fff', border: 'none', borderRadius: '10px', 
              padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {generating ? (
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : <Plus size={16} />}
            {generating ? 'Processing...' : 'Generate For Missing'}
          </motion.button>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.07 }}
            style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '18px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 40px ${c.color}20`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
              <c.icon size={21} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: c.color }}>{c.value}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{c.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payslips Table */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>{payrolls.length} Payslips</span>
          <button 
            onClick={() => {
              if (!payrolls.length) return;
              const headers = ['Employee Name', 'Employee Code', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'];
              const rows = payrolls.map(p => [
                p.employee?.user?.name || '—',
                p.employee?.employee_code || '—',
                p.basic_salary || 0,
                p.allowances || 0,
                (p.gross_pay || 0) - (p.net_pay || 0),
                p.net_pay || 0,
                'Processed'
              ]);
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `payroll_${months[month - 1]}_${year}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '8px', padding: '6px 14px', color: '#818cf8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(251,146,60,0.2)', borderTop: '3px solid #fb923c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Employee', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{p.employee?.user?.name || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{p.employee?.employee_code}</div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>₹{(p.basic_salary || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>+₹{(p.allowances || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#f87171', fontFamily: 'JetBrains Mono, monospace' }}>-₹{((p.gross_pay || 0) - (p.net_pay || 0)).toLocaleString()}</td>
                  <td style={{ padding: '14px 24px', fontSize: '15px', fontWeight: '700', color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>₹{(p.net_pay || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '100px', padding: '4px 12px', color: '#34d399', fontSize: '12px', fontWeight: '600' }}>
                      <CheckCircle size={12} /> Processed
                    </span>
                  </td>
                </motion.tr>
              ))}
              {!payrolls.length && (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                    <Wallet size={48} color="#1e3a5f" style={{ margin: '0 auto 16px', display: 'block' }} />
                    <p style={{ color: '#334155', fontSize: '14px' }}>No payroll for this period. Click "Generate Payroll".</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}

