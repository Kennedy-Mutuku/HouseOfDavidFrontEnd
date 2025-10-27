import React, { useState, useEffect } from 'react';
import { FiX, FiUsers, FiDownload, FiTrash2, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AttendanceSessionManager = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    sessionName: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/attendance-sessions');
      if (response.data.success) {
        setSessions(response.data.data);
        const active = response.data.data.find(s => s.status === 'Active');
        setActiveSession(active || null);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load attendance sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!formData.sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    try {
      const response = await axios.post('/attendance-sessions', formData);
      if (response.data.success) {
        toast.success('Attendance session created successfully!');
        setFormData({ sessionName: '', description: '' });
        setShowCreateForm(false);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.response?.data?.message || 'Failed to create session');
    }
  };

  const handleCloseSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to close this attendance session?')) {
      return;
    }

    try {
      const response = await axios.put(`/attendance-sessions/${sessionId}/close`);
      if (response.data.success) {
        toast.success('Attendance session closed successfully');
        fetchSessions();
      }
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session');
    }
  };

  const handleRefreshSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to refresh this session? This will clear all signatures and restart the session.')) {
      return;
    }

    try {
      const response = await axios.put(`/attendance-sessions/${sessionId}/refresh`);
      if (response.data.success) {
        toast.success('Attendance session refreshed successfully');
        fetchSessions();
        if (selectedSession?._id === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Failed to refresh session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this attendance session? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('[DELETE] Attempting to delete session:', sessionId);
      console.log('[DELETE] Current token:', localStorage.getItem('token') ? 'Token exists' : 'No token');
      console.log('[DELETE] Current user:', JSON.parse(localStorage.getItem('user') || '{}'));

      const response = await axios.delete(`/attendance-sessions/${sessionId}`);
      if (response.data.success) {
        toast.success('Attendance session deleted successfully');
        fetchSessions();
        if (selectedSession?._id === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch (error) {
      console.error('[DELETE] Error deleting session:', error);
      console.error('[DELETE] Error response:', error.response?.data);

      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete session';

      // If it's an auth error, suggest re-login
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error(`${errorMsg} - Please log out and log back in.`);
      } else {
        toast.error(errorMsg);
      }

      // Log debug info if available
      if (error.response?.data?.debug) {
        console.error('[DELETE] Debug info:', error.response.data.debug);
      }
    }
  };

  const viewSessionDetails = async (sessionId) => {
    try {
      const response = await axios.get(`/attendance-sessions/${sessionId}`);
      if (response.data.success) {
        setSelectedSession(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to load session details');
    }
  };

  const downloadPDF = async (session) => {
    try {
      // Fetch full session details with signatures
      console.log('[PDF] Fetching full session details for:', session._id);
      const response = await axios.get(`/attendance-sessions/${session._id}`);

      if (!response.data.success) {
        toast.error('Failed to fetch session details for PDF');
        return;
      }

      const fullSession = response.data.data;
      console.log('[PDF] Full session data:', fullSession);
      console.log('[PDF] Signatures count:', fullSession.signatures?.length || 0);

      // Use the full session data with complete signatures
      const sessionData = fullSession;

      const doc = new jsPDF();

      // Load and add logo - smaller and more compact
      try {
        const logoImg = new Image();
        logoImg.src = '/logo-hod.jpg';

        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            // Add logo - centered at top, smaller size
            doc.addImage(logoImg, 'JPEG', 88, 5, 30, 30);
            resolve();
          };
          logoImg.onerror = () => {
            console.warn('Logo failed to load, continuing without it');
            resolve(); // Continue even if logo fails
          };
          // Timeout after 2 seconds
          setTimeout(() => resolve(), 2000);
        });
      } catch (error) {
        console.warn('Error loading logo:', error);
      }

      // Add "HOUSE OF DAVID" header - more compact
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(147, 51, 234); // Purple color
      const titleText = 'HOUSE OF DAVID';
      const titleWidth = doc.getTextWidth(titleText);
      doc.text(titleText, (doc.internal.pageSize.width - titleWidth) / 2, 40);

      // Add subtitle - smaller
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0); // Black color
      const subtitleText = 'Attendance Session Report';
      const subtitleWidth = doc.getTextWidth(subtitleText);
      doc.text(subtitleText, (doc.internal.pageSize.width - subtitleWidth) / 2, 46);

      // Draw a line separator
      doc.setLineWidth(0.3);
      doc.setDrawColor(147, 51, 234);
      doc.line(14, 50, doc.internal.pageSize.width - 14, 50);

      // Format date for filename and display
      const openedDate = new Date(sessionData.openedAt);
      const dateStr = openedDate.toLocaleDateString('en-KE', {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').reverse().join('-'); // Convert to YYYY-MM-DD format

      // Add session details in a compact format
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);

      let currentY = 55;

      // Session name and date on one line
      doc.text(`Session: `, 14, currentY);
      doc.setFont(undefined, 'normal');
      doc.text(sessionData.sessionName, 32, currentY);

      // Add date opened on the right side
      doc.setFont(undefined, 'bold');
      doc.text(`Opened: `, 120, currentY);
      doc.setFont(undefined, 'normal');
      doc.text(formatDateTime(sessionData.openedAt), 138, currentY);

      currentY += 4;

      // Description if available (keep it brief)
      if (sessionData.description && sessionData.description.trim()) {
        doc.setFont(undefined, 'bold');
        doc.text(`Description: `, 14, currentY);
        doc.setFont(undefined, 'normal');
        const briefDesc = sessionData.description.length > 60
          ? sessionData.description.substring(0, 60) + '...'
          : sessionData.description;
        doc.text(briefDesc, 37, currentY);
        currentY += 4;
      }

      // Closed date and total on one line
      if (sessionData.closedAt) {
        doc.setFont(undefined, 'bold');
        doc.text(`Closed: `, 14, currentY);
        doc.setFont(undefined, 'normal');
        doc.text(formatDateTime(sessionData.closedAt), 32, currentY);
      }

      // Total signatures on the right
      doc.setFont(undefined, 'bold');
      doc.text(`Total: `, 120, currentY);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(147, 51, 234);
      doc.text((sessionData.signatures?.length || 0).toString() + ' signatures', 133, currentY);
      doc.setTextColor(0, 0, 0);

      currentY += 5;

      // Add legend for new members indicator
      doc.setFontSize(7);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('⭐ = New Member (not registered in database)', 14, currentY);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);

      currentY += 1;

      // Add table with signatures in reverse order (latest first)
      const reversedSignatures = sessionData.signatures && sessionData.signatures.length > 0
        ? [...sessionData.signatures].reverse()
        : [];
      const tableData = reversedSignatures.map((sig, index) => [
        index + 1,
        sig.isRegistered === false ? `${sig.fullName} ⭐` : sig.fullName,  // Add star for new members
        sig.phoneNumber,
        formatDateTime(sig.signedAt)
      ]);

      // Use autoTable with grid format and borders for clear separation
      autoTable(doc, {
        startY: currentY + 4,
        head: [['#', 'Name', 'Phone', 'Time', 'Signature']],
        body: tableData.map((row, index) => [
          row[0], // Number
          row[1], // Name
          row[2], // Phone
          // Format time to be more compact (remove date, keep time)
          new Date(reversedSignatures[index].signedAt).toLocaleTimeString('en-GB', {
            timeZone: 'Africa/Nairobi',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          '' // Signature placeholder
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2,
          lineWidth: 0.2,
          lineColor: [100, 100, 100]
        },
        styles: {
          fontSize: 7,
          cellPadding: { top: 1.5, right: 1.5, bottom: 1.5, left: 1.5 },
          minCellHeight: 10,
          valign: 'middle',
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [180, 180, 180]
        },
        columnStyles: {
          0: {
            cellWidth: 8,
            halign: 'center',
            fontStyle: 'bold',
            textColor: [80, 80, 80]
          },
          1: {
            cellWidth: 42,
            halign: 'left',
            fontStyle: 'bold',
            textColor: [0, 0, 0]
          },
          2: {
            cellWidth: 28,
            halign: 'left',
            textColor: [60, 60, 60]
          },
          3: {
            cellWidth: 18,
            halign: 'center',
            textColor: [80, 80, 80]
          },
          4: {
            cellWidth: 34,
            halign: 'center'
          }
        },
        margin: { left: 14, right: 14 },
        alternateRowStyles: {
          fillColor: [245, 245, 250]
        },
        didDrawCell: (data) => {
          // Draw signature images in the last column
          if (data.section === 'body' && data.column.index === 4) {
            const signature = reversedSignatures[data.row.index];
            if (signature && signature.signature) {
              try {
                // Add signature image to the cell - more compact
                const imgWidth = 28;
                const imgHeight = 8;
                doc.addImage(
                  signature.signature,
                  'PNG',
                  data.cell.x + (data.cell.width - imgWidth) / 2,
                  data.cell.y + (data.cell.height - imgHeight) / 2,
                  imgWidth,
                  imgHeight
                );
              } catch (error) {
                console.error('Error adding signature image:', error);
              }
            }
          }
        }
      });

      // Save PDF with properly formatted filename
      const sanitizedSessionName = sessionData.sessionName.replace(/[^a-z0-9]/gi, '_');
      doc.save(`Attendance_${sanitizedSessionName}_${dateStr}.pdf`);
      toast.success(`PDF downloaded successfully with ${reversedSignatures.length} signatures!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate PDF. Please try again.';
      toast.error(errorMsg);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiUsers className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Attendance Session Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Active Session Banner */}
          {activeSession && (
            <div className="bg-purple-100 border-l-4 border-purple-600 p-4 mb-6 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-purple-800 text-lg">{activeSession.sessionName}</p>
                  <p className="text-sm text-purple-700">Active Session - {activeSession.signatures.length} signatures</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRefreshSession(activeSession._id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                    title="Refresh session and clear all signatures"
                  >
                    <FiRefreshCw className="mr-1" /> Refresh
                  </button>
                  <button
                    onClick={() => handleCloseSession(activeSession._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Close Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Session Button */}
          {!showCreateForm && !activeSession && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105 mb-6"
            >
              + Create New Attendance Session
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateSession} className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Create New Session</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    value={formData.sessionName}
                    onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Sunday Service - Oct 19, 2025"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Add any additional details..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Create Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ sessionName: '', description: '' });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sessions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-3">All Sessions ({sessions.length})</h3>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No attendance sessions yet. Create one to get started!</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-lg">{session.sessionName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          session.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status === 'Active' ? <><FiClock className="inline mr-1" /> Active</> : <><FiCheckCircle className="inline mr-1" /> Closed</>}
                        </span>
                      </div>
                      {session.description && (
                        <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                      )}
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Opened: {formatDateTime(session.openedAt)}</p>
                        {session.closedAt && (
                          <p>Closed: {formatDateTime(session.closedAt)}</p>
                        )}
                        <p className="font-semibold text-purple-600">
                          {session.signatures.length} signature{session.signatures.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => viewSessionDetails(session._id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => downloadPDF(session)}
                        className="bg-gold-500 hover:bg-gold-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors flex items-center justify-center"
                      >
                        <FiDownload className="mr-1" /> PDF
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors flex items-center justify-center"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Session Details Modal */}
          {selectedSession && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{selectedSession.sessionName} - Signatures</h3>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Full Name</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Phone Number</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Signed At</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Signature</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...selectedSession.signatures].reverse().map((sig, index) => (
                          <tr key={sig._id || index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              {sig.fullName}
                              {sig.isRegistered === false && (
                                <span className="ml-2 text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded-full font-semibold">
                                  ⭐ New Member
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{sig.phoneNumber}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDateTime(sig.signedAt)}</td>
                            <td className="px-4 py-3">
                              <img
                                src={sig.signature}
                                alt="Signature"
                                className="h-12 border border-gray-300 rounded"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSessionManager;
