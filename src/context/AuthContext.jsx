import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const login = async (email, password) => {
    if (!email || !password) return { success: false, error: 'All fields are required' };
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      
      const data = response.data;
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.error || 'Server error during login';
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (name, email, password) => {
    if (!name || !email || !password) return { success: false, error: 'All fields are required' };
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', { name, email, password });
      
      const data = response.data;
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.error || 'Server error during registration';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
