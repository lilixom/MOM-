export type StatusType =
  | 'scheduled' // 已排产
  | 'kitted'    // 已齐套
  | 'locked'    // 已锁定
  | 'produced'  // 已生产
  | 'normal'
  | 'saving'
  | 'lack'
  | 'rest'
  | 'maint';

export interface StatusMeta {
  label: string;
  color: string;
  cls: string;
  bar: string;
}

export interface WorkOrder {
  id: string;
  line: string;             // e.g. "10500401"
  team: string;             // e.g. "SA"
  product: string;          // Product name
  matCode?: string;         // Material code
  soNo?: string;            // Linked Sales Order number
  moNo?: string;            // Manufacturing Order (制令单号)
  status: StatusType;
  shift: string;            // 白班 | 夜班 | 顺延
  hourCap: number;          // Hourly capacity (e.g. 40800)
  coType?: string;          // Changeover code e.g. "40101"
  coDesc?: string;          // Changeover description
  changeover: number;       // Standard changeover hours (e.g. 0.5)
  changeoverActual?: number | null; // Actual changeover hours (e.g. 0.6)
  otherStop: number;        // Other downtime hours
  start: string;            // "08:30"
  end: string;              // "20:00" or "02:00+1"
  actual?: { start: string; end: string } | null;
  selected?: boolean;
  generated?: boolean;      // Whether shop order has been generated
  date: string;             // "YYYY-MM-DD"
  doff?: number;            // Day offset relative to TODAY
  planQty?: number;         // Calculated planned quantity
  doneQty?: number;         // Completed quantity
  rolled?: boolean;         // Rolled over work order
  _rolledFrom?: boolean;
  _origDur?: number;
  _lane?: number;
}

export interface FactoryCalItem {
  hours: number;
  type: 'work' | 'rest' | 'maint';
}

export type FactoryCalState = Record<string, FactoryCalItem>; // key: `${date}|${line}`

export interface SalesOrder {
  soNo: string;
  matCode: string;
  name: string;
  startDate: string;
  endDate: string;
  orderQty: number;
  salesReq: number;
  unDeliv: number;
  schedQty: number;
  unschedQty: number;
  inventory: number;
  prodPlan: number[];
  status: { label: string; cls: string };
  shipPlan: number[];
  woList: string[];
}

export interface KitComponent {
  name: string;
  q: number;       // Required BOM quantity
  r: number;       // Total ready quantity (wh + transit)
  wh: number;      // Warehouse stock
  transit: number; // In-transit stock
}

export interface KitItem {
  wo: string;
  mat: string;
  name: string;
  status: StatusType;
  need: number;
  ready: number;
  missing: number;
  items: { m: string; q: number; r: number }[];
}

export interface ChangeoverRule {
  seq: number;
  process: string;
  code: string;
  desc: string;
  hoursH: number;
  hoursM: number;
  createBy: string;
  createDate: string;
  modDate: string;
  modBy: string;
  isDefault?: boolean;
}

export interface ActualChangeoverItem {
  line: string;
  wo: string;
  cmd: string;
  matCode: string;
  productName: string;
  capPerHr: number;
  prevCmd: string;
  prevMatCode: string;
  prevProductName: string;
  stdTimeWO: number;
  actTimeWO: number;
}

export interface VersionInfo {
  tag: string;
  date: string;
  desc: string;
  active: boolean;
  changes: string[];
}

export interface DayInfo {
  date: string;
  md: string;
  wd: string;
  doff: number;
  isToday: boolean;
}

export interface Cap30DayInfo {
  label: string;
  weekday: string;
  key: string;
  date: Date;
  doff: number;
  isToday: boolean;
}

export interface TimeSlotMaintenanceRule {
  id: string;
  line: string;             // e.g. "10500401" or "全部产线"
  date: string;             // "YYYY-MM-DD" or "每日"
  startTime: string;        // "08:30"
  endTime: string;          // "09:30" or "09:00"
  durationMinutes: number;  // 30, 60, etc.
  type: 'rest' | 'maint' | 'work'; // 休息 | 停机 | 正常/作业
  notes: string;            // 备注
  operationName?: string;   // 作业名称 (Optional for 作业维护)
  category: 'slot' | 'operation'; // 时段维护 or 作业维护
  isDefault?: boolean;      // 是否默认 (全局仅保留一个默认)
}

