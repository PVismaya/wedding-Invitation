
import React from 'react';
import { Home, Info, MapPin, Mic } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onMicClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onMicClick }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'info', icon: Info, label: 'Details' },
    { id: 'venue', icon: MapPin, label: 'Venue' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-full px-6 py-4 flex items-center justify-between shadow-2xl shadow-indigo-950/10">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center transition-all duration-300 relative ${isActive ? 'text-indigo-600 scale-110' : 'text-indigo-300'}`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-black uppercase mt-1 tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
              {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full"></div>}
            </button>
          );
        })}

        <div className="relative px-2">
          <button 
            onClick={onMicClick}
            className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 active:scale-90 transition-transform hover:shadow-indigo-600/40"
          >
            <Mic className="w-8 h-8" />
          </button>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full border-2 border-white animate-pulse"></div>
        </div>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center transition-all duration-300 relative ${isActive ? 'text-indigo-600 scale-110' : 'text-indigo-300'}`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-black uppercase mt-1 tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
              {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
