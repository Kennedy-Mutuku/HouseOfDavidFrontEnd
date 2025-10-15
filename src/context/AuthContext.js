import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  axios.defaults.baseURL = API_URL;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password, loginType = 'user') => {
    try {
      let loginData;

      if (loginType === 'admin') {
        // Admin login with username and password
        loginData = { username: identifier, password };
      } else {
        // User login with email and idNumber
        loginData = { email: identifier, idNumber: password };
      }

      const response = await axios.post('/auth/login', loginData);

      if (response.data.success) {
        const { token, ...userData } = response.data.data;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Set user state
        setUser(userData);

        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    if (Array.isArray(roles)) {
      return roles.some(role => userRoles.includes(role));
    }
    return userRoles.includes(roles);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
