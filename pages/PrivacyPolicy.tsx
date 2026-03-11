import React from 'react';
import { Language, translations } from '../translations';

interface PrivacyPolicyProps {
  language: Language;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ language }) => {
  const content = {
    da: {
      title: "Privatlivspolitik",
      s1: "1. Dataansvarlig",
      p1: "Restaurant Bag Søjlen er dataansvarlig for behandlingen af de personoplysninger, som vi har modtaget om dig.",
      s2: "2. Formål med behandlingen",
      p2: "Vi behandler dine personoplysninger til følgende formål:",
      l1: "Håndtering af din bordreservation.",
      l2: "Udsendelse af nyhedsbreve (hvis du har tilmeldt dig).",
      l3: "Overholdelse af lovgivning, herunder bogføringsloven.",
      s3: "3. Kategorier af personoplysninger",
      p3: "Vi behandler navn, e-mailadresse, telefonnummer og eventuelle særlige ønsker/allergier, som du oplyser i forbindelse med din reservation.",
      s4: "4. Opbevaring af dine personoplysninger",
      p4: "Vi opbevarer dine personoplysninger så længe det er nødvendigt til de formål, der er nævnt ovenfor, eller så længe lovgivningen kræver det."
    },
    en: {
      title: "Privacy Policy",
      s1: "1. Data Controller",
      p1: "Restaurant Bag Søjlen is the data controller for the processing of the personal data we have received about you.",
      s2: "2. Purpose of processing",
      p2: "We process your personal data for the following purposes:",
      l1: "Handling your table reservation.",
      l2: "Sending newsletters (if you have subscribed).",
      l3: "Compliance with legislation, including the Bookkeeping Act.",
      s3: "3. Categories of personal data",
      p3: "We process name, email address, phone number, and any special requests/allergies you provide in connection with your reservation.",
      s4: "4. Storage of your personal data",
      p4: "We store your personal data for as long as necessary for the purposes mentioned above, or as long as required by law."
    },
    de: {
      title: "Datenschutzrichtlinie",
      s1: "1. Verantwortlicher",
      p1: "Restaurant Bag Søjlen ist der Verantwortliche für die Verarbeitung der personenbezogenen Daten, die wir über Sie erhalten haben.",
      s2: "2. Zweck der Verarbeitung",
      p2: "Wir verarbeiten Ihre personenbezogenen Daten zu folgenden Zwecken:",
      l1: "Abwicklung Ihrer Tischreservierung.",
      l2: "Versand von Newslettern (falls abonniert).",
      l3: "Einhaltung von Rechtsvorschriften, einschließlich des Buchhaltungsgesetzes.",
      s3: "3. Kategorien personenbezogener Daten",
      p3: "Wir verarbeiten Name, E-Mail-Adresse, Telefonnummer und alle Sonderwünsche/Allergien, die Sie im Zusammenhang mit Ihrer Reservierung angeben.",
      s4: "4. Aufbewahrung Ihrer personenbezogenen Daten",
      p4: "Wir speichern Ihre personenbezogenen Daten so lange, wie es für die oben genannten Zwecke erforderlich ist oder wie es das Gesetz vorschreibt."
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
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>{t.l1}</li>
              <li>{t.l2}</li>
              <li>{t.l3}</li>
            </ul>
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

export default PrivacyPolicy;
