import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import axios from 'axios';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    percentage: 0
  });
  const [signInForm, setSignInForm] = useState({
    serviceType: 'Sunday Service',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get('/attendance/my-attendance');
      if (response.data.success) {
        setAttendanceHistory(response.data.data.history);
        setStats(response.data.data.stats);
        setTodayAttendance(response.data.data.todayAttendance);
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/attendance/sign-in', signInForm);

      if (response.data.success) {
        toast.success('Attendance signed successfully!');
        fetchAttendanceData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSignInForm({
      ...signInForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your church attendance and participation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Total Services</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
              <p className="text-primary-200 text-xs mt-1">All time</p>
            </div>
            <FiCheckCircle className="w-12 h-12 text-primary-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gold-500 to-gold-600 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-100 text-sm mb-1">This Month</p>
              <h3 className="text-3xl font-bold">{stats.thisMonth}</h3>
              <p className="text-gold-200 text-xs mt-1">Services attended</p>
            </div>
            <FiCalendar className="w-12 h-12 text-gold-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-burgundy-600 to-burgundy-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-burgundy-100 text-sm mb-1">Attendance Rate</p>
              <h3 className="text-3xl font-bold">{stats.percentage}%</h3>
              <p className="text-burgundy-200 text-xs mt-1">This year</p>
            </div>
            <div className="text-4xl font-bold text-burgundy-200">📈</div>
          </div>
        </Card>
      </div>

      {/* Sign In Form */}
      <Card title="Sign Today's Attendance" className="border-t-4 border-gold-500">
        {todayAttendance ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance Already Signed!</h3>
            <p className="text-gray-600">You've signed your attendance for today's service</p>
            <p className="text-sm text-gray-500 mt-2">
              Signed at: {new Date(todayAttendance.signedAt).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <div className="flex items-center text-primary-800">
                <FiCalendar className="w-5 h-5 mr-2" />
                <span className="font-medium">Today's Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={signInForm.serviceType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="Sunday Service">Sunday Service</option>
                  <option value="Mid-Week Service">Mid-Week Service</option>
                  <option value="Prayer Meeting">Prayer Meeting</option>
                  <option value="Bible Study">Bible Study</option>
                  <option value="Youth Service">Youth Service</option>
                  <option value="Special Service">Special Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={signInForm.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700"
              icon={FiCheckCircle}
            >
              {loading ? 'Signing In...' : 'Sign Attendance'}
            </Button>
          </form>
        )}
      </Card>

      {/* Attendance History */}
      <Card title="Attendance History" className="border-t-4 border-primary-600">
        {attendanceHistory.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No attendance records yet</p>
            <p className="text-sm text-gray-400 mt-2">Sign in to your first service above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendanceHistory.map((attendance) => (
              <div
                key={attendance._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 rounded-full p-3">
                    <FiCheckCircle className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{attendance.serviceType}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {new Date(attendance.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        {attendance.time}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Present
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Monthly Summary */}
      <Card title="Monthly Summary" className="border-t-4 border-burgundy-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { month: 'January', count: stats.january || 0 },
            { month: 'February', count: stats.february || 0 },
            { month: 'March', count: stats.march || 0 },
            { month: 'April', count: stats.april || 0 }
          ].map((item) => (
            <div key={item.month} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">{item.month}</p>
              <p className="text-2xl font-bold text-primary-800">{item.count}</p>
              <p className="text-xs text-gray-500 mt-1">services</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
