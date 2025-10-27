import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from '../utils/axios';
import { FiDollarSign, FiCheckCircle, FiUsers } from 'react-icons/fi';

const MemberAnalytics = ({ memberId }) => {
  const [loading, setLoading] = useState(true);
  const [givingData, setGivingData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [inGatheringData, setInGatheringData] = useState([]);
  const [error, setError] = useState(null);
  const fetchedMemberIdRef = useRef(null);

  // Color schemes
  const GIVING_COLORS = {
    'Tithe': '#6B2C91',        // Purple
    'Offering': '#D4AF37',     // Gold
    'Extra Givings': '#06B6D4' // Cyan
  };

  const ATTENDANCE_COLORS = {
    'Attended': '#10B981',     // Green
    'Missed': '#EF4444'        // Red
  };

  const INGATHERING_COLORS = [
    '#6B2C91', '#8B3DB8', '#AB4EDF', '#CB5FFF', '#DB7FFF', '#EB9FFF'
  ];

  const fetchMemberAnalytics = useCallback(async (memberIdToFetch) => {
    if (!memberIdToFetch || fetchedMemberIdRef.current === memberIdToFetch) {
      return; // Prevent duplicate fetches
    }

    try {
      setLoading(true);
      setError(null);
      fetchedMemberIdRef.current = memberIdToFetch;

      // Fetch all analytics data for the specific member
      const [givingRes, attendanceRes, inGatheringRes] = await Promise.all([
        axios.get(`/donations/member/${memberIdToFetch}`),
        axios.get(`/attendance-sessions/member/${memberIdToFetch}/stats`),
        axios.get(`/ingathering/member/${memberIdToFetch}/analytics`)
      ]);

      // Process giving data - ONLY show Tithe, Offering, Extra Givings
      const givingStats = givingRes.data.data.stats;
      const givingChartData = [];

      if (givingStats.totalTithe > 0) {
        givingChartData.push({ name: 'Tithe', value: givingStats.totalTithe });
      }
      if (givingStats.totalOffering > 0) {
        givingChartData.push({ name: 'Offering', value: givingStats.totalOffering });
      }
      if (givingStats.totalExtraGivings > 0) {
        givingChartData.push({ name: 'Extra Givings', value: givingStats.totalExtraGivings });
      }

      setGivingData(givingChartData);

      // Process attendance data
      const attendanceStats = attendanceRes.data.data;
      const attendanceChartData = [];

      if (attendanceStats.attended > 0 || attendanceStats.missed > 0) {
        if (attendanceStats.attended > 0) {
          attendanceChartData.push({ name: 'Attended', value: attendanceStats.attended });
        }
        if (attendanceStats.missed > 0) {
          attendanceChartData.push({ name: 'Missed', value: attendanceStats.missed });
        }
      }

      setAttendanceData(attendanceChartData);

      // Process in-gathering data - limit to last 6 months
      const inGatheringMonthly = inGatheringRes.data.data.monthlyData || [];
      const last6Months = inGatheringMonthly.slice(-6);

      setInGatheringData(last6Months.map(item => ({
        name: item.month,
        value: item.count
      })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching member analytics:', error);

      // Stop infinite retries on 401 errors
      if (error.response?.status === 401) {
        setError('Authentication required to view analytics');
      } else {
        setError('Failed to load analytics data');
      }

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (memberId && memberId !== fetchedMemberIdRef.current) {
      fetchMemberAnalytics(memberId);
    }
  }, [memberId, fetchMemberAnalytics]);

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

  const CustomTooltip = ({ active, payload, isAttendance, totalSessions }) => {
    if (active && payload && payload.length) {
      const data = payload[0];

      // For attendance, show additional context
      if (isAttendance && totalSessions) {
        const percentage = ((data.value / totalSessions) * 100).toFixed(1);
        return (
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-purple-200">
            <p className="font-bold text-purple-600">{data.name}</p>
            <p className="text-gray-700">{data.value} sessions</p>
            <p className="text-sm text-gray-500">{percentage}% of {totalSessions} total</p>
          </div>
        );
      }

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

  if (!memberId) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-gold-50 rounded-xl p-5 border border-gold-300">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2">
          <FiDollarSign className="w-5 h-5" />
          Member Analytics
        </h3>
        <p className="text-gray-600 text-sm mt-1">Giving, attendance, and in-gathering overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Giving Breakdown Chart */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="text-sm font-bold text-purple-600 mb-2 flex items-center gap-1">
            <FiDollarSign className="w-4 h-4 text-gold-500" />
            Giving
          </h4>
          {givingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={givingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={70}
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
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400">
              <p className="text-xs">No data</p>
            </div>
          )}
        </div>

        {/* Attendance Chart */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="mb-2">
            <h4 className="text-sm font-bold text-purple-600 flex items-center gap-1">
              <FiCheckCircle className="w-4 h-4 text-green-500" />
              Attendance
            </h4>
            {attendanceData.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Total: {attendanceData.reduce((sum, item) => sum + item.value, 0)} sessions
              </p>
            )}
          </div>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <CustomTooltip
                      {...props}
                      isAttendance={true}
                      totalSessions={attendanceData.reduce((sum, item) => sum + item.value, 0)}
                    />
                  )}
                />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400">
              <p className="text-xs">No data</p>
            </div>
          )}
        </div>

        {/* In-Gathering Chart */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="text-sm font-bold text-purple-600 mb-2 flex items-center gap-1">
            <FiUsers className="w-4 h-4 text-cyan-500" />
            In-Gatherings
          </h4>
          {inGatheringData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={inGatheringData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inGatheringData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={INGATHERING_COLORS[index % INGATHERING_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400">
              <p className="text-xs">No data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberAnalytics;
