import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import axios from 'axios';
import { toast } from 'react-toastify';

// Credentials Display Modal
const CredentialsModal = ({ isOpen, onClose, credentials }) => {
  const [copied, setCopied] = useState({ username: false, password: false });

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [field]: true }));
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard!`);
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  if (!isOpen || !credentials) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Admin Created Successfully!</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> Save these credentials! The password cannot be retrieved later.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {credentials.firstName} {credentials.lastName}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {credentials.email}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Username (Login Credential)
              </label>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-900 font-mono">
                  {credentials.username}
                </span>
                <button
                  onClick={() => copyToClipboard(credentials.username, 'username')}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Copy username"
                >
                  {copied.username ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Password (Login Credential)
              </label>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-900 font-mono">
                  {credentials.password}
                </span>
                <button
                  onClick={() => copyToClipboard(credentials.password, 'password')}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Copy password"
                >
                  {copied.password ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Login Instructions:</strong><br />
                1. Go to the login page<br />
                2. Select "Admin Login" tab<br />
                3. Enter the username and password shown above
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

// UserFormModal Component
const UserFormModal = ({ isOpen, onClose, onSubmit, user, title }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ['user'],
    username: '',
    password: '',
    idNumber: '',
    phone: '',
    dateOfBirth: '',
    peopleGroup: '',
    growthGroup: '',
    ...user
  });
  const [submitting, setSubmitting] = useState(false);

  const roles = Array.isArray(formData.role) ? formData.role : [formData.role];
  const isAdminRole = roles.includes('admin') || roles.includes('superadmin');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'role') {
      // Handle multiple role selection
      const currentRoles = Array.isArray(formData.role) ? formData.role : [formData.role];
      const newRoles = checked
        ? [...currentRoles, value]
        : currentRoles.filter(r => r !== value);
      setFormData(prev => ({ ...prev, role: newRoles }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create a copy of formData and remove fields based on role
      const submitData = { ...formData };
      const roles = Array.isArray(submitData.role) ? submitData.role : [submitData.role];
      const hasAdminRole = roles.includes('admin') || roles.includes('superadmin');
      const hasUserRole = roles.includes('user');

      if (!hasAdminRole && hasUserRole) {
        // Only user role - remove admin-specific fields
        delete submitData.username;
        delete submitData.password;
      }

      if (hasAdminRole && !hasUserRole) {
        // Only admin roles - remove user-specific fields
        delete submitData.idNumber;
        delete submitData.phone;
        delete submitData.dateOfBirth;
        delete submitData.peopleGroup;
        delete submitData.growthGroup;
      }

      // If both admin and user roles, keep all fields

      await onSubmit(submitData);
    } catch (error) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles * (Select one or more)
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="role"
                  value="user"
                  checked={roles.includes('user')}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">User</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="role"
                  value="admin"
                  checked={roles.includes('admin')}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Admin</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="role"
                  value="superadmin"
                  checked={roles.includes('superadmin')}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Super Admin</span>
              </label>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Admin-Specific Fields */}
          {isAdminRole && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username * (will be converted to uppercase)
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="e.g., ADMIN01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  placeholder={user ? 'Leave blank to keep current password' : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* User-Specific Fields */}
          {!isAdminRole && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number *
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  People Group
                </label>
                <input
                  type="text"
                  name="peopleGroup"
                  value={formData.peopleGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Growth Group
                </label>
                <input
                  type="text"
                  name="growthGroup"
                  value={formData.growthGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Users = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newAdminCredentials, setNewAdminCredentials] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await axios.patch(`/users/${userId}/toggle-status`);

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await axios.delete(`/users/${userId}`);

      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleAddUser = async (userData) => {
    try {
      // Store credentials before sending (password will be hashed in backend)
      const roles = Array.isArray(userData.role) ? userData.role : [userData.role];
      const isAdminRole = roles.includes('admin') || roles.includes('superadmin');

      const credentialsToShow = isAdminRole ? {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username ? userData.username.toUpperCase() : '',
        password: userData.password || '',
        role: roles
      } : null;

      const response = await axios.post('/users', userData);

      if (response.data.success) {
        toast.success(response.data.message);
        setShowAddModal(false);
        fetchUsers();

        // Show credentials modal for admin users
        if (isAdminRole && credentialsToShow && credentialsToShow.username) {
          setNewAdminCredentials(credentialsToShow);
          setShowCredentialsModal(true);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
      throw error;
    }
  };

  const handleEditUser = async (userId, userData) => {
    try {
      const response = await axios.put(`/users/${userId}`, userData);

      if (response.data.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      throw error;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
        <Button variant="primary" icon={FiPlus} onClick={() => setShowAddModal(true)}>
          Add User
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.username ? (
                          <span className="font-mono text-sm font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            {user.username}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.idNumber ? (
                          <span className="font-mono text-sm text-gray-700">
                            {user.idNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {userRoles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                role === 'superadmin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : role === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <FiToggleRight className="w-5 h-5" />
                          ) : (
                            <FiToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        {hasRole('superadmin') && user._id !== currentUser._id && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <UserFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        title="Add New User"
      />

      {/* Edit User Modal */}
      <UserFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={(userData) => handleEditUser(selectedUser._id, userData)}
        user={selectedUser}
        title="Edit User"
      />

      {/* Credentials Display Modal */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => {
          setShowCredentialsModal(false);
          setNewAdminCredentials(null);
        }}
        credentials={newAdminCredentials}
      />
    </div>
  );
};

export default Users;
