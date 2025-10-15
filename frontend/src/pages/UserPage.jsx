import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';

const UserPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  console.log('UserPage - Auth:', auth);
  console.log('UserPage - User:', auth?.user);

  // Redirect ONLY admin/superadmin to their dashboards, regular users stay here
  useEffect(() => {
    if (auth?.isAuthenticated && auth?.user) {
      console.log('User logged in, checking role...');
      console.log('isAdmin:', auth.isAdmin);
      console.log('isSuperAdmin:', auth.isSuperAdmin);
      console.log('isUser:', auth.isUser);

      if (auth.isSuperAdmin) {
        console.log('Redirecting to superadmin dashboard');
        navigate('/superadmin');
      } else if (auth.isAdmin) {
        console.log('Redirecting to admin dashboard');
        navigate('/admin');
      } else {
        console.log('Regular user - staying on home page');
      }
    }
  }, [auth?.isAuthenticated, auth?.user, auth?.isAdmin, auth?.isSuperAdmin, navigate]);

  const handleLogout = () => {
    console.log('Logging out from UserPage');
    auth.logout();
    navigate('/');
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const getUserRole = () => {
    if (!auth?.user?.role) return 'USER';
    if (Array.isArray(auth.user.role)) {
      return auth.user.role.join(', ').toUpperCase();
    }
    return String(auth.user.role).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">House of David</h1>
            <div className="flex items-center gap-4">
              {auth?.isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-semibold">{auth?.user?.firstName || 'User'}</span> ({getUserRole()})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to House of David</h2>

          {auth?.isAuthenticated ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-blue-700">
                  You are logged in as <span className="font-bold">{getUserRole()}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Profile</h3>
                  <p className="text-sm text-gray-700">Name: {auth?.user?.fullName || `${auth?.user?.firstName} ${auth?.user?.lastName}`}</p>
                  <p className="text-sm text-gray-700">Email: {auth?.user?.email}</p>
                  <p className="text-sm text-gray-700">Role: {getUserRole()}</p>
                </div>

                <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>View Events</li>
                    <li>Check Announcements</li>
                    <li>Submit Feedback</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Resources</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Devotionals</li>
                    <li>News & Updates</li>
                    <li>Contact Information</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl text-gray-600 mb-4">Church Management System</h3>
              <p className="text-gray-500 mb-6">Log in to access administrative features</p>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Login as Admin
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default UserPage;
