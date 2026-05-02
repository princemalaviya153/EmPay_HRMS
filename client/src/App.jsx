import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Auth from './pages/auth/Auth';
import Dashboard from './pages/dashboard/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import AttendanceLogs from './pages/attendance/AttendanceLogs';
import LeaveManagement from './pages/leave/LeaveManagement';
import PayrollDashboard from './pages/payroll/PayrollDashboard';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#f1f5f9' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/employees" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<ProtectedRoute roles={['admin', 'hr_officer']}><EmployeeList /></ProtectedRoute>} />
            <Route path="employees/:id" element={<ProtectedRoute roles={['admin', 'hr_officer', 'payroll_officer', 'employee']}><EmployeeProfile /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute roles={['admin', 'hr_officer', 'payroll_officer']}><AttendanceLogs /></ProtectedRoute>} />
            <Route path="my-attendance" element={<AttendanceLogs />} />
            <Route path="leaves" element={<ProtectedRoute roles={['admin', 'hr_officer', 'payroll_officer']}><LeaveManagement /></ProtectedRoute>} />
            <Route path="my-leaves" element={<LeaveManagement />} />
            <Route path="payroll" element={<ProtectedRoute roles={['admin', 'payroll_officer']}><PayrollDashboard /></ProtectedRoute>} />
            <Route path="my-payslips" element={<PayrollDashboard />} />
            <Route path="reports" element={<ProtectedRoute roles={['admin', 'hr_officer', 'payroll_officer']}><Reports /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
