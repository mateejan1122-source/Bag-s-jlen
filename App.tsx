import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePart1, HomePart2, HomePart3 } from './pages/HomeSplit';
import { EventDetail } from './pages/EventDetail';
import ManageReservation from './pages/ManageReservation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import { BookingData } from './types';
import { Language, translations } from './translations';

type View = 'home' | 'event' | 'manage' | 'privacy' | 'terms';

interface AllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const AllergyModal: React.FC<AllergyModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  const t = translations[language].allergy;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#faf9f6] max-w-md w-full p-12 shadow-2xl border border-gray-100 relative text-center">
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
  const [currentView, setCurrentView] = useState<View>('home');
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [language, setLanguage] = useState<Language>('da');
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleBookingStart = () => {
    setShowAllergyModal(true);
  };

  const handleAllergyConfirm = () => {
    setShowAllergyModal(false);
    if (currentView !== 'home') {
      setCurrentView('home');
    }
    // Small delay to ensure we are on home page before scrolling
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNavigate = (view: string) => {
    if (view === '/') setCurrentView('home');
    else if (view === 'manage') setCurrentView('manage');
    else if (view === 'event') setCurrentView('event');
    else if (view === 'privacy') setCurrentView('privacy');
    else if (view === 'terms') setCurrentView('terms');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <HomePart1 language={language} onBookingStart={handleBookingStart} />
            <HomePart2 language={language} onBookingStart={handleBookingStart} />
            <HomePart3 
              language={language} 
              onBookingStart={handleBookingStart} 
              onNavigateToEvent={() => setCurrentView('event')}
              onBookingConfirmed={(data) => {
                setConfirmedBooking(data);
              }}
            />
          </>
        );
      case 'event':
        return <EventDetail language={language} onBookingStart={handleBookingStart} />;
      case 'manage':
        return <ManageReservation language={language} confirmedBooking={confirmedBooking} initialFlow="verify" />;
      case 'privacy':
        return <PrivacyPolicy language={language} />;
      case 'terms':
        return <Terms language={language} />;
      default:
        return <HomePart1 language={language} onBookingStart={handleBookingStart} />;
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen flex flex-col">
      <AllergyModal language={language} isOpen={showAllergyModal} onClose={handleAllergyConfirm} />

      <Header 
        language={language} 
        onLanguageChange={setLanguage} 
        onNavigate={handleNavigate} 
        onBookingStart={handleBookingStart} 
      />

      <main className="flex-grow">
        {renderView()}
      </main>

      <Footer language={language} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
