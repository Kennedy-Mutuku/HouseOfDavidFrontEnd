import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiUsers, FiHeart, FiBriefcase, FiAlertCircle, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import axios from '../utils/axios';
import MemberAnalytics from './MemberAnalytics';

const EnhancedMemberDetailModal = ({ isOpen, onClose, member }) => {
  const [activityData, setActivityData] = useState({
    givings: { records: [], stats: { total: 0, offering: 0, tithe: 0, extraGivings: 0 } },
    inGatherings: { records: [], count: 0 },
    nurturing: { records: [], count: 0 },
    attendance: { records: [], stats: { total: 0, rate: 0 } },
    loading: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      // Load cached data immediately for instant display (stale-while-revalidate)
      try {
        const cachedData = localStorage.getItem(`member_activity_${member._id}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;

          // Use cache if less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            setActivityData({
              ...parsed.data,
              loading: false
            });

            // Fetch fresh data in background
            setTimeout(() => fetchMemberActivity(true), 100);
            return;
          }
        }
      } catch (e) {
        // Ignore cache errors, proceed with normal fetch
      }

      fetchMemberActivity(false);
    }
  }, [isOpen, member]);

  const fetchMemberActivity = async (isBackgroundRefresh = false) => {
    if (!member) return;

    try {
      // If it's a background refresh, only set refreshing state, not loading
      if (isBackgroundRefresh) {
        setIsRefreshing(true);
      } else {
        setActivityData(prev => ({ ...prev, loading: true }));
      }

      console.log('[MemberDetail] Fetching data for member:', member._id, member.email);

      // Fetch all activity data in parallel
      const [givingsRes, inGatheringsRes, nurturingRes, attendanceRes] = await Promise.allSettled([
        axios.get(`/donations/member/${member._id}`),
        axios.get(`/ingathering/member/${member._id}`),
        axios.get(`/nurturing/member/${member._id}`),
        axios.get(`/attendance-sessions/member/${member._id}/stats`)
      ]);

      // Process givings data - use the SAME structure as the backend returns
      const givingsResponse = givingsRes.status === 'fulfilled' && givingsRes.value ? givingsRes.value.data : { data: { stats: {}, history: [] } };
      const givingsData = givingsResponse.data?.history || [];
      const backendStats = givingsResponse.data?.stats || {};

      console.log('[MemberDetail] Givings response:', givingsResponse);
      console.log('[MemberDetail] Backend stats received:', backendStats);
      console.log('[MemberDetail] Raw givingsRes:', givingsRes);

      // Use backend stats directly - they already have the correct totals
      // Also fallback to calculating from history if stats are not available
      const calculatedTotal = givingsData
        .filter(d => d.status === 'Completed')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const calculatedOffering = givingsData
        .filter(d => d.status === 'Completed' && d.donationType === 'Offering')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const calculatedTithe = givingsData
        .filter(d => d.status === 'Completed' && d.donationType === 'Tithe')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const calculatedExtraGivings = givingsData
        .filter(d => d.status === 'Completed' && d.donationType === 'Extra Givings')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const givingStats = {
        total: backendStats.total || backendStats.totalGiving || calculatedTotal,
        offering: backendStats.totalOffering || calculatedOffering,
        tithe: backendStats.totalTithe || calculatedTithe,
        extraGivings: backendStats.totalExtraGivings || calculatedExtraGivings
      };

      console.log('[MemberDetail] Calculated stats from history:', {
        calculatedTotal,
        calculatedOffering,
        calculatedTithe,
        calculatedExtraGivings,
        recordCount: givingsData.length
      });
      console.log('[MemberDetail] Final giving stats (using backend or calculated):', givingStats);

      // Process in-gatherings data
      const inGatheringsResponse = inGatheringsRes.status === 'fulfilled' && inGatheringsRes.value ? inGatheringsRes.value.data : { data: { history: [], total: 0 } };

      // Handle both formats: array or {history, total} object
      let inGatheringsData = [];
      let inGatheringsTotal = 0;

      if (Array.isArray(inGatheringsResponse.data)) {
        inGatheringsData = inGatheringsResponse.data;
        inGatheringsTotal = inGatheringsData.length;
      } else if (inGatheringsResponse.data && typeof inGatheringsResponse.data === 'object') {
        inGatheringsData = inGatheringsResponse.data.history || [];
        inGatheringsTotal = inGatheringsResponse.data.total || inGatheringsData.length;
      }

      console.log('[MemberDetail] In-gatherings response:', inGatheringsResponse);
      console.log('[MemberDetail] In-gatherings data:', inGatheringsData);
      console.log('[MemberDetail] In-gatherings total:', inGatheringsTotal);

      // Process nurturing data
      const nurturingResponse = nurturingRes.status === 'fulfilled' && nurturingRes.value ? nurturingRes.value.data : { data: [] };
      const nurturingData = Array.isArray(nurturingResponse.data) ? nurturingResponse.data : [];

      console.log('[MemberDetail] Nurturing response:', nurturingResponse);
      console.log('[MemberDetail] Nurturing data:', nurturingData);

      // Process attendance data - use the stats endpoint response
      const attendanceResponse = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data : { data: { attended: 0, missed: 0, attendanceRate: 0 } };
      const attendanceStatsData = attendanceResponse.data || { attended: 0, missed: 0, attendanceRate: 0 };

      console.log('[MemberDetail] Attendance stats:', attendanceStatsData);

      const finalActivityData = {
        givings: { records: givingsData, stats: givingStats, count: givingsData.length },
        inGatherings: { records: inGatheringsData.slice(0, 5), count: inGatheringsTotal },
        nurturing: { records: nurturingData.slice(0, 5), count: nurturingData.length },
        attendance: {
          records: [],
          stats: {
            total: (attendanceStatsData.attended || 0) + (attendanceStatsData.missed || 0),
            rate: attendanceStatsData.attendanceRate || 0
          }
        },
        loading: false
      };

      setActivityData(finalActivityData);

      // Cache the data for faster subsequent loads
      try {
        const cacheData = {
          data: finalActivityData,
          timestamp: Date.now()
        };
        localStorage.setItem(`member_activity_${member._id}`, JSON.stringify(cacheData));
      } catch (e) {
        // Ignore localStorage errors
      }

      console.log('[MemberDetail] Final activity data:', {
        givingsCount: givingsData.length,
        givingStats,
        inGatheringsCount: inGatheringsData.length,
        nurturingCount: nurturingData.length,
        attendanceRate: attendanceStatsData.attendanceRate
      });
    } catch (error) {
      console.error('Error fetching member activity:', error);
      setActivityData(prev => ({ ...prev, loading: false }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-GB', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `KSH ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      {/* Personal Info Skeleton */}
      <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Membership Info Skeleton */}
      <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-56 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-28"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl p-4 h-32"></div>
        ))}
      </div>

      {/* Analytics Skeleton */}
      <div className="bg-gray-100 rounded-xl p-5 border border-gray-300">
        <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 h-64"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Member Information</h2>
              <p className="text-sm text-cyan-100">{member.fullName || `${member.firstName} ${member.lastName}`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {activityData.loading ? (
            <SkeletonLoader />
          ) : (
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200">
              <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField icon={<FiUser />} label="Full Name" value={member.fullName || `${member.firstName || ''} ${member.lastName || ''}`} />
                <InfoField icon={<FiMail />} label="Email" value={member.email || 'Not provided'} />
                <InfoField icon={<FiPhone />} label="Phone" value={member.phone || 'Not provided'} />
                <InfoField icon={<FiCalendar />} label="Date of Birth" value={formatDate(member.dateOfBirth)} />
                {member.idNo && <InfoField icon={<FiUser />} label="ID Number" value={member.idNo} />}
                {member.gender && <InfoField icon={<FiUser />} label="Gender" value={member.gender} />}
              </div>
            </div>

            {/* Membership Information Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                <FiHeart className="w-5 h-5 mr-2" />
                Membership & Church Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField icon={<FiUser />} label="Registration Number" value={member.membershipNumber || 'Not assigned'} />
                <InfoField icon={<FiCalendar />} label="Date Joined" value={formatDate(member.membershipDate)} />
                <InfoField icon={<FiAlertCircle />} label="Status" value={member.membershipStatus || 'Active'} statusBadge={true} />
                <InfoField icon={<FiUsers />} label="People Group" value={member.peopleGroup || 'Not set'} />
                <InfoField icon={<FiUsers />} label="Growth Group" value={member.growthGroup || 'Not set'} />
                {member.department && <InfoField icon={<FiBriefcase />} label="Department" value={member.department} />}
              </div>
            </div>

            {/* Activity Summary Cards - Matching User View */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Givings */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <FiDollarSign className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Total Givings</p>
                  <p className="text-2xl font-bold">KSH {activityData.givings.stats.total.toLocaleString()}</p>
                </div>
              </div>

              {/* In-Gatherings */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <FiUsers className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">In-Gatherings</p>
                  <p className="text-2xl font-bold">{activityData.inGatherings.count}</p>
                  <p className="text-xs opacity-75 mt-1">Visitors Invited</p>
                </div>
              </div>

              {/* Nurturing */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <FiHeart className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Nurturing</p>
                  <p className="text-2xl font-bold">{activityData.nurturing.count}</p>
                  <p className="text-xs opacity-75 mt-1">People Nurtured</p>
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <FiCheckCircle className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold">{activityData.attendance.stats.rate}%</p>
                  <p className="text-xs opacity-75 mt-1">{activityData.attendance.stats.total} Services</p>
                </div>
              </div>
            </div>

            {/* Member Analytics Charts */}
            {member._id && (
              <div className="mt-6">
                <MemberAnalytics memberId={member._id} />
              </div>
            )}

            {/* Detailed Activity Sections */}
            <>
              {/* Givings Detail */}
                {activityData.givings.records.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FiDollarSign className="w-5 h-5 mr-2" />
                        Giving History
                      </div>
                      <span className="text-sm font-normal text-green-600">
                        {activityData.givings.count} total records
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-600">Offering</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(activityData.givings.stats.offering)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-600">Tithe</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(activityData.givings.stats.tithe)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-600">Extra Givings</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(activityData.givings.stats.extraGivings)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {activityData.givings.records.map((giving, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 shadow-sm flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-sm">{giving.donationType}</p>
                            <p className="text-xs text-gray-500">{formatDate(giving.createdAt)}</p>
                          </div>
                          <p className="font-bold text-green-600">{formatCurrency(giving.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In-Gatherings Detail */}
                {activityData.inGatherings.records.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                      <FiUsers className="w-5 h-5 mr-2" />
                      In-Gatherings (Latest 5)
                    </h3>
                    <div className="space-y-2">
                      {activityData.inGatherings.records.map((ig, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{ig.fullName || `${ig.firstName} ${ig.lastName}`}</p>
                              <p className="text-xs text-gray-500">{ig.phone}</p>
                              <p className="text-xs text-gray-400">{formatDate(ig.invitedDate)}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ig.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              ig.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              ig.status === 'Attended' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {ig.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nurturing Detail */}
                {activityData.nurturing.records.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                    <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                      <FiHeart className="w-5 h-5 mr-2" />
                      Nurturing (Latest 5)
                    </h3>
                    <div className="space-y-2">
                      {activityData.nurturing.records.map((nur, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{nur.fullName}</p>
                              <p className="text-xs text-gray-500">{nur.phone}</p>
                              <p className="text-xs text-gray-400">Started: {formatDate(nur.startDate)}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              nur.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              nur.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                              nur.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              nur.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {nur.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance Detail */}
                {activityData.attendance.records.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                      <FiCheckCircle className="w-5 h-5 mr-2" />
                      Attendance History (Latest 5)
                    </h3>
                    <div className="space-y-2">
                      {activityData.attendance.records.map((att, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 shadow-sm flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-sm">{att.serviceType || 'Service'}</p>
                            <p className="text-xs text-gray-500">{formatDate(att.signedAt || att.createdAt)}</p>
                          </div>
                          <FiCheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying info fields
const InfoField = ({ icon, label, value, statusBadge }) => {
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'bg-green-100 text-green-800 border-green-300';
    if (statusLower === 'inactive') return 'bg-red-100 text-red-800 border-red-300';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="flex items-center text-gray-600 text-xs mb-1">
        {icon && <span className="mr-1.5">{icon}</span>}
        <span className="font-semibold">{label}</span>
      </div>
      {statusBadge ? (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(value)}`}>
          {value}
        </span>
      ) : (
        <p className="text-gray-900 font-medium text-sm">{value}</p>
      )}
    </div>
  );
};

export default EnhancedMemberDetailModal;
