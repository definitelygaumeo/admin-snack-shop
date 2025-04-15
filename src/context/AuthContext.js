import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

// Tài khoản mặc định cho đăng nhập nội bộ
const DEFAULT_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123',
  userData: {
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin'
  }
};

// Thêm flag để kiểm soát việc sử dụng tài khoản mặc định
const USE_DEFAULT_AUTH = true; // Set true để sử dụng tài khoản mặc định, false để kết nối API

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Kiểm tra token có phải là token mặc định không
      if (token === 'DEFAULT_TOKEN' && USE_DEFAULT_AUTH) {
        setUser(DEFAULT_CREDENTIALS.userData);
        setLoading(false);
      } else {
        fetchUserProfile();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Nếu sử dụng auth mặc định và token là default
      if (USE_DEFAULT_AUTH && localStorage.getItem('token') === 'DEFAULT_TOKEN') {
        setUser(DEFAULT_CREDENTIALS.userData);
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      // Giả sử API trả về thông tin người dùng với các trường name, email, role
      setUser({
        name: response.data.name || 'Admin',
        email: response.data.email,
        role: response.data.role || 'admin'
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra nếu sử dụng tài khoản mặc định
      if (USE_DEFAULT_AUTH && 
          username === DEFAULT_CREDENTIALS.email && 
          password === DEFAULT_CREDENTIALS.password) {
        
        // Tạo token giả và lưu vào localStorage
        localStorage.setItem('token', 'DEFAULT_TOKEN');
        setUser(DEFAULT_CREDENTIALS.userData);
        setLoading(false);
        return true;
      }
      
      // Nếu không phải tài khoản mặc định hoặc không dùng auth mặc định, kết nối với API backend
      const response = await api.post('/auth/login', { email: username, password });
      localStorage.setItem('token', response.data.token);
      await fetchUserProfile();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Nếu đang sử dụng tài khoản mặc định, không cần gọi API logout
      if (USE_DEFAULT_AUTH && localStorage.getItem('token') === 'DEFAULT_TOKEN') {
        localStorage.removeItem('token');
        setUser(null);
        return;
      }
      
      // Gọi API logout nếu backend yêu cầu
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;