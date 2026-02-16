
import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Plus, Trash2, Calendar, MapPin, Clock, Heart, BookOpen, Navigation, Users, Star, Layout, Briefcase, Home, Map, Palette, Wand2, UserPlus, ListPlus } from 'lucide-react';
import { WeddingData, TimelineEvent, FamilyMember, ThemePreset, EntranceStyle, HeroAnimation } from '../types';
import { THEME_CONFIGS } from '../constants';

interface CustomizeModalProps {
  data: WeddingData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newData: WeddingData) => void;
}

const CustomizeModal: React.FC<CustomizeModalProps> = ({ data, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<WeddingData>(data);
  const [activeTab, setActiveTab] = useState<'logistics' | 'couple' | 'style' | 'content' | 'guests'>('content');
  const [isLocating, setIsLocating] = useState(false);
  const [guestLogins, setGuestLogins] = useState<Array<{name:string,phone:string,time:string}>>([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('guest_logins');
      const list = raw ? JSON.parse(raw) : [];
      setGuestLogins(list);
    } catch {
      setGuestLogins([]);
    }
  }, [isOpen, activeTab]);

  const clearGuestLogins = () => {
    try {
      localStorage.removeItem('guest_logins');
    } catch {}
    setGuestLogins([]);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(data);
    }
  }, [data, isOpen]);

  const updateTheme = (updates: Partial<WeddingData['theme']>) => {
    setFormData(prev => ({
      ...prev,
      theme: { ...prev.theme, ...updates }
    }));
  };

  const handleThemePreset = (preset: ThemePreset) => {
    const config = THEME_CONFIGS[preset];
    setFormData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        preset,
        primaryColor: config.primary,
        accentColor: config.accent
      }
    }));
  };

  const handleImageUpload = (field: keyof WeddingData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ 
            ...prev, 
            gallery: [...prev.gallery, { url: reader.result as string, isFeatured: false }] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleToggleFeatured = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.map((img, i) => 
        i === index ? { ...img, isFeatured: !img.isFeatured } : img
      )
    }));
  };

  const addFamilyMember = (side: 'groomFamily' | 'brideFamily') => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: '',
      relation: ''
    };
    setFormData(prev => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        [side]: [...prev.familyDetails[side], newMember]
      }
    }));
  };

  const removeFamilyMember = (side: 'groomFamily' | 'brideFamily', id: string) => {
    setFormData(prev => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        [side]: prev.familyDetails[side].filter(m => m.id !== id)
      }
    }));
  };

  const updateFamilyMember = (side: 'groomFamily' | 'brideFamily', id: string, field: keyof FamilyMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        [side]: prev.familyDetails[side].map(m => m.id === id ? { ...m, [field]: value } : m)
      }
    }));
  };

  const addTimelineEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      time: '12:00 PM',
      title: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, newEvent]
    }));
  };

  const removeTimelineEvent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter(e => e.id !== id)
    }));
  };

  const updateTimelineEvent = (id: string, field: keyof TimelineEvent, value: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ 
          ...prev, 
          venueAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
        }));
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const previewMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(formData.venueName + ' ' + formData.venueAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const formatIsoToLocalInput = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-indigo-950/80 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-[3rem] p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
        
        <div className="p-8 bg-white border-b border-indigo-50 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-indigo-950 uppercase tracking-tight">Admin Suite</h2>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Design & Control</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-indigo-300 hover:text-indigo-950 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'style', icon: Palette, label: 'Style Lab' },
              { id: 'logistics', icon: MapPin, label: 'Logistics' },
              { id: 'couple', icon: Users, label: 'The Couple' },
              { id: 'content', icon: ImageIcon, label: 'Gallery' },
              { id: 'guests', icon: UserPlus, label: 'Guest Logins' },
              { id: 'controller', icon: Navigation, label: 'Controller' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">

          {activeTab === 'style' && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1">Theme Presets</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(THEME_CONFIGS) as ThemePreset[]).map(p => (
                    <button
                      key={p}
                      onClick={() => handleThemePreset(p)}
                      style={{ background: THEME_CONFIGS[p].bg }}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                        formData.theme.preset === p ? 'border-indigo-600 scale-[1.02] shadow-lg' : 'border-white'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full shadow-inner" style={{ background: THEME_CONFIGS[p].primary }}></div>
                      <span className="text-[9px] font-black uppercase text-indigo-950">{p.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1">Custom Colors</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-indigo-300 uppercase tracking-widest px-1">Primary Color</label>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-indigo-50 shadow-sm">
                      <input 
                        type="color" 
                        value={formData.theme.primaryColor}
                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent overflow-hidden"
                      />
                      <span className="text-[10px] font-mono font-bold text-indigo-950 uppercase">{formData.theme.primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-indigo-300 uppercase tracking-widest px-1">Accent Color</label>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-indigo-50 shadow-sm">
                      <input 
                        type="color" 
                        value={formData.theme.accentColor}
                        onChange={(e) => updateTheme({ accentColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent overflow-hidden"
                      />
                      <span className="text-[10px] font-mono font-bold text-indigo-950 uppercase">{formData.theme.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1">Entrance Animation</label>
                  <div className="flex flex-wrap gap-2">
                    {(['seal', 'mist', 'stars', 'curtains', 'bloom'] as EntranceStyle[]).map(s => (
                      <button
                        key={s}
                        onClick={() => updateTheme({ entranceStyle: s })}
                        className={`px-4 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.theme.entranceStyle === s ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-indigo-50 text-indigo-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1">Hero Photo Animation</label>
                  <div className="flex flex-wrap gap-2">
                    {(['zoom', 'float', 'ken-burns', 'shimmer', 'none'] as HeroAnimation[]).map(a => (
                      <button
                        key={a}
                        onClick={() => updateTheme({ heroAnimation: a })}
                        className={`px-4 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.theme.heroAnimation === a ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-indigo-50 text-indigo-300'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Glass Intensity</label>
                  <span className="text-[10px] font-black text-indigo-600">{formData.theme.glassBlur}px</span>
                </div>
                <input 
                  type="range" min="0" max="40" 
                  value={formData.theme.glassBlur}
                  onChange={(e) => updateTheme({ glassBlur: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Guest Logins</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Total: {guestLogins.length}</span>
                  <button onClick={clearGuestLogins} className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black">Clear All</button>
                </div>
              </div>

              <div className="space-y-3">
                {guestLogins.length === 0 ? (
                  <div className="p-6 bg-indigo-50 rounded-2xl text-center text-indigo-400 font-black">No guest logins yet.</div>
                ) : (
                  guestLogins.slice().reverse().map((g, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-indigo-50 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-indigo-950">{g.name || '—'}</div>
                        <div className="text-[11px] text-indigo-400">{g.phone}</div>
                      </div>
                      <div className="text-[11px] text-indigo-300 font-mono">{new Date(g.time).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'controller' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Invitation Controller</h3>
                </div>
                <div className="text-[11px] text-indigo-400 font-black">Only this number can view guest logins</div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Controller Phone Number</label>
                <div className="flex gap-3">
                  <input
                    value={localStorage.getItem('invitation_controller') || ''}
                    onChange={(e) => {
                      try { localStorage.setItem('invitation_controller', e.target.value); } catch {}
                      // trigger state refresh
                      setGuestLogins(prev => prev.slice());
                    }}
                    placeholder="e.g. +919876543210 or 9876543210"
                    className="flex-1 p-4 bg-white rounded-2xl border border-indigo-100 outline-none"
                  />
                  <button onClick={() => { try { localStorage.removeItem('invitation_controller'); setGuestLogins([]);} catch{} }} className="px-4 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px]">Clear</button>
                </div>
                <p className="text-[11px] text-indigo-300">Guests who log in with this number will gain access to guest login list only.</p>
              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-12 animate-fade-in">
               <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Venue Details</h3>
                  </div>
                  <button onClick={getCurrentLocation} disabled={isLocating} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full flex items-center gap-2 active:scale-95 transition-all">
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Wait...' : 'Get GPS'}
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-inner bg-indigo-50">
                    <iframe src={previewMapUrl} width="100%" height="100%" style={{ border: 0 }} className="grayscale"></iframe>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Wedding Date</label>
                      <input 
                        type="datetime-local" 
                        value={formatIsoToLocalInput(formData.date)} 
                        onChange={(e) => {
                          const localVal = e.target.value;
                          if (!localVal) return;
                          const dateObj = new Date(localVal);
                          if (!isNaN(dateObj.getTime())) {
                            setFormData(prev => ({ ...prev, date: dateObj.toISOString() }));
                          }
                        }} 
                        className="w-full p-4 bg-white rounded-2xl border border-indigo-100 text-indigo-950 font-bold outline-none focus:ring-2 focus:ring-indigo-600" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Venue Name</label>
                      <input value={formData.venueName} onChange={(e) => setFormData({...formData, venueName: e.target.value})} className="w-full p-4 bg-white rounded-2xl border border-indigo-100 text-indigo-950 font-bold outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Address</label>
                      <textarea value={formData.venueAddress} onChange={(e) => setFormData({...formData, venueAddress: e.target.value})} rows={2} className="w-full p-4 bg-white rounded-2xl border border-indigo-100 text-indigo-950 font-medium text-sm outline-none resize-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Management Section */}
              <div className="space-y-8 pt-4">
                <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Wedding Schedule</h3>
                  </div>
                  <button 
                    onClick={addTimelineEvent}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <ListPlus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.timeline.map((event) => (
                    <div key={event.id} className="relative bg-indigo-50/30 p-5 rounded-[2rem] border border-indigo-100 space-y-4 animate-fade-in group">
                      <button 
                        onClick={() => removeTimelineEvent(event.id)}
                        className="absolute top-4 right-4 p-2 text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 space-y-1">
                          <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-1">Time</label>
                          <input 
                            value={event.time}
                            placeholder="10:00 AM"
                            onChange={(e) => updateTimelineEvent(event.id, 'time', e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl text-[10px] font-bold text-indigo-950 border border-transparent focus:border-indigo-200 outline-none"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-1">Event Title</label>
                          <input 
                            value={event.title}
                            placeholder="Ceremony"
                            onChange={(e) => updateTimelineEvent(event.id, 'title', e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black text-indigo-950 border border-transparent focus:border-indigo-200 outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-1">Description</label>
                        <textarea 
                          value={event.description}
                          placeholder="Brief description of the event..."
                          rows={2}
                          onChange={(e) => updateTimelineEvent(event.id, 'description', e.target.value)}
                          className="w-full bg-white px-4 py-3 rounded-2xl text-[10px] font-medium text-indigo-600/70 border border-transparent focus:border-indigo-200 outline-none resize-none"
                        />
                      </div>
                    </div>
                  ))}
                  {formData.timeline.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-indigo-100 rounded-[2rem] text-indigo-300">
                      <p className="text-[10px] font-black uppercase tracking-widest">No events scheduled yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'couple' && (
            <div className="space-y-12 animate-fade-in">
              <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 space-y-4 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-indigo-200 group shadow-lg shrink-0 flex items-center justify-center">
                      {formData.groomImage ? (
                        <img src={formData.groomImage} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-indigo-400" />
                      )}
                      <label className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                        <ImageIcon className="w-6 h-6" />
                        <input type="file" className="hidden" onChange={handleImageUpload('groomImage')} accept="image/*" />
                      </label>
                   </div>
                   <div className="flex-1">
                     <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest px-1">Groom's Name</label>
                     <input 
                       value={formData.groomName} 
                       onChange={(e) => setFormData({...formData, groomName: e.target.value})} 
                       className="w-full text-xl font-black text-indigo-950 bg-transparent outline-none uppercase tracking-tight focus:ring-0 p-1 border-b border-indigo-100" 
                     />
                   </div>
                </div>
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest px-4">Profession</label>
                    <input value={formData.groomJob} onChange={(e) => setFormData({...formData, groomJob: e.target.value})} placeholder="Profession" className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold text-indigo-950 border border-indigo-100 shadow-inner" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest px-4">Native Place</label>
                    <input value={formData.groomNative} onChange={(e) => setFormData({...formData, groomNative: e.target.value})} placeholder="Native Place" className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold text-indigo-950 border border-indigo-100 shadow-inner" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest px-4">Currently Living In</label>
                    <input value={formData.groomLiving} onChange={(e) => setFormData({...formData, groomLiving: e.target.value})} placeholder="Current Residence" className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold text-indigo-950 border border-indigo-100 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-rose-50/50 rounded-[2.5rem] border border-rose-100 space-y-4 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-rose-200 group shadow-lg shrink-0 flex items-center justify-center">
                      {formData.brideImage ? (
                        <img src={formData.brideImage} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-rose-400" />
                      )}
                      <label className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                        <ImageIcon className="w-6 h-6" />
                        <input type="file" className="hidden" onChange={handleImageUpload('brideImage')} accept="image/*" />
                      </label>
                   </div>
                   <div className="flex-1">
                     <label className="text-[9px] font-black uppercase text-rose-400 tracking-widest px-1">Bride's Name</label>
                     <input 
                       value={formData.brideName} 
                       onChange={(e) => setFormData({...formData, brideName: e.target.value})} 
                       className="w-full text-xl font-black text-indigo-950 bg-transparent outline-none uppercase tracking-tight focus:ring-0 p-1 border-b border-rose-100" 
                     />
                   </div>
                </div>
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-rose-400 tracking-widest px-4">Profession</label>
                    <input value={formData.brideJob} onChange={(e) => setFormData({...formData, brideJob: e.target.value})} placeholder="Profession" className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold text-indigo-950 border border-rose-100 shadow-inner" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-rose-400 tracking-widest px-4">Native Place</label>
                    <input value={formData.brideNative} onChange={(e) => setFormData({...formData, brideNative: e.target.value})} placeholder="Native Place" className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold text-indigo-950 border border-rose-100 shadow-inner" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-rose-400 tracking-widest px-4">Currently Living In</label>
                    <input value={formData.brideLiving} onChange={(e) => setFormData({...formData, brideLiving: e.target.value})} placeholder="Current Residence" className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold text-indigo-950 border border-rose-100 shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Family Details Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-indigo-50 pb-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Family Management</h3>
                </div>

                {/* Groom's Family */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Groom's Family</label>
                    <button 
                      onClick={() => addFamilyMember('groomFamily')}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.familyDetails.groomFamily.map((member) => (
                      <div key={member.id} className="flex gap-2 items-start bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 animate-fade-in">
                        <div className="flex-1 space-y-2">
                          <input 
                            value={member.name} 
                            placeholder="Name"
                            onChange={(e) => updateFamilyMember('groomFamily', member.id, 'name', e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-indigo-950 outline-none border border-transparent focus:border-indigo-200"
                          />
                          <input 
                            value={member.relation} 
                            placeholder="Relation (e.g. Father)"
                            onChange={(e) => updateFamilyMember('groomFamily', member.id, 'relation', e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl text-[10px] font-medium text-indigo-400 outline-none border border-transparent focus:border-indigo-200"
                          />
                        </div>
                        <button 
                          onClick={() => removeFamilyMember('groomFamily', member.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bride's Family */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Bride's Family</label>
                    <button 
                      onClick={() => addFamilyMember('brideFamily')}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.familyDetails.brideFamily.map((member) => (
                      <div key={member.id} className="flex gap-2 items-start bg-rose-50/50 p-4 rounded-2xl border border-rose-100 animate-fade-in">
                        <div className="flex-1 space-y-2">
                          <input 
                            value={member.name} 
                            placeholder="Name"
                            onChange={(e) => updateFamilyMember('brideFamily', member.id, 'name', e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-indigo-950 outline-none border border-transparent focus:border-rose-200"
                          />
                          <input 
                            value={member.relation} 
                            placeholder="Relation (e.g. Mother)"
                            onChange={(e) => updateFamilyMember('brideFamily', member.id, 'relation', e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl text-[10px] font-medium text-rose-400 outline-none border border-transparent focus:border-rose-200"
                          />
                        </div>
                        <button 
                          onClick={() => removeFamilyMember('brideFamily', member.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-4">Our Story</label>
                <textarea value={formData.story} onChange={(e) => setFormData({...formData, story: e.target.value})} rows={4} className="w-full p-8 bg-white border border-indigo-100 rounded-[2.5rem] text-indigo-950 text-sm leading-relaxed shadow-inner outline-none" />
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-indigo-50 pb-3">
                  <Layout className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Main Visuals</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3 text-center">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">App Logo</label>
                    <div className="relative aspect-square w-24 mx-auto group">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-indigo-50 flex items-center justify-center shadow-lg">
                        {formData.logo ? (
                          <img src={formData.logo} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black text-indigo-200">A&M</span>
                        )}
                      </div>
                      <label className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full text-white">
                        <ImageIcon className="w-6 h-6" />
                        <input type="file" className="hidden" onChange={handleImageUpload('logo')} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3 text-center">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Hero Photo</label>
                    <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white bg-indigo-50 group shadow-lg">
                      <img src={formData.heroImage} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                        <ImageIcon className="w-7 h-7" />
                        <input type="file" className="hidden" onChange={handleImageUpload('heroImage')} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-indigo-50 pb-3">
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Memory Gallery</h3>
                  <label className="p-2 bg-indigo-600 text-white rounded-xl cursor-pointer active:scale-90 transition-all flex items-center gap-2 px-4 py-2 text-[10px] uppercase font-black">
                    <Plus className="w-4 h-4" /> Add Photos
                    <input type="file" multiple className="hidden" onChange={handleGalleryAdd} accept="image/*" />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {formData.gallery.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm group">
                      <img src={img.url} className="w-full h-full object-cover" />
                      <button onClick={() => handleToggleFeatured(idx)} className={`absolute top-1 left-1 p-1 rounded-full ${img.isFeatured ? 'bg-yellow-400 text-white shadow-lg' : 'bg-white/60 text-indigo-400'}`}>
                        <Star className={`w-3 h-3 ${img.isFeatured ? 'fill-white' : ''}`} />
                      </button>
                      <button onClick={() => handleRemoveGalleryImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-indigo-50 shrink-0">
          <button 
            onClick={() => { onSave(formData); onClose(); }} 
            className="w-full py-5 bg-indigo-950 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] transition-all"
          >
            <Save className="w-6 h-6" /> Save All Updates
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeModal;
