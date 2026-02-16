
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Sparkles, Camera, Users, Briefcase, Home, MapPin } from 'lucide-react';
import { WeddingData, TimelineEvent } from '../types';
import GlassCard from './GlassCard';

interface WeddingInfoProps {
  data: WeddingData;
}

const TimelineItem: React.FC<{ event: TimelineEvent; index: number }> = ({ event, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={itemRef}
      className={`flex gap-6 group transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="relative flex flex-col items-center shrink-0 pt-1.5">
        <div className={`w-12 h-12 bg-white rounded-full border border-indigo-50 shadow-lg flex items-center justify-center z-10 group-hover:border-indigo-600 transition-colors duration-500 ${isVisible ? 'scale-100' : 'scale-50 opacity-0'} transition-transform duration-500 delay-300`}>
          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
        </div>
      </div>
      <GlassCard className="flex-1 p-6 rounded-[2rem] border-white/60 group-hover:bg-white/60 transition-all duration-500 hover:shadow-indigo-100/40">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{event.time}</p>
        <h4 className="text-xl font-black text-indigo-950 uppercase tracking-tight mb-2">{event.title}</h4>
        <p className="text-sm text-indigo-600/70 font-medium leading-relaxed">{event.description}</p>
      </GlassCard>
    </div>
  );
};

const PersonalDetail: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex items-center gap-1.5 text-indigo-400">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-[10px] font-bold text-indigo-900 leading-tight">{value}</p>
    </div>
  );
};

const WeddingInfo: React.FC<WeddingInfoProps> = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % data.gallery.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + data.gallery.length) % data.gallery.length);
    }
  };

  return (
    <div className="space-y-16 pb-32 animate-fade-in">
      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-[100] bg-indigo-950/95 backdrop-blur-3xl flex items-center justify-center p-4 transition-all duration-500">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 p-3 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all active:scale-90"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button onClick={prevImage} className="absolute left-4 p-4 text-white/30 hover:text-white transition-colors">
            <ChevronLeft className="w-12 h-12" />
          </button>
          
          <div className="relative group max-w-full max-h-[85vh] flex items-center justify-center">
            <img 
              src={data.gallery[selectedImage].url} 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.3)] border border-white/10 animate-scale-in"
              alt="Gallery view"
            />
          </div>
          
          <button onClick={nextImage} className="absolute right-4 p-4 text-white/30 hover:text-white transition-colors">
            <ChevronRight className="w-12 h-12" />
          </button>
          
          <div className="absolute bottom-10 px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-[0.3em]">
            Memory {selectedImage + 1} / {data.gallery.length}
          </div>
        </div>
      )}

      {/* Couple Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/5 rounded-full border border-indigo-100">
             <Heart className="w-3 h-3 text-indigo-400" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">The Couple</span>
          </div>
          <h2 className="text-4xl font-black text-indigo-950 uppercase tracking-tighter playfair">Meet the Couple</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          {/* Groom Card */}
          <GlassCard className="p-6 flex flex-col items-center gap-6 rounded-[3.5rem] border-white/60 hover:shadow-indigo-200/40 transition-all duration-500 group overflow-hidden">
            <div className="relative w-28 h-28">
               <div className="absolute -inset-3 border border-indigo-400/20 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
               <div className="absolute inset-0 bg-indigo-600/20 rounded-full blur-2xl animate-pulse scale-90 group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl z-10 transition-transform duration-700 group-hover:scale-105">
                  <img src={data.groomImage} alt={data.groomName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="font-black text-indigo-950 text-xl uppercase tracking-tighter leading-none">{data.groomName}</p>
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] bg-indigo-50 px-3 py-1 rounded-full">The Groom</p>
            </div>

            <div className="w-full pt-4 border-t border-indigo-50 flex flex-col gap-4">
              <PersonalDetail icon={<Briefcase className="w-3 h-3" />} label="Profession" value={data.groomJob} />
              <PersonalDetail icon={<Home className="w-3 h-3" />} label="Native" value={data.groomNative} />
              <PersonalDetail icon={<MapPin className="w-3 h-3" />} label="Living" value={data.groomLiving} />
            </div>
          </GlassCard>

          {/* Bride Card */}
          <GlassCard className="p-6 flex flex-col items-center gap-6 rounded-[3.5rem] border-white/60 hover:shadow-indigo-200/40 transition-all duration-500 group overflow-hidden">
            <div className="relative w-28 h-28">
               <div className="absolute -inset-3 border border-sky-400/20 rounded-full animate-[spin_12s_linear_infinite] pointer-events-none"></div>
               <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-2xl animate-pulse scale-90 group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl z-10 transition-transform duration-700 group-hover:scale-105">
                  <img src={data.brideImage} alt={data.brideName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="font-black text-indigo-950 text-xl uppercase tracking-tighter leading-none">{data.brideName}</p>
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] bg-sky-50 px-3 py-1 rounded-full">The Bride</p>
            </div>

            <div className="w-full pt-4 border-t border-indigo-50 flex flex-col gap-4">
              <PersonalDetail icon={<Briefcase className="w-3 h-3" />} label="Profession" value={data.brideJob} />
              <PersonalDetail icon={<Home className="w-3 h-3" />} label="Native" value={data.brideNative} />
              <PersonalDetail icon={<MapPin className="w-3 h-3" />} label="Living" value={data.brideLiving} />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Family Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/5 rounded-full border border-indigo-100">
             <Users className="w-3.5 h-3.5 text-indigo-400" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">The Families</span>
          </div>
          <h2 className="text-4xl font-black text-indigo-950 uppercase tracking-tighter playfair">Our Loved Ones</h2>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-8 rounded-[3rem] border-white/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <Heart className="w-32 h-32 text-indigo-600" fill="currentColor" />
            </div>
            <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tight mb-6 flex items-center gap-3">
              Groom's Family
              <div className="h-px flex-1 bg-gradient-to-r from-indigo-100 to-transparent"></div>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {data.familyDetails.groomFamily.map((member) => (
                <div key={member.id} className="flex justify-between items-center border-b border-indigo-50 pb-3">
                  <p className="text-indigo-950 font-bold uppercase text-sm tracking-tight">{member.name}</p>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{member.relation}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8 rounded-[3rem] border-white/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <Sparkles className="w-32 h-32 text-sky-600" />
            </div>
            <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tight mb-6 flex items-center gap-3">
              Bride's Family
              <div className="h-px flex-1 bg-gradient-to-r from-sky-100 to-transparent"></div>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {data.familyDetails.brideFamily.map((member) => (
                <div key={member.id} className="flex justify-between items-center border-b border-indigo-50 pb-3">
                  <p className="text-indigo-950 font-bold uppercase text-sm tracking-tight">{member.name}</p>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{member.relation}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Bento Gallery Section */}
      <section className="space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 rounded-full border border-white">
             <Camera className="w-3 h-3 text-indigo-400" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Captured Moments</span>
          </div>
          <h2 className="text-4xl font-black text-indigo-950 uppercase tracking-tighter playfair">Gallery</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {data.gallery.map((img, idx) => {
            const isFeatured = img.isFeatured;
            return (
              <div 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-indigo-200/50 transition-all duration-700 cursor-pointer group border border-white/50 ${isFeatured ? 'col-span-2 aspect-[16/10]' : 'col-span-1 aspect-square'}`}
              >
                <img 
                  src={img.url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={`Wedding memory ${idx + 1}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-500">
                   <div className="px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 text-[8px] font-black uppercase text-white tracking-[0.2em]">View Memory</div>
                </div>
                {isFeatured && (
                  <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Story Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-indigo-950 uppercase tracking-tighter playfair">Our Story</h2>
        </div>
        <GlassCard className="p-10 relative overflow-hidden rounded-[3rem] border-white/60">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl"></div>
          <p className="relative z-10 text-indigo-900 leading-[2] font-serif italic text-center text-lg px-2">
            "{data.story}"
          </p>
          <div className="mt-8 flex justify-center">
             <Heart className="w-6 h-6 text-indigo-100" fill="currentColor" />
          </div>
        </GlassCard>
      </section>

      {/* Timeline Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-indigo-950 uppercase tracking-tighter playfair">Schedule</h2>
          <p className="text-indigo-400 font-bold uppercase text-[9px] tracking-[0.3em]">Chronicles of Our Day</p>
        </div>
        
        <div className="space-y-6 relative">
          <div className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-indigo-200 via-indigo-100 to-transparent"></div>
          
          {data.timeline.map((event, idx) => (
            <TimelineItem key={event.id} event={event} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default WeddingInfo;
