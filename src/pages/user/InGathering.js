import React, { useState, useEffect } from 'react';
import { FiPlus, FiUsers, FiUserCheck, FiPhone, FiMail } from 'react-icons/fi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import axios from 'axios';
import { toast } from 'react-toastify';

const InGathering = () => {
  const [inGatheringList, setInGatheringList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    attended: 0,
    pending: 0
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    invitedDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInGatheringData();
  }, []);

  const fetchInGatheringData = async () => {
    try {
      const response = await axios.get('/ingathering/my-ingathering');
      if (response.data.success) {
        setInGatheringList(response.data.data.list);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch in-gathering data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/ingathering', formData);

      if (response.data.success) {
        toast.success('In-gathering record added successfully!');
        setShowAddForm(false);
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          address: '',
          notes: '',
          invitedDate: new Date().toISOString().split('T')[0],
          status: 'Pending'
        });
        fetchInGatheringData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add record');
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
          <h1 className="text-3xl font-bold text-gray-900">In-Gathering</h1>
          <p className="text-gray-600 mt-1">Track people you've invited to church</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800"
        >
          Add Person
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-burgundy-600 to-burgundy-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-burgundy-100 text-sm mb-1">Total Invited</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
            <FiUsers className="w-12 h-12 text-burgundy-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Attended</p>
              <h3 className="text-3xl font-bold">{stats.attended}</h3>
            </div>
            <FiUserCheck className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gold-500 to-gold-600 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-100 text-sm mb-1">Pending</p>
              <h3 className="text-3xl font-bold">{stats.pending}</h3>
            </div>
            <div className="text-4xl text-gold-200">⏳</div>
          </div>
        </Card>
      </div>

      {/* Add Person Form */}
      {showAddForm && (
        <Card title="Add In-Gathering Person" className="border-t-4 border-burgundy-600">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Invited *
                </label>
                <input
                  type="date"
                  name="invitedDate"
                  value={formData.invitedDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Attended">Attended</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add any notes about this person..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800"
              >
                {loading ? 'Adding...' : 'Add Person'}
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

      {/* In-Gathering List */}
      <Card title="My In-Gathering List" className="border-t-4 border-primary-600">
        {inGatheringList.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No in-gathering records yet</p>
            <p className="text-sm text-gray-400 mt-2">Start inviting people and tracking them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inGatheringList.map((person) => (
              <Card key={person._id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="bg-burgundy-100 rounded-full p-3 flex-shrink-0">
                    <FiUsers className="w-6 h-6 text-burgundy-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {person.firstName} {person.lastName}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {person.phone && (
                        <div className="flex items-center">
                          <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                          {person.phone}
                        </div>
                      )}
                      {person.email && (
                        <div className="flex items-center">
                          <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                          {person.email}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        person.status === 'Attended'
                          ? 'bg-green-100 text-green-800'
                          : person.status === 'Pending'
                          ? 'bg-gold-100 text-gold-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {person.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(person.invitedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default InGathering;
