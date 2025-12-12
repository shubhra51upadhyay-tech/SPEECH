import React from 'react';
import { VoicePreset } from '../types';

interface VoiceCardProps {
  preset: VoicePreset;
  isSelected: boolean;
  onClick: () => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ preset, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-start p-4 rounded-xl border transition-all duration-300 w-full text-left
        ${isSelected 
          ? 'bg-brand-900/30 border-brand-500 ring-1 ring-brand-500 shadow-lg shadow-brand-500/20' 
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500'
        }
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-full ${preset.iconColor} flex items-center justify-center shadow-lg`}>
          <span className="text-white text-xs font-bold">
            {preset.name.charAt(0)}
          </span>
        </div>
        <h3 className="font-semibold text-slate-100">{preset.name}</h3>
      </div>
      <p className="text-xs text-slate-400 font-light leading-relaxed">
        {preset.description}
      </p>
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
      )}
    </button>
  );
};

export default VoiceCard;
