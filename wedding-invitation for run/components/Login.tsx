import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Phone, MessageSquare, Loader2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { Language, UserSession, WeddingData } from '../types';
import { LANGUAGES, ADMIN_PHONE, DEFAULT_WEDDING_DATA } from '../constants';
import Logo from './Logo';
import GlassCard from './GlassCard';

// Firebase/OTP removed — simple name + phone login now

const ADMIN_PASSWORD = "weds030325";

const LANGUAGE_DISPLAY_MAP: Record<Language, string> = {
  'English': 'English',
  'Hindi': 'हिन्दी',
  'Tamil': 'தமிழ்',
  'Telugu': 'తెలుగు',
  'Kannada': 'ಕನ್ನಡ',
  'Malayalam': 'മലയാളം'
};

// Admin password removed; admin is determined by phone match with ADMIN_PHONE

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLang, setSelectedLang] = useState<Language>('English');
  const [name, setName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  
  const [weddingData] = useState<WeddingData>(() => {
    const saved = localStorage.getItem('wedding_data');
    return saved ? JSON.parse(saved) : DEFAULT_WEDDING_DATA;
  });

  const isAdmin = phone.includes(ADMIN_PHONE);

  const handleLangSelect = (lang: Language) => {
    setSelectedLang(lang);
    setStep(2);
  };

  const handlePhoneSubmit = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }

    if (isAdmin) {
      if (adminPassword.length === 0) {
        setError('Please enter admin password.');
        return;
      }
      if (adminPassword !== ADMIN_PASSWORD) {
        setError('Invalid admin password.');
        return;
      }
    } else {
      if (name.trim().length === 0) {
        setError('Please enter your name.');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const session: UserSession = {
        phone: formattedPhone,
        language: selectedLang,
        isAuthenticated: true,
        isAdmin: formattedPhone.includes(ADMIN_PHONE),
        name: isAdmin ? 'Admin' : name.trim()
      };

      // detect invitation controller number from localStorage
      try {
        const ctrlRaw = localStorage.getItem('invitation_controller') || '';
        const wanted = (ctrlRaw || '').replace(/\D/g, '');
        const phDigits = formattedPhone.replace(/\D/g, '');
        if (wanted && phDigits.includes(wanted)) {
          (session as any).isController = true;
        }
      } catch {}

      // Persist guest name locally for later use
      try {
        localStorage.setItem('guest_name', name.trim());
        // push to guest_logins array
        const raw = localStorage.getItem('guest_logins');
        const list = raw ? JSON.parse(raw) : [];
        list.push({ name: session.name || '', phone: formattedPhone, time: new Date().toISOString() });
        localStorage.setItem('guest_logins', JSON.stringify(list));
        // mark that a guest just logged in so app can auto-play invitation
        localStorage.setItem('just_logged_in', '1');
      } catch {}

      onLogin(session);
    } catch (err: any) {
      console.error('Login Error:', err);
      setError('Unable to log in — please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const logoTitle = `${weddingData.groomName[0]} & ${weddingData.brideName[0]}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12 bg-transparent relative z-10">
      {/* reCAPTCHA Container must be persistent in the DOM */}
      <div id="recaptcha-container"></div>

      <div className="animate-float-slow">
        <Logo src={weddingData.logo} title={logoTitle} className="w-32 h-32 scale-125 mb-8" />
      </div>
      
      <GlassCard className="w-full max-w-sm p-8 space-y-8 animate-scale-in relative overflow-hidden">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 p-4 flex items-center gap-3 animate-slide-down z-20">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight leading-tight flex-1">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-indigo-950 uppercase tracking-tight playfair">Welcome</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Select Your Language</p>
            </div>
            <div className="flex overflow-x-auto gap-4 py-4 snap-x no-scrollbar mask-fade-edges">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangSelect(lang)}
                  className="flex-shrink-0 w-24 h-24 rounded-3xl bg-white/40 border-2 border-white/60 flex items-center justify-center font-black text-sm text-indigo-900 shadow-sm transition-all active:scale-90 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 snap-center tracking-tight"
                >
                  {LANGUAGE_DISPLAY_MAP[lang]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 pt-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter playfair">Guest Portal</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.1em]">Authenticated Access</p>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 rounded-xl transition-colors group-focus-within:bg-indigo-100">
                  <Phone className="text-indigo-600 w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number"
                  disabled={isLoading}
                  className="w-full pl-16 pr-4 py-5 bg-white border border-indigo-100 rounded-[2rem] text-indigo-950 font-bold placeholder:text-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all disabled:opacity-50"
                />
              </div>

              <div className="relative group">
                {isAdmin ? (
                  <>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 rounded-xl transition-colors group-focus-within:bg-indigo-100">
                      <Lock className="text-indigo-600 w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Admin Password"
                      disabled={isLoading}
                      className="w-full pl-16 pr-4 py-5 bg-white border border-indigo-100 rounded-[2rem] text-indigo-950 font-bold placeholder:text-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all disabled:opacity-50"
                    />
                  </>
                ) : (
                  <>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 rounded-xl transition-colors group-focus-within:bg-indigo-100">
                      <MessageSquare className="text-indigo-600 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      disabled={isLoading}
                      className="w-full pl-16 pr-4 py-5 bg-white border border-indigo-100 rounded-[2rem] text-indigo-950 font-bold placeholder:text-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all disabled:opacity-50"
                    />
                  </>
                )}
              </div>

              <button
                onClick={handlePhoneSubmit}
                disabled={(isAdmin ? adminPassword.length === 0 : name.trim().length === 0) || phone.replace(/\D/g, '').length < 10 || isLoading}
                className="w-full py-5 bg-indigo-950 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all text-[10px] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isAdmin ? (
                  <>Unlock Dashboard <ShieldCheck className="w-4 h-4" /></>
                ) : (
                  <>Enter Invitation <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              <button onClick={() => setStep(1)} className="w-full text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors">
                Change Language
              </button>
            </div>
          </div>
        )}
        
      </GlassCard>

      <style>{`
        @keyframes slide-down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .mask-fade-edges { mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }
        #recaptcha-container { position: fixed; bottom: 0; left: 0; pointer-events: none; opacity: 0; z-index: -100; }
      `}</style>
    </div>
  );
};

export default Login;