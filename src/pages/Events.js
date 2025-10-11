import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import axios from 'axios';
import { toast } from 'react-toastify';

const Events = () => {
  const { hasRole } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');

      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await axios.delete(`/events/${id}`);

      if (response.data.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        {hasRole(['admin', 'superadmin']) && (
          <Button variant="primary" icon={FiPlus}>
            Create Event
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">No events found</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FiCalendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === 'Upcoming'
                      ? 'bg-blue-100 text-blue-800'
                      : event.status === 'Ongoing'
                      ? 'bg-green-100 text-green-800'
                      : event.status === 'Completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="font-medium w-20">Type:</span>
                  <span>{event.eventType}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">Date:</span>
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">Time:</span>
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">Location:</span>
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">Attendees:</span>
                  <span>{event.attendeeCount || 0}</span>
                </div>
              </div>

              {hasRole(['admin', 'superadmin']) && (
                <div className="flex space-x-2 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <FiEdit className="inline w-4 h-4 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="flex-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="inline w-4 h-4 mr-1" /> Delete
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
