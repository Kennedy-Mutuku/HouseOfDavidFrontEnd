import React, { useState, useEffect } from 'react';
import { FiBell, FiBookOpen, FiCalendar, FiUser } from 'react-icons/fi';
import Card from '../../components/Card';
import axios from 'axios';
import { toast } from 'react-toastify';

const Announcements = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [devotions, setDevotions] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [announcementsRes, devotionsRes, newsRes] = await Promise.all([
        axios.get('/announcements'),
        axios.get('/devotions'),
        axios.get('/news')
      ]);

      if (announcementsRes.data.success) {
        setAnnouncements(announcementsRes.data.data);
      }

      if (devotionsRes.data.success) {
        setDevotions(devotionsRes.data.data);
      }

      if (newsRes.data.success) {
        setNews(newsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-6 py-3 font-medium rounded-t-lg transition-colors ${
        activeTab === id
          ? 'bg-white text-primary-700 border-t-4 border-primary-600 shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs ${
        activeTab === id ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    </button>
  );

  const ContentCard = ({ item, type }) => {
    const getIcon = () => {
      if (type === 'announcements') return FiBell;
      if (type === 'devotions') return FiBookOpen;
      return FiBell;
    };

    const Icon = getIcon();

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4">
          <div className={`rounded-full p-3 flex-shrink-0 ${
            type === 'announcements' ? 'bg-primary-100' :
            type === 'devotions' ? 'bg-gold-100' :
            'bg-burgundy-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              type === 'announcements' ? 'text-primary-600' :
              type === 'devotions' ? 'text-gold-600' :
              'text-burgundy-600'
            }`} />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>

            {item.author && (
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <FiUser className="w-4 h-4 mr-1" />
                <span className="mr-4">By {item.author}</span>
                <FiCalendar className="w-4 h-4 mr-1" />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            )}

            {item.category && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                type === 'announcements' ? 'bg-primary-100 text-primary-800' :
                type === 'devotions' ? 'bg-gold-100 text-gold-800' :
                'bg-burgundy-100 text-burgundy-800'
              }`}>
                {item.category}
              </span>
            )}

            <div className="prose prose-sm max-w-none text-gray-600 mt-3">
              {item.content}
            </div>

            {item.scripture && (
              <div className="mt-4 p-4 bg-gold-50 border-l-4 border-gold-500 rounded">
                <p className="text-sm italic text-gray-700">{item.scripture}</p>
              </div>
            )}

            {item.actionRequired && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">⚠️ Action Required</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Church Updates</h1>
        <p className="text-gray-600 mt-1">Stay informed with latest announcements, devotions, and news</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-2">
          <TabButton
            id="announcements"
            label="Announcements"
            icon={FiBell}
            count={announcements.length}
          />
          <TabButton
            id="devotions"
            label="Devotions"
            icon={FiBookOpen}
            count={devotions.length}
          />
          <TabButton
            id="news"
            label="News"
            icon={FiBell}
            count={news.length}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading content...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'announcements' && (
            <>
              {announcements.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No announcements at this time</p>
                  </div>
                </Card>
              ) : (
                announcements.map((item) => (
                  <ContentCard key={item._id} item={item} type="announcements" />
                ))
              )}
            </>
          )}

          {activeTab === 'devotions' && (
            <>
              {devotions.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No devotions available yet</p>
                  </div>
                </Card>
              ) : (
                devotions.map((item) => (
                  <ContentCard key={item._id} item={item} type="devotions" />
                ))
              )}
            </>
          )}

          {activeTab === 'news' && (
            <>
              {news.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No news updates at this time</p>
                  </div>
                </Card>
              ) : (
                news.map((item) => (
                  <ContentCard key={item._id} item={item} type="news" />
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements;
