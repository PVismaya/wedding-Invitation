
import React from 'react';

interface LogoProps {
  src?: string;
  className?: string;
  title?: string;
}

const Logo: React.FC<LogoProps> = ({ src, className, title = "A&M" }) => {
  // Ensure title is a clean monogram string
  const monogram = title.replace(/\s+/g, '');

  if (src) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-lg shrink-0 ${className}`}>
        <img src={src} alt="Wedding Logo" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center bg-white/40 backdrop-blur-xl rounded-full border border-white/50 shadow-sm shrink-0 ${className} aspect-square`}>
      {/* Decorative Rotating Ring */}
      <svg
        width="140%"
        height="140%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute animate-[spin_40s_linear_infinite] opacity-25 pointer-events-none"
      >
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="text-indigo-400" />
      </svg>
      
      {/* Monogram Text - Centered perfectly using flex */}
      <div className="relative z-10 font-serif font-black text-indigo-950 italic flex items-center justify-center leading-none text-center select-none" style={{ fontSize: 'min(18px, 40%)' }}>
        {monogram}
      </div>
    </div>
  );
};

export default Logo;
