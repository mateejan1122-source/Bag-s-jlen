import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../translations';
import { Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const navigate = useNavigate();
  const brandGold = '#CDA235';
  const t = translations[language].footer;

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
      .select('id, title, slug')
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
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <footer id="contact-section" className="bg-[#000000] text-white pt-16 md:pt-24 pb-12 md:pb-16 px-6 md:px-20">
      <div className="flex flex-col items-center mb-16 md:mb-24 text-center">
        <h3 className={`text-3xl md:text-5xl serif italic mb-6 font-light text-[#CDA235]`}>{t.newsletter}</h3>
        <p className="text-gray-400 text-[12px] md:text-[13px] mb-8 md:mb-12 tracking-wide font-light max-w-lg leading-relaxed">{t.newsletterSub}</p>
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
            style={{ backgroundColor: brandGold }}
            className="text-white px-12 py-4 md:py-5 text-[11px] font-bold uppercase tracking-widest sm:ml-4 hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
          >
            {status === 'loading' ? '...' : status === 'success' ? '✓' : t.subscribe}
          </button>
        </form>
        {status === 'success' && <p className="text-[#CDA235] mt-4 text-[11px] uppercase tracking-widest font-bold">Tak for din tilmelding! / Thank you!</p>}
        {status === 'error' && <p className="text-red-400 mt-4 text-[11px] uppercase tracking-widest font-bold">Der opstod en fejl. / An error occurred.</p>}
      </div>

      <div className="w-full h-px bg-white/5 mb-16 md:mb-24"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 mb-20 md:mb-32">
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
              className={`${!settings.footer_logo_size ? 'h-12 md:h-14' : ''} w-auto object-contain transition-all duration-300`}
            />
          </div>
          <p className="text-gray-500 text-[14px] leading-relaxed max-w-[320px] font-light">
            {language === 'da' ? (settings.footer_desc || t.philosophy) : (settings[`footer_desc_${language}`] || settings.footer_desc || t.philosophy)}
          </p>
        </div>

        <div className="text-center md:text-left">
          <h3 style={{ color: brandGold }} className="text-[12px] tracking-[0.3em] font-bold uppercase mb-8 md:mb-10">{t.contactUs}</h3>
          <ul className="space-y-6 text-[14px] font-light inline-block text-left">
            <li className="flex items-start gap-5 text-gray-400">
              <span className="text-xl" style={{ color: brandGold }}>📍</span>
              <span className="leading-relaxed whitespace-pre-wrap">{settings.contact_address || "Hovedgaden 5\n8410 Rønde"}</span>
            </li>
            <li className="flex items-center gap-5 text-gray-400">
              <span className="text-xl" style={{ color: brandGold }}>📞</span>
              <span>{settings.contact_phone || "8637 3500"}</span>
            </li>
            {settings.contact_email && (
              <li className="flex items-center gap-5 text-gray-400">
                <span className="text-xl" style={{ color: brandGold }}>✉️</span>
                <span>{settings.contact_email}</span>
              </li>
            )}
          </ul>

          <div className="mt-8 flex items-center justify-center md:justify-start gap-6">
            {settings.contact_instagram && (
              <a href={settings.contact_instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#CDA235] transition-colors">
                <Instagram size={20} />
              </a>
            )}
            {settings.contact_facebook && (
              <a href={settings.contact_facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#CDA235] transition-colors">
                <Facebook size={20} />
              </a>
            )}
          </div>
        </div>

        <div className="text-center md:text-left">
          <h3 style={{ color: brandGold }} className="text-[12px] tracking-[0.3em] font-bold uppercase mb-8 md:mb-10">{t.hours}</h3>
          <ul className="space-y-6 text-[14px] font-light max-w-xs mx-auto md:mx-0">
            {[
              { key: 'monday', da: 'Mandag', en: 'Monday', de: 'Montag' },
              { key: 'tuesday', da: 'Tirsdag', en: 'Tuesday', de: 'Dienstag' },
              { key: 'wednesday', da: 'Onsdag', en: 'Wednesday', de: 'Mittwoch' },
              { key: 'thursday', da: 'Torsdag', en: 'Thursday', de: 'Donnerstag' },
              { key: 'friday', da: 'Fredag', en: 'Friday', de: 'Freitag' },
              { key: 'saturday', da: 'Lørdag', en: 'Saturday', de: 'Samstag' },
              { key: 'sunday', da: 'Søndag', en: 'Sunday', de: 'Sonntag' },
            ].map(({ key, da, en, de }) => {
              const val = settings[`hours_${key}`];
              if (!val) return null;
              const label = language === 'da' ? da : language === 'en' ? en : de;
              return (
                <li key={key} className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-2">
                  <span className="tracking-wide uppercase text-[10px] font-bold">{label}</span>
                  <span className="text-white font-medium ml-4 text-right">{val}</span>
                </li>
              );
            })}

            {settings.hours_notes && (
              <li className="flex flex-col text-[#CDA235] pt-2 mt-4 text-center md:text-left">
                <span className="text-[11px] uppercase tracking-widest">{t.closedAftale || 'BEMÆRK'}</span>
                <span className="text-sm italic mt-2">{settings.hours_notes}</span>
              </li>
            )}

            {!settings.hours_tuesday && !settings.hours_notes && (
              <li className="text-gray-500 italic text-sm">Åbningstider opdateres snarest.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest pt-12 border-t border-white/5 gap-8 text-center md:text-left">
        <p>
          {settings.general_copyright ? settings.general_copyright : `© 2024 BAG SØJLEN. ${language === 'da' ? 'DANSK & FRANSK KØKKEN' : language === 'en' ? 'DANISH & FRENCH KITCHEN' : 'DÄNISCHE & FRANZÖSISCHE KÜCHE'}.`}
        </p>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <button
            onClick={() => navigate('/manage')}
            className="px-8 py-3 border border-[#CDA235]/30 text-[#CDA235] hover:bg-[#CDA235] hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] font-bold"
          >
            {t.manage}
          </button>
          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-10">
            {footerPages.map(page => (
              <button key={page.id} onClick={() => navigate(`/${page.slug}`)} className="hover:text-[#CDA235] transition-colors whitespace-nowrap uppercase">
                {page.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
