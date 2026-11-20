// MES 生产管理模块 + 生产数据分析中心 — 数据层与页面配置

export const PROD_ORG = '昇兴集团-中山制罐工厂';

export type ProdRow = Record<string, string | number>;

export interface ProdColDef {
  t: string;
  k: string;
  cb?: boolean;
  tag?: boolean;
  sort?: boolean;
}

export interface ProdFilterDef {
  label: string;
  key: string;
  type?: 'select' | 'date' | 'radio' | 'text';
  op?: boolean;
  opts?: string[];
}

export interface ProdStatCardDef {
  label: string;
  val: string;
  color: string;
  icon: 'M1' | 'M2' | 'M3' | 'M4';
}

export interface ProdChartDef {
  title: string;
  type: 'bar' | 'line';
  data?: Array<{ name: string; value: number; color?: string }>;
  labels?: string[];
  series?: Array<{ name: string; data: number[]; color?: string }>;
}

export interface ProdTablePageConfig {
  id: string;
  type: 'table' | 'analysis';
  title: string;
  dataset: ProdRow[];
  search: ProdFilterDef[];
  cols: ProdColDef[];
  pageSize?: number;
  total?: number;
  buttons?: string[];
  actions?: string[];
  subtabs?: string[];
  subCols?: ProdColDef[];
  subRows?: ProdRow[];
  stats?: ProdStatCardDef[];
  charts?: ProdChartDef[];
}

export interface ProdWorkbenchField {
  label: string;
  key: string;
  type?: 'text' | 'select' | 'textarea' | 'date' | 'number';
  opts?: string[];
}

export interface ProdWorkbenchSection {
  title: string;
  cols?: number;
  fields?: ProdWorkbenchField[];
  tabs?: string[];
  table?: {
    title: string;
    cols: ProdColDef[];
    rows: ProdRow[];
  };
}

export interface ProdWorkbenchConfig {
  id: string;
  type: 'workbench';
  title: string;
  tabs: string[];
  sections: ProdWorkbenchSection[];
  actions: string[];
}

export interface ProdCustomPageConfig {
  id: string;
  type: 'custom';
  title: string;
  custom: 'invalidTime' | 'grape';
}

export type ProdPageConfig = ProdTablePageConfig | ProdWorkbenchConfig | ProdCustomPageConfig;

export interface ProdFormField {
  label: string;
  key: string;
  type: 'text' | 'select' | 'date' | 'number' | 'textarea';
  opts?: string[];
  required?: boolean;
  full?: boolean;
}

export interface ProdFormDef {
  title: string;
  titlePrefix?: string;
  groups: Array<{
    name: string;
    fields: ProdFormField[];
  }>;
}

/* ---------- MOM 页面 ID -> 生产模块 PageKey 映射（共 69 页） ---------- */
export const PRODUCTION_PAGE_ID_MAP: Record<string, string> = {
  // 计划管理 -> 信息查询 (4)
  p126: 'salesOutput',
  p127: 'orderInput',
  p128: 'salesDelivery',
  p129: 'moOnlineLog',

  // 生产管理 -> 管理模型 (7)
  p130: 'workshop',
  p131: 'skill',
  p132: 'permission',
  p133: 'team',
  p134: 'canParam',
  p135: 'andon',
  p136: 'shift',

  // 生产管理 -> 作业工作台 (4 新增)
  'prod-batchReport': 'batchReport',
  'prod-firstPass': 'firstPass',
  'prod-midPass': 'midPass',
  'prod-weighPass': 'weighPass',

  // 生产管理 -> 过程管控 & 返修管理 (4 新增)
  'prod-ecn': 'ecn',
  'prod-invalidTime': 'invalidTime',
  'prod-invalidTimeMgr': 'invalidTimeMgr',
  'prod-rework': 'rework',

  // 生产管理 -> 人员管理 (11：10 原有 + 1 新增)
  p144: 'onDuty',
  p145: 'grape',
  'prod-weighInput': 'weighInput',
  p171: 'certReport',
  p172: 'scrapWeigh',
  p173: 'badWeigh',
  p174: 'firstKit',
  p175: 'lowStock',
  p176: 'collectSet',
  p177: 'handover',
  p178: 'colorRestore',

  // 数据中心 -> 生产数据分析 (37 原有) + 设备异常停机工时汇总 (1 新增)
  p251: 'materialLoss',
  p252: 'linePassRate',
  p253: 'outputTrend',
  p254: 'wipInfo',
  p255: 'productPass',
  p256: 'semiInput',
  p257: 'materialInput',
  p258: 'onlineMaterial',
  p259: 'dailyLoss',
  p260: 'dailyOutput',
  p261: 'materialInputLog',
  p262: 'materialInputLogNew',
  p263: 'materialRecycleLogNew',
  p264: 'materialRecycleLog',
  p265: 'certReportRecord',
  p266: 'moInputTrace',
  p267: 'scrapReason',
  p268: 'canBalance',
  p269: 'badScrapDetail',
  p270: 'badScrapSummary',
  p271: 'stackLog',
  p272: 'pendingToNormal',
  p273: 'lossQty',
  p274: 'materialWan',
  p275: 'deviceFaultTime',
  p276: 'deviceCollectTime',
  p277: 'dailyPlanRate',
  p278: 'fixtureOnline',
  p279: 'andonRecord',
  p280: 'pendingReport',
  p281: 'scrapSummary',
  p282: 'efficiencyReport',
  p283: 'lineOverall',
  p284: 'lineWorkHours',
  p285: 'efficiencySummary',
  p286: 'scrapBarcodeDelete',
  p287: 'productionDetail',
  'prod-downtime': 'downtime',
};

const pad = (n: number, l = 2) => String(n).padStart(l, '0');
const mkRows = <T,>(n: number, fn: (i: number) => T): T[] => Array.from({ length: n }, (_, i) => fn(i));

const COL = (t: string, k: string, o: Partial<ProdColDef> = {}): ProdColDef => ({ t, k, ...o });
const AC = (t: string): ProdColDef => COL(t, t);
const F = (label: string, key: string, o: Partial<ProdFilterDef> = {}): ProdFilterDef => ({ label, key, ...o });
const OP = (label: string, key: string, opts?: string[]): ProdFilterDef => F(label, key, { op: true, opts });
const SEL = (label: string, key: string, opts: string[]): ProdFilterDef => F(label, key, { type: 'select', opts });
const DATE = (label: string): ProdFilterDef => F(label, '', { type: 'date' });

/* ---------- 真实系统基础与业务数据集 ---------- */
const SKILLS: ProdRow[] = [
  ['刘水洪', '电阻焊机', '精通'], ['陈伍松', '裁剪', '完全掌握'], ['杨小辉', '电阻焊机', '完全掌握'],
  ['罗明亮', '电阻焊机', '基本掌握'], ['谢晔', '封口机', '基本掌握'], ['邓泽勇', '封口机', '完全掌握'],
  ['刘镇', '裁剪', '基本掌握'], ['莫立群', '收罐台', '精通'], ['侯成华', '打包机', '精通'],
  ['赵建', '电阻焊机', '基本掌握'], ['李兵', '裁剪', '计划学习'], ['李兵', '打包机', '完全掌握'],
  ['余丽荣', '收罐台', '完全掌握'], ['黄文敬', '电阻焊机', '基本掌握'], ['戴正伟', '冷却罐路', '精通'],
  ['林爱英', '收罐台', '完全掌握'], ['李佳煊', '电阻焊机', '计划学习'], ['谢丽娇', '裁剪', '基本掌握'],
  ['张德福', '电阻焊机', '计划学习'], ['陈英毅', '封口机', '基本掌握'], ['杨琳', '收罐台', '基本掌握'],
  ['牛万军', '大烘炉', '完全掌握'], ['张国庆', '封口机', '精通'], ['黄文安', '裁剪', '完全掌握'],
  ['张宜清', '大烘炉', '精通'], ['邹桂林', '裁剪', '完全掌握'], ['冉洪林', '封口机', '计划学习'],
].map((r) => ({ org: PROD_ORG, user: r[0], process: r[1], level: r[2], remark: '' }));

const PERMISSIONS: ProdRow[] = [
  ['041749', '江晓阳'], ['041624', '陈华鑫'], ['041745', '刘天浩'], ['041744', '黄文胜'],
  ['010127', '林志格'], ['091149', '司武浩'], ['320120', '鄢康'], ['080028', '何新田'],
  ['010503', '钟泽弘'], ['880162', '林倩'],
].map((r) => ({ org: PROD_ORG, code: r[0], name: r[1], dept: `${PROD_ORG}_默认部门` }));

const TEAMS: ProdRow[] = [
  ['SD2', 'SD2', '10500404', '晚班', '黄田兴'], ['SD1', 'SD1', '10500404', '早班', '李春松'],
  ['SB2', 'SB2', '10500402', '晚班', '黄田兴'], ['SB1', 'SB1', '10500402', '早班', '李春松'],
  ['SA2', 'SA2', '10500401', '晚班', '黄田兴'], ['SA1', 'SA1', '10500401', '早班', '李春松'],
  ['SE2', 'SE2', '10500405', '晚班', '黄田兴'], ['SE1', 'SE1', '10500405', '早班', '李春松'],
].map((r) => ({ org: PROD_ORG, code: r[0], name: r[1], remark: r[2], shift: r[3], leader: r[4] }));

const CAN_PARAMS: ProdRow[] = [
  ['10032147', '泰奇八宝粥优惠装(代言人2607版)空罐-209#360', '209#360ML', '0.2', '883', '1035', '35'],
  ['10033169', '泰奇八宝粥200克红豆香沙小罐装（新国标版）-209#200', '209#200G', '0.2', '780', '1035', '50'],
  ['10033171', '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', '209#200G', '0.2', '780', '1035', '50'],
  ['10021344', '泰奇八宝粥小罐优惠装（202404版）空罐-674#', '674#', '0.2', '883', '1035', '45'],
  ['10029604', '红牛维生素风味饮料-2025红包V2版P2空罐-206#250', '206#250ML', '0.2', '862', '1035', '45'],
  ['10022035', '可口营养八宝粥（202406版）空罐-209#360', '209#360ML', '0.2', '883', '1035', '35'],
  ['10024393', '马口铁三片罐含蓝底盖(中山)红牛维生素牛磺酸饮料常规版(2411)', '206#250ML', '0.2', '862', '1035', '45'],
  ['10021346', '泰奇八宝粥小罐香沙装（202404版）空罐-674#', '674#', '0.2', '780', '1035', '50'],
].map((r) => ({ org: PROD_ORG, code: r[0], name: r[1], spec: r[2], thick: r[3], width: r[4], length: r[5], perSheet: r[6] }));

const ANDONS: ProdRow[] = [
  ['192.168.9.214', '60001', 'B线内全喷涂机'], ['192.168.9.206', '60001', 'B线封口机'],
  ['192.168.9.204', '60001', 'B线铁皮裁剪机'], ['192.168.9.205', '60001', 'B线高频电阻焊机'],
  ['192.168.9.203', '60001', 'D线内全喷涂机'], ['192.168.9.202', '60001', 'D线封口机'],
  ['192.168.9.200', '60001', 'D线铁皮裁剪机'], ['192.168.9.201', '60001', 'D线高频电阻焊机'],
  ['192.168.9.213', '60001', 'A线内全喷涂机'], ['192.168.9.212', '60001', 'A线封口机'],
].map((r) => ({ org: PROD_ORG, ip: r[0], port: r[1], device: r[2], remark: '' }));

const SHIFTS: ProdRow[] = TEAMS.map((t, i) => ({
  org: PROD_ORG,
  date: '2026-11-20',
  team: String(t.code),
  shift: String(t.shift),
  leader: String(t.leader),
  creator: '曹雨林',
  time: `2026-11-02 23:${pad(32 + i)}:15`,
}));

const SALES_OUTPUT: ProdRow[] = [
  { org: PROD_ORG, sale: '1000072640', product: '10034111', name: '强人椰果湘莲八宝粥（202611版）空罐-209#360', orderQty: '164160', okQty: '164160', workOrder: '1045261', mo: '1045261-05001', planQty: '425641', outQty: '164160' },
  { org: PROD_ORG, sale: '1000072640', product: '10034111', name: '强人椰果湘莲八宝粥（202611版）空罐-209#360', orderQty: '164160', okQty: '164160', workOrder: '1045261', mo: '1045261-05002', planQty: '425641', outQty: '164160' },
  { org: PROD_ORG, sale: '1000072642', product: '10034109', name: '强人银耳湘莲八宝粥（202611版）空罐-209#360', orderQty: '0', okQty: '0', workOrder: '1045262', mo: '1045262-05001', planQty: '61900', outQty: '0' },
];

const ORDER_INPUT: ProdRow[] = [
  ['1044920', '10033171', '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', '200000', '201848', '40000000', 'PE拉伸缠绕膜-机用-15.5um*500mm', '8', '0'],
  ['1044920', '10033171', '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', '200000', '201848', '10033172', '印铁-209#200泰奇八宝粥200克优惠小罐装（新国标版）', '4048', '0'],
  ['1044920', '10033171', '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', '200000', '201848', '60001001', '内边缝补涂-PPG2238-801/A', '20', '10'],
  ['1044920', '10033171', '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', '200000', '201848', '40002453', '隔层纸板-单灰-1400mm*1100mm*300g', '242', '0'],
  ['1044920', '10033171', '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', '200000', '201848', '40002509', 'PP打包带-机用-白色-13mm*0.85mm', '5', '0'],
].map((r) => ({ org: PROD_ORG, workOrder: r[0], product: r[1], productName: r[2], plan: r[3], output: r[4], material: r[5], materialName: r[6], input: r[7], back: r[8] }));

const SALES_DELIVERY: ProdRow[] = [
  ['1000070861', '2000459734', '2026-11-09 01:05:37', '2026-11-16', '10029352', '马口铁三片罐含蓝底盖(中山)红牛维生素牛磺酸饮料常规版(2601)', '3661440', '0', '3661440'],
  ['1000070861', '2000459738', '2026-11-09 01:05:37', '2026-11-16', '10008220', '206#铝易开盖红牛维生素牛磺酸饮料常规版', '4719867', '0', '4719867'],
  ['1000070506', '2000459732', '2026-11-09 01:00:38', '2026-11-16', '10032781', '达利桂圆莲子八宝粥（福广南2026版）空罐-209#360', '2000000', '1781120', '218880'],
  ['1000070717', '2000459739', '2026-11-09 01:05:37', '2026-11-16', '10008294', '209#-0.2mm-T4BA- 0/0-铁底盖', '1762000', '1524040', '237960'],
].map((r) => ({ org: PROD_ORG, salesNo: r[0], deliveryNo: r[1], status: '操作中', createTime: r[2], planTime: r[3], material: r[4], materialName: r[5], planQty: r[6], waitQty: r[7], doneQty: r[8] }));

const MO_ONLINE_LOG: ProdRow[] = [
  ['1045403-05001', '10033897', '天丝红牛-红牛维生素风味饮料250ml 促销装V3 P2新', '10500404', '制罐D线', '2026-11-20 08:44:12', '041398', '赵建', '', '', ''],
  ['1045261-05001', '10034111', '强人椰果湘莲八宝粥（202611版）空罐-209#360', '10500401', '制罐A线', '2026-11-20 08:32:38', '040129', '陈伍松', '', '', ''],
  ['1045261-05002', '10034111', '强人椰果湘莲八宝粥（202611版）空罐-209#360', '10500401', '制罐A线', '2026-11-20 08:30:46', '040129', '陈伍松', '2026-11-20 08:32:14', '040129', '陈伍松'],
  ['1044920-05001', '10033171', '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', '10500401', '制罐A线', '2026-11-17 08:30:19', '040129', '陈伍松', '2026-11-17 15:20:57', '040086', '李四梅'],
].map((r) => ({ org: PROD_ORG, no: r[0], product: r[1], productName: r[2], lineCode: r[3], line: r[4], onTime: r[5], onUser: r[6], onName: r[7], offTime: r[8], offUser: r[9], offName: r[10] }));

const FIRST_KIT: ProdRow[] = [
  ['物料料号', '10033898', '印铁-206#250红牛维生素风味饮料促销装V3 P2新', '物料分组', '薄钢板-涂覆-罐身铁'],
  ['物料分组', '薄钢板-彩印-罐身铁', '', '物料分组', ''],
  ['物料料号', '10032782', '印铁-209#360 达利桂圆莲子八宝粥（福广南2026版）', '物料分组', ''],
  ['物料料号', '10032148', '印铁-209#360泰奇八宝粥优惠装(代言人2607版)', '物料分组', ''],
  ['物料料号', '10026091', '印铁-206#250天丝红牛2025红包V2版', '物料分组', ''],
  ['物料料号', '10026069', '印铁-206#250天丝红牛2025红包V1版新地址', '物料分组', ''],
  ['物料料号', '10024778', '印铁-206#250天丝红牛-OEM+TCM2025一元全国版', '物料分组', ''],
].map((r) => ({ org: PROD_ORG, type: r[0], code: r[1], name: r[2], group: r[3], remark: r[4] }));

const LOW_STOCK: ProdRow[] = mkRows(10, (i) => ({
  org: PROD_ORG,
  type: '物料料号',
  code: ['10033920', '10033920', '10033920', '10034112', '10034110', '10033898', '10033898', '10032148', '10032782', '10033172'][i],
  name: [
    '印铁-马口铁三片罐红牛维生素牛磺酸饮料常规版(2610)',
    '印铁-马口铁三片罐红牛维生素牛磺酸饮料常规版(2610)',
    '印铁-马口铁三片罐红牛维生素牛磺酸饮料常规版(2610)',
    '印铁-209#360强人椰果湘莲八宝粥（202611版）',
    '印铁-209#360强人银耳湘莲八宝粥（202611版）',
    '印铁-206#250红牛维生素风味饮料促销装V3 P2新',
    '印铁-206#250红牛维生素风味饮料促销装V3 P2新',
    '印铁-209#360泰奇八宝粥优惠装(代言人2607版)',
    '印铁-209#360 达利桂圆莲子八宝粥（福广南2026版）',
    '印铁-209#200泰奇八宝粥200克优惠小罐装（新国标版）',
  ][i],
  group: '物料分组',
  remark: '',
}));

const COLLECT_SET: ProdRow[] = [
  ['SB-15', 'B线内全喷机', 'total_kick_num', '999999999', '15223', '2026-11-10 20:56:50'],
  ['SB-11', 'B线封口机', 'ng', '999999999', '149', '2026-11-10 20:41:48'],
  ['SB-05', 'B线电阻焊机', 'ng', '999999999', '0', '2025-11-18 16:29:03'],
  ['SB-15', 'B线内全喷机', 'ok', '999999999', '404530', '2026-11-10 20:21:48'],
  ['SB-11', 'B线封口机', 'B线全喷产量', '999999999', '50958460', '2026-11-10 20:42:04'],
  ['SB-05', 'B线电阻焊机', 'B线封口产量', '999999999', '537573739', '2026-11-10 20:37:08'],
  ['SB-04', 'B线裁剪', 'B线大张铁数量', '999999999', '1246168779', '2026-11-10 20:34:27'],
].map((r) => ({ org: PROD_ORG, code: r[0], name: r[1], item: r[2], max: r[3], last: r[4], time: r[5] }));

const COLOR_RESTORE: ProdRow[] = mkRows(8, (i) => ({
  org: PROD_ORG,
  barcode: `10029346%1004%000002023791%00${19 - i}`,
  factory: '1004',
  colorOrder: '2023791',
  mo: ['1045034-05001', '1045033-05001', '1044685-05001'][i % 3],
  workOrder: ['1045034', '1045033', '1044685'][i % 3],
  material: '10029352',
}));

const INVALID_TIME_MGR: ProdRow[] = [
  ['制罐A线', '计划停机', '换版', '2026-11-20 08:00:00', '2026-11-20 08:30:00', '30'],
  ['制罐B线', '设备故障', '封口机异常', '2026-11-20 09:12:00', '2026-11-20 09:48:00', '36'],
  ['制罐D线', '计划停机', '换料', '2026-11-20 10:00:00', '2026-11-20 10:22:00', '22'],
  ['制罐E线', '品质等待', '首件确认', '2026-11-20 11:05:00', '2026-11-20 11:20:00', '15'],
].map((r) => ({ org: PROD_ORG, line: r[0], type: r[1], reason: r[2], start: r[3], end: r[4], minutes: r[5] }));

const REWORK_ROWS: ProdRow[] = [
  { org: PROD_ORG, reworkNo: 'RW20261120001', mo: '1045403-05001', product: '10033897', productName: '天丝红牛-红牛维生素风味饮料250ml 促销装V3 P2新', line: '制罐D线', process: '封口机', reason: '卷封叠接率偏低', qty: '320', status: '操作中', createTime: '2026-11-20 09:15:00' },
  { org: PROD_ORG, reworkNo: 'RW20261119004', mo: '1045261-05001', product: '10034111', productName: '强人椰果湘莲八宝粥（202611版）空罐-209#360', line: '制罐A线', process: '电阻焊机', reason: '焊缝补涂厚度不足', qty: '180', status: '下达完成', createTime: '2026-11-19 14:40:22' },
  { org: PROD_ORG, reworkNo: 'RW20261118002', mo: '1044920-05001', product: '10033171', productName: '泰奇八宝粥200克优惠小罐装（新国标版）-209#200', line: '制罐B线', process: '内全喷涂', reason: '内喷涂针孔复检', qty: '240', status: '开立', createTime: '2026-11-18 16:12:08' },
];

/* ---------- 数据中心：生产数据分析（确定性算法，避免每次渲染闪烁） ---------- */
const DC_LINES = ['制罐A线', '制罐B线', '制罐D线', '制罐E线'];
const DC_TEAMS = ['SA1', 'SA2', 'SB1', 'SB2'];
const FAULTS = ['设备故障', '计划停机', '品质等待', '换型调机', '物料等待'];
const PRODUCTS = ['10033897 天丝红牛250ml', '10034111 八宝粥空罐209#360', '10030192 红牛250ml', '10032077 椰果空罐'];
const MATERIALS = ['10008358 209#底盖', '40000000 PE缠绕膜', '10034112 印铁209#360', '10500404 马口铁'];
const CHART_LABELS = ['11-13', '11-14', '11-15', '11-16', '11-17', '11-18', '11-19', '11-20'];

function detHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function detPick<T>(arr: T[], seed: string): T {
  return arr[detHash(seed) % arr.length];
}

function fakeAnalysisValue(pageId: string, k: string, i: number): string {
  const seed = `${pageId}:${k}:${i}`;
  if (k === 'org' || k.includes('组织机构')) return PROD_ORG;
  if (k.includes('线体编码')) return ['10500401', '10500402', '10500404', '10500405'][i % 4];
  if (k.includes('线体') || k.includes('产线') || k.includes('线别')) return DC_LINES[i % DC_LINES.length];
  if (k.includes('班组')) return DC_TEAMS[i % DC_TEAMS.length];
  if (k.includes('班次')) return i % 2 ? '晚班' : '早班';
  if (k.includes('设备编码')) return `EQ-${['A', 'B', 'D', 'E'][i % 4]}-${pad(i + 1, 3)}`;
  if (k.includes('设备条码')) return `SB-${pad(10 + i, 2)}`;
  if (k.includes('设备名称') || k.includes('设备') || k.includes('工作中心')) {
    return detPick(['D线裁剪', 'A线全喷', 'B线封口机', 'E线缠膜机', 'D线电阻焊'], seed);
  }
  if (k.includes('故障原因') || k.includes('原因')) return FAULTS[i % FAULTS.length];
  if (k.includes('故障来源')) return detPick(['设备状态', 'IoT采集', '维修单', '人工报修'], seed);
  if (k.includes('产品名称')) return detPick(PRODUCTS, seed).split(' ').slice(1).join(' ');
  if (k.includes('产品料号')) return detPick(PRODUCTS, seed).split(' ')[0];
  if (k.includes('物料名称')) return detPick(MATERIALS, seed).split(' ').slice(1).join(' ');
  if (k.includes('料号') || k.includes('物料编码')) return detPick(MATERIALS, seed).split(' ')[0];
  if (k.includes('条码') || k.includes('SN')) return `10033897%1050%20261120%1050040${(i % 4) + 1}%00${pad(i + 1, 3)}`;
  if (k.includes('单号') || k.includes('制令单') || k.includes('工单') || k.includes('销售订单')) {
    return detPick(['1045403-05001', '1045261-05001', '1044920-05001', '1000072640'], seed);
  }
  if (k.includes('日期') && !k.includes('时间')) return `2026-11-${pad(13 + (i % 8))}`;
  if (k.includes('时间') || k.includes('日期')) return `2026-11-${pad(14 + (i % 7))} ${pad(8 + (i % 10))}:${pad((i * 7) % 60)}`;
  if (k.includes('率')) return `${82 + ((i * 7) % 17)}.${(i * 3) % 10}%`;
  if (k.includes('工时') || k.includes('时长')) return String(80 + ((i * 13) % 180));
  if (k.includes('不良') || k.includes('报废')) return String(24 + ((i * 37) % 360));
  if (k.includes('数量') || k.includes('产量') || k.includes('数') || k.includes('量') || k.includes('投入') || k.includes('产出')) {
    return String(120000 + ((i * 8731) % 680000));
  }
  if (k.includes('状态') || k.includes('标识') || k.includes('结果')) return detPick(['正常', '已回传', '未回传', '维修中'], seed);
  if (k.includes('是否')) return i % 3 ? '是' : '否';
  if (k.includes('工序')) return detPick(['裁剪', '电阻焊', '封口机', '收罐台', '打包机'], seed);
  if (k.includes('工位')) return `GW-${['A', 'B', 'D', 'E'][i % 4]}0${(i % 5) + 1}`;
  if (k.includes('人')) return detPick(['陈伍松', '赵建', '黄田兴', '李春松', '李元龙'], seed);
  if (k.includes('规格')) return detPick(['209#360ML', '206#250ML', '209#200G', '674#'], seed);
  if (k.includes('批次')) return `B202611${pad(14 + (i % 7))}${pad(i + 1, 2)}`;
  if (k.includes('备注')) return '演示数据';
  return detPick(['1045403-05001', '10033897', `SA${(i % 2) + 1}`, '正常'], seed);
}

function analysisRows(
  pageId: string,
  cols: ProdColDef[],
  n = 8,
  seed?: ProdRow | ((i: number) => ProdRow)
): ProdRow[] {
  return mkRows(n, (i) => {
    const r: ProdRow = { org: PROD_ORG };
    cols.forEach((c) => {
      if (c.k) r[c.k] = fakeAnalysisValue(pageId, c.k, i);
    });
    if (seed) {
      Object.assign(r, typeof seed === 'function' ? seed(i) : seed);
    }
    return r;
  });
}

function AS(labels: string[]): ProdFilterDef[] {
  const out: ProdFilterDef[] = [SEL('组织机构', 'org', [PROD_ORG])];
  (labels || []).forEach((label) => {
    if (label === '组织机构' || out.some((f) => f.label === label)) return;
    if (/时间|日期/.test(label)) out.push(DATE(label));
    else if (/状态|标识|结果|来源|是否/.test(label)) out.push(OP(label, label, ['包含', '等于']));
    else out.push(OP(label, label));
  });
  return out;
}

interface AnalysisDef {
  id: string;
  name: string;
  search: string[];
  cols: ProdColDef[];
  stats?: ProdStatCardDef[];
  charts?: ProdChartDef[];
  seed?: ProdRow | ((i: number) => ProdRow);
}

const ANALYSIS_DEFS: AnalysisDef[] = [
  { id: 'materialLoss', name: '物料损耗率', search: ['退料时间', '制令单号', '物料料号', '线体', '生产面别'], cols: [AC('组织机构'), AC('制令单号'), AC('生产面别'), AC('计划数量'), AC('线体'), AC('物料料号'), AC('物料名称'), AC('物料规格')] },
  { id: 'linePassRate', name: '线体直通率', search: ['统计日期', '线体', '产品料号'], cols: [AC('组织机构'), AC('线体'), AC('产品料号'), AC('产品名称'), AC('产品规格'), AC('统计数'), AC('合格数'), AC('不良数'), AC('直通率'), AC('统计日期')], charts: [{ title: '线体直通率 (%)', type: 'bar', data: [{ name: 'A线', value: 98.6 }, { name: 'B线', value: 97.8 }, { name: 'D线', value: 99.1 }, { name: 'E线', value: 96.4 }] }] },
  { id: 'outputTrend', name: '产量趋势汇总', search: ['生产时间', '汇总条件', '线体', '产品料号', '工单号'], cols: [AC('线别'), AC('产品料号'), AC('工单号'), AC('生产时间'), AC('汇总条件'), AC('投入数量'), AC('产出数量'), AC('不良数'), AC('报废数')], charts: [{ title: '投入 / 产出趋势 (万罐)', type: 'line', labels: CHART_LABELS, series: [{ name: '投入数量', data: [62, 68, 71, 66, 75, 73, 78, 82] }, { name: '产出数量', data: [60, 66, 69, 65, 73, 71, 76, 80] }] }, { title: '不良 / 报废趋势', type: 'line', labels: CHART_LABELS, series: [{ name: '不良数', data: [12, 9, 15, 11, 8, 13, 10, 7] }, { name: '报废数', data: [5, 4, 7, 3, 6, 4, 2, 5] }] }] },
  { id: 'wipInfo', name: '产品在制信息', search: ['过站时间', '产品SN', '产品料号', '工单号', '工序名称', '制令单号'], cols: [AC('区域编码'), AC('制令单号'), AC('产品SN'), AC('产品料号'), AC('产品名称'), AC('产品批次'), AC('产品数量'), AC('品质状态'), AC('产出工序'), AC('产出工位')] },
  { id: 'productPass', name: '产品过站记录', search: ['过站时间', '制令单号', '产品条码', '工序名称'], cols: [AC('组织机构'), AC('制令单号'), AC('产品条码'), AC('产品料号'), AC('产品名称'), AC('产品数量'), AC('产品批次'), AC('产出工序'), AC('产出工位')] },
  { id: 'semiInput', name: '半成品投入记录', search: ['投入时间', '制令单号', '物料条码', '投入工序'], cols: [AC('组织机构'), AC('制令单号'), AC('物料条码'), AC('物料料号'), AC('物料名称'), AC('投入数量'), AC('投入工序'), AC('投入工位'), AC('投入时间')] },
  { id: 'materialInput', name: '原材料投入记录', search: ['投入时间', '投入制令单', '物料条码', '投入工序', '物料料号'], cols: [AC('组织机构'), AC('投入制令单'), AC('物料条码'), AC('物料名称'), AC('物料料号'), AC('投入数量'), AC('投入工序'), AC('投入工位'), AC('投入时间')] },
  { id: 'onlineMaterial', name: '在线物料记录', search: ['统计时间', '线体', '物料料号', '工位'], cols: [AC('组织机构'), AC('线体'), AC('工位'), AC('物料料号'), AC('物料名称'), AC('在线数量'), AC('低位阈值'), AC('更新时间')] },
  { id: 'dailyLoss', name: '生产日报-损耗', search: ['过站时间', '报工日期', '产线', '班组', '工单', '料号', '产品名称', '制令单号'], cols: [AC('组织机构'), AC('日期'), AC('产线'), AC('班组'), AC('工单'), AC('料号'), AC('产品名称'), AC('投入数量'), AC('产出数量'), AC('损耗数量')] },
  { id: 'dailyOutput', name: '每日线体产量', search: ['统计日期', '线体', '产品料号', '班组'], cols: [AC('组织机构'), AC('统计日期'), AC('线体'), AC('班组'), AC('产品料号'), AC('产品名称'), AC('合格数量'), AC('不良数量'), AC('报废数量'), AC('产出合计')], charts: [{ title: '各线体产量 (万罐)', type: 'bar', data: [{ name: 'A线', value: 76 }, { name: 'B线', value: 69 }, { name: 'D线', value: 91 }, { name: 'E线', value: 64 }] }] },
  { id: 'materialInputLog', name: '原材料投入日志', search: ['投入时间', '工作日期', '制令单号', '物料SN', '物料料号', '投入工位'], cols: [AC('组织机构'), AC('制令单号'), AC('物料SN'), AC('物料名称'), AC('物料料号'), AC('投入名称'), AC('投入工位'), AC('投入时间'), AC('回传ERP结果'), AC('班组编号')] },
  { id: 'materialInputLogNew', name: '原材料投入日志新', search: ['投入时间', '制令单号', '物料条码', '物料料号'], cols: [AC('组织机构'), AC('制令单号'), AC('物料条码'), AC('物料名称'), AC('物料料号'), AC('投入数量'), AC('投入工位'), AC('投入时间'), AC('回传SAP标识')] },
  { id: 'materialRecycleLogNew', name: '物料回收日志新', search: ['回收时间', '物料条码', '物料料号', '工单', '制令单'], cols: [AC('组织机构'), AC('物料条码'), AC('物料料号'), AC('物料名称'), AC('物料数量'), AC('工单'), AC('制令单'), AC('桶号'), AC('回传SAP标识')] },
  { id: 'materialRecycleLog', name: '物料回收日志', search: ['回收时间', '物料条码', '物料料号', '工单', '制令单'], cols: [AC('组织机构'), AC('物料条码'), AC('物料料号'), AC('物料名称'), AC('物料数量'), AC('工单'), AC('制令单'), AC('桶号')] },
  { id: 'certReportRecord', name: '合格证报工记录', search: ['产出时间', '产品条码', '产品料号', '工单', '制令单', '产线', '报工班组'], cols: [AC('组织机构'), AC('产品条码'), AC('产品料号'), AC('产品名称'), AC('产品批次'), AC('产出数量'), AC('工单'), AC('制令单'), AC('销售单号'), AC('报工班组')] },
  { id: 'moInputTrace', name: '制令单投料追溯', search: ['操作时间', '制令单', '物料条码', '物料料号', '投入工位', '投入工序'], cols: [AC('组织机构'), AC('制令单'), AC('物料条码'), AC('物料料号'), AC('物料名称'), AC('物料规格'), AC('投入工位'), AC('投入工序'), AC('操作时间')] },
  { id: 'scrapReason', name: '报废原因分布', search: ['报工日期', '报工班组'], cols: [AC('组织机构'), AC('报工日期'), AC('报工班组'), AC('总报废数量'), AC('彩印'), AC('底盖'), AC('焊机'), AC('其他')], charts: [{ title: '报废原因分布', type: 'bar', data: [{ name: '彩印', value: 42 }, { name: '底盖', value: 31 }, { name: '焊机', value: 58 }, { name: '其他', value: 19 }] }] },
  { id: 'canBalance', name: '罐身平衡报表', search: ['统计日期', '线体', '产品料号'], cols: [AC('组织机构'), AC('统计日期'), AC('线体'), AC('产品料号'), AC('投入数量'), AC('产出数量'), AC('报废数量'), AC('库存差异')] },
  { id: 'badScrapDetail', name: '不良报废明细', search: ['过站时间', '报工日期', '制令单号', '产品条码', '产品料号', '不良代码', '品质状态', '线体编码'], cols: [AC('组织机构'), AC('制令单号'), AC('产品条码'), AC('产品料号'), AC('产品名称'), AC('不良代码'), AC('不良名称'), AC('品质状态'), AC('不良数量'), AC('线体编码')] },
  { id: 'badScrapSummary', name: '不良报废汇总', search: ['报工日期', '制令单号', '产品料号', '品质状态'], cols: [AC('组织机构'), AC('制令单号'), AC('产品料号'), AC('产品名称'), AC('品质状态'), AC('不良数量'), AC('报废数量'), AC('报工日期')], charts: [{ title: '不良报废趋势', type: 'bar', data: [{ name: 'A线', value: 32 }, { name: 'B线', value: 41 }, { name: 'D线', value: 25 }, { name: 'E线', value: 38 }] }] },
  { id: 'stackLog', name: '并垛日志', search: ['操作时间', '线体', '产品料号'], cols: [AC('组织机构'), AC('操作时间'), AC('线体'), AC('产品料号'), AC('并垛数量'), AC('托盘号'), AC('操作人')] },
  { id: 'pendingToNormal', name: '待处理品转正常日志', search: ['操作时间', '产品条码', '制令单号'], cols: [AC('组织机构'), AC('操作时间'), AC('产品条码'), AC('产品料号'), AC('产品名称'), AC('转换数量'), AC('原状态'), AC('目标状态')] },
  { id: 'lossQty', name: '损耗量', search: ['统计日期', '线体', '工序', '物料料号'], cols: [AC('日期'), AC('线体'), AC('班组'), AC('工序'), AC('物料料号'), AC('投入数量'), AC('产出数量'), AC('损耗量'), AC('损耗原因')] },
  { id: 'materialWan', name: '原材料万罐用量管理', search: ['工单开始时间', '工单', '线体', '产品料号', '物料料号'], cols: [AC('组织机构'), AC('工单'), AC('线体'), AC('产品料号'), AC('物料料号'), AC('物料名称'), AC('计划用量'), AC('实际用量'), AC('万罐用量')] },
  { id: 'deviceFaultTime', name: '设备故障时间分析', search: ['统计日期', '线体', '设备', '故障原因'], cols: [AC('组织机构'), AC('统计日期'), AC('线体'), AC('班组'), AC('设备'), AC('故障原因'), AC('故障次数'), AC('故障时长(min)')], charts: [{ title: '故障时长分布 (min)', type: 'bar', data: [{ name: 'A线', value: 96 }, { name: 'B线', value: 142 }, { name: 'D线', value: 78 }, { name: 'E线', value: 121 }] }] },
  { id: 'deviceCollectTime', name: '设备采集时间分布', search: ['日期', '线体', '班组', '设备'], cols: [AC('组织机构'), AC('日期'), AC('线体'), AC('班组'), AC('设备'), AC('开机运行总时长'), AC('停机时间'), AC('待机时间')], charts: [{ title: '设备停机时间 (min)', type: 'bar', data: [{ name: '裁剪', value: 9 }, { name: '全喷', value: 28 }, { name: '封口', value: 14 }, { name: '缠膜', value: 6 }] }] },
  { id: 'dailyPlanRate', name: '日计划达成率', search: ['计划日期', '工单号', '物料料号', '线体'], cols: [AC('计划日期'), AC('销售订单号'), AC('工单号'), AC('工单数量'), AC('已完工数量'), AC('差异量'), AC('当日计划量'), AC('当日报工数量'), AC('当日完成率'), AC('物料名称'), AC('线体')], charts: [{ title: '当日计划达成率 (%)', type: 'bar', data: [{ name: 'A线', value: 94 }, { name: 'B线', value: 49 }, { name: 'D线', value: 88 }, { name: 'E线', value: 76 }] }] },
  { id: 'fixtureOnline', name: '生产工装上下线', search: ['操作时间', '工装编码', '线体'], cols: [AC('组织机构'), AC('操作时间'), AC('工装编码'), AC('工装名称'), AC('线体'), AC('操作类型'), AC('操作人')] },
  { id: 'andonRecord', name: '安灯发起记录', search: ['发起时间', '设备条码', '设备名称'], cols: [AC('组织机构'), AC('发起时间'), AC('设备条码'), AC('设备名称'), AC('安灯类型'), AC('发起原因'), AC('处理状态'), AC('处理人')] },
  { id: 'pendingReport', name: '待处理品报工记录', search: ['报工时间', '产品条码', '制令单号'], cols: [AC('组织机构'), AC('报工时间'), AC('产品条码'), AC('产品料号'), AC('产品名称'), AC('待处理数量'), AC('报工数量'), AC('处理状态')] },
  { id: 'scrapSummary', name: '报废汇总', search: ['统计日期', '线体', '产品料号', '班组'], cols: [AC('组织机构'), AC('统计日期'), AC('线体'), AC('班组'), AC('产品料号'), AC('投入数量'), AC('合格数量'), AC('报废数量'), AC('报废率')] },
  { id: 'efficiencyReport', name: '生产效率报表', search: ['统计日期', '线体', '班组'], cols: [AC('组织机构'), AC('统计日期'), AC('线体'), AC('班组'), AC('计划工时'), AC('实际工时'), AC('产出数量'), AC('标准工时'), AC('效率')], charts: [{ title: '线体生产效率 (%)', type: 'bar', data: [{ name: 'A线', value: 92 }, { name: 'B线', value: 86 }, { name: 'D线', value: 96 }, { name: 'E线', value: 81 }] }] },
  { id: 'lineOverall', name: '产线整体报表(ABDE)', search: ['统计日期', '线体'], cols: [AC('组织机构'), AC('统计日期'), AC('线体'), AC('计划量'), AC('投入量'), AC('产出量'), AC('合格量'), AC('报废量'), AC('直通率'), AC('效率')], charts: [{ title: 'ABDE 产线产出 (万罐)', type: 'bar', data: [{ name: 'A线', value: 82 }, { name: 'B线', value: 76 }, { name: 'D线', value: 91 }, { name: 'E线', value: 68 }] }] },
  { id: 'lineWorkHours', name: '线体实际生产工时', search: ['生产日期', '线体编码', '线体名称'], cols: [AC('组织机构'), AC('生产日期'), AC('线体编码'), AC('线体名称'), AC('开班时间'), AC('下班时间'), AC('计划工时'), AC('实际生产工时'), AC('异常停机工时')], charts: [{ title: '实际生产工时 (h)', type: 'bar', data: [{ name: 'A线', value: 19 }, { name: 'B线', value: 18 }, { name: 'D线', value: 20 }, { name: 'E线', value: 17 }] }] },
  { id: 'efficiencySummary', name: '生产效率综合报表', search: ['统计日期', '线体', '班组', '产品料号'], cols: [AC('组织机构'), AC('统计日期'), AC('线体'), AC('班组'), AC('产品料号'), AC('计划数量'), AC('产出数量'), AC('投入工时'), AC('产出工时'), AC('综合效率')], charts: [{ title: '综合效率趋势 (%)', type: 'line', labels: CHART_LABELS, series: [{ name: '效率', data: [82, 86, 88, 84, 91, 89, 93, 90] }] }] },
  { id: 'scrapBarcodeDelete', name: '报废条码删除记录', search: ['操作时间', '制令单号', '产品条码'], cols: [AC('组织机构'), AC('操作时间'), AC('制令单号'), AC('产品条码'), AC('产品料号'), AC('报废原因'), AC('操作人'), AC('删除原因')] },
  { id: 'productionDetail', name: '生产综合明细报表', search: ['生产时间', '制令单号', '工单号', '线体', '产品料号'], cols: [AC('组织机构'), AC('生产时间'), AC('线体'), AC('制令单号'), AC('工单号'), AC('产品料号'), AC('产品名称'), AC('投入数量'), AC('产出数量'), AC('报废数量'), AC('生产状态')] },
  {
    id: 'downtime',
    name: '设备异常停机工时汇总',
    search: ['设备编码', '设备名称', '故障来源', '班组', '线体名称', '创建时间', '是否停机', '故障原因', '维修单号'],
    cols: [AC('创建时间'), AC('班组'), AC('线体名称'), AC('设备编码'), AC('设备名称'), AC('开始时间'), AC('结束时间'), AC('故障原因'), AC('停机工时(h)'), AC('维修单号')],
    stats: [
      { label: '异常停机工时', val: '86.5h', color: '#EA580C', icon: 'M4' },
      { label: '停机次数', val: '24', color: '#D97706', icon: 'M1' },
      { label: '平均单次', val: '3.6h', color: '#165DFF', icon: 'M3' },
    ],
    charts: [{ title: '停机工时按原因分布 (h)', type: 'bar', data: [{ name: '设备故障', value: 42 }, { name: '计划停机', value: 18 }, { name: '品质等待', value: 12 }, { name: '换型调机', value: 9 }, { name: '物料等待', value: 5.5 }] }],
    seed: (i) => {
      const h = 2 + ((i * 3) % 6);
      const day = 14 + (i % 7);
      const sh = 8 + (i % 8);
      const eh = sh + h;
      const ed = eh > 23 ? day + 1 : day;
      const eh2 = eh > 23 ? eh - 24 : eh;
      return {
        创建时间: `2026-11-${pad(day)} ${pad(sh)}:05`,
        开始时间: `2026-11-${pad(day)} ${pad(sh)}:00`,
        结束时间: `2026-11-${pad(ed)} ${pad(eh2)}:${pad((i * 7) % 60)}`,
        '停机工时(h)': `${h}.${(i * 3) % 10}`,
        维修单号: `WX202611${pad(day)}0${i + 1}`,
      };
    },
  },
];

/* ---------- 作业工作台配置 ---------- */
const WF = (
  label: string,
  key: string,
  o: Partial<ProdWorkbenchField> = {}
): ProdWorkbenchField => ({ label, key, ...o });

const buildScrapSections = (): ProdWorkbenchSection[] => [
  {
    title: '称重设置',
    cols: 3,
    fields: [
      WF('解析格式', 'fmt', { type: 'select', opts: ['请选择', 'DJ3KD'] }),
      WF('串口设置', 'port'),
    ],
  },
  {
    title: '产出信息',
    cols: 3,
    fields: [
      WF('制令单号', 'mo'),
      WF('工作中心', 'center'),
      WF('产品料号', 'product'),
      WF('产品名称', 'productName'),
      WF('产出工序', 'process'),
      WF('生产线别', 'line'),
      WF('产出班组', 'team', { type: 'select', opts: ['请选择', 'SA1', 'SB1', 'SD1', 'SE1'] }),
      WF('产出班次', 'shift', { type: 'select', opts: ['请选择', '早班', '晚班'] }),
      WF('称重重量', 'weight'),
      WF('产品数量', 'qty'),
    ],
  },
  {
    title: '不良信息列表',
    cols: 3,
    table: {
      title: '不良信息',
      cols: [COL('不良代码', 'code'), COL('不良名称', 'name'), COL('不良数量', 'qty')],
      rows: [],
    },
  },
];

const WORKBENCHES: Record<string, ProdWorkbenchConfig> = {
  batchReport: {
    id: 'batchReport',
    type: 'workbench',
    title: '批次报工',
    tabs: ['基础信息', '工序信息', '产品报工', '物料信息'],
    sections: [
      {
        title: '基础信息',
        cols: 3,
        fields: [
          WF('*制令单号', 'mo'),
          WF('产品料号', 'product'),
          WF('投入量', 'input'),
          WF('产品名称', 'productName'),
          WF('产出量', 'output'),
          WF('产品规格', 'spec'),
          WF('产品版本', 'ver'),
        ],
      },
      {
        title: '工序信息',
        cols: 5,
        fields: [
          WF('工序编码', 'opCode'),
          WF('工序名称', 'opName'),
          WF('工序类型', 'opType', { type: 'select', opts: ['请选择', '首工序', '中末工序', '称重'] }),
          WF('良品数', 'ok'),
          WF('不良品数', 'ng'),
        ],
        table: {
          title: '工序明细',
          cols: [COL('工序编码', 'opCode'), COL('工序名称', 'opName'), COL('良品数', 'ok'), COL('不良品数', 'ng')],
          rows: [],
        },
      },
      {
        title: '产品报工',
        cols: 4,
        fields: [
          WF('*工作中心', 'center'),
          WF('*良品数量', 'okQty'),
          WF('不良数量', 'ngQty'),
          WF('报工批次', 'batch'),
          WF('不良代码', 'badCode'),
          WF('工时(min)', 'hours'),
          WF('人员', 'user'),
        ],
      },
      {
        title: '物料信息',
        tabs: ['制令单BOM', '工艺流程', 'E-SOP'],
        table: {
          title: '物料清单',
          cols: [
            COL('物料SN', 'sn'),
            COL('物料料号', 'code'),
            COL('物料批次', 'batch'),
            COL('物料名称', 'name'),
            COL('物料数量', 'qty'),
            COL('物料用量', 'use'),
          ],
          rows: [],
        },
      },
    ],
    actions: ['报工保存'],
  },
  firstPass: {
    id: 'firstPass',
    type: 'workbench',
    title: '首工序过站',
    tabs: ['基础信息', '扫描条码', '物料信息'],
    sections: [
      {
        title: '基础信息',
        cols: 3,
        fields: [
          WF('*工作中心', 'center'),
          WF('制令单号', 'mo'),
          WF('线别', 'line'),
          WF('产品料号', 'product'),
          WF('工序', 'process'),
          WF('产品名称', 'productName'),
          WF('工序过站数', 'passQty'),
          WF('产品规格', 'spec'),
          WF('产品版本', 'ver'),
          WF('产品投入', 'input'),
        ],
      },
      {
        title: '扫描条码',
        cols: 3,
        fields: [WF('产品SN', 'sn'), WF('提示信息', 'tip', { type: 'textarea' })],
      },
      {
        title: '物料信息',
        tabs: ['制令单BOM', '工艺流程', 'E-SOP'],
        table: {
          title: '批次物料',
          cols: [
            COL('物料SN', 'sn'),
            COL('物料料号', 'code'),
            COL('物料名称', 'name'),
            COL('物料批次', 'batch'),
            COL('单位用量', 'unitUse'),
            COL('物料数量', 'qty'),
            COL('操作人', 'user'),
          ],
          rows: [],
        },
      },
    ],
    actions: ['过站保存'],
  },
  midPass: {
    id: 'midPass',
    type: 'workbench',
    title: '中末工序过站',
    tabs: ['基础信息', '扫描条码', '物料信息'],
    sections: [
      {
        title: '基础信息',
        cols: 3,
        fields: [
          WF('*工作中心', 'center'),
          WF('制令单号', 'mo'),
          WF('线别', 'line'),
          WF('产品料号', 'product'),
          WF('工序', 'process'),
          WF('产品名称', 'productName'),
          WF('工序过站数', 'passQty'),
          WF('产品规格', 'spec'),
          WF('产品版本', 'ver'),
          WF('产品过站', 'pass'),
        ],
      },
      {
        title: '扫描条码',
        cols: 3,
        fields: [WF('产品SN', 'sn'), WF('不良代码', 'badCode'), WF('提示信息', 'tip', { type: 'textarea' })],
      },
      {
        title: '物料信息',
        tabs: ['制令单BOM', '工艺流程', 'E-SOP'],
        table: {
          title: '批次物料',
          cols: [
            COL('物料SN', 'sn'),
            COL('物料料号', 'code'),
            COL('物料名称', 'name'),
            COL('物料批次', 'batch'),
            COL('单位用量', 'unitUse'),
            COL('物料数量', 'qty'),
            COL('操作人', 'user'),
          ],
          rows: [],
        },
      },
    ],
    actions: ['过站保存'],
  },
  weighPass: {
    id: 'weighPass',
    type: 'workbench',
    title: '称重过站',
    tabs: ['称重设置'],
    sections: [
      {
        title: '称重设置',
        cols: 3,
        fields: [
          WF('解析格式', 'fmt', { type: 'select', opts: ['请选择', 'DJ3KD'] }),
          WF('串口设置', 'port'),
          WF('工作中心', 'center'),
          WF('工序', 'process'),
          WF('产品SN', 'sn'),
          WF('制令单号', 'mo'),
          WF('产品料号', 'product'),
          WF('重量上限(g)', 'max'),
          WF('重量下限(g)', 'min'),
          WF('标准重量(g)', 'std'),
          WF('实际重量(g)', 'actual'),
        ],
      },
    ],
    actions: ['手工保存'],
  },
  weighInput: {
    id: 'weighInput',
    type: 'workbench',
    title: '物料称重投入',
    tabs: ['称重设置', '投入信息', '提示信息'],
    sections: [
      {
        title: '称重设置',
        cols: 3,
        fields: [WF('解析格式', 'fmt', { type: 'select', opts: ['请选择', 'DJ3KD'] }), WF('串口设置', 'port')],
      },
      {
        title: '投入信息',
        cols: 3,
        fields: [
          WF('制令单号', 'mo'),
          WF('工作中心', 'center'),
          WF('产品料号', 'product'),
          WF('产品名称', 'productName'),
          WF('投入工序', 'process'),
          WF('生产线别', 'line'),
          WF('投入班组', 'team', { type: 'select', opts: ['请选择', 'SA1', 'SB1', 'SD1', 'SE1'] }),
          WF('投入班次', 'shift', { type: 'select', opts: ['请选择', '早班', '晚班'] }),
          WF('物料SN', 'sn'),
          WF('物料料号', 'material'),
          WF('物料名称', 'materialName'),
          WF('称重重量', 'weight'),
        ],
      },
      {
        title: '提示信息',
        cols: 1,
        fields: [WF('提示日志', 'tip', { type: 'textarea' })],
      },
    ],
    actions: ['提交'],
  },
  certReport: {
    id: 'certReport',
    type: 'workbench',
    title: '合格证报工',
    tabs: ['称重设置', '报工信息', '待处理品条码'],
    sections: [
      {
        title: '称重设置',
        cols: 3,
        fields: [WF('解析格式', 'fmt', { type: 'select', opts: ['请选择', 'DJ3KD'] }), WF('串口设置', 'port')],
      },
      {
        title: '报工信息',
        cols: 4,
        fields: [
          WF('制令单号', 'mo'),
          WF('工作中心', 'center'),
          WF('产品料号', 'product'),
          WF('产品名称', 'productName'),
          WF('报工工序', 'process'),
          WF('生产线别', 'line'),
          WF('报工班组', 'team', { type: 'select', opts: ['请选择', 'SA1', 'SB1', 'SD1', 'SE1'] }),
          WF('报工班次', 'shift', { type: 'select', opts: ['请选择', '早班', '晚班'] }),
          WF('生产日期', 'date', { type: 'date' }),
          WF('产品类型', 'ptype', { type: 'select', opts: ['请选择', '正品', '副品'] }),
          WF('包装规格', 'pack'),
          WF('入库仓库', 'warehouse', { type: 'select', opts: ['请选择', '成品仓'] }),
          WF('检验人员', 'inspector', { type: 'select', opts: ['请选择', '李元龙'] }),
          WF('起时间', 'start'),
          WF('止时间', 'end'),
          WF('报工数量', 'qty'),
          WF('彩铁产家', 'maker'),
          WF('硬度', 'hardness'),
          WF('盖厚度', 'capThick'),
          WF('铁皮厚度', 'ironThick'),
          WF('盖膜号', 'film'),
          WF('板号', 'plate'),
          WF('打印模板', 'tpl'),
          WF('打印数量', 'printQty'),
          WF('工单剩余数量', 'remain'),
          WF('打印机', 'printer'),
        ],
      },
      {
        title: '待处理品条码',
        cols: 2,
        fields: [WF('RFID测试', 'rfid'), WF('可回收包装信息', 'package')],
        table: {
          title: '物料',
          cols: [COL('物料料号', 'code'), COL('物料名称', 'name'), COL('物料数量', 'qty')],
          rows: [],
        },
      },
    ],
    actions: ['自动报工', '重打条码', '转换合格品并打印', '提交'],
  },
  scrapWeigh: {
    id: 'scrapWeigh',
    type: 'workbench',
    title: '报废称重产出',
    tabs: ['称重设置', '产出信息', '不良信息列表'],
    sections: buildScrapSections(),
    actions: ['新增', '删除', '提交'],
  },
  badWeigh: {
    id: 'badWeigh',
    type: 'workbench',
    title: '不良称重产出',
    tabs: ['称重设置', '产出信息', '不良信息列表'],
    sections: buildScrapSections(),
    actions: ['新增', '删除', '提交'],
  },
};

/* ---------- 表单配置 ---------- */
const FD = (
  label: string,
  key: string,
  type: ProdFormField['type'] = 'text',
  opts: string[] = [],
  extra: Partial<ProdFormField> = {}
): ProdFormField => ({ label, key, type, opts, ...extra });

export const PROD_FORMS: Record<string, ProdFormDef> = {
  workshop: {
    title: '车间建模',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('车间名称', 'name', 'text', [], { required: true }),
          FD('线体', 'line', 'text', [], { required: true }),
          FD('子区域编码', 'code', 'text', [], { required: true }),
          FD('工序名称', 'process', 'text'),
          FD('轨道', 'rail', 'select', ['A', 'B', 'D', 'E']),
          FD('所属工种', 'worker', 'text'),
          FD('有效标志', 'valid', 'select', ['有效', '无效']),
        ],
      },
    ],
  },
  team: {
    title: '生产班组维护',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('班组编号', 'code', 'text', [], { required: true }),
          FD('班组名称', 'name', 'text', [], { required: true }),
          FD('备注', 'remark', 'text'),
        ],
      },
    ],
  },
  canParam: {
    title: '制罐参数信息',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('物料料号', 'code', 'text', [], { required: true }),
          FD('物料名称', 'name', 'text', [], { required: true }),
          FD('物料规格', 'spec'),
          FD('厚', 'thick'),
          FD('宽', 'width'),
          FD('长', 'length'),
          FD('每张铁制罐枚数', 'perSheet'),
        ],
      },
    ],
  },
  skill: {
    title: '员工技能管理',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('员工姓名', 'user', 'text', [], { required: true }),
          FD('工序名称', 'process', 'select', ['电阻焊机', '裁剪', '封口机', '收罐台', '打包机', '大烘炉'], { required: true }),
          FD('掌握情况', 'level', 'select', ['计划学习', '基本掌握', '完全掌握', '精通']),
          FD('备注', 'remark', 'textarea', [], { full: true }),
        ],
      },
    ],
  },
  permission: {
    title: '员工作业权限',
    titlePrefix: '权限配置',
    groups: [
      {
        name: '权限配置',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('员工编码', 'code', 'text', [], { required: true }),
          FD('员工姓名', 'name', 'text', [], { required: true }),
          FD('所属部门', 'dept', 'text'),
        ],
      },
    ],
  },
  andon: {
    title: '人员安灯设置',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('安灯IP', 'ip', 'text', [], { required: true }),
          FD('安灯端口', 'port'),
          FD('设备名称', 'device'),
          FD('备注', 'remark', 'textarea', [], { full: true }),
        ],
      },
    ],
  },
  shift: {
    title: '班组早晚班维护',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('工作日期', 'date', 'date', [], { required: true }),
          FD('班组', 'team', 'select', ['SA1', 'SA2', 'SB1', 'SB2', 'SD1', 'SD2', 'SE1', 'SE2'], { required: true }),
          FD('班次', 'shift', 'select', ['早班', '晚班'], { required: true }),
          FD('班组长', 'leader', 'text', [], { required: true }),
          FD('创建人', 'creator', 'text'),
        ],
      },
    ],
  },
  ecn: {
    title: 'ECN信息',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('ECN编号', 'no', 'text', [], { required: true }),
          FD('ECR编号', 'ecr', 'text'),
          FD('变更类型', 'type', 'select', ['工艺变更', 'BOM变更', '版面变更']),
          FD('ECN状态', 'status', 'select', ['开立', '操作中', '下达完成']),
          FD('产品料号', 'product', 'text'),
          FD('产品版本', 'ver', 'text'),
        ],
      },
    ],
  },
  invalidTimeMgr: {
    title: '无效时间管理',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('线体', 'line', 'select', ['制罐A线', '制罐B线', '制罐D线', '制罐E线'], { required: true }),
          FD('无效类型', 'type', 'select', ['计划停机', '设备故障', '品质等待'], { required: true }),
          FD('原因', 'reason', 'textarea', [], { full: true }),
          FD('开始时间', 'start', 'date'),
          FD('结束时间', 'end', 'date'),
          FD('时长(min)', 'minutes', 'number'),
        ],
      },
    ],
  },
  rework: {
    title: '返修管理',
    titlePrefix: '+新增',
    groups: [
      {
        name: '返修单信息',
        fields: [
          FD('组织机构', 'org', 'select', [PROD_ORG], { required: true }),
          FD('返修单号', 'reworkNo', 'text', [], { required: true }),
          FD('制令单号', 'mo', 'text', [], { required: true }),
          FD('产品料号', 'product', 'text', [], { required: true }),
          FD('产品名称', 'productName', 'text'),
          FD('线体', 'line', 'select', ['制罐A线', '制罐B线', '制罐D线', '制罐E线']),
          FD('返修工序', 'process', 'select', ['裁剪', '电阻焊机', '内全喷涂', '封口机', '打包机']),
          FD('返修数量', 'qty', 'number'),
          FD('状态', 'status', 'select', ['开立', '操作中', '下达完成']),
          FD('不良原因', 'reason', 'textarea', [], { full: true }),
        ],
      },
    ],
  },
  firstKit: {
    title: '首套备料配置',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('配置类型', 'type', 'select', ['物料料号', '物料分组'], { required: true }),
          FD('物料分组', 'group', 'text'),
          FD('物料料号', 'code', 'text', [], { required: true }),
          FD('物料名称', 'name', 'text'),
          FD('备注', 'remark', 'textarea', [], { full: true }),
        ],
      },
    ],
  },
  lowStock: {
    title: '工站物料低位配置',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('配置类型', 'type', 'select', ['物料料号', '物料分组'], { required: true }),
          FD('物料分组', 'group', 'text'),
          FD('物料料号', 'code', 'text', [], { required: true }),
          FD('物料名称', 'name', 'text'),
          FD('备注', 'remark', 'textarea', [], { full: true }),
        ],
      },
    ],
  },
  collectSet: {
    title: '数据采集过站设置',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织名称', 'org', 'select', [PROD_ORG], { required: true }),
          FD('工作中心编号', 'code', 'text', [], { required: true }),
          FD('工作中心名称', 'name', 'text', [], { required: true }),
          FD('采集项目名称', 'item', 'text', [], { required: true }),
          FD('最大采集', 'max', 'number'),
          FD('最后采集数值', 'last', 'number'),
        ],
      },
    ],
  },
};

export function getProdFormDef(pageKey: string, fallbackTitle: string): ProdFormDef {
  if (PROD_FORMS[pageKey]) return PROD_FORMS[pageKey];
  return {
    title: fallbackTitle || '记录',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('编码', 'code', 'text', [], { required: true }),
          FD('名称', 'name', 'text'),
          FD('备注', 'remark', 'textarea', [], { full: true }),
        ],
      },
    ],
  };
}

/* ---------- 全量页面配置汇总 ---------- */
const TABLE_PAGES: Record<string, ProdTablePageConfig> = {
  salesOutput: {
    id: 'salesOutput',
    type: 'table',
    title: '销售订单产量信息',
    dataset: SALES_OUTPUT,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('销售订单', 'sale'), OP('产品料号', 'product'), OP('产品名称', 'name'), OP('工单号', 'workOrder'), OP('制令单号', 'mo'), DATE('订单开始日期')],
    cols: [COL('销售订单', 'sale'), COL('产品料号', 'product'), COL('产品名称', 'name'), COL('销售订单总产量', 'orderQty'), COL('合格品数量', 'okQty'), COL('工单号', 'workOrder'), COL('工单计划量', 'planQty'), COL('工单总产量', 'outQty')],
    buttons: ['导出'],
    actions: [],
    total: 3,
  },
  orderInput: {
    id: 'orderInput',
    type: 'table',
    title: '工单投料信息',
    dataset: ORDER_INPUT,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('工单号', 'workOrder'), OP('产品料号', 'product'), OP('产品名称', 'productName'), OP('物料料号', 'material'), OP('物料名称', 'materialName'), DATE('计划开工时间')],
    cols: [COL('工单号', 'workOrder'), COL('产品料号', 'product'), COL('产品名称', 'productName'), COL('计划数量', 'plan'), COL('产出数量', 'output'), COL('物料料号', 'material'), COL('物料名称', 'materialName'), COL('投入总量', 'input'), COL('回收总量', 'back')],
    buttons: ['导出'],
    actions: [],
    total: 28,
  },
  salesDelivery: {
    id: 'salesDelivery',
    type: 'table',
    title: '销售订单发货信息',
    dataset: SALES_DELIVERY,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('销售单号', 'salesNo'), OP('发货单号', 'deliveryNo'), OP('物料料号', 'material'), OP('物料名称', 'materialName'), DATE('计划发货时间')],
    cols: [COL('销售单号', 'salesNo'), COL('发货单号', 'deliveryNo'), COL('单据状态', 'status', { tag: true }), COL('开单时间', 'createTime'), COL('计划发货时间', 'planTime'), COL('物料料号', 'material'), COL('物料名称', 'materialName'), COL('计划发货数量', 'planQty'), COL('待发货数量', 'waitQty'), COL('已发货数量', 'doneQty')],
    buttons: ['导出'],
    actions: [],
    total: 18,
  },
  moOnlineLog: {
    id: 'moOnlineLog',
    type: 'table',
    title: '制令单上线日志',
    dataset: MO_ONLINE_LOG,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('制令单号', 'no'), OP('产品料号', 'product'), OP('产品名称', 'productName'), OP('线体编号', 'lineCode'), OP('线体名称', 'line'), DATE('上线时间')],
    cols: [COL('制令单号', 'no'), COL('产品料号', 'product'), COL('产品名称', 'productName'), COL('线体编号', 'lineCode'), COL('线体名称', 'line'), COL('上线时间', 'onTime'), COL('上线人员编号', 'onUser'), COL('上线人员名称', 'onName'), COL('下线时间', 'offTime'), COL('下线人员编号', 'offUser'), COL('下线人员名称', 'offName')],
    buttons: ['导出'],
    actions: [],
    total: 4,
  },
  workshop: {
    id: 'workshop',
    type: 'table',
    title: '车间建模',
    dataset: [{ org: PROD_ORG, code: 'ZGCJ', name: '中山制罐车间', line: '制罐D线（10500404）', process: '制罐', rail: 'D', worker: '制罐工', valid: '有效', creator: '李元龙' }],
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('车间', 'name'), OP('线体', 'line'), OP('工作中心', 'code', ['请选择'])],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('车间', 'name'), COL('线体', 'line'), COL('子区域编码', 'code'), COL('工序名称', 'process'), COL('轨道', 'rail'), COL('所属工种', 'worker'), COL('有效标志', 'valid', { tag: true }), COL('创建人', 'creator')],
    buttons: ['新增车间', '新增子区域', '-批量删除'],
    actions: ['修改', '删除'],
    total: 1,
  },
  skill: {
    id: 'skill',
    type: 'table',
    title: '员工技能管理',
    dataset: SKILLS,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('员工姓名', 'user'), OP('生产阶别', 'process', ['请选择', '电阻焊机', '裁剪', '封口机', '收罐台', '打包机'])],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('员工', 'user', { sort: true }), COL('工序名称', 'process', { sort: true }), COL('掌握情况', 'level', { tag: true }), COL('备注', 'remark')],
    buttons: ['+新增', '-批量删除'],
    actions: ['查看', '修改', '删除'],
    total: 148,
  },
  permission: {
    id: 'permission',
    type: 'table',
    title: '员工作业权限',
    dataset: PERMISSIONS,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('员工姓名', 'name')],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('员工编码', 'code', { sort: true }), COL('员工姓名', 'name', { sort: true }), COL('所属部门', 'dept')],
    buttons: ['权限配置', '-批量删除'],
    actions: ['查看', '修改权限', '删除'],
    total: 148,
    subtabs: ['权限范围'],
    subCols: [COL('工作中心编码', 'code'), COL('工作中心名称', 'name'), COL('所属工序', 'process'), COL('线体', 'line')],
    subRows: [],
  },
  team: {
    id: 'team',
    type: 'table',
    title: '生产班组维护',
    dataset: TEAMS,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('班组编号', 'code'), OP('班组名称', 'name')],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('班组编号', 'code', { sort: true }), COL('班组名称', 'name'), COL('备注', 'remark')],
    buttons: ['+新增', '-批量删除'],
    actions: ['查看', '修改', '删除'],
    total: 8,
  },
  canParam: {
    id: 'canParam',
    type: 'table',
    title: '制罐参数信息',
    dataset: CAN_PARAMS,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('物料料号', 'code'), OP('物料名称', 'name'), OP('物料规格', 'spec')],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('物料料号', 'code', { sort: true }), COL('物料名称', 'name'), COL('物料规格', 'spec'), COL('厚', 'thick'), COL('宽', 'width'), COL('长', 'length'), COL('每张铁制罐枚数', 'perSheet')],
    buttons: ['导入', '导出', '删除'],
    actions: ['修改', '查看', '删除'],
    total: 34,
  },
  andon: {
    id: 'andon',
    type: 'table',
    title: '人员安灯设置',
    dataset: ANDONS,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('角色名称', 'role'), OP('人员编号', 'userCode'), OP('人员名称', 'userName'), OP('安灯IP', 'ip')],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('安灯IP', 'ip', { sort: true }), COL('安灯端口', 'port'), COL('设备名称', 'device'), COL('备注', 'remark')],
    buttons: ['+新增', '-批量删除'],
    actions: ['修改', '删除'],
    total: 18,
    subtabs: ['人员信息', '角色信息'],
    subCols: [COL('人员编号', 'code'), COL('人员名称', 'name')],
    subRows: [],
  },
  shift: {
    id: 'shift',
    type: 'table',
    title: '班组早晚班维护',
    dataset: SHIFTS,
    search: [SEL('组织机构', 'org', [PROD_ORG]), DATE('工作日期'), OP('班组', 'team'), OP('班次', 'shift')],
    cols: [COL('', '_cb', { cb: true }), COL('工作日期', 'date', { sort: true }), COL('班组', 'team'), COL('班次', 'shift', { tag: true }), COL('班组长', 'leader'), COL('创建人', 'creator'), COL('创建时间', 'time')],
    buttons: ['导入', '添加', '删除'],
    actions: ['删除'],
    total: 8,
  },
  ecn: {
    id: 'ecn',
    type: 'table',
    title: 'ECN信息',
    dataset: [],
    search: [SEL('组织机构', 'org', [PROD_ORG]), DATE('创建时间'), OP('ECN编号', 'no'), OP('ECN状态', 'status', ['请选择']), OP('ECR编号', 'ecr'), OP('产品料号', 'product'), OP('产品版本', 'ver')],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('ECN编号', 'no'), COL('ECR编号', 'ecr'), COL('变更类型', 'type'), COL('ECN状态', 'status', { tag: true }), COL('产品料号', 'product'), COL('产品版本', 'ver')],
    buttons: ['+新增', '-批量删除', '导出'],
    actions: ['查看', '修改', '删除'],
    total: 0,
  },
  invalidTimeMgr: {
    id: 'invalidTimeMgr',
    type: 'table',
    title: '无效时间管理',
    dataset: INVALID_TIME_MGR,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('线体', 'line'), OP('无效类型', 'type', ['请选择', '计划停机', '设备故障', '品质等待']), DATE('开始时间')],
    cols: [COL('', '_cb', { cb: true }), COL('线体', 'line'), COL('无效类型', 'type', { tag: true }), COL('原因', 'reason'), COL('开始时间', 'start'), COL('结束时间', 'end'), COL('时长(min)', 'minutes')],
    buttons: ['+新增', '-批量删除'],
    actions: ['查看', '修改', '删除'],
    total: 4,
  },
  rework: {
    id: 'rework',
    type: 'table',
    title: '返修管理',
    dataset: REWORK_ROWS,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('返修单号', 'reworkNo'), OP('制令单号', 'mo'), OP('产品料号', 'product'), OP('状态', 'status', ['请选择', '开立', '操作中', '下达完成']), DATE('创建时间')],
    cols: [COL('', '_cb', { cb: true }), COL('组织机构', 'org'), COL('返修单号', 'reworkNo', { sort: true }), COL('制令单号', 'mo'), COL('产品料号', 'product'), COL('产品名称', 'productName'), COL('线体', 'line'), COL('返修工序', 'process'), COL('不良原因', 'reason'), COL('返修数量', 'qty'), COL('状态', 'status', { tag: true }), COL('创建时间', 'createTime')],
    buttons: ['+新增', '-批量删除', '导出'],
    actions: ['查看', '修改', '删除'],
    total: 3,
  },
  onDuty: {
    id: 'onDuty',
    type: 'table',
    title: '在岗统计',
    dataset: [],
    search: [
      SEL('组织机构', 'org', [PROD_ORG]),
      DATE('上岗时间'),
      DATE('离岗时间'),
      OP('线别', 'line', ['请选择', '制罐A线', '制罐B线', '制罐D线', '制罐E线']),
      OP('人员姓名', 'user', ['请选择']),
      OP('制令单号', 'no'),
      F('统计维度', 'dim', { type: 'radio', opts: ['员工', '线别', '制令单', '工作中心'] }),
    ],
    cols: [COL('组织机构', 'org'), COL('员工姓名', 'user'), COL('制令单号', 'no'), COL('线别', 'line'), COL('工作时长（H）', 'hours'), COL('工作中心', 'center')],
    buttons: ['导出'],
    actions: [],
    total: 0,
  },
  firstKit: {
    id: 'firstKit',
    type: 'table',
    title: '首套备料配置',
    dataset: FIRST_KIT,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('配置类型', 'type', ['请选择', '物料料号', '物料分组']), OP('物料分组', 'group', ['请选择']), OP('物料料号', 'code'), OP('物料名称', 'name')],
    cols: [COL('', '_cb', { cb: true }), COL('配置类型', 'type'), COL('物料分组', 'group'), COL('物料料号', 'code', { sort: true }), COL('物料名称', 'name'), COL('备注', 'remark')],
    buttons: ['新增', '删除'],
    actions: ['修改', '查看', '删除'],
    total: 34,
  },
  lowStock: {
    id: 'lowStock',
    type: 'table',
    title: '工站物料低位配置',
    dataset: LOW_STOCK,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('配置类型', 'type', ['请选择']), OP('物料分组', 'group', ['请选择']), OP('物料料号', 'code'), OP('物料名称', 'name'), OP('工站编码', 'stationCode'), OP('工站名称', 'stationName')],
    cols: [COL('', '_cb', { cb: true }), COL('配置类型', 'type'), COL('物料分组', 'group'), COL('物料料号', 'code', { sort: true }), COL('物料名称', 'name'), COL('备注', 'remark')],
    buttons: ['添加', '删除'],
    actions: ['修改', '查看', '删除'],
    total: 42,
  },
  collectSet: {
    id: 'collectSet',
    type: 'table',
    title: '数据采集过站设置',
    dataset: COLLECT_SET,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('工作中心编号', 'code'), OP('工作中心名称', 'name'), OP('采集项目名称', 'item'), OP('采集标识', 'flag', ['请选择'])],
    cols: [COL('', '_cb', { cb: true }), COL('组织名称', 'org'), COL('工作中心编号', 'code', { sort: true }), COL('工作中心名称', 'name'), COL('采集项目名称', 'item'), COL('最大采集', 'max'), COL('最后采集数值', 'last'), COL('最后采集时间', 'time')],
    buttons: ['+新增', '-批量删除'],
    actions: ['查看', '修改', '删除'],
    total: 32,
  },
  handover: {
    id: 'handover',
    type: 'table',
    title: '交接班记录查询',
    dataset: [],
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('制令单号', 'no'), OP('生产线体', 'line', ['请选择']), OP('生产工序', 'process', ['请选择']), OP('生产班组', 'team', ['请选择']), OP('生产班次', 'shift', ['请选择']), DATE('单据日期')],
    cols: [COL('组织机构', 'org'), COL('确认单号', 'no'), COL('确认类型', 'type'), COL('单据日期', 'date'), COL('发起人员', 'user'), COL('制令单号', 'mo'), COL('生产线体', 'line')],
    buttons: ['导出'],
    actions: [],
    total: 0,
  },
  colorRestore: {
    id: 'colorRestore',
    type: 'table',
    title: '彩印还原记录',
    dataset: COLOR_RESTORE,
    search: [SEL('组织机构', 'org', [PROD_ORG]), OP('彩印铁条码', 'barcode'), OP('物料料号', 'material'), OP('工单', 'workOrder'), OP('彩印工单', 'colorOrder'), OP('制令单', 'mo')],
    cols: [COL('组织机构', 'org'), COL('彩印铁条码', 'barcode'), COL('彩印工厂', 'factory'), COL('彩印工单', 'colorOrder'), COL('制令单', 'mo'), COL('工单', 'workOrder'), COL('物料料号', 'material')],
    buttons: ['导出'],
    actions: [],
    total: 24,
  },
};

const ANALYSIS_PAGES: Record<string, ProdTablePageConfig> = {};
ANALYSIS_DEFS.forEach((d) => {
  const ds = analysisRows(d.id, d.cols, 8, d.seed);
  ANALYSIS_PAGES[d.id] = {
    id: d.id,
    type: 'analysis',
    title: d.name,
    dataset: ds,
    search: AS(d.search),
    cols: d.cols,
    pageSize: 10,
    total: ds.length,
    buttons: ['导出'],
    actions: [],
    stats: d.stats || [],
    charts: d.charts || [],
  };
});

export const PROD_PAGES: Record<string, ProdPageConfig> = {
  ...TABLE_PAGES,
  ...ANALYSIS_PAGES,
  ...WORKBENCHES,
  invalidTime: { id: 'invalidTime', type: 'custom', title: '无效时间', custom: 'invalidTime' },
  grape: { id: 'grape', type: 'custom', title: '葡萄图考核', custom: 'grape' },
};

export function buildInitialProdDatasets(): Record<string, ProdRow[]> {
  const map: Record<string, ProdRow[]> = {};
  Object.entries(PROD_PAGES).forEach(([key, cfg]) => {
    if (cfg.type === 'table' || cfg.type === 'analysis') {
      map[key] = cfg.dataset.map((row) => ({ ...row }));
    }
  });
  return map;
}
