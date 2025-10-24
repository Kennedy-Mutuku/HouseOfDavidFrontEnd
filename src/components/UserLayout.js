import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemberContext } from '../context/MemberContext';
import axios from '../utils/axios';
import {
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiBell,
  FiMenu,
  FiX,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiEdit2
} from 'react-icons/fi';

const UserLayout = () => {
  const location = useLocation();
  const { user, login, logout, isAuthenticated } = useAuth();
  const { getMemberByCredentials, updateMember } = useMemberContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingGroups, setIsEditingGroups] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [loadingMemberData, setLoadingMemberData] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Edit group form state
  const [groupForm, setGroupForm] = useState({
    peopleGroup: '',
    growthGroup: ''
  });

  // Fetch member data when user is authenticated and profile modal is opened
  useEffect(() => {
    if (isAuthenticated && user && showProfileModal && !memberData) {
      fetchMemberData();
    }
  }, [isAuthenticated, user, showProfileModal]);

  const fetchMemberData = async () => {
    if (!user?.email) return;

    setLoadingMemberData(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Fetch all members and find the one matching current user's email
      const response = await axios.get('/members', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const members = response.data.data;
      const matchedMember = members.find(m => m.email.toLowerCase() === user.email.toLowerCase());

      if (matchedMember) {
        setMemberData(matchedMember);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoadingMemberData(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    // Check if trying to log in as admin/superadmin
    const isAdmissionAdmin = loginForm.email === 'admin@admissionadmin.hod.com';
    const isSuperAdmin = loginForm.email === 'admin@superadmin.hod.com';

    if (isAdmissionAdmin || isSuperAdmin) {
      // Admin login - convert email to username
      let username;
      if (isAdmissionAdmin) {
        username = 'ADMISSIONADMIN';
      } else if (isSuperAdmin) {
        username = 'SUPERADMIN2';
      }

      const result = await login(username, loginForm.password, 'admin');

      if (result.success) {
        setShowProfileModal(false);
        setLoginForm({ email: '', password: '' });

        // Redirect based on role
        if (isSuperAdmin) {
          window.location.href = '/superadmin/dashboard';
        } else {
          window.location.href = '/admin/dashboard';
        }
      } else {
        setLoginError('Invalid credentials. Use password: houseofdavid');
      }
    } else {
      // Member login - use email and ID number (password field contains ID number)
      const result = await login(loginForm.email, loginForm.password, 'user');

      if (result.success) {
        setGroupForm({
          peopleGroup: user?.peopleGroup || '',
          growthGroup: user?.growthGroup || ''
        });
        setShowProfileModal(false);
        setLoginForm({ email: '', password: '' });
      } else {
        setLoginError('Invalid email or ID number. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileModal(false);
    setLoginForm({ email: '', password: '' });
    setIsEditingGroups(false);
    setLoginError('');
  };

  const handleClearForm = () => {
    setLoginForm({ email: '', password: '' });
    setLoginError('');
  };

  const handleEditGroups = () => {
    // Initialize form with current member data
    setGroupForm({
      peopleGroup: memberData?.peopleGroup || '',
      growthGroup: memberData?.growthGroup || ''
    });
    setIsEditingGroups(true);
  };

  const handleSaveGroups = async () => {
    if (memberData && memberData._id) {
      try {
        // Update member in database
        await updateMember(memberData._id, {
          peopleGroup: groupForm.peopleGroup,
          growthGroup: groupForm.growthGroup
        });

        // Refresh member data to show updated values
        await fetchMemberData();

        setIsEditingGroups(false);
        setShowProfileModal(false);
      } catch (error) {
        console.error('Error saving groups:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setGroupForm({
      peopleGroup: memberData?.peopleGroup || '',
      growthGroup: memberData?.growthGroup || ''
    });
    setIsEditingGroups(false);
  };

  const navigation = [
    { name: 'Dashboard', path: '/user/dashboard', icon: FiHome }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-purple-900 sticky top-0 z-50 border-b-2 border-gold-400/30">
        <div className="mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex items-center justify-between h-20 lg:h-24 w-full">
            {/* Logo - Far Left on Mobile */}
            <div className="relative flex-shrink-0 lg:mr-5">
              <div className="absolute inset-0 bg-gold-400 rounded-full blur-lg opacity-60 lg:opacity-70"></div>
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 lg:h-20 lg:w-20 rounded-full border-3 lg:border-4 border-gold-400 shadow-2xl ring-2 ring-white/30 overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/images/logo.jpg"
                  alt="House of David Logo"
                  className="w-full h-full object-contain p-0.5 sm:p-1 lg:p-1.5"
                />
              </div>
            </div>

            {/* Text - Centered on All Screen Sizes */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-base sm:text-xl md:text-2xl lg:text-4xl font-extrabold text-white tracking-tight leading-none whitespace-nowrap lg:tracking-wide text-center">
                HOUSE OF DAVID
              </h1>
              <p className="text-[10px] sm:text-xs lg:text-sm text-cyan-300 uppercase tracking-wide lg:tracking-widest font-semibold mt-0.5 lg:mt-1 whitespace-nowrap text-center">
                Journey to the Finish
              </p>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex flex-col items-center px-4 xl:px-5 py-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-cyan-400 text-white font-bold shadow-lg scale-105'
                        : 'text-white hover:bg-white/10 hover:text-cyan-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-1 transition-transform group-hover:scale-110 ${
                      isActive ? '' : 'group-hover:text-cyan-300'
                    }`} />
                    <span className="text-xs font-semibold whitespace-nowrap">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions - Far Right */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-auto">
              {/* User Profile Button - Mobile */}
              <div className="lg:hidden relative">
                <button
                  onClick={() => setShowProfileModal(!showProfileModal)}
                  className="relative"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm sm:text-base border-2 border-gold-400 shadow-lg">
                    {isAuthenticated ? user?.fullName?.split(' ').slice(0, 2).map(n => n[0]).join('') : 'MU'}
                  </div>
                  {isAuthenticated && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>}
                </button>
                <p className="text-[10px] text-white text-center mt-1 font-semibold">
                  {isAuthenticated ? user?.fullName?.split(' ')[0] : 'Log In'}
                </p>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:text-cyan-300 transition-colors p-1"
              >
                {sidebarOpen ? <FiX className="w-6 h-6 sm:w-7 sm:h-7" /> : <FiMenu className="w-6 h-6 sm:w-7 sm:h-7" />}
              </button>

              {/* User Profile Button - Desktop */}
              <button
                onClick={() => setShowProfileModal(!showProfileModal)}
                className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg"
              >
                <div className="text-right">
                  <p className="text-white font-bold text-base tracking-wide">
                    {isAuthenticated ? user?.fullName : 'Log In'}
                  </p>
                  {isAuthenticated && (
                    <p className="text-cyan-300 text-xs capitalize font-semibold tracking-wider">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                      {user?.role}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 flex items-center justify-center text-white font-extrabold text-xl border-3 border-gold-400 shadow-2xl ring-2 ring-white/30">
                    {isAuthenticated ? user?.fullName?.split(' ').slice(0, 2).map(n => n[0]).join('') : 'MU'}
                  </div>
                  {isAuthenticated && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-3 border-white shadow-md"></div>}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden bg-purple-900 border-t border-cyan-300/30 animate-fade-in shadow-2xl">
            <div className="px-3 sm:px-4 py-4 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {/* Mobile User Profile */}
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-purple-800 to-purple-900 rounded-xl mb-3 border border-cyan-400/20 shadow-lg">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-gold-400 shadow-md">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm sm:text-base truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-cyan-300 text-xs sm:text-sm capitalize">{user?.role}</p>
                </div>
              </div>

              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 sm:px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-cyan-400 text-white font-semibold shadow-md'
                        : 'text-white hover:bg-purple-800 hover:text-cyan-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Logo at Top */}
            <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-purple-900 p-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gold-400 rounded-full blur-lg opacity-60"></div>
                <div className="relative h-24 w-24 rounded-full border-4 border-gold-400 shadow-2xl ring-2 ring-white/30 overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src="/images/logo.jpg"
                    alt="House of David Logo"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              /* Logged In View */
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                  Welcome back, {user?.fullName}!
                </h2>

                {/* Continue Button */}
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl mb-6"
                >
                  Continue to House of David
                </button>

                <div className="space-y-3 mb-4">
                  {/* Name */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Name:</p>
                    <p className="text-gray-900 font-medium">{memberData?.fullName || user?.fullName}</p>
                  </div>

                  {/* Email */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Email:</p>
                    <p className="text-blue-600 font-medium text-sm">{memberData?.email || user?.email}</p>
                  </div>

                  {/* Phone */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Phone:</p>
                    <p className="text-gray-900 font-medium">{memberData?.phone || user?.phone || 'Not provided'}</p>
                  </div>

                  {/* Membership Number */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Membership Number:</p>
                    <p className="text-gray-900 font-medium">{memberData?.membershipNumber || 'Not assigned'}</p>
                  </div>

                  {/* ID Number */}
                  {memberData?.idNo && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 font-semibold mb-1">ID Number:</p>
                      <p className="text-gray-900 font-medium">{memberData.idNo}</p>
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Date of Birth:</p>
                    <p className="text-gray-900 font-medium">{formatDate(memberData?.dateOfBirth || user?.dateOfBirth)}</p>
                  </div>

                  {/* Date Joined */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Date Joined Church:</p>
                    <p className="text-gray-900 font-medium">{formatDate(memberData?.membershipDate || user?.dateJoinedCommunity)}</p>
                  </div>

                  {/* People Group - Editable */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-600 font-semibold">People Group:</p>
                      {!isEditingGroups && user?.role !== 'admin' && (
                        <button
                          onClick={handleEditGroups}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {isEditingGroups ? (
                      <select
                        value={groupForm.peopleGroup}
                        onChange={(e) => setGroupForm({ ...groupForm, peopleGroup: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="">Choose...</option>
                        <option value="Youth">Youth</option>
                        <option value="Adults">Adults</option>
                        <option value="Seniors">Seniors</option>
                        <option value="Children">Children</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium">{memberData?.peopleGroup || 'Not set'}</p>
                    )}
                  </div>

                  {/* Growth Group - Editable */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Growth Group:</p>
                    {isEditingGroups ? (
                      <select
                        value={groupForm.growthGroup}
                        onChange={(e) => setGroupForm({ ...groupForm, growthGroup: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="">Choose...</option>
                        <option value="Group A">Group A</option>
                        <option value="Group B">Group B</option>
                        <option value="Group C">Group C</option>
                        <option value="Group D">Group D</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium">{memberData?.growthGroup || 'Not set'}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Role:</p>
                    <p className="text-gray-900 font-medium capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Edit Buttons */}
                {isEditingGroups && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveGroups}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Log Out
                </button>
              </div>
            ) : (
              /* Not Logged In View - Login Form */
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                  Welcome to House of David
                </h2>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Please log in to access your profile and member features.
                </p>

                {/* Error Message */}
                {loginError && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                    <p className="text-sm font-semibold">{loginError}</p>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      e-mail
                    </label>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl"
                    >
                      Next
                    </button>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-center pt-2">
                    <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Forgot password
                    </a>
                  </div>

                  {/* Home Link */}
                  <div className="text-center">
                    <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Home
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white mt-12 border-t-4 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-3">House of David</h3>
              <p className="text-sm text-gray-300">A faith community dedicated to spiritual growth and service.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/user/dashboard" className="text-gray-300 hover:text-cyan-300 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-3">Contact Us</h3>
              <p className="text-sm text-gray-300">For support and inquiries</p>
            </div>
          </div>

          <div className="border-t border-purple-700 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-300">&copy; 2024 House of David. All rights reserved.</p>
            <p className="text-xs text-cyan-300 mt-1 font-semibold uppercase tracking-wide">Journey to the Finish - H.K.C</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
