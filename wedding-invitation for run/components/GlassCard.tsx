
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-lg shadow-indigo-100/20 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
