import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, Command, LogOut, User, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkInAPI, checkOutAPI, getTodayStatusAPI } from '../api';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [todayTime, setTodayTime] = useState(null);
  const menuRef = useRef(null);
  const W = collapsed ? 72 : 260;

  // Close menu on click outside
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Get today's attendance status
  useEffect(() => {
    getTodayStatusAPI()
      .then(res => {
        const att = res.data.attendance;
        if (att && att.check_in && !att.check_out) setCheckedIn(true);
        if (att && att.check_in) setTodayTime(att.check_in);
      })
      .catch(() => {});
  }, []);

  const handleCheckIn = async () => {
    setCheckLoading(true);
    try {
      await checkInAPI();
      setCheckedIn(true);
      setTodayTime(new Date().toISOString());
      toast.success('Checked In successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed'); }
    finally { setCheckLoading(false); }
  };

  const handleCheckOut = async () => {
    setCheckLoading(true);
    try {
      await checkOutAPI();
      setCheckedIn(false);
      toast.success('Checked Out successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Check-out failed'); }
    finally { setCheckLoading(false); }
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    navigate('/login');
  };

  const handleMyProfile = () => {
    setShowMenu(false);
    // Navigate to own employee profile if available
    if (employee?.id) {
      navigate(`/employees/${employee.id}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Status dot color: green = checked in, red = not checked in
  const statusColor = checkedIn ? '#34d399' : '#f43f5e';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020817' }}>
      {/* Subtle ambient gradient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%)',
      }} />

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main */}
      <motion.div
        animate={{ marginLeft: W }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}
      >
        {/* Top bar */}
        <header style={{
          height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(2, 8, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px', padding: '8px 14px', width: '280px',
          }}>
            <Search size={15} color="#334155" />
            <input
              type="text" placeholder="Search..."
              style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: '13.5px', width: '100%' }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '6px', padding: '2px 6px',
            }}>
              <Command size={11} color="#334155" />
              <span style={{ fontSize: '10px', color: '#334155', fontWeight: '600' }}>K</span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Check In / Check Out Button */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={checkedIn ? handleCheckOut : handleCheckIn}
              disabled={checkLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                cursor: checkLoading ? 'wait' : 'pointer', fontSize: '12px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                background: checkedIn
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(52,211,153,0.12)',
                color: checkedIn ? '#f87171' : '#34d399',
                border: checkedIn
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid rgba(52,211,153,0.25)',
              }}
            >
              <Clock size={14} />
              {checkLoading ? '...' : checkedIn ? 'Check Out →' : 'Check In →'}
            </motion.button>

            {/* Notification */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', position: 'relative',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569', cursor: 'pointer',
              }}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: '7px', right: '7px',
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#f43f5e', border: '1.5px solid #020817',
                boxShadow: '0 0 6px rgba(244,63,94,0.6)',
              }} />
            </motion.button>

            {/* Divider */}
            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.06)' }} />

            {/* User avatar with dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                }}
              >
                {/* Avatar with status dot */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color: '#fff',
                    boxShadow: '0 0 16px rgba(99,102,241,0.3)',
                  }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {/* Status dot — green if checked in, red if not */}
                  <div style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: statusColor, border: '2px solid #020817',
                    boxShadow: `0 0 8px ${statusColor}`,
                  }} />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', lineHeight: '1.3' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: '#334155', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
                </div>
                <ChevronDown size={14} style={{ color: '#475569', transition: 'transform 0.2s', transform: showMenu ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                      background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                      padding: '6px', width: '200px', zIndex: 100,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    }}
                  >
                    <button
                      onClick={handleMyProfile}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '10px', border: 'none',
                        background: 'transparent', color: '#94a3b8', cursor: 'pointer',
                        fontSize: '13px', fontWeight: '500', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#a5b4fc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      <User size={15} /> My Profile
                    </button>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '10px', border: 'none',
                        background: 'transparent', color: '#94a3b8', cursor: 'pointer',
                        fontSize: '13px', fontWeight: '500', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
