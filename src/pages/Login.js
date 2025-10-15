import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Login = () => {
  const [loginType, setLoginType] = useState('user'); // 'admin' or 'user'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    idNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (loginType === 'admin') {
      // Admin login with username and password
      result = await login(formData.username, formData.password, 'admin');
    } else {
      // User login with email and ID number
      result = await login(formData.email, formData.idNumber, 'user');
    }

    if (result.success) {
      // Get user from localStorage after successful login
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Navigate based on user role
        if (user.role === 'user') {
          navigate('/user/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">House of David</h1>
          <p className="text-gray-600">Church Management System</p>
          <p className="text-primary-600 font-semibold mt-4">
            {loginType === 'admin' ? 'Admin Login' : 'Member Login'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginType === 'admin' ? (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your ID number"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          {loginType === 'admin' ? (
            <p className="mt-2">SuperAdmin: SUPERADMIN / superadmin</p>
          ) : (
            <p className="mt-2">User: user@hod.com / (ID Number)</p>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setLoginType(loginType === 'admin' ? 'user' : 'admin')}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            {loginType === 'admin' ? 'Switch to Member Login' : 'Admin Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
