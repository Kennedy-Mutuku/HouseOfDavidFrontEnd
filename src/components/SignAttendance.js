import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheckCircle, FiUsers } from 'react-icons/fi';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import SignatureCanvas from 'react-signature-canvas';

const SignAttendance = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const signatureRef = useRef(null);

  useEffect(() => {
    fetchActiveSession();
    // Poll every 30 seconds for session updates
    const interval = setInterval(fetchActiveSession, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSession = async () => {
    try {
      const response = await axios.get('/attendance-sessions/active');
      if (response.data.success && response.data.data) {
        const newSession = response.data.data;

        // Check if this is a new session (different from previous)
        if (activeSession && activeSession._id !== newSession._id) {
          toast.info(`New attendance session opened: ${newSession.sessionName}`, {
            position: "top-center",
            autoClose: 5000
          });
          setShowForm(false); // Reset form visibility for new session
        }

        setActiveSession(newSession);
      } else {
        setActiveSession(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phoneNumber.trim()) {
      toast.error('Please enter your full name and phone number');
      return;
    }

    if (signatureRef.current.isEmpty()) {
      toast.error('Please provide your signature');
      return;
    }

    setSigning(true);
    try {
      const signatureData = signatureRef.current.toDataURL();

      const response = await axios.post(`/attendance-sessions/${activeSession._id}/sign`, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        signature: signatureData
      });

      if (response.data.success) {
        toast.success('Attendance signed successfully!');
        setFormData({ fullName: '', phoneNumber: '' });
        signatureRef.current.clear();
        setShowForm(false); // Hide form after successful submission
        fetchActiveSession(); // Refresh to show updated count
      }
    } catch (error) {
      console.error('Error signing attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to sign attendance');
    } finally {
      setSigning(false);
    }
  };

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 rounded-2xl shadow-xl p-8 text-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-2xl shadow-xl p-8 text-center">
        <FiUsers className="w-16 h-16 text-white mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Active Attendance Session</h3>
        <p className="text-gray-100">Please wait for the admin to open an attendance session</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center">
              <FiCheckCircle className="mr-2" /> Sign Attendance
            </h3>
            <p className="text-green-100 text-sm mt-1">{activeSession.sessionName}</p>
          </div>
          <div className="text-right">
            <p className="text-white text-lg font-bold">{activeSession.signatureCount || 0}</p>
            <p className="text-green-100 text-xs">Signed</p>
          </div>
        </div>
      </div>

      {/* Session Info and Click to Sign */}
      {!showForm ? (
        <div className="p-8 text-center">
          <div className="mb-6">
            <h4 className="text-white text-xl font-bold mb-2">{activeSession.sessionName} Attendance Opened</h4>
            {activeSession.description && (
              <p className="text-purple-100 text-sm italic mb-4">{activeSession.description}</p>
            )}
            <p className="text-purple-100">
              <span className="font-semibold text-white">{activeSession.signatureCount || 0}</span> members have already signed
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Click to Sign Attendance
          </button>
        </div>
      ) : (
        <>
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-white font-semibold mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Phone Number *</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., 0712345678"
            required
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Signature *</label>
          <div className="bg-white rounded-lg p-2 border-2 border-purple-400">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-40 border border-gray-300 rounded',
                style: { width: '100%', height: '160px' }
              }}
              backgroundColor="white"
            />
          </div>
          <button
            type="button"
            onClick={clearSignature}
            className="mt-2 text-white text-sm hover:text-red-300 transition-colors"
          >
            Clear Signature
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={signing}
            className="w-2/3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signing ? 'Signing...' : 'Sign Attendance'}
          </button>
        </div>
      </form>
        </>
      )}
    </div>
  );
};

export default SignAttendance;
