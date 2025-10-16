const UserPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">House of David</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to House of David</h2>

          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600 mb-4">Church Management System</h3>
            <p className="text-gray-500 mb-6">Welcome to our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Events</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Upcoming Services</li>
                <li>Community Gatherings</li>
                <li>Special Programs</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>View Events</li>
                <li>Check Announcements</li>
                <li>Submit Feedback</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Resources</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Devotionals</li>
                <li>News & Updates</li>
                <li>Contact Information</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserPage;
