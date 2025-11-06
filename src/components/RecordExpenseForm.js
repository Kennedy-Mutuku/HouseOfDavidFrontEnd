import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';

const RecordExpenseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (file) => {
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || formData.category.trim() === '') {
      toast.error('Please enter a category');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      toast.error('Please provide a description/reason for this expense');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('amount', parseFloat(formData.amount));
      formDataToSend.append('date', formData.date);
      formDataToSend.append('description', formData.description.trim());
      if (formData.receipt) {
        formDataToSend.append('receipt', formData.receipt);
      }

      const response = await axios.post('/financial/expense', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Expense recorded successfully!');
        // Reset form
        setFormData({
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          receipt: null
        });
        setReceiptPreview(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording expense:', error);
      const message = error.response?.data?.message || 'Failed to record expense';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Record Expense</h3>

      {/* Category */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Ministry, Building, Utilities, Salaries, Events"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter your own custom category (e.g., Ministry, Building, Utilities, Salaries, Events, Transport, etc.)
        </p>
      </div>

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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Description/Reason */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Description/Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what this expense was for (required)"
          rows="4"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Receipt Upload with Drag & Drop */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Receipt/Screenshot
        </label>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragging
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-red-400'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 mb-2">Drag and drop receipt here, or</p>
          <label className="inline-block px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 transition-all">
            Browse Files
            <input
              type="file"
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Accepted: Images, PDF, Word, Excel (Max 5MB)
          </p>
        </div>

        {/* File Preview */}
        {formData.receipt && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{formData.receipt.name}</p>
                  <p className="text-xs text-gray-500">
                    {(formData.receipt.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, receipt: null }));
                  setReceiptPreview(null);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {receiptPreview && (
              <div className="mt-3">
                <img src={receiptPreview} alt="Receipt preview" className="max-w-full rounded border" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setFormData({
              category: '',
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
          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Recording...' : 'Record Expense'}
        </button>
      </div>
    </form>
  );
};

export default RecordExpenseForm;
