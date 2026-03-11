import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../translations';

interface EventDetailProps {
  onBookingStart?: () => void;
  language: Language;
}

export const EventDetail: React.FC<EventDetailProps> = ({ onBookingStart, language }) => {
  const { id } = useParams();
  const t = translations[language].eventDetail;
  const tNews = translations[language].news;

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      if (id) {
        const { data } = await supabase.from('events').select('*').eq('id', id).single();
        setEventData(data);
      } else {
        // Fallback to featured event, then to latest event
        const { data: settingsData } = await supabase.from('settings').select('*').eq('key', 'featured_event_id').maybeSingle();
        if (settingsData && settingsData.value) {
          const { data } = await supabase.from('events').select('*').eq('id', settingsData.value).single();
          if (data) {
            setEventData(data);
            setLoading(false);
            return;
          }
        }
        
        const { data } = await supabase.from('events').select('*').eq('is_published', true).order('start_date', { ascending: true, nullsFirst: false }).limit(1);
        if (data && data.length > 0) {
          setEventData(data[0]);
        }
      }
      setLoading(false);
    };

    fetchEventData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">Loading...</div>;

  const details = eventData?.details || {};
  const displayTitle = eventData?.title || tNews.eventTitle;
  const displayImage = eventData?.image_url || "https://i.pixi.mg/i/6ce47e10d2138e072bc6c21f.png";
  const displayDate = details.hero_date || (eventData?.start_date ? new Date(eventData.start_date).toLocaleDateString() : t.eventHeroDate);
  const displayDesc1 = details.paragraph_1 || eventData?.description || t.p1;
  const displayDesc2 = details.paragraph_2 || (!eventData ? t.p2 : '');
  const topTag = details.top_tag || tNews.eventTag;
  const infoTitle = details.info_title || (!eventData ? t.infoTitle : '');

  const bullets = details.bullet_points
    ? details.bullet_points.split('\n').filter((b: string) => b.trim() !== '')
    : (!eventData ? [t.dish1, t.dish2, t.dish3, t.dish4, t.dish5] : []);

  const displayDesc3 = details.paragraph_3 || (!eventData ? t.p3 : '');
  const priceText = details.price_text || t.priceText;
  const bookingBtn = details.booking_btn_text || t.bookingBtn;
  const locationText = details.location_text || "Restaurant Bag Søjlen\nHovedgaden 5, 8410 Rønde";
  const timeText = details.time_text || "Kl. 18.00";

  return (
    <div className="bg-[#faf9f6] min-h-screen">
      {/* Event Hero - Neutral Dark Background */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 z-10"></div>
        <div className="relative z-20 text-center px-4">
          <span className="text-[#CDA235] text-[12px] md:text-[14px] font-bold tracking-[0.6em] uppercase block mb-6 drop-shadow-lg">{topTag}</span>
          <h1 className="text-5xl md:text-8xl serif italic text-white tracking-tighter leading-none mb-4">{displayTitle}</h1>
          <p className="text-white/80 text-[12px] md:text-[14px] font-bold uppercase tracking-[0.4em]">{displayDate}</p>
        </div>
      </section>

      {/* Event Content */}
      <section className="max-w-4xl mx-auto py-20 md:py-32 px-6">
        <div className="flex flex-col gap-12 md:gap-20">
          <div className="text-left space-y-12 text-[16px] md:text-[18px] text-gray-600 font-light leading-relaxed serif italic">
            <div className="space-y-8">
              {displayDesc1 && <p className="whitespace-pre-wrap">{displayDesc1}</p>}
              {displayDesc2 && <p className="whitespace-pre-wrap">{displayDesc2}</p>}
            </div>

            {/* Event Flyer Image */}
            <div className="my-16 md:my-24 shadow-2xl border border-gray-100 overflow-hidden bg-white group">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-auto block transition-transform duration-1000 group-hover:scale-[1.01]"
              />
              <div className="p-4 bg-white border-t border-gray-50 text-center">
                <span className="text-[9px] font-bold tracking-[0.3em] text-gray-300 uppercase">
                  {language === 'da' ? 'DETALJERET ARRANGEMENTS-OVERSIGT' : 'DETAILED EVENT OVERVIEW'}
                </span>
              </div>
            </div>

            {(infoTitle || bullets.length > 0) && (
              <div className="my-12">
                {infoTitle && (
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#1a1a1a] mb-8 not-italic font-sans border-l-4 border-[#CDA235] pl-6">
                    {infoTitle}
                  </h3>
                )}
                {bullets.length > 0 && (
                  <ul className="space-y-5 text-xl md:text-2xl text-[#1a1a1a]">
                    {bullets.map((b: string, i: number) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {displayDesc3 && <p className="whitespace-pre-wrap">{displayDesc3}</p>}
          </div>

          <div className="bg-[#1a1a1a] text-white p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[6px] bg-[#CDA235]"></div>
            <p className="text-2xl md:text-4xl serif italic mb-10 whitespace-pre-wrap">
              {priceText}
            </p>

            <button
              onClick={onBookingStart}
              className="bg-[#CDA235] text-white px-12 py-5 text-[12px] font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-xl mb-12"
            >
              {bookingBtn}
            </button>

            <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/10 mt-6 text-left">
              <div>
                <span className="text-[10px] font-bold text-[#CDA235] uppercase tracking-widest block mb-2 font-sans">{t.location}</span>
                <p className="text-sm md:text-base serif italic text-white/90 whitespace-pre-wrap">{locationText}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#CDA235] uppercase tracking-widest block mb-2 font-sans">{translations[language].confirmation.date}</span>
                <p className="text-sm md:text-base serif italic text-white/90">{displayDate}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#CDA235] uppercase tracking-widest block mb-2 font-sans">{t.time}</span>
                <p className="text-sm md:text-base serif italic text-white/90">{timeText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
