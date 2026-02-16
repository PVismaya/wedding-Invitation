
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Settings, ArrowLeft, MapPin, Sparkles, Heart, Star, Ghost, Users } from 'lucide-react';
import { UserSession, WeddingData } from './types';
import { DEFAULT_WEDDING_DATA, THEME_CONFIGS } from './constants';
import Login from './components/Login';
import BottomNav from './components/BottomNav';
import InvitationCard from './components/InvitationCard';
import Countdown from './components/Countdown';
import WeddingInfo from './components/WeddingInfo';
import AgentUI from './components/AgentUI';
import CustomizeModal from './components/CustomizeModal';
import GuestLoginsModal from './components/GuestLoginsModal';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isControllerOpen, setIsControllerOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [weddingData, setWeddingData] = useState<WeddingData>(() => {
    const saved = localStorage.getItem('wedding_data');
    return saved ? JSON.parse(saved) : DEFAULT_WEDDING_DATA;
  });

  const hasSpokenIntro = useRef(false);

  const currentThemeConfig = THEME_CONFIGS[weddingData.theme.preset];

  useEffect(() => {
    document.title = `${weddingData.groomName} & ${weddingData.brideName} Wedding Invitation`;
    
    // Update dynamic CSS variables for colors and blur
    document.documentElement.style.setProperty('--primary', weddingData.theme.primaryColor);
    document.documentElement.style.setProperty('--accent', weddingData.theme.accentColor);
    document.documentElement.style.setProperty('--glass-blur', `${weddingData.theme.glassBlur}px`);
  }, [weddingData]);

  

  const handleSpeechInvitation = () => {
    if (!session) return;
    
    const langCodeMap: Record<string, string> = { 
      'English': 'en-US', 
      'Hindi': 'hi-IN', 
      'Tamil': 'ta-IN', 
      'Telugu': 'te-IN', 
      'Kannada': 'kn-IN', 
      'Malayalam': 'ml-IN' 
    };
    
    const selectedLangCode = langCodeMap[session.language] || 'en-US';
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    
    // Defensive Date Check
    const weddingDateObj = new Date(weddingData.date);
    const isValidDate = !isNaN(weddingDateObj.getTime());
    const formattedDate = isValidDate 
      ? weddingDateObj.toLocaleDateString(selectedLangCode, dateOptions)
      : (session.language === 'English' ? 'a future date' : 'आने वाली तारीख');
    
    // Localized Invitation Messages
    const invitationMessages: Record<string, string> = {
      'English': `Dear guest, we cordially invite you to the wedding of ${weddingData.groomName} and ${weddingData.brideName} on ${formattedDate}. We hope to see you at ${weddingData.venueName}.`,
      'Hindi': `नमस्ते, हम आपको ${formattedDate} को ${weddingData.groomName} और ${weddingData.brideName} के विवाह समारोह में सादर आमंत्रित करते हैं। हम ${weddingData.venueName} में आपके स्वागत की प्रतीक्षा करेंगे।`,
      'Tamil': `வணக்கம், ${formattedDate} அன்று நடைபெறும் ${weddingData.groomName} மற்றும் ${weddingData.brideName} திருமண விழாவிற்கு உங்களை அன்புடன் அழைக்கிறோம். ${weddingData.venueName} இல் உங்களைச் சந்திக்க ஆவலாக உள்ளோம்.`,
      'Telugu': `నమస్కారం, ${formattedDate}న జరుగుతున్న ${weddingData.groomName} మరియు ${weddingData.brideName} వివాహ మహోత్సవానికి మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నాము. ${weddingData.venueName}లో మిమ్మల్ని కలుస్తామని ఆశిస్తున్నాము.`,
      'Kannada': `ನಮಸ್ಕಾರ, ${formattedDate} ರಂದು ನಡೆಯಲಿರುವ ${weddingData.groomName} ಮತ್ತು ${weddingData.brideName} ಅವರ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ನಿಮ್ಮನ್ನು ಆತ್ಮೀಯವಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ. ${weddingData.venueName} ನಲ್ಲಿ ನಿಮ್ಮನ್ನು ಕಾಣಲು ನಾವು ಬಯಸುತ್ತೇವೆ.`,
      'Malayalam': `നമസ്കാരം, ${formattedDate}-ന് നടക്കുന്ന ${weddingData.groomName}, ${weddingData.brideName} എന്നിവരുടെ വിവാഹ ചടങ്ങിലേക്ക് നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു. ${weddingData.venueName}-ൽ വെച്ച് നിങ്ങളെ കാണുമെന്ന് ഞങ്ങൾ പ്രതീക്ഷിക്കുന്നു.`
    };

    const msg = invitationMessages[session.language] || invitationMessages['English'];
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = selectedLangCode;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech automatically when session is established (Login Success)
  useEffect(() => {
    if (!session) return;

    // If this is a fresh guest login, always play the invite once.
    const justLogged = !!localStorage.getItem('just_logged_in');
    if (justLogged || !hasSpokenIntro.current) {
      handleSpeechInvitation();
      hasSpokenIntro.current = true;
      try { localStorage.removeItem('just_logged_in'); } catch {}
    }
  }, [session]);

  const handleUpdateWedding = (newData: WeddingData) => {
    setWeddingData(newData);
    localStorage.setItem('wedding_data', JSON.stringify(newData));
  };

  const EntrancePopup = () => {
    const isSeal = weddingData.theme.entranceStyle === 'seal';
    const isStars = weddingData.theme.entranceStyle === 'stars';
    const isBloom = weddingData.theme.entranceStyle === 'bloom';
    const isCurtains = weddingData.theme.entranceStyle === 'curtains';

    return (
      <div className={`fixed inset-0 z-[100] transition-all duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Curtains Effect */}
        {isCurtains && (
          <>
            <div className={`fixed inset-y-0 left-0 w-1/2 bg-indigo-950 z-[101] transition-transform duration-1000 ease-in-out ${isRevealed ? '-translate-x-full' : 'translate-x-0'}`} />
            <div className={`fixed inset-y-0 right-0 w-1/2 bg-indigo-950 z-[101] transition-transform duration-1000 ease-in-out ${isRevealed ? 'translate-x-full' : 'translate-x-0'}`} />
          </>
        )}

        <div className={`fixed inset-0 bg-indigo-950/20 backdrop-blur-3xl flex items-center justify-center p-8 z-[102]`}>
          <div className={`w-full max-w-sm bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] p-10 text-center shadow-2xl transition-all duration-700 ${isRevealed ? (isBloom ? 'scale-[5] opacity-0 blur-3xl' : 'scale-150 rotate-12 opacity-0') : 'scale-100'}`}>
            
            {isStars && [...Array(15)].map((_, i) => (
              <Star key={i} className="absolute text-indigo-300 opacity-20 animate-pulse" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, scale: `${Math.random()*1.5}` }} />
            ))}

            <div className="space-y-8 relative z-10">
              <div className={`mx-auto w-24 h-24 bg-white/80 rounded-full flex items-center justify-center shadow-inner border border-white transition-all ${isSeal ? 'animate-bounce' : 'animate-pulse'}`}>
                {isSeal ? <Heart className="w-10 h-10" style={{ color: weddingData.theme.primaryColor }} fill="currentColor" /> : <Sparkles className="w-10 h-10" style={{ color: weddingData.theme.primaryColor }} />}
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter playfair" style={{ color: weddingData.theme.primaryColor }}>The Invitation</h2>
                <p className="text-indigo-950/60 font-medium text-sm italic">Witness the union of {weddingData.groomName} & {weddingData.brideName}</p>
              </div>

              <button 
                onClick={() => setIsRevealed(true)}
                className="w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all text-[10px] flex items-center justify-center gap-3"
                style={{ background: weddingData.theme.primaryColor }}
              >
                Enter Experience <Heart className="w-3.5 h-3.5 fill-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!session) return <Login onLogin={setSession} />;

  const monogram = `${weddingData.groomName[0]} & ${weddingData.brideName[0]}`;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background: currentThemeConfig.bg }}>
      <EntrancePopup />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 z-50 bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-sm shrink-0">
        <div className="w-10">
          <button onClick={() => setSession(null)} className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center border border-white shadow-sm active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5 text-indigo-900" />
          </button>
        </div>
        <div className="flex-1 flex justify-center">
           <Logo src={weddingData.logo} title={monogram} className="w-11 h-11" />
        </div>
        <div className="w-10 flex justify-end">
          {session.isController && (
            <button
              onClick={() => setIsControllerOpen(true)}
              className="w-10 h-10 mr-2 text-white rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center"
              style={{ background: weddingData.theme.accentColor }}
            >
              <Users className="w-5 h-5" />
            </button>
          )}
          {session.isAdmin && (
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="w-10 h-10 text-white rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center"
              style={{ background: weddingData.theme.primaryColor }}
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pt-8 pb-40 no-scrollbar scroll-smooth">
        {activeTab === 'home' && (
          <div className={`flex flex-col gap-12 transition-all duration-1000 ${isRevealed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <InvitationCard data={weddingData} />
            <div className="space-y-8">
              <Countdown targetDate={weddingData.date} />
              <button 
                onClick={handleSpeechInvitation}
                className="w-full p-6 bg-white/50 border border-white text-indigo-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl backdrop-blur-md active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ background: weddingData.theme.primaryColor }}>
                   <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                </div>
                Listen to Invite
              </button>
            </div>
          </div>
        )}

        {activeTab === 'info' && <WeddingInfo data={weddingData} />}

        {activeTab === 'venue' && (
          <div className="space-y-10 animate-fade-in pb-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: weddingData.theme.primaryColor }}>The Venue</h2>
              <p className="text-indigo-400 font-bold uppercase text-[9px] tracking-[0.3em]">We can't wait to see you</p>
            </div>
            
            <div className="overflow-hidden aspect-[4/3] rounded-[3rem] border-8 border-white shadow-2xl relative bg-white/20 backdrop-blur-xl">
               <iframe
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(weddingData.venueName + ' ' + weddingData.venueAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                 width="100%" height="100%" style={{ border: 0 }}
                 className="grayscale hover:grayscale-0 transition-all duration-1000"
               ></iframe>
            </div>

            <div className="p-10 text-center space-y-8 rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white">
               <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mx-auto shadow-inner">
                 <MapPin className="w-10 h-10" style={{ color: weddingData.theme.primaryColor }} />
               </div>
               <div className="space-y-3">
                 <h3 className="text-2xl font-black text-indigo-950 uppercase tracking-tight">{weddingData.venueName}</h3>
                 <p className="text-indigo-600/60 font-medium text-sm leading-relaxed px-4">{weddingData.venueAddress}</p>
               </div>
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(weddingData.venueAddress)}`}
                 target="_blank"
                 className="block w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all text-center"
                 style={{ background: weddingData.theme.primaryColor }}
               >
                 Open in Maps
               </a>
            </div>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onMicClick={() => setIsAgentOpen(true)} />
      <AgentUI isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} language={session.language} weddingData={weddingData} />
      <CustomizeModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} data={weddingData} onSave={handleUpdateWedding} />
      <GuestLoginsModal isOpen={isControllerOpen} onClose={() => setIsControllerOpen(false)} />

      <style>{`
        :root {
          --primary: ${weddingData.theme.primaryColor};
          --accent: ${weddingData.theme.accentColor};
          --glass-blur: ${weddingData.theme.glassBlur}px;
        }
        .backdrop-blur-xl { backdrop-filter: blur(var(--glass-blur)); }
        .playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default App;
