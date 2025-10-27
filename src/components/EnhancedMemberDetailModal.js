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

  useEffect(() => {
    if (isOpen && member) {
      fetchMemberActivity();
    }
  }, [isOpen, member]);

  const fetchMemberActivity = async () => {
    if (!member) return;

    try {
      setActivityData(prev => ({ ...prev, loading: true }));

      // Fetch all activity data in parallel
      const [givingsRes, inGatheringsRes, nurturingRes, attendanceRes] = await Promise.allSettled([
        axios.get(`/donations/member/${member._id}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/ingathering/member/${member._id}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/nurturing/member/${member._id}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/attendance/member/${member._id}`).catch(() => ({ data: { data: [] } }))
      ]);

      // Process givings data
      const givingsResponse = givingsRes.status === 'fulfilled' ? givingsRes.value.data : {};
      const givingsData = givingsResponse.data?.history || givingsResponse.data || [];
      const backendStats = givingsResponse.data?.stats || {};

      console.log('[MemberDetail] Givings response:', givingsResponse);
      console.log('[MemberDetail] Givings data:', givingsData);
      console.log('[MemberDetail] Backend stats:', backendStats);

      // Use backend stats if available, otherwise calculate
      const givingStats = {
        total: backendStats.total || givingsData.reduce((sum, g) => sum + (g.amount || 0), 0),
        offering: backendStats.totalOffering || givingsData.filter(g => g.donationType === 'Offering').reduce((sum, g) => sum + (g.amount || 0), 0),
        tithe: backendStats.totalTithe || givingsData.filter(g => g.donationType === 'Tithe').reduce((sum, g) => sum + (g.amount || 0), 0),
        extraGivings: backendStats.totalExtraGivings || givingsData.filter(g => g.donationType === 'Extra Givings').reduce((sum, g) => sum + (g.amount || 0), 0)
      };

      // Process in-gatherings data
      const inGatheringsData = inGatheringsRes.status === 'fulfilled' ? inGatheringsRes.value.data.data || [] : [];

      // Process nurturing data
      const nurturingData = nurturingRes.status === 'fulfilled' ? nurturingRes.value.data.data || [] : [];

      // Process attendance data
      const attendanceData = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data.data || [] : [];
      const attendanceRate = attendanceData.length > 0 ? (attendanceData.length / 52 * 100).toFixed(1) : 0; // Assuming 52 weeks

      setActivityData({
        givings: { records: givingsData, stats: givingStats, count: givingsData.length }, // Show all
        inGatherings: { records: inGatheringsData.slice(0, 5), count: inGatheringsData.length },
        nurturing: { records: nurturingData.slice(0, 5), count: nurturingData.length },
        attendance: { records: attendanceData.slice(0, 5), stats: { total: attendanceData.length, rate: attendanceRate } },
        loading: false
      });

      console.log('[MemberDetail] Final activity data:', {
        givingsCount: givingsData.length,
        givingStats,
        inGatheringsCount: inGatheringsData.length,
        nurturingCount: nurturingData.length,
        attendanceCount: attendanceData.length
      });
    } catch (error) {
      console.error('Error fetching member activity:', error);
      setActivityData(prev => ({ ...prev, loading: false }));
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

            {/* Activity Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Givings */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <FiDollarSign className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Total Givings</p>
                    <p className="text-2xl font-bold">{formatCurrency(activityData.givings.stats.total)}</p>
                  </div>
                </div>
              </div>

              {/* In-Gatherings */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <FiUsers className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">In-Gatherings</p>
                    <p className="text-2xl font-bold">{activityData.inGatherings.count}</p>
                    <p className="text-xs opacity-75">Visitors Invited</p>
                  </div>
                </div>
              </div>

              {/* Nurturing */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <FiHeart className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Nurturing</p>
                    <p className="text-2xl font-bold">{activityData.nurturing.count}</p>
                    <p className="text-xs opacity-75">People Nurtured</p>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <FiCheckCircle className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Attendance Rate</p>
                    <p className="text-2xl font-bold">{activityData.attendance.stats.rate}%</p>
                    <p className="text-xs opacity-75">{activityData.attendance.stats.total} Services</p>
                  </div>
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
            {activityData.loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading activity data...</p>
              </div>
            ) : (
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
            )}
          </div>
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
