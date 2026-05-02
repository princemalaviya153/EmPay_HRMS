import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyAttendanceAPI, getMyLeavesAPI, getMyPayslipsAPI, checkInAPI, checkOutAPI } from '../../api';
import toast from 'react-hot-toast';
import { Clock, CalendarDays, Wallet, LogIn, LogOut, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({ summary: {}, attendances: [] });
  const [leaves, setLeaves] = useState({ allocations: [] });
  const [lastPay, setLastPay] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const now = new Date();
      const [attRes, leaveRes, payRes] = await Promise.all([
        getMyAttendanceAPI({ month: now.getMonth() + 1, year: now.getFullYear() }).catch(() => ({ data: { summary: {}, attendances: [] } })),
        getMyLeavesAPI().catch(() => ({ data: { allocations: [], leaves: [] } })),
        getMyPayslipsAPI().catch(() => ({ data: { payrolls: [] } })),
      ]);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      const payrolls = payRes.data.payrolls || [];
      if (payrolls.length > 0) setLastPay(payrolls[0]);

      const todayRecord = (attRes.data.attendances || []).find(a => a.date === now.toISOString().split('T')[0]);
      if (todayRecord && !todayRecord.check_out) setCheckedIn(true);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    try {
      await checkInAPI();
      toast.success('Checked in! Have a great day 🎉');
      setCheckedIn(true);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed'); }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutAPI();
      toast.success('Checked out! See you tomorrow 👋');
      setCheckedIn(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-out failed'); }
  };

  const totalLeaveBalance = (leaves.allocations || []).reduce((sum, a) => sum + (a.allocated - a.used), 0);
  const s = attendance.summary || {};
  const attendancePercent = (s.present || 0) + (s.on_leave || 0) > 0
    ? Math.round(((s.present || 0) / ((s.present || 0) + (s.absent || 0) + (s.half_day || 0) + (s.on_leave || 0))) * 100) : 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent tracking-tight">
            {getGreeting()}, {user?.name}! 👋
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-sans">Your personal dashboard</p>
        </div>
        <div>
          {!checkedIn ? (
            <button 
              onClick={handleCheckIn}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
            >
              <LogIn size={20} /> Check In
            </button>
          ) : (
            <button 
              onClick={handleCheckOut}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] transform hover:-translate-y-0.5"
            >
              <LogOut size={20} /> Check Out
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance */}
        <motion.div variants={itemVariants} className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/20"></div>
          <div className="relative flex items-start justify-between">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
              <TrendingUp size={26} />
            </div>
            <div className="text-xs font-semibold text-slate-300 bg-white/10 px-2 py-1 rounded-full">
              This Month
            </div>
          </div>
          <div className="relative mt-6">
            <h3 className="text-4xl font-heading font-bold text-white">{attendancePercent}%</h3>
            <p className="text-slate-400 text-sm mt-1">Attendance Rate</p>
          </div>
        </motion.div>

        {/* Leave Balance */}
        <motion.div variants={itemVariants} className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
          <div className="relative flex items-start justify-between">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <CalendarDays size={26} />
            </div>
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              Available
            </div>
          </div>
          <div className="relative mt-6">
            <h3 className="text-4xl font-heading font-bold text-white">{totalLeaveBalance}</h3>
            <p className="text-slate-400 text-sm mt-1">Leave Balance</p>
          </div>
        </motion.div>

        {/* Last Pay */}
        <motion.div variants={itemVariants} className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden transition-all hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
          <div className="absolute top-0 right-0 p-32 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-violet-500/20"></div>
          <div className="relative flex items-start justify-between">
            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-2xl">
              <Wallet size={26} />
            </div>
            <div className="text-xs font-semibold text-slate-300 bg-white/10 px-2 py-1 rounded-full">
              Latest
            </div>
          </div>
          <div className="relative mt-6">
            <h3 className="text-3xl font-heading font-bold text-white truncate">
              {lastPay ? `₹${lastPay.net_pay?.toLocaleString()}` : '—'}
            </h3>
            <p className="text-slate-400 text-sm mt-1">Last Net Pay</p>
          </div>
        </motion.div>

        {/* Hours */}
        <motion.div variants={itemVariants} className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden transition-all hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-amber-500/20"></div>
          <div className="relative flex items-start justify-between">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
              <Clock size={26} />
            </div>
            <div className="text-xs font-semibold text-slate-300 bg-white/10 px-2 py-1 rounded-full">
              This Month
            </div>
          </div>
          <div className="relative mt-6">
            <h3 className="text-4xl font-heading font-bold text-white">{(s.total_hours || 0).toFixed(1)}h</h3>
            <p className="text-slate-400 text-sm mt-1">Hours Logged</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Leave Balance Details */}
        <motion.div variants={itemVariants} className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="text-xl font-heading font-semibold text-white mb-6 relative">Leave Allocation</h3>
          
          <div className="space-y-6 relative">
            {(leaves.allocations || []).map(a => {
              const percent = a.allocated > 0 ? (a.used / a.allocated) * 100 : 0;
              return (
                <div key={a.leave_type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-200 font-medium capitalize">{a.leave_type}</span>
                    <span className="text-slate-400">
                      <span className="text-white">{a.used}</span> / {a.allocated} used
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {(!leaves.allocations || leaves.allocations.length === 0) && (
              <div className="text-slate-400 text-center py-6">No leave allocations found</div>
            )}
          </div>
        </motion.div>

        {/* Attendance Summary */}
        <motion.div variants={itemVariants} className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
          <h3 className="text-xl font-heading font-semibold text-white mb-6 relative">Attendance Breakdown</h3>
          
          <div className="grid grid-cols-2 gap-4 relative">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
              <span className="text-3xl font-bold text-emerald-400">{s.present || 0}</span>
              <span className="text-slate-400 text-sm">Present</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
              <span className="text-3xl font-bold text-rose-400">{s.absent || 0}</span>
              <span className="text-slate-400 text-sm">Absent</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
              <span className="text-3xl font-bold text-amber-400">{s.half_day || 0}</span>
              <span className="text-slate-400 text-sm">Half Day</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
              <span className="text-3xl font-bold text-indigo-400">{s.on_leave || 0}</span>
              <span className="text-slate-400 text-sm">On Leave</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

