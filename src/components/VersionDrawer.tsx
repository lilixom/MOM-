import React from 'react';
import { X, Check } from 'lucide-react';
import { VersionInfo } from '../types';

interface VersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: VersionInfo[];
  currentVersion: string;
  onSelectVersion: (tag: string) => void;
}

export const VersionDrawer: React.FC<VersionDrawerProps> = ({
  isOpen,
  onClose,
  versions,
  currentVersion,
  onSelectVersion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-[#FDFBF7] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-[#E8E4D9]">
        <div className="p-4 border-b border-[#E8E4D9] flex items-center justify-between bg-[#FCFAF7]">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#4A4E44]">🕐 版本控制中心</span>
            <span className="text-xs bg-[#E8EAE3] text-[#5A634D] font-semibold px-2.5 py-0.5 rounded-full">
              {currentVersion}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#F0EEE6] text-[#9DA391] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {versions.map((v) => {
            const isActive = v.tag === currentVersion;
            return (
              <div
                key={v.tag}
                onClick={() => onSelectVersion(v.tag)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                  isActive
                    ? 'border-[#7D8471] bg-[#E8EAE3] shadow-xs'
                    : 'border-[#E8E4D9] bg-white hover:border-[#7D8471] hover:bg-[#FCFAF7]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#5A634D] flex items-center gap-1.5">
                    {v.tag}
                    {isActive && (
                      <span className="bg-[#7D8471] text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[#9DA391] font-mono">{v.date}</span>
                </div>
                <div className="text-xs font-semibold text-[#4A4E44] mb-2">{v.desc}</div>
                <ul className="space-y-1 text-xs text-[#5A634D]">
                  {v.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-1 leading-snug">
                      <span className="font-bold text-[#7D8471] shrink-0">+</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
