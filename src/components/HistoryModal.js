import React from 'react';
import { FiX, FiCalendar, FiDollarSign, FiUsers, FiHeart, FiCheckCircle } from 'react-icons/fi';

const HistoryModal = ({ isOpen, onClose, historyType, historyData, loading }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (historyType) {
      case 'giving':
        return <FiDollarSign className="w-6 h-6" />;
      case 'attendance':
        return <FiCheckCircle className="w-6 h-6" />;
      case 'ingathering':
        return <FiUsers className="w-6 h-6" />;
      case 'nurturing':
        return <FiHeart className="w-6 h-6" />;
      default:
        return <FiCalendar className="w-6 h-6" />;
    }
  };

  const getTitle = () => {
    switch (historyType) {
      case 'giving':
        return 'My Giving History';
      case 'attendance':
        return 'My Attendance History';
      case 'ingathering':
        return 'My Ingathering History';
      case 'nurturing':
        return 'My Nurturing History';
      default:
        return 'History';
    }
  };

  const getColor = () => {
    switch (historyType) {
      case 'giving':
        return 'bg-green-500';
      case 'attendance':
        return 'bg-blue-500';
      case 'ingathering':
        return 'bg-purple-500';
      case 'nurturing':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';

    // Format date and time in Nairobi, Kenya timezone (EAT - East Africa Time)
    // EAT is UTC+3
    return date.toLocaleString('en-GB', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // 24-hour format
    });
  };

  const renderGivingHistory = (item) => (
    <div className="border-l-4 border-green-500 pl-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-800">{item.donationType || 'Donation'}</p>
          <p className="text-xs text-gray-600">{formatDate(item.createdAt)}</p>
          {item.paymentMethod && (
            <p className="text-[10px] text-gray-500">via {item.paymentMethod}</p>
          )}
        </div>
        <p className="text-sm font-bold text-green-600 ml-2">Ksh {item.amount?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      {item.description && (
        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
      )}
      {item.message && (
        <p className="text-xs text-gray-500 mt-0.5 italic">"{item.message}"</p>
      )}
    </div>
  );

  const renderAttendanceHistory = (item) => (
    <div className="border-l-4 border-blue-500 pl-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-800">{item.serviceType || 'Service'}</p>
          <p className="text-xs text-gray-600">{formatDate(item.signedAt || item.createdAt)}</p>
        </div>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold ml-2">
          Present
        </span>
      </div>
    </div>
  );

  const renderIngatheringHistory = (item) => (
    <div className="border-l-4 border-purple-500 pl-3">
      <div>
        <p className="font-semibold text-sm text-gray-800">
          {item.firstName} {item.lastName}
        </p>
        <p className="text-xs text-gray-600">{formatDate(item.createdAt)}</p>
        {item.phone && (
          <p className="text-[10px] text-gray-500">Phone: {item.phone}</p>
        )}
        {item.status && (
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            item.status === 'Attended' ? 'bg-green-100 text-green-700' :
            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
            item.status === 'Not Interested' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {item.status}
          </span>
        )}
      </div>
      {item.notes && (
        <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>
      )}
      {item.attendedDates && item.attendedDates.length > 0 && (
        <p className="text-[10px] text-gray-500 mt-0.5">
          Attended {item.attendedDates.length} time{item.attendedDates.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );

  const renderNurturingHistory = (item) => (
    <div className="border-l-4 border-orange-500 pl-4">
      <div>
        <p className="font-semibold text-gray-800">{item.activityType || 'Nurturing Activity'}</p>
        <p className="text-sm text-gray-600">{formatDate(item.date || item.createdAt)}</p>
      </div>
      {item.description && (
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
      )}
      {item.member && (
        <p className="text-sm text-gray-600 mt-1">Member: {item.member}</p>
      )}
    </div>
  );

  const renderHistoryItem = (item, index) => {
    switch (historyType) {
      case 'giving':
        return renderGivingHistory(item);
      case 'attendance':
        return renderAttendanceHistory(item);
      case 'ingathering':
        return renderIngatheringHistory(item);
      case 'nurturing':
        return renderNurturingHistory(item);
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className={`${getColor()} text-white px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              {getIcon()}
            </div>
            <h2 className="text-lg font-bold">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-3"></div>
              <p className="text-sm text-gray-600">Loading your history...</p>
            </div>
          ) : historyData && historyData.length > 0 ? (
            <div className="space-y-2">
              {historyData.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-2.5 hover:bg-gray-100 transition-colors"
                >
                  {renderHistoryItem(item, index)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`inline-block ${getColor()} bg-opacity-10 p-4 rounded-full mb-3`}>
                {getIcon()}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No History Yet</h3>
              <p className="text-sm text-gray-600">
                {historyType === 'giving' && 'Start recording your giving to see your history here.'}
                {historyType === 'attendance' && 'Sign attendance at services to build your history.'}
                {historyType === 'ingathering' && 'Invite guests to see your ingathering records here.'}
                {historyType === 'nurturing' && 'Record nurturing activities to track your impact.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2.5 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
