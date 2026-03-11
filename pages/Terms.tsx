import React from 'react';
import { Language, translations } from '../translations';

interface TermsProps {
  language: Language;
}

const Terms: React.FC<TermsProps> = ({ language }) => {
  const content = {
    da: {
      title: "Handelsbetingelser",
      s1: "1. Reservation",
      p1: "En reservation er først bindende, når du har modtaget en bekræftelse via e-mail eller SMS.",
      s2: "2. Aflysning",
      p2: "Aflysning af bordreservation skal ske senest 2 timer før ankomst via vores online system eller telefonisk.",
      s3: "3. Selskaber",
      p3: "For selskaber over 8 personer gælder særlige betingelser, som aftales individuelt.",
      s4: "4. Ansvar",
      p4: "Restaurant Bag Søjlen tager forbehold for trykfejl, prisændringer og udsolgte retter."
    },
    en: {
      title: "Terms of Service",
      s1: "1. Reservation",
      p1: "A reservation is only binding once you have received a confirmation via email or SMS.",
      s2: "2. Cancellation",
      p2: "Cancellation of table reservations must be made at least 2 hours before arrival via our online system or by phone.",
      s3: "3. Groups",
      p3: "For groups of more than 8 people, special conditions apply, which are agreed upon individually.",
      s4: "4. Liability",
      p4: "Restaurant Bag Søjlen reserves the right for printing errors, price changes, and sold-out dishes."
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      s1: "1. Reservierung",
      p1: "Eine Reservierung ist erst verbindlich, wenn Sie eine Bestätigung per E-Mail oder SMS erhalten haben.",
      s2: "2. Stornierung",
      p2: "Die Stornierung von Tischreservierungen muss mindestens 2 Stunden vor der Ankunft über unser Online-System oder telefonisch erfolgen.",
      s3: "3. Gruppen",
      p3: "Für Gruppen von mehr als 8 Personen gelten besondere Bedingungen, die individuell vereinbart werden.",
      s4: "4. Haftung",
      p4: "Restaurant Bag Søjlen behält sich das Recht auf Druckfehler, Preisänderungen und ausverkaufte Gerichte vor."
    }
  };

  const t = content[language] || content.da;

  return (
    <div className="bg-[#faf9f6] py-24 px-6 md:px-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl serif italic mb-12 text-[#1a1a1a]">{t.title}</h1>
        <div className="space-y-8 text-gray-600 leading-relaxed font-light">
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#CDA235] mb-4">{t.s1}</h2>
            <p>{t.p1}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#CDA235] mb-4">{t.s2}</h2>
            <p>{t.p2}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#CDA235] mb-4">{t.s3}</h2>
            <p>{t.p3}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#CDA235] mb-4">{t.s4}</h2>
            <p>{t.p4}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
