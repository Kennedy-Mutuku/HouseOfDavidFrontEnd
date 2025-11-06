import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../../context/MemberContext';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import UniformHeader from '../../components/UniformHeader';
import EnhancedMemberDetailModal from '../../components/EnhancedMemberDetailModal';
import AdminInGatheringManagement from '../../components/AdminInGatheringManagement';
import AdminNurturingManagement from '../../components/AdminNurturingManagement';
import AttendanceSessionManager from '../../components/AttendanceSessionManager';
import OrganizationAnalytics from '../../components/OrganizationAnalytics';

const SuperAdminDashboard = () => {
  const { members } = useMemberContext();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [givingRecords, setGivingRecords] = useState([]);
  const [givingStats, setGivingStats] = useState({
    totalAmount: 0,
    offeringTotal: 0,
    titheTotal: 0,
    extraGivingsTotal: 0
  });
  const [loadingGiving, setLoadingGiving] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [showInGatheringManagement, setShowInGatheringManagement] = useState(false);
  const [showNurturingManagement, setShowNurturingManagement] = useState(false);
  const [showAttendanceManager, setShowAttendanceManager] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleDeleteGiving = async (recordId, donorName, amount) => {
    if (!window.confirm(`Are you sure you want to delete this giving record?\n\nDonor: ${donorName}\nAmount: KSH ${amount}\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/donations/${recordId}`);

      if (response.data.success) {
        toast.success('Giving record deleted successfully');
        // Refresh the giving records
        fetchGivingRecords();
      }
    } catch (error) {
      console.error('Error deleting giving record:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete giving record';
      toast.error(errorMsg);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowMemberDetail(true);
  };

  const handleCloseDetail = () => {
    setShowMemberDetail(false);
    setSelectedMember(null);
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    return (
      member.fullName?.toLowerCase().includes(query) ||
      member.membershipNumber?.toLowerCase().includes(query) ||
      member.peopleGroup?.toLowerCase().includes(query) ||
      member.growthGroup?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  // Fetch giving records function
  const fetchGivingRecords = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found');
          setLoadingGiving(false);
          return;
        }

        const response = await axios.get('/donations');
        if (response.data.success) {
          const donations = response.data.data;
          // Sort by createdAt descending (latest first)
          const sortedDonations = donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setGivingRecords(sortedDonations);

          // Calculate totals
          const offering = donations
            .filter(d => d.donationType === 'Offering' && d.status === 'Completed')
            .reduce((sum, d) => sum + d.amount, 0);

          const tithe = donations
            .filter(d => d.donationType === 'Tithe' && d.status === 'Completed')
            .reduce((sum, d) => sum + d.amount, 0);

          const extraGivings = donations
            .filter(d => d.donationType === 'Extra Givings' && d.status === 'Completed')
            .reduce((sum, d) => sum + d.amount, 0);

          setGivingStats({
            totalAmount: offering + tithe + extraGivings,
            offeringTotal: offering,
            titheTotal: tithe,
            extraGivingsTotal: extraGivings
          });
        }
      } catch (error) {
        console.error('Error fetching giving records:', error);
        if (error.response?.status === 401) {
          console.log('Unauthorized - Please log in');
          // Don't show error toast for 401 - just silently fail
        } else {
          const errorMsg = error.response?.data?.message || 'Failed to load giving records';
          toast.error(errorMsg);
        }
      } finally {
        setLoadingGiving(false);
      }
  };

  // Fetch giving records on mount
  useEffect(() => {
    fetchGivingRecords();
  }, []);

  // Calculate statistics
  const peopleGroupStats = {};
  const growthGroupStats = {};

  members.forEach(member => {
    // People Group stats
    const peopleGroup = member.peopleGroup || 'Not Set';
    peopleGroupStats[peopleGroup] = (peopleGroupStats[peopleGroup] || 0) + 1;

    // Growth Group stats
    const growthGroup = member.growthGroup || 'Not Set';
    growthGroupStats[growthGroup] = (growthGroupStats[growthGroup] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Uniform Header */}
      <UniformHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title with Hamburger Menu */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
            <p className="text-purple-600 text-sm mt-1">House of David - Member Management</p>
          </div>

          {/* Hamburger Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg shadow-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-semibold">Quick Actions</span>
            </button>

            {/* Dropdown Menu */}
            {showQuickActionsMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowQuickActionsMenu(false)}
                ></div>

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowInGatheringManagement(true);
                        setShowQuickActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span className="font-medium text-gray-700">Manage In-Gatherings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowNurturingManagement(true);
                        setShowQuickActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-gray-700">Manage Nurturing</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAttendanceManager(true);
                        setShowQuickActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-gray-700">Manage Attendance</span>
                    </button>

                    <div className="border-t border-gray-200 my-1"></div>

                    <Link
                      to="/superadmin/analytics"
                      onClick={() => setShowQuickActionsMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <span className="font-medium text-gray-700">View Analytics</span>
                    </Link>

                    <Link
                      to="/superadmin/financial-management"
                      onClick={() => setShowQuickActionsMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-gray-700">Financial Management</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, registration, or group..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Organization Analytics Overview */}
        <div className="mb-8">
          <OrganizationAnalytics />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              List of all Members
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Table */}
          {filteredMembers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600 text-lg">
                {searchQuery ? 'No members found matching your search.' : 'No members registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Reg
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      ID No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      People Group
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Growth Group
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      DOB
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Date Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member, index) => (
                    <tr
                      key={member.membershipNumber || index}
                      onClick={() => handleMemberClick(member)}
                      className="hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.fullName}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {member.membershipNumber || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.idNo || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.peopleGroup || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.growthGroup || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-blue-600">
                          {member.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.phone || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(member.dateOfBirth)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(member.membershipDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Message - SuperAdmin has click-to-view functionality */}
        <div className="mt-8 bg-purple-50 border-l-4 border-purple-600 p-4 rounded shadow-md">
          <p className="text-purple-900 text-sm">
            <strong>💡 Tip:</strong> Click on any member row in the table above to view their complete profile information including REG number, ID number, date of birth, date joined, and all other details.
          </p>
        </div>

        {/* Giving Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Total Giving</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Offering</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.offeringTotal.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Tithe</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.titheTotal.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Extra Givings</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.extraGivingsTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Giving Records Table */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-800">
            <h2 className="text-xl font-bold text-white">
              Giving Records
            </h2>
            <p className="text-sm text-purple-100 mt-1">
              Total: {givingRecords.length} record{givingRecords.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loadingGiving ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600 text-lg">Loading giving records...</p>
            </div>
          ) : givingRecords.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600 text-lg">No giving records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {givingRecords.map((record, index) => (
                    <tr
                      key={record._id || index}
                      className="hover:bg-purple-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(record.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {record.donor?.fullName || record.createdBy?.fullName || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {record.donor?.idNumber || record.createdBy?.idNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-blue-600">
                          {record.donor?.email || record.createdBy?.email || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.donationType === 'Tithe' ? 'bg-purple-100 text-purple-800' :
                          record.donationType === 'Offering' ? 'bg-purple-100 text-purple-800' :
                          'bg-gold-100 text-gold-800'
                        }`}>
                          {record.donationType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-bold text-purple-600">
                          KSH {record.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.message || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                          record.status === 'Pending' ? 'bg-gold-100 text-gold-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteGiving(
                            record._id,
                            record.donor?.fullName || record.createdBy?.fullName || 'Anonymous',
                            record.amount.toLocaleString()
                          )}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category by People Group */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Category by People Group:</h3>
            <div className="space-y-3">
              {Object.entries(peopleGroupStats).sort((a, b) => b[1] - a[1]).map(([group, count]) => (
                <div
                  key={group}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <p className="text-gray-700 font-medium">
                    {group} - <span className="text-purple-600 font-bold">{count}</span> member{count !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Category by Growth Group */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Category by Growth Group:</h3>
            <div className="space-y-3">
              {Object.entries(growthGroupStats).sort((a, b) => b[1] - a[1]).map(([group, count]) => (
                <div
                  key={group}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <p className="text-gray-700 font-medium">
                    {group} - <span className="text-cyan-600 font-bold">{count}</span> member{count !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Member Detail Modal */}
      <EnhancedMemberDetailModal
        isOpen={showMemberDetail}
        onClose={handleCloseDetail}
        member={selectedMember}
      />

      {/* In-Gathering Management Modal */}
      <AdminInGatheringManagement
        isOpen={showInGatheringManagement}
        onClose={() => setShowInGatheringManagement(false)}
      />

      {/* Nurturing Management Modal */}
      <AdminNurturingManagement
        isOpen={showNurturingManagement}
        onClose={() => setShowNurturingManagement(false)}
      />

      {/* Attendance Session Manager Modal */}
      <AttendanceSessionManager
        isOpen={showAttendanceManager}
        onClose={() => setShowAttendanceManager(false)}
      />
    </div>
  );
};

export default SuperAdminDashboard;
