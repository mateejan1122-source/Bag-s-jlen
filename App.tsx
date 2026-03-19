import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePart1, HomePart2, HomePart3 } from './pages/HomeSplit';
import { EventDetail } from './pages/EventDetail';
import ManageReservation from './pages/ManageReservation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import { AdminDashboard } from './pages/AdminDashboard';
import { DynamicPage } from './pages/DynamicPage';
import { HistoryPage } from './pages/HistoryPage';
import { BookingData } from './types';
import { Language, translations } from './translations';
import { ChatWidget } from './components/ChatWidget';
interface AllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  language: Language;
}

const AllergyModal: React.FC<AllergyModalProps> = ({ isOpen, onClose, onCancel, language }) => {
  if (!isOpen) return null;
  const t = translations[language].allergy;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#faf9f6] max-w-md w-full p-12 shadow-2xl border border-gray-100 relative text-center">
        <button onClick={onCancel} className="absolute top-6 right-6 text-gray-400 hover:text-[#CDA235] transition-colors z-50 p-2 cursor-pointer">
          <X size={24} />
        </button>
        <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>
        <div className="text-[#CDA235] text-5xl serif italic mb-8">!</div>
        <p className="text-xl serif text-[#1a1a1a] leading-relaxed mb-10 italic">
          {t.title}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#1a1a1a] text-white py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[#CDA235] transition-all shadow-xl"
        >
          {t.ok}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [language, setLanguage] = useState<Language>('da');
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);
  const [scaleMenu, setScaleMenu] = useState('1');
  const [scaleHeadings, setScaleHeadings] = useState('1');
  const [scaleBody, setScaleBody] = useState('1');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.from('settings').select('*')
      .in('key', ['font_scale_menu', 'font_scale_headings', 'font_scale_body'])
      .then(({ data, error }) => {
        if (error) {
          console.error("Font scale error:", error);
        } else if (data) {
          const sm = data.find(d => d.key === 'font_scale_menu')?.value;
          const sh = data.find(d => d.key === 'font_scale_headings')?.value;
          const sb = data.find(d => d.key === 'font_scale_body')?.value;
          if (sm) setScaleMenu(sm);
          if (sh) setScaleHeadings(sh);
          if (sb) setScaleBody(sb);
        }
      });
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleBookingStart = () => {
    setShowAllergyModal(true);
  };

  const handleAllergyConfirm = () => {
    setShowAllergyModal(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    // Small delay to ensure we are on home page before scrolling
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <style>{`
        header nav, footer {
          zoom: ${scaleMenu};
        }
        .scalable-content h1, .scalable-content h2, .scalable-content h3, .scalable-content h4, .scalable-content h5, .scalable-content h6, .scalable-content .heading-zoom {
          zoom: ${scaleHeadings};
        }
        .scalable-content p, .scalable-content li {
          zoom: ${scaleBody};
        }
      `}</style>
      <div className="bg-[#faf9f6] min-h-screen flex flex-col">
        <AllergyModal language={language} isOpen={showAllergyModal} onClose={handleAllergyConfirm} onCancel={() => setShowAllergyModal(false)} />

        {!location.pathname.startsWith('/admin') && (
          <Header
            language={language}
            onLanguageChange={setLanguage}
            onBookingStart={handleBookingStart}
          />
        )}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <div className="scalable-content">
                <HomePart1
                  language={language}
                  onBookingStart={handleBookingStart}
                  onNavigateToEvent={(id) => navigate(id ? `/event/${id}` : '/event')}
                />
                <HomePart2 language={language} onBookingStart={handleBookingStart} />
                <HomePart3
                  language={language}
                  onBookingStart={handleBookingStart}
                  onNavigateToEvent={(id) => navigate(id ? `/event/${id}` : '/event')}
                  onBookingConfirmed={(data) => {
                    setConfirmedBooking(data);
                  }}
                />
              </div>
            } />
            <Route path="/event/:id" element={<EventDetail language={language} onBookingStart={handleBookingStart} />} />
            <Route path="/event" element={<EventDetail language={language} onBookingStart={handleBookingStart} />} />
            <Route path="/manage" element={<ManageReservation language={language} confirmedBooking={confirmedBooking} initialFlow="verify" />} />
            <Route path="/admin" element={<AdminDashboard language={language} />} />
            
            {/* History Page Routes */}
            <Route path="/history" element={<HistoryPage language={language} />} />
            <Route path="/our-history" element={<HistoryPage language={language} />} />
            <Route path="/vores-historie" element={<HistoryPage language={language} />} />
            <Route path="/unsere-geschichte" element={<HistoryPage language={language} />} />
            <Route path="/:slug" element={<DynamicPage language={language} />} />
          </Routes>
        </main>

        {!location.pathname.startsWith('/admin') && (
          <Footer language={language} />
        )}

        {/* Global Chat Widget */}
        {!location.pathname.startsWith('/admin') && (
          <ChatWidget language={language} />
        )}
      </div>
    </>
  );
};

export default App;
