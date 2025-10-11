import React, { useState, useEffect } from 'react';
import { FiPlus, FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyGiving = () => {
  const [givingHistory, setGivingHistory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({
    totalTithe: 0,
    totalOffering: 0,
    totalExtra: 0,
    total: 0
  });
  const [formData, setFormData] = useState({
    amount: '',
    donationType: 'Tithe',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGivingData();
  }, []);

  const fetchGivingData = async () => {
    try {
      const response = await axios.get('/donations/my-giving');
      if (response.data.success) {
        setGivingHistory(response.data.data.history);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch giving history');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/donations/my-giving', formData);

      if (response.data.success) {
        toast.success('Giving recorded successfully');
        setShowAddForm(false);
        setFormData({
          amount: '',
          donationType: 'Tithe',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          description: ''
        });
        fetchGivingData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record giving');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Giving</h1>
          <p className="text-gray-600 mt-1">Track your tithes, offerings, and extra giving</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700"
        >
          Record Giving
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Total Tithe</p>
              <h3 className="text-2xl font-bold">${stats.totalTithe.toLocaleString()}</h3>
            </div>
            <FiDollarSign className="w-10 h-10 text-primary-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gold-500 to-gold-600 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-100 text-sm mb-1">Total Offering</p>
              <h3 className="text-2xl font-bold">${stats.totalOffering.toLocaleString()}</h3>
            </div>
            <FiDollarSign className="w-10 h-10 text-gold-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-burgundy-600 to-burgundy-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-burgundy-100 text-sm mb-1">Extra Giving</p>
              <h3 className="text-2xl font-bold">${stats.totalExtra.toLocaleString()}</h3>
            </div>
            <FiDollarSign className="w-10 h-10 text-burgundy-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Giving</p>
              <h3 className="text-2xl font-bold">${stats.total.toLocaleString()}</h3>
            </div>
            <FiTrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </Card>
      </div>

      {/* Add Giving Form */}
      {showAddForm && (
        <Card title="Record New Giving" className="border-t-4 border-gold-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Giving *
                </label>
                <select
                  name="donationType"
                  value={formData.donationType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="Tithe">Tithe</option>
                  <option value="Offering">Offering</option>
                  <option value="Special Offering">Special Offering</option>
                  <option value="Building Fund">Building Fund</option>
                  <option value="Mission">Mission</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Add any notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700"
              >
                {loading ? 'Submitting...' : 'Submit Giving'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Giving History */}
      <Card title="Giving History" className="border-t-4 border-primary-600">
        {givingHistory.length === 0 ? (
          <div className="text-center py-12">
            <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No giving records yet</p>
            <p className="text-sm text-gray-400 mt-2">Click "Record Giving" to add your first entry</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {givingHistory.map((giving) => (
                  <tr key={giving._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(giving.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        giving.donationType === 'Tithe'
                          ? 'bg-primary-100 text-primary-800'
                          : giving.donationType === 'Offering'
                          ? 'bg-gold-100 text-gold-800'
                          : 'bg-burgundy-100 text-burgundy-800'
                      }`}>
                        {giving.donationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${giving.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {giving.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {giving.receiptNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyGiving;
