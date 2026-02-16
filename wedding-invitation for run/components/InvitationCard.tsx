
import React, { useState, useRef } from 'react';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { WeddingData } from '../types';

interface InvitationCardProps {
  data: WeddingData;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ data }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    setIsHovered(true);
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = (y - centerY) / 12; 
    const rotY = (centerX - x) / 12;
    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Defensive Date Formatting
  const weddingDateObj = new Date(data.date);
  const isValidDate = !isNaN(weddingDateObj.getTime());
  const displayDate = isValidDate 
    ? weddingDateObj.toLocaleDateString(undefined, { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : "Coming Soon";

  const getHeroAnimClass = () => {
    switch (data.theme.heroAnimation) {
      case 'zoom': return isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-90';
      case 'float': return 'animate-float-slow opacity-100';
      case 'ken-burns': return 'animate-ken-burns opacity-100';
      case 'shimmer': return 'opacity-90';
      default: return 'scale-100 opacity-90';
    }
  };

  return (
    <div 
      className="perspective-1000 w-full max-w-sm mx-auto p-4 animate-scale-in"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d'
        }}
        className={`relative aspect-[3/4] bg-white rounded-[3rem] overflow-hidden border border-white/40 ring-1 ring-indigo-100/50 transition-shadow duration-500 ${
          isHovered ? 'shadow-[0_40px_80px_-15px_rgba(99,102,241,0.3)]' : 'shadow-2xl'
        }`}
      >
        {/* Background Layer */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={data.heroImage} 
            alt="Wedding Couple"
            className={`w-full h-full object-cover transition-all duration-1000 ${getHeroAnimClass()}`}
          />
          
          {data.theme.heroAnimation === 'shimmer' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
        </div>

        {/* Content Layer */}
        <div 
          className="relative h-full flex flex-col justify-end p-10 text-center space-y-6" 
          style={{ 
            transform: `translateZ(${isHovered ? '70px' : '40px'})`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          <div className={`mx-auto w-16 h-16 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg border border-white transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <Heart 
              className="w-8 h-8 animate-pulse" 
              style={{ color: data.theme.primaryColor }}
              fill="currentColor" 
            />
          </div>
          
          <div className="space-y-2">
            <h1 
              className="text-4xl font-black leading-tight uppercase tracking-tighter playfair"
              style={{ color: data.theme.primaryColor }}
            >
              {data.groomName} <br/> 
              <span style={{ color: data.theme.accentColor }} className="font-serif italic text-2xl lowercase tracking-normal">&</span> <br/> 
              {data.brideName}
            </h1>
          </div>

          <div className="space-y-3 pt-2">
            <div 
              className="flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-[0.2em]"
              style={{ color: data.theme.primaryColor }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{displayDate}</span>
            </div>
            <div 
              className="flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-[0.2em]"
              style={{ color: data.theme.accentColor }}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{data.venueName}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-indigo-50/50">
            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.4em]">Save our Date</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        @keyframes ken-burns {
          0% { transform: scale(1.2) translate(-2%, -2%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-ken-burns { animation: ken-burns 20s ease-in-out infinite alternate; }
        .animate-shimmer { animation: shimmer 4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

export default InvitationCard;
