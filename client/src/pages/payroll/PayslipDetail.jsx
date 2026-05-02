import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Printer, Plus, CheckCircle, XCircle, Calculator } from 'lucide-react';
import { validatePayslipAPI, cancelPayrollAPI } from '../../api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v || 0);
const fmtN = (v) => `₹ ${Number(v || 0).toFixed(2)}`;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function numToWords(n) {
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (!n || n === 0) return 'Zero Only';
  const num = Math.round(n);
  if (num < 20) return a[num] + ' Only';
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '') + ' Only';
  if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred ' + (num % 100 ? numToWords(num % 100).replace(' Only','') : '') + 'Only';
  if (num < 100000) return numToWords(Math.floor(num / 1000)).replace(' Only','') + ' Thousand ' + (num % 1000 ? numToWords(num % 1000).replace(' Only','') : '') + 'Only';
  if (num < 10000000) return numToWords(Math.floor(num / 100000)).replace(' Only','') + ' Lakh ' + (num % 100000 ? numToWords(num % 100000).replace(' Only','') : '') + 'Only';
  return numToWords(Math.floor(num / 10000000)).replace(' Only','') + ' Crore ' + (num % 10000000 ? numToWords(num % 10000000).replace(' Only','') : '') + 'Only';
}

export default function PayslipDetail({ payslip, onBack, onRefresh }) {
  const [tab, setTab]           = useState('worked');
  const [printing, setPrinting] = useState(false);
  const [acting, setActing]     = useState(false);
  const printRef = useRef();

  if (!payslip) return null;

  const emp       = payslip.employee || {};
  const user      = emp.user || {};
  const month     = payslip.pay_period_month;
  const year      = payslip.pay_period_year;
  const monthName = MONTHS[month - 1];
  const daysInMonth = payslip.days_in_month || 30;
  const daysWorked  = Number(payslip.days_worked || 0);
  const paidLeaves  = Math.max(0, daysInMonth - daysWorked);

  // Salary components
  const basic    = Number(payslip.basic_salary || 0);
  const gross    = Number(payslip.gross_pay || payslip.gross_salary || basic * 2);

  // Use stored breakdown or derive
  const hra      = Number(payslip.hra || gross * 0.25);
  const stdAllow = Number(payslip.standard_allowance || gross * 0.0833);
  const perfBonus= Number(payslip.performance_bonus  || gross * 0.0417);
  const lta      = Number(payslip.lta               || gross * 0.0417);
  const fixedAll = Number(payslip.fixed_allowance    || gross * 0.0833);

  const pfEmp    = Number(payslip.pf_employee     || 0);
  const pfEmployer = Number(payslip.pf_employer   || 0);
  const profTax  = Number(payslip.professional_tax || 0);
  const tds      = Number(payslip.other_deductions || 0);
  const totalDed = Number(payslip.total_deductions || pfEmp + profTax);
  const netPay   = Number(payslip.net_pay || gross - totalDed);

  // Worked days salary amounts
  const dailyRate   = gross / daysInMonth;
  const attendAmt   = parseFloat((dailyRate * daysWorked).toFixed(2));
  const leavesAmt   = 0;

  const isDone      = payslip.status === 'paid';
  const isCancelled = payslip.status === 'cancelled';

  const handleValidate = async () => {
    setActing(true);
    try {
      await validatePayslipAPI(payslip.id);
      toast.success('Payslip validated!');
      onRefresh?.();
      onBack?.();
    } catch { toast.error('Failed to validate'); }
    finally { setActing(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this payslip?')) return;
    setActing(true);
    try {
      await cancelPayrollAPI(payslip.id);
      toast.success('Payslip cancelled');
      onRefresh?.();
      onBack?.();
    } catch { toast.error('Failed to cancel'); }
    finally { setActing(false); }
  };

  const handlePrint = async () => {
    setPrinting(true);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#fff' });
        const pdf    = new jsPDF('p', 'mm', 'a4');
        const w      = pdf.internal.pageSize.getWidth();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
        pdf.save(`Payslip_${user.name}_${monthName}_${year}.pdf`);
      } catch (e) { console.error(e); }
      finally { setPrinting(false); }
    }, 150);
  };

  /* ── Styles ── */
  const card   = { background: '#fff', color: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.08)' };
  const hdrBar = { padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' };
  const btn    = (bg, color, disabled) => ({ padding: '7px 16px', background: bg, color, border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '700', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' });
  const thStyle= { padding: '10px 0', textAlign: 'left', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontWeight: '600' };
  const tdStyle= { padding: '13px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' };

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} style={card}>

      {/* ── Toolbar ── */}
      <div style={hdrBar}>
        <button onClick={onBack} style={{ ...btn('transparent','#64748b'), border: 'none' }}>
          <ChevronLeft size={16} /> Back to Payrun
        </button>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button style={btn('#e0e7ff','#4f46e5')} disabled><Plus size={13} /> New Payslip</button>
          <button style={btn('#dbeafe','#2563eb')} disabled><Calculator size={13} /> Compute</button>
          <button onClick={handleValidate} disabled={acting || isDone || isCancelled} style={btn('#dcfce7','#16a34a', acting || isDone || isCancelled)}>
            <CheckCircle size={13} /> {isDone ? 'Validated' : 'Validate'}
          </button>
          <button onClick={handleCancel} disabled={acting || isDone || isCancelled} style={btn('#fee2e2','#dc2626', acting || isDone || isCancelled)}>
            <XCircle size={13} /> Cancel
          </button>
          <button onClick={handlePrint} disabled={printing} style={btn('#f1f5f9','#475569', printing)}>
            <Printer size={13} /> {printing ? 'Printing…' : 'Print'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '30px 36px' }}>

        {/* Employee info */}
        <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '18px', color: '#0f172a' }}>
          [{user.name || 'Employee'}]
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', fontSize: '14px', marginBottom: '28px' }}>
          <span style={{ color: '#64748b' }}>Payrun</span>
          <span style={{ color: '#3b82f6', fontWeight: '600' }}>Payrun {monthName} {year}</span>
          <span style={{ color: '#64748b' }}>Salary Structure</span>
          <span style={{ color: '#3b82f6', fontWeight: '600' }}>Regular Pay</span>
          <span style={{ color: '#64748b' }}>Period</span>
          <span style={{ color: '#0f172a', fontWeight: '500' }}>01 {monthName} To {new Date(year, month, 0).getDate()} {monthName}</span>
        </div>

        {/* Status badge */}
        {(isDone || isCancelled) && (
          <div style={{ marginBottom: '20px' }}>
            <span style={{ padding: '5px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', background: isDone ? '#dcfce7' : '#fee2e2', color: isDone ? '#16a34a' : '#dc2626' }}>
              {isDone ? '✓ Done' : '✗ Cancelled'}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '22px' }}>
          {[['worked','Worked Days'],['comp','Salary Computation']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '10px 22px', fontSize: '14px', fontWeight: '600', border: 'none', background: 'transparent', cursor: 'pointer',
              borderBottom: tab === key ? '2px solid #3b82f6' : '2px solid transparent',
              color: tab === key ? '#3b82f6' : '#64748b', marginBottom: '-2px',
            }}>{label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Worked Days Tab ── */}
          {tab === 'worked' && (
            <motion.div key="worked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Type</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Days</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}>Attendance</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{daysWorked.toFixed(2)} (5 working days in week)</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>₹ {attendAmt.toFixed(6)}</td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>Paid Time off</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{paidLeaves.toFixed(2)} (2 Paid leaves/Month)</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>₹ {leavesAmt.toFixed(6)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 0', fontWeight: '800', color: '#0f172a' }}>Total</td>
                    <td style={{ padding: '14px 0', fontWeight: '800', color: '#0f172a', textAlign: 'right' }}>{daysInMonth.toFixed(2)}</td>
                    <td style={{ padding: '14px 0', fontWeight: '800', color: '#0f172a', textAlign: 'right' }}>₹ {gross.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: '20px', fontSize: '13px', color: '#64748b', lineHeight: '1.7', maxWidth: '580px' }}>
                Salary is calculated based on the employee's monthly attendance. Paid leaves are included in the total payable days, while unpaid leaves are deducted from the salary.
              </p>
            </motion.div>
          )}

          {/* ── Salary Computation Tab ── */}
          {tab === 'comp' && (
            <motion.div key="comp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Rule Name</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Rate %</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Basic Salary',           rate: 100, amt: basic,     type: 'earn' },
                    { name: 'House Rent Allowance',   rate: 100, amt: hra,       type: 'earn' },
                    { name: 'Standard Allowance',     rate: 100, amt: stdAllow,  type: 'earn' },
                    { name: 'Performance Bonus',      rate: 100, amt: perfBonus, type: 'earn' },
                    { name: 'Leave Travel Allowance', rate: 100, amt: lta,       type: 'earn' },
                    { name: 'Fixed Allowance',        rate: 100, amt: fixedAll,  type: 'earn' },
                    { name: 'Gross',                  rate: 100, amt: gross,     type: 'gross' },
                    { name: 'PF Employee',            rate: 100, amt: pfEmp,     type: 'ded' },
                    { name: "PF Employ'r",            rate: 100, amt: pfEmployer,type: 'ded' },
                    { name: 'Professional Tax',       rate: 100, amt: profTax,   type: 'ded' },
                    { name: 'Net Amount',             rate: 100, amt: netPay,    type: 'net' },
                  ].map((row, i) => {
                    const isGross = row.type === 'gross';
                    const isDed   = row.type === 'ded';
                    const isNet   = row.type === 'net';
                    return (
                      <tr key={i} style={{ borderBottom: isNet ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '11px 0', color: isDed ? '#ef4444' : isNet ? '#16a34a' : isGross ? '#0f172a' : '#334155', fontWeight: isGross || isNet ? '800' : '400', fontSize: isNet ? '16px' : '14px' }}>{row.name}</td>
                        <td style={{ padding: '11px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>{row.rate}</td>
                        <td style={{ padding: '11px 0', textAlign: 'right', fontWeight: isGross || isNet ? '800' : '500', fontSize: isNet ? '16px' : '14px', color: isDed ? '#ef4444' : isNet ? '#16a34a' : '#0f172a' }}>
                          {isDed ? `- ₹ ${row.amt.toFixed(2)}` : `₹ ${row.amt.toFixed(2)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Hidden PDF Print Area ── */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
        <div ref={printRef} style={{ width: '800px', padding: '36px', background: '#fff', color: '#000', fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>

          {/* Company logo */}
          <div style={{ border: '2px solid #14b8a6', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px' }}>EP</div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>[Company Logo]</span>
          </div>

          <h2 style={{ fontSize: '22px', color: '#14b8a6', marginBottom: '18px', fontWeight: '700' }}>Salary slip for month of {monthName} {year}</h2>

          {/* Employee details */}
          <div style={{ border: '1px solid #14b8a6', borderRadius: '10px', padding: '18px 20px', marginBottom: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '8px' }}>
              {[['Employee name', user.name || '-'], ['Employee Code', emp.employee_code || 'EMP-001'], ['Department', emp.department || 'General'], ['Location', emp.location || 'HQ'], ['Date of joining', emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-IN') : '-']].map(([k, v]) => (
                <React.Fragment key={k}><span style={{ color: '#4f46e5', fontWeight: '600' }}>{k}</span><span>: {v}</span></React.Fragment>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: '8px' }}>
              {[['PAN', emp.pan || 'XXXXXXXXXX'], ['UAN', emp.uan || '100000000000'], ['Bank A/C NO.', emp.bank_account || 'XXXXXXXX1234'], ['Pay period', `1/${month}/${year} to ${new Date(year, month, 0).getDate()}/${month}/${year}`], ['Pay date', `5/${month % 12 + 1}/${month === 12 ? year + 1 : year}`]].map(([k, v]) => (
                <React.Fragment key={k}><span style={{ color: '#4f46e5', fontWeight: '600' }}>{k}</span><span>: {v}</span></React.Fragment>
              ))}
            </div>
          </div>

          {/* Worked Days */}
          <div style={{ border: '1px solid #14b8a6', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px' }}>
            <div style={{ background: '#7e22ce', color: '#fff', padding: '11px 18px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span>Worked Days</span><span>Number of Days</span>
            </div>
            <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', color: '#4f46e5' }}>
              <span>Attendance</span><span>{daysWorked} Days</span>
            </div>
            <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span>Total</span><span>{daysInMonth} Days</span>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div style={{ border: '1px solid #14b8a6', borderRadius: '10px', overflow: 'hidden', marginBottom: '0' }}>
            <div style={{ background: '#7e22ce', color: '#fff', padding: '11px 18px', display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', fontWeight: '700', gap: '8px' }}>
              <span>Earnings</span><span>Amounts</span><span style={{ paddingLeft: '20px' }}>Deductions</span><span>Amounts</span>
            </div>
            <div style={{ display: 'flex' }}>
              {/* Earnings col */}
              <div style={{ flex: 1, padding: '12px 18px', borderRight: '1px solid #e2e8f0' }}>
                {[['Basic Salary', basic], ['House Rent Allowance', hra], ['Standard Allowance', stdAllow], ['Performance Bonus', perfBonus], ['Leave Travel Allowance', lta], ['Fixed Allowance', fixedAll], ['Gross', gross]].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: k === 'Gross' ? '700' : '400' }}>
                    <span>{k}</span><span>₹ {Number(v).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {/* Deductions col */}
              <div style={{ flex: 1, padding: '12px 18px 12px 20px' }}>
                {[['PF Employee', pfEmp], ["PF Employ'r", pfEmployer], ['Professional Tax', profTax], ['TDS Deduction', tds]].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{k}</span><span>- ₹ {Number(v).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Total footer */}
            <div style={{ background: '#7e22ce', color: '#fff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>Total Net Payable <span style={{ fontSize: '12px', fontWeight: '400' }}>(Gross Earning − Total deductions)</span></span>
              <div style={{ background: '#14b8a6', padding: '10px 22px', borderRadius: '8px', textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>₹ {netPay.toFixed(2)}</div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>[{numToWords(Math.round(netPay))}]</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
