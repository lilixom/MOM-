import React, { useState, useEffect } from 'react';
import { X, Clock, Wrench, Plus, Trash2, CheckCircle, AlertCircle, Coffee, PauseCircle, PlayCircle, Sparkles, XCircle, Calendar } from 'lucide-react';
import { TimeSlotMaintenanceRule } from '../../types';
import { FACTORY_LINES } from '../../mockData';

interface TimeSlotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: 'slot' | 'operation';
  onChangeCategory?: (cat: 'slot' | 'operation') => void;
  selectedDate: string;
  rules: TimeSlotMaintenanceRule[];
  onAddRule: (rule: TimeSlotMaintenanceRule) => void;
  onDeleteRule: (id: string) => void;
  onSetDefaultRule?: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const TimeSlotDrawer: React.FC<TimeSlotDrawerProps> = ({
  isOpen,
  onClose,
  selectedDate,
  rules,
  onAddRule,
  onDeleteRule,
  onSetDefaultRule,
  onShowToast,
}) => {
  const defaultDate = selectedDate || '2026-08-07';

  // Form State - startDateTime and endDateTime in format "YYYY-MM-DD HH:mm:ss"
  const [line, setLine] = useState('全部产线');
  const [startDateTime, setStartDateTime] = useState(`${defaultDate} 08:30:00`);
  const [endDateTime, setEndDateTime] = useState(`${defaultDate} 09:30:00`);
  const [type, setType] = useState<'rest' | 'maint' | 'work'>('rest');
  const [notes, setNotes] = useState('08:30-09:30 班前例会与半小时休息点检');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setStartDateTime(`${selectedDate} 08:30:00`);
      setEndDateTime(`${selectedDate} 09:30:00`);
    }
  }, [selectedDate]);

  if (!isOpen) return null;

  // Calculate duration in minutes
  const calcDurationMinutes = (sDT: string, eDT: string) => {
    const sFormatted = sDT.trim().replace(' ', 'T');
    const eFormatted = eDT.trim().replace(' ', 'T');
    const d1 = new Date(sFormatted);
    const d2 = new Date(eFormatted);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
      const diffMs = d2.getTime() - d1.getTime();
      return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }
    const sTime = sDT.includes(' ') ? sDT.split(' ')[1] : sDT;
    const eTime = eDT.includes(' ') ? eDT.split(' ')[1] : eDT;
    if (sTime && eTime) {
      const [sh, sm] = sTime.split(':').map(Number);
      const [eh, em] = eTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff <= 0) diff += 24 * 60;
        return diff;
      }
    }
    return 60;
  };

  const currentDuration = calcDurationMinutes(startDateTime, endDateTime);

  const handleQuickPreset = (s: string, e: string, defaultType?: 'rest' | 'maint' | 'work', defaultNotes?: string) => {
    const currentDate = startDateTime.split(' ')[0] || defaultDate;
    setStartDateTime(`${currentDate} ${s}:00`);
    setEndDateTime(`${currentDate} ${e}:00`);
    if (defaultType) setType(defaultType);
    if (defaultNotes) setNotes(defaultNotes);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = startDateTime.split(' ')[0] || defaultDate;
    const startTime = (startDateTime.split(' ')[1] || '08:30').slice(0, 5);
    const endTime = (endDateTime.split(' ')[1] || '09:30').slice(0, 5);

    const durationMinutes = calcDurationMinutes(startDateTime, endDateTime);
    if (durationMinutes <= 0) {
      onShowToast('⚠️ 请检查输入的时段范围（结束时间需大于开始时间）', 'warning');
      return;
    }

    const newRule: TimeSlotMaintenanceRule = {
      id: `TS${Date.now().toString().slice(-4)}`,
      line,
      date: startDate,
      startTime,
      endTime,
      durationMinutes,
      type,
      notes: notes.trim() || '无备注',
      category: 'slot',
      isDefault,
    };

    if (isDefault && onSetDefaultRule) {
      // If adding as default, onAddRule will add it and then we set it as default
      onAddRule(newRule);
      onSetDefaultRule(newRule.id);
    } else {
      onAddRule(newRule);
    }
    const typeLabel = type === 'rest' ? '休息' : type === 'maint' ? '停机' : '正常/作业';
    onShowToast(`✅ 已新增时段维护记录：${startDate} ${startTime}-${endTime}（${durationMinutes}分钟） [${typeLabel}]`, 'success');
  };

  // Filter slot rules
  const currentCategoryRules = rules.filter((r) => r.category === 'slot' || !r.category);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Right Drawer Container */}
      <div className="relative w-full max-w-md bg-[#F8FAFC] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-[#E5E9F0]">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E9F0] bg-[#FFFFFF] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#EBF2FF] text-[#1E40AF]">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">
                  ⏱️ 作息时段
                </h3>
                <p className="text-xs text-[#64748B]">
                  配置并控制各产线排产时段范围（工作日 8:30 - 次日 8:30）
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#EDF2F7] text-[#64748B] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Form Card */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-2xs space-y-3.5"
          >
            <div className="text-xs font-bold text-[#1E40AF] flex items-center justify-between pb-2 border-b border-[#EDF2F7]">
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>新增时段范围配置</span>
              </span>
              <span className="text-[10px] text-[#64748B] font-mono">
                当前: {currentDuration}分钟 ({currentDuration === 30 ? '半小时' : currentDuration === 60 ? '1小时' : `${(currentDuration/60).toFixed(1)}小时`})
              </span>
            </div>

            {/* Scope / Line */}
            <div>
              <label className="text-[#64748B] font-medium block mb-1 text-xs">适用产线</label>
              <select
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="w-full p-2 border border-[#E5E9F0] rounded-xl text-[#1E293B] bg-[#FFFFFF] text-xs"
              >
                <option value="全部产线">全部产线</option>
                {FACTORY_LINES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot Range Section (Merged with Date, styled matching image) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#64748B] font-medium text-xs">
                  维护时段范围 <span className="text-[10px] text-[#2563EB] font-normal">（含适用日期与时间）</span>
                </label>
                <span className="text-[11px] font-bold text-[#2563EB]">
                  {currentDuration}分钟 ({currentDuration < 60 ? `${currentDuration}分钟` : `${(currentDuration/60).toFixed(1)}小时`})
                </span>
              </div>

              {/* Exact Range Control box matching user image */}
              <div className="border border-sky-400 hover:border-sky-500 rounded-lg px-2.5 py-1.5 bg-white flex items-center justify-between gap-2 shadow-2xs focus-within:ring-2 focus-within:ring-sky-200 transition">
                <input
                  type="text"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  className="w-full text-center font-mono text-xs text-[#1E293B] bg-transparent outline-none focus:bg-sky-50/50 rounded py-0.5"
                />
                <span className="text-[#64748B] font-serif text-sm font-bold shrink-0 select-none">→</span>
                <input
                  type="text"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  className="w-full text-center font-mono text-xs text-[#1E293B] bg-transparent outline-none focus:bg-sky-50/50 rounded py-0.5"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStartDateTime(`${defaultDate} 08:30:00`);
                    setEndDateTime(`${defaultDate} 09:30:00`);
                  }}
                  className="p-1 text-gray-300 hover:text-gray-500 rounded-full transition shrink-0"
                  title="重置"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets Chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                <span className="text-[#64748B] shrink-0 text-[10px]">快捷预设:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('08:30', '09:00', 'rest', '08:30-09:00 半小时早班例会')}
                  className="px-2 py-0.5 bg-[#EBF2FF] text-[#1E40AF] hover:bg-[#2563EB] hover:text-white rounded-lg transition"
                >
                  8:30-9:00 (半小时)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('08:30', '09:30', 'rest', '08:30-09:30 1小时例会与休息')}
                  className="px-2 py-0.5 bg-[#EBF2FF] text-[#1E40AF] hover:bg-[#2563EB] hover:text-white rounded-lg transition font-semibold"
                >
                  8:30-9:30 (1小时)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('12:00', '12:30', 'rest', '12:00-12:30 午餐休息')}
                  className="px-2 py-0.5 bg-[#EBF2FF] text-[#1E40AF] hover:bg-[#2563EB] hover:text-white rounded-lg transition"
                >
                  12:00-12:30 (半小时)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('14:00', '14:30', 'maint', '14:00-14:30 半小时设备停机保养')}
                  className="px-2 py-0.5 bg-[#EA580C]/10 text-[#EA580C] hover:bg-[#EA580C] hover:text-white rounded-lg transition"
                >
                  14:00-14:30 停机
                </button>
              </div>
            </div>

            {/* Type Selection (休息 + 停机 + 正常) */}
            <div>
              <label className="text-[#64748B] font-medium text-xs block mb-1">
                维护类型 (包括 休息 / 停机)
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setType('rest')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1 font-medium transition ${
                    type === 'rest'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs font-semibold'
                      : 'bg-white text-[#1E40AF] border-[#E5E9F0] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>休息</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('maint')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1 font-medium transition ${
                    type === 'maint'
                      ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-2xs font-semibold'
                      : 'bg-white text-[#1E40AF] border-[#E5E9F0] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>停机</span>
                </button>
              </div>
            </div>

            {/* Notes Input & Default Checkbox */}
            <div>
              <label className="text-[#64748B] font-medium text-xs block mb-1">备注说明</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="请输入该时段维护的说明或控制原因..."
                className="w-full p-2 border border-[#E5E9F0] rounded-xl text-[#1E293B] bg-[#FFFFFF] text-xs resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="isDefaultSlot"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-[#E5E9F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
              />
              <label htmlFor="isDefaultSlot" className="text-xs text-[#1E293B] font-medium cursor-pointer flex items-center gap-1 select-none">
                <span>设为默认</span>
                <span className="text-[10px] text-[#64748B] font-normal">(全表中仅保留一个默认)</span>
              </label>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#165DFF] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>保存</span>
            </button>
          </form>

          {/* Configured Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1E293B] px-1">
              <span>📋 已配置的时段列表 ({currentCategoryRules.length})</span>
              <span className="text-[11px] text-[#64748B] font-normal">可随时删除或重新添加</span>
            </div>

            {currentCategoryRules.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#E5E9F0] text-xs text-[#64748B] space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-[#64748B]" />
                <p>暂无时段维护配置</p>
                <p className="text-[11px]">上方填表即可快速增加 8:30-9:30 (半小时/1小时) 的休息/停机设置</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentCategoryRules.map((rule) => {
                  const isRest = rule.type === 'rest';
                  const isMaint = rule.type === 'maint';
                  return (
                    <div
                      key={rule.id}
                      className="p-3 bg-white border border-[#E5E9F0] rounded-2xl shadow-2xs hover:border-[#2563EB] transition flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isRest
                                ? 'bg-[#EBF2FF] text-[#1E40AF]'
                                : isMaint
                                ? 'bg-[#EA580C]/15 text-[#EA580C]'
                                : 'bg-[#165DFF] text-white'
                            }`}
                          >
                            {isRest ? '☕ 休息' : isMaint ? '🛑 停机' : '⚙️ 作业'}
                          </span>
                          <span className="font-bold text-[#1E293B] font-mono">
                            {rule.startTime} - {rule.endTime}
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            ({rule.durationMinutes}分钟)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {rule.isDefault ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] shrink-0">
                              ★ 默认
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSetDefaultRule && onSetDefaultRule(rule.id)}
                              className="text-[10px] text-[#64748B] hover:text-[#1E40AF] hover:bg-[#EBF2FF] px-2 py-0.5 rounded-md transition border border-[#E5E9F0] shrink-0 cursor-pointer"
                              title="点击设为唯一默认"
                            >
                              设为默认
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onDeleteRule(rule.id);
                              onShowToast(`🗑️ 已移除 ${rule.startTime}-${rule.endTime} 维护配置`, 'info');
                            }}
                            className="p-1 rounded-lg text-[#64748B] hover:text-[#EA580C] hover:bg-[#EA580C]/10 transition"
                            title="删除配置"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {rule.operationName && (
                        <div className="text-xs font-bold text-[#1E40AF] flex items-center gap-1">
                          <span>作业: {rule.operationName}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#1E40AF]">
                        <span className="text-[11px] bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-[#E5E9F0]">
                          {rule.line} · {rule.date}
                        </span>
                        <span className="text-[11px] text-[#64748B] truncate max-w-[180px]">
                          备注: {rule.notes}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#1E40AF]">
          <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
            <CheckCircle className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>自动应用于排产及日历计算</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-[#E5E9F0] rounded-xl font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
