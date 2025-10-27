import React, { useState } from 'react';
import { FiX, FiUser, FiPhone, FiMessageSquare } from 'react-icons/fi';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const InGatheringModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      toast.error('Please enter visitor name and phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/ingathering', {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim()
        // invitedDate will be set automatically by backend to current time
      });

      if (response.data.success) {
        toast.success('Visitor added successfully!');
        setFormData({
          fullName: '',
          phone: '',
          notes: ''
        });
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add visitor';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      phone: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">ADD IN-GATHERING</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-gray-600 text-sm">
            Record visitors you've invited to church
          </p>

          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-2 flex items-center">
              <FiUser className="mr-2 text-purple-600" />
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Enter visitor's full name"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2 flex items-center">
              <FiPhone className="mr-2 text-purple-600" />
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Enter phone number"
            />
          </div>

          {/* Comment/Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-gray-700 font-semibold mb-2 flex items-center">
              <FiMessageSquare className="mr-2 text-purple-600" />
              Comment
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
              placeholder="Add any notes or comments (optional)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Adding...' : 'Add Visitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InGatheringModal;
