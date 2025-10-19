import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiTrash2, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminInGatheringManagement = ({ isOpen, onClose }) => {
  const [inGatherings, setInGatherings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchInGatherings();
    }
  }, [isOpen]);

  const fetchInGatherings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/ingathering');

      if (response.data.success) {
        setInGatherings(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching in-gatherings:', error);
      toast.error('Failed to load in-gatherings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await axios.put(`/ingathering/${id}/approve`);

      if (response.data.success) {
        toast.success('In-gathering approved!');
        fetchInGatherings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving in-gathering:', error);
      toast.error(error.response?.data?.message || 'Failed to approve in-gathering');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this in-gathering record?')) {
      return;
    }

    try {
      const response = await axios.delete(`/ingathering/${id}`);

      if (response.data.success) {
        toast.success('In-gathering deleted!');
        fetchInGatherings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting in-gathering:', error);
      toast.error(error.response?.data?.message || 'Failed to delete in-gathering');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Attended':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Not Interested':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredInGatherings = filterStatus === 'all'
    ? inGatherings
    : inGatherings.filter(ig => ig.status === filterStatus);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiUsers className="w-6 h-6" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold">In-Gathering Management</h2>
              <p className="text-sm text-purple-100">Super Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 border-b">
          <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-yellow-500 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-green-500 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-red-500 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b bg-white overflow-x-auto">
          {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading in-gatherings...</p>
            </div>
          ) : filteredInGatherings.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No in-gatherings found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInGatherings.map((gathering) => (
                <div
                  key={gathering._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left Section - Visitor Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {gathering.fullName || `${gathering.firstName} ${gathering.lastName}`}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                            <span>📱 {gathering.phone}</span>
                            <span>📅 {formatDate(gathering.invitedDate)}</span>
                          </div>
                          {gathering.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">"{gathering.notes}"</p>
                          )}
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Invited by: </span>
                            <span className="font-semibold text-purple-700">
                              {gathering.invitedBy
                                ? `${gathering.invitedBy.firstName} ${gathering.invitedBy.lastName}`
                                : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Status & Actions */}
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(gathering.status)}`}>
                        {gathering.status}
                      </span>

                      <div className="flex gap-2">
                        {gathering.status === 'Pending' && (
                          <button
                            onClick={() => handleApprove(gathering._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <FiCheck className="w-4 h-4" />
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(gathering._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInGatheringManagement;
