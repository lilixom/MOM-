import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { WorkOrder, FactoryCalState, StatusType } from '../types';
import {
  STATUS_MAP,
  FACTORY_LINES,
  teamOf,
  capByLineMat,
} from '../mockData';
import {
  toHours,
  axisPct,
  fmtTickHM,
  windowSegs,
  qtyOf,
} from '../utils/timeUtils';
import {
  WIN_START_HOUR,
  WIN_TOTAL_MIN,
  timeStrToRelMin,
  relMinToTimeStr,
  snapRelMin,
  relMinDurationHours,
  fmtDuration,
  findConflictingWOs,
  applyRippleCascade,
  applySmartSortReorder,
  DraggedItemState,
} from '../utils/ganttDragUtils';
import {
  HelpCircle,
  MoveHorizontal,
  Lock,
  Snowflake,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon,
  Coffee,
  ChevronsRight,
  GripVertical,
  Plus,
} from 'lucide-react';

export type DragModeSetting = 'smart_sort' | 'ripple';
export type SnapSetting = 1 | 5 | 15 | 30;

interface Gantt24HTimelineProps {
  selectedDate: string;
  weekdayStr: string;
  workOrders: WorkOrder[];
  onUpdateWorkOrders: (wos: WorkOrder[]) => void;
  calState: FactoryCalState;
  selectedWOId: string | null;
  onSelectWO: (wo: WorkOrder) => void;
  onToggleCheckWO: (id: string, checked: boolean) => void;
  viewState: {
    cap: boolean;
    actual: boolean;
    var: boolean;
  };
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onSyncSelectedWOTime?: (newStart: string, newEnd: string, isNext: boolean) => void;
  isScheduleFrozen?: boolean;
  onToggleFreezeSchedule?: () => void;
  onOpenInsertModal?: () => void;
}

export const Gantt24HTimeline: React.FC<Gantt24HTimelineProps> = ({
  selectedDate,
  weekdayStr,
  workOrders,
  onUpdateWorkOrders,
  calState,
  selectedWOId,
  onSelectWO,
  onToggleCheckWO,
  viewState,
  onShowToast,
  onSyncSelectedWOTime,
  isScheduleFrozen = false,
  onToggleFreezeSchedule,
  onOpenInsertModal,
}) => {
  // Drag configuration states
  const [snapMinutes, setSnapMinutes] = useState<SnapSetting>(15);
  const [dragModeSetting, setDragModeSetting] = useState<DragModeSetting>('smart_sort');

  // History stack for Undo
  const [historyStack, setHistoryStack] = useState<WorkOrder[][]>([]);

  // Active drag state
  const [dragState, setDragState] = useState<DraggedItemState | null>(null);
  const [dragCursorX, setDragCursorX] = useState<number>(0);
  const [dragCursorY, setDragCursorY] = useState<number>(0);

  // Target line for cross-line drag
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  // Timeline horizontal scroll container ref & width
  const ganttScrollContainerRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState<number>(1440);

  // Timeline track container ref & line row refs
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const lineRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter current day WOs
  const dayWOs = useMemo(() => {
    return workOrders.filter((r) => r.date === selectedDate);
  }, [workOrders, selectedDate]);

  // Push current state to undo history
  const pushHistory = useCallback(() => {
    setHistoryStack((prev) => [...prev.slice(-15), JSON.parse(JSON.stringify(workOrders))]);
  }, [workOrders]);

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (!historyStack.length) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    onUpdateWorkOrders(previous);
    onShowToast('↶ 已撤销上一次排产拖拽变更', 'info');
  }, [historyStack, onUpdateWorkOrders, onShowToast]);

  // Ticks every 2 hours from 08:30 to 08:30+1 (total 13 major ticks)
  const TICKS = useMemo(() => {
    const arr = [];
    for (let k = 0; k <= 12; k++) {
      arr.push(WIN_START_HOUR + k * 2);
    }
    return arr;
  }, []);

  // Compute line-by-line arrangements, quantities, and matching row heights
  const lineData = useMemo(() => {
    return FACTORY_LINES.map((line) => {
      const wos = dayWOs.filter((r) => r.line === line);
      const sorted = [...wos].sort(
        (a, b) => toHours(a.start) - toHours(b.start)
      );

      // Multi-lane arrangement for overlapping times
      const lanes: number[] = [];
      sorted.forEach((wo) => {
        const s = toHours(wo.start);
        const e = toHours(wo.end);
        let placed = false;
        for (let i = 0; i < lanes.length; i++) {
          if (s >= lanes[i] - 1e-6) {
            lanes[i] = Math.max(lanes[i], e);
            wo._lane = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          wo._lane = lanes.length;
          lanes.push(e);
        }
      });

      const laneCount = wos.length ? Math.max(1, lanes.length) : 0;
      const totalQty = wos.reduce(
        (s, wo) =>
          s +
          (wo.rolled
            ? wo.planQty || 0
            : qtyOf(wo.start, wo.end, wo.hourCap, wo.changeover)),
        0
      );
      const actualLineQty = wos.reduce((s, wo) => {
        if (wo.doneQty != null && wo.doneQty > 0 && wo.doneQty !== 999999999) return s + wo.doneQty;
        if (wo.doneQty === 999999999) return s + (wo.planQty || qtyOf(wo.start, wo.end, wo.hourCap, wo.changeover));
        if (wo.actual) return s + qtyOf(wo.actual.start, wo.actual.end, wo.hourCap, wo.changeoverActual ?? wo.changeover);
        return s;
      }, 0);

      const cal = calState[`${selectedDate}|${line}`] || {
        hours: 24,
        type: 'work',
        rate: 1000,
      };
      const availH = cal.type === 'work' ? cal.hours : 0;
      const rate = cal.rate || 1000;
      const capacity = availH * rate;

      // Synchronized row height across Left frozen column, Gantt track, and Right frozen column
      const rowHeight = Math.max(laneCount * 36 + 18, 92);

      return {
        line,
        wos,
        sorted,
        laneCount,
        totalQty,
        actualLineQty,
        cal,
        availH,
        rate,
        capacity,
        rowHeight,
      };
    });
  }, [dayWOs, calState, selectedDate]);

  // Keyboard shortcut for Undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (historyStack.length > 0) {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, historyStack.length]);

  // Pointer drag move & up listeners
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!timelineContainerRef.current) return;
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      if (trackWidth <= 0) return;

      setDragCursorX(e.clientX);
      setDragCursorY(e.clientY);

      // Auto scroll Gantt horizontal container when dragging near viewport edges
      if (ganttScrollContainerRef.current) {
        const cRect = ganttScrollContainerRef.current.getBoundingClientRect();
        const edgeDist = 50;
        if (e.clientX < cRect.left + edgeDist && ganttScrollContainerRef.current.scrollLeft > 0) {
          ganttScrollContainerRef.current.scrollLeft -= 10;
        } else if (e.clientX > cRect.right - edgeDist) {
          ganttScrollContainerRef.current.scrollLeft += 10;
        }
      }

      // Check which line track the pointer is over
      let detectedLine: string | null = null;
      for (const line of FACTORY_LINES) {
        const rowEl = lineRowRefs.current[line];
        if (rowEl) {
          const rRect = rowEl.getBoundingClientRect();
          if (e.clientY >= rRect.top && e.clientY <= rRect.bottom) {
            detectedLine = line;
            break;
          }
        }
      }
      if (detectedLine) {
        setHoveredLine(detectedLine);
      }

      // Calculate relative minutes from mouse X position relative to track
      const relativeX = Math.max(0, Math.min(trackWidth, e.clientX - rect.left));
      const rawRelMin = (relativeX / trackWidth) * WIN_TOTAL_MIN;
      const snappedMin = snapRelMin(rawRelMin, snapMinutes);

      setDragState((prev) => {
        if (!prev) return null;

        const dur = prev.originalEndMin - prev.originalStartMin;
        const currentTargetLine = detectedLine || prev.targetLine;

        if (prev.dragMode === 'resize-end') {
          // Adjust end time, keeping start fixed
          let requestedEnd = Math.max(prev.currentStartMin + snapMinutes, snappedMin);
          requestedEnd = Math.min(WIN_TOTAL_MIN, requestedEnd);

          return {
            ...prev,
            currentEndMin: requestedEnd,
            targetLine: currentTargetLine,
          };
        }

        if (prev.dragMode === 'resize-start') {
          // Adjust start time, keeping end fixed
          let requestedStart = Math.min(prev.currentEndMin - snapMinutes, snappedMin);
          requestedStart = Math.max(0, requestedStart);

          return {
            ...prev,
            currentStartMin: requestedStart,
            targetLine: currentTargetLine,
          };
        }

        // prev.dragMode === 'move'
        // In move mode, we calculate mouse offset from the initial grab
        // snappedMin represents new center or start.
        // For precision, snap the shift:
        const mouseMinShift = snappedMin - snapRelMin(prev.originalStartMin, snapMinutes);
        let requestedStart = prev.originalStartMin + mouseMinShift;
        let requestedEnd = requestedStart + dur;

        // Boundary clamp [0, WIN_TOTAL_MIN]
        if (requestedStart < 0) {
          requestedStart = 0;
          requestedEnd = dur;
        } else if (requestedEnd > WIN_TOTAL_MIN) {
          requestedEnd = WIN_TOTAL_MIN;
          requestedStart = Math.max(0, WIN_TOTAL_MIN - dur);
        }

        requestedStart = snapRelMin(requestedStart, snapMinutes);
        requestedEnd = requestedStart + dur;

        return {
          ...prev,
          currentStartMin: requestedStart,
          currentEndMin: requestedEnd,
          targetLine: currentTargetLine,
        };
      });
    };

    const handlePointerUp = () => {
      if (!dragState) return;

      const { woId, currentStartMin, currentEndMin, originalStartMin, originalEndMin, targetLine, originalLine } = dragState;

      // Check if anything actually changed
      const hasChanged =
        currentStartMin !== originalStartMin ||
        currentEndMin !== originalEndMin ||
        targetLine !== originalLine;

      if (!hasChanged) {
        setDragState(null);
        setHoveredLine(null);
        return;
      }

      // Record undo state
      pushHistory();

      const newStartStr = relMinToTimeStr(currentStartMin);
      const newEndStr = relMinToTimeStr(currentEndMin);
      const isNextDay = newEndStr.includes('+1');

      const targetWO = workOrders.find((w) => w.id === woId);
      if (!targetWO) {
        setDragState(null);
        setHoveredLine(null);
        return;
      }

      // Hourly capacity for target line
      const lineHourlyCap = targetWO.hourCap || capByLineMat(targetLine, targetWO.matCode || '');
      const newPlanQty = qtyOf(newStartStr, newEndStr, lineHourlyCap, targetWO.changeover);

      let nextWOs: WorkOrder[] = [];

      if (dragModeSetting === 'smart_sort') {
        // Smart Reorder mode: strictly keep durations unchanged, reorder sequence
        nextWOs = applySmartSortReorder(
          woId,
          targetLine,
          originalLine,
          currentStartMin,
          originalStartMin,
          originalEndMin,
          workOrders,
          selectedDate
        );
      } else if (dragModeSetting === 'ripple') {
        // Apply ripple cascade
        nextWOs = applyRippleCascade(
          woId,
          targetLine,
          currentStartMin,
          currentEndMin,
          workOrders.map((w) => (w.id === woId ? { ...w, line: targetLine, team: teamOf(targetLine) } : w)),
          selectedDate
        );
      } else {
        // Standard or clamp update
        nextWOs = workOrders.map((w) => {
          if (w.id === woId) {
            return {
              ...w,
              line: targetLine,
              team: teamOf(targetLine),
              start: newStartStr,
              end: newEndStr,
              planQty: newPlanQty,
              hourCap: lineHourlyCap,
            };
          }
          return w;
        });
      }

      onUpdateWorkOrders(nextWOs);

      // Sync with Selected WO Panel if active
      if (selectedWOId === woId && onSyncSelectedWOTime) {
        onSyncSelectedWOTime(newStartStr, newEndStr.replace('+1', ''), isNextDay);
      }

      if (dragModeSetting === 'smart_sort') {
        onShowToast(
          `🔀 智能排序完成：线体【${targetLine}】已按新顺序重新排产，工单甘特图时长保持不变！`,
          'success'
        );
      } else {
        const durH = relMinDurationHours(currentStartMin, currentEndMin);
        onShowToast(
          `⏱️ 工单 [${woId}] 排产时间已更新：${newStartStr} → ${newEndStr} (${durH.toFixed(1)}h)${
            targetLine !== originalLine ? `，已移至线体【${targetLine}】` : ''
          }，排产量: ${newPlanQty.toLocaleString()} 件`,
          'success'
        );
      }

      setDragState(null);
      setHoveredLine(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [
    dragState,
    snapMinutes,
    dragModeSetting,
    workOrders,
    selectedDate,
    selectedWOId,
    pushHistory,
    onUpdateWorkOrders,
    onShowToast,
    onSyncSelectedWOTime,
  ]);

  // Initiate drag
  const startDrag = (
    e: React.PointerEvent,
    wo: WorkOrder,
    mode: 'move' | 'resize-start' | 'resize-end'
  ) => {
    // Prohibit dragging when schedule is frozen
    if (isScheduleFrozen) {
      e.stopPropagation();
      onShowToast('❄️ 当前排产处于【已冻结】保护状态，禁止拖拉调整工单时段与时长！如需调整请先点击【解冻排产】。', 'warning');
      return;
    }

    // Prohibit dragging for locked or produced work orders
    if (wo.status === 'locked' || wo.status === 'produced' || wo.generated) {
      e.stopPropagation();
      onShowToast(`🔒 该工单处于【${STATUS_MAP[wo.status]?.label || '已锁定'}】状态，禁止拖拽排产时间`, 'warning');
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Select the dragged WO
    onSelectWO(wo);

    const sMin = timeStrToRelMin(wo.start);
    const eMin = timeStrToRelMin(wo.end);

    setDragState({
      woId: wo.id,
      originalStartMin: sMin,
      originalEndMin: eMin,
      originalLine: wo.line,
      currentStartMin: sMin,
      currentEndMin: eMin,
      targetLine: wo.line,
      dragMode: mode,
    });

    setDragCursorX(e.clientX);
    setDragCursorY(e.clientY);
    setHoveredLine(wo.line);
  };

  // Dragging active order details
  const draggingWO = dragState ? workOrders.find((w) => w.id === dragState.woId) : null;
  const draggingConflicts = dragState
    ? findConflictingWOs(
        dragState.woId,
        dragState.targetLine,
        dragState.currentStartMin,
        dragState.currentEndMin,
        workOrders,
        selectedDate
      )
    : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden select-none">
      {/* 24-Hour Gantt Toolbar & Control Bar */}
      <div className="p-3 bg-slate-50/90 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Title & Date */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
              <MoveHorizontal className="w-4 h-4 text-blue-600" />
              24小时排产拖拽甘特图
            </span>
            <span className="text-gray-500 font-medium">
              （08:30 — 次日 08:30 · {selectedDate} 周{weekdayStr}）
            </span>
          </div>

          {/* Shift Badges Legend */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-600 border-l border-gray-300 pl-3">
            <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Sun className="w-3 h-3 text-amber-500" />
              白班 08:30-20:30
            </span>
            <span className="flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              <Moon className="w-3 h-3 text-indigo-500" />
              夜班 20:30-08:30+1
            </span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Snap Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">吸附粒度:</span>
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 shadow-2xs">
              {([1, 5, 15, 30] as SnapSetting[]).map((snap) => (
                <button
                  key={snap}
                  onClick={() => setSnapMinutes(snap)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                    snapMinutes === snap
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {snap}m
                </button>
              ))}
            </div>
          </div>

          {/* Collision Mode Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">排产模式:</span>
            <select
              value={dragModeSetting}
              onChange={(e) => setDragModeSetting(e.target.value as DragModeSetting)}
              className="p-1 border border-gray-300 rounded-lg bg-white text-xs font-semibold text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="smart_sort">智能排序 (不改时长·仅调顺序)</option>
              <option value="ripple">联动顺延 (后序工单顺延)</option>
            </select>
            <div className="group relative inline-flex items-center">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[11px] font-normal rounded-md px-2.5 py-1.5 shadow-xl whitespace-nowrap z-50">
                {dragModeSetting === 'smart_sort'
                  ? '智能排序：拖动改变工单队列先后顺序，工单甘特图时长完全锁定不变'
                  : '联动顺延：向后拖动工单时，自动顺延推迟同线后续所有未锁工单'}
              </div>
            </div>
          </div>

          {/* Timeline Zoom Scale */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">刻度:</span>
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 shadow-2xs">
              {[
                { label: '标准', width: 1440, desc: '1440px · 1px/分' },
                { label: '宽幅', width: 1920, desc: '1920px · 高清扩展' },
              ].map((scale) => (
                <button
                  key={scale.width}
                  type="button"
                  onClick={() => setTimelineWidth(scale.width)}
                  title={scale.desc}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition cursor-pointer ${
                    timelineWidth === scale.width
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {scale.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Shift View Jump */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-0.5 text-xs text-gray-600 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                if (ganttScrollContainerRef.current) {
                  ganttScrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }
              }}
              className="px-2 py-0.5 rounded hover:bg-amber-50 hover:text-amber-800 transition flex items-center gap-1 cursor-pointer font-medium"
              title="定位至白班时间轴起点 (08:30)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>白班 08:30</span>
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => {
                if (ganttScrollContainerRef.current) {
                  const nightOffset = timelineWidth * 0.45;
                  ganttScrollContainerRef.current.scrollTo({
                    left: Math.max(0, nightOffset),
                    behavior: 'smooth',
                  });
                }
              }}
              className="px-2 py-0.5 rounded hover:bg-indigo-50 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer font-medium"
              title="定位至夜班时间轴起点 (20:30)"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>夜班 20:30</span>
            </button>
          </div>

          {/* Add Work Order Schedule Button */}
          {onOpenInsertModal && (
            <button
              type="button"
              onClick={() => {
                if (isScheduleFrozen) {
                  onShowToast(
                    '❄️ 当前排产处于【已冻结】保护状态，禁止新增排产！如需新增排产请先解冻。',
                    'warning'
                  );
                  return;
                }
                onOpenInsertModal();
              }}
              disabled={isScheduleFrozen}
              className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition text-xs shadow-2xs ${
                isScheduleFrozen
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#D9C5B2] hover:bg-[#c9b39e] text-[#4A4E44] border-[#C5B09D] cursor-pointer'
              }`}
              title={
                isScheduleFrozen
                  ? '排产已冻结，禁止新增排产'
                  : '在甘特图中新增排产工单'
              }
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增排产</span>
            </button>
          )}

          {/* Freeze / Unfreeze Quick Button */}
          {onToggleFreezeSchedule && (
            <button
              type="button"
              onClick={onToggleFreezeSchedule}
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition text-xs shadow-2xs cursor-pointer ${
                isScheduleFrozen
                  ? 'bg-cyan-700 border-cyan-600 text-white hover:bg-cyan-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300'
              }`}
              title={
                isScheduleFrozen
                  ? '当前排产已冻结（防覆盖保护中），点击解冻'
                  : '点击冻结当前排产（防覆盖保护，禁止拖拽与自动排产覆盖）'
              }
            >
              <Snowflake
                className={`w-3.5 h-3.5 ${
                  isScheduleFrozen ? 'text-cyan-200 fill-cyan-200' : 'text-cyan-600'
                }`}
              />
              <span>{isScheduleFrozen ? '已冻结 (点击解冻)' : '冻结排产'}</span>
            </button>
          )}

          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={!historyStack.length || isScheduleFrozen}
            className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition text-xs shadow-2xs ${
              historyStack.length && !isScheduleFrozen
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-blue-600 cursor-pointer'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={isScheduleFrozen ? '排产已冻结，禁止撤销调整' : '撤销上一次排产拖拽变更 (Ctrl+Z)'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>撤销 ({historyStack.length})</span>
          </button>
        </div>
      </div>

      {/* Frozen State Alert Banner */}
      {isScheduleFrozen && (
        <div className="bg-cyan-50 border-t border-b border-cyan-200 px-4 py-2 flex items-center justify-between text-xs text-cyan-950">
          <div className="flex items-center gap-2 font-medium">
            <Snowflake
              className="w-4 h-4 text-cyan-600 animate-spin shrink-0"
              style={{ animationDuration: '8s' }}
            />
            <span>
              <b>排产已冻结保护：</b>当前排产处于冻结状态，所有工单禁止拖拉调整时段与伸缩时长，自动排产禁止覆盖，功能与锁定状态相同。
            </span>
          </div>
          {onToggleFreezeSchedule && (
            <button
              type="button"
              onClick={onToggleFreezeSchedule}
              className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-semibold text-xs transition cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
            >
              <Snowflake className="w-3 h-3 text-cyan-200" />
              <span>立即解冻</span>
            </button>
          )}
        </div>
      )}

      {/* 24-Hour Gantt Scheduling Matrix with Frozen Columns */}
      <div className="border-t border-gray-200 bg-white overflow-hidden">
        <div className="flex w-full items-stretch">
          {/* Column 1 (Left Frozen): 线别 / 班别 */}
          <div className="w-[170px] min-w-[170px] max-w-[170px] shrink-0 flex flex-col border-r border-gray-200 bg-white z-20 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]">
            {/* Header: 线别 / 班别 */}
            <div className="h-[52px] bg-slate-100 border-b border-gray-200 px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-700 select-none">
              <div className="flex items-center gap-1.5">
                <span>线别 / 班别</span>
                <div className="group relative inline-flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600 cursor-pointer" />
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block bg-gray-900 text-white text-[11px] font-normal rounded-md px-2.5 py-1 shadow-xl whitespace-nowrap z-50">
                    拖动工单横条调整时间，拖动两端手柄调整时长，支持跨产线拖拽
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-normal">{FACTORY_LINES.length}线</span>
            </div>

            {/* Line Rows */}
            {lineData.map((item) => (
              <div
                key={item.line}
                style={{ height: `${item.rowHeight}px` }}
                className={`p-2.5 border-b border-gray-200 bg-white font-semibold flex flex-col justify-between transition-colors overflow-hidden ${
                  hoveredLine === item.line && dragState ? 'bg-blue-50/70 ring-1 ring-blue-400 ring-inset' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-gray-900">{item.line}</span>
                    {dragState && dragState.targetLine === item.line && dragState.originalLine !== item.line && (
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px] font-medium animate-pulse shadow-2xs">
                        目标线体
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 font-normal">
                    {teamOf(item.line)} · {item.wos.length}个工单
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>排产 {item.totalQty.toLocaleString()}</span>
                    <div className="group relative inline-flex items-center">
                      <HelpCircle className="w-3 h-3 text-blue-400 hover:text-blue-700 cursor-pointer" />
                      <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[11px] font-normal rounded-md px-2.5 py-1 shadow-xl whitespace-nowrap z-50">
                        排产量 = 当前线体计划排产工单总量
                      </div>
                    </div>
                  </div>
                  {viewState.actual && item.actualLineQty > 0 && (
                    <div className="text-[11px] font-bold text-emerald-700">
                      实产 {item.actualLineQty.toLocaleString()}
                    </div>
                  )}
                  <div
                    className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      item.cal.type === 'work'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.cal.type === 'rest'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.cal.type === 'work'
                      ? `可用 ${item.availH}h`
                      : item.cal.type === 'rest'
                      ? '休息 · 无工时'
                      : '设备维修'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2 (Middle Scrollable): 24小时排产时间轴甘特图 (滚动条只针对甘特图列) */}
          <div
            ref={ganttScrollContainerRef}
            className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden bg-slate-50/20 custom-gantt-scrollbar"
          >
            <div
              ref={timelineContainerRef}
              style={{ width: `${timelineWidth}px` }}
              className="relative select-none"
            >
              {/* Timeline Header (h-[52px]) */}
              <div className="h-[52px] border-b border-gray-200 bg-slate-100 flex flex-col justify-between">
                {/* Shift Background Strip (h-6) */}
                <div className="h-6 flex border-b border-gray-200 text-[11px]">
                  {/* Day Shift: 08:30 -> 20:30 (50%) */}
                  <div className="w-1/2 bg-amber-50/70 border-r border-amber-200 flex items-center justify-center gap-1.5 text-amber-900 font-semibold">
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>白班生产窗口（08:30 — 20:30 · 12h）</span>
                  </div>
                  {/* Night Shift: 20:30 -> 08:30+1 (50%) */}
                  <div className="w-1/2 bg-indigo-50/70 flex items-center justify-center gap-1.5 text-indigo-900 font-semibold">
                    <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>夜班生产窗口（20:30 — 次日 08:30 · 12h）</span>
                  </div>
                </div>

                {/* Major Time Ticks Strip (h-6) */}
                <div className="h-6 relative bg-slate-50">
                  {TICKS.map((t) => {
                    const left = axisPct(t);
                    return (
                      <div
                        key={t}
                        className="absolute top-0 bottom-0 flex flex-col items-center"
                        style={{ left: `${left}%` }}
                      >
                        <div className="w-[1px] h-2 bg-gray-400" />
                        <span className="text-[10px] text-gray-600 font-mono -translate-x-1/2 whitespace-nowrap font-medium mt-0.5">
                          {fmtTickHM(t)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracks for Each Line */}
              {lineData.map((item) => {
                const line = item.line;
                const sorted = item.sorted;
                const isTargetLine = dragState && dragState.targetLine === line;

                return (
                  <div
                    key={line}
                    ref={(el) => {
                      lineRowRefs.current[line] = el;
                    }}
                    style={{ height: `${item.rowHeight}px` }}
                    className={`relative border-b border-gray-200 transition-colors ${
                      isTargetLine
                        ? 'bg-blue-50/40 ring-1 ring-blue-300 ring-inset'
                        : 'bg-white'
                    }`}
                  >
                    {/* Shift Divider: Midpoint 20:30 (50%) */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-indigo-300 pointer-events-none z-0 border-r border-dashed border-indigo-400 opacity-70" />

                    {/* Break Time Zones Shading */}
                    {/* Lunch Break: 11:30 - 12:30 */}
                    <div
                      className="absolute top-0 bottom-0 bg-gray-200/50 pointer-events-none z-0 border-x border-dashed border-gray-300 flex items-center justify-center"
                      style={{ left: '12.5%', width: '4.166%' }}
                      title="午餐休息 11:30 - 12:30"
                    >
                      <span className="text-[9px] text-gray-400 rotate-90 whitespace-nowrap select-none font-medium">午餐</span>
                    </div>
                    {/* Dinner Break: 17:30 - 18:30 */}
                    <div
                      className="absolute top-0 bottom-0 bg-gray-200/50 pointer-events-none z-0 border-x border-dashed border-gray-300 flex items-center justify-center"
                      style={{ left: '37.5%', width: '4.166%' }}
                      title="晚餐休息 17:30 - 18:30"
                    >
                      <span className="text-[9px] text-gray-400 rotate-90 whitespace-nowrap select-none font-medium">晚餐</span>
                    </div>
                    {/* Night Supper Break: 00:00 - 01:00+1 */}
                    <div
                      className="absolute top-0 bottom-0 bg-gray-200/50 pointer-events-none z-0 border-x border-dashed border-gray-300 flex items-center justify-center"
                      style={{ left: '64.58%', width: '4.166%' }}
                      title="宵夜休息 00:00 - 01:00+1"
                    >
                      <span className="text-[9px] text-gray-400 rotate-90 whitespace-nowrap select-none font-medium">宵夜</span>
                    </div>

                    {/* Ticks Grid Lines */}
                    {TICKS.map((t) => {
                      const left = axisPct(t);
                      return (
                        <div
                          key={t}
                          className="absolute top-0 bottom-0 w-[1px] bg-gray-200/70 pointer-events-none z-0"
                          style={{ left: `${left}%` }}
                        />
                      );
                    })}

                    {/* Active Drag Guideline */}
                    {dragState && dragState.targetLine === line && (
                      <>
                        <div
                          className="absolute top-0 bottom-0 w-[2px] bg-blue-600 z-30 pointer-events-none shadow-md"
                          style={{ left: `${(dragState.currentStartMin / WIN_TOTAL_MIN) * 100}%` }}
                        />
                        <div
                          className="absolute top-0 bottom-0 w-[2px] bg-blue-600 z-30 pointer-events-none shadow-md"
                          style={{ left: `${(dragState.currentEndMin / WIN_TOTAL_MIN) * 100}%` }}
                        />
                      </>
                    )}

                    {/* Work Order Bars */}
                    {sorted.map((wo) => {
                      const isDragging = dragState?.woId === wo.id;
                      const isSelected = selectedWOId === wo.id;
                      const isLocked = isScheduleFrozen || wo.status === 'locked' || wo.status === 'produced' || !!wo.generated;

                      let startMin = timeStrToRelMin(wo.start);
                      let endMin = timeStrToRelMin(wo.end);

                      if (isDragging && dragState) {
                        startMin = dragState.currentStartMin;
                        endMin = dragState.currentEndMin;
                      }

                      const sAbs = WIN_START_HOUR + startMin / 60;
                      const eAbs = WIN_START_HOUR + endMin / 60;
                      const segs = windowSegs(sAbs, eAbs);

                      const laneTop = (wo._lane || 0) * 36 + 6;
                      const st = STATUS_MAP[wo.status] || STATUS_MAP['scheduled'];

                      const qty = wo.rolled
                        ? wo.planQty || 0
                        : qtyOf(relMinToTimeStr(startMin), relMinToTimeStr(endMin), wo.hourCap, wo.changeover);

                      // Overlap detection
                      const hasConflict = item.wos.some((other) => {
                        if (other.id === wo.id) return false;
                        const oS = timeStrToRelMin(other.start);
                        const oE = timeStrToRelMin(other.end);
                        return Math.max(startMin, oS) < Math.min(endMin, oE) - 0.01;
                      });

                      return (
                        <React.Fragment key={wo.id}>
                          {segs.map((seg, si) => (
                            <div
                              key={si}
                              onClick={() => onSelectWO(wo)}
                              onPointerDown={(e) => {
                                startDrag(e, wo, 'move');
                              }}
                              title={`${wo.product} (${relMinToTimeStr(startMin)}→${relMinToTimeStr(endMin)}) 排产 ${qty.toLocaleString()} 件｜换型 ${wo.changeover}h${
                                isScheduleFrozen
                                  ? ' ❄️(排产已冻结·禁止拖拉调整)'
                                  : isLocked
                                  ? ' (已锁定)'
                                  : ' (可拖拽调整)'
                              }`}
                              className={`group absolute h-8 rounded-lg text-white text-[11px] font-semibold flex items-center justify-between px-2 shadow-xs transition-shadow ${
                                isLocked
                                  ? 'cursor-not-allowed opacity-90'
                                  : 'cursor-grab active:cursor-grabbing hover:brightness-105 hover:shadow-md'
                              } ${
                                isDragging
                                  ? 'ring-2 ring-blue-500 shadow-xl z-40 brightness-110 scale-[1.01]'
                                  : isSelected
                                  ? 'ring-2 ring-blue-600 ring-offset-1 z-20'
                                  : 'z-10'
                              } ${hasConflict ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                              style={{
                                top: `${laneTop}px`,
                                left: `${seg[0]}%`,
                                width: `${seg[1]}%`,
                                background: hasConflict
                                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                                  : st.bar,
                              }}
                            >
                              {/* Left Resize Handle (Start Time) */}
                              {!isLocked && dragModeSetting !== 'smart_sort' && si === 0 && (
                                <div
                                  onPointerDown={(e) => {
                                    startDrag(e, wo, 'resize-start');
                                  }}
                                  className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize flex items-center justify-center hover:bg-white/30 rounded-l-lg transition-colors group/left"
                                  title="拖动调整开始时间"
                                >
                                  <div className="w-[2px] h-3.5 bg-white/70 rounded-full group-hover/left:bg-white" />
                                </div>
                              )}

                              {/* Work Order Content */}
                              <div className="flex items-center gap-1.5 overflow-hidden pointer-events-none pl-1">
                                {si === 0 && (
                                  <input
                                    type="checkbox"
                                    checked={!!wo.selected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      onToggleCheckWO(wo.id, e.target.checked);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="w-3.5 h-3.5 cursor-pointer accent-white pointer-events-auto shrink-0"
                                  />
                                )}

                                {isScheduleFrozen ? (
                                  <Snowflake className="w-3 h-3 shrink-0 text-cyan-200" title="排产已冻结" />
                                ) : isLocked ? (
                                  <Lock className="w-3 h-3 shrink-0 text-white/80" />
                                ) : (
                                  <GripVertical className="w-3 h-3 shrink-0 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}

                                <span className="font-extrabold font-mono text-[11px] truncate">
                                  {wo.id}
                                </span>
                                {isScheduleFrozen && (
                                  <span className="text-[9px] bg-cyan-950/80 text-cyan-200 px-1 py-0.2 rounded font-bold shrink-0 flex items-center gap-0.5">
                                    <Snowflake className="w-2.5 h-2.5 text-cyan-300" />
                                    冻结
                                  </span>
                                )}
                                {isDragging && dragModeSetting === 'smart_sort' && (
                                  <span className="text-[9px] bg-emerald-500/90 text-white px-1 py-0.2 rounded font-bold shrink-0 shadow-2xs">
                                    智能排序
                                  </span>
                                )}
                                <span className="font-mono text-[10px] opacity-90 truncate hidden md:inline">
                                  {qty.toLocaleString()}件
                                </span>
                                {wo.changeover > 0 && (
                                  <span className="text-[9px] bg-black/25 px-1 py-0.2 rounded font-normal shrink-0">
                                    换{wo.changeover}h
                                  </span>
                                )}
                                {wo.rolled && (
                                  <span className="text-[9px] bg-amber-500/80 px-1 py-0.2 rounded font-bold shrink-0">
                                    顺延
                                  </span>
                                )}
                                {hasConflict && (
                                  <span className="text-[9px] bg-red-950/80 text-white px-1 py-0.2 rounded font-bold shrink-0 flex items-center gap-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    冲突
                                  </span>
                                )}
                              </div>

                              {/* Right side: Time and Right Resize Handle */}
                              <div className="flex items-center gap-1 ml-auto shrink-0 pointer-events-none pr-1">
                                <span className="text-[9px] font-mono opacity-85">
                                  {relMinToTimeStr(startMin)}→{relMinToTimeStr(endMin)}
                                </span>
                              </div>

                              {/* Right Resize Handle (End Time) */}
                              {!isLocked && dragModeSetting !== 'smart_sort' && (
                                <div
                                  onPointerDown={(e) => {
                                    startDrag(e, wo, 'resize-end');
                                  }}
                                  className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize flex items-center justify-center hover:bg-white/30 rounded-r-lg transition-colors group/right"
                                  title="拖动调整结束时间与排产量"
                                >
                                  <div className="w-[2px] h-3.5 bg-white/70 rounded-full group-hover/right:bg-white" />
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Actual Overlay */}
                          {viewState.actual && wo.actual && (
                            <>
                              {windowSegs(
                                toHours(wo.actual.start),
                                toHours(wo.actual.end)
                              ).map((seg, si) => (
                                <div
                                  key={si}
                                  className="absolute h-8 border-2 border-dashed border-blue-900 rounded-lg pointer-events-none opacity-80"
                                  style={{
                                    top: `${laneTop}px`,
                                    left: `${seg[0]}%`,
                                    width: `${seg[1]}%`,
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {!item.wos.length && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-medium pointer-events-none">
                        — 暂无排产工单，可从上方待排工单导入或手动新增 —
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3 (Right Frozen): 产能负荷分析 */}
          {viewState.cap && (
            <div className="w-[185px] min-w-[185px] max-w-[185px] shrink-0 flex flex-col border-l border-gray-200 bg-white z-20 shadow-[-2px_0_6px_-2px_rgba(0,0,0,0.06)]">
              {/* Header: 产能负荷分析 */}
              <div className="h-[52px] bg-slate-100 border-b border-gray-200 px-3 py-1 flex items-center justify-center text-xs font-semibold text-gray-700 select-none">
                <span>产能负荷分析</span>
              </div>

              {/* Capacity Load Rows */}
              {lineData.map((item) => (
                <div
                  key={item.line}
                  style={{ height: `${item.rowHeight}px` }}
                  className="p-2.5 border-b border-gray-200 bg-slate-50/70 text-xs flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="font-bold text-gray-800 flex items-center justify-between">
                      <span>产能分析</span>
                      <span className="text-[10px] text-gray-500 font-normal">
                        {item.capacity > 0 ? `${Math.min(Math.round((item.totalQty / item.capacity) * 100), 100)}%` : '0%'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {item.cal.type === 'work'
                        ? `可用 ${item.availH}h（${item.rate.toLocaleString()}/h）`
                        : '设备维修 / 休息'}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-700 font-semibold text-[11px] flex justify-between">
                      <span>日产能: {item.capacity.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-500">
                        剩 {Math.max(item.capacity - item.totalQty, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden my-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.capacity > 0 && item.totalQty > item.capacity
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                        }`}
                        style={{
                          width: `${
                            item.capacity > 0
                              ? Math.min(Math.round((item.totalQty / item.capacity) * 100), 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating HUD Tooltip when Dragging */}
      {dragState && draggingWO && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3 pb-2 transition-transform duration-75"
          style={{
            left: `${dragCursorX}px`,
            top: `${dragCursorY - 12}px`,
          }}
        >
          <div className="bg-gray-900/95 text-white p-2.5 rounded-xl shadow-2xl border border-gray-700 backdrop-blur-md text-xs space-y-1 min-w-[240px]">
            <div className="flex items-center justify-between border-b border-gray-700 pb-1">
              <span className="font-bold font-mono text-blue-400">
                {dragState.woId}
              </span>
              <span className="text-[10px] text-gray-400">
                线体: {dragState.targetLine}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400">时间窗口:</span>
              <span className="font-bold text-amber-300 font-mono">
                {relMinToTimeStr(dragState.currentStartMin)} →{' '}
                {relMinToTimeStr(dragState.currentEndMin)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400">有效时长:</span>
              <span className="font-semibold text-emerald-400">
                {fmtDuration(
                  relMinDurationHours(
                    dragState.currentStartMin,
                    dragState.currentEndMin
                  )
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] border-t border-gray-800 pt-1">
              <span className="text-gray-400">预计产出:</span>
              <span className="font-bold text-blue-400 font-mono">
                {qtyOf(
                  relMinToTimeStr(dragState.currentStartMin),
                  relMinToTimeStr(dragState.currentEndMin),
                  draggingWO.hourCap,
                  draggingWO.changeover
                ).toLocaleString()}{' '}
                件
              </span>
            </div>

            {draggingConflicts.length > 0 && (
              <div className="bg-red-900/80 border border-red-500 text-red-200 text-[10px] p-1 rounded font-bold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>与 {draggingConflicts.map((c) => c.id).join(', ')} 重叠</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend & Operation Tips Bar */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-600">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-gray-700">操作提示:</span>
          <span>• 抓取工单中间横条左右拖动可移动时间</span>
          <span>• 拖动左右两端手柄可缩放工单时长并重算产出</span>
          <span>• 按住拖动至其他产线可跨线排产</span>
          <span>• 快捷键 Ctrl+Z 可随时撤销</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            已排产
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            已齐套
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            已锁定
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
            已生产
          </span>
        </div>
      </div>
    </div>
  );
};
