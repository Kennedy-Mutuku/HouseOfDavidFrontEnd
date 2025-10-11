import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiBell,
  FiMenu,
  FiX,
  FiCheckCircle
} from 'react-icons/fi';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/user/dashboard', icon: FiHome },
    { name: 'My Giving', path: '/user/giving', icon: FiDollarSign },
    { name: 'Attendance', path: '/user/attendance', icon: FiCheckCircle },
    { name: 'In-Gathering', path: '/user/ingathering', icon: FiUsers },
    { name: 'Announcements', path: '/user/announcements', icon: FiBell },
    { name: 'Feedback', path: '/user/feedback', icon: FiMessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Name */}
            <div className="flex items-center space-x-4">
              <img
                src="/images/logo.jpg"
                alt="House of David Logo"
                className="h-16 w-16 rounded-full border-4 border-gold-400 shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">House of David</h1>
                <p className="text-xs text-gold-300 uppercase tracking-wide">Journey to the Finish</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:text-gold-300 transition-colors"
            >
              {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gold-500 text-primary-900 font-semibold shadow-md'
                        : 'text-white hover:bg-primary-600 hover:text-gold-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile Icon */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-gold-300 text-xs capitalize">{user?.role}</p>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-primary-900 font-bold text-lg border-2 border-white shadow-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {sidebarOpen && (
          <div className="lg:hidden bg-primary-900 border-t border-primary-700">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile User Profile */}
              <div className="flex items-center space-x-3 p-3 bg-primary-800 rounded-lg mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-primary-900 font-bold text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gold-300 text-sm capitalize">{user?.role}</p>
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
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gold-500 text-primary-900 font-semibold'
                        : 'text-white hover:bg-primary-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-3 text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary-900 to-burgundy-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm">&copy; 2024 House of David. All rights reserved.</p>
            <p className="text-xs text-gold-300 mt-1">Journey to the Finish - H.K.C</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
