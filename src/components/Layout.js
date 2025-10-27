import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Members', path: '/members', icon: FiUsers, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Events', path: '/events', icon: FiCalendar, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Donations', path: '/donations', icon: FiDollarSign, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Users', path: '/users', icon: FiSettings, roles: ['admin', 'superadmin'] },
  ];

  const filteredNavigation = navigation.filter(item => hasRole(item.roles));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-primary-800">
          <Link to="/admin/dashboard" className="text-xl font-bold text-white hover:opacity-90 transition-opacity cursor-pointer">
            House of David
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-800">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center px-4 py-2 mb-2 text-gray-300 hover:bg-primary-800 hover:text-white rounded-lg transition-colors"
          >
            <FiUser className="w-4 h-4 mr-3" />
            <span>Profile</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <FiLogOut className="w-4 h-4 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:ml-0 ml-4">
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Welcome, <span className="font-medium">{user?.firstName}</span>
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
