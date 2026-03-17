import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../translations';


// ─── Dynamic Opening Hours Component ─────────────────────────────────────────
// Reads values from admin settings; falls back to defaults when not set.

const DAY_LABELS: Record<Language, { tueSat: string; lunchSat: string; sunMon: string }> = {
  da: { tueSat: 'Tirsdag – Lørdag:', lunchSat: 'Frokost Lørdag:', sunMon: 'Søndag & Mandag:' },
  en: { tueSat: 'Tuesday – Saturday:', lunchSat: 'Lunch Saturday:', sunMon: 'Sunday & Monday:' },
  de: { tueSat: 'Dienstag – Samstag:', lunchSat: 'Mittagessen Samstag:', sunMon: 'Sonntag & Montag:' },
};

const DEFAULT_CLOSED: Record<Language, string> = {
  da: 'Lukket. Vi åbner efter aftale.',
  en: 'Closed. We open by appointment.',
  de: 'Geschlossen. Wir öffnen nach Vereinbarung.',
};

const DynamicHours: React.FC<{ language: Language; settings: Record<string, string> }> = ({ language, settings }) => {
  const labels = DAY_LABELS[language] || DAY_LABELS.da;

  // Helper: return setting value only if it's a non-empty, non-whitespace string
  const val = (key: string) => (settings[key] ?? '').trim() || '';

  const tueSatHours = val('hours_tuesday_saturday') || '17.00 – 22.00';
  const lunchSatHours = val('hours_lunch_saturday') || '12.00 – 15.00';
  const sunMonHours = val('hours_sunday_monday') || DEFAULT_CLOSED[language] || DEFAULT_CLOSED.da;

  // Treat the Sunday & Monday row as "closed" when the admin hasn't changed it
  // or when the value matches a known closed phrase.
  const closedPhrases = Object.values(DEFAULT_CLOSED);
  const isClosed = closedPhrases.some(p => sunMonHours.toLowerCase() === p.toLowerCase())
    || sunMonHours.toLowerCase().startsWith('lukket')
    || sunMonHours.toLowerCase().startsWith('closed')
    || sunMonHours.toLowerCase().startsWith('geschlossen');

  const rows = [
    { label: labels.tueSat, hours: tueSatHours, closed: false },
    { label: labels.lunchSat, hours: lunchSatHours, closed: false },
    { label: labels.sunMon, hours: sunMonHours, closed: isClosed },
  ];

  return (
    <ul className="space-y-6 text-[14px] font-light max-w-xs mx-auto md:mx-0">
      {rows.map(({ label, hours, closed }, idx) => (
        <li key={idx} className="flex justify-between items-start text-gray-400 border-b border-white/5 pb-2">
          <span className="tracking-wide">{label}</span>
          <span className={`text-right ml-4 ${closed ? 'italic font-medium' : 'text-white font-medium'}`}
            style={closed ? { color: 'rgb(205, 162, 53)' } : {}}>
            {hours}
          </span>
        </li>
      ))}
    </ul>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const navigate = useNavigate();
  const t = translations[language]?.footer || {
    newsletter: 'Subscribe to our newsletter',
    newsletterSub: 'Stay updated with the latest news and exclusive offers.',
    emailPlaceholder: 'Your email address',
    subscribe: 'SUBSCRIBE',
    contactUs: 'CONTACT & FIND US',
    hours: 'OPENING HOURS',
    manage: 'MANAGE RESERVATION'
  };

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [footerPages, setFooterPages] = useState<any[]>([]);

  React.useEffect(() => {
    supabase.from('settings').select('*')
      .then(({ data }) => {
        if (data) {
          setSettings(data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}));
        }
      });

    supabase.from('pages')
      .select('id, title, title_en, title_de, slug')
      .eq('is_published', true)
      .eq('show_in_footer', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setFooterPages(data);
      });
  }, []);

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert([{ email, language }]);
      if (error && error.code !== '23505') throw error;
      setStatus('success');
      setEmail('');
      supabase.functions.invoke('send-booking-email', {
        body: { type: 'newsletter_welcome', email, language, name: '' }
      }).catch(err => console.error('Welcome email error:', err));
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <footer id="contact-section" className="bg-[#000000] text-white pt-16 md:pt-24 pb-12 md:pb-16 px-6 md:px-20">

      {/* Newsletter Strip */}
      <div className="flex flex-col items-center mb-16 md:mb-24 text-center">
        <h3 className="text-3xl md:text-5xl serif italic mb-6 font-light text-[#CDA235]">
          {t.newsletter}
        </h3>
        <p className="text-gray-400 text-[12px] md:text-[13px] mb-8 md:mb-12 tracking-wide font-light max-w-lg leading-relaxed">
          {t.newsletterSub}
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-xl gap-4 sm:gap-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder={t.emailPlaceholder}
            className="bg-transparent flex-1 px-8 py-4 md:py-5 text-sm border border-white/10 text-gray-200 focus:outline-none focus:border-[#CDA235] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="text-white px-12 py-4 md:py-5 text-[11px] font-bold uppercase tracking-widest sm:ml-4 hover:opacity-90 transition-all shadow-xl disabled:opacity-50 whitespace-nowrap"
            style={{ backgroundColor: 'rgb(205, 162, 53)' }}
          >
            {status === 'loading' ? '...' : status === 'success' ? '✓' : t.subscribe}
          </button>
        </form>
        {status === 'success' && <p className="text-[#CDA235] mt-6 text-[11px] uppercase tracking-widest">Tak! / Thank you!</p>}
        {status === 'error' && <p className="text-red-400 mt-6 text-[11px] uppercase tracking-widest">Der opstod en fejl. / An error occurred.</p>}
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-white/5 mb-16 md:mb-24" />

      {/* Main Footer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 mb-20 md:mb-32">

        {/* Column 1 — Brand */}
        <div className="flex flex-col gap-8 text-center md:text-left items-center md:items-start">
          <div className="flex justify-start">
            <img
              src={settings.footer_logo || "https://files.catbox.moe/qef8ix.svg"}
              alt="Bag Søjlen Logo"
              crossOrigin="anonymous"
              style={{
                filter: settings.footer_logo ? 'none' : 'invert(100%)',
                height: settings.footer_logo_size ? `${settings.footer_logo_size}px` : undefined
              }}
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>
          <p className="text-gray-500 text-[14px] leading-relaxed max-w-[320px] font-light">
            {language === 'da'
              ? (settings.footer_desc || t.philosophy)
              : (settings[`footer_desc_${language}`] || settings.footer_desc || t.philosophy)}
          </p>
        </div>

        {/* Column 2 — Contact */}
        <div className="text-center md:text-left">
          <h3 className="text-[12px] tracking-[0.3em] font-bold uppercase mb-8 md:mb-10" style={{ color: 'rgb(205, 162, 53)' }}>
            {language === 'da' ? 'KONTAKT & FIND OS' : language === 'de' ? 'KONTAKT & FINDEN SIE UNS' : 'CONTACT & FIND US'}
          </h3>
          <ul className="space-y-6 text-[14px] font-light inline-block text-left">
            <li className="flex items-start gap-5 text-gray-400">
              <span className="text-xl" style={{ color: 'rgb(205, 162, 53)' }}>📍</span>
              <span className="leading-relaxed whitespace-pre-wrap">{settings.contact_address || "Hovedgaden 5\n8410 Rønde"}</span>
            </li>
            <li className="flex items-center gap-5 text-gray-400">
              <span className="text-xl" style={{ color: 'rgb(205, 162, 53)' }}>📞</span>
              <span>{settings.contact_phone || "8637 3500"}</span>
            </li>
            {settings.contact_email && (
              <li className="flex items-center gap-5 text-gray-400">
                <span className="text-xl" style={{ color: 'rgb(205, 162, 53)' }}>✉️</span>
                <a href={`mailto:${settings.contact_email}`} className="hover:text-[#CDA235] transition-colors">{settings.contact_email}</a>
              </li>
            )}
          </ul>
        </div>

        {/* Column 3 — Opening Hours */}
        <div className="text-center md:text-left">
          <h3 className="text-[12px] tracking-[0.3em] font-bold uppercase mb-8 md:mb-10" style={{ color: 'rgb(205, 162, 53)' }}>
            {language === 'da' ? 'ÅBNINGSTIDER' : language === 'de' ? 'ÖFFNUNGSZEITEN' : 'OPENING HOURS'}
          </h3>
          <DynamicHours language={language} settings={settings} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest pt-12 border-t border-white/5 gap-8 text-center md:text-left">
        {/* Copyright */}
        <p>
          {settings.general_copyright
            ? settings.general_copyright
            : `© ${new Date().getFullYear()} BAG SØJLEN. ${language === 'da' ? 'DANSK & FRANSK KØKKEN' : language === 'en' ? 'DANISH & FRENCH KITCHEN' : 'DÄNISCHE & FRANZÖSISCHE KÜCHE'}.`}
        </p>

        {/* Right side: Manage + Policy Links */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <button
            onClick={() => navigate('/manage')}
            className="px-8 py-3 border border-[#CDA235]/30 text-[#CDA235] hover:bg-[#CDA235] hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] font-bold"
          >
            {t.manage}
          </button>
          <div className="flex gap-10">
            {footerPages.map(page => {
              const pageTitle =
                language === 'en' ? (page.title_en || page.title) :
                language === 'de' ? (page.title_de || page.title) :
                page.title;
              return (
                <button key={page.id} onClick={() => navigate(`/${page.slug}`)}
                  className="hover:text-[#CDA235] transition-colors whitespace-nowrap">
                  {pageTitle}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};
