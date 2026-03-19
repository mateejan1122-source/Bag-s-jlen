import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingData } from '../types';
import { Language, translations } from '../translations';
import { supabase } from '../lib/supabase';
import { getHeroSectionContentProps, getSectionVisualProps, toPx, useHomepageVisualConfig } from '../src/puck/homepageVisualConfig';

interface HomePartProps {
  onBookingStart?: () => void;
  onNavigateToEvent?: (id?: string) => void;
  language: Language;
}

export const HomePart1: React.FC<HomePartProps> = ({ onBookingStart, onNavigateToEvent, language }) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [featuredEvent, setFeaturedEvent] = useState<any | null>(null);

  const toggleMute = () => setIsMuted(!isMuted);
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const tHero = translations[language].hero;
  const tPhil = translations[language].philosophy;
  const tHist = translations[language].history;
  const homepageVisualConfig = useHomepageVisualConfig();
  const heroVisual = getSectionVisualProps(homepageVisualConfig, 'HeroSection');
  const heroContent = getHeroSectionContentProps(homepageVisualConfig);
  const philosophyVisual = getSectionVisualProps(homepageVisualConfig, 'PhilosophySection');
  const historyVisual = getSectionVisualProps(homepageVisualConfig, 'HistorySection');

  React.useEffect(() => {
    supabase.from('settings').select('*')
      .then(({ data }) => {
        if (data) {
          setSettings(data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}));
        }
      });

    const fetchEventWithSlug = async (id: string) => {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', id).single();
      if (eventData) {
        setFeaturedEvent(eventData);
        const { data: slugData } = await supabase.from('settings').select('value').eq('key', `event_seo_${id}_slug`).maybeSingle();
        if (slugData?.value) {
          eventData.slug = slugData.value;
        }
      } else {
        fetchNextUpcomingEvent();
      }
    };

    const fetchNextUpcomingEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('is_published', true).order('start_date', { ascending: true, nullsFirst: false }).limit(1);
      if (data && data.length > 0) {
        const event = data[0];
        setFeaturedEvent(event);
        const { data: slugData } = await supabase.from('settings').select('value').eq('key', `event_seo_${event.id}_slug`).maybeSingle();
        if (slugData?.value) event.slug = slugData.value;
      }
    };

    supabase.from('settings').select('*').eq('key', 'featured_event_id').maybeSingle()
      .then(({ data: settingsData }) => {
        if (settingsData && settingsData.value) {
          fetchEventWithSlug(settingsData.value);
        } else {
          fetchNextUpcomingEvent();
        }
      });
  }, []);

  React.useEffect(() => {
    if (settings.hero_video_url && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [settings.hero_video_url]);

  const getTransSetting = (baseKey: string) => {
    const langKey = language === 'da' ? baseKey : `${baseKey}_${language}`;
    return settings[langKey] || settings[baseKey];
  };

  const heroEyebrow = heroContent.eyebrow || getTransSetting('hero_welcome') || tHero.welcome;
  const heroTitle = heroContent.title || getTransSetting('hero_title') || 'Bag Sojlen';
  const heroSubtitle = heroContent.subtitle || getTransSetting('hero_subtitle') || tHero.sub;
  const heroButtons = heroContent.buttons && heroContent.buttons.length > 0
    ? heroContent.buttons
    : [
        { label: getTransSetting('hero_btn_book') || tHero.book, action: 'book', variant: 'primary' },
        { label: getTransSetting('hero_btn_menu') || tHero.seeMenu, action: 'menu', variant: 'secondary' },
      ];

  const handleHeroButtonClick = (button: { action?: string; href?: string }) => {
    if (button.action === 'book') {
      onBookingStart?.();
      return;
    }

    if (button.action === 'menu') {
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!button.href) {
      return;
    }

    if (button.href.startsWith('#')) {
      document.getElementById(button.href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (button.href.startsWith('/')) {
      navigate(button.href);
      return;
    }

    window.location.href = button.href;
  };

  return (
    <div className="flex flex-col bg-[#faf9f6] w-full">
      {/* Hero Section */}
      <section className="relative min-h-[600px] h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#0a0a0a] w-full" style={{ backgroundColor: heroVisual.backgroundColor, paddingTop: toPx(heroVisual.paddingTop), paddingBottom: toPx(heroVisual.paddingBottom), minHeight: toPx(heroVisual.minHeight) }}>
        <div className="absolute inset-0 z-0">
          {settings.hero_video_url ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            >
              <source src={settings.hero_video_url} type="video/mp4" />
            </video>
          ) : (
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-[8000ms] scale-105"
              style={{ backgroundImage: `url(${heroVisual.backgroundImage || settings.hero_bg_image || 'https://i.pixi.mg/i/bc4967f7161097374bbf013a.jpg'})` }}
            >
            </div>
          )}
          <div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundColor: heroVisual.overlayColor || 'rgba(0,0,0,0.55)' }}></div>
        </div>

        <div className="relative z-20 max-w-7xl px-4">
          <div className="text-[12px] md:text-[14px] tracking-[0.6em] text-[#c5a059] uppercase font-bold mb-4 md:mb-6 drop-shadow-2xl" style={{ color: heroVisual.accentColor }}>{heroEyebrow}</div>
          <h1 className="text-[54px] md:text-[100px] lg:text-[140px] font-normal serif mb-4 md:mb-6 tracking-tighter leading-none text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" style={{ color: heroVisual.textColor }}>{heroTitle}</h1>
          <p className="text-lg md:text-xl lg:text-2xl serif italic text-white/95 mb-8 md:mb-10 max-w-3xl mx-auto drop-shadow-xl leading-relaxed whitespace-pre-wrap font-light" style={{ color: heroVisual.textColor }}>{heroSubtitle}</p>

          <div className="mb-10 md:mb-14 text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.4em] font-bold uppercase text-white/70 flex flex-wrap justify-center items-center gap-x-8 md:gap-x-12 gap-y-3">
            <span className="whitespace-nowrap">{language === 'da' ? 'Tir - Lor' : language === 'en' ? 'Tue - Sat' : 'Die - Sam'}: 17.00 - 22.00</span>
            <span className="hidden md:block w-1.5 h-1.5 bg-[#c5a059] rounded-full"></span>
            <span className="whitespace-nowrap">{language === 'da' ? 'Frokost Lor' : language === 'en' ? 'Lunch Sat' : 'Mittag Sam'}: 12.00 - 15.00</span>
            <span className="hidden md:block w-1.5 h-1.5 bg-[#c5a059] rounded-full"></span>
            <span className="whitespace-nowrap">{translations[language].footer.closedAftale}</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            {heroButtons.map((button, index) => (
              <button
                key={`${button.label}-${index}`}
                type="button"
                onClick={() => handleHeroButtonClick(button)}
                className={button.variant === 'secondary'
                  ? 'border-[2px] md:border-[3px] border-white/60 bg-white/5 backdrop-blur-md text-white px-8 md:px-10 py-4 md:py-5 text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] font-bold uppercase hover:bg-white hover:text-black transition-all w-full sm:w-auto'
                  : 'bg-white text-black px-8 md:px-10 py-4 md:py-5 text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] font-bold uppercase hover:bg-[#c5a059] hover:text-white transition-all shadow-2xl w-full sm:w-auto'}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-30 flex items-center gap-4">
          <span className="hidden md:block text-[10px] tracking-[0.4em] text-white uppercase font-bold opacity-40">{tHero.sound} {isMuted ? (language === 'da' ? 'FRA' : 'OFF') : (language === 'da' ? 'TIL' : 'ON')}</span>

          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause Video' : 'Play Video'}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:border-[#c5a059] hover:text-[#c5a059] transition-all bg-white/10 group shadow-2xl"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:border-[#c5a059] hover:text-[#c5a059] transition-all bg-white/10 group shadow-2xl"
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
        </div>
      </section>
      {/* Philosophy Section */}
      <section className="px-6 md:px-20 py-20 md:py-32 grid lg:grid-cols-2 gap-12 md:gap-20 items-center max-w-[1440px] mx-auto w-full relative" style={{ backgroundColor: philosophyVisual.backgroundColor, paddingTop: toPx(philosophyVisual.paddingTop), paddingBottom: toPx(philosophyVisual.paddingBottom) }}>
        <div className="relative group w-full">
          <div className="absolute top-4 left-4 md:top-8 md:left-8 w-full h-full border border-[#CDA235]/30 transition-transform group-hover:translate-x-1 group-hover:translate-y-1 md:group-hover:translate-x-2 md:group-hover:translate-y-2 duration-1000"></div>
          <div className="h-[350px] md:h-[500px] lg:h-[700px] w-full relative overflow-hidden shadow-[20px_20px_40px_rgba(0,0,0,0.1)] md:shadow-[40px_40px_80px_rgba(0,0,0,0.1)] border-[6px] md:border-[10px] border-white z-10">
            <div
              className="absolute inset-0 img-cover transition-transform duration-[5000ms] group-hover:scale-105"
              style={{ backgroundImage: `url(${settings.philosophy_img || 'https://i.pixi.mg/i/50fbc99187182fd3cbfa1416.png'})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#CDA235]/10 via-transparent to-transparent opacity-60"></div>
          </div>
        </div>

        <div className="p-4 md:p-10 flex flex-col justify-center text-left w-full">
          <div className="w-10 md:w-12 h-0.5 bg-[#CDA235] mb-6 md:mb-10" style={{ backgroundColor: philosophyVisual.accentColor }}></div>
          <span className="text-[#CDA235] text-[10px] md:text-[11px] font-bold tracking-[0.5em] md:tracking-[0.6em] uppercase block mb-4 md:mb-6" style={{ color: philosophyVisual.accentColor }}>{tPhil.tag}</span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl serif mb-6 md:mb-10 leading-none text-[#1a1a1a] tracking-tighter" style={{ color: philosophyVisual.textColor }}>{tPhil.title}</h2>
          
          <div className="relative mb-8 md:mb-12">
            <span className="absolute -top-4 -left-4 md:-top-8 md:-left-8 text-[60px] md:text-[100px] serif text-[#CDA235]/10 leading-none pointer-events-none italic font-light">“</span>
            <p className="italic serif text-gray-400 text-xl md:text-2xl lg:text-3xl leading-[1.6] relative z-10" style={{ color: philosophyVisual.textColor }}>
              {tPhil.quote}
            </p>
          </div>

          <div className="space-y-4 md:space-y-8 text-[14px] md:text-[15px] text-gray-500 leading-relaxed font-light" style={{ color: philosophyVisual.textColor }}>
            <p>{tPhil.text1}</p>
            <p>{tPhil.text2}</p>
            <p className="italic text-[#1a1a1a] font-medium serif text-lg md:text-xl mt-4 md:mt-6">{tPhil.footer}</p>
          </div>

          <div className="mt-10 md:mt-16 flex items-center gap-6 group cursor-pointer">
            <div className="w-6 md:w-10 h-px bg-[#CDA235] transition-all group-hover:w-10 md:group-hover:w-16"></div>
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] text-[#CDA235] uppercase">{tPhil.discover}</span>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history-section" className="px-6 md:px-20 py-0 grid lg:grid-cols-2 gap-0 items-stretch max-w-[1440px] mx-auto w-full pb-20 md:pb-32" style={{ backgroundColor: historyVisual.backgroundColor, paddingTop: toPx(historyVisual.paddingTop), paddingBottom: toPx(historyVisual.paddingBottom) }}>
        <div className="p-8 md:p-14 lg:p-20 xl:p-24 z-20 relative bg-white border border-[#f2f1ed] shadow-[20px_20px_40px_rgba(0,0,0,0.02)] flex flex-col justify-center text-left" style={{ backgroundColor: historyVisual.surfaceColor, borderColor: historyVisual.borderColor, color: historyVisual.textColor }}>
          <span className="text-[#CDA235] text-[10px] md:text-[11px] font-bold tracking-[0.4em] md:tracking-[0.5em] uppercase block mb-4 md:mb-8" style={{ color: historyVisual.accentColor }}>
            {getTransSetting('history_tag') || tHist.tag}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl serif mb-6 md:mb-12 text-[#1a1a1a] tracking-tighter leading-none" style={{ color: historyVisual.textColor }}>
            {getTransSetting('history_title') || tHist.title}
          </h2>
          <div className="space-y-4 md:space-y-8 text-[14px] md:text-[15px] text-gray-600 leading-relaxed font-light max-w-xl" style={{ color: historyVisual.textColor }}>
            <p>{getTransSetting('history_text1') || tHist.text1}</p>
            <button
              type="button"
              onClick={() => {
                const defaultSearchLink = language === 'da' ? '/vores-historie' : language === 'de' ? '/unsere-geschichte' : '/our-history';
                const link = getTransSetting('history_link_url') || defaultSearchLink;
                if (link) navigate(link);
              }}
              className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-[#CDA235] border-b-[2px] border-[#CDA235]/20 pb-2 hover:border-[#CDA235] transition-all mt-6 md:mt-8 inline-block self-start cursor-pointer" style={{ color: historyVisual.accentColor, borderColor: historyVisual.accentColor }}
            >
              {getTransSetting('history_readMore') || tHist.readMore}
            </button>
          </div>
        </div>

        <div className="relative group overflow-hidden z-10 shadow-[20px_20px_40px_rgba(0,0,0,0.1)] min-h-[350px] md:min-h-[500px] lg:min-h-[700px]">
          <div
            className="absolute inset-0 img-cover grayscale-[0.2] brightness-75 transition-all hover:grayscale-0 hover:brightness-100 duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url(${getTransSetting('history_image_url') || 'https://i.pixi.mg/i/62fcaff217b2df779c5f1878.jpg'})` }}
          ></div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: historyVisual.overlayColor || 'linear-gradient(to left, rgba(0,0,0,0.2), transparent)' }}></div>
        </div>
      </section>

    </div>
  );
};

const MenuItem: React.FC<{ name: string; price: string | number; desc?: string; imageUrl?: string; onClick?: () => void }> = ({ name, price, desc, imageUrl, onClick }) => (
  <div onClick={onClick} className={`flex justify-between items-start border-b border-[#CDA235]/10 pb-4 md:pb-6 mb-4 md:mb-6 group ${onClick ? 'cursor-pointer' : ''}`}>
    {imageUrl && (
      <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 mr-4 md:mr-6 overflow-hidden bg-gray-50 border border-gray-100 hidden sm:block">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
    )}
    <div className="flex-1 pr-4">
      <h4 className="text-xl md:text-2xl serif text-[#1a1a1a] group-hover:text-[#CDA235] transition-colors">{name}</h4>
      {desc && <p className="text-[12px] md:text-[14px] text-gray-400 font-light mt-1 italic leading-snug">{desc}</p>}
    </div>
    <span className="text-lg md:text-xl font-bold text-[#CDA235] whitespace-nowrap">
      {typeof price === 'number' ? `${price} kr` : price}
    </span>
  </div>
);

export const HomePart2: React.FC<HomePartProps> = ({ onBookingStart, language }) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [menuCategories, setMenuCategories] = useState<{ id: string; name: string; display_order: number; is_visible: boolean }[]>([]);
  const tMenu = translations[language].menu;
  const tSeas = translations[language].seasonal;
  const homepageVisualConfig = useHomepageVisualConfig();
  const menuVisual = getSectionVisualProps(homepageVisualConfig, 'MenuSection');
  const seasonalVisual = getSectionVisualProps(homepageVisualConfig, 'SeasonalSection');

  // Default categories (fallback if admin hasn't customized them)
  const defaultCategories = [
    { id: 'STARTERS', name: tMenu.tabs?.alacarte || 'À La Carte', display_order: 0, is_visible: true, group: 'alacarte' },
    { id: 'MAINS', name: tMenu.tabs?.alacarte || 'À La Carte', display_order: 1, is_visible: true, group: 'alacarte' },
    { id: 'DESSERTS', name: tMenu.tabs?.alacarte || 'À La Carte', display_order: 2, is_visible: true, group: 'alacarte' },
    { id: 'TAKEAWAY', name: tMenu.tabs?.takeaway || 'Takeaway', display_order: 3, is_visible: true },
    { id: 'FROKOST', name: tMenu.tabs?.frokost || 'Frokost', display_order: 4, is_visible: true },
    { id: 'KIDS', name: tMenu.tabs?.kids || 'Børnemenu', display_order: 5, is_visible: true },
  ];

  React.useEffect(() => {
    supabase.from('menu_items').select('*').eq('is_visible', true).order('display_order', { ascending: true })
      .then(({ data }) => setMenuItems(data || []));

    supabase.from('settings').select('*')
      .then(({ data }) => {
        if (data) {
          const map = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
          setSettings(map);

          // Parse dynamic categories
          if (map.menu_categories) {
            try {
              const parsed = JSON.parse(map.menu_categories);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const visible = parsed.filter((c: any) => c.is_visible !== false);
                setMenuCategories(visible);
                if (visible.length > 0 && !activeTab) setActiveTab(visible[0].id);
                return;
              }
            } catch { /* fallback */ }
          }
          // No custom categories — use defaults
          setActiveTab('alacarte');
        }
      });
  }, []);

  const getItems = (catId: string) => menuItems.filter(item => item.category === catId);
  const getItemsByGroup = (catIds: string[]) => menuItems.filter(item => catIds.includes(item.category));

  return (
    <div className="flex flex-col bg-[#faf9f6] w-full">
      {selectedDish && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedDish(null)}>
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {selectedDish.image_url && (
              <div className="w-full aspect-video bg-gray-100 flex-shrink-0 relative">
                <img src={selectedDish.image_url} alt={selectedDish.name} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedDish(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors">
                  ✕
                </button>
              </div>
            )}
            <div className="p-8 md:p-12 text-center relative">
              {!selectedDish.image_url && (
                <button onClick={() => setSelectedDish(null)} className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors">
                  ✕
                </button>
              )}
              <h3 className="text-3xl md:text-4xl serif text-[#1a1a1a] mb-4">{selectedDish.name}</h3>
              <p className="text-xl md:text-2xl font-bold text-[#CDA235] mb-6">{selectedDish.price}</p>
              <div className="w-16 h-0.5 bg-[#CDA235]/30 mx-auto mb-6"></div>
              <p className="text-gray-500 italic leading-loose text-sm md:text-base">{selectedDish.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menukort Section */}
      <section id="menu-section" className="px-6 md:px-20 pb-20 md:pb-32 pt-16 md:pt-24 text-center max-w-[1440px] mx-auto w-full" style={{ backgroundColor: menuVisual.backgroundColor, paddingTop: toPx(menuVisual.paddingTop), paddingBottom: toPx(menuVisual.paddingBottom) }}>
        <h2 className="text-[60px] md:text-[100px] serif mb-8 md:mb-12 text-[#1a1a1a] tracking-tighter leading-none" style={{ color: menuVisual.textColor }}>{tMenu.title}</h2>
        <p className="text-[12px] md:text-[13px] tracking-[0.5em] md:tracking-[0.8em] text-[#CDA235] uppercase mb-16 md:mb-24 font-bold" style={{ color: menuVisual.accentColor }}>{tMenu.sub}</p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-12 mb-16 md:mb-32 border-b border-gray-100 pb-4 md:pb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
          {menuCategories.length > 0 ? (
            /* ── Dynamic categories from admin ── */
            menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] pb-4 md:pb-6 transition-all relative ${activeTab === cat.id ? 'text-[#1a1a1a]' : 'text-gray-300 hover:text-[#CDA235]'
                  }`}
              >
                {cat.name}
                {activeTab === cat.id && (
                  <div className="absolute bottom-[-2px] left-0 w-full h-[2px] md:h-[3px] bg-[#CDA235]" style={{ backgroundColor: menuVisual.accentColor }}></div>
                )}
              </button>
            ))
          ) : (
            /* ── Fallback: hardcoded tabs ── */
            [
              { id: 'alacarte', label: tMenu.tabs.alacarte },
              { id: 'takeaway', label: tMenu.tabs.takeaway },
              { id: 'frokost', label: tMenu.tabs.frokost },
              { id: 'kids', label: tMenu.tabs.kids },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] pb-4 md:pb-6 transition-all relative ${activeTab === tab.id ? 'text-[#1a1a1a]' : 'text-gray-300 hover:text-[#CDA235]'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-2px] left-0 w-full h-[2px] md:h-[3px] bg-[#CDA235]" style={{ backgroundColor: menuVisual.accentColor }}></div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto min-h-[500px] md:min-h-[600px]">
          {menuCategories.length > 0 ? (
            /* ── Dynamic content: show dishes for active category ── */
            <div className="max-w-3xl mx-auto text-left animate-in fade-in duration-500" key={activeTab}>
              {(() => {
                const items = getItems(activeTab);
                if (items.length === 0) {
                  return (
                    <div className="py-20 text-center text-gray-300 text-[12px] uppercase tracking-[0.2em] font-bold italic">
                      {language === 'da' ? 'Ingen retter i denne menu endnu' : 'No dishes in this menu yet'}
                    </div>
                  );
                }
                return items.map(item => (
                  <MenuItem key={item.id} name={item.name} price={item.price} desc={item.description} imageUrl={item.image_url} onClick={() => setSelectedDish(item)} />
                ));
              })()}
            </div>
          ) : (
            /* ── Fallback: legacy hardcoded content ── */
            <>
              {activeTab === 'alacarte' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 text-left animate-in fade-in duration-500">
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] md:tracking-[0.6em] text-[#CDA235] mb-8 md:mb-12 border-l-4 border-[#CDA235] pl-4">{tMenu.categories.starters}</h3>
                    {getItems('STARTERS').length > 0 ? getItems('STARTERS').map(item => (
                      <MenuItem key={item.id} name={item.name} price={item.price} desc={item.description} imageUrl={item.image_url} onClick={() => setSelectedDish(item)} />
                    )) : (
                      <>
                        <MenuItem name={tMenu.items.soup} price="98,-" desc={tMenu.items.soupDesc} />
                        <MenuItem name={tMenu.items.prawns} price="128,-" desc={tMenu.items.prawnsDesc} />
                        <MenuItem name={tMenu.items.carpaccio} price="138,-" desc={tMenu.items.carpaccioDesc} />
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] md:tracking-[0.6em] text-[#CDA235] mb-8 md:mb-12 border-l-4 border-[#CDA235] pl-4">{tMenu.categories.main}</h3>
                    {getItems('MAINS').length > 0 ? getItems('MAINS').map(item => (
                      <MenuItem key={item.id} name={item.name} price={item.price} desc={item.description} imageUrl={item.image_url} onClick={() => setSelectedDish(item)} />
                    )) : (
                      <>
                        <MenuItem name={tMenu.items.fish} price="238,-" desc={tMenu.items.fishDesc} />
                        <MenuItem name={tMenu.items.schnitzel} price="268,-" desc={tMenu.items.schnitzelDesc} />
                        <MenuItem name={tMenu.items.duck} price="268,-" desc={tMenu.items.duckDesc} />
                        <MenuItem name={tMenu.items.steak} price="378,-" desc={tMenu.items.steakDesc} />
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] md:tracking-[0.6em] text-[#CDA235] mb-8 md:mb-12 border-l-4 border-[#CDA235] pl-4">{tMenu.categories.dessert}</h3>
                    {getItems('DESSERTS').length > 0 ? getItems('DESSERTS').map(item => (
                      <MenuItem key={item.id} name={item.name} price={item.price} desc={item.description} imageUrl={item.image_url} onClick={() => setSelectedDish(item)} />
                    )) : (
                      <>
                        <MenuItem name={tMenu.items.tart} price="98,-" desc={tMenu.items.tartDesc} />
                        <MenuItem name={tMenu.items.cake} price="98,-" desc={tMenu.items.cakeDesc} />
                        <MenuItem name={tMenu.items.brulee} price="98,-" desc={tMenu.items.bruleeDesc} />
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'takeaway' && (
                <div className="max-w-3xl mx-auto text-left animate-in fade-in duration-500">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl md:text-3xl serif text-[#1a1a1a] mb-2">T A K E A W A Y</h3>
                    <p className="text-[#CDA235] font-bold tracking-[0.3em]">{tMenu.takeaway.phone}</p>
                  </div>
                  <div className="space-y-4">
                    {getItems('TAKEAWAY').length > 0 ? (
                      ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag', ''].map(day => {
                        const dayItems = getItems('TAKEAWAY').filter(item => (item.day || '') === day);
                        if (dayItems.length === 0) return null;
                        const dayNames: Record<string, { da: string, en: string }> = {
                          mandag: { da: 'MANDAG', en: 'MONDAY' },
                          tirsdag: { da: 'TIRSDAG', en: 'TUESDAY' },
                          onsdag: { da: 'ONSDAG', en: 'WEDNESDAY' },
                          torsdag: { da: 'TORSDAG', en: 'THURSDAY' },
                          fredag: { da: 'FREDAG', en: 'FRIDAY' },
                          lørdag: { da: 'LØRDAG', en: 'SATURDAY' },
                          søndag: { da: 'SØNDAG', en: 'SUNDAY' },
                          '': { da: 'ALTID TILGÆNGELIG', en: 'ALWAYS AVAILABLE' },
                        };
                        return (
                          <div key={day} className="mb-8">
                            {day && <span className="text-[10px] font-bold text-[#CDA235] tracking-[0.4em] mb-4 block uppercase border-b border-[#CDA235]/20 pb-2 inline-block">{language === 'da' ? dayNames[day].da : dayNames[day].en}</span>}
                            {!day && <span className="text-[10px] font-bold text-gray-400 tracking-[0.4em] mb-4 block uppercase border-b border-gray-200 pb-2 inline-block">{language === 'da' ? dayNames[day].da : dayNames[day].en}</span>}
                            {dayItems.map(item => (
                              <MenuItem key={item.id} name={item.name} price={item.price} desc={item.description} imageUrl={item.image_url} onClick={() => setSelectedDish(item)} />
                            ))}
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-[#CDA235] tracking-[0.4em] mb-2 uppercase">{language === 'da' ? 'TIRSDAG' : 'TUESDAY'}</span>
                        <MenuItem name={tMenu.takeaway.tirsdag} price={tMenu.takeaway.tirsdagPrice} desc={tMenu.takeaway.tirsdagDesc} />
                        <span className="text-[10px] font-bold text-[#CDA235] tracking-[0.4em] mb-2 uppercase">{language === 'da' ? 'ONSDAG' : 'WEDNESDAY'}</span>
                        <MenuItem name={tMenu.takeaway.onsdag} price={tMenu.takeaway.onsdagPrice} desc={tMenu.takeaway.onsdagDesc} />
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'frokost' && (
                <div className="max-w-3xl mx-auto text-left animate-in fade-in duration-500">
                  <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] md:tracking-[0.6em] text-[#CDA235] mb-8 md:mb-12 border-l-4 border-[#CDA235] pl-4">{tMenu.tabs.frokost}</h3>
                  {getItems('FROKOST').length > 0 ? getItems('FROKOST').map(item => (
                    <MenuItem key={item.id} name={item.name} price={item.price} desc={item.description} imageUrl={item.image_url} onClick={() => setSelectedDish(item)} />
                  )) : (
                    tMenu.frokostItems.map((item: any, i: number) => (
                      <MenuItem key={i} name={item.name} price={item.price} desc={item.desc} />
                    ))
                  )}
                </div>
              )}
              {activeTab === 'kids' && (
                <div className="max-w-3xl mx-auto text-left animate-in fade-in duration-500">
                  <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] md:tracking-[0.6em] text-[#CDA235] mb-8 md:mb-12 border-l-4 border-[#CDA235] pl-4">{tMenu.tabs.kids}</h3>
                  {getItems('KIDS').length > 0 ? getItems('KIDS').map(item => (
                    <MenuItem key={item.id} name={item.name} price={item.price} desc={item.description} imageUrl={item.image_url} onClick={() => setSelectedDish(item)} />
                  )) : (
                    tMenu.kidsItems.map((item: any, i: number) => (
                      <MenuItem key={i} name={item.name} price={item.price} desc={item.desc} />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Seasonal experiences */}
      <section className="px-6 md:px-20 pb-24 md:pb-40 max-w-[1440px] mx-auto w-full" style={{ backgroundColor: seasonalVisual.backgroundColor, paddingTop: toPx(seasonalVisual.paddingTop), paddingBottom: toPx(seasonalVisual.paddingBottom) }}>
        <div className="text-center mb-16 md:mb-20">
          <span className="text-[#CDA235] text-[12px] md:text-[13px] font-bold tracking-[0.5em] md:tracking-[0.6em] uppercase block mb-4 md:mb-6" style={{ color: seasonalVisual.accentColor }}>{tSeas.tag}</span>
          <h2 className="text-[40px] md:text-[70px] serif mb-4 md:mb-6 text-[#1a1a1a] tracking-tighter italic leading-none" style={{ color: seasonalVisual.textColor }}>{tSeas.title}</h2>
          <div className="w-16 md:w-20 h-0.5 bg-[#CDA235] mx-auto" style={{ backgroundColor: seasonalVisual.accentColor }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-5 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.06)] md:shadow-[0_80px_160px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden relative group items-stretch" style={{ backgroundColor: seasonalVisual.surfaceColor, borderColor: seasonalVisual.borderColor }}>
            <div className="lg:col-span-2 relative overflow-hidden min-h-[300px] md:min-h-[450px] lg:min-h-0 bg-[#1a1a1a]">
              <div
                className="absolute inset-0 img-cover transition-transform duration-[6000ms] group-hover:scale-110"
                style={{ backgroundImage: `url(${seasonalVisual.backgroundImage || settings.seasonal_img || 'https://i.pixi.mg/i/74e094099766914f4b302a3c.jpg'})` }}
              ></div>
              <div className="absolute inset-0 group-hover:bg-black/10 transition-colors duration-700" style={{ backgroundColor: seasonalVisual.overlayColor || 'rgba(0,0,0,0.3)' }}></div>
            </div>

            <div className="lg:col-span-3 p-8 md:p-14 lg:p-20 bg-[#faf9f6] flex flex-col justify-center text-left relative" style={{ backgroundColor: seasonalVisual.surfaceColor, color: seasonalVisual.textColor }}>
              <div className="mb-8 md:mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-baseline mb-3 md:mb-5 gap-2">
                  <h3 className="text-3xl md:text-5xl serif text-[#1a1a1a] tracking-tight italic">{tSeas.menuTitle}</h3>
                  <div className="text-3xl md:text-4xl font-black text-[#CDA235] serif italic">248,-</div>
                </div>
                <p className="text-[11px] md:text-[12px] tracking-[0.3em] md:tracking-[0.4em] text-gray-400 uppercase font-bold border-l-4 border-[#CDA235] pl-4 md:pl-5">{tSeas.menuSub}</p>
              </div>

              <div className="space-y-8 md:space-y-12">
                <div className="group/course">
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] md:tracking-[0.5em] text-[#CDA235] uppercase mb-1 block">{translations[language].menu.categories.starters || 'FORRETTER'}</span>
                  <h4 className="text-xl md:text-2xl serif text-[#1a1a1a] mb-1">{tSeas.starter}</h4>
                  <p className="text-[13px] md:text-[14px] text-gray-400 font-light italic leading-snug">{tSeas.starterDesc}</p>
                </div>
                <div className="group/course">
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] md:tracking-[0.5em] text-[#CDA235] uppercase mb-1 block">{translations[language].menu.categories.main || 'HOVEDRETTER'}</span>
                  <h4 className="text-xl md:text-2xl serif text-[#1a1a1a] mb-1">{tSeas.main}</h4>
                  <p className="text-[13px] md:text-[14px] text-gray-400 font-light italic leading-snug">{tSeas.mainDesc}</p>
                </div>
                <div className="group/course">
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] md:tracking-[0.5em] text-[#CDA235] uppercase mb-1 block">{translations[language].menu.categories.dessert || 'DESSERTTER'}</span>
                  <h4 className="text-xl md:text-2xl serif text-[#1a1a1a] mb-1">{tSeas.dessert}</h4>
                  <p className="text-[13px] md:text-[14px] text-gray-400 font-light italic leading-snug">{tSeas.dessertDesc}</p>
                </div>
              </div>

              <div className="mt-10 md:mt-16 pt-8 md:pt-12 border-t border-[#CDA235]/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                <button
                  onClick={onBookingStart}
                  className="bg-[#1a1a1a] text-white px-8 md:px-10 py-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-[#CDA235] transition-all shadow-xl w-full sm:w-auto"
                >
                  {tSeas.bookThis || 'RESERVER BORD TIL DENNE MENU'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const HomePart3: React.FC<HomePartProps & { onBookingConfirmed: (data: BookingData) => void }> = ({ onBookingStart, onBookingConfirmed, onNavigateToEvent, language }) => {
  const tEv = translations[language].events;
  const tNews = translations[language].news;
  const tBook = translations[language].booking;
  const tFlow = translations[language].flow;
  const tConf = translations[language].confirmation;

  const [reviews, setReviews] = useState<any[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const homepageVisualConfig = useHomepageVisualConfig();
  const eventsVisual = getSectionVisualProps(homepageVisualConfig, 'EventsSection');
  const quoteVisual = getSectionVisualProps(homepageVisualConfig, 'QuoteSection');
  const newsVisual = getSectionVisualProps(homepageVisualConfig, 'NewsSection');
  const bookingVisual = getSectionVisualProps(homepageVisualConfig, 'BookingSection');

  // ─── Availability state ───────────────────────────────────────────────
  const [totalTables, setTotalTables] = useState(100);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.from('reviews').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data || []));

    supabase.from('events').select('*').eq('is_published', true).order('start_date', { ascending: true, nullsFirst: false }).limit(3)
      .then(async ({ data }) => {
        if (data) {
          const eventsWithSlugs = await Promise.all(data.map(async (event) => {
            const { data: slugData } = await supabase.from('settings').select('value').eq('key', `event_seo_${event.id}_slug`).maybeSingle();
            return { ...event, slug: slugData?.value };
          }));
          setEvents(eventsWithSlugs);
        }
      });

    supabase.from('settings').select('*')
      .then(({ data }) => {
        if (data) {
          const map = data.reduce((acc: Record<string, string>, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
          setSettings(map);
          if (map.total_tables) {
            const v = parseInt(map.total_tables, 10);
            if (!isNaN(v)) setTotalTables(v);
          }
        }
      });
  }, []);

  // Fetch per-slot booking counts whenever the date changes
  const fetchSlotCounts = async (date: string) => {
    setSlotCounts({});
    if (!date) return;
    try {
      const { data } = await supabase
        .from('bookings')
        .select('time')
        .eq('date', date)
        .eq('status', 'confirmed');
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((b: any) => { counts[b.time] = (counts[b.time] || 0) + 1; });
        setSlotCounts(counts);
      }
    } catch (e) {
      console.error('Failed to fetch slot counts:', e);
    }
  };

  const getTransSetting = (baseKey: string) => {
    const langKey = language === 'da' ? baseKey : `${baseKey}_${language}`;
    return settings[langKey] || settings[baseKey];
  };

  // Timer to rotate active review
  React.useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews]);

  const [bookingStep, setBookingStep] = useState<'initial' | 'time' | 'details' | 'success'>('initial');
  const [bookingData, setBookingData] = useState<BookingData>({
    date: '',
    guests: 2,
    time: '',
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivedOrderId, setReceivedOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ─── Time slot arrays ────────────────────────────────────────────────
  const dinnerSlots = [
    '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30'
  ];
  const lunchSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'];

  // Determine if selected date is a Saturday
  const isSaturday = (() => {
    if (!bookingData.date) return false;
    const d = new Date(bookingData.date + 'T00:00:00');
    return d.getDay() === 6;
  })();

  const times = isSaturday ? [...lunchSlots, ...dinnerSlots] : dinnerSlots;

  // ─── Slot availability helper ────────────────────────────────────────
  const isSlotDisabled = (slot: string): { disabled: boolean; reason: string } => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const [h, m] = slot.split(':').map(Number);

    // If selected date is today
    if (bookingData.date === today) {
      // Past time — already passed
      const slotDate = new Date(now);
      slotDate.setHours(h, m, 0, 0);
      if (slotDate <= now) return { disabled: true, reason: 'past' };

      // 5-hour advance rule
      const fiveHoursFromNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      if (slotDate < fiveHoursFromNow) {
        return { disabled: true, reason: '5h' };
      }
    }

    // Capacity check
    const booked = slotCounts[slot] || 0;
    if (booked >= totalTables) {
      return { disabled: true, reason: 'full' };
    }

    return { disabled: false, reason: '' };
  };

  // ─── Date validation ─────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];

  const handleDateChange = (value: string) => {
    setDateWarning(null);
    if (!value) {
      setBookingData({ ...bookingData, date: '', time: '' });
      return;
    }
    const d = new Date(value + 'T00:00:00');
    const day = d.getDay(); // 0=Sun, 1=Mon
    if (day === 0 || day === 1) {
      setDateWarning(
        language === 'da' ? 'Vi holder lukket søndag og mandag. Vælg venligst en anden dag.' :
        language === 'de' ? 'Sonntag und Montag geschlossen. Bitte wählen Sie einen anderen Tag.' :
        'We are closed on Sundays and Mondays. Please select another day.'
      );
      setBookingData({ ...bookingData, date: '', time: '' });
      return;
    }
    setBookingData({ ...bookingData, date: value, time: '' });
  };

  const handleInitialNext = () => {
    if (bookingData.date) {
      fetchSlotCounts(bookingData.date);
      setBookingStep('time');
    }
  };

  const handleTimeNext = () => {
    if (bookingData.time) setBookingStep('details');
  };

  const handleDetailsNext = async () => {
    const isValid = bookingData.fullName.trim().length > 2 &&
      bookingData.email.includes('@') &&
      bookingData.phone.trim().length > 7 &&
      privacyAccepted;
    if (isValid) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        // ── All capacity checking, insertion, and emails happen server-side ──
        const { data: result, error: fnError } = await supabase.functions.invoke('create-booking', {
          body: {
            date: bookingData.date,
            time: bookingData.time,
            guests: bookingData.guests,
            fullName: bookingData.fullName,
            email: bookingData.email,
            phone: bookingData.phone,
            specialRequests: bookingData.specialRequests,
            language: language
          }
        });

        if (fnError) throw fnError;

        if (!result?.success) {
          // Server rejected the booking (capacity reached) — rejection email already sent server-side
          setSubmitError(result?.error || (
            language === 'da' ? 'Beklager, dette tidspunkt er nu fuldt booket. Vælg venligst et andet tidspunkt.' :
            language === 'de' ? 'Leider ist dieser Zeitraum jetzt ausgebucht. Bitte wählen Sie eine andere Zeit.' :
            'Sorry, this time slot is now fully booked. Please select a different time.'
          ));
          return;
        }

        // Success — confirmation email already sent server-side
        onBookingConfirmed(bookingData);
        setReceivedOrderId(result?.orderId || null);
        setBookingStep('success');
      } catch (err: any) {
        console.error("Booking error:", err);
        setSubmitError(err.message || "An error occurred while saving the booking. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderBookingStep = () => {
    switch (bookingStep) {
      case 'initial':
        return (
          <div className="w-full px-0 md:px-4 py-6 md:py-8 flex flex-col gap-6 md:gap-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3 md:mb-4 ml-1">{tBook.date} *</span>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-[#faf9f6] border border-gray-100 p-4 md:p-6 text-base text-[#1a1a1a] outline-none focus:border-[#CDA235] transition-all h-14 md:h-16 serif italic"
                />
                {dateWarning && (
                  <p className="text-red-500 text-[11px] mt-2 italic font-medium">{dateWarning}</p>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3 md:mb-4 ml-1">{tBook.guests} *</span>
                <div className="bg-[#faf9f6] border border-gray-100 p-4 md:p-6 flex justify-between items-center h-14 md:h-16">
                  <button onClick={() => setBookingData({ ...bookingData, guests: Math.max(1, bookingData.guests - 1) })} className="text-2xl hover:text-[#CDA235] transition-colors">-</button>
                  <span className="font-bold tracking-[0.2em] text-lg">{bookingData.guests} {language === 'da' ? 'PERSONER' : 'PEOPLE'}</span>
                  <button onClick={() => setBookingData({ ...bookingData, guests: bookingData.guests + 1 })} className="text-2xl hover:text-[#CDA235] transition-colors">+</button>
                </div>
              </div>
            </div>
            <div className="pt-2 md:pt-4">
              <button
                onClick={handleInitialNext}
                disabled={!bookingData.date}
                className={`w-full py-6 md:py-8 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] flex items-center justify-center gap-4 md:gap-6 shadow-xl transition-all transform hover:scale-[1.01] ${bookingData.date ? 'bg-[#1a1a1a] text-white hover:bg-[#CDA235]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {tBook.check} <span className="text-2xl font-light ml-2">+</span>
              </button>
            </div>
          </div>
        );
      case 'time':
        return (
          <div className="flex flex-col lg:flex-row w-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Side Visual Panel */}
            <div className="lg:w-1/3 relative hidden lg:block overflow-hidden border-r border-gray-100">
              <div
                className="absolute inset-0 img-cover grayscale brightness-[0.2]"
                style={{ backgroundImage: 'url(https://i.pixi.mg/i/be698f75af221f44fe96de5f.jpg)' }}
              ></div>
              <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white text-left">
                <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.4em] uppercase mb-4">{language === 'da' ? 'ATMOSFÆRE' : 'ATMOSPHERE'}</span>
                <h2 className="text-3xl serif leading-tight italic tracking-tighter">{language === 'da' ? 'Find dit øjeblik' : 'Find your moment'}</h2>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center py-12 md:py-20 px-6 md:px-12">
              <div className="max-w-xl w-full">
                {/* Progress Indicator */}
                <div className="flex items-center gap-4 mb-10 opacity-60">
                  <div className="h-[2px] w-10 bg-[#CDA235]"></div>
                  <div className="h-[2px] w-10 bg-[#CDA235]"></div>
                  <div className="h-[2px] w-10 bg-gray-200"></div>
                  <span className="text-[9px] font-bold tracking-[0.3em] text-gray-400 ml-2 uppercase">{tFlow.step2}</span>
                </div>

                <div className="mb-10 text-left">
                  <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.5em] uppercase block mb-4">{tBook.tag}</span>
                  <h1 className="text-4xl serif text-[#1a1a1a] mb-4 tracking-tighter leading-none">{tFlow.selectTime}</h1>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 border-l-2 border-[#CDA235]/30 pl-6 italic">
                    {tConf.date}: <span className="text-[#1a1a1a] font-black">{bookingData.date}</span> <span className="mx-2 text-gray-100">|</span> {tConf.guests}: <span className="text-[#1a1a1a] font-black">{bookingData.guests}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
                  {times.map((time) => {
                    const { disabled, reason } = isSlotDisabled(time);
                    const isSelected = time === bookingData.time;
                    const fullLabel = language === 'da' ? 'FULDT' : language === 'de' ? 'VOLL' : 'FULL';
                    return (
                      <button
                        key={time}
                        onClick={() => !disabled && setBookingData({ ...bookingData, time })}
                        disabled={disabled}
                        className={`py-6 px-4 border-2 transition-all duration-400 flex flex-col items-center gap-1 ${
                          disabled
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-40'
                            : isSelected
                              ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-xl scale-[1.02]'
                              : 'bg-white border-gray-50 text-[#1a1a1a] hover:border-[#CDA235]'
                        }`}
                      >
                        <span className="text-xl serif font-medium italic">{time}</span>
                        <span className={`text-[8px] tracking-[0.3em] uppercase font-bold ${
                          disabled
                            ? (reason === 'full' ? 'text-red-400' : 'text-gray-300')
                            : isSelected ? 'text-[#CDA235]' : 'text-gray-300'
                        }`}>
                          {disabled ? (reason === 'full' ? fullLabel : '—') : tFlow.available}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col items-center gap-6 border-t border-gray-100 pt-10">
                  <button
                    onClick={handleTimeNext}
                    disabled={!bookingData.time}
                    className={`px-12 py-6 text-[11px] font-bold uppercase tracking-[0.5em] shadow-xl transition-all w-full hover:scale-[1.01] ${bookingData.time ? 'bg-[#1a1a1a] text-white hover:bg-[#CDA235]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {tFlow.continue} →
                  </button>
                  <button
                    onClick={() => setBookingStep('initial')}
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-[#CDA235] transition-colors flex items-center gap-3 py-2"
                  >
                    <span className="text-xl">←</span> {tFlow.back}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'details':
        const isFormValid = bookingData.fullName.trim().length > 2 &&
          bookingData.email.includes('@') &&
          bookingData.phone.trim().length > 7 &&
          privacyAccepted;
        return (
          <div className="w-full bg-white py-12 md:py-20 px-6 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto">
              {/* Progress Indicator */}
              <div className="flex items-center gap-4 mb-10 justify-center opacity-60">
                <div className="h-[2px] w-10 bg-[#CDA235]"></div>
                <div className="h-[2px] w-10 bg-[#CDA235]"></div>
                <div className="h-[2px] w-10 bg-[#CDA235]"></div>
                <span className="text-[9px] font-bold tracking-[0.3em] text-[#CDA235] ml-4 uppercase">{tFlow.step3}</span>
              </div>

              <div className="text-center mb-12">
                <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.6em] uppercase block mb-4">{tFlow.confirmDetails}</span>
                <h1 className="text-4xl md:text-5xl serif text-[#1a1a1a] mb-4 tracking-tighter leading-none italic">{tFlow.guestDetails}</h1>
              </div>

              <div className="space-y-10 mb-12 text-left bg-[#faf9f6] p-8 md:p-12 border border-gray-100 relative">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">{tFlow.fullName} *</label>
                    <input
                      type="text"
                      placeholder="Christian Møller"
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                      className="border-b border-gray-200 py-3 text-lg outline-none focus:border-[#CDA235] transition-all bg-transparent serif italic placeholder:text-gray-200"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">{tFlow.email} *</label>
                    <input
                      type="email"
                      placeholder="din@email.dk"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      className="border-b border-gray-200 py-3 text-lg outline-none focus:border-[#CDA235] transition-all bg-transparent serif italic placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">{tFlow.phone} *</label>
                  <input
                    type="tel"
                    placeholder="+45 8637 3500"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="border-b border-gray-200 py-3 text-lg outline-none focus:border-[#CDA235] transition-all bg-transparent serif italic placeholder:text-gray-200"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">{tFlow.special}</label>
                  <textarea
                    rows={2}
                    placeholder="..."
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                    className="border border-gray-100 p-4 text-base outline-none focus:border-[#CDA235]/50 transition-all resize-none bg-white italic placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex gap-4 items-start">
                    <input type="checkbox" className="w-4 h-4 accent-[#CDA235] mt-0.5" id="newsletter" />
                    <label htmlFor="newsletter" className="text-[12px] text-gray-400 leading-relaxed font-light cursor-pointer">
                      {tFlow.newsletter}
                    </label>
                  </div>

                  <div className="flex gap-4 items-start">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#CDA235] mt-0.5"
                      id="privacy"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    />
                    <label htmlFor="privacy" className="text-[12px] text-gray-400 leading-relaxed font-light cursor-pointer">
                      {language === 'da' ? (
                        <>Jeg accepterer <a href="/privatlivspolitik" target="_blank" rel="noopener noreferrer" className="text-[#CDA235] underline hover:text-[#1a1a1a] transition-colors">privatlivspolitikken</a>. *</>
                      ) : language === 'de' ? (
                        <>Ich akzeptiere die <a href="/privatlivspolitik" target="_blank" rel="noopener noreferrer" className="text-[#CDA235] underline hover:text-[#1a1a1a] transition-colors">Datenschutzbestimmungen</a>. *</>
                      ) : (
                        <>I accept the <a href="/privatlivspolitik" target="_blank" rel="noopener noreferrer" className="text-[#CDA235] underline hover:text-[#1a1a1a] transition-colors">privacy policy</a>. *</>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 pt-6">
                {submitError && (
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">{submitError}</div>
                )}
                <button
                  onClick={handleDetailsNext}
                  disabled={!isFormValid || isSubmitting}
                  className={`px-16 py-6 text-[12px] font-bold uppercase tracking-[0.6em] shadow-xl transition-all w-full hover:scale-[1.01] ${isFormValid && !isSubmitting ? 'bg-[#1a1a1a] text-white hover:bg-[#CDA235]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? (language === 'da' ? 'RESERVERER...' : 'BOOKING...') : tFlow.finalize + ' →'}
                </button>
                <button
                  onClick={() => setBookingStep('time')}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-[#CDA235] transition-colors flex items-center gap-3 py-2"
                >
                  <span className="text-xl">←</span> {tFlow.backToTime}
                </button>
              </div>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="w-full bg-white py-16 md:py-24 px-6 md:px-12 animate-in zoom-in duration-500">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-12">
                <div className="w-16 h-16 border-2 border-[#CDA235]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(197,160,89,0.1)]">
                  <div className="w-10 h-10 bg-[#CDA235] rounded-full flex items-center justify-center shadow-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl serif text-[#1a1a1a] mb-3 tracking-tighter italic">{tConf.title}</h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#CDA235]">{tConf.sub}</p>
              </div>

              <div className="border border-gray-100 p-8 md:p-12 text-left mb-12 bg-[#faf9f6] relative shadow-[0_20px_40px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>

                <div className="flex justify-between items-center mb-8 border-b border-dashed border-gray-200 pb-4">
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#CDA235]">{tConf.details}</span>
                  <span className="text-[8px] font-mono text-gray-300">REF: {receivedOrderId || `#BS-${Math.floor(Math.random() * 90000 + 10000)}`}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-bold uppercase text-gray-300 tracking-[0.2em]">{tConf.date}</span>
                    <span className="text-lg serif text-[#1a1a1a] italic">{bookingData.date}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-bold uppercase text-gray-300 tracking-[0.2em]">{tConf.arrival}</span>
                    <span className="text-lg serif text-[#1a1a1a] italic">{bookingData.time}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-bold uppercase text-gray-300 tracking-[0.2em]">{tConf.guests}</span>
                    <span className="text-lg serif text-[#1a1a1a] italic">{bookingData.guests} {language === 'da' ? 'Gæster' : 'Guests'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-bold uppercase text-gray-300 tracking-[0.2em]">{tConf.reservedBy}</span>
                    <span className="text-lg serif text-[#1a1a1a] italic truncate">{bookingData.fullName}</span>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                  <p className="text-[8px] text-gray-400 font-bold tracking-[0.1em] uppercase italic">
                    {tConf.emailSent} {bookingData.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setBookingStep('initial');
                    setBookingData({ date: '', guests: 2, time: '', fullName: '', email: '', phone: '', specialRequests: '' });
                    setPrivacyAccepted(false);
                  }}
                  className="flex-1 bg-[#1a1a1a] text-white px-8 py-5 text-[9px] font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-[#CDA235] transition-all transform hover:-translate-y-1"
                >
                  {language === 'da' ? 'NY RESERVATION' : 'NEW RESERVATION'}
                </button>
                <button
                  onClick={async () => {
                    const shareText = `${language === 'da' ? 'Reservation hos Bag Søjlen' : 'Reservation at Bag Søjlen'}\n${tConf.date}: ${bookingData.date}\n${tConf.arrival}: ${bookingData.time}\n${tConf.guests}: ${bookingData.guests} ${language === 'da' ? 'Gæster' : 'Guests'}\n${tConf.reservedBy}: ${bookingData.fullName}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: 'Bag Søjlen — Reservation', text: shareText });
                      } catch (e) { /* user cancelled share */ }
                    } else {
                      try {
                        await navigator.clipboard.writeText(shareText);
                        alert(language === 'da' ? 'Reservation kopieret til udklipsholder!' : 'Reservation copied to clipboard!');
                      } catch (e) {
                        alert(shareText);
                      }
                    }
                  }}
                  className="flex-1 border border-gray-200 text-[#1a1a1a] px-8 py-5 text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all"
                >
                  {tConf.share}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col bg-[#faf9f6] w-full">
      {/* Events Section */}
      <section id="events-section" className="relative text-white py-20 md:py-32 px-6 md:px-8 text-center overflow-hidden w-full" style={{ backgroundColor: eventsVisual.backgroundColor, paddingTop: toPx(eventsVisual.paddingTop), paddingBottom: toPx(eventsVisual.paddingBottom) }}>
        <div
          className="absolute inset-0 z-0 img-cover"
          style={{ backgroundImage: `url(${eventsVisual.backgroundImage || 'https://i.pixi.mg/i/6531ebaa95d551fac6cfe78b.jpg'})` }}
        >
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundColor: eventsVisual.overlayColor || 'rgba(0,0,0,0.8)' }}></div>

        <div className="relative z-20 max-w-7xl mx-auto flex flex-col items-center px-4">
          <span className="text-[#CDA235] text-[14px] md:text-[16px] tracking-[0.4em] md:tracking-[0.6em] uppercase font-bold block mb-6 md:mb-10 drop-shadow-lg" style={{ color: eventsVisual.accentColor }}>{getTransSetting('events_tag') || tEv.tag}</span>
          <h2 className="text-[40px] md:text-[70px] lg:text-[90px] serif mb-8 md:mb-12 italic font-light tracking-tighter leading-none text-white/95" style={{ color: eventsVisual.textColor }}>{getTransSetting('events_title') || tEv.title}</h2>
          <p className="text-gray-300 text-base md:text-xl mb-12 md:mb-20 max-w-4xl mx-auto leading-relaxed font-light text-center" style={{ color: eventsVisual.textColor }}>
            {getTransSetting('events_sub') || tEv.sub}
          </p>

          <div className="relative z-20 inline-block border border-[#CDA235]/30 p-10 md:p-16 lg:p-24 bg-white/5 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] text-center w-full max-w-4xl" style={{ borderColor: eventsVisual.borderColor, backgroundColor: eventsVisual.surfaceColor }}>
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.5em] text-[#CDA235] uppercase font-bold block mb-6 md:mb-10">{getTransSetting('events_contact') || tEv.contactForOffer}</span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 mb-6 md:mb-8">
              <span className="text-3xl md:text-4xl opacity-35 text-[#CDA235]">📞</span>
              <span className="text-5xl md:text-6xl lg:text-7xl font-thin tracking-tighter text-white font-sans leading-none">{settings['events_phone'] || '8637 3500'}</span>
            </div>
            <p className="text-[11px] md:text-[13px] tracking-[0.3em] md:tracking-[0.5em] text-gray-400 font-bold uppercase mt-8 md:mt-10 mb-6 md:mb-10 max-w-xl mx-auto">{getTransSetting('events_localText') || tEv.localText}</p>
            <p className="text-[10px] md:text-[11px] tracking-[0.2em] text-gray-500 font-black uppercase max-w-xl mx-auto">{getTransSetting('events_finalText') || tEv.finalText}</p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-14 md:py-20 px-6 md:px-8 text-center bg-white border-y border-gray-50 w-full overflow-hidden" style={{ backgroundColor: quoteVisual.backgroundColor, paddingTop: toPx(quoteVisual.paddingTop), paddingBottom: toPx(quoteVisual.paddingBottom), borderColor: quoteVisual.borderColor }}>
        <div className="max-w-6xl mx-auto px-4 text-[#1a1a1a]" style={{ color: quoteVisual.textColor }}>
          <span className="text-5xl md:text-7xl serif text-[#CDA235]/10 block mb-8 md:mb-12 select-none opacity-50">“</span>

          <div className="relative min-h-[100px] md:min-h-[80px] flex items-center justify-center">
            {reviews.length > 0 ? (
              <div key={currentReviewIndex} className="animate-in fade-in slide-in-from-right-4 duration-700 absolute w-full inset-0 flex flex-col items-center justify-center">
                <h2 className="text-lg md:text-2xl lg:text-3xl serif italic font-light leading-tight mb-6 md:mb-10 px-0 lg:px-10 tracking-tight">
                  "{language === 'da' ? reviews[currentReviewIndex].content : (reviews[currentReviewIndex][`content_${language}`] || reviews[currentReviewIndex].content)}"
                </h2>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-[#CDA235]">{reviews[currentReviewIndex].author_name}</span>
                  <div className="w-10 h-px bg-gray-200"></div>
                  <span className="text-[10px] text-gray-300 block font-bold tracking-[0.2em] uppercase">{new Date(reviews[currentReviewIndex].created_at).toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center">
                <h2 className="text-lg md:text-2xl lg:text-3xl serif italic font-light leading-tight mb-6 md:mb-10 px-0 lg:px-10 tracking-tight">
                  {translations[language].philosophy.quote}
                </h2>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-[#CDA235]">ANNE JENSEN</span>
                  <div className="w-10 h-px bg-gray-200"></div>
                  <span className="text-[10px] text-gray-300 block font-bold tracking-[0.2em] uppercase">OKTOBER 2024</span>
                </div>
              </div>
            )}
          </div>

          {/* Carousel Indicators */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentReviewIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentReviewIndex ? 'bg-[#CDA235] w-6' : 'bg-gray-200 hover:bg-gray-300'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News Section */}
      <div className="w-full" style={{ backgroundColor: newsVisual.backgroundColor || "#FFFFFF" }}>
      <section className="px-6 md:px-20 py-20 md:py-32 max-w-[1440px] mx-auto w-full text-left" style={{ paddingTop: toPx(newsVisual.paddingTop), paddingBottom: toPx(newsVisual.paddingBottom) }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl serif text-[#1a1a1a] tracking-tighter" style={{ color: newsVisual.textColor }}>{tNews.title}</h2>
            <p className="text-[10px] md:text-[11px] tracking-[0.2em] text-[#CDA235] uppercase font-bold mt-2" style={{ color: newsVisual.accentColor }}>{tNews.tag}</p>
          </div>
          <button className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] border-b-2 border-[#CDA235] pb-2">{tNews.readAll}</button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
          {events.length > 0 ? events.map((event, i) => (
            <div
              key={event.id}
              onClick={() => onNavigateToEvent?.(event.slug || event.id)}
              className="group cursor-pointer w-full"
            >
              <div
                className={`aspect-[16/11] w-full mb-6 md:mb-10 shadow-inner overflow-hidden border border-gray-100 img-cover grayscale-[0.2] brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-700 border-[#CDA235]/30`}
                style={{ backgroundImage: `url(${event.image_url || 'https://i.pixi.mg/i/6ce47e10d2138e072bc6c21f.png'})` }}
              >
                <div className="absolute top-4 right-4 bg-[#CDA235] text-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]">{tNews.eventTag}</div>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-[#CDA235] tracking-[0.2em] block mb-4 uppercase">{event.start_date ? new Date(event.start_date).toLocaleDateString() : ''}</span>
              <h3 className="text-xl md:text-2xl serif mb-4 group-hover:underline underline-offset-8 transition-all leading-tight text-[#1a1a1a]">{language !== 'da' && event[`title_${language}`] ? event[`title_${language}`] : event.title}</h3>
              <p className="text-[13px] text-gray-500 font-light leading-relaxed line-clamp-3">{(() => { if (language !== 'da') { const dl = event[`details_${language}`]; if (dl?.paragraph_1) return dl.paragraph_1; if (event[`description_${language}`]) return event[`description_${language}`]; } return event.details?.paragraph_1 || event.description; })()}</p>
            </div>
          )) : (
            [
              { date: "6. MARTS 2026", title: tNews.eventTitle, desc: tNews.eventDesc, img: "https://i.pixi.mg/i/6ce47e10d2138e072bc6c21f.png", isSpecial: true },
            ].map((article, i) => (
              <div
                key={i}
                onClick={() => article.isSpecial && onNavigateToEvent?.()}
                className="group cursor-pointer w-full"
              >
                <div
                  className={`aspect-[16/11] w-full mb-6 md:mb-10 shadow-inner overflow-hidden border border-gray-100 img-cover grayscale-[0.2] brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-700 ${article.isSpecial ? 'border-[#CDA235]/30' : ''}`}
                  style={{ backgroundImage: `url(${article.img})` }}
                >
                  {article.isSpecial && (
                    <div className="absolute top-4 right-4 bg-[#CDA235] text-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]">{tNews.eventTag}</div>
                  )}
                </div>
                <span className="text-[9px] md:text-[10px] font-bold text-[#CDA235] tracking-[0.2em] block mb-4 uppercase">{article.date}</span>
                <h3 className="text-xl md:text-2xl serif mb-4 group-hover:underline underline-offset-8 transition-all leading-tight text-[#1a1a1a]">{article.title}</h3>
                <p className="text-[13px] text-gray-500 font-light leading-relaxed line-clamp-3">{article.desc}</p>
              </div>
            ))
          )}
        </div>
      </section>
      </div>

      {/* Booking Section */}
      <section id="booking-section" className="bg-[#faf9f6] py-20 md:py-32 px-6 md:px-8 flex flex-col items-center border-t border-[#f2f1ed] w-full" style={{ backgroundColor: bookingVisual.backgroundColor, paddingTop: toPx(bookingVisual.paddingTop), paddingBottom: toPx(bookingVisual.paddingBottom), borderColor: bookingVisual.borderColor }}>
        <div className="max-w-[1440px] w-full text-center px-4">
          <span className="text-[#CDA235] text-[11px] md:text-[12px] font-bold tracking-[0.5em] md:tracking-[0.8em] uppercase block mb-8 md:mb-12" style={{ color: bookingVisual.accentColor }}>{tBook.tag}</span>
          <h2 className="text-[40px] md:text-[80px] serif mb-6 md:mb-10 tracking-tighter text-[#1a1a1a] leading-none" style={{ color: bookingVisual.textColor }}>{tBook.title}</h2>
          <p className="text-lg md:text-xl text-gray-500 mb-12 md:mb-20 max-w-2xl mx-auto font-light leading-relaxed italic" style={{ color: bookingVisual.textColor }}>
            {tBook.sub}
          </p>

          <div className="bg-white p-6 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-gray-100 max-w-4xl mx-auto relative overflow-hidden w-full" style={{ backgroundColor: bookingVisual.surfaceColor, borderColor: bookingVisual.borderColor }}>
            <div className="absolute top-0 left-0 w-full h-[4px] md:h-[6px] bg-[#CDA235]" style={{ backgroundColor: bookingVisual.accentColor }}></div>

            {renderBookingStep()}
          </div>

          <p className="text-[11px] md:text-[12px] text-gray-400 mt-10 md:mt-16 uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold italic px-4">
            {tBook.groups}
          </p>
        </div>
      </section>
    </div>
  );
};

