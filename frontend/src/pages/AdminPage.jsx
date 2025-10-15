import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import UserManagement from '../components/UserManagement';

const AdminPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');

  console.log('AdminPage - Auth state:', auth);
  console.log('AdminPage - User:', auth?.user);
  console.log('AdminPage - isAdmin:', auth?.isAdmin);
  console.log('AdminPage - isSuperAdmin:', auth?.isSuperAdmin);

  useEffect(() => {
    console.log('AdminPage useEffect - checking auth');
    if (!auth?.loading && !auth?.isAdmin && !auth?.isSuperAdmin) {
      console.log('Not authorized, redirecting to home');
      navigate('/');
    }
  }, [auth?.isAdmin, auth?.isSuperAdmin, auth?.loading, navigate]);

  const handleLogout = () => {
    console.log('Logging out');
    auth.logout();
    navigate('/');
  };

  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!auth?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">No user found. Redirecting...</div>
      </div>
    );
  }

  const getUserRole = () => {
    if (!auth?.user?.role) return 'USER';
    if (Array.isArray(auth.user.role)) {
      return auth.user.role.join(', ').toUpperCase();
    }
    return String(auth.user.role).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{auth?.user?.firstName || 'Admin'}</span> ({getUserRole()})
              </span>
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
          {activeView === 'dashboard' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Management Panel</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Management */}
                <div
                  onClick={() => {
                    console.log('Switching to users view');
                    setActiveView('users');
                  }}
                  className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2 text-blue-900">User Management</h3>
                  <p className="text-sm text-blue-800">Manage system users</p>
                  <ul className="mt-4 text-sm text-blue-700 space-y-1">
                    <li>Add new users</li>
                    <li>Edit user details</li>
                    <li>View contact requests</li>
                  </ul>
                </div>

                {/* Members Management */}
                <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 text-teal-900">Members</h3>
                  <p className="text-sm text-teal-800">Manage church members</p>
                  <ul className="mt-4 text-sm text-teal-700 space-y-1">
                    <li>Add new members</li>
                    <li>Update member info</li>
                    <li>View member list</li>
                  </ul>
                </div>

                {/* Events Management */}
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 text-purple-900">Events</h3>
                  <p className="text-sm text-purple-800">Organize church events</p>
                  <ul className="mt-4 text-sm text-purple-700 space-y-1">
                    <li>Create events</li>
                    <li>Schedule activities</li>
                    <li>Manage registrations</li>
                  </ul>
                </div>

                {/* Attendance */}
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 text-green-900">Attendance</h3>
                  <p className="text-sm text-green-800">Track attendance</p>
                  <ul className="mt-4 text-sm text-green-700 space-y-1">
                    <li>Record attendance</li>
                    <li>View reports</li>
                    <li>Export data</li>
                  </ul>
                </div>

                {/* Donations */}
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 text-yellow-900">Donations</h3>
                  <p className="text-sm text-yellow-800">Manage donations</p>
                  <ul className="mt-4 text-sm text-yellow-700 space-y-1">
                    <li>Record donations</li>
                    <li>Generate receipts</li>
                    <li>Financial reports</li>
                  </ul>
                </div>

                {/* Content Management */}
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 text-pink-900">Content</h3>
                  <p className="text-sm text-pink-800">Manage content</p>
                  <ul className="mt-4 text-sm text-pink-700 space-y-1">
                    <li>Post announcements</li>
                    <li>Share devotionals</li>
                    <li>Publish news</li>
                  </ul>
                </div>

                {/* Feedback */}
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 text-indigo-900">Feedback</h3>
                  <p className="text-sm text-indigo-800">View feedback</p>
                  <ul className="mt-4 text-sm text-indigo-700 space-y-1">
                    <li>Read submissions</li>
                    <li>Respond to feedback</li>
                    <li>Track issues</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  console.log('Switching back to dashboard');
                  setActiveView('dashboard');
                }}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <UserManagement token={auth?.token || localStorage.getItem('token')} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
