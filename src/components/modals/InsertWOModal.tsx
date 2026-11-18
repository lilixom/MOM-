import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { WorkOrder, StatusType } from '../../types';
import { teamOf, WO_MASTER, capByLineMat, INITIAL_CHANGEOVER_DATA, ACTUAL_CO_BY_TYPE } from '../../mockData';
import { qtyOf } from '../../utils/timeUtils';

interface InsertWOModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onConfirmInsert: (wo: WorkOrder) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const InsertWOModal: React.FC<InsertWOModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onConfirmInsert,
  onShowToast,
}) => {
  const [line, setLine] = useState('10500406');
  const [woId, setWoId] = useState('');
  const [shift, setShift] = useState('白班');
  const [product, setProduct] = useState('');
  const [matCode, setMatCode] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('20:30');
  const [isNextDay, setIsNextDay] = useState(false);
  const [hourCap, setHourCap] = useState<number | ''>('');
  const [status, setStatus] = useState<StatusType>('scheduled');
  const [coType, setCoType] = useState('');

  // Auto team
  const team = teamOf(line);

  // Auto product & mat code
  useEffect(() => {
    if (woId && WO_MASTER[woId]) {
      setProduct(WO_MASTER[woId].product);
      setMatCode(WO_MASTER[woId].mat);
    }
  }, [woId]);

  // Auto capacity
  useEffect(() => {
    if (line) {
      setHourCap(capByLineMat(line, matCode));
    }
  }, [line, matCode]);

  if (!isOpen) return null;

  const coRule = INITIAL_CHANGEOVER_DATA.find((x) => x.code === coType);
  const stdCoHours = coRule ? coRule.hoursH : 0;
  const actCoHours = coType ? ACTUAL_CO_BY_TYPE[coType] ?? null : null;
  const coDiffStr =
    actCoHours != null
      ? `${stdCoHours - actCoHours >= 0 ? '节约 ' : '超支 '}${Math.abs(stdCoHours - actCoHours).toFixed(1)}h`
      : '—';

  const handleInsert = () => {
    const finalId = woId.trim() || 'INS' + Date.now();
    const finalProduct = product.trim() || '新增排产产品';
    const finalCap = Number(hourCap) || 40800;
    const endStr = isNextDay ? `${endTime}+1` : endTime;

    const newWO: WorkOrder = {
      id: finalId,
      line,
      team,
      product: finalProduct,
      matCode,
      soNo: '',
      status,
      shift,
      hourCap: finalCap,
      coType,
      coDesc: coRule?.desc || '',
      changeover: stdCoHours,
      changeoverActual: actCoHours,
      otherStop: 1.0,
      start: startTime,
      end: endStr,
      actual: null,
      selected: false,
      generated: false,
      date: selectedDate,
    };

    onConfirmInsert(newWO);
    onClose();

    const outputQty = qtyOf(startTime, endStr, finalCap, stdCoHours);
    onShowToast(
      `新增排产成功：${finalId}（${team}线 ${selectedDate} ${startTime}→${endStr}，排产 ${outputQty.toLocaleString()} 件）`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white h-full w-full max-w-lg md:max-w-xl shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 px-5 border-b border-gray-200 flex items-center justify-between bg-amber-50 shrink-0">
          <div className="text-base font-bold text-amber-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-600" />
            <span>新增排产订单</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-amber-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">车间线别</label>
              <input
                type="text"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                placeholder="如 10500406"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">班组（自动带出）</label>
              <input
                type="text"
                readOnly
                value={`${team}（${line}）`}
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-gray-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">工单号</label>
              <input
                type="text"
                value={woId}
                onChange={(e) => setWoId(e.target.value)}
                placeholder="输入工单号自动联想"
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">班次</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
              >
                <option value="白班">白班</option>
                <option value="夜班">夜班</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-gray-600 font-semibold mb-1">品名</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="输入工单号自动带出产品名称"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">料号 (自动带出)</label>
              <input
                type="text"
                readOnly
                value={matCode}
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 font-mono text-xs text-gray-700"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">小时产能 (件/h)</label>
              <input
                type="number"
                value={hourCap}
                onChange={(e) => setHourCap(e.target.value ? Number(e.target.value) : '')}
                placeholder="自动带出"
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-xs font-semibold text-blue-600"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">开始时间</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">结束时间</label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-xs"
                />
                <label className="flex items-center gap-1 text-xs shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNextDay}
                    onChange={(e) => setIsNextDay(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>跨天(+1)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white cursor-pointer"
              >
                <option value="scheduled">已排产</option>
                <option value="kitted">已齐套</option>
                <option value="locked">已锁定</option>
                <option value="produced">已生产</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">换型类型</label>
              <select
                value={coType}
                onChange={(e) => setCoType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
              >
                <option value="">— 不换型 —</option>
                {INITIAL_CHANGEOVER_DATA.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.desc}（{r.hoursH}h）
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">标准换型工时 (h)</label>
              <input
                type="text"
                readOnly
                value={stdCoHours ? `${stdCoHours} h` : '—'}
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700"
              />
            </div>

          </div>

          <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg leading-relaxed">
            排产数量 = <b>(结束时间 − 开始时间 − 换型工时) × 小时产能</b>；班组/品名/料号/小时产能等均可智能联想带出。
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
            onClick={handleInsert}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>确认新增排产</span>
          </button>
        </div>
      </div>
    </div>
  );
};
