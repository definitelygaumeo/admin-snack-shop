import React, { createContext, useState, useEffect } from 'react';
// import api from '../services/api'; // Tạm thời comment lại

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Thay vì gọi API, chúng ta sẽ set một user giả lập
      setUser({ name: 'Admin', email: 'admin@snackshop.com' });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Thay thế bằng phiên bản giả lập để development
  const fetchUserProfile = async () => {
    // Simulate API call
    setTimeout(() => {
      setUser({ name: 'Admin', email: 'admin@snackshop.com' });
      setLoading(false);
    }, 500);
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra thông tin đăng nhập trực tiếp
      if (username === 'admin' && password === 'admin') {
        // Giả lập API thành công
        localStorage.setItem('token', 'mock-jwt-token-for-admin');
        await fetchUserProfile();
        return true;
      } else {
        // Giả lập API thất bại
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Đăng nhập thất bại');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;