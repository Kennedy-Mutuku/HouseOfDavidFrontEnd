import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../../context/MemberContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import UniformHeader from '../../components/UniformHeader';

const SuperAdminDashboard = () => {
  const { members } = useMemberContext();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [givingRecords, setGivingRecords] = useState([]);
  const [givingStats, setGivingStats] = useState({
    totalAmount: 0,
    titheTotal: 0,
    offeringTotal: 0,
    specialGivingTotal: 0
  });
  const [loadingGiving, setLoadingGiving] = useState(true);

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

  // Fetch giving records
  useEffect(() => {
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
          setGivingRecords(donations);

          // Calculate totals
          const tithe = donations
            .filter(d => d.donationType === 'Tithe' && d.status === 'Completed')
            .reduce((sum, d) => sum + d.amount, 0);

          const offering = donations
            .filter(d => d.donationType === 'Offering' && d.status === 'Completed')
            .reduce((sum, d) => sum + d.amount, 0);

          const specialGiving = donations
            .filter(d => d.donationType === 'Special Giving' && d.status === 'Completed')
            .reduce((sum, d) => sum + d.amount, 0);

          setGivingStats({
            totalAmount: tithe + offering + specialGiving,
            titheTotal: tithe,
            offeringTotal: offering,
            specialGivingTotal: specialGiving
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.fullName}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.membershipNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.idNo}
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
                          {member.phoneNo}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.dateOfBirth}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.dateJoined}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Message - SuperAdmin is view-only */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-800 text-sm">
            <strong>ℹ️ Super Admin Dashboard:</strong> This dashboard is for viewing member data and statistics only. To add or manage members, please use the Admission Admin account.
          </p>
        </div>

        {/* Giving Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Total Giving</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Tithe</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.titheTotal.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Offering</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.offeringTotal.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Special Giving</h3>
            <p className="text-3xl font-bold mt-2">KSH {givingStats.specialGivingTotal.toLocaleString()}</p>
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
                      Date
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
                          {new Date(record.date).toLocaleDateString()}
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
    </div>
  );
};

export default SuperAdminDashboard;
