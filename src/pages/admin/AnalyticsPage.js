import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from '../../utils/axios';
import UniformHeader from '../../components/UniformHeader';
import OrganizationAnalytics from '../../components/OrganizationAnalytics';
import { FiArrowLeft, FiDollarSign, FiUsers, FiCheckCircle, FiHeart, FiTrendingUp } from 'react-icons/fi';

// Allowed giving types - ONLY these will be displayed
const ALLOWED_GIVING_TYPES = ['Tithe', 'Offering', 'Extra Givings'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  const COLORS = ['#6B2C91', '#D4AF37', '#06B6D4', '#10B981', '#EF4444', '#8B5CF6'];

  // Filter giving data to only show allowed types
  const filteredGivingByType = useMemo(() => {
    if (!analyticsData?.giving?.byType) return [];
    return analyticsData.giving.byType.filter(item => ALLOWED_GIVING_TYPES.includes(item._id));
  }, [analyticsData]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics/organization');
      setAnalyticsData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-red-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const { members, giving, attendance, inGathering, nurturing } = analyticsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/superadmin/dashboard"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">Comprehensive Analytics</h1>
          <p className="text-gray-600 mt-2">House of David - Full Church Statistics</p>
        </div>

        {/* Organization Analytics Overview */}
        <div className="mb-8">
          <OrganizationAnalytics />
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Giving Analytics */}
          <Section title="Giving Analytics" icon={<FiDollarSign />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Giving by Type Pie Chart - FILTERED to only show Tithe, Offering, Extra Givings */}
              <ChartCard title="Giving by Type">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={filteredGivingByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="_id"
                    >
                      {filteredGivingByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Top Donors */}
              <ChartCard title="Top 10 Donors">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={giving?.topDonors?.slice(0, 10) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalGiven" fill="#6B2C91" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Monthly Giving Trends */}
              {giving?.monthlyTrends && giving.monthlyTrends.length > 0 && (
                <ChartCard title="Monthly Giving Trends (Last 12 Months)">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={giving.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => `KSH ${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#6B2C91"
                        strokeWidth={2}
                        name="Total Giving"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </div>
          </Section>

          {/* Member Analytics */}
          <Section title="Member Analytics" icon={<FiUsers />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Members by People Group */}
              <ChartCard title="Members by People Group">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={members?.byPeopleGroup || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, count }) => `${_id || 'Not Set'}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="_id"
                    >
                      {(members?.byPeopleGroup || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Members by Growth Group */}
              <ChartCard title="Members by Growth Group">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={members?.byGrowthGroup || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#D4AF37" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Member Growth Trends */}
              {members?.growthTrends && members.growthTrends.length > 0 && (
                <ChartCard title="Member Growth (Last 12 Months)">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={members.growthTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="newMembers"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="New Members"
                      />
                      <Line
                        type="monotone"
                        dataKey="totalMembers"
                        stroke="#6B2C91"
                        strokeWidth={2}
                        name="Total Members"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </div>
          </Section>

          {/* Attendance & In-Gathering */}
          <Section title="Engagement Metrics" icon={<FiTrendingUp />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* In-Gathering by Status */}
              <ChartCard title="In-Gathering Status">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(inGathering?.byStatus?.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                      }, {}) || {}).map(([key, value]) => ({ name: key, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(inGathering?.byStatus || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Nurturing Status */}
              <ChartCard title="Nurturing Status">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(nurturing?.byStatus?.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                  }, {}) || {}).map(([key, value]) => ({ status: key, count: value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    purple: 'border-purple-500 text-purple-600',
    gold: 'border-gold-500 text-gold-600',
    green: 'border-green-500 text-green-600',
    cyan: 'border-cyan-500 text-cyan-600'
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
    <h2 className="text-2xl font-bold text-purple-600 mb-6 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

export default AnalyticsPage;
