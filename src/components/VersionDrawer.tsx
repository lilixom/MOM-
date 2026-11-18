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
      <div className="relative w-full max-w-sm bg-[#F8FAFC] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-[#E5E9F0]">
        <div className="p-4 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#1E293B]">🕐 版本控制中心</span>
            <span className="text-xs bg-[#EBF2FF] text-[#1E40AF] font-semibold px-2.5 py-0.5 rounded-full">
              {currentVersion}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#EDF2F7] text-[#64748B] transition"
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
                    ? 'border-[#2563EB] bg-[#EBF2FF] shadow-xs'
                    : 'border-[#E5E9F0] bg-white hover:border-[#2563EB] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#1E40AF] flex items-center gap-1.5">
                    {v.tag}
                    {isActive && (
                      <span className="bg-[#2563EB] text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">{v.date}</span>
                </div>
                <div className="text-xs font-semibold text-[#1E293B] mb-2">{v.desc}</div>
                <ul className="space-y-1 text-xs text-[#1E40AF]">
                  {v.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-1 leading-snug">
                      <span className="font-bold text-[#2563EB] shrink-0">+</span>
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
