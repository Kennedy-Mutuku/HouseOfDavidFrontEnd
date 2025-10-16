import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../../context/MemberContext';
import { useAuth } from '../../context/AuthContext';
import UniformHeader from '../../components/UniformHeader';

const AdminDashboard = () => {
  const { members, addMember } = useMemberContext();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNo: '',
    email: '',
    idNo: '',
    dateOfBirth: '',
    dateJoined: '',
    peopleGroup: '',
    growthGroup: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClear = () => {
    setFormData({
      fullName: '',
      phoneNo: '',
      email: '',
      idNo: '',
      dateOfBirth: '',
      dateJoined: '',
      peopleGroup: '',
      growthGroup: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Use first name again if no last name

      // Map form data to match backend model
      const memberPayload = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phoneNo, // Map phoneNo to phone
        idNo: formData.idNo,
        dateOfBirth: formData.dateOfBirth,
        membershipDate: formData.dateJoined, // Map dateJoined to membershipDate
        peopleGroup: formData.peopleGroup,
        growthGroup: formData.growthGroup
      };

      // Add member using context
      await addMember(memberPayload);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Clear form
      handleClear();
    } catch (error) {
      console.error('Error submitting member:', error);
      // Error handling is done in the context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
      {/* Uniform Header */}
      <UniformHeader />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Form Section */}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Admit New Member
            </h1>

            {/* Authentication Warning */}
            {!isAuthenticated && (
              <div className="mb-6 bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded">
                <p className="font-bold">⚠️ Login Required</p>
                <p className="text-sm">You must log in as an admin before you can add members. Click the user icon in the header to log in.</p>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
                <p className="font-semibold">Member added successfully!</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Full Names
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Phone No
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  ID No
                </label>
                <input
                  type="text"
                  name="idNo"
                  value={formData.idNo}
                  onChange={handleChange}
                  required
                  placeholder="Enter ID number"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Date Joined Church */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Date Joined the Church
                </label>
                <input
                  type="date"
                  name="dateJoined"
                  value={formData.dateJoined}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* People Group (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  People Group <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  name="peopleGroup"
                  value={formData.peopleGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose...</option>
                  <option value="Youth">Youth</option>
                  <option value="Adults">Adults</option>
                  <option value="Seniors">Seniors</option>
                  <option value="Children">Children</option>
                </select>
              </div>

              {/* Growth Group (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Growth Group <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  name="growthGroup"
                  value={formData.growthGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose...</option>
                  <option value="Group A">Group A</option>
                  <option value="Group B">Group B</option>
                  <option value="Group C">Group C</option>
                  <option value="Group D">Group D</option>
                </select>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The member's email will be used as their username and ID Number as their password for login.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  Admit Member
                </button>
              </div>

              {/* Links */}
              <div className="flex justify-center gap-4 pt-4">
                <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Home
                </Link>
                <span className="text-gray-400">|</span>
                <Link to="/admin/manage-members" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Manage Members
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Members Count */}
        {members.length > 0 && (
          <div className="mt-6 text-center text-white">
            <p className="text-lg font-semibold">
              Total Members Registered: {members.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
