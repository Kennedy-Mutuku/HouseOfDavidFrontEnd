import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from '../utils/axios';
import { FiDollarSign, FiCheckCircle, FiUsers, FiTrendingUp } from 'react-icons/fi';

// Allowed giving types - ONLY these will be displayed
const ALLOWED_GIVING_TYPES = ['Tithe', 'Offering', 'Extra Givings'];

const OrganizationAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [givingData, setGivingData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [inGatheringData, setInGatheringData] = useState([]);
  const [stats, setStats] = useState({});
  const hasFetchedRef = useRef(false);

  // Color schemes
  const GIVING_COLORS = {
    'Tithe': '#6B2C91',
    'Offering': '#D4AF37',
    'Extra Givings': '#06B6D4'
  };

  const ATTENDANCE_COLORS = {
    'Attended': '#10B981',
    'Missed': '#EF4444'
  };

  const COMPARISON_COLORS = {
    'In-Gatherings': '#06B6D4', // Cyan
    'Nurturing': '#F59E0B'      // Amber/Orange
  };

  const fetchOrganizationAnalytics = useCallback(async () => {
    // Prevent multiple fetches
    if (hasFetchedRef.current) {
      return;
    }

    try {
      hasFetchedRef.current = true;
      setLoading(true);

      // Fetch organization-wide analytics
      const [givingRes, attendanceRes, inGatheringRes, nurturingRes] = await Promise.all([
        axios.get('/donations/stats'),
        axios.get('/attendance-sessions/org-stats'),
        axios.get('/ingathering/org-analytics'),
        axios.get('/nurturing/org-analytics')
      ]);

      // Process giving data - FILTER to only show Tithe, Offering, Extra Givings
      const givingByType = givingRes.data.data.byType || [];
      const givingChartData = givingByType
        .filter(item => ALLOWED_GIVING_TYPES.includes(item._id))
        .map(item => ({
          name: item._id,
          value: item.total
        }))
        .filter(item => item.value > 0);

      setGivingData(givingChartData);

      // Process attendance data
      const attendanceStats = attendanceRes.data.data;
      const attendanceChartData = [
        { name: 'Attended', value: attendanceStats.totalAttendances },
        { name: 'Missed', value: attendanceStats.missedAttendances }
      ].filter(item => item.value > 0);

      setAttendanceData(attendanceChartData);

      // Process in-gathering vs nurturing data
      const inGatheringCount = inGatheringRes.data.data.totalCount || 0;
      const nurturingCount = nurturingRes.data.data.totalCount || 0;

      const comparisonData = [];
      if (inGatheringCount > 0) {
        comparisonData.push({ name: 'In-Gatherings', value: inGatheringCount });
      }
      if (nurturingCount > 0) {
        comparisonData.push({ name: 'Nurturing', value: nurturingCount });
      }

      setInGatheringData(comparisonData);

      // Set summary stats
      setStats({
        totalGiving: givingRes.data.data.total?.amount || 0,
        totalDonations: givingRes.data.data.total?.count || 0,
        attendanceRate: attendanceStats.organizationAttendanceRate || 0,
        totalInGathering: inGatheringCount,
        totalNurturing: nurturingCount
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching organization analytics:', error);

      // Stop infinite retries on 401 errors
      if (error.response?.status === 401) {
        console.warn('Organization analytics: Authentication required');
      }

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizationAnalytics();
  }, [fetchOrganizationAnalytics]);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-purple-200">
          <p className="font-bold text-purple-600">{data.name}</p>
          <p className="text-gray-700">{typeof data.value === 'number' && data.value > 1000
            ? `KSH ${data.value.toLocaleString()}`
            : data.value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-gold-50 rounded-2xl p-6 border-2 border-gold-500 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
          <FiTrendingUp className="w-6 h-6" />
          Organization Analytics Overview
        </h2>
        <p className="text-gray-600 mt-1">Church-wide statistics and trends</p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Giving</p>
              <p className="text-2xl font-bold text-purple-600">KSH {stats.totalGiving?.toLocaleString()}</p>
            </div>
            <FiDollarSign className="w-10 h-10 text-purple-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</p>
            </div>
            <FiCheckCircle className="w-10 h-10 text-green-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">In-Gatherings</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.totalInGathering}</p>
            </div>
            <FiUsers className="w-10 h-10 text-cyan-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Nurturing</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalNurturing}</p>
            </div>
            <FiUsers className="w-10 h-10 text-orange-300" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Giving Breakdown Chart */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-gold-500" />
            Total Giving Breakdown
          </h3>
          {givingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={givingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {givingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GIVING_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No giving data</p>
            </div>
          )}
        </div>

        {/* Attendance Chart */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            Overall Attendance
          </h3>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No attendance data</p>
            </div>
          )}
        </div>

        {/* In-Gatherings vs Nurturing Chart */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-cyan-500" />
            In-Gatherings vs Nurturing
          </h3>
          {inGatheringData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inGatheringData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inGatheringData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COMPARISON_COLORS[entry.name] || '#999'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationAnalytics;
