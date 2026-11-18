import React, { useState, useMemo } from 'react';
import {
  X,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  Box,
  Check,
} from 'lucide-react';
import { WorkOrder, KitItem, KitComponent } from '../../types';
import { qtyOf } from '../../utils/timeUtils';

interface BatchKitCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  queryStartDate: string;
  queryEndDate: string;
  allDates: string[];
  workOrders: WorkOrder[];
  kitData: KitItem[];
  packEdits: Record<string, number[]>;
  onRunBatchKitCheck: (dateRangeInfo: string, orderCount: number, okCount: number, shortCount: number) => void;
}

export const BatchKitCheckModal: React.FC<BatchKitCheckModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  queryStartDate,
  queryEndDate,
  allDates,
  workOrders,
  kitData,
  packEdits,
  onRunBatchKitCheck,
}) => {
  const [filterMode, setFilterMode] = useState<'single' | 'range'>('single');
  const [targetDate, setTargetDate] = useState<string>(selectedDate || (allDates[0] || '2026-08-07'));
  const [startDate, setStartDate] = useState<string>(queryStartDate || selectedDate || '2026-08-07');
  const [endDate, setEndDate] = useState<string>(queryEndDate || selectedDate || '2026-08-20');
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState(false);

  // Reset when opened
  React.useEffect(() => {
    if (isOpen) {
      setTargetDate(selectedDate || (allDates[0] || '2026-08-07'));
      setStartDate(queryStartDate || selectedDate || '2026-08-07');
      setEndDate(queryEndDate || selectedDate || '2026-08-20');
      setSelectedWOId(null);
      setCalcSuccess(false);
    }
  }, [isOpen, selectedDate, queryStartDate, queryEndDate, allDates]);

  // Filter WOs based on date selection
  const relevantWOs = useMemo(() => {
    return workOrders.filter((wo) => {
      if (filterMode === 'single') {
        return wo.date === targetDate;
      }
      return wo.date >= startDate && wo.date <= endDate;
    });
  }, [workOrders, filterMode, targetDate, startDate, endDate]);

  // Compute BOM components for a given work order
  const getBOM = (wo: WorkOrder): KitComponent[] => {
    const base = kitData.find((k) => k.wo === wo.id);
    const q = wo.planQty || qtyOf(wo.start, wo.end, wo.hourCap, wo.changeover);
    const need = base?.need || q;

    const baseComps = base
      ? base.items.map((it) => {
          const wh = Math.round(it.r * 0.65);
          const transit = it.r - wh;
          return { name: it.m, q: it.q, r: it.r, wh, transit };
        })
      : [
          { name: '罐身', q: need, r: need, wh: need, transit: 0 },
          { name: '底盖', q: need, r: need, wh: need, transit: 0 },
          { name: '彩印/外箱', q: need, r: need, wh: need, transit: 0 },
        ];

    const edits = packEdits[wo.id];
    return baseComps.map((c, i) => {
      const wh = edits && edits[i] != null ? edits[i] : c.wh;
      return { name: c.name, q: c.q, r: wh + c.transit, wh, transit: c.transit };
    });
  };

  // Pre-calculate kit check results for each work order
  const woResults = useMemo(() => {
    return relevantWOs.map((wo) => {
      const q = wo.planQty || qtyOf(wo.start, wo.end, wo.hourCap, wo.changeover);
      const comps = getBOM(wo);
      const rows = comps.map((c) => {
        const req = Math.round(q * (c.q / (q || 1)));
        const avail = c.wh + c.transit;
        const ok = avail >= req - 1e-6;
        const gap = ok ? 0 : req - avail;
        return { name: c.name, req, wh: c.wh, transit: c.transit, avail, ok, gap };
      });
      const allOk = rows.every((r) => r.ok);
      const shortCount = rows.filter((r) => !r.ok).length;
      return {
        wo,
        q,
        comps: rows,
        allOk,
        shortCount,
      };
    });
  }, [relevantWOs, kitData, packEdits]);

  const totalOrders = woResults.length;
  const okOrders = woResults.filter((r) => r.allOk).length;
  const shortOrders = woResults.filter((r) => !r.allOk).length;
  const totalQty = woResults.reduce((s, r) => s + r.q, 0);

  // Active WO for side details
  const activeResult = woResults.find((r) => r.wo.id === selectedWOId) || woResults[0] || null;

  if (!isOpen) return null;

  const handleExecuteBatchCheck = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setCalcSuccess(true);
      const rangeDesc = filterMode === 'single' ? targetDate : `${startDate} ~ ${endDate}`;
      onRunBatchKitCheck(rangeDesc, totalOrders, okOrders, shortOrders);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white h-full w-full max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-2xl border-l border-[#E5E9F0] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E5E9F0] flex items-center justify-between bg-teal-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-teal-950 flex items-center gap-2">
                <span>批量齐套运算</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-medium">
                  右侧抽屉
                </span>
              </h2>
              <p className="text-xs text-teal-800/80">
                按日期范围自动运算工单 BOM 需求与仓库在途库存，生成齐套状态
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-teal-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Filter & Control Bar */}
        <div className="p-4 border-b border-[#E5E9F0] bg-[#FFFFFF] space-y-3 shrink-0 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1E293B]">运算范围：</span>
              <div className="inline-flex border border-[#E5E9F0] rounded-xl overflow-hidden bg-white p-0.5">
                <button
                  onClick={() => setFilterMode('single')}
                  className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                    filterMode === 'single'
                      ? 'bg-teal-600 text-white font-medium shadow-2xs'
                      : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
                  }`}
                >
                  按指定单日
                </button>
                <button
                  onClick={() => setFilterMode('range')}
                  className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                    filterMode === 'range'
                      ? 'bg-teal-600 text-white font-medium shadow-2xs'
                      : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
                  }`}
                >
                  按日期区间
                </button>
              </div>
            </div>

            {filterMode === 'single' ? (
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">选择排产日期:</span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] font-mono text-xs focus:ring-1 focus:ring-teal-600"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">日期区间:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] font-mono text-xs focus:ring-1 focus:ring-teal-600"
                />
                <span className="text-[#64748B]">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] font-mono text-xs focus:ring-1 focus:ring-teal-600"
                />
              </div>
            )}

            <button
              onClick={handleExecuteBatchCheck}
              disabled={isCalculating || totalOrders === 0}
              className="px-4 py-1.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>正在运算中...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  <span>一键运行批量齐套运算</span>
                </>
              )}
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-[#E5E9F0] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#64748B]">待运算工单</div>
                <div className="text-base font-bold text-[#1E293B] font-mono">{totalOrders} <span className="text-[11px] font-normal text-[#64748B]">张</span></div>
              </div>
              <Layers className="w-4 h-4 text-teal-600 opacity-60" />
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E5E9F0] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#64748B]">排产总量</div>
                <div className="text-base font-bold text-blue-700 font-mono">{totalQty.toLocaleString()} <span className="text-[11px] font-normal text-[#64748B]">件</span></div>
              </div>
              <Box className="w-4 h-4 text-blue-600 opacity-60" />
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-700">完全齐套</div>
                <div className="text-base font-bold text-emerald-700 font-mono">{okOrders} <span className="text-[11px] font-normal text-emerald-600">张</span></div>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 bg-amber-50/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-amber-700">存在缺料</div>
                <div className="text-base font-bold text-amber-700 font-mono">{shortOrders} <span className="text-[11px] font-normal text-amber-600">张</span></div>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Content Body: Work Order List & Component Breakdown */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 text-xs">
          {/* Left Column: Work Orders List */}
          <div className="md:col-span-6 border-r border-[#E5E9F0] overflow-y-auto p-3 space-y-2 bg-white">
            <div className="text-xs font-bold text-[#1E293B] px-1 flex items-center justify-between">
              <span>📋 工单齐套状态清单 ({totalOrders})</span>
              <span className="text-[10px] font-normal text-[#64748B]">点击可查看右侧组件明细</span>
            </div>

            {totalOrders === 0 ? (
              <div className="text-center py-12 text-[#64748B] space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-[#64748B]/50" />
                <p>所选日期范围内暂无排产工单</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {woResults.map((item) => {
                  const isSelected = activeResult?.wo.id === item.wo.id;
                  return (
                    <div
                      key={item.wo.id}
                      onClick={() => setSelectedWOId(item.wo.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 shadow-2xs ring-1 ring-teal-600'
                          : 'border-[#E5E9F0] bg-white hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D3325] font-mono">{item.wo.id}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#EBF2FF] text-[#1E40AF]">
                            {item.wo.team}线
                          </span>
                          <span className="text-[10px] text-[#64748B] font-mono">{item.wo.date}</span>
                        </div>
                        <div className="text-[11px] text-[#1E293B] truncate">{item.wo.product}</div>
                        <div className="text-[10px] text-[#64748B] flex items-center gap-2">
                          <span>排产: <b className="text-blue-700 font-mono">{item.q.toLocaleString()}</b> 件</span>
                          <span>时段: {item.wo.start} ~ {item.wo.end}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {item.allOk ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> 齐套
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> 缺 {item.shortCount} 项
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-teal-600' : 'text-[#64748B]'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Work Order BOM Component Details */}
          <div className="md:col-span-6 overflow-y-auto p-4 bg-[#FFFFFF] space-y-3">
            {activeResult ? (
              <>
                <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-2.5">
                  <div>
                    <div className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
                      <span>工单组件运算明细:</span>
                      <span className="font-mono text-teal-700">{activeResult.wo.id}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate max-w-xs">
                      {activeResult.wo.product}
                    </div>
                  </div>
                  <div>
                    {activeResult.allOk ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />✓ 完全齐套
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />⚠ 缺料 ({activeResult.shortCount}项)
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E5E9F0] bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FFFFFF] text-[#1E40AF] border-b border-[#E5E9F0]">
                      <tr>
                        <th className="p-2 font-semibold">物料组件</th>
                        <th className="p-2 text-right font-semibold">需求数</th>
                        <th className="p-2 text-right font-semibold">仓库</th>
                        <th className="p-2 text-right font-semibold">在途</th>
                        <th className="p-2 text-right font-semibold">可用合计</th>
                        <th className="p-2 text-center font-semibold">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF2F7]">
                      {activeResult.comps.map((c, idx) => (
                        <tr key={idx} className={c.ok ? 'hover:bg-gray-50' : 'bg-amber-50/60'}>
                          <td className="p-2 font-medium text-[#1E293B]">{c.name}</td>
                          <td className="p-2 text-right font-mono text-[#2D3325]">{c.req.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono text-[#1E40AF]">{c.wh.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono text-[#1E40AF]">{c.transit.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono font-bold text-[#2D3325]">{c.avail.toLocaleString()}</td>
                          <td className="p-2 text-center">
                            {c.ok ? (
                              <span className="text-emerald-700 font-bold">✓ 齐套</span>
                            ) : (
                              <span className="text-amber-700 font-bold">缺 {c.gap.toLocaleString()}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-[11px] text-teal-900 leading-relaxed space-y-1">
                 
                 <div className="font-semibold text-teal-950 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>齐套运算流程：</span>
                  </div>
                  <p>1、查询需要齐套排产工单</p>
                  <p>2、根据查询结果调整工单优先级</p>
                  <p>3、所有排产工单一次性齐套</p>
                  <div className="font-semibold text-teal-950 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>齐套运算规则：</span>
                  </div>
                  <p>1、可用合计 = 仓库现存量 + 在途数量。</p>
                  <p>2、工单需求量 = 排产数量 × BOM用量；</p>
                  <p>3、当可用合计 ≥ 工单需求量时判定为「齐套」，否则提示缺料差异。</p>
                  <p>4、在途数量需要同步SAP厂内调拨数据，收货工厂（目前中山） + 未交付， 发货工厂 + 发货时间 +  物料数量 。</p>
                  <p>5、系统要配置 发货工厂、收货工厂 运输时间。（增加已维护界面）</p>
                  <p>6、到货日期=运输时间 + 发货时间</p>
                  <p>7、排产工单齐套计算只对计算时当前库存+到货日期为排产日期的在途数量。</p>
                  <p>8、齐套按工单优先级逐个计算，计算完成后扣减（计算池库存）相应物料当前库存+在途库存数，下个工单在计算池库存上接着计算。</p>
                  <p>8、不齐套不影响制令单下发，仅作备料警示。</p>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-[#64748B]">
                请选择左侧工单查看物料齐套明细
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-[#E5E9F0] bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-[#64748B]">
            {calcSuccess && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> 批量齐套运算已完成，状态已同步锁定
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer"
            >
              关闭
            </button>
            <button
              onClick={handleExecuteBatchCheck}
              disabled={isCalculating || totalOrders === 0}
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Calculator className="w-4 h-4" />
              <span>确认并运行批量运算</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
