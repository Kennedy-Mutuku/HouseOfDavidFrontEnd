import { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'requests'
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
    fetchContactRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchContactRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/contact-requests/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContactRequests(response.data.data);
    } catch (err) {
      setError('Failed to fetch contact requests');
    }
  };

  const handleAddUser = async (userData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_BASE}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User added successfully!');
      setShowAddUserForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId, userData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_BASE}/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User updated successfully!');
      setShowEditUserForm(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowAddUserForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
        >
          Add New User
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contact Requests ({contactRequests.length})
          </button>
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Content */}
      {activeTab === 'users' && (
        <UsersTable
          users={users}
          onEdit={(user) => {
            setSelectedUser(user);
            setShowEditUserForm(true);
          }}
        />
      )}

      {activeTab === 'requests' && (
        <ContactRequestsTable
          requests={contactRequests}
          onRefresh={fetchContactRequests}
          token={token}
        />
      )}

      {/* Add User Modal */}
      {showAddUserForm && (
        <UserFormModal
          title="Add New User"
          onClose={() => setShowAddUserForm(false)}
          onSubmit={handleAddUser}
          loading={loading}
        />
      )}

      {/* Edit User Modal */}
      {showEditUserForm && selectedUser && (
        <UserFormModal
          title="Edit User"
          user={selectedUser}
          onClose={() => {
            setShowEditUserForm(false);
            setSelectedUser(null);
          }}
          onSubmit={(data) => handleEditUser(selectedUser._id, data)}
          loading={loading}
        />
      )}
    </div>
  );
};

// Users Table Component
const UsersTable = ({ users, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">People Group</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth Group</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.idNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.peopleGroup || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.growthGroup || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role?.includes('superadmin') ? 'bg-purple-100 text-purple-800' :
                  user.role?.includes('admin') ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {Array.isArray(user.role) ? user.role.join(', ') : user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onEdit(user)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Contact Requests Table Component
const ContactRequestsTable = ({ requests, onRefresh, token }) => {
  const API_BASE = 'http://localhost:5000/api';

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(
        `${API_BASE}/contact-requests/${requestId}`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(
        `${API_BASE}/contact-requests/${requestId}`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {request.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <button
                  onClick={() => handleApprove(request._id)}
                  className="text-green-600 hover:text-green-900"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// User Form Modal Component
const UserFormModal = ({ title, user, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    password: '',
    idNumber: user?.idNumber || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    peopleGroup: user?.peopleGroup || '',
    growthGroup: user?.growthGroup || '',
    role: user?.role ? (Array.isArray(user.role) ? user.role[0] : user.role) : 'user',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert role to array before submitting
    const submitData = { ...formData, role: [formData.role] };
    onSubmit(submitData);
  };

  const isAdminRole = formData.role === 'admin' || formData.role === 'superadmin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {isAdminRole ? (
            <>
              {/* Admin/SuperAdmin Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={!!user}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., ADMIN01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {!user && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!user}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder={user ? "Leave blank to keep current" : "Enter password"}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Regular User Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    required
                    disabled={!!user}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">People Group</label>
                  <input
                    type="text"
                    name="peopleGroup"
                    value={formData.peopleGroup}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Growth Group</label>
                  <input
                    type="text"
                    name="growthGroup"
                    value={formData.growthGroup}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
