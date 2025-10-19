import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../../context/MemberContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import UniformHeader from '../../components/UniformHeader';
import MemberDetailModal from '../../components/MemberDetailModal';
import AdminInGatheringManagement from '../../components/AdminInGatheringManagement';
import AdminNurturingManagement from '../../components/AdminNurturingManagement';

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
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <p className="text-purple-600 text-sm mt-1">House of David - Member Management</p>
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

        {/* Admin Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowInGatheringManagement(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Manage In-Gatherings
          </button>

          <button
            onClick={() => setShowNurturingManagement(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Manage Nurturing
          </button>
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
                <thead className="bg-cyan-400">
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
                      className="hover:bg-cyan-50 transition-colors cursor-pointer"
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
        <div className="mt-8 bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded shadow-md">
          <p className="text-cyan-900 text-sm">
            <strong>💡 Tip:</strong> Click on any member row in the table above to view their complete profile information including REG number, ID number, date of birth, date joined, and all other details.
          </p>
        </div>

        {/* Giving Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Total Giving</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Offering</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.offeringTotal.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Tithe</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.titheTotal.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg shadow-lg p-6 text-white">
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
                          record.donationType === 'Tithe' ? 'bg-green-100 text-green-800' :
                          record.donationType === 'Offering' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
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
                          record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
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

      {/* Member Detail Modal */}
      <MemberDetailModal
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
    </div>
  );
};

export default SuperAdminDashboard;
