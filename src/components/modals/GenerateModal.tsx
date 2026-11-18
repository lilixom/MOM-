import React, { useState, useEffect } from 'react';
import { X, Settings2, Check, AlertTriangle, HelpCircle, RefreshCw, Zap } from 'lucide-react';
import { WorkOrder, KitItem } from '../../types';
import { STATUS_MAP } from '../../mockData';
import { qtyOf, weekdayOf } from '../../utils/timeUtils';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  allDates: string[];
  workOrders: WorkOrder[];
  kitData?: KitItem[];
  kitCheckedDate?: string | null;
  onRunKitCheck?: () => void;
  onConfirmGenerate: (selectedIds: string[], targetDateRangeInfo: string) => void;
}

export const GenerateModal: React.FC<GenerateModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  allDates,
  workOrders,
  kitData = [],
  kitCheckedDate,
  onRunKitCheck,
  onConfirmGenerate,
}) => {
  const sortedDates = [...allDates].sort();
  const defaultStart = selectedDate || (sortedDates.length > 0 ? sortedDates[0] : '2026-08-07');
  const defaultEnd = selectedDate || (sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : '2026-08-07');

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  // Sync date range when modal opens or selectedDate changes
  useEffect(() => {
    if (isOpen) {
      const s = selectedDate || (sortedDates.length > 0 ? sortedDates[0] : '2026-08-07');
      const e = selectedDate || (sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : '2026-08-07');
      setStartDate(s);
      setEndDate(e);
      setErrorMsg(null);
    }
  }, [isOpen, selectedDate]);

  // Filter WOs by date range
  const filteredWOs = workOrders.filter((r) => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });

  const ungeneratedWOs = filteredWOs.filter((r) => !r.generated);

  if (!isOpen) return null;

  // Evaluate Kit Check Status for ungenerated WOs
  const isKitChecked = !!kitCheckedDate;
  // Check if any ungenerated WO has kit shortfall
  const hasKitShortfall = ungeneratedWOs.some((wo) => {
    const kit = kitData.find((k) => k.wo === wo.id);
    return kit ? (kit.missing > 0 || kit.status !== 'normal') : false;
  });

  const doExecuteGenerate = () => {
    const ids = ungeneratedWOs.map((r) => r.id);
    const rangeInfo = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
    onConfirmGenerate(ids, rangeInfo);
    onClose();
  };

  const handleConfirm = () => {
    if (!ungeneratedWOs.length) {
      setErrorMsg('⚠️ 所选日期范围内暂无待生成的排产工单！');
      return;
    }
    setErrorMsg(null);
    // Rule 3: 正常运行且齐套，直接生成
    doExecuteGenerate();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white h-full w-full max-w-2xl md:max-w-3xl shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 px-5 border-b border-gray-200 flex items-center justify-between bg-emerald-50 shrink-0">
          <div className="text-base font-bold text-emerald-900 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-600" />
            <span> 生成制令单</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* 齐套检测规则提示 Banner */}
          <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-start gap-2 shadow-2xs">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-blue-900">规则说明：</span>
              <p className="text-blue-800">按天选择，批量生成制令单。开始日期最小当天，范围默认三天。</p>
              <p className="text-blue-800">制令单生成前，必须检查齐套状态，如果没有运行齐套，提醒齐套运算，齐套状态非正常运行，提示是否强制生成。</p>
              <p className="text-blue-800">制令单生成后，锁定相应工单日排产。</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="font-semibold text-gray-700 shrink-0">排产日期范围:</label>
            <div className="flex items-center gap-1.5">
              <select
                value={startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartDate(newStart);
                  if (endDate && newStart > endDate) {
                    setEndDate(newStart);
                  }
                }}
                className="p-1.5 border border-gray-300 rounded-lg font-semibold text-blue-700 bg-white"
              >
                {allDates.map((d) => (
                  <option key={d} value={d}>
                    {d} 周{weekdayOf(d)}
                  </option>
                ))}
              </select>
              <span className="text-gray-400 font-bold">~</span>
              <select
                value={endDate}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  setEndDate(newEnd);
                  if (startDate && newEnd < startDate) {
                    setStartDate(newEnd);
                  }
                }}
                className="p-1.5 border border-gray-300 rounded-lg font-semibold text-blue-700 bg-white"
              >
                {allDates.map((d) => (
                  <option key={d} value={d}>
                    {d} 周{weekdayOf(d)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-gray-500 ml-auto font-medium">
              共 {filteredWOs.length} 个工单（待生成: <strong className="text-emerald-700 font-bold">{ungeneratedWOs.length}</strong> 个）
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-60">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-100 text-gray-600 sticky top-0">
                <tr>
                  <th className="p-2 border-b">排产日期</th>
                  <th className="p-2 border-b">工单号</th>
                  <th className="p-2 border-b">产线</th>
                  <th className="p-2 border-b">品名</th>
                  <th className="p-2 border-b text-right">排产数量</th>
                  <th className="p-2 border-b">开始-结束</th>
                  <th className="p-2 border-b">齐套状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWOs.length ? (
                  filteredWOs.map((r) => {
                    const q = qtyOf(r.start, r.end, r.hourCap, r.changeover);
                    const kit = kitData.find((k) => k.wo === r.id);

                    return (
                      <tr key={r.id} className={`hover:bg-gray-50 ${r.generated ? 'bg-gray-50/70 opacity-80' : ''}`}>
                        <td className="p-2 font-mono text-gray-600 font-medium whitespace-nowrap">
                          {r.date}
                        </td>
                        <td className="p-2 font-mono font-semibold flex items-center gap-1.5">
                          <span>{r.id}</span>
                          {r.generated && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              已生成
                            </span>
                          )}
                        </td>
                        <td className="p-2">{r.line}</td>
                        <td className="p-2 truncate max-w-[150px]">{r.product}</td>
                        <td className="p-2 text-right font-mono font-bold text-blue-600">
                          {q.toLocaleString()}
                        </td>
                        <td className="p-2">{r.start}→{r.end}</td>
                        <td className="p-2">
                          {kit ? (
                            <div className="flex flex-col gap-0.5">
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    kit.missing === 0 || kit.status === 'normal'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : kit.status === 'lack'
                                      ? 'bg-red-100 text-red-800 border-red-300'
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  {kit.missing === 0 || kit.status === 'normal'
                                    ? '✓ 齐套'
                                    : kit.status === 'lack'
                                    ? '⚠ 缺料'
                                    : '⚡ 备料保存'}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">
                                {kit.missing > 0 ? (
                                  <span className="text-red-600 font-semibold">缺口: {kit.missing.toLocaleString()}</span>
                                ) : (
                                  <span className="text-emerald-700">满足 ({kit.ready.toLocaleString()}/{kit.need.toLocaleString()})</span>
                                )}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                STATUS_MAP[r.status]?.cls || 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {r.status === 'normal'
                                ? '✓ 齐套'
                                : STATUS_MAP[r.status]?.label || '✓ 齐套'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-400">
                      所选日期范围内暂无排产工单
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">下发车间</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white">
                <option>三片车间</option>
                <option>涂印车间</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">优先级</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white">
                <option>普通</option>
                <option>加急</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 transition"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>生成</span>
          </button>
        </div>
      </div>
    </div>
  );
};
