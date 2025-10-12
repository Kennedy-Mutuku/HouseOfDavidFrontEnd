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
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-purple-900 shadow-2xl sticky top-0 z-50 border-b-2 border-gold-400/30">
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

            {/* Text - Center on Mobile, Left on Desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 lg:flex-none">
              <h1 className="text-base sm:text-xl md:text-2xl lg:text-4xl font-extrabold text-white tracking-tight leading-none whitespace-nowrap lg:tracking-wide text-center lg:text-left">
                HOUSE OF DAVID
              </h1>
              <p className="text-[10px] sm:text-xs lg:text-sm text-cyan-300 uppercase tracking-wide lg:tracking-widest font-semibold mt-0.5 lg:mt-1 whitespace-nowrap text-center lg:text-left">
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
              {/* User Profile - Mobile Only */}
              <div className="lg:hidden relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm sm:text-base border-2 border-gold-400 shadow-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:text-cyan-300 transition-colors p-1"
              >
                {sidebarOpen ? <FiX className="w-6 h-6 sm:w-7 sm:h-7" /> : <FiMenu className="w-6 h-6 sm:w-7 sm:h-7" />}
              </button>

              {/* User Profile - Desktop */}
              <div className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
                <div className="text-right">
                  <p className="text-white font-bold text-base tracking-wide">{user?.firstName} {user?.lastName}</p>
                  <p className="text-cyan-300 text-xs capitalize font-semibold tracking-wider">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                    {user?.role}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 flex items-center justify-center text-white font-extrabold text-xl border-3 border-gold-400 shadow-2xl ring-2 ring-white/30">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-3 border-white shadow-md"></div>
                </div>
              </div>
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

              <button
                onClick={logout}
                className="w-full flex items-center justify-center px-3 sm:px-4 py-3 mt-3 text-red-300 hover:text-red-200 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-all border border-red-500/30"
              >
                <span className="font-medium text-sm sm:text-base">Logout</span>
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
      <footer className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white mt-12 border-t-4 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <li><Link to="/user/giving" className="text-gray-300 hover:text-cyan-300 transition-colors">My Giving</Link></li>
                <li><Link to="/user/announcements" className="text-gray-300 hover:text-cyan-300 transition-colors">Announcements</Link></li>
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
