import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const SuperAdminPage = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not superadmin
    if (!isSuperAdmin) {
      navigate('/');
    }
  }, [isSuperAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user?.firstName}</span> ({Array.isArray(user?.role) ? user.role.join(', ').toUpperCase() : user?.role?.toUpperCase()})
              </span>
              <button
                onClick={() => navigate('/admin')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Admin Panel
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Super Admin Control Panel</h2>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="text-purple-700 font-semibold">
              You have full system access with all administrative privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management */}
            <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2 text-red-900">User Management</h3>
              <p className="text-sm text-red-800">Full user control</p>
              <ul className="mt-4 text-sm text-red-700 space-y-1">
                <li>Create/Delete users</li>
                <li>Assign roles</li>
                <li>Manage permissions</li>
                <li>Reset passwords</li>
              </ul>
            </div>

            {/* System Settings */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2 text-orange-900">System Settings</h3>
              <p className="text-sm text-orange-800">Configure system</p>
              <ul className="mt-4 text-sm text-orange-700 space-y-1">
                <li>System configuration</li>
                <li>Security settings</li>
                <li>Email templates</li>
                <li>Backup/Restore</li>
              </ul>
            </div>

            {/* Database Management */}
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2 text-teal-900">Database</h3>
              <p className="text-sm text-teal-800">Database operations</p>
              <ul className="mt-4 text-sm text-teal-700 space-y-1">
                <li>View all records</li>
                <li>Data cleanup</li>
                <li>Export data</li>
                <li>Import data</li>
              </ul>
            </div>

            {/* All Admin Features */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2 text-blue-900">Admin Features</h3>
              <p className="text-sm text-blue-800">Access all admin tools</p>
              <ul className="mt-4 text-sm text-blue-700 space-y-1">
                <li>Members management</li>
                <li>Events & attendance</li>
                <li>Donations & finance</li>
                <li>Content management</li>
              </ul>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2 text-green-900">Reports</h3>
              <p className="text-sm text-green-800">Advanced analytics</p>
              <ul className="mt-4 text-sm text-green-700 space-y-1">
                <li>System usage stats</li>
                <li>User activity logs</li>
                <li>Financial reports</li>
                <li>Custom reports</li>
              </ul>
            </div>

            {/* Audit Logs */}
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2 text-indigo-900">Audit Logs</h3>
              <p className="text-sm text-indigo-800">System monitoring</p>
              <ul className="mt-4 text-sm text-indigo-700 space-y-1">
                <li>View all activities</li>
                <li>Security events</li>
                <li>Error logs</li>
                <li>System health</li>
              </ul>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Events This Month</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-600">$0</div>
              <div className="text-sm text-gray-600">Total Donations</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminPage;
