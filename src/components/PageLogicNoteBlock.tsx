import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Edit3, Pin, RotateCcw, X } from 'lucide-react';

interface PageLogicNoteBlockProps {
  pageKey: string;
  defaultNote: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const STORAGE_KEY = 'mom.pageLogicNotes.v1';

function readStoredNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const PageLogicNoteBlock: React.FC<PageLogicNoteBlockProps> = ({
  pageKey,
  defaultNote,
  onShowToast,
}) => {
  const [customNotes, setCustomNotes] = useState<Record<string, string>>(readStoredNotes);
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const hasCustom = Object.prototype.hasOwnProperty.call(customNotes, pageKey);
  const displayNote = hasCustom ? customNotes[pageKey] : defaultNote;

  useEffect(() => {
    setIsEditing(false);
  }, [pageKey]);

  const handleStartEdit = () => {
    setDraft(displayNote);
    setCollapsed(false);
    setIsEditing(true);
  };

  const handleSave = () => {
    const next = { ...customNotes, [pageKey]: draft.trim() || defaultNote };
    setCustomNotes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
    setIsEditing(false);
    onShowToast('本页备注 / 业务逻辑已保存', 'success');
  };

  const handleRestoreDefault = () => {
    const next = { ...customNotes };
    delete next[pageKey];
    setCustomNotes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setDraft(defaultNote);
    setIsEditing(false);
    onShowToast('已恢复默认业务逻辑说明', 'info');
  };

  return (
    <div className="bg-[#FFFBE6] border border-[#F5D06B] rounded-lg px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Pin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span className="text-xs font-bold text-[#92400E] whitespace-nowrap">
            本页备注 / 业务逻辑
          </span>
          {hasCustom && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#FEF3C7] text-[#92400E] border border-[#F5D06B] rounded">
              已自定义
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#92400E] hover:bg-[#FEF3C7] rounded transition cursor-pointer whitespace-nowrap"
            >
              <Edit3 className="w-3 h-3" />
              <span>编辑</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#92400E] hover:bg-[#FEF3C7] rounded transition cursor-pointer whitespace-nowrap"
          >
            <span>{collapsed ? '展开' : '收起'}</span>
            {collapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-2">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="请输入本页备注或业务逻辑说明..."
                className="w-full p-2.5 text-xs text-[#1E293B] bg-white border border-[#F5D06B] rounded-md outline-none focus:border-[#D97706] leading-relaxed"
              />
              <div className="flex flex-wrap items-center justify-end gap-2">
                {hasCustom && (
                  <button
                    type="button"
                    onClick={handleRestoreDefault}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#92400E] bg-white border border-[#F5D06B] rounded hover:bg-[#FEF3C7] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>恢复默认</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#475569] bg-white border border-[#DCE3EE] rounded hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>取消</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-white bg-[#D97706] hover:bg-[#B45309] rounded cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>保存备注</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#78350F] leading-relaxed whitespace-pre-wrap">
              {displayNote || '暂无备注说明，可点击右上角「编辑」补充本页业务逻辑。'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
