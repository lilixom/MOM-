import React, { useState, useEffect, useMemo } from 'react';
import { FactoryCalState, WorkOrder } from '../types';
import { CAL_DAYS, FACTORY_LINES, teamOf } from '../mockData';
import { qtyOf, durOf, fmtWindow, toHours, ymd, addDays } from '../utils/timeUtils';
import {
  RefreshCw,
  Play,
  RotateCcw,
  CheckSquare,
  Clock,
  Wrench,
  Search,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface FactoryCalendarTabProps {
  selectedDate?: string;
  calState: FactoryCalState;
  onUpdateCalState: (newState: FactoryCalState) => void;
  workOrders: WorkOrder[];
  onUpdateWorkOrders: (newWOs: WorkOrder[]) => void;
  onSelectDate: (date: string) => void;
  onOpenTimeSlotDrawer?: (category: 'slot' | 'operation') => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const FactoryCalendarTab: React.FC<FactoryCalendarTabProps> = ({
  selectedDate,
  calState,
  onUpdateCalState,
  workOrders,
  onUpdateWorkOrders,
  onSelectDate,
  onOpenTimeSlotDrawer,
  onShowToast,
}) => {
  const [rollSummary, setRollSummary] = useState<string | null>(null);
  const [rollDetail, setRollDetail] = useState<string[]>([]);
  const [activeDate, setActiveDate] = useState<string>(
    selectedDate || CAL_DAYS[0]?.date || ''
  );
  const [activeLine, setActiveLine] = useState<string>(FACTORY_LINES[0]);

  // Query / Filter state
  const defaultStartDate = CAL_DAYS[0]?.date || '';
  const defaultEndDate = CAL_DAYS[CAL_DAYS.length - 1]?.date || '';
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (selectedDate) {
      setActiveDate(selectedDate);
    }
  }, [selectedDate]);

  // Filtered days based on date range
  const filteredDays = useMemo(() => {
    return CAL_DAYS.filter((d) => {
      if (startDate && d.date < startDate) return false;
      if (endDate && d.date > endDate) return false;
      return true;
    });
  }, [startDate, endDate]);

  // Filtered lines based on line selection
  const filteredLines = useMemo(() => {
    if (!selectedLine) return FACTORY_LINES;
    return FACTORY_LINES.filter((l) => l === selectedLine);
  }, [selectedLine]);

  // Ensure activeDate and activeLine stay valid within filtered scope
  useEffect(() => {
    if (filteredDays.length > 0 && !filteredDays.some((d) => d.date === activeDate)) {
      setActiveDate(filteredDays[0].date);
      onSelectDate(filteredDays[0].date);
    }
  }, [filteredDays, activeDate, onSelectDate]);

  useEffect(() => {
    if (filteredLines.length > 0 && !filteredLines.includes(activeLine)) {
      setActiveLine(filteredLines[0]);
    }
  }, [filteredLines, activeLine]);

  // Calculate filtered stats
  let totalAvail = 0;
  filteredLines.forEach((l) =>
    filteredDays.forEach((d) => {
      const c = calState[`${d.date}|${l}`] || { hours: 24, type: 'work' };
      if (c.type === 'work') totalAvail += c.hours;
    })
  );

  // Uncompleted work order quantities that would roll over in filtered scope
  let totalRollUnf = 0;
  workOrders.forEach((r) => {
    if (filteredLines.includes(r.line)) {
      const d = filteredDays.find((x) => x.date === r.date);
      if (d && d.doff <= 0 && !r.rolled && !r._rolledFrom) {
        const unf = (r.planQty || 0) - (r.doneQty || 0);
        if (unf > 0) totalRollUnf += unf;
      }
    }
  });

  const handleHourChange = (date: string, line: string, h: number) => {
    const newHours = Math.max(0, Math.min(24, h || 0));
    const key = `${date}|${line}`;
    const curr = calState[key] || { hours: 24, type: 'work' };
    const newType = newHours <= 0 && curr.type === 'work' ? 'rest' : curr.type;
    onUpdateCalState({
      ...calState,
      [key]: { hours: newHours, type: newType },
    });
  };

  const handleTypeChange = (date: string, line: string, type: 'work' | 'rest' | 'maint') => {
    const key = `${date}|${line}`;
    const curr = calState[key] || { hours: 24, type: 'work' };
    let newHours = curr.hours;
    if (type === 'work' && newHours <= 0) newHours = 24;
    if (type === 'rest' || type === 'maint') newHours = 0;
    onUpdateCalState({
      ...calState,
      [key]: { hours: newHours, type },
    });
  };

  const setAllHours = (h: number) => {
    const newCal = { ...calState };
    filteredLines.forEach((l) =>
      filteredDays.forEach((d) => {
        const key = `${d.date}|${l}`;
        const c = newCal[key] || { hours: 24, type: 'work' };
        if (c.type === 'work') newCal[key] = { ...c, hours: h };
      })
    );
    onUpdateCalState(newCal);
    onShowToast(`已将筛选范围内 (${filteredLines.length} 条产线, ${filteredDays.length} 天) 可用工时设为 ${h} 小时`, 'info');
  };

  const applyWeekendRule = () => {
    const newCal = { ...calState };
    filteredDays.forEach((d) => {
      const dow = new Date(d.date + 'T00:00:00').getDay();
      filteredLines.forEach((l) => {
        const key = `${d.date}|${l}`;
        if (dow === 0) {
          newCal[key] = { hours: 0, type: 'rest' };
        } else if (dow === 6) {
          newCal[key] = { hours: 16, type: 'work' };
        }
      });
    });
    onUpdateCalState(newCal);
    onShowToast('已为筛选范围内产线套用周末规则：周日休息(0h)，周六缩短生产(16h)', 'success');
  };

  const resetCalendar = () => {
    const newCal: FactoryCalState = { ...calState };
    filteredDays.forEach((d) => {
      const dow = new Date(d.date + 'T00:00:00').getDay();
      filteredLines.forEach((line) => {
        let hours = 24;
        let type: 'work' | 'rest' | 'maint' = 'work';
        if (dow === 0) {
          hours = 0;
          type = 'rest';
        } else if (dow === 6) {
          hours = 16;
          type = 'work';
        }
        if (d.doff === 3 || d.doff === 10) {
          hours = 0;
          type = 'maint';
        }
        newCal[`${d.date}|${line}`] = { hours, type };
      });
    });
    onUpdateCalState(newCal);
    onShowToast('筛选范围内的工厂日历已重置为默认值', 'info');
  };

  // Quick range helper
  const handleQuickRange = (dayCount: number) => {
    if (!CAL_DAYS.length) return;
    const start = CAL_DAYS[0].date;
    const targetIdx = Math.min(dayCount - 1, CAL_DAYS.length - 1);
    const end = CAL_DAYS[targetIdx].date;
    setStartDate(start);
    setEndDate(end);
    onShowToast(`已快速切换时间范围：未来 ${targetIdx + 1} 天 (${start} ~ ${end})`, 'info');
  };

  const isQuickRangeActive = (dayCount: number) => {
    if (!CAL_DAYS.length) return false;
    const start = CAL_DAYS[0].date;
    const targetIdx = Math.min(dayCount - 1, CAL_DAYS.length - 1);
    const end = CAL_DAYS[targetIdx].date;
    return startDate === start && endDate === end;
  };

  const handleResetFilter = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setSelectedLine('');
    setSelectedType('all');
    onShowToast('已重置工厂日历查询条件', 'info');
  };

  const isFilterActive =
    startDate !== defaultStartDate ||
    endDate !== defaultEndDate ||
    selectedLine !== '' ||
    selectedType !== 'all';

  // Midnight Auto Rollover logic
  const runMidnightRoll = () => {
    const byLine: Record<
      string,
      {
        line: string;
        team: string;
        product: string;
        remain: number;
        src: string[];
        created: number;
        shifted: number;
        orig: number;
        left?: number;
      }
    > = {};

    workOrders.forEach((r) => {
      const d = CAL_DAYS.find((x) => x.date === r.date);
      if (!d || d.doff > 0) return;
      if (r.rolled || r._rolledFrom) return;
      const unf = (r.planQty || 0) - (r.doneQty || 0);
      if (unf <= 0) return;
      const g =
        byLine[r.line] ||
        (byLine[r.line] = {
          line: r.line,
          team: r.team,
          product: r.product,
          remain: 0,
          src: [],
          created: 0,
          shifted: 0,
          orig: 0,
        });
      g.remain += unf;
      g.src.push(r.id);
    });

    const lines = Object.keys(byLine);
    if (!lines.length) {
      onShowToast('🌙 当前无未完工单需要顺延', 'info');
      return;
    }

    Object.values(byLine).forEach((g) => (g.orig = g.remain));

    // Future WOs
    const futureWOs = workOrders.filter((r) => {
      const d = CAL_DAYS.find((x) => x.date === r.date);
      return d && d.doff >= 1;
    });

    futureWOs.forEach((wo) => {
      wo._origDur = durOf(wo.start, wo.end);
    });

    const lineFuture: Record<string, WorkOrder[]> = {};
    lines.forEach((line) => {
      lineFuture[line] = futureWOs
        .filter((r) => r.line === line)
        .sort((a, b) => {
          const da = CAL_DAYS.find((x) => x.date === a.date)?.doff || 0;
          const db = CAL_DAYS.find((x) => x.date === b.date)?.doff || 0;
          return da - db || toHours(a.start) - toHours(b.start);
        });
    });

    const futureDays = CAL_DAYS.filter((d) => d.doff >= 1);
    let createdCount = 0;
    let totalRolledQty = 0;
    const shiftedAll: Record<string, boolean> = {};
    const newWOsList = [...workOrders];

    lines.forEach((line) => {
      const g = byLine[line];
      const rate = 40800; // Line standard rate
      let carryH = g.remain / rate;
      let carryQ = g.remain;
      let ptr = 0;
      const list = lineFuture[line] || [];

      futureDays.forEach((d) => {
        const cal = calState[`${d.date}|${line}`] || { hours: 24, type: 'work' };
        if (cal.type !== 'work' || cal.hours <= 0) return;
        const availH = cal.hours;
        let penH = 0;

        while (carryQ > 0 && penH < availH - 1e-6) {
          const fillH = Math.min(availH - penH, carryH);
          if (fillH <= 0) break;
          const q = Math.round(fillH * rate);
          createdCount++;
          g.created++;
          totalRolledQty += q;
          const id =
            'R' +
            line.slice(-2) +
            d.date.replace(/-/g, '') +
            String(createdCount).padStart(2, '0');

          newWOsList.push({
            id,
            line,
            team: teamOf(line),
            product: g.product,
            soNo: '',
            status: 'normal',
            shift: '顺延',
            hourCap: Math.round(rate),
            changeover: 0.5,
            otherStop: 1.0,
            start: fmtWindow(penH),
            end: fmtWindow(penH + fillH),
            actual: null,
            selected: false,
            generated: false,
            date: d.date,
            planQty: q,
            doneQty: 0,
            rolled: true,
          });

          penH += fillH;
          carryH -= fillH;
          carryQ -= q;
        }

        while (ptr < list.length) {
          const wo = list[ptr];
          const durH = wo._origDur || durOf(wo.start, wo.end);
          if (penH + durH <= availH + 1e-6) {
            const ns = fmtWindow(penH);
            const ne = fmtWindow(penH + durH);
            if (wo.date !== d.date || wo.start !== ns) {
              shiftedAll[wo.id] = true;
              g.shifted++;
            }
            wo.start = ns;
            wo.end = ne;
            wo.date = d.date;
            penH += durH;
            ptr++;
          } else break;
        }
      });

      newWOsList.forEach((r) => {
        if (g.src.includes(r.id)) r._rolledFrom = true;
      });
      g.left = Math.round(carryQ);
    });

    onUpdateWorkOrders(newWOsList);

    const firstFuture = futureDays.find((d) =>
      newWOsList.some((r) => r.date === d.date && (r.rolled || shiftedAll[r.id]))
    );
    if (firstFuture) onSelectDate(firstFuture.date);

    const detailRows = lines.map((line) => {
      const g = byLine[line];
      const tail =
        (g.left || 0) > 0
          ? `（仍有 ${g.left?.toLocaleString()} 件超未来15天产能未排）`
          : '';
      return `${line} 原未完工 ${g.orig.toLocaleString()} 件 → 新开 ${g.created} 个顺产工单、平移 ${g.shifted} 个既有工单 ${tail}`;
    });

    setRollSummary(
      `✅ 模拟今晚0点顺产：将 ${lines.length} 条线当日未完成量占用次日排产，所有未来排产整体往后平移；新开 ${createdCount} 个顺产工单（合计 ${totalRolledQty.toLocaleString()} 件）。`
    );
    setRollDetail(detailRows);

    onShowToast(
      `🌙 每晚0点自动顺产完成：${lines.length} 条线共 ${totalRolledQty.toLocaleString()} 件顺延，生成 ${createdCount} 个新工单`,
      'success'
    );
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards (Reflecting query filter results) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-2xs">
          <div className="text-2xl font-bold text-[#5A634D]">{filteredDays.length}</div>
          <div className="text-xs text-[#9DA391] mt-0.5">
            维护跨度 (天) {filteredDays.length !== CAL_DAYS.length && <span className="text-[#5A634D]">/ 已筛选</span>}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-2xs">
          <div className="text-2xl font-bold text-[#7D8471]">{filteredLines.length}</div>
          <div className="text-xs text-[#9DA391] mt-0.5">
            有效线体数 {filteredLines.length !== FACTORY_LINES.length && <span className="text-[#7D8471]">/ 已筛选</span>}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#F27D52]/20 bg-[#F27D52]/5 shadow-2xs">
          <div className="text-2xl font-bold text-[#F27D52]">
            {totalRollUnf.toLocaleString()}
          </div>
          <div className="text-xs text-[#F27D52] mt-0.5 font-medium">今晚0点待顺延 (件)</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-2xs">
          <div className="text-2xl font-bold text-[#5A634D]">{totalAvail} h</div>
          <div className="text-xs text-[#9DA391] mt-0.5">
            {filteredDays.length}天可用工时合计
          </div>
        </div>
      </div>

      {/* Query / Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-2xs p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs font-bold text-[#4A4E44] flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#7D8471]" />
            <span>🔍 工厂日历查询条件</span>
            {isFilterActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EAE3] text-[#5A634D] border border-[#5A634D]/20">
                已应用筛选
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9DA391]">
              匹配结果: <b className="text-[#5A634D]">{filteredDays.length}</b> 天 / <b className="text-[#5A634D]">{filteredLines.length}</b> 条产线
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          {/* Date Range Input */}
          <div className="flex items-center gap-1.5 bg-[#FCFAF7] p-1.5 px-3 rounded-xl border border-[#E8E4D9]">
            <CalendarIcon className="w-3.5 h-3.5 text-[#7D8471] shrink-0" />
            <span className="text-[#5A634D] font-semibold whitespace-nowrap">时间范围:</span>
            <input
              type="date"
              value={startDate}
              min={defaultStartDate}
              max={defaultEndDate}
              onChange={(e) => {
                const val = e.target.value;
                setStartDate(val);
                if (val > endDate) setEndDate(val);
              }}
              className="p-1 border border-[#E8E4D9] rounded-lg text-[#4A4E44] bg-white font-mono text-xs focus:ring-1 focus:ring-[#5A634D] outline-none"
            />
            <span className="text-[#9DA391] font-bold">~</span>
            <input
              type="date"
              value={endDate}
              min={startDate || defaultStartDate}
              max={defaultEndDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1 border border-[#E8E4D9] rounded-lg text-[#4A4E44] bg-white font-mono text-xs focus:ring-1 focus:ring-[#5A634D] outline-none"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="inline-flex border border-[#E8E4D9] rounded-xl overflow-hidden bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleQuickRange(7)}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                isQuickRangeActive(7)
                  ? 'bg-[#7D8471] text-white font-medium shadow-2xs'
                  : 'text-[#5A634D] hover:bg-[#F0EEE6]'
              }`}
            >
              未来7天
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange(14)}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                isQuickRangeActive(14)
                  ? 'bg-[#7D8471] text-white font-medium shadow-2xs'
                  : 'text-[#5A634D] hover:bg-[#F0EEE6]'
              }`}
            >
              未来14天
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange(15)}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                isQuickRangeActive(15)
                  ? 'bg-[#7D8471] text-white font-medium shadow-2xs'
                  : 'text-[#5A634D] hover:bg-[#F0EEE6]'
              }`}
            >
              全部(15天)
            </button>
          </div>

          {/* Line Filter */}
          <div className="flex items-center gap-1.5 bg-[#FCFAF7] p-1.5 px-3 rounded-xl border border-[#E8E4D9]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7D8471] shrink-0" />
            <span className="text-[#5A634D] font-semibold whitespace-nowrap">线体:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="p-1 border border-[#E8E4D9] rounded-lg bg-white text-[#4A4E44] text-xs font-semibold focus:ring-1 focus:ring-[#5A634D] outline-none cursor-pointer"
            >
              <option value="">全部线体 ({FACTORY_LINES.length} 条)</option>
              {FACTORY_LINES.map((line) => (
                <option key={line} value={line}>
                  {line} ({teamOf(line)} 班组)
                </option>
              ))}
            </select>
          </div>

          {/* Query Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                onShowToast(
                  `🔍 查询完成：已筛选 ${filteredDays.length} 天、${filteredLines.length} 条产线数据`,
                  'info'
                );
              }}
              className="px-3.5 py-1.5 bg-[#5A634D] text-white rounded-xl text-xs font-semibold hover:bg-[#4A4E44] transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-3.5 py-1.5 border border-[#E8E4D9] bg-white text-[#5A634D] rounded-xl text-xs font-medium hover:bg-[#F0EEE6] transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置条件</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-2xs overflow-hidden">
        <div className="p-4 px-5 border-b border-[#F0EEE6] flex flex-wrap items-center justify-between gap-2 bg-[#FCFAF7]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#4A4E44]">🏭 工厂日历排期总览</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8EAE3] text-[#5A634D] font-medium">
              工作日周期 08:30~次日08:30 | 当前呈现 {filteredDays.length} 天 / {filteredLines.length} 条产线
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenTimeSlotDrawer && (
              <button
                onClick={() => onOpenTimeSlotDrawer('slot')}
                className="px-3.5 py-1.5 text-xs bg-[#7D8471] hover:bg-[#5A634D] text-white rounded-xl transition font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⏱️ 作息时段</span>
              </button>
            )}
            <button
              onClick={() => setAllHours(24)}
              className="px-3 py-1.5 text-xs border border-[#E8E4D9] rounded-xl bg-white hover:bg-[#F0EEE6] text-[#5A634D] transition font-medium cursor-pointer"
              title="将当前筛选范围内的工时全设为24小时"
            >
              设为24h
            </button>
            <button
              onClick={applyWeekendRule}
              className="px-3 py-1.5 text-xs border border-[#E8E4D9] rounded-xl bg-white hover:bg-[#F0EEE6] text-[#5A634D] transition font-medium cursor-pointer"
              title="为当前筛选产线套用周末规则"
            >
              套用周末规则
            </button>
            <button
              onClick={resetCalendar}
              className="px-3 py-1.5 text-xs border border-[#E8E4D9] rounded-xl bg-white hover:bg-[#F0EEE6] text-[#5A634D] transition font-medium cursor-pointer"
              title="重置当前筛选范围的日历"
            >
              <RotateCcw className="w-3 h-3 inline mr-1 text-[#7D8471]" />
              重置
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-xs text-[#5A634D] bg-[#FDFBF7] border border-[#E8E4D9] rounded-xl p-3 leading-relaxed flex items-center justify-between gap-2 flex-wrap">
            <div>
              维护各产线每日 <b>可用工时</b> 与 <b>日历类型</b>
              （正常生产 / 休息 / 设备维修）。日排产区将按此可用工时计算产能；每晚 0
              点未完工单将依据日历顺延至后续有产能的工作日。
            </div>
            <div className="flex items-center gap-3 text-[11px] shrink-0 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-white border border-[#E8E4D9] inline-block" />
                正常生产
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#F9F7F2] border border-[#E8E4D9] inline-block" />
                计划休息 (0h)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#F27D52]/20 border border-[#F27D52]/40 inline-block" />
                设备维修 (0h)
              </span>
            </div>
          </div>

          {filteredDays.length === 0 ? (
            <div className="p-8 text-center bg-[#FCFAF7] rounded-xl border border-dashed border-[#E8E4D9] space-y-3">
              <AlertCircle className="w-8 h-8 text-[#F27D52] mx-auto opacity-70" />
              <div className="text-sm font-semibold text-[#4A4E44]">所选时间范围内暂无工厂日历数据</div>
              <p className="text-xs text-[#9DA391]">
                当前时间范围 ({startDate} ~ {endDate}) 无有效排期，请调整时间范围或重置查询条件。
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-4 py-1.5 bg-[#5A634D] text-white rounded-xl text-xs font-semibold hover:bg-[#4A4E44] transition shadow-2xs inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置为默认15天</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FCFAF7] text-[#5A634D] border-b border-[#E8E4D9] font-semibold">
                    <th className="p-2 border border-[#E8E4D9] sticky left-0 z-10 bg-[#FCFAF7] min-w-[90px] text-left">
                      线别 \ 日期
                    </th>
                    {filteredDays.map((d) => {
                      const isSelected = d.date === activeDate;
                      return (
                        <th
                          key={d.date}
                          onClick={() => {
                            setActiveDate(d.date);
                            onSelectDate(d.date);
                          }}
                          className={`p-1.5 border transition cursor-pointer select-none text-center min-w-[65px] ${
                            isSelected
                              ? 'bg-[#5A634D] text-white border-[#5A634D] shadow-xs'
                              : d.isToday
                              ? 'bg-[#E8EAE3] text-[#5A634D] border-[#E8E4D9] hover:bg-[#dcdfd6]'
                              : 'border-[#E8E4D9] hover:bg-[#F0EEE6]'
                          }`}
                          title="点击选择该日期查看作息明细"
                        >
                          <div>{d.md}</div>
                          <div
                            className={`text-[10px] font-normal ${
                              isSelected ? 'text-[#E8EAE3]' : 'text-[#9DA391]'
                            }`}
                          >
                            周{d.wd}
                          </div>
                          {d.isToday && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold inline-block mt-0.5 ${
                                isSelected
                                  ? 'bg-white text-[#5A634D]'
                                  : 'bg-[#7D8471] text-white'
                              }`}
                            >
                              今天
                            </span>
                          )}
                        </th>
                      );
                    })}
                    <th className="p-2 border border-[#E8E4D9] text-center bg-[#E8EAE3] text-[#5A634D] font-bold min-w-[70px]">
                      合计工时
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLines.map((line) => {
                    let sum = 0;
                    return (
                      <tr key={line} className="hover:bg-[#F9F7F2]">
                        <td
                          onClick={() => setActiveLine(line)}
                          className={`p-2 border border-[#E8E4D9] sticky left-0 z-10 font-semibold cursor-pointer transition ${
                            line === activeLine ? 'bg-[#E8EAE3] text-[#5A634D]' : 'bg-white text-[#4A4E44]'
                          }`}
                          title="点击选择该产线"
                        >
                          <div>{line}</div>
                          <div className="text-[10px] text-[#9DA391]">{teamOf(line)}</div>
                        </td>
                        {filteredDays.map((d) => {
                          const key = `${d.date}|${line}`;
                          const c = calState[key] || { hours: 24, type: 'work' };
                          sum += c.hours;
                          const cellBg =
                            c.type === 'rest'
                              ? 'bg-[#F9F7F2]'
                              : c.type === 'maint'
                              ? 'bg-[#F27D52]/10'
                              : 'bg-white';

                          const isCellSelected = d.date === activeDate && line === activeLine;
                          const isColSelected = d.date === activeDate;

                          // If selectedType is set, dim non-matching cells
                          const matchesType =
                            selectedType === 'all' ||
                            (selectedType === 'work' && c.type === 'work' && c.hours > 0) ||
                            (selectedType === 'rest' && c.type === 'rest') ||
                            (selectedType === 'maint' && c.type === 'maint');

                          return (
                            <td
                              key={d.date}
                              onClick={() => {
                                setActiveDate(d.date);
                                setActiveLine(line);
                                onSelectDate(d.date);
                              }}
                              className={`p-1 text-center transition cursor-pointer select-none relative ${
                                isCellSelected
                                  ? 'border-2 border-[#5A634D] ring-2 ring-[#5A634D]/40 bg-white z-10 shadow-sm font-bold'
                                  : isColSelected
                                  ? `border border-[#E8E4D9] ${cellBg} bg-[#5A634D]/5 ring-1 ring-[#5A634D]/20`
                                  : `border border-[#E8E4D9] ${cellBg} hover:bg-[#F0EEE6]`
                              } ${!matchesType ? 'opacity-30' : ''}`}
                            >
                              <div className="flex items-center justify-between px-0.5">
                                <span
                                  className={`font-bold text-xs ${
                                    isCellSelected ? 'text-[#5A634D] text-sm' : 'text-[#4A4E44]'
                                  }`}
                                >
                                  {c.hours}h
                                </span>
                                {isCellSelected && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-[#5A634D] inline-block"
                                    title="当前选中"
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-2 border border-[#E8E4D9] text-center font-bold text-[#5A634D] bg-[#E8EAE3]/50">
                          {sum}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FCFAF7] font-semibold text-[#5A634D] border-t border-[#E8E4D9]">
                    <td className="p-2 border border-[#E8E4D9] sticky left-0 z-10 bg-[#FCFAF7] font-bold">
                      每日合计
                    </td>
                    {filteredDays.map((d) => {
                      let daySum = 0;
                      filteredLines.forEach((l) => {
                        const c = calState[`${d.date}|${l}`] || { hours: 24, type: 'work' };
                        daySum += c.hours;
                      });
                      return (
                        <td key={d.date} className="p-1.5 border border-[#E8E4D9] text-center font-bold font-mono">
                          {daySum}h
                        </td>
                      );
                    })}
                    <td className="p-2 border border-[#E8E4D9] text-center bg-[#5A634D] text-white font-bold font-mono">
                      {totalAvail}h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* 作息明细 Breakdown Panel for Selected Date & Line */}
          {activeDate && filteredDays.some((d) => d.date === activeDate) && (
            <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-[#5A634D]/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0EEE6] pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#E8EAE3] text-[#5A634D]">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#4A4E44]">
                        📋 作息明细 - {activeDate}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#5A634D] text-white">
                        {activeLine} 产线 ({teamOf(activeLine)} 班组)
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          calState[`${activeDate}|${activeLine}`]?.type === 'rest'
                            ? 'bg-[#E8EAE3] text-[#5A634D]'
                            : calState[`${activeDate}|${activeLine}`]?.type === 'maint'
                            ? 'bg-[#F27D52]/15 text-[#F27D52]'
                            : 'bg-[#5A634D]/10 text-[#5A634D]'
                        }`}
                      >
                        {calState[`${activeDate}|${activeLine}`]?.type === 'work'
                          ? '🟢 正常生产'
                          : calState[`${activeDate}|${activeLine}`]?.type === 'rest'
                          ? '🟡 计划休息'
                          : '🔴 维修停机'}
                        （{(calState[`${activeDate}|${activeLine}`]?.hours ?? 24)}h 可用）
                      </span>
                    </div>
                    <p className="text-xs text-[#9DA391] mt-0.5">
                      工厂单工作日核算周期：<b>08:30 ~ 次日 08:30</b>（跨零点 24 小时排产规则）
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenTimeSlotDrawer && (
                    <button
                      onClick={() => onOpenTimeSlotDrawer('slot')}
                      className="px-3.5 py-1.5 bg-[#7D8471] hover:bg-[#5A634D] text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>⏱️ 维护作息时段</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="text-xs">
                <div className="p-3 bg-[#FCFAF7] rounded-xl border border-[#E8E4D9] space-y-2 w-full">
                  <div className="font-bold text-[#4A4E44] flex items-center justify-between border-b border-[#E8E4D9] pb-1.5">
                    <span>🕒 日常作息与非生产时间段明细 (08:30-次日08:30)</span>
                    <span className="text-[11px] text-[#9DA391] font-normal">
                      排产引擎自动避开扣除
                    </span>
                  </div>
                  {(() => {
                    const nextDateStr = ymd(addDays(new Date(activeDate + 'T00:00:00'), 1));
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#E8E4D9] text-[#9DA391] text-[11px] font-medium">
                              <th className="py-2 px-3">工作日</th>
                              <th className="py-2 px-3">线体</th>
                              <th className="py-2 px-3">班次</th>
                              <th className="py-2 px-3">时段范围</th>
                              <th className="py-2 px-3">作息 / 维护名称</th>
                              <th className="py-2 px-3">说明</th>
                              <th className="py-2 px-3 text-right">扣除时长</th>
                              <th className="py-2 px-3 text-center min-w-[110px]">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8E4D9]/60 text-[#4A4E44]">
                            <tr className="hover:bg-white/60 transition">
                              <td className="py-2.5 px-3 font-semibold text-[#4A4E44] font-mono">{activeDate}</td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D]">{activeLine}</td>
                              <td className="py-2.5 px-3 font-semibold">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-[#5A634D]/10 text-[#5A634D] font-bold">
                                  ☀️ 白班
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D] font-mono">{activeDate} 08:30 - {activeDate} 09:30</td>
                              <td className="py-2.5 px-3 font-medium">班前例会 & 首件确认</td>
                              <td className="py-2.5 px-3 text-[#9DA391] text-[11px]">设备点检 / 确认生产路线与首件</td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="text-[10px] px-2.5 py-1 rounded bg-[#E8EAE3] text-[#5A634D] font-bold inline-block">
                                  1.0h
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#5A634D]/10 hover:bg-[#5A634D]/20 text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="修改此作息时段"
                                  >
                                    修改
                                  </button>
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#E8EAE3] hover:bg-[#dcdfd6] text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="新增作息时段"
                                  >
                                    + 新增
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-white/60 transition">
                              <td className="py-2.5 px-3 font-semibold text-[#4A4E44] font-mono">{activeDate}</td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D]">{activeLine}</td>
                              <td className="py-2.5 px-3 font-semibold">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-[#5A634D]/10 text-[#5A634D] font-bold">
                                  ☀️ 白班
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D] font-mono">{activeDate} 12:00 - {activeDate} 13:00</td>
                              <td className="py-2.5 px-3 font-medium">午餐轮休</td>
                              <td className="py-2.5 px-3 text-[#9DA391] text-[11px]">中班就餐与暂定轮休</td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="text-[10px] px-2.5 py-1 rounded bg-[#E8EAE3] text-[#5A634D] font-bold inline-block">
                                  1.0h
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#5A634D]/10 hover:bg-[#5A634D]/20 text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="修改此作息时段"
                                  >
                                    修改
                                  </button>
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#E8EAE3] hover:bg-[#dcdfd6] text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="新增作息时段"
                                  >
                                    + 新增
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-white/60 transition">
                              <td className="py-2.5 px-3 font-semibold text-[#4A4E44] font-mono">{activeDate}</td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D]">{activeLine}</td>
                              <td className="py-2.5 px-3 font-semibold">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-[#5A634D]/10 text-[#5A634D] font-bold">
                                  ☀️ 白班
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D] font-mono">{activeDate} 17:30 - {activeDate} 18:30</td>
                              <td className="py-2.5 px-3 font-medium">晚餐交接</td>
                              <td className="py-2.5 px-3 text-[#9DA391] text-[11px]">晚餐 & 白/夜班交接清理</td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="text-[10px] px-2.5 py-1 rounded bg-[#E8EAE3] text-[#5A634D] font-bold inline-block">
                                  1.0h
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#5A634D]/10 hover:bg-[#5A634D]/20 text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="修改此作息时段"
                                  >
                                    修改
                                  </button>
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#E8EAE3] hover:bg-[#dcdfd6] text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="新增作息时段"
                                  >
                                    + 新增
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-white/60 transition">
                              <td className="py-2.5 px-3 font-semibold text-[#4A4E44] font-mono">
                                {activeDate}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D]">{activeLine}</td>
                              <td className="py-2.5 px-3 font-semibold">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-[#F27D52]/15 text-[#F27D52] font-bold">
                                  🌙 夜班
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#5A634D] font-mono">{activeDate} 23:30 - {nextDateStr} 00:30</td>
                              <td className="py-2.5 px-3 font-medium">夜休保养</td>
                              <td className="py-2.5 px-3 text-[#9DA391] text-[11px]">夜班餐补休息 & 巡检保养</td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="text-[10px] px-2.5 py-1 rounded bg-[#E8EAE3] text-[#5A634D] font-bold inline-block">
                                  1.0h
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#5A634D]/10 hover:bg-[#5A634D]/20 text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="修改此作息时段"
                                  >
                                    修改
                                  </button>
                                  <button
                                    onClick={() => onOpenTimeSlotDrawer && onOpenTimeSlotDrawer('slot')}
                                    className="px-2 py-0.5 text-[11px] rounded bg-[#E8EAE3] hover:bg-[#dcdfd6] text-[#5A634D] font-semibold transition cursor-pointer"
                                    title="新增作息时段"
                                  >
                                    + 新增
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Midnight Rollover Simulation Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-2xs overflow-hidden">
        <div className="p-4 px-5 border-b border-[#F0EEE6] flex items-center justify-between bg-[#FCFAF7]">
          <div className="text-sm font-bold text-[#4A4E44] flex items-center gap-2">
            <span>🌙 每日0点自动顺产（未完成量往后排）</span>
          </div>
          <button
            onClick={runMidnightRoll}
            className="px-3.5 py-2 bg-[#5A634D] text-white rounded-xl text-xs font-medium hover:bg-[#4A4E44] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>模拟今晚0点自动顺产</span>
          </button>
        </div>

        <div className="p-4 text-xs space-y-2">
          {rollSummary ? (
            <div className="space-y-2">
              <div className="font-semibold text-[#5A634D] bg-[#E8EAE3] p-3 rounded-xl border border-[#E8E4D9]">
                {rollSummary}
              </div>
              <div className="space-y-1 pl-1">
                {rollDetail.map((d, i) => (
                  <div key={i} className="text-[#4A4E44] border-b border-dashed border-[#E8E4D9] py-1">
                    {d}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[#9DA391] py-2">
              点击右上角按钮，模拟每日 0 点：①当日未完成量占用次日排产时间，所有未来排产整体往后平移；②新开工单依据工厂日历可用工时自动填充空缺。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

