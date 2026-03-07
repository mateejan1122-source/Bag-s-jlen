import React from 'react';
import { Language, translations } from '../translations';

interface EventDetailProps {
  onBookingStart?: () => void;
  language: Language;
}

export const EventDetail: React.FC<EventDetailProps> = ({ onBookingStart, language }) => {
  const t = translations[language].eventDetail;
  const tNews = translations[language].news;

  return (
    <div className="bg-[#faf9f6] min-h-screen">
      {/* Event Hero - Neutral Dark Background */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 z-10"></div>
        <div className="relative z-20 text-center px-4">
          <span className="text-[#CDA235] text-[12px] md:text-[14px] font-bold tracking-[0.6em] uppercase block mb-6 drop-shadow-lg">{tNews.eventTag}</span>
          <h1 className="text-5xl md:text-8xl serif italic text-white tracking-tighter leading-none mb-4">{tNews.eventTitle}</h1>
          <p className="text-white/80 text-[12px] md:text-[14px] font-bold uppercase tracking-[0.4em]">{t.eventHeroDate}</p>
        </div>
      </section>

      {/* Event Content */}
      <section className="max-w-4xl mx-auto py-20 md:py-32 px-6">
        <div className="flex flex-col gap-12 md:gap-20">
          <div className="text-left space-y-12 text-[16px] md:text-[18px] text-gray-600 font-light leading-relaxed serif italic">
            <div className="space-y-8">
              <p>{t.p1}</p>
              <p>{t.p2}</p>
            </div>

            {/* Event Flyer Image */}
            <div className="my-16 md:my-24 shadow-2xl border border-gray-100 overflow-hidden bg-white group">
              <img 
                src="https://i.pixi.mg/i/6ce47e10d2138e072bc6c21f.png" 
                alt="Italiensk Vinaften Detaljer" 
                className="w-full h-auto block transition-transform duration-1000 group-hover:scale-[1.01]"
              />
              <div className="p-4 bg-white border-t border-gray-50 text-center">
                <span className="text-[9px] font-bold tracking-[0.3em] text-gray-300 uppercase">
                  {language === 'da' ? 'DETALJERET ARRANGEMENTS-OVERSIGT' : 'DETAILED EVENT OVERVIEW'}
                </span>
              </div>
            </div>
            
            <div className="my-12">
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#1a1a1a] mb-8 not-italic font-sans border-l-4 border-[#CDA235] pl-6">
                {t.infoTitle}
              </h3>
              <ul className="space-y-5 text-xl md:text-2xl text-[#1a1a1a]">
                <li>{t.dish1}</li>
                <li>{t.dish2}</li>
                <li>{t.dish3}</li>
                <li>{t.dish4}</li>
                <li>{t.dish5}</li>
              </ul>
            </div>

            <p>{t.p3}</p>
          </div>

          {/* Booking Banner */}
          <div className="bg-[#1a1a1a] text-white p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[6px] bg-[#CDA235]"></div>
            <p className="text-2xl md:text-4xl serif italic mb-10">
              {t.priceText}
            </p>
            
            <button 
              onClick={onBookingStart}
              className="bg-[#CDA235] text-white px-12 py-5 text-[12px] font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-xl mb-12"
            >
              {t.bookingBtn}
            </button>
            
            <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/10 mt-6 text-left">
              <div>
                <span className="text-[10px] font-bold text-[#CDA235] uppercase tracking-widest block mb-2 font-sans">{t.location}</span>
                <p className="text-sm md:text-base serif italic text-white/90">Restaurant Bag Søjlen, Hovedgaden 5, 8410 Rønde</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#CDA235] uppercase tracking-widest block mb-2 font-sans">{translations[language].confirmation.date}</span>
                <p className="text-sm md:text-base serif italic text-white/90">{t.eventHeroDate}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#CDA235] uppercase tracking-widest block mb-2 font-sans">{t.time}</span>
                <p className="text-sm md:text-base serif italic text-white/90">Kl. 18.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
