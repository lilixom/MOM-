import {
  StatusMeta,
  StatusType,
  WorkOrder,
  FactoryCalState,
  SalesOrder,
  KitItem,
  ChangeoverRule,
  ActualChangeoverItem,
  VersionInfo,
  DayInfo,
  TimeSlotMaintenanceRule,
} from './types';
import { generate29Days, ymd, addDays, weekdayOf, fmtSODate } from './utils/timeUtils';

export const TODAY = new Date();
export const DAYS: DayInfo[] = generate29Days(TODAY);
export const DEFAULT_SELECTED_DATE = DAYS.find((d) => d.isToday)?.date || DAYS[14].date;

export const ALL_30_DAYS = DAYS.map((d) => ({
  label: d.md,
  weekday: d.wd,
  key: d.date,
  date: new Date(d.date + 'T00:00:00'),
  doff: d.doff,
  isToday: d.isToday,
}));

export const FACTORY_LINES = ['10500401', '10500404', '10500405', '10500406'];
export const LINE_TEAM: Record<string, string> = {
  '10500401': 'SA',
  '10500404': 'SB',
  '10500405': 'SD',
  '10500406': 'SE',
};

export function teamOf(line: string): string {
  return LINE_TEAM[line] || '—';
}

export const STATUS_MAP: Record<StatusType, StatusMeta> = {
  scheduled: {
    label: '已排产',
    color: '#2563eb',
    cls: 'bg-blue-100 text-blue-800 border-blue-300',
    bar: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  },
  kitted: {
    label: '已齐套',
    color: '#059669',
    cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bar: 'linear-gradient(135deg,#10b981,#059669)',
  },
  locked: {
    label: '已锁定',
    color: '#d97706',
    cls: 'bg-amber-100 text-amber-800 border-amber-300',
    bar: 'linear-gradient(135deg,#f59e0b,#d97706)',
  },
  produced: {
    label: '已生产',
    color: '#7c3aed',
    cls: 'bg-purple-100 text-purple-800 border-purple-300',
    bar: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
  },
  normal: {
    label: '已生产',
    color: '#7c3aed',
    cls: 'bg-purple-100 text-purple-800 border-purple-300',
    bar: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
  },
  saving: {
    label: '已齐套',
    color: '#059669',
    cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bar: 'linear-gradient(135deg,#10b981,#059669)',
  },
  lack: {
    label: '已排产',
    color: '#2563eb',
    cls: 'bg-blue-100 text-blue-800 border-blue-300',
    bar: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  },
  rest: {
    label: '已排产',
    color: '#2563eb',
    cls: 'bg-blue-100 text-blue-800 border-blue-300',
    bar: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  },
  maint: {
    label: '已锁定',
    color: '#d97706',
    cls: 'bg-amber-100 text-amber-800 border-amber-300',
    bar: 'linear-gradient(135deg,#f59e0b,#d97706)',
  },
};

// Initial Work Orders (matching the prototype's initial 6 manual orders + generated range)
export function getInitialWorkOrders(): WorkOrder[] {
  const baseRows: Partial<WorkOrder>[] = [
    {
      id: '1030403',
      line: '10500401',
      team: 'SA',
      product: '泰奇八宝粥大罐装(侧防2504版)空罐',
      soNo: '1000052463',
      status: 'produced',
      shift: '白班',
      hourCap: 40800,
      changeover: 0.5,
      otherStop: 1.0,
      start: '08:30',
      end: '20:00',
      actual: { start: '08:30', end: '20:00' },
      doff: 0,
      doneQty: 320000,
      coType: '40101',
      coDesc: '不同关系互换（整线）',
    },
    {
      id: '1030409',
      line: '10500401',
      team: 'SA',
      product: '泰奇八宝粥大罐装(侧防2504版)空罐',
      soNo: '1000052463',
      status: 'locked',
      shift: '白班',
      hourCap: 40800,
      changeover: 0.5,
      otherStop: 1.0,
      start: '20:00',
      end: '23:30',
      actual: null,
      doff: 0,
      doneQty: 0,
      coType: '40102',
      coDesc: '不同关系互换（半线）',
    },
    {
      id: '1030768',
      line: '10500404',
      team: 'SB',
      product: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)',
      soNo: '1000052236',
      status: 'produced',
      shift: '白班',
      hourCap: 40800,
      changeover: 0.7,
      otherStop: 1.5,
      start: '08:30',
      end: '14:00',
      actual: { start: '08:30', end: '13:30' },
      doff: -1,
      doneQty: 999999999,
      coType: '40103',
      coDesc: '同塑型不同盒型互换（整线）',
    },
    {
      id: '1030455',
      line: '10500404',
      team: 'SB',
      product: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)',
      soNo: '1000052236',
      status: 'produced',
      shift: '夜班',
      hourCap: 36000,
      changeover: 0.7,
      otherStop: 2.0,
      start: '12:00',
      end: '20:00',
      actual: { start: '12:00', end: '20:00' },
      doff: -1,
      doneQty: 999999999,
      coType: '40104',
      coDesc: '同塑型不同盒型互换（半线）',
    },
    {
      id: '1030457',
      line: '10500404',
      team: 'SB',
      product: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)',
      soNo: '1000052236',
      status: 'kitted',
      shift: '白班',
      hourCap: 40800,
      changeover: 0.5,
      otherStop: 1.0,
      start: '20:00',
      end: '23:30',
      actual: null,
      doff: -1,
      doneQty: 0,
    },
    {
      id: '1030456',
      line: '10500405',
      team: 'SD',
      product: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)',
      soNo: '1000052236',
      status: 'scheduled',
      shift: '白班',
      hourCap: 40800,
      changeover: 1.0,
      otherStop: 0.5,
      start: '09:00',
      end: '18:00',
      actual: null,
      doff: -2,
      doneQty: 0,
    },
  ];

  const result: WorkOrder[] = baseRows.map((r) => {
    const dStr = ymd(addDays(TODAY, r.doff || 0));
    return {
      id: r.id!,
      line: r.line!,
      team: r.team!,
      product: r.product!,
      soNo: r.soNo || '',
      status: r.status as StatusType,
      shift: r.shift!,
      hourCap: r.hourCap!,
      changeover: r.changeover!,
      changeoverActual: r.changeoverActual ?? (r.coType && ACTUAL_CO_BY_TYPE[r.coType] ? ACTUAL_CO_BY_TYPE[r.coType] : Number(((r.changeover || 0.5) * 0.9).toFixed(1))),
      otherStop: r.otherStop!,
      start: r.start!,
      end: r.end!,
      actual: r.actual || null,
      selected: false,
      generated: r.doff !== undefined && r.doff <= 0,
      date: dStr,
      doff: r.doff,
      doneQty: r.doneQty,
      coType: r.coType,
      coDesc: r.coDesc,
    };
  });

  // Seed range for other 26 days
  const P1 = '泰奇八宝粥大罐装(侧防2504版)空罐';
  const P2 = '马口铁三片罐含盖底盖(中山)红牛常规版(2506)';
  const P3 = '马口铁三片罐含盖底盖常规版';
  const L = ['10500401', '10500404', '10500405'];
  const T = ['SA', 'SB', 'SD'];

  DAYS.forEach((ds, idx) => {
    if (ds.doff >= -2 && ds.doff <= 0) return;
    if (idx % 5 === 4) return;
    const d = ds.date;
    const n = String(idx).padStart(2, '0');
    const doneQty = ds.doff < 0 ? 999999999 : 0;
    const baseSt: StatusType = ds.doff < 0 ? 'produced' : ds.doff === 0 ? 'locked' : (idx % 3 === 0 ? 'kitted' : 'scheduled');

    result.push({
      id: 'G' + n + '1',
      line: L[0],
      team: T[0],
      product: P1,
      soNo: '',
      status: baseSt,
      shift: '白班',
      start: '08:30',
      end: '20:00',
      hourCap: 40800,
      changeover: 0.5,
      otherStop: 1.0,
      actual: null,
      selected: false,
      generated: ds.doff <= 0,
      date: d,
      doneQty,
    });

    result.push({
      id: 'G' + n + '2',
      line: L[1],
      team: T[1],
      product: P2,
      soNo: '',
      status: ds.doff < 0 ? 'produced' : (idx % 2 ? 'kitted' : 'scheduled'),
      shift: '白班',
      start: '08:30',
      end: '14:00',
      hourCap: 40800,
      changeover: 0.5,
      otherStop: 1.0,
      actual: null,
      selected: false,
      generated: ds.doff <= 0,
      date: d,
      doneQty,
    });

    result.push({
      id: 'G' + n + '3',
      line: L[1],
      team: T[1],
      product: P2,
      soNo: '',
      status: ds.doff < 0 ? 'produced' : (idx % 2 ? 'scheduled' : 'kitted'),
      shift: '夜班',
      start: '14:00',
      end: '23:30',
      hourCap: 36000,
      changeover: 0.5,
      otherStop: 1.0,
      actual: null,
      selected: false,
      generated: ds.doff <= 0,
      date: d,
      doneQty,
    });

    const st3: StatusType = ds.doff < 0 ? 'produced' : (idx % 3 === 0 ? 'scheduled' : idx % 3 === 1 ? 'kitted' : 'locked');
    result.push({
      id: 'G' + n + '4',
      line: L[2],
      team: T[2],
      product: P3,
      soNo: '',
      status: st3,
      shift: '白班',
      start: '09:00',
      end: '18:00',
      hourCap: 40800,
      changeover: 0.5,
      otherStop: 1.0,
      actual: null,
      selected: false,
      generated: ds.doff <= 0,
      date: d,
      doneQty,
    });
  });

  return result;
}

// Initial Factory Calendar Setup for 15 days (TODAY -> TODAY+14)
export const CAL_DAYS = DAYS.filter((d) => d.doff >= 0);

export function buildInitialCal(): FactoryCalState {
  const calState: FactoryCalState = {};
  CAL_DAYS.forEach((d) => {
    const dow = new Date(d.date + 'T00:00:00').getDay();
    FACTORY_LINES.forEach((line) => {
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
      calState[`${d.date}|${line}`] = { hours, type };
    });
  });
  return calState;
}

// Master lookup for Insert Work Order modal
export const WO_MASTER: Record<string, { product: string; mat: string }> = {
  '1030900': { product: '泰奇八宝粥大罐装(侧防2504版)空罐', mat: '10024249' },
  '1030901': { product: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)', mat: '10022364' },
  '1030902': { product: '马口铁三片罐含盖底盖常规版', mat: '10022364' },
  '1030903': { product: '红牛维生素牛磺酸饮料常规版(2411)', mat: '10011888' },
};

export const LINE_DEF_CAP: Record<string, number> = {
  '10500401': 40800,
  '10500404': 40800,
  '10500405': 40800,
  '10500406': 40800,
};

export const LINE_MAT_CAP: Record<string, number> = {
  '10500404|10022364': 36000,
  '10500405|10024249': 36000,
};

export function capByLineMat(line: string, mat: string): number {
  return LINE_MAT_CAP[`${line}|${mat}`] || LINE_DEF_CAP[line] || 40800;
}

// Sales Orders Data
export const SO_14_DAYS = DAYS.filter((d) => d.doff >= 0 && d.doff <= 13).map((d) => ({
  label: d.md,
  weekday: d.wd,
  key: d.date,
  date: new Date(d.date + 'T00:00:00'),
}));

export const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    soNo: '1000052463',
    matCode: '10025906',
    name: '泰奇八宝粥大罐装(侧防腐2504版)空罐-209#430',
    startDate: fmtSODate(SO_14_DAYS[0].date),
    endDate: fmtSODate(SO_14_DAYS[SO_14_DAYS.length - 1].date, '24:00'),
    orderQty: 2250000,
    salesReq: 1000000,
    unDeliv: 1250000,
    schedQty: 1540000,
    unschedQty: 710000,
    inventory: 500000,
    prodPlan: [0, 0, 0, 600000, 700000, 0, 240000, 0, 0, 0, 0, 0, 0, 0],
    status: { label: '排产中', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    shipPlan: [0, 0, 0, 1000000, 1500000, 0, 500000, 300000, 200000, 0, 0, 0, 0, 0],
    woList: ['1030403', '1030409'],
  },
  {
    soNo: '1000052236',
    matCode: '10024393',
    name: '马口铁三片罐含盖底盖(中山)红牛维生素牛磺酸饮料常规版(2411)',
    startDate: fmtSODate(SO_14_DAYS[0].date),
    endDate: fmtSODate(SO_14_DAYS[SO_14_DAYS.length - 1].date, '24:00'),
    orderQty: 1000000,
    salesReq: 0,
    unDeliv: 1000000,
    schedQty: 1550000,
    unschedQty: 880000,
    inventory: 200000,
    prodPlan: [0, 0, 0, 800000, 700000, 0, 50000, 0, 0, 0, 0, 0, 0, 0],
    status: { label: '出货计划', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    shipPlan: [0, 0, 0, 500000, 500000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    woList: ['1030768', '1030455', '1030456'],
  },
];

// Kit Data
export const INITIAL_KIT_DATA: KitItem[] = [
  {
    wo: '1030403',
    mat: '10024249',
    name: '泰奇八宝粥大罐装(侧防腐2504版)空罐-209#430',
    status: 'normal',
    need: 790000,
    ready: 790000,
    missing: 0,
    items: [
      { m: '罐身', q: 790000, r: 790000 },
      { m: '底盖', q: 790000, r: 790000 },
      { m: '彩印', q: 790000, r: 790000 },
    ],
  },
  {
    wo: '1030768',
    mat: '10022364',
    name: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)',
    status: 'saving',
    need: 470000,
    ready: 440000,
    missing: 30000,
    items: [
      { m: '罐身', q: 470000, r: 470000 },
      { m: '底盖', q: 470000, r: 440000 },
      { m: '彩印', q: 470000, r: 470000 },
    ],
  },
  {
    wo: '1030455',
    mat: '10022365',
    name: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)',
    status: 'normal',
    need: 390000,
    ready: 390000,
    missing: 0,
    items: [
      { m: '罐身', q: 390000, r: 390000 },
      { m: '底盖', q: 390000, r: 390000 },
      { m: '彩印', q: 390000, r: 390000 },
    ],
  },
  {
    wo: '1030456',
    mat: '10022366',
    name: '马口铁三片罐含盖底盖(中山)红牛常规版(2506)',
    status: 'lack',
    need: 860000,
    ready: 520000,
    missing: 340000,
    items: [
      { m: '罐身', q: 860000, r: 520000 },
      { m: '底盖', q: 860000, r: 860000 },
      { m: '彩印', q: 860000, r: 860000 },
    ],
  },
  {
    wo: '1030501',
    mat: '10022370',
    name: '承德顺天杏仁露206#480ML制罐工艺单',
    status: 'rest',
    need: 300000,
    ready: 0,
    missing: 0,
    items: [
      { m: '罐身', q: 300000, r: 0 },
      { m: '底盖', q: 300000, r: 0 },
      { m: '彩印', q: 300000, r: 0 },
    ],
  },
  {
    wo: '1030502',
    mat: '10022371',
    name: '马口铁三片罐含盖底盖(中山)常规版',
    status: 'maint',
    need: 200000,
    ready: 200000,
    missing: 0,
    items: [
      { m: '罐身', q: 200000, r: 200000 },
      { m: '底盖', q: 200000, r: 200000 },
      { m: '彩印', q: 200000, r: 200000 },
    ],
  },
  {
    wo: '1030503',
    mat: '10022372',
    name: '红牛维生素牛磺酸饮料常规版(2411)',
    status: 'normal',
    need: 500000,
    ready: 500000,
    missing: 0,
    items: [
      { m: '罐身', q: 500000, r: 500000 },
      { m: '底盖', q: 500000, r: 500000 },
      { m: '彩印', q: 500000, r: 500000 },
    ],
  },
];

// Changeover Rules Data
export const INITIAL_CHANGEOVER_DATA: ChangeoverRule[] = [
  {
    seq: 1,
    process: '401制罐换型',
    code: '40101',
    desc: '不同关系互换（整线）',
    hoursH: 8,
    hoursM: 480,
    createBy: '詹志华',
    createDate: '2026/3/10',
    modDate: '2026/3/20',
    modBy: '张喜祥',
    isDefault: true,
  },
  {
    seq: 2,
    process: '401制罐换型',
    code: '40102',
    desc: '不同关系互换（半线）',
    hoursH: 3,
    hoursM: 180,
    createBy: '詹志华',
    createDate: '',
    modDate: '',
    modBy: '',
    isDefault: false,
  },
  {
    seq: 3,
    process: '401制罐换型',
    code: '40103',
    desc: '同塑型不同盒型互换（整线）',
    hoursH: 4,
    hoursM: 240,
    createBy: '',
    createDate: '',
    modDate: '',
    modBy: '',
    isDefault: false,
  },
  {
    seq: 4,
    process: '401制罐换型',
    code: '40104',
    desc: '同塑型不同盒型互换（半线）',
    hoursH: 2,
    hoursM: 120,
    createBy: '',
    createDate: '',
    modDate: '',
    modBy: '',
    isDefault: false,
  },
];

export const ACTUAL_CO_BY_TYPE: Record<string, number> = {
  '40101': 7.5,
  '40102': 3.2,
  '40103': 3.6,
  '40104': 1.8,
};

export const INITIAL_ACTUAL_DATA: ActualChangeoverItem[] = [
  {
    line: 'SA',
    wo: '001',
    cmd: '001-001',
    matCode: '10024249',
    productName: '泰奇八宝粥大罐装(侧防腐2504版)空罐-209#430',
    capPerHr: 36000,
    prevCmd: '003-005',
    prevMatCode: '10022364',
    prevProductName:
      '马口铁三片罐含盖底盖(中山)红牛维生素牛磺酸饮料常规版(2411)',
    stdTimeWO: 0.7,
    actTimeWO: 0.6,
  },
  {
    line: 'SA',
    wo: '001',
    cmd: '001-002',
    matCode: '10022364',
    productName:
      '马口铁三片罐含盖底盖(中山)红牛维生素牛磺酸饮料常规版(2411)',
    capPerHr: 48000,
    prevCmd: '001-002',
    prevMatCode: '10022364',
    prevProductName: '泰奇八宝粥大罐装(侧防腐剂 2504版)空罐-209#430',
    stdTimeWO: 0.7,
    actTimeWO: 0.6,
  },
];

// Versions List
export const VERSIONS: VersionInfo[] = [
  {
    tag: 'v1.27',
    date: '2026-07-23',
    desc: '换型类型版',
    active: true,
    changes: [
      '新增排产弹窗新增「换型类型」下拉（源于「标准换型工时」维护表），自动带出标准换型工时',
      '排产可用工时扣除换型工时：排产数量=(结束-开始−换型工时)×小时产能（全局产能/甘特/总览/齐套/制令单同步扣减）',
      '新增排产弹窗新增「实际换型工时(只读,现场维护)」与「换型对比」',
      '排产工单操作面板新增 换型类型/标准换型工时/实际换型工时/换型对比（节约绿/超支红）',
      '甘特条 tooltip 增加换型工时信息；版本→v1.27',
    ],
  },
  {
    tag: 'v1.26',
    date: '2026-07-22',
    desc: '齐套前置+按日生成版',
    active: false,
    changes: [
      '生成制令单前置约束：必须先执行齐套运算(当前日期)才允许生成制令单；未齐套时按钮置灰、点击拦截提示',
      '切换排产日期/保存/删除/新增/导入/0点顺产 → 齐套结果失效，需重新齐套运算',
      '生成制令单新增「选择排产日期」下拉(默认当前日期)，列表只显示该日期的工单',
      '版本→v1.26',
    ],
  },
  {
    tag: 'v1.25',
    date: '2026-07-22',
    desc: '日期窗口对齐版',
    active: false,
    changes: [
      '销售订单列表：日期/出货计划列由10天扩展为近14天（今日起后14天），与「前后14天排产总览」的「后14天」对应',
      '销售订单表头徽标「近30天出货计划」→「近14天出货计划」，汇总列「近30天」→「近14天」(按14天出货计划合计)，开始/结束日期联动为近14天窗口',
      '产能负荷表：日期窗口由固定 BASE_DATE 改为复用「前后14天排产总览」的 DAYS 窗口(前14天~后14天,共29天,≈近30天)，与总览严格对应',
      '产能负荷表新增「今天」列高亮(左右主色描边)，与总览今天分隔线呼应',
      '版本→v1.25',
    ],
  },
  {
    tag: 'v1.24',
    date: '2026-07-21',
    desc: '齐套运算版',
    active: false,
    changes: [
      '排产工单操作面板新增「齐套运算」按钮（位于「包材修改」左侧）',
      '齐套运算：按 排产数量×BOM用量 与 仓库+在途 数量核对，齐套=绿色、不齐套=黄色',
      '新增「包材修改」按钮：可编辑工单各包材「仓库库存」，保存后齐套运算结果同步更新',
      '不齐套不影响制令单下发：生成制令单时若存在不齐套工单，仍照常下发并追加黄色警示提示',
      '版本→v1.24',
    ],
  },
  {
    tag: 'v1.23',
    date: '2026-07-21',
    desc: '插单改名新增排产版',
    active: false,
    changes: [
      '「插单」按钮改名为「新增排产」',
      '弹窗标题「插入排产订单」→「新增排产订单」，确认按钮「确认插单」→「确认新增排产」',
      '成功提示「插单成功」→「新增排产成功」，缺省产品名「新插单产品」→「新增排产产品」',
      '版本→v1.23',
    ],
  },
];

export const INITIAL_TIME_SLOT_RULES: TimeSlotMaintenanceRule[] = [
  {
    id: 'TS001',
    line: '全部产线',
    date: '每日',
    startTime: '08:30',
    endTime: '09:30',
    durationMinutes: 60,
    type: 'rest',
    notes: '08:30-09:30 早班例会/半小时首检与休息',
    category: 'slot',
    isDefault: true,
  },
  {
    id: 'TS002',
    line: '10500401',
    date: DEFAULT_SELECTED_DATE,
    startTime: '08:30',
    endTime: '09:00',
    durationMinutes: 30,
    type: 'maint',
    notes: '08:30-09:00 喷枪与送罐轨道半小时定期维保停机',
    category: 'slot',
    isDefault: false,
  },
  {
    id: 'OP001',
    line: '10500404',
    date: DEFAULT_SELECTED_DATE,
    startTime: '08:30',
    endTime: '09:30',
    durationMinutes: 60,
    type: 'maint',
    notes: '换型清线与模具校准作业',
    operationName: '换型清线与点检',
    category: 'operation',
    isDefault: false,
  },
  {
    id: 'OP002',
    line: '全部产线',
    date: '每日',
    startTime: '12:00',
    endTime: '12:30',
    durationMinutes: 30,
    type: 'rest',
    notes: '午餐及人员交替休息',
    operationName: '交接班休息与交接',
    category: 'operation',
    isDefault: false,
  },
];

