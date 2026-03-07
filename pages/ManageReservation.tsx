import React, { useState } from 'react';
import { BookingData } from '../types';
import { Language, translations } from '../translations';
import { supabase } from '../lib/supabase';

interface ManageReservationProps {
  confirmedBooking: BookingData | null;
  initialFlow?: ManageFlow;
  language: Language;
}

type ManageFlow = 'verify' | 'dashboard' | 'change' | 'cancel' | 'success';

const ManageReservation: React.FC<ManageReservationProps> = ({ confirmedBooking, initialFlow = 'verify', language }) => {
  const [flow, setFlow] = useState<ManageFlow>(initialFlow);
  const [newTime, setNewTime] = useState('20:00');
  const [successType, setSuccessType] = useState<'change' | 'cancel'>('change');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [activeBooking, setActiveBooking] = useState<any | null>(confirmedBooking);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations[language].manage;
  const tConf = translations[language].confirmation;

  const isVerifyValid = name.trim().length > 2 && email.includes('@') && email.includes('.');

  const handleVerify = async () => {
    if (!isVerifyValid) return;
    setIsSubmitting(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .ilike('email', email.trim())
        .ilike('fullName', name.trim())
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setActiveBooking(data[0]);
        setFlow('dashboard');
      } else {
        setError(language === 'da' ? 'Ingen reservation fundet med disse oplysninger.' : 'No reservation found with these details.');
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while fetching your reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!activeBooking?.id) {
      setSuccessType('change'); setFlow('success');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ time: newTime })
        .eq('id', activeBooking.id);
      if (updateError) throw updateError;

      setActiveBooking({ ...activeBooking, time: newTime });
      setSuccessType('change');
      setFlow('success');
    } catch (err) {
      console.error(err);
      setError("Could not update reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!activeBooking?.id) {
      setSuccessType('cancel'); setFlow('success');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: cancelError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', activeBooking.id);
      if (cancelError) throw cancelError;

      setSuccessType('cancel');
      setFlow('success');
      setActiveBooking({ ...activeBooking, status: 'cancelled' });
    } catch (err) {
      console.error(err);
      setError("Could not cancel reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (flow) {
      case 'verify':
        return (
          <div className="bg-white p-16 shadow-2xl border border-gray-100 max-w-xl w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>
            <div className="text-center mb-12">
              <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.4em] uppercase block mb-4">{t.login}</span>
              <h2 className="text-4xl serif italic text-[#1a1a1a]">{t.find}</h2>
            </div>
            <div className="space-y-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">{t.nameLabel} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="..."
                  className="border-b border-gray-200 py-4 outline-none focus:border-[#CDA235] serif italic bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">{t.emailLabel} *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="..."
                  className="border-b border-gray-200 py-4 outline-none focus:border-[#CDA235] serif italic bg-transparent"
                />
              </div>
              {error && <p className="text-red-500 text-xs italic">{error}</p>}
              <button
                onClick={handleVerify}
                disabled={!isVerifyValid || isSubmitting}
                className={`w-full py-8 text-[11px] font-bold uppercase tracking-[0.5em] transition-all shadow-xl ${isVerifyValid && !isSubmitting ? 'bg-[#1a1a1a] text-white hover:bg-[#CDA235]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (language === 'da' ? 'SØGER...' : 'SEARCHING...') : t.verifyBtn}
              </button>
            </div>
          </div>
        );

      case 'dashboard':
        if (!activeBooking) return null;
        return (
          <div className="bg-white p-16 shadow-2xl border border-gray-100 max-w-2xl w-full relative">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">{t.status}</span>
                <h2 className="text-4xl serif italic">{t.dashboard}</h2>
              </div>
              <span className="text-xs font-mono text-gray-300">REF: #BS-98421</span>
            </div>

            <div className="grid grid-cols-2 gap-10 py-12 border-y border-gray-50 mb-16">
              <div>
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest block mb-2">{tConf.date}</span>
                <span className="text-xl serif italic font-bold">{activeBooking.date}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest block mb-2">{tConf.arrival}</span>
                <span className="text-xl serif italic font-bold">{activeBooking.time}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest block mb-2">{tConf.guests}</span>
                <span className="text-xl serif italic font-bold">{activeBooking.guests} {language === 'da' ? 'Personer' : 'People'}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button onClick={() => setFlow('change')} className="bg-[#CDA235] text-white py-8 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[#b48f2a] shadow-lg">{t.change}</button>
              <button onClick={() => setFlow('cancel')} className="border-2 border-red-50 text-red-600 py-8 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-red-50">{t.cancel}</button>
            </div>
          </div>
        );

      case 'change':
        return (
          <div className="bg-white p-16 shadow-2xl border border-gray-100 max-w-2xl w-full relative">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>
            <h2 className="text-4xl serif italic mb-4 text-center">{t.chooseNew}</h2>
            <div className="grid grid-cols-3 gap-4 mb-16 mt-8">
              {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(tm => (
                <button key={tm} onClick={() => setNewTime(tm)} className={`py-8 border-2 transition-all ${newTime === tm ? 'border-[#CDA235] bg-[#CDA235] text-white' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}>
                  <span className="text-lg serif italic">{tm}</span>
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
            <button disabled={isSubmitting} onClick={handleUpdate} className={`w-full py-8 text-[11px] font-bold uppercase tracking-[0.5em] transition-all ${isSubmitting ? 'bg-gray-100 text-gray-400' : 'bg-[#1a1a1a] text-white hover:bg-[#CDA235]'}`}>
              {isSubmitting ? '...' : t.confirmChange + ' →'}
            </button>
          </div>
        );

      case 'cancel':
        return (
          <div className="bg-white p-20 shadow-2xl border border-gray-100 max-w-xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-red-600"></div>
            <h2 className="text-4xl serif italic mb-6">{t.cancelConfirm}</h2>
            <p className="text-gray-400 text-sm mb-12 italic">{t.cancelText}</p>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="space-y-4">
              <button disabled={isSubmitting} onClick={handleCancel} className={`w-full py-8 text-[11px] font-bold uppercase tracking-[0.5em] transition-all ${isSubmitting ? 'bg-red-300 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>{isSubmitting ? '...' : t.cancelBtn}</button>
              <button onClick={() => setFlow('dashboard')} className="w-full border-2 border-gray-100 py-6 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gray-50 transition-all">{t.keepBtn}</button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="bg-white p-24 shadow-2xl border border-gray-100 max-w-xl w-full text-center relative">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>
            <h2 className="text-5xl serif italic mb-6">{successType === 'cancel' ? t.successCancel : t.successUpdate}</h2>
            <button onClick={() => setFlow('verify')} className="w-full bg-[#1a1a1a] text-white py-8 text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-[#CDA235] transition-all">
              {t.close}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-[1000px] py-32 px-8 flex flex-col items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default ManageReservation;
