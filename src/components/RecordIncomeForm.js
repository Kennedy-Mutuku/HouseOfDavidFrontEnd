import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';

const RecordIncomeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'Tithe',
    customCategory: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const predefinedCategories = ['Tithe', 'Offering', 'Extra Givings', 'Custom'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, receipt: file }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const category = formData.category === 'Custom' ? formData.customCategory : formData.category;

    if (!category || category.trim() === '') {
      toast.error('Please enter a category');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', category.trim());
      formDataToSend.append('amount', parseFloat(formData.amount));
      formDataToSend.append('date', formData.date);
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim());
      }
      if (formData.receipt) {
        formDataToSend.append('receipt', formData.receipt);
      }

      const response = await axios.post('/financial/income', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Income recorded successfully!');
        // Reset form
        setFormData({
          category: 'Tithe',
          customCategory: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          receipt: null
        });
        setReceiptPreview(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording income:', error);
      const message = error.response?.data?.message || 'Failed to record income';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Record Income</h3>

      {/* Category Selection */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {predefinedCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Custom Category Input */}
      {formData.category === 'Custom' && (
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Custom Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customCategory"
            value={formData.customCategory}
            onChange={handleChange}
            placeholder="e.g., Mission Fund, Building Fund"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Amount (KSH) <span className="text-red-500">*</span>
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add any notes or details"
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Receipt Upload */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Receipt (Optional)
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted: Images, PDF, Word, Excel (Max 5MB)
        </p>
        {receiptPreview && (
          <div className="mt-3">
            <img src={receiptPreview} alt="Receipt preview" className="max-w-xs rounded border" />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setFormData({
              category: 'Tithe',
              customCategory: '',
              amount: '',
              date: new Date().toISOString().split('T')[0],
              description: '',
              receipt: null
            });
            setReceiptPreview(null);
          }}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Recording...' : 'Record Income'}
        </button>
      </div>
    </form>
  );
};

export default RecordIncomeForm;
