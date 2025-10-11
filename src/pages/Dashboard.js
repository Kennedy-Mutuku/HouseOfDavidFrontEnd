import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    members: { total: 0, active: 0 },
    events: { total: 0, upcoming: 0 },
    donations: { total: 0, amount: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [membersRes, donationsRes] = await Promise.all([
        axios.get('/members/stats'),
        axios.get('/donations/stats')
      ]);

      if (membersRes.data.success) {
        setStats(prev => ({
          ...prev,
          members: {
            total: membersRes.data.data.total,
            active: membersRes.data.data.active
          }
        }));
      }

      if (donationsRes.data.success) {
        setStats(prev => ({
          ...prev,
          donations: {
            total: donationsRes.data.data.total.count,
            amount: donationsRes.data.data.total.amount
          }
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening in your church today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Members"
          value={loading ? '...' : stats.members.total}
          icon={FiUsers}
          color="blue"
        />
        <StatsCard
          title="Active Members"
          value={loading ? '...' : stats.members.active}
          icon={FiTrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Donations"
          value={loading ? '...' : stats.donations.total}
          icon={FiDollarSign}
          color="purple"
        />
        <StatsCard
          title="Total Amount"
          value={loading ? '...' : `$${stats.donations.amount.toLocaleString()}`}
          icon={FiDollarSign}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <a
              href="/members"
              className="block p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <h4 className="font-medium text-primary-900">Manage Members</h4>
              <p className="text-sm text-primary-700 mt-1">Add, edit, or view member information</p>
            </a>
            <a
              href="/events"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <h4 className="font-medium text-green-900">Manage Events</h4>
              <p className="text-sm text-green-700 mt-1">Create and manage church events</p>
            </a>
            <a
              href="/donations"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <h4 className="font-medium text-purple-900">Record Donations</h4>
              <p className="text-sm text-purple-700 mt-1">Track tithes and offerings</p>
            </a>
          </div>
        </Card>

        <Card title="System Information">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Your Role</span>
              <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
