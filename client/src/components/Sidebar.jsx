import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Clock, CalendarDays, Wallet,
  Settings, LogOut, ChevronLeft, ChevronRight, BarChart3,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuConfig = {
  admin: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#818cf8' },
    { path: '/employees', label: 'Employees', icon: Users, color: '#a78bfa' },
    { path: '/attendance', label: 'Attendance', icon: Clock, color: '#38bdf8' },
    { path: '/leaves', label: 'Time Off', icon: CalendarDays, color: '#34d399' },
    { path: '/payroll', label: 'Payroll', icon: Wallet, color: '#fb923c' },
    { path: '/reports', label: 'Reports', icon: BarChart3, color: '#f472b6' },
    { path: '/settings', label: 'Settings', icon: Settings, color: '#94a3b8' },
  ],
  hr_officer: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#818cf8' },
    { path: '/employees', label: 'Employees', icon: Users, color: '#a78bfa' },
    { path: '/attendance', label: 'Attendance', icon: Clock, color: '#38bdf8' },
    { path: '/leaves', label: 'Time Off', icon: CalendarDays, color: '#34d399' },
    { path: '/reports', label: 'Reports', icon: BarChart3, color: '#f472b6' },
  ],
  payroll_officer: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#818cf8' },
    { path: '/attendance', label: 'Attendance', icon: Clock, color: '#38bdf8' },
    { path: '/leaves', label: 'Time Off', icon: CalendarDays, color: '#34d399' },
    { path: '/payroll', label: 'Payroll', icon: Wallet, color: '#fb923c' },
    { path: '/reports', label: 'Reports', icon: BarChart3, color: '#f472b6' },
  ],
  employee: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#818cf8' },
    { path: '/my-attendance', label: 'My Attendance', icon: Clock, color: '#38bdf8' },
    { path: '/my-leaves', label: 'My Leaves', icon: CalendarDays, color: '#34d399' },
    { path: '/my-payslips', label: 'My Payslips', icon: Wallet, color: '#fb923c' },
  ],
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();
  const menu = menuConfig[user?.role] || menuConfig.employee;
  const [hoveredItem, setHoveredItem] = useState(null);

  const W = collapsed ? 72 : 260;

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'rgba(2, 8, 23, 0.92)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)', flexShrink: 0 }} />

      {/* Logo */}
      <div style={{
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', minWidth: 0 }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{
              width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '17px', fontWeight: '900', color: '#fff',
              boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
            }}
          >E</motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, #f8fafc, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>EmPay X</div>
                <div style={{ fontSize: '10px', color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '600', whiteSpace: 'nowrap' }}>HRMS</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#475569', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#818cf8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#475569'; }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 10px' }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: '10px', fontWeight: '700', color: '#1e3a5f', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 8px 8px' }}
            >
              Menu
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menu.map((item) => (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div
                  onHoverStart={() => setHoveredItem(item.path)}
                  onHoverEnd={() => setHoveredItem(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: collapsed ? '11px 0' : '10px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    background: isActive ? `${item.color}18` : hoveredItem === item.path ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div layoutId="activeIndicator"
                      style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '0 3px 3px 0', background: item.color }}
                    />
                  )}
                  {/* Icon with glow on active */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? `${item.color}20` : 'transparent',
                    color: isActive ? item.color : '#475569',
                    transition: 'all 0.15s',
                  }}>
                    <item.icon size={17} />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: '13.5px', fontWeight: isActive ? '600' : '500', color: isActive ? item.color : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden' }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 10px', flexShrink: 0 }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '12px', marginBottom: '8px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', color: '#fff',
              }}>
                {employee?.profile_picture ? (
                  <img src={employee.profile_picture} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover'}} />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: '#334155', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
              </div>
              <Sparkles size={14} color="#6366f1" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: collapsed ? '11px 0' : '10px 12px',
            width: '100%', borderRadius: '12px', border: 'none',
            background: 'transparent', color: '#475569',
            cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start',
            fontSize: '13.5px', fontWeight: '500', fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sign Out</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
