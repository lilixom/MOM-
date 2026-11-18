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

export interface PlanOrderBomItem {
  id: string;
  seq: number;
  stage: string;            // 用料阶段 e.g. 拉伸 / 彩印
  materialNo: string;       // 物料料号
  materialName: string;     // 物料名称
  spec: string;             // 物料规格
  dosage?: number;          // 单耗
  unit?: string;            // 单位
}

export interface PlanOrder {
  key: string;
  unit: string;             // 单位名称
  planNo: string;           // 计划单号
  customer: string;         // 客户
  materialNo: string;       // 产品料号
  version: string;          // 产品版本
  productName: string;      // 产品名称
  spec?: string;            // 产品规格
  planFactory: string;      // 计划工厂
  prodFactory: string;      // 生产工厂
  planType: string;         // 计划单类型 (LA/KD/VP)
  purchaseType: string;     // 采购类型 (E)
  specialProc?: string;     // 特殊获取
  totalOrderQty?: number;   // 总订单数量
  orderStartDate?: string;  // 订单开始日期
  orderEndDate?: string;    // 订单结束日期
  orderInitDate?: string;   // 订单初日期
  expandDate?: string;      // 展开日期
  mrpController?: string;   // MRP控制员
  planQty: number;          // 计划数量
  orderedQty: number;       // 已下单数量
  unitMeasure?: string;     // 单位
  deliveryDate?: string;    // 计划交货日期
  convertFlag?: string;     // 转换标识
  acctCategory?: string;    // 科目分配类别
  soNo?: string;            // 销售订单号
  soItemNo?: string;        // 销售订单行项目号
  reserveNo?: string;       // 预留号
  storageLoc?: string;      // 库存地点
  specialStock?: string;    // 特殊库存
  prodVersion?: string;     // 生产版本
  capReqFlag?: string;      // 产能需求标识
  mrpArea?: string;         // MRP范围
  lastModTime?: string;     // 最后修改时间戳
  createTime?: string;      // 创建时间
  productId?: string;       // 产品ID
  materialId?: string;      // 物料ID
  deleted?: boolean;        // 删除标识
}

export interface WorkOrderManageBomItem {
  id: string;
  seq: number;
  stage: string;            // 用料阶段
  materialNo: string;       // 物料料号
  materialName: string;     // 物料名称
  spec: string;             // 物料规格
}

export interface WorkOrderManageItem {
  key: string;
  org: string;              // 组织机构
  workshop: string;         // 车间
  line: string;             // 线体
  planNo: string;           // 计划单号
  woNo: string;             // 工单号
  woType: string;           // 工单类型
  downStatus: '下达完成' | '部分下达' | '未下达';
  prodStatus: '生产中' | '待生产' | '未开始' | '已完工';
  materialNo: string;       // 产品料号
  productName?: string;     // 产品名称
  productSpec?: string;     // 产品规格
  productVersion: string;   // 产品版本
  pickedSets: number;       // 已领料套数
  planQty: number;          // 计划数量
  inputQty: number;         // 投入数量
  outputQty: number;        // 产出数量
  craftName: string;        // 工艺名称
  craftVersion?: string;    // 工艺版本
  completionRate: string;   // 计划完成率
  planStartTime: string;    // 预计开工时间
  planEndTime: string;      // 预计完工时间
  actualStartTime: string;  // 实际开工时间
  actualEndTime: string;    // 实际完工时间
  customerShort: string;    // 客户简称
  soNo: string;             // 销售单号
  sapVersion?: string;      // SAP版本号
  sapOrderNo?: string;      // SAP生产订单号
  prodStage?: string;       // 生产阶段
  deliveryDate?: string;    // 计划交货日期
  cancelSchedule?: boolean; // 取消排产标识
  remark?: string;          // 备注
  createBy: string;         // 创建人
  createTime: string;       // 创建时间
  modBy: string;            // 修改人
  modTime: string;          // 修改时间
  priority: number;         // 优先级
}

export interface MfgOrderBomItem {
  seq: number;
  level: number;
  stage: string;
  materialNo: string;
  productName: string;
  spec: string;
  unit: string;
  dosage: string;
}

export interface MfgOrderCtrlItem {
  seq: number;
  materialType: string;
  materialNo: string;
  materialName: string;
  process: string;
  qty: string;
  source: string;
}

export interface MfgOrderPaceItem {
  moNo: string;
  materialNo: string;
  version: string;
  paceSeconds: string;
  side: string;
}

export interface MfgOrderItem {
  key: string;
  org: string;              // 组织机构
  line: string;             // 线别
  moNo: string;             // 制令单号
  status: '关结' | '生产中' | '未下达';
  materialNo: string;       // 产品料号
  productName: string;      // 产品名称
  productVersion: string;   // 产品版本
  productSpec?: string;     // 产品规格
  planQty: number;          // 计划数量
  inputQty: number;         // 投入数量
  outputQty: number;        // 产出数量
  scrapQty: number;         // 报废数量
  planStartTime: string;    // 预计开工时间
  planEndTime: string;      // 预计完工时间
  woNo: string;             // 工单号
  customer: string;         // 客户
  soNo: string;             // 销售单号
  releaseBy: string;        // 下达人
  releaseTime: string;      // 下达时间
  modBy: string;            // 修改人
  modTime: string;          // 修改时间
  morningHours: number;     // 早班工时
  eveningHours: number;     // 晚班工时
  prodHours: number;        // 生产工时
  qaStatus: '已审核' | '未审核';
  qaBy: string;             // 品质审核人
  qaTime: string;           // 品质审核时间
  prodAuditStatus: '已审核' | '未审核';
  prodAuditBy: string;      // 生产审核人
  prodAuditTime: string;    // 生产审核时间
  totalHours: number;       // 总工时
  actualProdHours: number;  // 实际生产工时
  prodStage?: string;       // 生产阶段
  ctrlType?: string;        // 管控类型
  craftName?: string;       // 工艺
  startOp?: string;         // 开始工序
  endOp?: string;           // 结束工序
  maxRepairCount?: string;  // 最大维修次数
  remark?: string;          // 备注
}


