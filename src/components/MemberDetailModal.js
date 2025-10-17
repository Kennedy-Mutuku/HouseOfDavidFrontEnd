import React from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiUsers, FiHeart, FiBriefcase, FiAlertCircle } from 'react-icons/fi';

const MemberDetailModal = ({ isOpen, onClose, member }) => {
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Member Information</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={<FiUser />}
                  label="Full Name"
                  value={member.fullName || `${member.firstName || ''} ${member.lastName || ''}`}
                />
                <InfoField
                  icon={<FiMail />}
                  label="Email"
                  value={member.email || 'Not provided'}
                />
                <InfoField
                  icon={<FiPhone />}
                  label="Phone"
                  value={member.phone || 'Not provided'}
                />
                <InfoField
                  icon={<FiCalendar />}
                  label="Date of Birth"
                  value={formatDate(member.dateOfBirth)}
                />
                {member.idNo && (
                  <InfoField
                    icon={<FiUser />}
                    label="ID Number"
                    value={member.idNo}
                  />
                )}
                {member.gender && (
                  <InfoField
                    icon={<FiUser />}
                    label="Gender"
                    value={member.gender}
                  />
                )}
              </div>
            </div>

            {/* Membership Information Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                <FiHeart className="w-5 h-5 mr-2" />
                Membership Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={<FiUser />}
                  label="Registration Number (REG)"
                  value={member.membershipNumber || 'Not assigned'}
                />
                <InfoField
                  icon={<FiCalendar />}
                  label="Date Joined"
                  value={formatDate(member.membershipDate)}
                />
                <InfoField
                  icon={<FiAlertCircle />}
                  label="Status"
                  value={member.membershipStatus || 'Active'}
                  statusBadge={true}
                />
                {member.department && (
                  <InfoField
                    icon={<FiBriefcase />}
                    label="Department"
                    value={member.department}
                  />
                )}
                {member.maritalStatus && (
                  <InfoField
                    icon={<FiHeart />}
                    label="Marital Status"
                    value={member.maritalStatus}
                  />
                )}
                {member.occupation && (
                  <InfoField
                    icon={<FiBriefcase />}
                    label="Occupation"
                    value={member.occupation}
                  />
                )}
              </div>
            </div>

            {/* Church Information Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                <FiUsers className="w-5 h-5 mr-2" />
                Church Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={<FiUsers />}
                  label="People Group"
                  value={member.peopleGroup || 'Not set'}
                />
                <InfoField
                  icon={<FiUsers />}
                  label="Growth Group"
                  value={member.growthGroup || 'Not set'}
                />
                <InfoField
                  icon={<FiCalendar />}
                  label="Date Joined Community"
                  value={formatDate(member.dateJoinedCommunity || member.membershipDate)}
                />
                <InfoField
                  icon={<FiUser />}
                  label="Role"
                  value={Array.isArray(member.role) ? member.role.join(', ') : member.role || 'User'}
                />
              </div>
            </div>

            {/* Address Information Section */}
            {member.address && (member.address.street || member.address.city || member.address.state || member.address.zipCode || member.address.country) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.address.street && (
                    <InfoField
                      icon={<FiMapPin />}
                      label="Street"
                      value={member.address.street}
                    />
                  )}
                  {member.address.city && (
                    <InfoField
                      icon={<FiMapPin />}
                      label="City"
                      value={member.address.city}
                    />
                  )}
                  {member.address.state && (
                    <InfoField
                      icon={<FiMapPin />}
                      label="State"
                      value={member.address.state}
                    />
                  )}
                  {member.address.zipCode && (
                    <InfoField
                      icon={<FiMapPin />}
                      label="Zip Code"
                      value={member.address.zipCode}
                    />
                  )}
                  {member.address.country && (
                    <InfoField
                      icon={<FiMapPin />}
                      label="Country"
                      value={member.address.country}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Emergency Contact Section */}
            {member.emergencyContact && (member.emergencyContact.name || member.emergencyContact.relationship || member.emergencyContact.phone) && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  <FiAlertCircle className="w-5 h-5 mr-2" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.emergencyContact.name && (
                    <InfoField
                      icon={<FiUser />}
                      label="Name"
                      value={member.emergencyContact.name}
                    />
                  )}
                  {member.emergencyContact.relationship && (
                    <InfoField
                      icon={<FiHeart />}
                      label="Relationship"
                      value={member.emergencyContact.relationship}
                    />
                  )}
                  {member.emergencyContact.phone && (
                    <InfoField
                      icon={<FiPhone />}
                      label="Phone"
                      value={member.emergencyContact.phone}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {member.notes && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{member.notes}</p>
              </div>
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
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center text-gray-600 text-sm mb-1">
        {icon && <span className="mr-1.5">{icon}</span>}
        <span className="font-semibold">{label}</span>
      </div>
      {statusBadge ? (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(value)}`}>
          {value}
        </span>
      ) : (
        <p className="text-gray-900 font-medium">{value}</p>
      )}
    </div>
  );
};

export default MemberDetailModal;
