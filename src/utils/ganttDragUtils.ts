import { WorkOrder } from '../types';
import { toHours, fmtHM, qtyOf } from './timeUtils';
import { teamOf, capByLineMat } from '../mockData';

// 24-hour timeline constants:
// The factory production day starts at 08:30 (8.5h = 510min) and ends at next day 08:30 (32.5h = 1950min).
// Total duration = 24.0 hours = 1440 minutes.
export const WIN_START_HOUR = 8.5;
export const WIN_START_MIN = 8.5 * 60; // 510 minutes from 00:00
export const WIN_TOTAL_HOURS = 24;
export const WIN_TOTAL_MIN = 1440;

/**
 * Converts a time string (e.g. "08:30", "20:00", "02:00+1", "08:30+1")
 * into relative minutes from the window start (08:30 = 0 min, 08:30+1 = 1440 min).
 */
export function timeStrToRelMin(timeStr: string | number): number {
  if (typeof timeStr === 'number') {
    // If decimal hours passed:
    const relH = timeStr - WIN_START_HOUR;
    return Math.max(0, Math.min(WIN_TOTAL_MIN, Math.round(relH * 60)));
  }

  const s = String(timeStr || '08:30').trim();
  const absHours = toHours(s); // 08:30 -> 8.5; 02:00+1 -> 26.0; 08:30+1 -> 32.5
  let relH = absHours - WIN_START_HOUR;

  // If time is before 08:30 without +1 (e.g. "02:00" intended as night shift), wrap to next day
  if (relH < 0) {
    relH += 24;
  }

  const relMin = Math.round(relH * 60);
  return Math.max(0, Math.min(WIN_TOTAL_MIN, relMin));
}

/**
 * Converts relative minutes from window start (0..1440)
 * into a formatted time string (e.g. "08:30", "23:45", "01:30+1").
 */
export function relMinToTimeStr(relMin: number): string {
  const clampedMin = Math.max(0, Math.min(WIN_TOTAL_MIN, Math.round(relMin)));
  const absTotalMin = WIN_START_MIN + clampedMin; // from 510 to 1950

  const absDayMin = absTotalMin % (24 * 60);
  let h = Math.floor(absDayMin / 60);
  let m = absDayMin % 60;

  if (m === 60) {
    h = (h + 1) % 24;
    m = 0;
  }

  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');

  // If absTotalMin >= 1440 (24:00 midnight), it belongs to next day
  if (absTotalMin >= 24 * 60) {
    return `${hh}:${mm}+1`;
  }
  return `${hh}:${mm}`;
}

/**
 * Snap relative minutes to nearest grid interval (e.g. 5, 10, 15, 30 min).
 */
export function snapRelMin(relMin: number, snapMin: number = 15): number {
  if (snapMin <= 1) return Math.round(relMin);
  const snapped = Math.round(relMin / snapMin) * snapMin;
  return Math.max(0, Math.min(WIN_TOTAL_MIN, snapped));
}

/**
 * Calculates duration in decimal hours between two relative minute points.
 */
export function relMinDurationHours(startMin: number, endMin: number): number {
  return Math.max(0, (endMin - startMin) / 60);
}

/**
 * Formats duration nicely (e.g. "8.5h" or "45m").
 */
export function fmtDuration(durHours: number): string {
  const h = Math.floor(durHours);
  const m = Math.round((durHours - h) * 60);
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分 (${durHours.toFixed(1)}h)`;
}

export interface DraggedItemState {
  woId: string;
  originalStartMin: number;
  originalEndMin: number;
  originalLine: string;
  currentStartMin: number;
  currentEndMin: number;
  targetLine: string;
  dragMode: 'move' | 'resize-start' | 'resize-end';
}

/**
 * Checks if two time intervals overlap (strictly overlapping).
 */
export function isOverlapping(s1: number, e1: number, s2: number, e2: number): boolean {
  return Math.max(s1, s2) < Math.min(e1, e2) - 0.01;
}

/**
 * Finds all work orders on the same date and line that conflict with [startMin, endMin].
 */
export function findConflictingWOs(
  targetWOId: string,
  targetLine: string,
  startMin: number,
  endMin: number,
  allWOs: WorkOrder[],
  selectedDate: string
): WorkOrder[] {
  return allWOs.filter((wo) => {
    if (wo.id === targetWOId) return false;
    if (wo.date !== selectedDate) return false;
    if (wo.line !== targetLine) return false;

    const wStart = timeStrToRelMin(wo.start);
    const wEnd = timeStrToRelMin(wo.end);
    return isOverlapping(startMin, endMin, wStart, wEnd);
  });
}

/**
 * Clamps moving interval so it doesn't overlap existing work orders on the same line (智能阻挡).
 */
export function clampAgainstNeighbors(
  targetWOId: string,
  targetLine: string,
  requestedStartMin: number,
  requestedEndMin: number,
  dragMode: 'move' | 'resize-start' | 'resize-end',
  allWOs: WorkOrder[],
  selectedDate: string,
  minDurationMin: number = 15
): { startMin: number; endMin: number } {
  const dur = requestedEndMin - requestedStartMin;
  const lineWOs = allWOs
    .filter((wo) => wo.id !== targetWOId && wo.date === selectedDate && wo.line === targetLine)
    .map((wo) => ({
      id: wo.id,
      start: timeStrToRelMin(wo.start),
      end: timeStrToRelMin(wo.end),
    }))
    .sort((a, b) => a.start - b.start);

  if (dragMode === 'resize-end') {
    let maxAllowedEnd = WIN_TOTAL_MIN;
    for (const other of lineWOs) {
      if (other.start >= requestedStartMin) {
        maxAllowedEnd = Math.min(maxAllowedEnd, other.start);
      }
    }
    const safeEnd = Math.min(requestedEndMin, maxAllowedEnd);
    return {
      startMin: requestedStartMin,
      endMin: Math.max(requestedStartMin + minDurationMin, safeEnd),
    };
  }

  if (dragMode === 'resize-start') {
    let minAllowedStart = 0;
    for (const other of lineWOs) {
      if (other.end <= requestedEndMin) {
        minAllowedStart = Math.max(minAllowedStart, other.end);
      }
    }
    const safeStart = Math.max(requestedStartMin, minAllowedStart);
    return {
      startMin: Math.min(safeStart, requestedEndMin - minDurationMin),
      endMin: requestedEndMin,
    };
  }

  // dragMode === 'move'
  // Find predecessor (before requestedStartMin) and successor (after requestedEndMin)
  let safeStart = Math.max(0, requestedStartMin);
  let safeEnd = safeStart + dur;

  if (safeEnd > WIN_TOTAL_MIN) {
    safeEnd = WIN_TOTAL_MIN;
    safeStart = Math.max(0, safeEnd - dur);
  }

  // Check if safeStart, safeEnd collides with any other
  for (const other of lineWOs) {
    if (isOverlapping(safeStart, safeEnd, other.start, other.end)) {
      // If we are moving right and hit other
      if (requestedStartMin >= other.start && requestedStartMin < other.end) {
        safeStart = other.end;
        safeEnd = Math.min(WIN_TOTAL_MIN, safeStart + dur);
      } else if (safeEnd > other.start && safeStart < other.start) {
        safeEnd = other.start;
        safeStart = Math.max(0, safeEnd - dur);
      }
    }
  }

  return { startMin: safeStart, endMin: safeEnd };
}

/**
 * Cascade / Ripple logic (联动顺延):
 * If moving targetWO forward in time causes overlap with subsequent orders on the same line,
 * push subsequent non-locked orders forward so there are no overlaps.
 */
export function applyRippleCascade(
  targetWOId: string,
  targetLine: string,
  newStartMin: number,
  newEndMin: number,
  allWOs: WorkOrder[],
  selectedDate: string
): WorkOrder[] {
  const lineWOs = allWOs.filter((wo) => wo.date === selectedDate && wo.line === targetLine);
  const otherWOs = allWOs.filter((wo) => !(wo.date === selectedDate && wo.line === targetLine));

  // Clone lineWOs
  const updatedLineWOs = lineWOs.map((wo) => {
    if (wo.id === targetWOId) {
      const sStr = relMinToTimeStr(newStartMin);
      const eStr = relMinToTimeStr(newEndMin);
      const newPlanQty = qtyOf(sStr, eStr, wo.hourCap, wo.changeover);
      return {
        ...wo,
        start: sStr,
        end: eStr,
        planQty: newPlanQty,
      };
    }
    return { ...wo };
  });

  // Sort by start time
  updatedLineWOs.sort((a, b) => timeStrToRelMin(a.start) - timeStrToRelMin(b.start));

  // Find index of target
  const targetIdx = updatedLineWOs.findIndex((w) => w.id === targetWOId);
  if (targetIdx === -1) return allWOs;

  let prevEnd = newEndMin;
  for (let i = targetIdx + 1; i < updatedLineWOs.length; i++) {
    const curr = updatedLineWOs[i];
    const currStart = timeStrToRelMin(curr.start);
    const currEnd = timeStrToRelMin(curr.end);
    const currDur = currEnd - currStart;

    if (currStart < prevEnd) {
      // If locked, cannot push!
      if (curr.status === 'locked' || curr.status === 'produced' || curr.generated) {
        break; // Stop cascade at locked barrier
      }
      const pushedStart = prevEnd;
      const pushedEnd = Math.min(WIN_TOTAL_MIN, pushedStart + currDur);
      const sStr = relMinToTimeStr(pushedStart);
      const eStr = relMinToTimeStr(pushedEnd);
      curr.start = sStr;
      curr.end = eStr;
      curr.planQty = qtyOf(sStr, eStr, curr.hourCap, curr.changeover);
      curr.rolled = true;
      prevEnd = pushedEnd;
    } else {
      prevEnd = currEnd;
    }
  }

  return [...otherWOs, ...updatedLineWOs];
}

/**
 * Smart Reorder / Sequence (智能排序):
 * Does NOT change the duration / length of any work order in the Gantt chart.
 * Reorders the work orders on targetLine based on the user's drop position (currentStartMin),
 * and sequentially lays them out keeping each work order's exact duration intact.
 */
export function applySmartSortReorder(
  targetWOId: string,
  targetLine: string,
  originalLine: string,
  currentStartMin: number,
  originalStartMin: number,
  originalEndMin: number,
  allWOs: WorkOrder[],
  selectedDate: string
): WorkOrder[] {
  const targetWO = allWOs.find((w) => w.id === targetWOId);
  if (!targetWO) return allWOs;

  const targetDur = originalEndMin - originalStartMin;

  // Other work orders on the target line on this date (excluding targetWO)
  const otherWOs = allWOs
    .filter((w) => w.id !== targetWOId && w.date === selectedDate && w.line === targetLine)
    .sort((a, b) => timeStrToRelMin(a.start) - timeStrToRelMin(b.start));

  // Determine insertion index based on currentStartMin compared to existing items' midpoints
  let insertIndex = 0;
  while (
    insertIndex < otherWOs.length &&
    currentStartMin >
      (timeStrToRelMin(otherWOs[insertIndex].start) + timeStrToRelMin(otherWOs[insertIndex].end)) / 2
  ) {
    insertIndex++;
  }

  // Target work order with targetLine
  const updatedTargetWO: WorkOrder = {
    ...targetWO,
    line: targetLine,
    team: teamOf(targetLine),
  };

  // Build the new ordered array for targetLine
  const orderedWOs = [...otherWOs];
  orderedWOs.splice(insertIndex, 0, updatedTargetWO);

  // Determine baseline start anchor for targetLine
  const existingLineWOs = allWOs.filter(
    (w) => w.date === selectedDate && w.line === targetLine
  );
  let baseStartMin = 0;
  if (existingLineWOs.length > 0) {
    baseStartMin = Math.min(...existingLineWOs.map((w) => timeStrToRelMin(w.start)));
  }
  const lineStartAnchor = Math.max(0, Math.min(baseStartMin, currentStartMin));

  // Layout all orders in orderedWOs sequentially, strictly preserving their durations
  let cursor = lineStartAnchor;
  const lineWOsMap = new Map<string, WorkOrder>();

  orderedWOs.forEach((wo) => {
    const dur =
      wo.id === targetWOId
        ? targetDur
        : timeStrToRelMin(wo.end) - timeStrToRelMin(wo.start);

    const sMin = cursor;
    const eMin = Math.min(WIN_TOTAL_MIN, sMin + dur);
    cursor = eMin;

    const sStr = relMinToTimeStr(sMin);
    const eStr = relMinToTimeStr(eMin);
    const hourCap = wo.hourCap || capByLineMat(targetLine, wo.matCode || '');
    const planQty = wo.rolled ? wo.planQty : qtyOf(sStr, eStr, hourCap, wo.changeover);

    lineWOsMap.set(wo.id, {
      ...wo,
      line: targetLine,
      team: teamOf(targetLine),
      start: sStr,
      end: eStr,
      planQty,
      hourCap,
    });
  });

  return allWOs.map((wo) => {
    if (lineWOsMap.has(wo.id)) {
      return lineWOsMap.get(wo.id)!;
    }
    return wo;
  });
}
