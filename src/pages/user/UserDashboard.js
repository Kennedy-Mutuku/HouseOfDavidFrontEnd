import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import {
  FiUser,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiCalendar,
  FiBell
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    totalGiving: 0,
    attendanceCount: 0,
    inGathering: 0
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile with group info
      const profileRes = await axios.get('/auth/me');
      if (profileRes.data.success) {
        setUserProfile(profileRes.data.data);
      }

      // Fetch user stats
      const statsRes = await axios.get('/users/my-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch recent announcements
      const announcementsRes = await axios.get('/announcements?limit=3');
      if (announcementsRes.data.success) {
        setRecentAnnouncements(announcementsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header with User Profile */}
      <div className="bg-gradient-to-r from-primary-700 to-burgundy-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* User Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-primary-900 font-bold text-3xl border-4 border-white shadow-xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-4 border-white"></div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {user?.firstName} {user?.lastName}!
            </h2>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
              <div className="flex items-center justify-center md:justify-start">
                <FiUsers className="w-5 h-5 mr-2 text-gold-300" />
                <span className="text-gold-200">
                  Group: <span className="font-semibold text-white">{userProfile?.group || 'Not Assigned'}</span>
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <FiUser className="w-5 h-5 mr-2 text-gold-300" />
                <span className="text-gold-200">
                  Member Since: <span className="font-semibold text-white">
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : 'N/A'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Giving</p>
              <h3 className="text-2xl font-bold text-primary-800">
                ${stats.totalGiving?.toLocaleString() || '0'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">This year</p>
            </div>
            <div className="bg-gold-100 rounded-full p-4">
              <FiDollarSign className="w-8 h-8 text-gold-600" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance</p>
              <h3 className="text-2xl font-bold text-primary-800">
                {stats.attendanceCount || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Services attended</p>
            </div>
            <div className="bg-primary-100 rounded-full p-4">
              <FiCheckCircle className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-burgundy-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In-Gathering</p>
              <h3 className="text-2xl font-bold text-primary-800">
                {stats.inGathering || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">People invited</p>
            </div>
            <div className="bg-burgundy-100 rounded-full p-4">
              <FiUsers className="w-8 h-8 text-burgundy-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions and Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card title="Quick Actions" className="border-t-4 border-primary-600">
          <div className="space-y-3">
            <a
              href="/user/giving"
              className="block p-4 bg-gradient-to-r from-gold-50 to-gold-100 hover:from-gold-100 hover:to-gold-200 rounded-lg transition-all border border-gold-200"
            >
              <div className="flex items-center">
                <FiDollarSign className="w-6 h-6 text-gold-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Record Giving</h4>
                  <p className="text-sm text-gray-600">Submit tithe, offering, or extra giving</p>
                </div>
              </div>
            </a>

            <a
              href="/user/attendance"
              className="block p-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-lg transition-all border border-primary-200"
            >
              <div className="flex items-center">
                <FiCheckCircle className="w-6 h-6 text-primary-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Sign Attendance</h4>
                  <p className="text-sm text-gray-600">Mark your presence for today's service</p>
                </div>
              </div>
            </a>

            <a
              href="/user/ingathering"
              className="block p-4 bg-gradient-to-r from-burgundy-50 to-burgundy-100 hover:from-burgundy-100 hover:to-burgundy-200 rounded-lg transition-all border border-burgundy-200"
            >
              <div className="flex items-center">
                <FiUsers className="w-6 h-6 text-burgundy-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Add In-Gathering</h4>
                  <p className="text-sm text-gray-600">Record people you've invited</p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        {/* Recent Announcements */}
        <Card title="Recent Announcements" className="border-t-4 border-burgundy-600">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading...</p>
          ) : recentAnnouncements.length === 0 ? (
            <div className="text-center py-8">
              <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((announcement, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <FiBell className="w-5 h-5 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {announcement.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {announcement.content}
                      </p>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <a
                href="/user/announcements"
                className="block text-center text-primary-600 hover:text-primary-800 font-medium text-sm mt-4"
              >
                View All Announcements →
              </a>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card title="Upcoming Events" className="border-t-4 border-gold-500">
        <div className="space-y-3">
          <div className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-white rounded-lg border border-primary-100">
            <div className="bg-primary-600 text-white rounded-lg p-3 mr-4">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Sunday Service</h4>
              <p className="text-sm text-gray-600">Every Sunday, 9:00 AM - 12:00 PM</p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Weekly
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;
