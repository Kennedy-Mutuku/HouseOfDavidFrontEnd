import React, { useState } from 'react';
import { FiX, FiCalendar, FiDollarSign, FiMessageSquare, FiLock } from 'react-icons/fi';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const GivingModal = ({ isOpen, onClose, givingType, onSuccess }) => {
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    message: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    idNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.idNumber) {
      toast.error('Please enter both email and ID number');
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await login(loginData.email, loginData.idNumber, 'user');

      if (result.success) {
        setLoginData({ email: '', idNumber: '' });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/donations/my-giving', {
        donationType: givingType,
        amount: parseFloat(formData.amount),
        date: formData.date,
        message: formData.message,
        status: 'Completed'
      });

      if (response.data.success) {
        toast.success('Your giving has been recorded successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          message: ''
        });
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to record giving';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
            aria-label="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-white">Record {givingType}</h2>
          <p className="text-orange-100 text-sm mt-1">
            {isAuthenticated ? 'Track your contribution' : 'Login required to record giving'}
          </p>
        </div>

        {/* Conditional Content */}
        {!isAuthenticated ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="p-6 space-y-5">
            <div className="flex flex-col items-center mb-4">
              <div className="bg-orange-100 rounded-full p-4 mb-3">
                <FiLock className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
              <p className="text-gray-600 text-center mt-2">
                Please login to record your giving
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* ID Number Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                ID Number
              </label>
              <input
                type="text"
                name="idNumber"
                value={loginData.idNumber}
                onChange={handleLoginChange}
                placeholder="Enter your ID number"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        ) : (
          /* Giving Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date Field */}
          <div>
            <label className="flex items-center text-gray-700 font-semibold mb-2">
              <FiCalendar className="mr-2 text-orange-500" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Amount Field */}
          <div>
            <label className="flex items-center text-gray-700 font-semibold mb-2">
              <FiDollarSign className="mr-2 text-orange-500" />
              Amount (KSH)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="flex items-center text-gray-700 font-semibold mb-2">
              <FiMessageSquare className="mr-2 text-orange-500" />
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Prayer point, M-Pesa message, or any note..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can add prayer points, transaction details, or any accompanying message
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default GivingModal;
