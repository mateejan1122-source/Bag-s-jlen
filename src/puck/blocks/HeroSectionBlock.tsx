import React from 'react';
import { DEFAULT_HERO_BUTTONS, normalizeHeroSectionProps, type HeroButtonProps } from '../heroSection';

const buttonClassName = (variant: HeroButtonProps['variant']) =>
  variant === 'secondary'
    ? 'border-[2px] md:border-[3px] border-white/60 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-black'
    : 'bg-white text-black hover:bg-[#c5a059] hover:text-white';

export const HeroSectionBlock: React.FC = (props) => {
  const hero = normalizeHeroSectionProps(props);
  const buttons = hero.buttons && hero.buttons.length > 0 ? hero.buttons : DEFAULT_HERO_BUTTONS;

  return (
    <section
      className="relative min-h-[600px] h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#0a0a0a] w-full"
      style={{
        backgroundColor: hero.backgroundColor,
        backgroundImage: hero.backgroundImage ? `url(${hero.backgroundImage})` : undefined,
        backgroundPosition: hero.backgroundImage ? 'center' : undefined,
        backgroundRepeat: hero.backgroundImage ? 'no-repeat' : undefined,
        backgroundSize: hero.backgroundImage ? 'cover' : undefined,
        paddingTop: typeof hero.paddingTop === 'number' ? `${hero.paddingTop}px` : undefined,
        paddingBottom: typeof hero.paddingBottom === 'number' ? `${hero.paddingBottom}px` : undefined,
        minHeight: typeof hero.minHeight === 'number' ? `${hero.minHeight}px` : undefined,
      }}
    >
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundColor: hero.overlayColor || 'rgba(0,0,0,0.55)' }}></div>

      <div className="relative z-20 max-w-7xl px-4">
        <div className="text-[12px] md:text-[14px] tracking-[0.6em] uppercase font-bold mb-4 md:mb-6 drop-shadow-2xl" style={{ color: hero.accentColor || '#c5a059' }}>
          {hero.eyebrow}
        </div>
        <h1 className="text-[54px] md:text-[100px] lg:text-[140px] font-normal serif mb-4 md:mb-6 tracking-tighter leading-none text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" style={{ color: hero.textColor || '#ffffff' }}>
          {hero.title}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl serif italic text-white/95 mb-8 md:mb-10 max-w-3xl mx-auto drop-shadow-xl leading-relaxed whitespace-pre-wrap font-light" style={{ color: hero.textColor || '#ffffff' }}>
          {hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
          {buttons.map((button, index) => (
            <button
              key={`${button.label}-${index}`}
              type="button"
              className={`px-8 md:px-10 py-4 md:py-5 text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] font-bold uppercase transition-all shadow-2xl w-full sm:w-auto ${buttonClassName(button.variant)}`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
