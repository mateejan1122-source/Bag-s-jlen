import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../translations';

interface EventDetailProps {
  onBookingStart?: () => void;
  language: Language;
}

export const EventDetail: React.FC<EventDetailProps> = ({ onBookingStart, language }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = translations[language].eventDetail;
  const tNews = translations[language].news;

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);

      if (id) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (isUUID) {
          // Direct ID lookup — check if a slug exists and redirect if it does
          const { data: slugData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', `event_seo_${id}_slug`)
            .maybeSingle();

          if (slugData && slugData.value) {
            navigate(`/event/${slugData.value}`, { replace: true });
            return;
          }

          const { data } = await supabase.from('events').select('*').eq('id', id).single();
          setEventData(data);
        } else {
          // Slug lookup — find matching event_seo_<id>_slug in settings
          const { data: slugRows } = await supabase
            .from('settings')
            .select('key, value')
            .eq('value', id)
            .like('key', 'event_seo_%_slug');

          if (slugRows && slugRows.length > 0) {
            const key = slugRows[0].key;
            const match = key.match(/^event_seo_(.+)_slug$/);
            if (match) {
              const eventId = match[1];
              const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
              setEventData(data);
            } else {
              setEventData(null);
            }
          } else {
            setEventData(null);
          }
        }
        setLoading(false);
        return;
      }

      // No :id param — fallback to featured event
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
      if (data && data.length > 0) setEventData(data[0]);
      setLoading(false);
    };

    fetchEventData();
  }, [id, navigate]);

  // SEO meta tag injection — reads from settings table (where meta_title/slug/etc are stored)
  useEffect(() => {
    if (!eventData) return;

    const applyMeta = async () => {
      let metaTitle = eventData.title || 'Event';
      let metaDesc = eventData.description || '';
      let ogImg = eventData.image_url || '';

      // Load SEO settings from settings table
      try {
        const { data: seoData } = await supabase
          .from('settings')
          .select('key, value')
          .like('key', `event_seo_${eventData.id}_%`);
        if (seoData) {
          seoData.forEach((row: any) => {
            const field = row.key.replace(`event_seo_${eventData.id}_`, '');
            if (field === 'meta_title' && row.value) metaTitle = row.value;
            if (field === 'meta_description' && row.value) metaDesc = row.value;
            if (field === 'og_image_url' && row.value) ogImg = row.value;
          });
        }
      } catch { /* ignore */ }

      document.title = `${metaTitle} | Bag Søjlen`;

      // Meta description
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) { descTag = document.createElement('meta'); descTag.setAttribute('name', 'description'); document.head.appendChild(descTag); }
      descTag.setAttribute('content', metaDesc.slice(0, 160));

      // OG Image
      if (ogImg) {
        let ogTag = document.querySelector('meta[property="og:image"]');
        if (!ogTag) { ogTag = document.createElement('meta'); ogTag.setAttribute('property', 'og:image'); document.head.appendChild(ogTag); }
        ogTag.setAttribute('content', ogImg);
      }

      // OG Title
      let ogTitleTag = document.querySelector('meta[property="og:title"]');
      if (!ogTitleTag) { ogTitleTag = document.createElement('meta'); ogTitleTag.setAttribute('property', 'og:title'); document.head.appendChild(ogTitleTag); }
      ogTitleTag.setAttribute('content', `${metaTitle} | Bag Søjlen`);
    };

    applyMeta();
    return () => { document.title = 'Bag Søjlen'; };
  }, [eventData]);

  if (loading) return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">Loading...</div>;

  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl serif italic text-[#1a1a1a] mb-6">Arrangementet blev ikke fundet</h1>
        <p className="text-gray-500 mb-10 max-w-md">Det ser ud til, at arrangementet er blevet fjernet eller URL'en er forkert.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#1a1a1a] text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#CDA235] transition-all"
        >
          TILBAGE TIL FORSIDEN
        </button>
      </div>
    );
  }

  const getTranslatedText = (baseObj: any, key: string, language: Language, fallbackTag: string) => {
    if (!baseObj) return fallbackTag;
    if (language === 'en' && baseObj[`${key}_en`]) return baseObj[`${key}_en`];
    if (language === 'de' && baseObj[`${key}_de`]) return baseObj[`${key}_de`];
    return baseObj[key] || fallbackTag;
  };

  const details = eventData?.details || {};
  const detailsEn = eventData?.details_en || {};
  const detailsDe = eventData?.details_de || {};

  const getTranslatedDetail = (key: string, language: Language, fallbackData: string) => {
    if (!eventData) return fallbackData;
    if (language === 'en' && detailsEn[key]) return detailsEn[key];
    if (language === 'de' && detailsDe[key]) return detailsDe[key];
    return details[key] || fallbackData;
  };

  const displayTitle = getTranslatedText(eventData, 'title', language, tNews.eventTitle);
  const displayImage = eventData?.image_url || "https://i.pixi.mg/i/6ce47e10d2138e072bc6c21f.png";
  const displayDate = getTranslatedDetail('hero_date', language, eventData?.start_date ? new Date(eventData.start_date).toLocaleDateString() : t.eventHeroDate);
  const displayDesc1 = getTranslatedDetail('paragraph_1', language, getTranslatedText(eventData, 'description', language, t.p1));
  const displayDesc2 = getTranslatedDetail('paragraph_2', language, !eventData ? t.p2 : '');
  const topTag = getTranslatedDetail('top_tag', language, tNews.eventTag);
  const infoTitle = getTranslatedDetail('info_title', language, !eventData ? t.infoTitle : '');

  const bulletPointsText = getTranslatedDetail('bullet_points', language, '');
  const bullets = bulletPointsText
    ? bulletPointsText.split('\n').filter((b: string) => b.trim() !== '')
    : (!eventData ? [t.dish1, t.dish2, t.dish3, t.dish4, t.dish5] : []);

  const displayDesc3 = getTranslatedDetail('paragraph_3', language, !eventData ? t.p3 : '');
  const priceText = getTranslatedDetail('price_text', language, t.priceText);
  const bookingBtn = getTranslatedDetail('booking_btn_text', language, t.bookingBtn);
  const locationText = getTranslatedDetail('location_text', language, "Restaurant Bag Søjlen\nHovedgaden 5, 8410 Rønde");
  const timeText = getTranslatedDetail('time_text', language, "Kl. 18.00");

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
