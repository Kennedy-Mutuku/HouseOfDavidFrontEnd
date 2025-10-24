import React, { useState, useEffect } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiArrowUp,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiUsers,
  FiHeart
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import GivingModal from '../../components/GivingModal';
import MemberDetailModal from '../../components/MemberDetailModal';
import HistoryModal from '../../components/HistoryModal';
import InGatheringModal from '../../components/InGatheringModal';
import AddNurturingModal from '../../components/AddNurturingModal';
import SignAttendance from '../../components/SignAttendance';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [expandedSections, setExpandedSections] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [givingModal, setGivingModal] = useState({
    isOpen: false,
    type: ''
  });
  const [inGatheringModal, setInGatheringModal] = useState(false);
  const [nurturingModal, setNurturingModal] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [loadingMemberData, setLoadingMemberData] = useState(false);
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    type: '',
    data: [],
    loading: false
  });

  // Fetch member data when info button is clicked
  useEffect(() => {
    if (showUserInfo && isAuthenticated && user && !memberData) {
      fetchMemberData();
    }
  }, [showUserInfo, isAuthenticated, user]);

  const fetchMemberData = async () => {
    if (!user?.email) return;

    setLoadingMemberData(true);
    try {
      const response = await axios.get('/api/members');
      const members = response.data.data;
      const matchedMember = members.find(m => m.email === user.email);

      if (matchedMember) {
        setMemberData(matchedMember);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoadingMemberData(false);
    }
  };

  const handleInfoClick = () => {
    setShowUserInfo(true);
  };

  const handleCloseInfo = () => {
    setShowUserInfo(false);
  };

  const carouselSlides = [
    {
      verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
      reference: "Jeremiah 29:11",
      theme: "Hope & Purpose"
    },
    {
      verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
      reference: "Proverbs 3:5-6",
      theme: "Faith & Trust"
    },
    {
      verse: "I can do all things through Christ who strengthens me.",
      reference: "Philippians 4:13",
      theme: "Strength & Courage"
    },
    {
      verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      reference: "Joshua 1:9",
      theme: "Courage & Presence"
    },
    {
      verse: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
      reference: "Psalm 23:1-3",
      theme: "Peace & Provision"
    }
  ];

  const sections = [
    {
      id: 'giving',
      title: 'RECORD MY GIVING',
      description: 'Track your tithes, offerings, and contributions',
      items: ['Offering', 'Tithe', 'Extra Givings']
    },
    {
      id: 'ingathering',
      title: 'ADD IN-GATHERING',
      description: 'Record guests and new members you invited',
      items: ['New Guests', 'Follow-up Contacts', 'Baptism Candidates', 'Ministry Referrals']
    },
    {
      id: 'nurturing',
      title: 'ADD NURTURING',
      description: 'Track discipleship and member care activities',
      items: ['New Member Follow-up', 'Pastoral Care', 'Mentorship Programs', 'Spiritual Growth Tracking']
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGivingClick = (givingType) => {
    setGivingModal({
      isOpen: true,
      type: givingType
    });
  };

  const closeGivingModal = () => {
    setGivingModal({
      isOpen: false,
      type: ''
    });
  };

  const handleInGatheringClick = () => {
    setInGatheringModal(true);
  };

  const closeInGatheringModal = () => {
    setInGatheringModal(false);
  };

  const handleNurturingClick = () => {
    setNurturingModal(true);
  };

  const closeNurturingModal = () => {
    setNurturingModal(false);
  };

  const handleHistoryClick = async (historyType) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please log in to view your history');
      // You can redirect to login page here if needed
      // window.location.href = '/login';
      return;
    }

    setHistoryModal({
      isOpen: true,
      type: historyType,
      data: [],
      loading: true
    });

    try {
      let response;
      let historyData = [];

      switch (historyType) {
        case 'giving':
          // Fetch user's giving history
          response = await axios.get('/donations/my-giving');
          // Extract history array from response - backend returns { data: { history: [...], stats: {...} } }
          historyData = response.data.data?.history || [];
          // Sort by createdAt descending (latest first) - extra safety in case backend doesn't sort
          historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          console.log('Giving history response:', response.data);
          console.log('Extracted giving history:', historyData);
          break;

        case 'ingathering':
          // Fetch user's ingathering records
          response = await axios.get('/ingathering/my-ingathering');
          // Extract list array from response - backend returns { data: { list: [...], stats: {...} } }
          historyData = response.data.data?.list || [];
          // Sort by createdAt descending (latest first)
          historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          console.log('Ingathering history response:', response.data);
          console.log('Extracted ingathering history:', historyData);
          break;

        case 'nurturing':
          // Fetch user's nurturing records
          response = await axios.get('/nurturing/my-nurturing');
          // Extract list array from response - backend returns { data: { list: [...], stats: {...} } }
          historyData = response.data.data?.list || [];
          // Sort by createdAt descending (latest first)
          historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          console.log('Nurturing history response:', response.data);
          console.log('Extracted nurturing history:', historyData);
          break;

        default:
          historyData = [];
      }

      setHistoryModal(prev => ({
        ...prev,
        data: historyData,
        loading: false
      }));

      if (historyData.length === 0 && historyType !== 'nurturing') {
        toast.info(`You don't have any ${historyType} history yet`);
      }
    } catch (error) {
      console.error(`Error fetching ${historyType} history:`, error);

      // Check if error is due to authentication
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        toast.error(`Failed to load ${historyType} history`);
      }

      setHistoryModal(prev => ({
        ...prev,
        data: [],
        loading: false
      }));
    }
  };

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      type: '',
      data: [],
      loading: false
    });
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-12 xl:-mx-16 2xl:-mx-20 -mt-8">
      {/* Beautiful Carousel with Bible Verses */}
      <div className="relative w-full h-72 md:h-96 lg:h-[32rem] overflow-hidden bg-white">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236B2C91' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Decorative Glow Effects - Subtle Purple & Gold */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold-200/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-purple-100/15 rounded-full blur-3xl"></div>

        {/* Carousel Slides */}
        <div className="relative h-full">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="h-full flex items-center justify-center px-6 md:px-12 lg:px-20 py-8">
                <div className="max-w-5xl mx-auto text-center">
                  {/* Theme Badge */}
                  <div className="mb-4 md:mb-6">
                    <span className="inline-block bg-white border-2 border-gold-500 text-purple-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider shadow-lg">
                      {slide.theme}
                    </span>
                  </div>

                  {/* Bible Verse */}
                  <div className="relative">
                    <div className="absolute -top-4 md:-top-8 -left-2 md:-left-4 lg:-left-8 text-gold-500/40 text-6xl md:text-8xl lg:text-9xl font-serif">"</div>
                    <p className="text-base md:text-2xl lg:text-3xl text-black font-serif leading-relaxed mb-4 md:mb-8 relative z-10 italic px-4 md:px-0">
                      {slide.verse}
                    </p>
                    <div className="absolute -bottom-2 md:-bottom-4 -right-2 md:-right-4 lg:-right-8 text-gold-500/40 text-6xl md:text-8xl lg:text-9xl font-serif rotate-180">"</div>
                  </div>

                  {/* Reference */}
                  <div className="mt-8">
                    <p className="text-purple-600 text-lg md:text-2xl font-extrabold tracking-wide">
                      — {slide.reference}
                    </p>
                  </div>

                  {/* Decorative Line */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent rounded-full shadow-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-purple-600 p-2 md:p-3 rounded-full transition-all hover:scale-110 z-20 border-2 border-purple-600/50 hover:border-purple-600 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-purple-600 p-2 md:p-3 rounded-full transition-all hover:scale-110 z-20 border-2 border-purple-600/50 hover:border-purple-600 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

      </div>

      {/* Welcome Banner with Sweet Church Message - Overlapping */}
      <div className="relative z-20 flex items-center justify-center -mt-5 w-screen ml-[calc(-50vw+50%)]">
        {/* Left Gold Line */}
        <div className="flex-1 h-0.5 bg-gold-500"></div>

        {/* Welcome Banner Oval */}
        <div className="bg-white rounded-full border-2 border-gold-500 px-6 md:px-8 py-2.5 flex-shrink-0">
          <h2 className="text-sm md:text-base lg:text-lg font-bold text-purple-600 uppercase tracking-wide whitespace-nowrap">
            <span className="hidden md:inline">Welcome to God's House - </span>Where Love, Faith & Hope Unite
          </h2>
        </div>

        {/* Right Gold Line */}
        <div className="flex-1 h-0.5 bg-gold-500"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 w-screen ml-[calc(-50vw+50%)] -mt-[1.5rem]">
        <div className="relative bg-gray-200 pt-5">
          {/* Left Gold Border - Desktop Only */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-0.5 bg-gold-500"></div>

          {/* Right Gold Border - Desktop Only */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-0.5 bg-gold-500"></div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">

          {/* Collapsible Ministry Sections */}
          <div className="space-y-5">
            {sections.map((section, idx) => (
              <div key={section.id} className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <button
                  onClick={() => {
                    if (section.id === 'ingathering') {
                      handleInGatheringClick();
                    } else if (section.id === 'nurturing') {
                      handleNurturingClick();
                    } else {
                      toggleSection(section.id);
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 md:px-8 py-3 flex items-center justify-between transition-all duration-300 group shadow-lg"
                >
                  <span className="font-bold text-sm md:text-base tracking-wide">{section.title}</span>
                  <div>
                    {(section.id === 'ingathering' || section.id === 'nurturing') ? (
                      <FiChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    ) : expandedSections[section.id] ? (
                      <FiChevronUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </button>

                {expandedSections[section.id] && section.id !== 'ingathering' && section.id !== 'nurturing' && (
                  <div className="bg-gray-50 px-6 md:px-8 py-6 border-x-2 border-b-2 border-gray-200 animate-fade-in">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.items.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => section.id === 'giving' && handleGivingClick(item)}
                          className={`flex items-start space-x-3 text-black text-sm md:text-base py-2.5 px-4 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-gray-200 shadow-sm ${
                            section.id === 'giving' ? 'cursor-pointer hover:shadow-md hover:border-purple-300' : ''
                          }`}
                        >
                          <span className="text-gold-500 font-bold mt-0.5">•</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* History Buttons */}
          <div className="mt-6 space-y-3">
            {/* My Giving History - Full Width */}
            <button
              onClick={() => handleHistoryClick('giving')}
              className="w-full group bg-white hover:bg-purple-50 text-purple-600 border-2 border-gold-500 hover:border-gold-600 rounded-lg p-4 shadow-md transition-all transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-1"
              aria-label="My Giving History"
            >
              <FiDollarSign className="w-6 h-6 md:w-7 md:h-7 text-gold-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm md:text-base font-bold text-center">My Giving History</span>
            </button>

            {/* Sign Attendance Component */}
            <SignAttendance />

            {/* My Ingathering and My Nurturing - Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              {/* My Ingathering History */}
              <button
                onClick={() => handleHistoryClick('ingathering')}
                className="group bg-gray-100 hover:bg-purple-50 text-purple-600 border-2 border-gray-300 hover:border-purple-400 rounded-lg p-4 shadow-md transition-all transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-1"
                aria-label="My Ingathering History"
              >
                <FiUsers className="w-5 h-5 md:w-6 md:h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] md:text-xs font-bold text-center">My Ingathering History</span>
              </button>

              {/* My Nurturing History */}
              <button
                onClick={() => handleHistoryClick('nurturing')}
                className="group bg-gray-100 hover:bg-purple-50 text-purple-600 border-2 border-gray-300 hover:border-purple-400 rounded-lg p-4 shadow-md transition-all transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-1"
                aria-label="My Nurturing History"
              >
                <FiHeart className="w-5 h-5 md:w-6 md:h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] md:text-xs font-bold text-center">My Nurturing History</span>
              </button>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-10 text-center bg-white rounded-2xl p-8 border-2 border-gold-500 shadow-lg">
            <h3 className="text-2xl font-bold text-purple-600 mb-3">Ready to Get Involved?</h3>
            <p className="text-gray-700 mb-5 max-w-2xl mx-auto">
              Connect with our ministry teams and find your place in our community.
              Your journey of faith and service starts here.
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="bg-gold-500 hover:bg-gold-600 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110 animate-fade-in"
            aria-label="Scroll to top"
          >
            <FiArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Giving Modal */}
      <GivingModal
        isOpen={givingModal.isOpen}
        onClose={closeGivingModal}
        givingType={givingModal.type}
        onSuccess={() => {
          toast.success('Thank you for your contribution!');
        }}
      />

      {/* InGathering Modal */}
      <InGatheringModal
        isOpen={inGatheringModal}
        onClose={closeInGatheringModal}
        onSuccess={() => {
          toast.success('Visitor added successfully!');
        }}
      />

      {/* Nurturing Modal */}
      <AddNurturingModal
        isOpen={nurturingModal}
        onClose={closeNurturingModal}
        onSuccess={() => {
          toast.success('Nurturing record added successfully!');
        }}
      />

      {/* User Info Modal */}
      <MemberDetailModal
        isOpen={showUserInfo}
        onClose={handleCloseInfo}
        member={memberData}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModal.isOpen}
        onClose={closeHistoryModal}
        historyType={historyModal.type}
        historyData={historyModal.data}
        loading={historyModal.loading}
      />
    </div>
  );
};

export default UserDashboard;
