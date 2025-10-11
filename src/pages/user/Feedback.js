import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiClock } from 'react-icons/fi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Feedback = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    type: 'Feedback',
    subject: '',
    message: ''
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/feedback/my-conversations');
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/feedback', newFeedback);

      if (response.data.success) {
        toast.success('Feedback sent successfully!');
        setShowNewForm(false);
        setNewFeedback({
          type: 'Feedback',
          subject: '',
          message: ''
        });
        fetchConversations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeConversation) return;

    setLoading(true);

    try {
      const response = await axios.post(`/feedback/${activeConversation._id}/reply`, {
        message: replyMessage
      });

      if (response.data.success) {
        toast.success('Reply sent successfully!');
        setReplyMessage('');
        fetchConversations();
        // Update active conversation
        const updatedConv = conversations.find(c => c._id === activeConversation._id);
        setActiveConversation(updatedConv);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.abs(now - messageDate) / 36e5;

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback & Messages</h1>
          <p className="text-gray-600 mt-1">Send feedback and communicate with church leadership</p>
        </div>
        <Button
          variant="primary"
          icon={FiMessageSquare}
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          New Message
        </Button>
      </div>

      {/* New Feedback Form */}
      {showNewForm && (
        <Card title="Send New Feedback" className="border-t-4 border-primary-600">
          <form onSubmit={handleSubmitNew} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={newFeedback.type}
                onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Feedback">Feedback</option>
                <option value="Recommendation">Recommendation</option>
                <option value="Insight">Insight</option>
                <option value="Prayer Request">Prayer Request</option>
                <option value="Question">Question</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={newFeedback.subject}
                onChange={(e) => setNewFeedback({ ...newFeedback, subject: e.target.value })}
                required
                placeholder="Brief subject of your message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={newFeedback.message}
                onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                required
                rows="6"
                placeholder="Write your message here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowNewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="lg:col-span-1">
          <Card title="Your Conversations" className="border-t-4 border-gold-500">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      activeConversation?._id === conv._id
                        ? 'bg-primary-50 border-2 border-primary-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {conv.subject}
                      </h4>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {conv.lastMessage}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className={`px-2 py-1 rounded-full ${
                        conv.type === 'Feedback' ? 'bg-primary-100 text-primary-700' :
                        conv.type === 'Recommendation' ? 'bg-gold-100 text-gold-700' :
                        'bg-burgundy-100 text-burgundy-700'
                      }`}>
                        {conv.type}
                      </span>
                      <span>{formatTime(conv.lastMessageAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-2">
          {!activeConversation ? (
            <Card>
              <div className="text-center py-16">
                <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to view messages</p>
              </div>
            </Card>
          ) : (
            <Card className="border-t-4 border-primary-600">
              {/* Conversation Header */}
              <div className="border-b pb-4 mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeConversation.subject}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  activeConversation.type === 'Feedback' ? 'bg-primary-100 text-primary-700' :
                  activeConversation.type === 'Recommendation' ? 'bg-gold-100 text-gold-700' :
                  'bg-burgundy-100 text-burgundy-700'
                }`}>
                  {activeConversation.type}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {activeConversation.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${
                      msg.sender === user._id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    } rounded-lg p-4`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <FiUser className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {msg.senderName}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{msg.message}</p>
                      <div className="flex items-center text-xs opacity-75">
                        <FiClock className="w-3 h-3 mr-1" />
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="border-t pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !replyMessage.trim()}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                    icon={FiSend}
                  >
                    Send
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
