import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onBookingStart?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onBookingStart, language, onLanguageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language].nav;

  const handleScrollTo = (id: string) => {
    onNavigate('/');
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="py-4 px-6 md:px-12 bg-[#000000] sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex justify-start items-center">
          <button
            onClick={() => { onNavigate('/'); setIsMobileMenuOpen(false); }}
            onDoubleClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
            className="flex items-center justify-center transition-transform hover:scale-105"
          >
            <img
              src="https://files.catbox.moe/qef8ix.svg"
              alt="Bag Søjlen Logo"
              crossOrigin="anonymous"
              style={{ filter: 'invert(100%)' }}
              className="h-10 md:h-16 w-auto object-contain"
            />
          </button>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 text-[10px] tracking-[0.3em] font-bold uppercase text-white/90">
          <button onClick={() => handleScrollTo('menu-section')} className="hover:text-[#c5a059] transition-colors whitespace-nowrap">
            {t.menu}
          </button>
          <button onClick={() => handleScrollTo('history-section')} className="hover:text-[#c5a059] transition-colors whitespace-nowrap">
            {t.history}
          </button>
          <button onClick={() => handleScrollTo('events-section')} className="hover:text-[#c5a059] transition-colors whitespace-nowrap">
            {t.events}
          </button>
          <button className="hover:text-[#c5a059] transition-colors whitespace-nowrap">{t.contact}</button>

          {/* Language Switcher */}
          <div className="relative group ml-2">
            <button className="flex items-center gap-1.5 hover:text-[#c5a059] transition-colors">
              <Globe size={14} className="opacity-50" />
              <span className="uppercase">{language}</span>
              <ChevronDown size={10} className="opacity-30" />
            </button>
            <div className="absolute top-full left-0 mt-2 bg-black border border-white/10 shadow-2xl py-2 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button onClick={() => onLanguageChange('da')} className={`w-full text-left px-4 py-2 text-[10px] hover:bg-[#c5a059] hover:text-white transition-colors ${language === 'da' ? 'text-[#c5a059]' : 'text-white/60'}`}>Dansk</button>
              <button onClick={() => onLanguageChange('en')} className={`w-full text-left px-4 py-2 text-[10px] hover:bg-[#c5a059] hover:text-white transition-colors ${language === 'en' ? 'text-[#c5a059]' : 'text-white/60'}`}>English</button>
              <button onClick={() => onLanguageChange('de')} className={`w-full text-left px-4 py-2 text-[10px] hover:bg-[#c5a059] hover:text-white transition-colors ${language === 'de' ? 'text-[#c5a059]' : 'text-white/60'}`}>Deutsch</button>
            </div>
          </div>
        </nav>

        {/* Right: CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Language Switcher */}
          <div className="lg:hidden relative group">
            <button className="flex items-center gap-1 p-2 text-white/70 hover:text-[#c5a059] transition-colors">
              <Globe size={16} />
              <span className="text-[10px] font-bold uppercase">{language}</span>
            </button>
            <div className="absolute top-full right-0 mt-2 bg-black border border-white/10 shadow-2xl py-2 min-w-[100px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button onClick={() => onLanguageChange('da')} className={`w-full text-left px-4 py-2 text-[10px] hover:bg-[#c5a059] hover:text-white transition-colors ${language === 'da' ? 'text-[#c5a059]' : 'text-white/60'}`}>DA</button>
              <button onClick={() => onLanguageChange('en')} className={`w-full text-left px-4 py-2 text-[10px] hover:bg-[#c5a059] hover:text-white transition-colors ${language === 'en' ? 'text-[#c5a059]' : 'text-white/60'}`}>EN</button>
              <button onClick={() => onLanguageChange('de')} className={`w-full text-left px-4 py-2 text-[10px] hover:bg-[#c5a059] hover:text-white transition-colors ${language === 'de' ? 'text-[#c5a059]' : 'text-white/60'}`}>DE</button>
            </div>
          </div>

          <button
            onClick={onBookingStart}
            className="hidden sm:block bg-[#c5a059] text-white px-6 py-3 text-[9px] tracking-[0.2em] font-bold uppercase hover:bg-[#b48f4a] transition-all shadow-lg whitespace-nowrap"
          >
            {t.book}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:text-[#c5a059] transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] md:top-[97px] bg-black z-40 flex flex-col p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-8 text-sm tracking-[0.4em] font-bold uppercase text-white/90 mb-12">
            <button onClick={() => handleScrollTo('menu-section')} className="text-left py-2 border-b border-white/5">{t.menu}</button>
            <button onClick={() => handleScrollTo('history-section')} className="text-left py-2 border-b border-white/5">{t.history}</button>
            <button onClick={() => handleScrollTo('events-section')} className="text-left py-2 border-b border-white/5">{t.events}</button>
            <button className="text-left py-2 border-b border-white/5">{t.contact}</button>
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={() => { onBookingStart?.(); setIsMobileMenuOpen(false); }}
              className="w-full bg-[#c5a059] text-white py-5 text-xs tracking-[0.3em] font-bold uppercase shadow-2xl"
            >
              {t.book}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};