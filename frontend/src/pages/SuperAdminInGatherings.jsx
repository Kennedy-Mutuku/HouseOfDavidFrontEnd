import { useState, useEffect } from 'react';

const SuperAdminInGatherings = ({ onBack }) => {
  const [inGatherings, setInGatherings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    attended: 0,
    notInterested: 0
  });

  useEffect(() => {
    fetchAllInGatherings();
  }, []);

  const fetchAllInGatherings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ingathering', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch in-gatherings');
      }

      setInGatherings(data.data);

      // Calculate statistics
      const total = data.data.length;
      const pending = data.data.filter(ig => ig.status === 'Pending').length;
      const attended = data.data.filter(ig => ig.status === 'Attended').length;
      const notInterested = data.data.filter(ig => ig.status === 'Not Interested').length;

      setStats({ total, pending, attended, notInterested });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Attended':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Interested':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All In-Gatherings</h1>
              <p className="text-gray-600 mt-1">Super Admin View - All visitors brought by members</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">Loading all in-gatherings...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total In-Gatherings</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Attended</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.attended}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Not Interested</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.notInterested}</p>
              </div>
            </div>

            {/* In-Gathering List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-bold text-gray-900">All Visitors</h2>
              </div>

              {inGatherings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No in-gatherings recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Visitor Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Brought By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date Invited
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inGatherings.map((gathering) => (
                        <tr key={gathering._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {gathering.fullName || `${gathering.firstName} ${gathering.lastName}`}
                            </div>
                            {gathering.email && (
                              <div className="text-xs text-gray-500">{gathering.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{gathering.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {gathering.invitedBy
                                ? `${gathering.invitedBy.firstName} ${gathering.invitedBy.lastName}`
                                : 'Unknown'}
                            </div>
                            {gathering.invitedBy?.email && (
                              <div className="text-xs text-gray-500">{gathering.invitedBy.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {formatDate(gathering.invitedDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(gathering.status)}`}>
                              {gathering.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {gathering.notes || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Member Leaderboard */}
            <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-bold text-gray-900">Top Contributors</h2>
              </div>
              <div className="p-6">
                {(() => {
                  // Calculate contribution by member
                  const contributions = {};
                  inGatherings.forEach(ig => {
                    if (ig.invitedBy) {
                      const key = ig.invitedBy._id;
                      if (!contributions[key]) {
                        contributions[key] = {
                          name: `${ig.invitedBy.firstName} ${ig.invitedBy.lastName}`,
                          email: ig.invitedBy.email,
                          count: 0
                        };
                      }
                      contributions[key].count++;
                    }
                  });

                  const sorted = Object.values(contributions)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                  return sorted.length > 0 ? (
                    <div className="space-y-3">
                      {sorted.map((contributor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{contributor.name}</p>
                              <p className="text-sm text-gray-500">{contributor.email}</p>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {contributor.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No contributions yet</p>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SuperAdminInGatherings;
