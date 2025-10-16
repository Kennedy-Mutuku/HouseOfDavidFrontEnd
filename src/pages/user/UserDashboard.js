import React, { useState, useEffect } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiArrowUp,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import GivingModal from '../../components/GivingModal';

const UserDashboard = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [givingModal, setGivingModal] = useState({
    isOpen: false,
    type: ''
  });

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
      items: ['Tithe', 'Offering', 'Special Giving']
    },
    {
      id: 'attendance',
      title: 'SIGN ATTENDANCE',
      description: 'Mark your presence at services and events',
      items: ['Sunday Service', 'Midweek Service', 'Prayer Meeting', 'Special Events']
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

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-12 xl:-mx-16 2xl:-mx-20 -mt-8">
      {/* Beautiful Carousel with Bible Verses */}
      <div className="relative w-full h-72 md:h-96 lg:h-[32rem] overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Decorative Glow Effects */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-400/25 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Sparkle Effect Overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 40% 20%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '200px 200px'
        }}></div>

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
                    <span className="inline-block bg-white/25 border-2 border-white/60 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider shadow-2xl backdrop-blur-md">
                      {slide.theme}
                    </span>
                  </div>

                  {/* Bible Verse */}
                  <div className="relative">
                    <div className="absolute -top-4 md:-top-8 -left-2 md:-left-4 lg:-left-8 text-orange-300/50 text-6xl md:text-8xl lg:text-9xl font-serif">"</div>
                    <p className="text-base md:text-2xl lg:text-3xl text-white font-serif leading-relaxed mb-4 md:mb-8 relative z-10 drop-shadow-2xl italic px-4 md:px-0 [text-shadow:_0_4px_12px_rgb(0_0_0_/_40%)]">
                      {slide.verse}
                    </p>
                    <div className="absolute -bottom-2 md:-bottom-4 -right-2 md:-right-4 lg:-right-8 text-orange-300/50 text-6xl md:text-8xl lg:text-9xl font-serif rotate-180">"</div>
                  </div>

                  {/* Reference */}
                  <div className="mt-8">
                    <p className="text-orange-200 text-lg md:text-2xl font-extrabold tracking-wide drop-shadow-2xl">
                      — {slide.reference}
                    </p>
                  </div>

                  {/* Decorative Line */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full shadow-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all shadow-lg hover:scale-110 z-20"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all shadow-lg hover:scale-110 z-20"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full shadow-2xl ${
                index === currentSlide
                  ? 'bg-orange-400 w-12 h-3'
                  : 'bg-white/50 hover:bg-white/80 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      </div>

      {/* Welcome Banner with Sweet Church Message - Overlapping */}
      <div className="relative z-20 flex justify-center -mt-5">
        <div className="bg-white rounded-full shadow-2xl border-3 border-teal-500 px-6 md:px-8 py-2.5">
          <h2 className="text-sm md:text-base lg:text-lg font-bold text-purple-900 uppercase tracking-wide whitespace-nowrap">
            <span className="hidden md:inline">Welcome to God's House - </span>Where Love, Faith & Hope Unite
          </h2>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 rounded-t-3xl -mt-5 relative z-10 shadow-2xl">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-8 pt-16">

          {/* Collapsible Ministry Sections */}
          <div className="space-y-5">
            {sections.map((section, idx) => (
              <div key={section.id} className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 text-white px-6 md:px-8 py-3 flex items-center justify-between transition-all duration-300 group shadow-lg"
                >
                  <span className="font-bold text-sm md:text-base tracking-wide">{section.title}</span>
                  <div>
                    {expandedSections[section.id] ? (
                      <FiChevronUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </button>

                {expandedSections[section.id] && (
                  <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-6 md:px-8 py-6 border-x-4 border-b-4 border-orange-500/30 animate-fade-in">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.items.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => section.id === 'giving' && handleGivingClick(item)}
                          className={`flex items-start space-x-3 text-orange-900 text-sm md:text-base py-2.5 px-4 bg-white rounded-lg hover:bg-orange-100 transition-colors border border-orange-300/50 shadow-sm ${
                            section.id === 'giving' ? 'cursor-pointer hover:shadow-md' : ''
                          }`}
                        >
                          <span className="text-orange-500 font-bold mt-0.5">•</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-10 text-center bg-gradient-to-r from-teal-100 via-cyan-50 to-orange-100 rounded-2xl p-8 border-2 border-teal-300 shadow-lg">
            <h3 className="text-2xl font-bold text-teal-700 mb-3">Ready to Get Involved?</h3>
            <p className="text-gray-700 mb-5 max-w-2xl mx-auto">
              Connect with our ministry teams and find your place in our community.
              Your journey of faith and service starts here.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        {/* Help Button */}
        <button
          className="bg-cyan-400 hover:bg-cyan-500 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110"
          aria-label="Help"
        >
          <FiHelpCircle className="w-6 h-6" />
        </button>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="bg-cyan-400 hover:bg-cyan-500 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110 animate-fade-in"
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
    </div>
  );
};

export default UserDashboard;
