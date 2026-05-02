import { createContext, useContext, useState, useEffect } from 'react';
import { getMeAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('empay_token');
    const savedUser = localStorage.getItem('empay_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        getMeAPI()
          .then((res) => {
            setUser(res.data.user);
            setEmployee(res.data.user.employee || null);
          })
          .catch(() => {
            localStorage.removeItem('empay_token');
            localStorage.removeItem('empay_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData, employeeData) => {
    localStorage.setItem('empay_token', token);
    localStorage.setItem('empay_user', JSON.stringify(userData));
    setUser(userData);
    setEmployee(employeeData);
  };

  const logout = () => {
    localStorage.removeItem('empay_token');
    localStorage.removeItem('empay_user');
    setUser(null);
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ user, employee, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
