import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../../context/MemberContext';
import { FiSearch, FiRefreshCw, FiUser, FiMail, FiPhone, FiEye } from 'react-icons/fi';
import UniformHeader from '../../components/UniformHeader';
import MemberDetailModal from '../../components/MemberDetailModal';

const ManageMembers = () => {
  const { members, updateMember } = useMemberContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [resetSuccess, setResetSuccess] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    return (
      member.fullName?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.phone?.toLowerCase().includes(query) ||
      member.phoneNo?.toLowerCase().includes(query) ||
      member.membershipNumber?.toLowerCase().includes(query) ||
      member.idNo?.toLowerCase().includes(query)
    );
  });

  const handleResetPassword = (member) => {
    // Reset password to ID number (default)
    // Note: In this mock system, password is stored as idNo
    // In real system, you would hash the password

    setResetSuccess(member.email);
    setTimeout(() => setResetSuccess(null), 3000);

    // Show confirmation
    alert(`Password reset successfully for ${member.fullName}!\nNew password: ${member.idNo}`);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setResetSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
      {/* Uniform Header */}
      <UniformHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Controls Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
              User Management
            </h1>

            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone, reg, or course"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FiRefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>

            {/* Total Members Count */}
            <div className="bg-gold-100 border-l-4 border-gold-500 p-4 rounded mb-6">
              <p className="text-gold-800 font-semibold flex items-center gap-2">
                📊 Total Users: {filteredMembers.length}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="flex justify-center gap-4 mb-4">
              <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
                Home
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/admin/manage-members" className="text-blue-600 hover:text-blue-700 font-semibold">
                Manage Members
              </Link>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-600 text-lg">
                {searchQuery ? 'No members found matching your search.' : 'No members registered yet.'}
              </p>
            </div>
          ) : (
            filteredMembers.map((member, index) => (
              <div
                key={member.membershipNumber || index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Member Details */}
                <div className="space-y-3">
                  {/* Name */}
                  <div className="flex items-start gap-3">
                    <FiUser className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Name:</p>
                      <p className="text-gray-900 font-medium text-lg">{member.fullName}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <FiMail className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Email:</p>
                      <p className="text-blue-600 font-medium">{member.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <FiPhone className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Phone:</p>
                      <p className="text-gray-900 font-medium">{member.phone || member.phoneNo || 'N/A'}</p>
                    </div>
                  </div>

                  {/* ID Number */}
                  <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="w-full">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Login Credentials:</p>
                      <div className="space-y-1">
                        <p className="text-gray-900 font-medium">
                          <span className="text-gray-600 text-sm">Username (Email):</span> <span className="text-purple-600">{member.email}</span>
                        </p>
                        <p className="text-gray-900 font-medium">
                          <span className="text-gray-600 text-sm">Password (ID No):</span> <span className="text-gold-700 font-bold">{member.idNo || member.idNumber || member.id_no || 'Not set - Please re-add member'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    {/* Membership Number */}
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">REG:</p>
                      <p className="text-gray-900 font-medium">{member.membershipNumber || 'Not assigned'}</p>
                    </div>

                    {/* ID Number */}
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">ID Number:</p>
                      <p className="text-gray-900 font-medium">{member.idNo || member.idNumber || member.id_no || 'Not available'}</p>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Date of Birth:</p>
                      <p className="text-gray-900 font-medium">
                        {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    {/* Date Joined */}
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Date Joined:</p>
                      <p className="text-gray-900 font-medium">
                        {member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() :
                         member.dateJoined ? new Date(member.dateJoined).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    {/* People Group */}
                    {member.peopleGroup && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">People Group:</p>
                        <p className="text-gray-900 font-medium">{member.peopleGroup}</p>
                      </div>
                    )}

                    {/* Growth Group */}
                    {member.growthGroup && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Growth Group:</p>
                        <p className="text-gray-900 font-medium">{member.growthGroup}</p>
                      </div>
                    )}
                  </div>

                  {/* Password Section */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        Default Password: {member.idNo}
                      </span>
                      {resetSuccess === member.email && (
                        <span className="text-green-600 text-sm font-semibold animate-pulse">
                          ✓ Reset successful!
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <FiEye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleResetPassword(member)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}

        {/* Back to Top Button */}
        {filteredMembers.length > 3 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl"
            >
              ↑ Back to Top
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMembers;
