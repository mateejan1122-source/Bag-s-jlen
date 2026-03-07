import React from 'react';
import { Language, translations } from '../translations';

interface FooterProps {
  language: Language;
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const brandGold = '#CDA235';
  const t = translations[language].footer;

  return (
    <footer className="bg-[#000000] text-white pt-16 md:pt-24 pb-12 md:pb-16 px-6 md:px-20">
      <div className="flex flex-col items-center mb-16 md:mb-24 text-center">
        <h3 className={`text-3xl md:text-5xl serif italic mb-6 font-light text-[#CDA235]`}>{t.newsletter}</h3>
        <p className="text-gray-400 text-[12px] md:text-[13px] mb-8 md:mb-12 tracking-wide font-light max-w-lg leading-relaxed">{t.newsletterSub}</p>
        <div className="flex flex-col sm:flex-row w-full max-w-xl gap-4 sm:gap-0">
          <input 
            type="email" 
            placeholder={t.emailPlaceholder} 
            className="bg-transparent flex-1 px-8 py-4 md:py-5 text-sm border border-white/10 text-gray-200 focus:outline-none focus:border-[#CDA235] transition-colors"
          />
          <button style={{ backgroundColor: brandGold }} className="text-white px-12 py-4 md:py-5 text-[11px] font-bold uppercase tracking-widest sm:ml-4 hover:opacity-90 transition-all shadow-xl">{t.subscribe}</button>
        </div>
      </div>

      <div className="w-full h-px bg-white/5 mb-16 md:mb-24"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 mb-20 md:mb-32">
        <div className="flex flex-col gap-8 text-center md:text-left items-center md:items-start">
          <div className="flex justify-start">
            <img 
              src="https://files.catbox.moe/qef8ix.svg" 
              alt="Bag Søjlen Logo" 
              crossOrigin="anonymous"
              style={{ filter: 'invert(100%)' }}
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>
          <p className="text-gray-500 text-[14px] leading-relaxed max-w-[320px] font-light">
            {t.philosophy}
          </p>
        </div>

        <div className="text-center md:text-left">
          <h3 style={{ color: brandGold }} className="text-[12px] tracking-[0.3em] font-bold uppercase mb-8 md:mb-10">{t.contactUs}</h3>
          <ul className="space-y-6 text-[14px] font-light inline-block text-left">
            <li className="flex items-start gap-5 text-gray-400">
              <span className="text-xl" style={{ color: brandGold }}>📍</span>
              <span className="leading-relaxed">Hovedgaden 5<br />8410 Rønde</span>
            </li>
            <li className="flex items-center gap-5 text-gray-400">
              <span className="text-xl" style={{ color: brandGold }}>📞</span>
              <span>8637 3500</span>
            </li>
          </ul>
        </div>

        <div className="text-center md:text-left">
          <h3 style={{ color: brandGold }} className="text-[12px] tracking-[0.3em] font-bold uppercase mb-8 md:mb-10">{t.hours}</h3>
          <ul className="space-y-6 text-[14px] font-light max-w-xs mx-auto md:mx-0">
            <li className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-2">
              <span className="tracking-wide">{language === 'da' ? 'Tirsdag - Lørdag' : language === 'en' ? 'Tuesday - Saturday' : 'Dienstag - Samstag'}:</span>
              <span className="text-white font-medium">17.00 - 22.00</span>
            </li>
            <li className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-2">
              <span className="tracking-wide">{language === 'da' ? 'Frokost Lørdag' : language === 'en' ? 'Lunch Saturday' : 'Mittagessen Samstag'}:</span>
              <span className="text-white font-medium">12.00 - 15.00</span>
            </li>
            <li className="flex flex-col text-gray-400">
              <div className="flex justify-between items-center">
                <span className="tracking-wide">{language === 'da' ? 'Søndag & Mandag' : language === 'en' ? 'Sunday & Monday' : 'Sonntag & Montag'}:</span>
                <span style={{ color: brandGold }} className="italic font-medium text-right ml-4">{t.closedAftale}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest pt-12 border-t border-white/5 gap-8 text-center md:text-left">
        <p>© 2024 BAG SØJLEN. {language === 'da' ? 'DANSK & FRANSK KØKKEN' : language === 'en' ? 'DANISH & FRENCH KITCHEN' : 'DÄNISCHE & FRANZÖSISCHE KÜCHE'}.</p>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <button 
            onClick={() => onNavigate?.('manage')}
            style={{ borderColor: `${brandGold}44`, color: brandGold }}
            className="px-8 py-3 border hover:bg-[#CDA235] hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] font-bold"
          >
            {t.manage}
          </button>
          <div className="flex gap-10">
            <button onClick={() => onNavigate?.('privacy')} className="hover:text-[#CDA235] transition-colors">{t.privacy}</button>
            <button onClick={() => onNavigate?.('terms')} className="hover:text-[#CDA235] transition-colors">{language === 'da' ? 'HANDELSBETINGELSER' : 'TERMS'}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
