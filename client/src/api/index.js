import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('empay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('empay_token');
      localStorage.removeItem('empay_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');
export const changePasswordAPI = (data) => API.put('/auth/change-password', data);

// Employees
export const getEmployeesAPI = (params) => API.get('/employees', { params });
export const getEmployeeAPI = (id) => API.get(`/employees/${id}`);
export const createEmployeeAPI = (data) => API.post('/employees', data);
export const updateEmployeeAPI = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployeeAPI = (id) => API.delete(`/employees/${id}`);
export const updateEmployeeStatusAPI = (id, data) => API.put(`/employees/${id}`, data);
export const getDepartmentsAPI = () => API.get('/employees/departments');

// Attendance
export const checkInAPI = () => API.post('/attendance/checkin');
export const checkOutAPI = () => API.put('/attendance/checkout');
export const getMyAttendanceAPI = (params) => API.get('/attendance/my', { params });
export const getTodayStatusAPI = () => API.get('/attendance/today');
export const getEmployeeAttendanceAPI = (id, params) => API.get(`/attendance/employee/${id}`, { params });
export const getAllAttendancesAPI = (params) => API.get('/attendance/all', { params });
export const getAttendanceSummaryAPI = (id, month, year) => API.get(`/attendance/summary/${id}/${month}/${year}`);

// Leave
export const applyLeaveAPI = (data) => API.post('/leave/apply', data);
export const getMyLeavesAPI = () => API.get('/leave/my');
export const getAllLeavesAPI = (params) => API.get('/leave/all', { params });
export const approveLeaveAPI = (id) => API.put(`/leave/${id}/approve`);
export const rejectLeaveAPI = (id) => API.put(`/leave/${id}/reject`);
export const allocateLeaveAPI = (data) => API.post('/leave/allocate', data);
export const updateLeaveStatusAPI = (id, status) => status === 'approved' ? API.put(`/leave/${id}/approve`) : API.put(`/leave/${id}/reject`);

// Payroll
export const generatePayrunAPI = (data) => API.post('/payroll/generate', data);
export const generatePayrollAPI = (data) => API.post('/payroll/generate', data);
export const getAllPayrollsAPI = (params) => API.get('/payroll', { params });
export const getMyPayslipsAPI = () => API.get('/payroll/my');
export const getEmployeePayrollAPI = (id) => API.get(`/payroll/employee/${id}`);
export const getPayslipAPI = (id) => API.get(`/payroll/payslip/${id}`);
export const updatePayrollAPI = (id, data) => API.put(`/payroll/${id}`, data);
export const cancelPayrollAPI = (id) => API.put(`/payroll/${id}/cancel`);

// Reports
export const getLaborCostReportAPI = (params) => API.get('/reports/labor-cost', { params });
export const getHeadcountReportAPI = () => API.get('/reports/headcount');
export const getSalaryStatementAPI = (params) => API.get('/reports/salary-statement', { params });

export default API;
