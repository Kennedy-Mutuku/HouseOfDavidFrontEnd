import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiCheckCircle, FiUsers, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const UserAnalytics = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [givingData, setGivingData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [inGatheringData, setInGatheringData] = useState([]);
  const [stats, setStats] = useState({});
  const hasFetchedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const COMPARISON_COLORS = {
    'In-Gatherings': '#06B6D4', // Cyan
    'Nurturing': '#F59E0B'      // Amber/Orange
  };

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    // Prevent multiple fetches unless forced
    if (!forceRefresh && (hasFetchedRef.current || !isAuthenticated)) {
      return;
    }

    try {
      if (!forceRefresh) {
        hasFetchedRef.current = true;
      }

      // Use different loading states based on whether this is initial load or refresh
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all analytics data in parallel
      const [givingRes, attendanceRes, inGatheringRes, nurturingRes] = await Promise.all([
        axios.get('/donations/my-giving'),
        axios.get('/attendance-sessions/my-stats'),
        axios.get('/ingathering/my-analytics'),
        axios.get('/nurturing/my-analytics')
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
        totalGiving: givingStats.totalGiving || 0,
        attendanceRate: attendanceStats.attendanceRate || 0,
        totalInGathering: inGatheringCount,
        totalNurturing: nurturingCount
      });

      // Store in localStorage for faster initial load next time
      try {
        const cacheData = {
          givingData: givingChartData,
          attendanceData: attendanceChartData,
          inGatheringData: comparisonData,
          stats: {
            totalGiving: givingStats.totalGiving || 0,
            attendanceRate: attendanceStats.attendanceRate || 0,
            totalInGathering: inGatheringCount,
            totalNurturing: nurturingCount
          },
          timestamp: Date.now()
        };
        localStorage.setItem(`analytics_cache_${user?.id}`, JSON.stringify(cacheData));
      } catch (e) {
        // Ignore localStorage errors
      }

      setLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);

      // Check if it's a 401 - stop trying if unauthorized
      if (error.response?.status === 401) {
        setError('Please log in to view analytics.');
      } else {
        setError('Unable to load analytics data.');
      }
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      // Load cached data immediately for instant display (stale-while-revalidate)
      try {
        const cachedData = localStorage.getItem(`analytics_cache_${user?.id}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;

          // Use cache if less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            setGivingData(parsed.givingData || []);
            setAttendanceData(parsed.attendanceData || []);
            setInGatheringData(parsed.inGatheringData || []);
            setStats(parsed.stats || {});
            setLoading(false);

            // Fetch fresh data in background
            setTimeout(() => fetchAnalytics(true), 100);
            return;
          }
        }
      } catch (e) {
        // Ignore cache errors, proceed with normal fetch
      }

      fetchAnalytics();
    }
  }, [isAuthenticated, fetchAnalytics, user]);

  // Auto-refresh analytics every 30 seconds to catch new attendance/giving
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchAnalytics(true); // Force refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchAnalytics]);

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

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="bg-gradient-to-br from-purple-50 to-gold-50 rounded-2xl p-6 border-2 border-gold-500 shadow-lg animate-pulse">
      <div className="mb-6 flex flex-col items-center">
        <div className="text-center mb-4">
          <div className="h-9 bg-purple-200 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
        </div>
      </div>

      {/* Summary Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-md border-l-4 border-gray-300">
            <div className="text-center">
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-32 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="flex items-center justify-center h-64">
              <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200 shadow-lg">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-red-700 font-semibold text-lg">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleManualRefresh = () => {
    fetchAnalytics(true);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-gold-50 rounded-2xl p-6 border-2 border-gold-500 shadow-lg">
      <div className="mb-6 flex flex-col items-center">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-purple-600">
            My Analytics Overview
          </h2>
          <p className="text-gray-600 mt-2">Track your giving, attendance, and in-gathering activities</p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh analytics"
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">Total Giving</p>
            <p className="text-2xl font-bold text-purple-600">KSH {stats.totalGiving?.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">Attendance Rate</p>
            <p className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-cyan-500">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">In-Gatherings</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.totalInGathering}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">Nurturing</p>
            <p className="text-2xl font-bold text-orange-600">{stats.totalNurturing}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Giving Breakdown Chart */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-gold-500" />
            Giving Breakdown
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
                  formatter={(value, entry) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <FiDollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No giving records yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Chart */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-green-500" />
              Attendance Rate
            </h3>
            {attendanceData.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Total Sessions: {attendanceData.reduce((sum, item) => sum + item.value, 0)}
              </p>
            )}
          </div>
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
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <FiCheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No attendance sessions yet</p>
              </div>
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
                  formatter={(value, entry) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No records yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
