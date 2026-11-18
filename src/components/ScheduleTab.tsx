import React, { useState, useMemo } from 'react';
import {
  WorkOrder,
  FactoryCalState,
  SalesOrder,
  KitComponent,
  KitItem,
  StatusType,
} from '../types';
import {
  DAYS,
  FACTORY_LINES,
  teamOf,
  STATUS_MAP,
  INITIAL_CHANGEOVER_DATA,
  ACTUAL_CO_BY_TYPE,
  capByLineMat,
  TODAY,
} from '../mockData';
import {
  toHours,
  fmtHM,
  durOf,
  qtyOf,
  axisPct,
  fmtTickHM,
  fmtWindow,
  windowSegs,
  weekdayOf,
  fmtK,
  WINDOW_START,
  generateDateRange,
  ymd,
  addDays,
} from '../utils/timeUtils';
import {
  Search,
  RotateCcw,
  Upload,
  Plus,
  Settings2,
  Download,
  Eye,
  Trash2,
  Calculator,
  Package,
  Save,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Clock,
  Wrench,
  Zap,
  XCircle,
  FileUp,
  Snowflake,
  Lock,
} from 'lucide-react';
import { BatchKitCheckModal } from './modals/BatchKitCheckModal';
import { ImportMOModal } from './modals/ImportMOModal';
import { Gantt24HTimeline } from './Gantt24HTimeline';

interface ScheduleTabProps {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  workOrders: WorkOrder[];
  onUpdateWorkOrders: (wos: WorkOrder[]) => void;
  calState: FactoryCalState;
  salesOrders: SalesOrder[];
  kitData: KitItem[];
  packEdits: Record<string, number[]>;
  onOpenInsertModal: () => void;
  onOpenGenerateModal: () => void;
  onOpenKitCheckModal: (wo: WorkOrder, q: number, comps: KitComponent[]) => void;
  onOpenPackModal: (wo: WorkOrder, comps: KitComponent[]) => void;
  onOpenTimeSlotDrawer?: (category: 'slot' | 'operation') => void;
  kitCheckedDate: string | null;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isScheduleFrozen?: boolean;
  onToggleFreezeSchedule?: () => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  selectedDate,
  onSelectDate,
  workOrders,
  onUpdateWorkOrders,
  calState,
  salesOrders,
  kitData,
  packEdits,
  onOpenInsertModal,
  onOpenGenerateModal,
  onOpenKitCheckModal,
  onOpenPackModal,
  onOpenTimeSlotDrawer,
  kitCheckedDate,
  onShowToast,
  isScheduleFrozen: propIsScheduleFrozen,
  onToggleFreezeSchedule: propOnToggleFreezeSchedule,
}) => {
  // Freeze state (fallback to local if not provided by parent)
  const [internalFrozen, setInternalFrozen] = useState(false);
  const isScheduleFrozen = propIsScheduleFrozen ?? internalFrozen;

  const handleToggleFreeze = () => {
    if (propOnToggleFreezeSchedule) {
      propOnToggleFreezeSchedule();
    } else {
      setInternalFrozen((prev) => {
        const next = !prev;
        if (next) {
          onShowToast('❄️ 排产已冻结！已开启防覆盖保护：禁止甘特图拖拉调整，自动排产禁止覆盖。', 'info');
        } else {
          onShowToast('🔓 排产已解冻！已恢复甘特图拖拽调整与自动排产功能。', 'success');
        }
        return next;
      });
    }
  };

  // Local state for views and selections
  const [viewState, setViewState] = useState({
    cap: true,
    actual: true,
    var: true,
  });
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'six' | 'month'>('day');
  const [highlightSoNo, setHighlightSoNo] = useState<string | null>(null);
  const [isBatchKitModalOpen, setIsBatchKitModalOpen] = useState(false);
  const [isImportMOModalOpen, setIsImportMOModalOpen] = useState(false);

  // Date Range Query State: Starts today, min 14 days
  const todayStr = ymd(TODAY);
  const defaultEndStr = ymd(addDays(TODAY, 13)); // 14 days inclusive

  const [queryStartDate, setQueryStartDate] = useState(todayStr);
  const [queryEndDate, setQueryEndDate] = useState(defaultEndStr);
  const [queryLine, setQueryLine] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');

  // Day difference helper
  const calcDaySpan = (start: string, end: string) => {
    const s = new Date(start + 'T00:00:00').getTime();
    const e = new Date(end + 'T00:00:00').getTime();
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Generate dynamic date list for the schedule table
  const displayDays = useMemo(() => {
    return generateDateRange(queryStartDate, queryEndDate);
  }, [queryStartDate, queryEndDate]);

  // Handle start date change (ensuring minimum 14 days interval)
  const handleStartDateChange = (newStart: string) => {
    setQueryStartDate(newStart);
    const minEnd = ymd(addDays(new Date(newStart + 'T00:00:00'), 13));
    if (queryEndDate < minEnd) {
      setQueryEndDate(minEnd);
      onShowToast(`📅 查询日期范围最少需14天，结束日期已自动调整为 ${minEnd}`, 'info');
    }
  };

  // Handle end date change (ensuring minimum 14 days interval)
  const handleEndDateChange = (newEnd: string) => {
    const minEnd = ymd(addDays(new Date(queryStartDate + 'T00:00:00'), 13));
    if (newEnd < minEnd) {
      setQueryEndDate(minEnd);
      onShowToast(`⚠️ 查询日期范围最少需包含14天（至 ${minEnd}），已自动调整`, 'warning');
    } else {
      setQueryEndDate(newEnd);
    }
  };

  // Preset date ranges (14天, 21天, 30天, 本月)
  const handleSetPresetRange = (daysCount: number | 'month') => {
    const s = todayStr;
    setQueryStartDate(s);
    if (daysCount === 'month') {
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastDayStr = ymd(lastDayOfMonth);
      const minEnd = ymd(addDays(TODAY, 13));
      const endStr = lastDayStr < minEnd ? minEnd : lastDayStr;
      setQueryEndDate(endStr);
      onShowToast(`📅 已设定为「本月」排产区间（${s} ~ ${endStr}，共 ${calcDaySpan(s, endStr)} 天）`, 'success');
    } else {
      const e = ymd(addDays(TODAY, daysCount - 1));
      setQueryEndDate(e);
      onShowToast(`📅 已设定为「${daysCount}天」排产区间（${s} ~ ${e}）`, 'success');
    }
  };

  // Selected WO for the action panel
  const selectedWO = workOrders.find((r) => r.id === selectedWOId) || null;

  // Selected WO Panel fields
  const [dpStart, setDpStart] = useState('08:30');
  const [dpEnd, setDpEnd] = useState('20:30');
  const [dpNext, setDpNext] = useState(false);
  const [dpCap, setDpCap] = useState(40800);
  const [dpStatus, setDpStatus] = useState<StatusType>('scheduled');
  const [dpCoType, setDpCoType] = useState<string>('');
  const [dpChangeover, setDpChangeover] = useState<number>(0);

  const handleSelectWO = (wo: WorkOrder) => {
    setSelectedWOId(wo.id);
    const startNoPlus = ('' + wo.start).replace('+1', '').trim();
    const isEndPlus = ('' + wo.end).includes('+1');
    const endNoPlus = ('' + wo.end).replace('+1', '').trim();
    setDpStart(startNoPlus);
    setDpEnd(endNoPlus);
    setDpNext(isEndPlus);
    setDpCap(wo.hourCap);
    setDpStatus(wo.status || 'scheduled');
    setDpCoType(wo.coType || '');
    setDpChangeover(wo.changeover ?? 0);
  };

  const handleSyncSelectedWOTime = (newStart: string, newEnd: string, isNext: boolean) => {
    setDpStart(newStart.replace('+1', ''));
    setDpEnd(newEnd.replace('+1', ''));
    setDpNext(isNext);
  };

  const handleSaveSelectedWO = () => {
    if (!selectedWO) return;
    if (isScheduleFrozen) {
      onShowToast('❄️ 当前排产处于【已冻结】保护状态，禁止修改排产！如需修改请先解冻排产。', 'warning');
      return;
    }
    if (!dpStart || !dpEnd) {
      onShowToast('⚠️ 请填写开始和结束时间', 'warning');
      return;
    }
    const endStr = dpNext ? `${dpEnd}+1` : dpEnd;
    if (!dpNext && toHours(endStr) <= toHours(dpStart)) {
      onShowToast('⚠️ 结束时间需晚于开始时间（跨天请勾选+1）', 'warning');
      return;
    }
    if (dpCap <= 0) {
      onShowToast('⚠️ 小时产能需大于0', 'warning');
      return;
    }

    const coRule = INITIAL_CHANGEOVER_DATA.find((c) => c.code === dpCoType);
    const coDesc = coRule?.desc || (dpCoType === 'custom' ? '自定义换型' : selectedWO.coDesc || '');

    const updated = workOrders.map((r) =>
      r.id === selectedWO.id
        ? {
            ...r,
            start: dpStart,
            end: endStr,
            hourCap: dpCap,
            status: dpStatus,
            coType: dpCoType === 'none' ? undefined : dpCoType,
            coDesc: dpCoType === 'none' ? undefined : coDesc,
            changeover: dpChangeover,
          }
        : r
    );
    onUpdateWorkOrders(updated);
    const q = qtyOf(dpStart, endStr, dpCap, dpChangeover);
    onShowToast(
      `✅ 工单 ${selectedWO.id} 已更新：状态【${STATUS_MAP[dpStatus]?.label || dpStatus}】开始 ${dpStart} 结束 ${endStr} 标准换型 ${dpChangeover}h 排产 ${q.toLocaleString()} 件`,
      'success'
    );
  };

  const handleDeleteSelectedWO = () => {
    if (!selectedWO) return;
    if (isScheduleFrozen) {
      onShowToast('❄️ 当前排产处于【已冻结】保护状态，禁止删除排产！如需删除请先解冻排产。', 'warning');
      return;
    }
    if (selectedWO.generated) {
      onShowToast('⚠️ 已经生成制令单，无法删除该排产！', 'error');
      return;
    }
    if (!confirm(`确认删除工单 ${selectedWO.id} 的排产？`)) return;
    onUpdateWorkOrders(workOrders.filter((r) => r.id !== selectedWO.id));
    setSelectedWOId(null);
    onShowToast(`🗑️ 已删除工单 ${selectedWO.id} 的排产`, 'success');
  };

  const handleToggleCheckWO = (id: string, checked: boolean) => {
    onUpdateWorkOrders(
      workOrders.map((r) => (r.id === id ? { ...r, selected: checked } : r))
    );
  };

  const handleDeleteCheckedWOs = () => {
    if (isScheduleFrozen) {
      onShowToast('❄️ 当前排产处于【已冻结】保护状态，禁止删除排产！如需删除请先解冻排产。', 'warning');
      return;
    }
    const sel = workOrders.filter((r) => r.selected);
    if (!sel.length) {
      onShowToast('请先勾选要删除的排产工单', 'info');
      return;
    }
    if (sel.some((r) => r.generated)) {
      onShowToast('⚠️ 已生成制令单的工单不可删除！', 'error');
      return;
    }
    if (!confirm(`确认删除选中的 ${sel.length} 个排产工单？`)) return;
    onUpdateWorkOrders(workOrders.filter((r) => !r.selected));
    onShowToast(`🗑️ 已删除 ${sel.length} 个排产工单`, 'success');
  };

  // Helper to get BOM for Kit Check & Package Edit
  const getBOM = (wo: WorkOrder): KitComponent[] => {
    const base = kitData.find((k) => k.wo === wo.id);
    const q = qtyOf(wo.start, wo.end, wo.hourCap, wo.changeover);
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
          { name: '彩印', q: need, r: need, wh: need, transit: 0 },
        ];

    const edits = packEdits[wo.id];
    return baseComps.map((c, i) => {
      const wh = edits && edits[i] != null ? edits[i] : c.wh;
      return { name: c.name, q: c.q, r: wh + c.transit, wh, transit: c.transit };
    });
  };

  // Jump to Gantt Work Order
  const handleGotoWO = (woId: string) => {
    const gr = workOrders.find((g) => g.id === woId);
    if (gr) onSelectDate(gr.date);
    setSelectedWOId(woId);
    if (gr) handleSelectWO(gr);
    onShowToast(`📍 已定位工单 ${woId}（${gr ? gr.date : ''}）`, 'info');
  };

  // Filter current day WOs
  const dayWOs = workOrders.filter((r) => r.date === selectedDate);

  // Timeline ticks 08:30 -> 08:30+1
  const TICKS = [];
  for (let k = 0; k <= 12; k++) TICKS.push(WINDOW_START + k * 2);

  const selectedCount = workOrders.filter((r) => r.selected).length;
  const isKitOkForGen = kitCheckedDate === selectedDate;

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs">
          <div className="text-2xl font-bold text-[#1E293B]">12</div>
          <div className="text-xs text-[#64748B] mt-0.5">待排产销售订单</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs">
          <div className="text-2xl font-bold text-[#1E293B]">{FACTORY_LINES.length}</div>
          <div className="text-xs text-[#64748B] mt-0.5">活跃线体</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs">
          <div className="text-2xl font-bold text-[#165DFF] font-mono tabular-nums">67%</div>
          <div className="text-xs text-[#64748B] mt-0.5">平均产能负荷</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs">
          <div className="text-2xl font-bold text-[#1E40AF]">8</div>
          <div className="text-xs text-[#64748B] mt-0.5">已下达制令单</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs">
          <div className="text-2xl font-bold text-[#2563EB]">4</div>
          <div className="text-xs text-[#64748B] mt-0.5">排产版本数</div>
        </div>
      </div>
       {/* 说明 Banner */}
      <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-start gap-2 shadow-2xs">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-blue-900">规则说明：</span>
          <p className="text-blue-800">页面初始化化时，自动查询查询当前日期向后14天数据。</p>
          <p className="text-blue-800">日排产区中默认没有数据，需要点击“自动排产”生成当天往后14天排产数据，并保存。原则上一天自动排产一次。第二天排产刷新之前未锁定排产数据。</p>
          <p className="text-blue-800">生成规则：</p>
          <p className="text-blue-800">         1、根据工单中线别、计划开始日期、优先级，按可排产时间、可排产工单数量计算出排产工单的排序时段计算当日排产数量与时间段</p>
          <p className="text-blue-800">         2、自动排产时，未完成工单优先排产，自动排产运行时的日期与工单计划开始与计划结束的日期交集，做可排产日期计算</p>
          <p className="text-blue-800">         3、工单可排产数量=工单计划数量-工单实际数-当日已锁定排产数量（制令单计划数量）</p>
          <p className="text-blue-800">         4、可排产日期、工厂日历基本单位都是工作日。</p>
          <p className="text-blue-800">         5、可排产时间=工作日当日08:30-次日08:30-工厂日历中休息时间段。</p>
           <p className="text-blue-800">        6、可排产时间要排产锁定时间段，已生成制令单的时间段。</p>
          <p className="text-blue-800">         7、排产工单以工作日基本单元，时间段显示、中间包含厂日历中休息时间段。</p>
          <p className="text-blue-800">         8、“生成制令单” 选择已排产工单日期，批量转换为制令单。转换前系统检查排产工单状态是否齐套。</p>
          <p className="text-blue-800">         9、工单日排产状态；已排产、已齐套、已锁定(已生成制令单)、已生产。</p>
          <p className="text-blue-800">         10、可排产工单取排产日期范围在工单计划开始与计划结束日期之间工单。</p>
          <p className="text-blue-800">         11、支持24小时时间轴直接拖拽调整工单排产时段与时长，支持智能排序与联动顺延模式（支持1m/5m/15m/30m精度吸附），已锁定/已生产工单受保护不可移动。</p>
          <p className="text-blue-800">         12、智能排序：不改时长仅调整顺序，联动顺延：移动当前工单排产工与时长动作，自动调整后续工单排产时间。精度吸附：表示手动调整时长精度最小单位。</p>
          <p className="text-blue-800">         13、支持一键【冻结排产 / 解冻排产】：处于冻结保护状态时，甘特图工单禁止拖拉调整，自动排产禁止覆盖，工单具备与锁定状态相同的防篡改保护。</p>
        </div>
      </div>
      {/* Query Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4">
        <div className="text-xs font-bold text-[#1E293B] mb-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#2563EB]" />
            <span>排产查询条件（日期范围最少14天，起始时间今天）</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#64748B]">当前排产显示区间：</span>
            <span className="font-bold text-[#1E40AF] bg-[#EBF2FF] px-2 py-0.5 rounded-md font-mono">
              {queryStartDate} ~ {queryEndDate}（共 {displayDays.length} 天）
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] whitespace-nowrap">组织:</span>
            <select className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] text-xs">
              <option>昇兴集团</option>
              <option>三片事业部</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] whitespace-nowrap font-medium">日期范围:</span>
            <input
              type="date"
              value={queryStartDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="p-1.5 border border-[#E5E9F0] rounded-xl text-[#1E293B] bg-white font-mono text-xs focus:ring-1 focus:ring-[#2563EB]"
            />
            <span className="text-[#64748B]">至</span>
            <input
              type="date"
              value={queryEndDate}
              min={ymd(addDays(new Date(queryStartDate + 'T00:00:00'), 13))}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="p-1.5 border border-[#E5E9F0] rounded-xl text-[#1E293B] bg-white font-mono text-xs focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="inline-flex border border-[#E5E9F0] rounded-xl overflow-hidden bg-white p-0.5">
            <button
              onClick={() => handleSetPresetRange(14)}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                displayDays.length === 14 ? 'bg-[#2563EB] text-white font-medium shadow-2xs' : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
            >
              14天
            </button>
            <button
              onClick={() => handleSetPresetRange(21)}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                displayDays.length === 21 ? 'bg-[#2563EB] text-white font-medium shadow-2xs' : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
            >
              21天
            </button>
            <button
              onClick={() => handleSetPresetRange(30)}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                displayDays.length === 30 ? 'bg-[#2563EB] text-white font-medium shadow-2xs' : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
            >
              30天
            </button>
            <button
              onClick={() => handleSetPresetRange('month')}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer text-[#1E40AF] hover:bg-[#EDF2F7]`}
            >
              本月
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] whitespace-nowrap">线体:</span>
            <select
              value={queryLine}
              onChange={(e) => setQueryLine(e.target.value)}
              className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] text-xs cursor-pointer"
            >
              <option value="">全部线体</option>
              {FACTORY_LINES.map((l) => (
                <option key={l} value={l}>
                  {teamOf(l)} ({l})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onShowToast(`✅ 查询条件已更新：${queryStartDate} ~ ${queryEndDate}（共 ${displayDays.length} 天）`, 'success')}
            className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#165DFF] transition shadow-2xs cursor-pointer"
          >
            查询
          </button>
        </div>
      </div>

      {/* Schedule Main Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-3.5 px-5 border-b border-[#E5E9F0] flex flex-wrap items-center justify-between gap-2 bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1E293B]">🎯 日排产区</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBF2FF] text-[#1E40AF] font-medium">
              多版本对比
            </span>
            {isScheduleFrozen && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold border border-cyan-300 flex items-center gap-1 shadow-2xs animate-pulse">
                <Snowflake className="w-3.5 h-3.5 text-cyan-600 animate-spin" style={{ animationDuration: '6s' }} />
                排产已冻结保护
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* 冻结 / 解冻 排产按钮 */}
            <button
              onClick={handleToggleFreeze}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer border ${
                isScheduleFrozen
                  ? 'bg-cyan-700 hover:bg-cyan-800 text-white border-cyan-600'
                  : 'bg-white border-[#E5E9F0] text-[#1E293B] hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300'
              }`}
              title={
                isScheduleFrozen
                  ? '当前排产已冻结（防覆盖保护中），点击解冻'
                  : '点击冻结当前排产（开启防覆盖保护，禁止甘特图拖拉与自动排产覆盖）'
              }
            >
              <Snowflake
                className={`w-3.5 h-3.5 ${
                  isScheduleFrozen ? 'text-cyan-200 fill-cyan-200' : 'text-cyan-600'
                }`}
              />
              <span>{isScheduleFrozen ? '解冻排产' : '冻结排产'}</span>
            </button>

            {/* 自动排产按钮 */}
            <button
              onClick={() => {
                if (isScheduleFrozen) {
                  onShowToast(
                    '❄️ 当前排产处于【已冻结】保护状态，禁止自动排产算法覆盖！如需重新排产，请先点击【解冻排产】。',
                    'warning'
                  );
                  return;
                }
                onShowToast('自动排产算法运行完成！已根据产线产能与约束条件完成最佳智能排产。', 'success');
              }}
              disabled={isScheduleFrozen}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 shadow-2xs ${
                isScheduleFrozen
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75'
                  : 'bg-[#165DFF] text-white hover:bg-[#0E4FD6] cursor-pointer'
              }`}
              title={
                isScheduleFrozen
                  ? '🔒 排产已冻结保护，禁止自动排产覆盖。如需排产请先解冻。'
                  : '运行智能自动排产算法'
              }
            >
              {isScheduleFrozen ? (
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              )}
              <span>自动排产{isScheduleFrozen ? ' (已冻结禁止覆盖)' : ''}</span>
            </button>
            <button
              onClick={() => setIsBatchKitModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-medium hover:bg-teal-800 transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>齐套运算</span>
            </button>
            <div className="relative inline-flex items-center">
              <button
                onClick={() => {
                  onOpenGenerateModal();
                }}
               
                className="px-3.5 py-1.5 bg-[#165DFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0E4FD6] transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>
                  生成制令单 {selectedCount > 0 ? `(${selectedCount})` : ''}
                </span>
              </button>
            </div>
            <button
              onClick={() => setIsImportMOModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-xl text-xs font-semibold hover:bg-[#165DFF] transition flex items-center gap-1 shadow-2xs cursor-pointer"
              title="导入外部MES/ERP制令单并自动锁定日排产"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>导入制令单</span>
            </button>
            <button
              onClick={() => onShowToast('📤 排产表导出成功', 'success')}
              className="px-3.5 py-1.5 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] transition flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
          </div>
        </div>

        {/* View Action Sub-bar */}
        <div className="p-2.5 px-4 border-b border-[#E5E9F0] bg-white flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setViewState({ ...viewState, cap: !viewState.cap })}
            className={`px-3 py-1 rounded-xl border text-xs font-medium transition ${
              viewState.cap
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#1E40AF] border-[#E5E9F0] hover:bg-[#EDF2F7]'
            }`}
          >
            {viewState.cap ? '隐藏产能列' : '显示产能列'}
          </button>
          <button
            onClick={() => setViewState({ ...viewState, actual: !viewState.actual })}
            className={`px-3 py-1 rounded-xl border text-xs font-medium transition ${
              viewState.actual
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#1E40AF] border-[#E5E9F0] hover:bg-[#EDF2F7]'
            }`}
          >
            {viewState.actual ? '隐藏实际' : '显示实际'}
          </button>
          <button
            onClick={() => setViewState({ ...viewState, var: !viewState.var })}
            className={`px-3 py-1 rounded-xl border text-xs font-medium transition ${
              viewState.var
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#1E40AF] border-[#E5E9F0] hover:bg-[#EDF2F7]'
            }`}
          >
            {viewState.var ? '隐藏差异分析' : '显示差异分析'}
          </button>

          <button
            onClick={handleDeleteCheckedWOs}
            className="px-3 py-1 rounded-xl border border-[#EA580C]/30 bg-[#EA580C]/10 text-[#EA580C] hover:bg-[#EA580C]/20 font-medium transition ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
            删除选中
          </button>
        </div>

        {/* Legend */}
        <div className="p-2.5 px-4 border-b border-[#E5E9F0] bg-[#FFFFFF] flex items-center gap-4 text-xs flex-wrap">
          <span className="font-semibold text-[#1E40AF]">状态说明:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs" />
            <span className="text-[#1E293B] font-medium">已排产</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-2xs" />
            <span className="text-[#1E293B] font-medium">已齐套</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-2xs" />
            <span className="text-[#1E293B] font-medium">已锁定</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-2xs" />
            <span className="text-[#1E293B] font-medium">已生产</span>
          </span>
        </div>

        {/* 14-Day Overview Heatmap */}
        <div className="p-4 border-b border-[#E5E9F0] bg-[#FFFFFF]">
          <div className="text-xs font-bold text-[#1E293B] mb-2 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>📆 {displayDays.length}天排产总览（{queryStartDate} ~ {queryEndDate}）（点击日期格可直接切换日排产）</span>
              <span className="text-[11px] font-normal text-[#1E40AF] bg-[#EBF2FF] px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="font-semibold text-[#2D3325]">计划:</span> 计划排产 · <span className="font-semibold text-blue-700">实际:</span> 实际产量
              </span>
            </div>
            <span className="text-[#64748B] font-normal">
              当前选择: <b className="text-[#2563EB] font-bold">{selectedDate}</b>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E5E9F0] bg-white">
            <table className="w-full text-center text-xs border-collapse min-w-max">
              <thead>
                <tr className="bg-[#FFFFFF] text-[#1E40AF] border-b border-[#E5E9F0]">
                  <th className="p-2 border-r border-[#E5E9F0] font-semibold sticky left-0 bg-[#FFFFFF] min-w-[90px] text-left text-[#1E293B]">
                    线别 \ 日期
                  </th>
                  {displayDays.map((d) => (
                    <th
                      key={d.date}
                      className={`p-1.5 border-r border-[#E5E9F0] min-w-[62px] ${
                        d.isToday
                          ? 'border-l-2 border-l-[#2563EB] bg-[#EBF2FF] text-[#1E293B] font-bold'
                          : d.date === selectedDate
                          ? 'bg-[#EBF2FF]'
                          : d.doff > 0
                          ? 'bg-[#FFFFFF]'
                          : ''
                      }`}
                    >
                      <div>{d.md}</div>
                      <div className="text-[10px] text-[#64748B] font-normal">
                        周{d.wd}
                      </div>
                    </th>
                  ))}
                  {/* Summary Column Header */}
                  <th className="p-1.5 border-r border-[#E5E9F0] min-w-[75px] bg-[#EBF2FF] text-[#2D3325] font-bold">
                    <div>汇总</div>
                    <div className="text-[10px] text-[#1E40AF] font-normal">全期合计</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(queryLine ? FACTORY_LINES.filter((l) => l === queryLine) : FACTORY_LINES).map((line) => (
                  <tr key={line} className="border-b border-[#EDF2F7]">
                    <td className="p-2 border-r border-[#E5E9F0] font-semibold text-left sticky left-0 bg-white text-[#1E293B]">
                      <div>{line}</div>
                      <div className="text-[10px] text-[#64748B]">{teamOf(line)}</div>
                    </td>
                    {displayDays.map((d) => {
                      const dayWOs = workOrders.filter(
                        (r) =>
                          r.line === line &&
                          r.date === d.date &&
                          (!queryKeyword ||
                            r.id.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                            r.product.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                            (r.soNo && r.soNo.toLowerCase().includes(queryKeyword.toLowerCase())))
                      );
                      const qty = dayWOs.reduce(
                        (s, r) => s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover)),
                        0
                      );
                      const actualQty = dayWOs.reduce((s, r) => {
                        if (r.doneQty != null && r.doneQty > 0 && r.doneQty !== 999999999) {
                          return s + r.doneQty;
                        }
                        if (r.doneQty === 999999999) {
                          return s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover));
                        }
                        if (r.actual) {
                          return s + qtyOf(r.actual.start, r.actual.end, r.hourCap, r.changeoverActual ?? r.changeover);
                        }
                        return s;
                      }, 0);
                      const cnt = dayWOs.length;
                      const isSelected = d.date === selectedDate;

                      // Calculate cell status info and styling
                      const getCellStatusInfo = (wos: typeof dayWOs) => {
                        if (!wos.length) return null;
                        const counts: Record<string, number> = {
                          scheduled: 0,
                          kitted: 0,
                          locked: 0,
                          produced: 0,
                        };
                        wos.forEach((wo) => {
                          let st: StatusType = wo.status || 'scheduled';
                          if (st === 'normal') st = 'produced';
                          else if (st === 'saving') st = 'kitted';
                          else if (st === 'lack' || st === 'rest') st = 'scheduled';
                          else if (st === 'maint') st = 'locked';
                          counts[st] = (counts[st] || 0) + 1;
                        });

                        const order: StatusType[] = ['produced', 'locked', 'kitted', 'scheduled'];
                        let dominant: StatusType = 'scheduled';
                        let maxCount = -1;
                        for (const st of order) {
                          if ((counts[st] || 0) > maxCount) {
                            maxCount = counts[st] || 0;
                            dominant = st;
                          }
                        }

                        const distinctStatuses = order.filter((st) => (counts[st] || 0) > 0);

                        const statusStyleMap: Record<
                          string,
                          {
                            bgRgb: string;
                            badgeCls: string;
                            textColor: string;
                            label: string;
                          }
                        > = {
                          scheduled: {
                            bgRgb: '37, 99, 235', // blue-600
                            badgeCls: 'bg-blue-100 text-blue-800 border-blue-200',
                            textColor: '#1d4ed8',
                            label: '已排产',
                          },
                          kitted: {
                            bgRgb: '5, 150, 105', // emerald-600
                            badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                            textColor: '#047857',
                            label: '已齐套',
                          },
                          locked: {
                            bgRgb: '217, 119, 6', // amber-600
                            badgeCls: 'bg-amber-100 text-amber-800 border-amber-200',
                            textColor: '#b45309',
                            label: '已锁定',
                          },
                          produced: {
                            bgRgb: '124, 58, 237', // purple-600
                            badgeCls: 'bg-purple-100 text-purple-800 border-purple-200',
                            textColor: '#6d28d9',
                            label: '已生产',
                          },
                        };

                        return {
                          dominant,
                          info: statusStyleMap[dominant] || statusStyleMap.scheduled,
                          distinctStatuses,
                          counts,
                        };
                      };

                      const stInfo = getCellStatusInfo(dayWOs);

                      return (
                        <td
                          key={d.date}
                          onClick={() => onSelectDate(d.date)}
                          className={`p-1.5 border-r border-[#E5E9F0] cursor-pointer transition relative ${
                            isSelected ? 'ring-2 ring-[#2563EB] ring-inset z-10 shadow-sm' : ''
                          } ${
                            d.isToday ? 'border-l-2 border-l-[#2563EB]' : ''
                          } ${qty === 0 && actualQty === 0 ? 'bg-[#FFFFFF] text-[#64748B]' : 'hover:brightness-95'}`}
                          style={
                            qty > 0 || actualQty > 0
                              ? {
                                  backgroundColor: `rgba(34, 197, 94, ${
                                    0.12 + Math.min(qty / 1200000, 0.55)
                                  })`,
                                }
                              : undefined
                          }
                          title={`${line} · ${d.date}\n主状态: ${stInfo?.info.label || '无'}\n计划排产: ${qty.toLocaleString()} 件\n实际产量: ${actualQty.toLocaleString()} 件\n工单数: ${cnt} 单`}
                        >
                          {qty > 0 || actualQty > 0 ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between gap-1 text-[10px] leading-tight">
                                <span className="text-[#1E293B] font-medium scale-90 origin-left">计划:</span>
                                <span className="font-bold text-[11px] text-[#2D3325] font-mono">
                                  {fmtK(qty)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[10px] leading-tight border-t border-black/5 pt-0.5">
                                <span className="text-blue-700 font-medium scale-90 origin-left">实际:</span>
                                <span className={`font-bold text-[10px] font-mono ${actualQty > 0 ? 'text-blue-800' : 'text-[#64748B]'}`}>
                                  {actualQty > 0 ? fmtK(actualQty) : '—'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-black/5">
                                {stInfo && (
                                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold border shadow-2xs ${stInfo.info.badgeCls}`}>
                                    {stInfo.info.label}
                                  </span>
                                )}
                                <div className="flex items-center gap-1 ml-auto">
                                  {stInfo && stInfo.distinctStatuses.length > 1 && (
                                    <div className="flex items-center gap-0.5">
                                      {stInfo.distinctStatuses.map((s) => (
                                        <span
                                          key={s}
                                          className="w-1.5 h-1.5 rounded-full"
                                          style={{ backgroundColor: STATUS_MAP[s]?.color || '#2563eb' }}
                                          title={`${STATUS_MAP[s]?.label}: ${stInfo.counts[s]}单`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                  <span className="text-[9px] font-bold font-mono" style={{ color: stInfo?.info.textColor }}>
                                    {cnt}单
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    {/* Line Summary Column Cell */}
                    {(() => {
                      const lineWOs = workOrders.filter(
                        (r) =>
                          r.line === line &&
                          displayDays.some((d) => d.date === r.date) &&
                          (!queryKeyword ||
                            r.id.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                            r.product.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                            (r.soNo && r.soNo.toLowerCase().includes(queryKeyword.toLowerCase())))
                      );
                      const lineQty = lineWOs.reduce(
                        (s, r) => s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover)),
                        0
                      );
                      const lineActualQty = lineWOs.reduce((s, r) => {
                        if (r.doneQty != null && r.doneQty > 0 && r.doneQty !== 999999999) {
                          return s + r.doneQty;
                        }
                        if (r.doneQty === 999999999) {
                          return s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover));
                        }
                        if (r.actual) {
                          return s + qtyOf(r.actual.start, r.actual.end, r.hourCap, r.changeoverActual ?? r.changeover);
                        }
                        return s;
                      }, 0);
                      const lineCnt = lineWOs.length;

                      return (
                        <td
                          className="p-1.5 border-r border-[#E5E9F0] bg-[#F8FAFC]/80 text-[#2D3325] font-semibold text-center"
                          title={`${line} 全期汇总\n计划总排产: ${lineQty.toLocaleString()} 件\n实际总产量: ${lineActualQty.toLocaleString()} 件\n工单总数: ${lineCnt} 单`}
                        >
                          {lineQty > 0 || lineActualQty > 0 ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between gap-1 text-[10px] leading-tight">
                                <span className="text-[#1E293B] font-medium scale-90 origin-left">计划:</span>
                                <span className="font-bold text-[11px] text-[#2D3325] font-mono">
                                  {fmtK(lineQty)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[10px] leading-tight border-t border-black/5 pt-0.5">
                                <span className="text-blue-700 font-medium scale-90 origin-left">实际:</span>
                                <span className={`font-bold text-[10px] font-mono ${lineActualQty > 0 ? 'text-blue-800' : 'text-[#64748B]'}`}>
                                  {lineActualQty > 0 ? fmtK(lineActualQty) : '—'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-black/5 text-[9px]">
                                <span className="font-mono text-[9px] text-[#2563EB] font-bold">
                                  {lineQty > 0 ? `${Math.round((lineActualQty / lineQty) * 100)}%` : '0%'}
                                </span>
                                <span className="font-bold font-mono text-[#1E293B] ml-auto">
                                  {lineCnt}单
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })()}
                  </tr>
                ))}
                {/* 汇总行 (Summary Row) */}
                {(() => {
                  const activeLines = queryLine ? FACTORY_LINES.filter((l) => l === queryLine) : FACTORY_LINES;
                  const grandWOs = workOrders.filter(
                    (r) =>
                      activeLines.includes(r.line) &&
                      displayDays.some((d) => d.date === r.date) &&
                      (!queryKeyword ||
                        r.id.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                        r.product.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                        (r.soNo && r.soNo.toLowerCase().includes(queryKeyword.toLowerCase())))
                  );
                  const grandQty = grandWOs.reduce(
                    (s, r) => s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover)),
                    0
                  );
                  const grandActualQty = grandWOs.reduce((s, r) => {
                    if (r.doneQty != null && r.doneQty > 0 && r.doneQty !== 999999999) {
                      return s + r.doneQty;
                    }
                    if (r.doneQty === 999999999) {
                      return s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover));
                    }
                    if (r.actual) {
                      return s + qtyOf(r.actual.start, r.actual.end, r.hourCap, r.changeoverActual ?? r.changeover);
                    }
                    return s;
                  }, 0);
                  const grandCnt = grandWOs.length;

                  return (
                    <tr className="border-t-2 border-[#CBD5E1] bg-[#F8FAFC] font-semibold">
                      <td className="p-2 border-r border-[#E5E9F0] font-bold text-left sticky left-0 bg-[#EBF2FF] text-[#2D3325] z-10 shadow-2xs">
                        <div className="font-bold text-[#2D3325]">合计</div>
                        <div className="text-[10px] text-[#1E40AF] font-normal">全线汇总</div>
                      </td>
                      {displayDays.map((d) => {
                        const dayWOs = workOrders.filter(
                          (r) =>
                            activeLines.includes(r.line) &&
                            r.date === d.date &&
                            (!queryKeyword ||
                              r.id.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                              r.product.toLowerCase().includes(queryKeyword.toLowerCase()) ||
                              (r.soNo && r.soNo.toLowerCase().includes(queryKeyword.toLowerCase())))
                        );
                        const dayQty = dayWOs.reduce(
                          (s, r) => s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover)),
                          0
                        );
                        const dayActualQty = dayWOs.reduce((s, r) => {
                          if (r.doneQty != null && r.doneQty > 0 && r.doneQty !== 999999999) {
                            return s + r.doneQty;
                          }
                          if (r.doneQty === 999999999) {
                            return s + (r.planQty || qtyOf(r.start, r.end, r.hourCap, r.changeover));
                          }
                          if (r.actual) {
                            return s + qtyOf(r.actual.start, r.actual.end, r.hourCap, r.changeoverActual ?? r.changeover);
                          }
                          return s;
                        }, 0);
                        const dayCnt = dayWOs.length;

                        return (
                          <td
                            key={`total-${d.date}`}
                            className={`p-1.5 border-r border-[#E5E9F0] bg-[#F8FAFC] text-[#2D3325] ${
                              d.isToday ? 'border-l-2 border-l-[#2563EB]' : ''
                            }`}
                            title={`全线 · ${d.date}\n计划总排产: ${dayQty.toLocaleString()} 件\n实际总产量: ${dayActualQty.toLocaleString()} 件\n工单总数: ${dayCnt} 单`}
                          >
                            {dayQty > 0 || dayActualQty > 0 ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between gap-1 text-[10px] leading-tight">
                                  <span className="text-[#1E293B] font-medium scale-90 origin-left">计划:</span>
                                  <span className="font-bold text-[11px] text-[#2D3325] font-mono">
                                    {fmtK(dayQty)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-1 text-[10px] leading-tight border-t border-black/5 pt-0.5">
                                  <span className="text-blue-700 font-medium scale-90 origin-left">实际:</span>
                                  <span className={`font-bold text-[10px] font-mono ${dayActualQty > 0 ? 'text-blue-800' : 'text-[#64748B]'}`}>
                                    {dayActualQty > 0 ? fmtK(dayActualQty) : '—'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-black/5 text-[9px]">
                                  <span className="font-mono text-[9px] text-[#2563EB] font-bold">
                                    {dayQty > 0 ? `${Math.round((dayActualQty / dayQty) * 100)}%` : '0%'}
                                  </span>
                                  <span className="font-bold font-mono text-[#1E293B] ml-auto">
                                    {dayCnt}单
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                      {/* 汇总行 x 汇总列 交叉单元格 (Grand Total) */}
                      <td
                        className="p-1.5 border-r border-[#E5E9F0] bg-[#EBF2FF] text-[#2D3325] font-bold text-center"
                        title={`全线全期总计\n计划总排产: ${grandQty.toLocaleString()} 件\n实际总产量: ${grandActualQty.toLocaleString()} 件\n工单总数: ${grandCnt} 单`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-1 text-[10px] leading-tight">
                            <span className="text-[#2D3325] font-bold scale-90 origin-left">总计:</span>
                            <span className="font-extrabold text-[11px] text-[#2D3325] font-mono">
                              {fmtK(grandQty)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-[10px] leading-tight border-t border-black/10 pt-0.5">
                            <span className="text-blue-800 font-bold scale-90 origin-left">实际:</span>
                            <span className="font-extrabold text-[10px] text-blue-900 font-mono">
                              {grandActualQty > 0 ? fmtK(grandActualQty) : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-black/10 text-[9px]">
                            <span className="font-mono text-[9px] text-[#1E40AF] font-bold">
                              {grandQty > 0 ? `${Math.round((grandActualQty / grandQty) * 100)}%` : '0%'}
                            </span>
                            <span className="font-bold font-mono text-[#2D3325] ml-auto">
                              {grandCnt}单
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected WO Action Panel */}
        {selectedWO && (
          <div className="m-4 border border-amber-300 rounded-xl bg-amber-50/70 p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <div className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <span>📅 排产工单操作 · </span>
                <span className="font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {selectedWO.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedWOId(null)}
                className="text-amber-700 hover:bg-amber-100 p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5">工单号</span>
                <span className="font-mono font-bold text-gray-900">{selectedWO.id}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">排产日期</span>
                <span className="font-bold text-gray-900">
                  {selectedWO.date} 周{weekdayOf(selectedWO.date)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">工单状态</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_MAP[dpStatus]?.color || '#2563eb' }}
                  />
                  <select
                    value={dpStatus}
                    onChange={(e) => setDpStatus(e.target.value as StatusType)}
                    className="p-1 border border-gray-300 rounded bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none w-28 cursor-pointer"
                  >
                    <option value="scheduled">已排产</option>
                    <option value="kitted">已齐套</option>
                    <option value="locked">已锁定</option>
                    <option value="produced">已生产</option>
                  </select>
                </div>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">小时产能 (件/h)</span>
                <input
                  type="number"
                  value={dpCap}
                  onChange={(e) => setDpCap(parseInt(e.target.value, 10) || 0)}
                  className="p-1 border border-gray-300 rounded bg-white font-mono font-bold text-blue-600 text-xs w-28"
                />
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">开始时间</span>
                <input
                  type="time"
                  value={dpStart}
                  onChange={(e) => setDpStart(e.target.value)}
                  className="p-1 border border-gray-300 rounded bg-white text-xs w-28"
                />
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">结束时间</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={dpEnd}
                    onChange={(e) => setDpEnd(e.target.value)}
                    className="p-1 border border-gray-300 rounded bg-white text-xs w-28"
                  />
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dpNext}
                      onChange={(e) => setDpNext(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>跨天(+1)</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">排产数量 (自动扣换型)</span>
                <span className="text-base font-extrabold text-blue-700 font-mono">
                  {qtyOf(
                    dpStart,
                    dpNext ? `${dpEnd}+1` : dpEnd,
                    dpCap,
                    dpChangeover
                  ).toLocaleString()}
                  <span className="text-xs text-gray-500 font-normal ml-1">件</span>
                </span>
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">标准换型 / 工时选择</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <select
                    value={dpCoType}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setDpCoType(newCode);
                      const matched = INITIAL_CHANGEOVER_DATA.find((c) => c.code === newCode);
                      if (matched) {
                        setDpChangeover(matched.hoursH);
                      } else if (newCode === 'none') {
                        setDpChangeover(0);
                      }
                    }}
                    className="p-1 border border-gray-300 rounded bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none max-w-[200px] cursor-pointer"
                  >
                    <option value="none">无换型 (0h)</option>
                    {INITIAL_CHANGEOVER_DATA.map((co) => (
                      <option key={co.code} value={co.code}>
                        {co.code} {co.desc} ({co.hoursH}h)
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-0.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      value={dpChangeover}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setDpChangeover(val);
                        if (!INITIAL_CHANGEOVER_DATA.some((c) => c.code === dpCoType && c.hoursH === val)) {
                          setDpCoType('custom');
                        }
                      }}
                      className="p-1 border border-gray-300 rounded bg-white text-xs w-16 font-mono font-bold text-amber-800 text-center"
                    />
                    <span className="text-gray-500 text-xs">h</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">实际换型 / 对比</span>
                <span
                  className={`font-bold ${
                    selectedWO.changeoverActual != null &&
                    dpChangeover - selectedWO.changeoverActual >= 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {selectedWO.changeoverActual != null
                    ? `${selectedWO.changeoverActual}h (${
                        dpChangeover - selectedWO.changeoverActual >= 0
                          ? '节约'
                          : '超支'
                      } ${Math.abs(
                        dpChangeover - selectedWO.changeoverActual
                      ).toFixed(1)}h)`
                    : '—'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={() =>
                  onOpenKitCheckModal(
                    selectedWO,
                    qtyOf(
                      dpStart,
                      dpNext ? `${dpEnd}+1` : dpEnd,
                      dpCap,
                      dpChangeover
                    ),
                    getBOM(selectedWO)
                  )
                }
                className="px-3 py-1.5 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition flex items-center gap-1 text-xs shadow-xs cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>齐套运算</span>
              </button>
              <button
                onClick={handleSaveSelectedWO}
                disabled={isScheduleFrozen}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 text-xs shadow-xs ${
                  isScheduleFrozen
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
                title={isScheduleFrozen ? '排产已冻结保护，禁止修改' : '保存修改'}
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存修改</span>
              </button>
              <button
                onClick={handleDeleteSelectedWO}
                disabled={isScheduleFrozen}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 text-xs shadow-xs ${
                  isScheduleFrozen
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                }`}
                title={isScheduleFrozen ? '排产已冻结保护，禁止删除' : '删除排产'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除排产</span>
              </button>
            </div>
          </div>
        )}

        {/* 24-Hour Interactive Timeline Gantt Chart */}
        <div className="p-4">
          <Gantt24HTimeline
            selectedDate={selectedDate}
            weekdayStr={weekdayOf(selectedDate)}
            workOrders={workOrders}
            onUpdateWorkOrders={onUpdateWorkOrders}
            calState={calState}
            selectedWOId={selectedWOId}
            onSelectWO={handleSelectWO}
            onToggleCheckWO={handleToggleCheckWO}
            viewState={viewState}
            onShowToast={onShowToast}
            onSyncSelectedWOTime={handleSyncSelectedWOTime}
            isScheduleFrozen={isScheduleFrozen}
            onToggleFreezeSchedule={handleToggleFreeze}
            onOpenInsertModal={onOpenInsertModal}
          />
        </div>
      </div>

      {/* Batch Kit Check Modal */}
      <BatchKitCheckModal
        isOpen={isBatchKitModalOpen}
        onClose={() => setIsBatchKitModalOpen(false)}
        selectedDate={selectedDate}
        queryStartDate={queryStartDate}
        queryEndDate={queryEndDate}
        allDates={displayDays.map((d) => d.date)}
        workOrders={workOrders}
        kitData={kitData}
        packEdits={packEdits}
        onRunBatchKitCheck={(rangeDesc, totalOrders, okOrders, shortOrders) => {
          onShowToast(
            `⚡ 批量齐套运算完成！${rangeDesc} 共 ${totalOrders} 张工单（齐套 ${okOrders} 张，缺料 ${shortOrders} 张）`,
            'success'
          );
          if (onOpenKitCheckModal && selectedWO) {
            onOpenKitCheckModal(
              selectedWO,
              qtyOf(
                dpStart,
                dpNext ? `${dpEnd}+1` : dpEnd,
                dpCap,
                dpChangeover
              ),
              getBOM(selectedWO)
            );
          }
        }}
      />

      {/* Import MO Modal */}
      <ImportMOModal
        isOpen={isImportMOModalOpen}
        onClose={() => setIsImportMOModalOpen(false)}
        selectedDate={selectedDate}
        allDates={displayDays.map((d) => d.date)}
        existingWOs={workOrders}
        onConfirmImportMO={(importedWOs, count) => {
          onUpdateWorkOrders(importedWOs);
          onShowToast(`✅ 成功导入并锁定 ${count} 张制令单，排产计划已自动同步更新！`, 'success');
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
