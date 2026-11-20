import React, { useState, useMemo, useRef } from 'react';
import {
  ClipboardList,
  Search,
  RotateCcw,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  ArrowUpDown,
  AlertTriangle,
  Pin,
  Download,
  Copy,
  CheckCircle2,
  Send,
  Edit3,
  Eye,
  ArrowLeft,
  Upload,
} from 'lucide-react';

interface ProcessSheetTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

const MAIN_ALL_FIELDS = [
  '顾客名称', '产品名称', '产品编码', '罐型', '镀锡量（内/外）g/m2', '涂印薄钢板规格', '客户', '工艺类型',
  '状态', '版本', '工艺单编码', '落料宽度(mm)', '落料高度(mm)', '裁剪枚数', '直角度(mm)', '毛边(mm)',
  '搭接量(mm)', '长短脚+拖尾(mm)', '焊缝厚度（不含边缝涂料）', '焊缝厚度（含边缝涂料）', 'SPS烘干备注',
  '封盖', '封盖后罐高(mm)', '卷边宽度(mm)', '翻边宽度(mm)', '封盖T值(mm)', '身钩(mm)', '盖钩(mm)',
  '叠接长度(mm)', '叠接率', '紧密度', '滚筋深度(mm)', '滚筋宽度(mm)', '缩颈翻边封盖备注',
  '涂料供应商', '涂料代号', '溶剂代号', '上机粘度', '干膜重(mg/罐)', '烘干条件', '配套彩印内涂', '全喷备注',
  '包装', '包装层数', '每层罐数', '垛数', '打包带材质', '打包带数量', '打包方式', '隔层板', '隔层板放置要求',
  '外包装', '栈板', '包装备注', '制表人', '制表时间', '审核人', '审核时间', '审批人', '审批时间',
  '变更说明', '创建时间', '制罐罐型', '工艺单类型',
] as const;

const MAIN_DEFAULT_VISIBLE = [
  '顾客名称', '产品名称', '产品编码', '罐型', '镀锡量（内/外）g/m2', '涂印薄钢板规格', '客户', '工艺类型',
];

const SUB_ALL_FIELDS = [
  'BOM编号', '父项物料名称', '工厂', '类型', '版本', '基本数量', '行项目数', '状态', 'SAP同步状态',
  '备注', '产品名称', '生效日期', '有效期', 'BOM用途', '项目类别', 'BOM文本',
] as const;

const SUB_DEFAULT_VISIBLE = [
  'BOM编号', '父项物料名称', '工厂', '类型', '版本', '基本数量', '行项目数', '状态', 'SAP同步状态',
];

type MainRowRecord = { id: string } & Record<string, string>;
type SubRowRecord = { id: string } & Record<string, string>;

const INITIAL_MAIN_ROWS: MainRowRecord[] = [
  { id: 'ps-01', 顾客名称: '福州昇兴洋诺罐有限公司', 产品名称: '印铁-259#350口养八宝粥...', 产品编码: '10006760', 罐型: '', '镀锡量（内/外）g/m2': '', 涂印薄钢板规格: '', 客户: '', 工艺类型: '', 状态: '草稿', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0001' },
  { id: 'ps-02', 顾客名称: '广东达利盛包装有限公司', 产品名称: '金罐空罐-206#250', 产品编码: '10006605', 罐型: '209/211×209-413（209#60g）', '镀锡量（内/外）g/m2': '1:1:1:1', 涂印薄钢板规格: '0.20-869/1035 MR T-4 CA...', 客户: '', 工艺类型: '制罐', 状态: '已审核', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0002' },
  { id: 'ps-03', 顾客名称: '广东达利盛包装有限公司', 产品名称: '可口营养八宝粥（330罐型）...', 产品编码: '10032785_COPY', 罐型: '209/211×209-413（209#60g）', '镀锡量（内/外）g/m2': '1:1:1:1', 涂印薄钢板规格: '0.20-883/1035 MR T-4 CA R1...', 客户: '', 工艺类型: '制罐', 状态: '已审批', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0003' },
  { id: 'ps-04', 顾客名称: '承德顺天盒纺', 产品名称: '杏仁效果古仁堂空罐', 产品编码: '10031184', 罐型: '206#480ML', '镀锡量（内/外）g/m2': '206/211×209-610加强筋', 涂印薄钢板规格: '2.8(内)/1:1', 客户: '', 工艺类型: '', 状态: '草稿', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0004' },
  { id: 'ps-05', 顾客名称: '承德顺天盒纺', 产品名称: '杏仁效果古仁堂空罐', 产品编码: '10031184', 罐型: '206#480ML 206/211×209-610', '镀锡量（内/外）g/m2': '2.8(内)/1:1', 涂印薄钢板规格: '0.21-876/1035 MR T-4 CA R1...', 客户: '', 工艺类型: '', 状态: '草稿', 版本: 'V1.1', 工艺单编码: 'GYD-2026-0005' },
  { id: 'ps-06', 顾客名称: '承德顺天盒纺', 产品名称: '高端白罐-206#S330', 产品编码: '10003129', 罐型: '206#480ML', '镀锡量（内/外）g/m2': '', 涂印薄钢板规格: '2.8(内)/1:1', 客户: '', 工艺类型: '', 状态: '草稿', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0006' },
  { id: 'ps-07', 顾客名称: '承德顺天盒纺', 产品名称: '杏仁双果古仁堂空罐_COPY', 产品编码: '10031184_COPY', 罐型: '206#480ML', '镀锡量（内/外）g/m2': '206/211×209-610加强筋', 涂印薄钢板规格: '2.8(内)/1:1', 客户: '', 工艺类型: '', 状态: '草稿', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0007' },
  { id: 'ps-08', 顾客名称: '承德顺天盒纺', 产品名称: '杏仁效果古仁堂空罐_COPY', 产品编码: '10031184', 罐型: '206#480ML 206/211×209-610', '镀锡量（内/外）g/m2': '2.8(内)/1:1', 涂印薄钢板规格: '0.21-876/1035 MR T-4 CA R1...', 客户: '', 工艺类型: '', 状态: '草稿', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0008' },
  { id: 'ps-09', 顾客名称: '承德顺天盒纺', 产品名称: '泰奇八宝粥大罐颈缩版...', 产品编码: '10024251', 罐型: '206#480ML', '镀锡量（内/外）g/m2': '', 涂印薄钢板规格: '2.8(内)/1:1 | 0.21-876/1035 MR T-4 CA R1...', 客户: '泰奇', 工艺类型: '测试', 状态: '已审核', 版本: 'V2.0', 工艺单编码: 'GYD-2026-0009' },
  { id: 'ps-10', 顾客名称: '承德顺天盒纺', 产品名称: '杏仁双果古仁堂空罐_COPY', 产品编码: '10031185', 罐型: '206#480ML 206/211×209-610', '镀锡量（内/外）g/m2': '2.8(内)/1:1', 涂印薄钢板规格: '0.21-876/1035 MR T-4 CA R1...', 客户: '', 工艺类型: '测试', 状态: '草稿', 版本: 'V1.0', 工艺单编码: 'GYD-2026-0010' },
];

const INITIAL_SUB_ROWS: SubRowRecord[] = [
  { id: 'bom-01', BOM编号: 'BOM-2026-0016', 父项物料名称: '泰奇八宝粥大罐颈缩版...', 工厂: '1050', 类型: '永久', 版本: 'V2', 基本数量: '25000', 行项目数: '8', 状态: '', SAP同步状态: 'SAP已同步' },
  { id: 'bom-02', BOM编号: 'BOM-2026-0015', 父项物料名称: '金罐空罐-206#250', 工厂: '1050', 类型: '永久', 版本: '1', 基本数量: '1000', 行项目数: '6', 状态: '', SAP同步状态: '' },
  { id: 'bom-03', BOM编号: 'BOM-2026-0014', 父项物料名称: '印铁-259#350口养八宝粥...', 工厂: '1050', 类型: '永久', 版本: 'V1.0', 基本数量: '1000', 行项目数: '5', 状态: '', SAP同步状态: '' },
  { id: 'bom-04', BOM编号: 'BOM-2026-0011', 父项物料名称: '', 工厂: '', 类型: '', 版本: 'V1.0', 基本数量: '', 行项目数: '', 状态: '未审核', SAP同步状态: '待确认' },
  { id: 'bom-05', BOM编号: 'BOM-2026-0009', 父项物料名称: '可口营养八宝粥（330罐型）...', 工厂: '1050', 类型: '测试', 版本: 'V1.0', 基本数量: '10000', 行项目数: '7', 状态: '', SAP同步状态: '待确认' },
  { id: 'bom-06', BOM编号: 'BOM-2026-0008', 父项物料名称: '杏仁效果古仁堂空罐', 工厂: '1050', 类型: '测试', 版本: 'V1.0', 基本数量: '1100', 行项目数: '6', 状态: '', SAP同步状态: '待确认' },
  { id: 'bom-07', BOM编号: 'BOM-2026-0007', 父项物料名称: '杏仁效果古仁堂空罐_COPY', 工厂: 'abup', 类型: '测试', 版本: 'V1.0', 基本数量: '13333', 行项目数: '6', 状态: '', SAP同步状态: '待确认' },
  { id: 'bom-08', BOM编号: 'BOM-2026-0006', 父项物料名称: '杏仁效果古仁堂空罐_COPY', 工厂: 'G01', 类型: '测试', 版本: 'V1.0', 基本数量: '11111', 行项目数: '6', 状态: '已确认', SAP同步状态: '' },
  { id: 'bom-09', BOM编号: 'BOM-2026-0005', 父项物料名称: '杏仁效果古仁堂空罐_COPY', 工厂: 'G01', 类型: '永久', 版本: 'V1.0', 基本数量: '', 行项目数: '', 状态: '', SAP同步状态: '待确认' },
  { id: 'bom-10', BOM编号: 'BOM-2026-0004', 父项物料名称: '杏仁效果古仁堂空罐_COPY', 工厂: 'G01', 类型: '测试', 版本: 'V1.0', 基本数量: '10000', 行项目数: '5', 状态: '', SAP同步状态: '待确认' },
];

interface EdgeCoatingRow {
  id: string;
  category: string;
  supplier: string;
  paintCode: string;
  solventCode: string;
  viscosity: string;
  sprayThickness: string;
}

interface FullSprayRow {
  id: string;
  supplier: string;
  paintCode: string;
  solventCode: string;
  viscosity: string;
  dryFilmWeight: string;
  bakingCond: string;
  innerCoating: string;
  remark: string;
}

const INITIAL_EDGE_ROWS: EdgeCoatingRow[] = [
  { id: 'ed-1', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '', viscosity: '333333', sprayThickness: '7-9' },
  { id: 'ed-2', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '', viscosity: '444444', sprayThickness: '7-9' },
  { id: 'ed-3', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '117777', viscosity: '11111', sprayThickness: '7-9' },
  { id: 'ed-4', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '117777', viscosity: '11111', sprayThickness: '7-9' },
  { id: 'ed-5', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '', viscosity: '333333', sprayThickness: '7-9' },
  { id: 'ed-6', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '', viscosity: '333333', sprayThickness: '7-9' },
  { id: 'ed-7', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '', viscosity: '44444', sprayThickness: '7-9' },
  { id: 'ed-8', category: '内补涂', supplier: '如明', paintCode: 'DS-672016', solventCode: '117777', viscosity: '11111', sprayThickness: '7-9' },
];

const INITIAL_SPRAY_ROWS: FullSprayRow[] = [
  { id: 'sp-1', supplier: '涂料供应商', paintCode: '涂料代号', solventCode: '溶剂代号', viscosity: '上机粘度(s)', dryFilmWeight: '222', bakingCond: '333', innerCoating: '1111', remark: '666666' },
  { id: 'sp-2', supplier: '阿克苏', paintCode: 'F290-680511B', solventCode: 'PQS0-4914', viscosity: '16-20', dryFilmWeight: '65±10', bakingCond: '195±5℃/3-5min', innerCoating: '阿克苏', remark: '' },
  { id: 'sp-3', supplier: '阿克苏', paintCode: 'F190-680313B', solventCode: 'PQS0-49453', viscosity: '17-22', dryFilmWeight: '114±15', bakingCond: '185-195℃/3-3min', innerCoating: '阿克苏', remark: '' },
  { id: 'sp-4', supplier: 'PPG', paintCode: 'P-XCZ40207', solventCode: 'PPG60687', viscosity: '19-22', dryFilmWeight: '114±15', bakingCond: '185-195℃/3-5min', innerCoating: 'PPG', remark: '' },
  { id: 'sp-5', supplier: '涂料供应商', paintCode: '涂料代号', solventCode: '溶剂代号', viscosity: '上机粘度(s)', dryFilmWeight: '222', bakingCond: '333', innerCoating: '1111', remark: '666666' },
  { id: 'sp-6', supplier: '阿克苏', paintCode: 'F290-680511B', solventCode: 'PQS0-49174', viscosity: '16-20', dryFilmWeight: '65±10', bakingCond: '195±2℃/3-5min', innerCoating: '阿克苏', remark: '' },
];

const DEFAULT_SHEET_FORM = {
  customer: '',
  sheetTemplate: '工艺单模板测试',
  baseTemplate: '基础信息测试模板',
  canType: '113/202/206-107',
  productCode: '',
  productName: '',
  tinCoating: '2.8/内/1.1',
  clientName: '泰奇',
  plateSpec: '0.21-876/1035 MR T-4 CA R1 31什比',
  craftType: '制罐',
  sheetCode: '自动生成',
  version: 'V1.0',
  layoutUploaded: false,
  // 1、制程
  cutSpecTemplate: '206#标准裁板参数',
  cutWidth: '206.39±0.02',
  cutHeight: '174.36±0.02',
  cutCount: '5列*3行（25KG）',
  squareness: '≤0.10',
  burr: '≤0.03',
  overlap: '0.46±0.10',
  // 2、电阻焊
  weldTemplate: '电阻焊标准参数-206#',
  legTail: '≤0.20',
  weldNoPaint: '±1.5<铁厚',
  weldWithPaint: '≤1.5+铁厚+0.03',
  // 2、SPS
  spsTemplate: 'SPS烘干',
  spsRemark: '烘干温度由低到高再调低，罐内里的焊缝两侧要有较深熔接痕迹，焊缝要贴近内补涂宽度。',
  // 3、缩颈、翻边、封盖
  neckTemplate: '200#铁底盖',
  seaming: '200#铁底盖',
  canHeightAfter: '133.9±0.20',
  seamWidth: '2.80±0.15',
  flangeWidth: '2.30±0.15',
  seamTVal: '≤3e+20±0.20',
  bodyHook: '1.95±0.15',
  coverHook: '1.85±0.15',
  overlapLen: '≥1.03',
  overlapRate: '≥53',
  tightness: '≥60',
  beadDepth: '无',
  beadWidth: '无',
  neckRemark: '',
  // 5、包装
  packTemplate: '200#249包装',
  packLayers: '16',
  cansPerLayer: '575',
  stackCount: '1',
  strapMaterial: 'PP',
  strapCount: '5',
  packMethod: '机打',
  divider: '灰纸板',
  dividerReq: '上下三层改强纸，其余1张',
  outerPack: '白粘膜',
  pallet: '木栈板',
  packRemark: '',
  // 全喷备注 & 变更说明
  sprayRemark: '',
  changeNote: '',
  creator: '李涛',
  createTime: '2026-11-19 17:28:36',
  sheetType: '1',
  tailVersion: '',
};

export const ProcessSheetTab: React.FC<ProcessSheetTabProps> = ({ onShowToast }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formReadOnly, setFormReadOnly] = useState(false);
  const [formHeading, setFormHeading] = useState('生成工艺单');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);

  const [mainRows, setMainRows] = useState<MainRowRecord[]>(INITIAL_MAIN_ROWS);
  const [subRows] = useState<SubRowRecord[]>(INITIAL_SUB_ROWS);

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('昇兴集团');
  const [filters, setFilters] = useState({
    customerOp: 'contains' as MatchOp,
    customer: '',
    productNameOp: 'contains' as MatchOp,
    productName: '',
    productCodeOp: 'contains' as MatchOp,
    productCode: '',
    clientOp: 'contains' as MatchOp,
    client: '',
    statusOp: 'contains' as MatchOp,
    status: '',
    versionOp: 'contains' as MatchOp,
    version: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Main & Sub table selection, sorting, pagination
  const [selMainIds, setSelMainIds] = useState<string[]>([]);
  const [selSubIds, setSelSubIds] = useState<string[]>([]);
  const [mainSort, setMainSort] = useState<{ key: string | null; dir: SortDir }>({ key: null, dir: null });
  const [mainPage, setMainPage] = useState(1);
  const [mainPageSize, setMainPageSize] = useState(10);
  const [subPage, setSubPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState(10);
  const [subJump, setSubJump] = useState('1');

  // Column visibility panels (F3 Main / F4 Sub)
  const [mainVisibleCols, setMainVisibleCols] = useState<string[]>(MAIN_DEFAULT_VISIBLE);
  const [subVisibleCols, setSubVisibleCols] = useState<string[]>(SUB_DEFAULT_VISIBLE);
  const [openColPanel, setOpenColPanel] = useState<'main' | 'sub' | null>(null);

  // Form states (P2)
  const [form, setForm] = useState(DEFAULT_SHEET_FORM);
  const [formErrors, setFormErrors] = useState<{ productCode?: boolean; craftType?: boolean }>({});
  const [edgeRows, setEdgeRows] = useState<EdgeCoatingRow[]>(INITIAL_EDGE_ROWS);
  const [selEdgeIds, setSelEdgeIds] = useState<string[]>([]);
  const [sprayRows, setSprayRows] = useState<FullSprayRow[]>(INITIAL_SPRAY_ROWS);
  const [selSprayIds, setSelSprayIds] = useState<string[]>([]);
  const layoutInputRef = useRef<HTMLInputElement | null>(null);
  const [layoutPreviewUrl, setLayoutPreviewUrl] = useState<string>('');

  // BOM detail view modal
  const [viewBom, setViewBom] = useState<SubRowRecord | null>(null);

  // Confirm Dialog
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    danger?: boolean;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    desc: '',
    onConfirm: null,
  });

  // Filtered & sorted main rows
  const filteredMain = useMemo(() => {
    const match = (val: string, q: string, op: MatchOp) => {
      if (!q.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = q.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    return mainRows.filter((r) => {
      if (!match(r['顾客名称'], appliedFilters.customer, appliedFilters.customerOp)) return false;
      if (!match(r['产品名称'], appliedFilters.productName, appliedFilters.productNameOp)) return false;
      if (!match(r['产品编码'], appliedFilters.productCode, appliedFilters.productCodeOp)) return false;
      if (!match(r['客户'], appliedFilters.client, appliedFilters.clientOp)) return false;
      if (!match(r['状态'], appliedFilters.status, appliedFilters.statusOp)) return false;
      if (!match(r['版本'], appliedFilters.version, appliedFilters.versionOp)) return false;
      return true;
    });
  }, [mainRows, appliedFilters]);

  const sortedMain = useMemo(() => {
    if (!mainSort.key || !mainSort.dir) return filteredMain;
    const k = mainSort.key;
    const dir = mainSort.dir === 'asc' ? 1 : -1;
    return [...filteredMain].sort((a, b) =>
      String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'zh-CN') * dir
    );
  }, [filteredMain, mainSort]);

  const mainTotalPages = Math.max(1, Math.ceil(sortedMain.length / mainPageSize));
  const safeMainPage = Math.min(mainPage, mainTotalPages);
  const pagedMain = sortedMain.slice((safeMainPage - 1) * mainPageSize, safeMainPage * mainPageSize);

  const subTotalPages = Math.max(1, Math.ceil(subRows.length / subPageSize));
  const safeSubPage = Math.min(subPage, subTotalPages);
  const pagedSub = subRows.slice((safeSubPage - 1) * subPageSize, safeSubPage * subPageSize);

  const handleQuery = () => {
    setAppliedFilters(filters);
    setMainPage(1);
    onShowToast(`查询完成，共 ${filteredMain.length} 条工艺单 / ${subRows.length} 条 BOM`, 'info');
  };

  const handleReset = () => {
    const empty = {
      customerOp: 'contains' as MatchOp,
      customer: '',
      productNameOp: 'contains' as MatchOp,
      productName: '',
      productCodeOp: 'contains' as MatchOp,
      productCode: '',
      clientOp: 'contains' as MatchOp,
      client: '',
      statusOp: 'contains' as MatchOp,
      status: '',
      versionOp: 'contains' as MatchOp,
      version: '',
    };
    setFilters(empty);
    setAppliedFilters(empty);
    setSelMainIds([]);
    setMainPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const openSheetForm = (mode: 'add' | 'edit' | 'view', row?: MainRowRecord, customTitle?: string) => {
    setFormErrors({});
    setOpenColPanel(null);
    setFormReadOnly(mode === 'view');
    setFormHeading(
      customTitle || (mode === 'add' ? '生成工艺单' : mode === 'edit' ? '修改工艺单' : '查看工艺单')
    );
    if (mode === 'add') {
      setEditingSheetId(null);
      setForm({ ...DEFAULT_SHEET_FORM });
      setLayoutPreviewUrl('');
      setEdgeRows(INITIAL_EDGE_ROWS.map((r) => ({ ...r })));
      setSprayRows(INITIAL_SPRAY_ROWS.map((r) => ({ ...r })));
    } else if (row) {
      setEditingSheetId(row.id);
      setForm({
        ...DEFAULT_SHEET_FORM,
        customer: row['顾客名称'] || '',
        canType: row['罐型'] || DEFAULT_SHEET_FORM.canType,
        productCode: row['产品编码'] || '',
        productName: row['产品名称'] || '',
        tinCoating: row['镀锡量（内/外）g/m2'] || DEFAULT_SHEET_FORM.tinCoating,
        clientName: row['客户'] || DEFAULT_SHEET_FORM.clientName,
        plateSpec: row['涂印薄钢板规格'] || DEFAULT_SHEET_FORM.plateSpec,
        craftType: row['工艺类型'] || '制罐',
        sheetCode: row['工艺单编码'] || '自动生成',
        version: row['版本'] || 'V1.0',
      });
    }
    setSelEdgeIds([]);
    setSelSprayIds([]);
    setView('form');
    onShowToast('已载入工艺单模板，可编辑后保存', 'info');
  };

  const handleSaveSheet = () => {
    const errs = {
      productCode: !form.productCode.trim(),
      craftType: !form.craftType.trim(),
    };
    if (errs.productCode || errs.craftType) {
      setFormErrors(errs);
      onShowToast('请填写完整必填项（产品编码、工艺类型）', 'error');
      return;
    }

    if (editingSheetId) {
      setMainRows((prev) =>
        prev.map((r) =>
          r.id === editingSheetId
            ? {
                ...r,
                顾客名称: form.customer || r['顾客名称'],
                产品名称: form.productName || r['产品名称'],
                产品编码: form.productCode,
                罐型: form.canType,
                '镀锡量（内/外）g/m2': form.tinCoating,
                涂印薄钢板规格: form.plateSpec,
                客户: form.clientName,
                工艺类型: form.craftType,
                版本: form.version,
              }
            : r
        )
      );
      onShowToast('工艺单修改已保存，返回列表', 'success');
    } else {
      const newRec: MainRowRecord = {
        id: `ps-${Date.now()}`,
        顾客名称: form.customer || '福建昇兴马口铁有限公司',
        产品名称: form.productName || `三片罐产品-${form.productCode}`,
        产品编码: form.productCode,
        罐型: form.canType,
        '镀锡量（内/外）g/m2': form.tinCoating,
        涂印薄钢板规格: form.plateSpec,
        客户: form.clientName,
        工艺类型: form.craftType,
        状态: '草稿',
        版本: form.version || 'V1.0',
        工艺单编码: `GYD-2026-${String(mainRows.length + 1).padStart(4, '0')}`,
      };
      setMainRows((prev) => [newRec, ...prev]);
      onShowToast('工艺单已生成并保存，返回列表', 'success');
    }
    setView('list');
  };

  const handleDeleteSelected = () => {
    if (selMainIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: '删除工艺单',
      desc: `确定删除选中的 ${selMainIds.length} 条工艺单吗？删除后不可恢复。`,
      danger: true,
      onConfirm: () => {
        const delSet = new Set(selMainIds);
        setMainRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setSelMainIds([]);
        onShowToast(`已删除 ${delSet.size} 条工艺单`, 'success');
      },
    });
  };

  const handleStatusTransition = (targetStatus: string, label: string) => {
    if (selMainIds.length === 0) return;
    const setIds = new Set(selMainIds);
    setMainRows((prev) =>
      prev.map((r) => (setIds.has(r.id) ? { ...r, 状态: targetStatus } : r))
    );
    onShowToast(`已对 ${selMainIds.length} 条工艺单执行「${label}」`, 'success');
  };

  const handleCopySheet = (row: MainRowRecord) => {
    const cloned: MainRowRecord = {
      ...row,
      id: `ps-${Date.now()}`,
      产品编码: `${row['产品编码']}_COPY`,
      状态: '草稿',
      工艺单编码: `GYD-2026-${String(mainRows.length + 1).padStart(4, '0')}`,
    };
    setMainRows((prev) => [cloned, ...prev]);
    onShowToast(`已复制工艺单（${cloned['产品编码']}）`, 'success');
  };

  const handleUploadLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      const url = typeof ev.target?.result === 'string' ? ev.target.result : '';
      if (url) {
        setLayoutPreviewUrl(url);
        setForm((prev) => ({ ...prev, layoutUploaded: true }));
        onShowToast(`已上传版面图片：${f.name}`, 'success');
      }
    };
    rd.readAsDataURL(f);
    e.target.value = '';
  };

  const renderSubCell = (field: string, val: string) => {
    if (field === '类型') {
      if (val === '永久') {
        return (
          <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium">
            永久
          </span>
        );
      }
      if (val === '测试') {
        return (
          <span className="inline-block px-2 py-0.5 rounded bg-rose-500 text-white text-[11px] font-medium">
            测试
          </span>
        );
      }
      return '';
    }
    if (field === '状态') {
      if (val === '未审核') {
        return (
          <span className="inline-block px-2 py-0.5 rounded bg-rose-500 text-white text-[11px] font-medium">
            未审核
          </span>
        );
      }
      if (val === '已确认') {
        return (
          <span className="inline-block px-2 py-0.5 rounded bg-emerald-500 text-white text-[11px] font-medium">
            已确认
          </span>
        );
      }
      return '';
    }
    if (field === 'SAP同步状态') {
      if (val === '待确认') {
        return (
          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-[#165DFF] border border-blue-200 text-[11px] font-medium">
            待确认
          </span>
        );
      }
      if (val === 'SAP已同步') {
        return (
          <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
            SAP已同步
          </span>
        );
      }
      return val;
    }
    if (field === '基本数量' || field === '行项目数' || field === 'BOM编号' || field === '版本') {
      return <span className="font-mono tabular-nums">{val}</span>;
    }
    return val;
  };

  const allPagedMainSelected =
    pagedMain.length > 0 && pagedMain.every((r) => selMainIds.includes(r.id));
  const allPagedSubSelected =
    pagedSub.length > 0 && pagedSub.every((r) => selSubIds.includes(r.id));

  // ====================== VIEW 2: 生成工艺单表单 ======================
  if (view === 'form') {
    const inputCls = (err?: boolean, ro?: boolean) =>
      `flex-1 h-8 px-2.5 border rounded-lg outline-none min-w-0 ${
        ro || formReadOnly
          ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
          : err
          ? 'bg-white text-[#1E293B] border-[#EA580C]'
          : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
      }`;

    return (
      <div className="space-y-4 text-xs text-[#1E293B]">
        {/* Top Bar */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">{formHeading}</h2>
            <span className="text-[#64748B]">· 工艺管理 · 工艺单创建</span>
          </div>
          <button
            type="button"
            onClick={() => setView('list')}
            className="h-8 px-3.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回列表</span>
          </button>
        </div>

        {/* Form Sections Card */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs divide-y divide-[#EDF2F7] overflow-hidden">
          {/* 基础信息 */}
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
              基础信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">顾客名称</label>
                <select
                  disabled={formReadOnly}
                  value={form.customer}
                  onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="">请选择</option>
                  <option value="福建昇兴马口铁有限公司">福建昇兴马口铁有限公司</option>
                  <option value="广东达利盛包装有限公司">广东达利盛包装有限公司</option>
                  <option value="承德顺天盒纺">承德顺天盒纺</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">工艺单模板</label>
                <select
                  disabled={formReadOnly}
                  value={form.sheetTemplate}
                  onChange={(e) => setForm((p) => ({ ...p, sheetTemplate: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="工艺单模板测试">工艺单模板测试</option>
                  <option value="标准工艺单模板">标准工艺单模板</option>
                  <option value="200#工艺单模板">200#工艺单模板</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">基础信息模板</label>
                <select
                  disabled={formReadOnly}
                  value={form.baseTemplate}
                  onChange={(e) => setForm((p) => ({ ...p, baseTemplate: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="基础信息测试模板">基础信息测试模板</option>
                  <option value="默认基础信息模板">默认基础信息模板</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">罐型</label>
                <input
                  readOnly={formReadOnly}
                  value={form.canType}
                  onChange={(e) => setForm((p) => ({ ...p, canType: e.target.value }))}
                  placeholder="请输入"
                  className={inputCls()}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>产品编码
                </label>
                <select
                  disabled={formReadOnly}
                  value={form.productCode}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, productCode: e.target.value }));
                    if (e.target.value) setFormErrors((p) => ({ ...p, productCode: false }));
                  }}
                  className={inputCls(formErrors.productCode)}
                >
                  <option value="">请选择</option>
                  <option value="10006760">10006760</option>
                  <option value="10006605">10006605</option>
                  <option value="10032785_COPY">10032785_COPY</option>
                  <option value="10031184">10031184</option>
                  <option value="10024251">10024251</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">产品名称</label>
                <input
                  readOnly={formReadOnly}
                  value={form.productName}
                  onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))}
                  placeholder="请输入"
                  className={inputCls()}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">镀锡量(内外)g/m2</label>
                <input
                  readOnly={formReadOnly}
                  value={form.tinCoating}
                  onChange={(e) => setForm((p) => ({ ...p, tinCoating: e.target.value }))}
                  placeholder="请输入"
                  className={inputCls()}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">客户名称</label>
                <input
                  readOnly={formReadOnly}
                  value={form.clientName}
                  onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                  placeholder="请输入"
                  className={inputCls()}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">涂印薄钢板规格</label>
                <input
                  readOnly={formReadOnly}
                  value={form.plateSpec}
                  onChange={(e) => setForm((p) => ({ ...p, plateSpec: e.target.value }))}
                  placeholder="请输入"
                  className={inputCls()}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>工艺类型
                </label>
                <select
                  disabled={formReadOnly}
                  value={form.craftType}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, craftType: e.target.value }));
                    if (e.target.value) setFormErrors((p) => ({ ...p, craftType: false }));
                  }}
                  className={inputCls(formErrors.craftType)}
                >
                  <option value="制罐">制罐</option>
                  <option value="测试">测试</option>
                  <option value="test">test</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">工艺单编码</label>
                <input readOnly value={form.sheetCode} className={inputCls(false, true)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">版本</label>
                <input
                  readOnly={formReadOnly}
                  value={form.version}
                  onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))}
                  placeholder="请输入"
                  className={inputCls()}
                />
              </div>
            </div>

            {/* 版面上传 */}
            <div className="flex items-start gap-2 pt-1">
              <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0 pt-2">版面</label>
              <div className="flex items-start gap-4">
                <div
                  onClick={() => !formReadOnly && layoutInputRef.current?.click()}
                  className={`w-24 h-20 border border-dashed border-[#CBD5E1] rounded-lg flex items-center justify-center bg-[#F8FAFC] overflow-hidden transition ${
                    formReadOnly ? 'cursor-not-allowed' : 'cursor-pointer hover:border-[#165DFF]'
                  }`}
                >
                  {layoutPreviewUrl ? (
                    <img src={layoutPreviewUrl} alt="版面" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[#94A3B8]">
                      <Upload className="w-4 h-4" />
                      <span className="text-[11px]">上传版面</span>
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-[#64748B] leading-relaxed pt-1">
                  <div>图片大小限制: 50MB</div>
                  <div>最大图片数: 9</div>
                  <div>图片支持格式: .jpg,.jpeg,.png,.tmp,.tif,.gif</div>
                </div>
                <input
                  ref={layoutInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLayout}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* 1、制程 */}
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
              1、制程
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">落料规格选择</label>
                <select
                  disabled={formReadOnly}
                  value={form.cutSpecTemplate}
                  onChange={(e) => setForm((p) => ({ ...p, cutSpecTemplate: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="206#标准裁板参数">206#标准裁板参数</option>
                  <option value="209#标准裁板参数">209#标准裁板参数</option>
                  <option value="200#标准裁板参数">200#标准裁板参数</option>
                </select>
              </div>
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">落料宽度(mm)</label>
                <input readOnly={formReadOnly} value={form.cutWidth} onChange={(e) => setForm((p) => ({ ...p, cutWidth: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">落料高度(mm)</label>
                <input readOnly={formReadOnly} value={form.cutHeight} onChange={(e) => setForm((p) => ({ ...p, cutHeight: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">裁剪枚数</label>
                <input readOnly={formReadOnly} value={form.cutCount} onChange={(e) => setForm((p) => ({ ...p, cutCount: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">直角度(mm)</label>
                <input readOnly={formReadOnly} value={form.squareness} onChange={(e) => setForm((p) => ({ ...p, squareness: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">毛边(mm)</label>
                <input readOnly={formReadOnly} value={form.burr} onChange={(e) => setForm((p) => ({ ...p, burr: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">搭接量(mm)</label>
                <input readOnly={formReadOnly} value={form.overlap} onChange={(e) => setForm((p) => ({ ...p, overlap: e.target.value }))} className={inputCls()} />
              </div>
            </div>
          </div>

          {/* 2、电阻焊 */}
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
              2、电阻焊
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">电阻焊模板</label>
                <select
                  disabled={formReadOnly}
                  value={form.weldTemplate}
                  onChange={(e) => setForm((p) => ({ ...p, weldTemplate: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="电阻焊标准参数-206#">电阻焊标准参数-206#</option>
                  <option value="电阻焊标准参数-209#">电阻焊标准参数-209#</option>
                </select>
              </div>
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">长短脚+拖尾(mm)</label>
                <input readOnly={formReadOnly} value={form.legTail} onChange={(e) => setForm((p) => ({ ...p, legTail: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">焊缝厚度(不含)</label>
                <input readOnly={formReadOnly} value={form.weldNoPaint} onChange={(e) => setForm((p) => ({ ...p, weldNoPaint: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">焊缝厚度(含涂料)</label>
                <input readOnly={formReadOnly} value={form.weldWithPaint} onChange={(e) => setForm((p) => ({ ...p, weldWithPaint: e.target.value }))} className={inputCls()} />
              </div>
            </div>
          </div>

          {/* 2、SPS */}
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
              2、SPS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">SPS烘干模板</label>
                <select
                  disabled={formReadOnly}
                  value={form.spsTemplate}
                  onChange={(e) => setForm((p) => ({ ...p, spsTemplate: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="SPS烘干">SPS烘干</option>
                  <option value="SPS烘干-加强">SPS烘干-加强</option>
                </select>
              </div>
              <div className="flex items-start gap-2 md:col-span-3">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0 pt-2">SPS烘干备注</label>
                <textarea
                  readOnly={formReadOnly}
                  value={form.spsRemark}
                  onChange={(e) => setForm((p) => ({ ...p, spsRemark: e.target.value }))}
                  rows={2}
                  className={`flex-1 px-3 py-2 border rounded-lg outline-none resize-y ${
                    formReadOnly
                      ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0]'
                      : 'bg-white border-[#E5E9F0] focus:border-[#2563EB]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 3、缩颈、翻边、封盖 */}
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
              3、缩颈、翻边、封盖
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">缩颈翻边模板</label>
                <select
                  disabled={formReadOnly}
                  value={form.neckTemplate}
                  onChange={(e) => setForm((p) => ({ ...p, neckTemplate: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="200#铁底盖">200#铁底盖</option>
                  <option value="206#铁底盖">206#铁底盖</option>
                </select>
              </div>
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">封盖</label>
                <input readOnly={formReadOnly} value={form.seaming} onChange={(e) => setForm((p) => ({ ...p, seaming: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">封盖后罐高(mm)</label>
                <input readOnly={formReadOnly} value={form.canHeightAfter} onChange={(e) => setForm((p) => ({ ...p, canHeightAfter: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">卷边宽度(mm)</label>
                <input readOnly={formReadOnly} value={form.seamWidth} onChange={(e) => setForm((p) => ({ ...p, seamWidth: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">翻边宽度(mm)</label>
                <input readOnly={formReadOnly} value={form.flangeWidth} onChange={(e) => setForm((p) => ({ ...p, flangeWidth: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">封盖T值(mm)</label>
                <input readOnly={formReadOnly} value={form.seamTVal} onChange={(e) => setForm((p) => ({ ...p, seamTVal: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">身钩(mm)</label>
                <input readOnly={formReadOnly} value={form.bodyHook} onChange={(e) => setForm((p) => ({ ...p, bodyHook: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">盖钩(mm)</label>
                <input readOnly={formReadOnly} value={form.coverHook} onChange={(e) => setForm((p) => ({ ...p, coverHook: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">叠接长度(mm)</label>
                <input readOnly={formReadOnly} value={form.overlapLen} onChange={(e) => setForm((p) => ({ ...p, overlapLen: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">叠接率</label>
                <input readOnly={formReadOnly} value={form.overlapRate} onChange={(e) => setForm((p) => ({ ...p, overlapRate: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">紧密度</label>
                <input readOnly={formReadOnly} value={form.tightness} onChange={(e) => setForm((p) => ({ ...p, tightness: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">滚筋深度(mm)</label>
                <input readOnly={formReadOnly} value={form.beadDepth} onChange={(e) => setForm((p) => ({ ...p, beadDepth: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">滚筋宽度(mm)</label>
                <input readOnly={formReadOnly} value={form.beadWidth} onChange={(e) => setForm((p) => ({ ...p, beadWidth: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-start gap-2 md:col-span-2 lg:col-span-3">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0 pt-2">备注</label>
                <textarea
                  readOnly={formReadOnly}
                  value={form.neckRemark}
                  onChange={(e) => setForm((p) => ({ ...p, neckRemark: e.target.value }))}
                  placeholder="请输入"
                  rows={2}
                  className="flex-1 px-3 py-2 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* 5、包装 */}
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
              5、包装
              <span className="font-normal text-xs text-[#64748B] ml-2">
                （客户有要求的，按照客户要求执行）
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">包装模板</label>
                <select
                  disabled={formReadOnly}
                  value={form.packTemplate}
                  onChange={(e) => setForm((p) => ({ ...p, packTemplate: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="200#249包装">200#249包装</option>
                  <option value="206#标准包装">206#标准包装</option>
                </select>
              </div>
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">包装层数</label>
                <input readOnly={formReadOnly} value={form.packLayers} onChange={(e) => setForm((p) => ({ ...p, packLayers: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">每层罐数</label>
                <input readOnly={formReadOnly} value={form.cansPerLayer} onChange={(e) => setForm((p) => ({ ...p, cansPerLayer: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">垛数</label>
                <input readOnly={formReadOnly} value={form.stackCount} onChange={(e) => setForm((p) => ({ ...p, stackCount: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">打包带材质</label>
                <input readOnly={formReadOnly} value={form.strapMaterial} onChange={(e) => setForm((p) => ({ ...p, strapMaterial: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">打包带数量</label>
                <input readOnly={formReadOnly} value={form.strapCount} onChange={(e) => setForm((p) => ({ ...p, strapCount: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">打包方式</label>
                <input readOnly={formReadOnly} value={form.packMethod} onChange={(e) => setForm((p) => ({ ...p, packMethod: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">隔层板</label>
                <input readOnly={formReadOnly} value={form.divider} onChange={(e) => setForm((p) => ({ ...p, divider: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">隔层板放置要求</label>
                <input readOnly={formReadOnly} value={form.dividerReq} onChange={(e) => setForm((p) => ({ ...p, dividerReq: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">外包装</label>
                <input readOnly={formReadOnly} value={form.outerPack} onChange={(e) => setForm((p) => ({ ...p, outerPack: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">栈板</label>
                <input readOnly={formReadOnly} value={form.pallet} onChange={(e) => setForm((p) => ({ ...p, pallet: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-start gap-2 md:col-span-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0 pt-2">包装备注</label>
                <textarea
                  readOnly={formReadOnly}
                  value={form.packRemark}
                  onChange={(e) => setForm((p) => ({ ...p, packRemark: e.target.value }))}
                  placeholder="请输入"
                  rows={2}
                  className="flex-1 px-3 py-2 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* 6、边缘补涂 */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
                6、边缘补涂
              </h3>
              {!formReadOnly && (
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B]">共 {edgeRows.length} 行</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEdgeRows((prev) => [
                        ...prev,
                        { id: `ed-${Date.now()}`, category: '内补涂', supplier: '', paintCode: '', solventCode: '', viscosity: '', sprayThickness: '' },
                      ]);
                      onShowToast('已添加一行边缘补涂明细', 'info');
                    }}
                    className="h-7 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>添加一行</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selEdgeIds.length) {
                        onShowToast('请先勾选要删除的行', 'warning');
                        return;
                      }
                      const delSet = new Set(selEdgeIds);
                      setEdgeRows((prev) => prev.filter((r) => !delSet.has(r.id)));
                      setSelEdgeIds([]);
                      onShowToast('已删除选中边缘补涂明细', 'success');
                    }}
                    className="h-7 px-3 border border-[#EA580C]/50 rounded-lg bg-white text-[#EA580C] hover:bg-[#EA580C]/10 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>删除</span>
                  </button>
                </div>
              )}
            </div>
            <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
                <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold">
                  <tr>
                    <th className="p-2 border-b border-r border-[#E5E9F0] w-9 text-center">
                      <input
                        type="checkbox"
                        checked={edgeRows.length > 0 && edgeRows.every((r) => selEdgeIds.includes(r.id))}
                        onChange={(e) => setSelEdgeIds(e.target.checked ? edgeRows.map((r) => r.id) : [])}
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                      />
                    </th>
                    <th className="p-2 border-b border-r border-[#E5E9F0] w-12 text-center">序号</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">类别</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">涂料供应商</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">涂料代号</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">溶剂代号</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">上机粘度(s)</th>
                    <th className="p-2 border-b border-[#E5E9F0]">喷涂粘度(mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7]">
                  {edgeRows.map((r, i) => (
                    <tr key={r.id}>
                      <td className="p-1.5 border-r border-[#EDF2F7] text-center">
                        <input
                          type="checkbox"
                          checked={selEdgeIds.includes(r.id)}
                          onChange={() =>
                            setSelEdgeIds((prev) =>
                              prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                            )
                          }
                          className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                        />
                      </td>
                      <td className="p-1.5 border-r border-[#EDF2F7] text-center font-mono text-[#64748B]">
                        {i + 1}
                      </td>
                      <td className="p-1.5 border-r border-[#EDF2F7]">
                        <select
                          disabled={formReadOnly}
                          value={r.category}
                          onChange={(e) =>
                            setEdgeRows((prev) =>
                              prev.map((x) => (x.id === r.id ? { ...x, category: e.target.value } : x))
                            )
                          }
                          className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none"
                        >
                          <option value="内补涂">内补涂</option>
                          <option value="外补涂">外补涂</option>
                          <option value="焊缝补涂">焊缝补涂</option>
                        </select>
                      </td>
                      {(['supplier', 'paintCode', 'solventCode', 'viscosity', 'sprayThickness'] as const).map(
                        (field) => (
                          <td key={field} className="p-1.5 border-r last:border-r-0 border-[#EDF2F7]">
                            <input
                              readOnly={formReadOnly}
                              value={r[field]}
                              onChange={(e) =>
                                setEdgeRows((prev) =>
                                  prev.map((x) => (x.id === r.id ? { ...x, [field]: e.target.value } : x))
                                )
                              }
                              placeholder="请输入"
                              className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none focus:border-[#2563EB]"
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4、全喷 */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
                4、全喷
              </h3>
              {!formReadOnly && (
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B]">共 {sprayRows.length} 行</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSprayRows((prev) => [
                        ...prev,
                        { id: `sp-${Date.now()}`, supplier: '阿克苏', paintCode: '', solventCode: '', viscosity: '', dryFilmWeight: '', bakingCond: '', innerCoating: '', remark: '' },
                      ]);
                      onShowToast('已添加一行全喷明细', 'info');
                    }}
                    className="h-7 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>添加一行</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selSprayIds.length) {
                        onShowToast('请先勾选要删除的行', 'warning');
                        return;
                      }
                      const delSet = new Set(selSprayIds);
                      setSprayRows((prev) => prev.filter((r) => !delSet.has(r.id)));
                      setSelSprayIds([]);
                      onShowToast('已删除选中全喷明细', 'success');
                    }}
                    className="h-7 px-3 border border-[#EA580C]/50 rounded-lg bg-white text-[#EA580C] hover:bg-[#EA580C]/10 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>删除</span>
                  </button>
                </div>
              )}
            </div>
            <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[960px]">
                <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold">
                  <tr>
                    <th className="p-2 border-b border-r border-[#E5E9F0] w-9 text-center">
                      <input
                        type="checkbox"
                        checked={sprayRows.length > 0 && sprayRows.every((r) => selSprayIds.includes(r.id))}
                        onChange={(e) => setSelSprayIds(e.target.checked ? sprayRows.map((r) => r.id) : [])}
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                      />
                    </th>
                    <th className="p-2 border-b border-r border-[#E5E9F0] w-12 text-center">序号</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">涂料供应商</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">涂料代号</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">溶剂代号</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">上机粘度(s)</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">干膜重(mg/罐)</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">烘干条件</th>
                    <th className="p-2 border-b border-r border-[#E5E9F0]">配套彩印内涂</th>
                    <th className="p-2 border-b border-[#E5E9F0]">全喷备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7]">
                  {sprayRows.map((r, i) => (
                    <tr key={r.id}>
                      <td className="p-1.5 border-r border-[#EDF2F7] text-center">
                        <input
                          type="checkbox"
                          checked={selSprayIds.includes(r.id)}
                          onChange={() =>
                            setSelSprayIds((prev) =>
                              prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                            )
                          }
                          className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                        />
                      </td>
                      <td className="p-1.5 border-r border-[#EDF2F7] text-center font-mono text-[#64748B]">
                        {i + 1}
                      </td>
                      <td className="p-1.5 border-r border-[#EDF2F7]">
                        <select
                          disabled={formReadOnly}
                          value={r.supplier}
                          onChange={(e) =>
                            setSprayRows((prev) =>
                              prev.map((x) => (x.id === r.id ? { ...x, supplier: e.target.value } : x))
                            )
                          }
                          className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none"
                        >
                          <option value="涂料供应商">涂料供应商</option>
                          <option value="阿克苏">阿克苏</option>
                          <option value="PPG">PPG</option>
                        </select>
                      </td>
                      {([
                        'paintCode',
                        'solventCode',
                        'viscosity',
                        'dryFilmWeight',
                        'bakingCond',
                        'innerCoating',
                        'remark',
                      ] as const).map((field) => (
                        <td key={field} className="p-1.5 border-r last:border-r-0 border-[#EDF2F7]">
                          <input
                            readOnly={formReadOnly}
                            value={r[field]}
                            onChange={(e) =>
                              setSprayRows((prev) =>
                                prev.map((x) => (x.id === r.id ? { ...x, [field]: e.target.value } : x))
                              )
                            }
                            placeholder="请输入"
                            className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none focus:border-[#2563EB]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0 pt-2">全喷备注</label>
              <textarea
                readOnly={formReadOnly}
                value={form.sprayRemark}
                onChange={(e) => setForm((p) => ({ ...p, sprayRemark: e.target.value }))}
                placeholder="请输入"
                rows={2}
                className="flex-1 px-3 py-2 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* 变更说明 */}
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] border-l-3 border-[#165DFF] pl-2.5">
              变更说明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-start gap-2 md:col-span-2 lg:col-span-3">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0 pt-2">变更说明</label>
                <textarea
                  readOnly={formReadOnly}
                  value={form.changeNote}
                  onChange={(e) => setForm((p) => ({ ...p, changeNote: e.target.value }))}
                  placeholder="请输入"
                  rows={2}
                  className="flex-1 px-3 py-2 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">制表人</label>
                <input readOnly value={form.creator} className={inputCls(false, true)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">制表时间</label>
                <input readOnly value={form.createTime} className={inputCls(false, true)} />
              </div>
              <div className="hidden lg:block" />
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">工艺单类型</label>
                <input readOnly={formReadOnly} value={form.sheetType} onChange={(e) => setForm((p) => ({ ...p, sheetType: e.target.value }))} className={inputCls()} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">版本</label>
                <input readOnly={formReadOnly} value={form.tailVersion} onChange={(e) => setForm((p) => ({ ...p, tailVersion: e.target.value }))} placeholder="请输入" className={inputCls()} />
              </div>
            </div>
          </div>

          {/* Sticky Form Footer */}
          <div className="px-5 py-3.5 bg-[#FFFFFF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setView('list')}
              className="h-8 px-4 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] font-medium cursor-pointer"
            >
              取消
            </button>
            {!formReadOnly && (
              <button
                type="button"
                onClick={handleSaveSheet}
                className="h-8 px-4 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
              >
                保存并退出
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ====================== VIEW 1: 工艺单列表 + BOM 子列表 ======================
  return (
    <div
      className="space-y-4 relative text-xs text-[#1E293B]"
      onClick={() => {
        if (openColPanel) setOpenColPanel(null);
      }}
    >
      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工艺单</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">组织机构</label>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="昇兴集团">昇兴集团</option>
                <option value="昇兴集团-中山制罐厂">昇兴集团-中山制罐厂</option>
                <option value="昇兴集团-福建制罐厂">昇兴集团-福建制罐厂</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
            <button
              type="button"
              onClick={handleQuery}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenColPanel((p) => (p === 'main' ? null : 'main'));
              }}
              className={`h-8 w-8 border rounded-lg flex items-center justify-center transition cursor-pointer ${
                openColPanel === 'main'
                  ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B]'
                  : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
              title="主列表列设置"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFilterCollapsed((prev) => !prev)}
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg flex items-center justify-center text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer"
              title={filterCollapsed ? '展开筛选' : '收起筛选'}
            >
              {filterCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!filterCollapsed && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-0.5 pl-1">
            {(
              [
                { label: '顾客名称', opKey: 'customerOp', valKey: 'customer' },
                { label: '产品名称', opKey: 'productNameOp', valKey: 'productName' },
                { label: '产品编码', opKey: 'productCodeOp', valKey: 'productCode' },
                { label: '客户', opKey: 'clientOp', valKey: 'client' },
                { label: '状态', opKey: 'statusOp', valKey: 'status' },
                { label: '版本', opKey: 'versionOp', valKey: 'version' },
              ] as const
            ).map((f) => (
              <div key={f.valKey} className="flex items-center gap-1.5">
                <label className="text-[#1E40AF] font-medium w-16 text-right">{f.label}</label>
                <select
                  value={filters[f.opKey]}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [f.opKey]: e.target.value as MatchOp }))
                  }
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={filters[f.valKey]}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [f.valKey]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请输入"
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-36 outline-none focus:border-[#2563EB]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card 1: 工艺单主列表 */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        {/* Primary Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => openSheetForm('add')}
              className="h-8 px-3 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加工艺单</span>
            </button>
            <button
              type="button"
              disabled={selMainIds.length === 0}
              onClick={() => handleStatusTransition('OA审批中', '提交OA审批')}
              className={`h-8 px-3 border rounded-lg transition flex items-center gap-1 font-medium ${
                selMainIds.length === 0
                  ? 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                  : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>提交OA审批</span>
            </button>
            <button
              type="button"
              disabled={selMainIds.length !== 1}
              onClick={() => {
                const target = mainRows.find((r) => r.id === selMainIds[0]);
                if (target) openSheetForm('edit', target);
              }}
              className={`h-8 px-3 border rounded-lg transition flex items-center gap-1 font-medium ${
                selMainIds.length !== 1
                  ? 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                  : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>修改</span>
            </button>
            <button
              type="button"
              disabled={selMainIds.length === 0}
              onClick={handleDeleteSelected}
              className={`h-8 px-3 border rounded-lg transition flex items-center gap-1 font-medium ${
                selMainIds.length === 0
                  ? 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                  : 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10 cursor-pointer'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
            </button>
            <button
              type="button"
              disabled={selMainIds.length !== 1}
              onClick={() => {
                const target = mainRows.find((r) => r.id === selMainIds[0]);
                if (target) openSheetForm('view', target);
              }}
              className={`h-8 px-3 border rounded-lg transition flex items-center gap-1 font-medium ${
                selMainIds.length !== 1
                  ? 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                  : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>查看</span>
            </button>
            <button
              type="button"
              onClick={() => onShowToast('工艺单记录已导出（演示）', 'success')}
              className="h-8 px-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition flex items-center gap-1 font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出工艺单记录</span>
            </button>
            <button
              type="button"
              onClick={() => openSheetForm('add', undefined, '新建BOM / 生成工艺单')}
              className="h-8 px-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition flex items-center gap-1 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建BOM</span>
            </button>
            <button
              type="button"
              disabled={selMainIds.length === 0}
              onClick={() => handleStatusTransition('已审核', '审核')}
              className={`h-8 px-3 border rounded-lg transition flex items-center gap-1 font-medium ${
                selMainIds.length === 0
                  ? 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                  : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>审核</span>
            </button>
            <button
              type="button"
              disabled={selMainIds.length === 0}
              onClick={() => handleStatusTransition('已审批', '审批')}
              className={`h-8 px-3 border rounded-lg transition flex items-center gap-1 font-medium ${
                selMainIds.length === 0
                  ? 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                  : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>审批</span>
            </button>
          </div>
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选 <strong className="font-mono text-[#1E293B]">{selMainIds.length}</strong> 项
            </span>
          </div>
        </div>

        {/* Sub Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-[#EDF2F7] bg-[#F8FAFC]">
          <button
            type="button"
            onClick={() => openSheetForm('add', undefined, '添加不同工艺单')}
            className="h-7 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer"
          >
            添加不同工艺单
          </button>
          <button
            type="button"
            onClick={() => openSheetForm('add', undefined, '两片添加工艺单')}
            className="h-7 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer"
          >
            两片添加
          </button>
          <button
            type="button"
            disabled={selMainIds.length !== 1}
            onClick={() => {
              const target = mainRows.find((r) => r.id === selMainIds[0]);
              if (target) openSheetForm('edit', target, '跳转修改工艺单');
            }}
            className={`h-7 px-3 border rounded-lg transition ${
              selMainIds.length !== 1
                ? 'border-[#E5E9F0] bg-white text-[#94A3B8] cursor-not-allowed'
                : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer'
            }`}
          >
            跳转修改
          </button>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allPagedMainSelected}
                    onChange={() => {
                      if (allPagedMainSelected) {
                        const ps = new Set(pagedMain.map((r) => r.id));
                        setSelMainIds((prev) => prev.filter((id) => !ps.has(id)));
                      } else {
                        setSelMainIds((prev) => Array.from(new Set([...prev, ...pagedMain.map((r) => r.id)])));
                      }
                    }}
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                {MAIN_ALL_FIELDS.filter((f) => mainVisibleCols.includes(f)).map((f) => (
                  <th
                    key={f}
                    onClick={() =>
                      setMainSort((prev) =>
                        prev.key !== f
                          ? { key: f, dir: 'asc' }
                          : prev.dir === 'asc'
                          ? { key: f, dir: 'desc' }
                          : { key: null, dir: null }
                      )
                    }
                    className={`p-2.5 border-b border-r border-[#E5E9F0] cursor-pointer hover:bg-[#EDF2F7]/70 select-none ${
                      f === '产品编码' || f === '产品名称' ? 'bg-blue-50/70 text-blue-700' : ''
                    }`}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>{f}</span>
                      <ArrowUpDown
                        className={`w-3 h-3 ${
                          mainSort.key === f ? 'text-[#1E40AF]' : 'text-[#C5C8BE]'
                        }`}
                      />
                    </div>
                  </th>
                ))}
                <th className="p-2.5 border-b border-[#E5E9F0] w-44 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <div className="inline-flex items-center gap-2">
                    <span>操作</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenColPanel((p) => (p === 'main' ? null : 'main'));
                      }}
                      className="text-[#2563EB] hover:text-[#1E293B] cursor-pointer"
                      title="主列表列设置"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {pagedMain.map((row) => {
                const isSelected = selMainIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('input')) return;
                      setSelMainIds((prev) =>
                        prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                      );
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EBF2FF]/60 hover:bg-[#EBF2FF]/80' : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelMainIds((prev) =>
                            prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                          )
                        }
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    {MAIN_ALL_FIELDS.filter((f) => mainVisibleCols.includes(f)).map((f) => (
                      <td
                        key={`${row.id}-${f}`}
                        className={`p-2.5 border-r border-[#EDF2F7] ${
                          f === '产品编码' ? 'font-mono font-bold text-[#1E40AF] bg-blue-50/20' : ''
                        } ${f === '产品名称' ? 'bg-blue-50/20 font-medium' : ''}`}
                      >
                        {row[f] || ''}
                      </td>
                    ))}
                    <td
                      className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                        isSelected ? 'bg-[#EBF2FF]' : 'bg-white'
                      }`}
                    >
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onShowToast(`已导出工艺单：${row['产品编码']}`, 'success')}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          导出工艺单
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopySheet(row)}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>工艺单复制</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Main Pagination */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedMain.length}</strong> 条
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMainPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: mainTotalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMainPage(n)}
                className={`w-7 h-7 border rounded-lg font-mono flex items-center justify-center cursor-pointer ${
                  safeMainPage === n
                    ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                    : 'border-[#E5E9F0] bg-white text-[#1E40AF]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMainPage((p) => Math.min(mainTotalPages, p + 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={mainPageSize}
            onChange={(e) => {
              setMainPageSize(Number(e.target.value));
              setMainPage(1);
            }}
            className="h-7 px-2 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
        </div>

        {/* F3 主列表列设置浮层 */}
        {openColPanel === 'main' && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-12 w-76 max-h-[520px] bg-white border border-[#E5E9F0] rounded-xl shadow-xl z-40 flex flex-col overflow-hidden"
          >
            <div className="px-3.5 py-2.5 border-b border-[#EDF2F7] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E293B]">
                主列表列设置（{mainVisibleCols.length}/{MAIN_ALL_FIELDS.length}）
              </span>
              <button
                type="button"
                onClick={() => setOpenColPanel(null)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-1 divide-y divide-[#F4F6F9] text-xs">
              {MAIN_ALL_FIELDS.map((field) => {
                const checked = mainVisibleCols.includes(field);
                return (
                  <label
                    key={field}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F4F6F9] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMainVisibleCols((prev) => [...prev, field]);
                        } else {
                          setMainVisibleCols((prev) => prev.filter((x) => x !== field));
                        }
                      }}
                      className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                    />
                    <span className="flex-1 text-[#1E293B]">{field}</span>
                    <Pin className="w-3 h-3 text-[#CBD5E1]" />
                  </label>
                );
              })}
            </div>
            <div className="px-3.5 py-2.5 border-t border-[#EDF2F7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setMainVisibleCols(MAIN_DEFAULT_VISIBLE);
                  onShowToast('已恢复主列表默认列', 'info');
                }}
                className="px-2.5 py-1 border border-[#E5E9F0] rounded-lg text-xs text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => setOpenColPanel(null)}
                className="px-3 py-1 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: BOM 子列表 */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#1E293B]">BOM 子列表</span>
            <span className="text-xs text-[#64748B]">
              已选 <strong className="font-mono text-[#1E293B]">{selSubIds.length}</strong> 项
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenColPanel((p) => (p === 'sub' ? null : 'sub'));
            }}
            className="text-[#2563EB] hover:text-[#1E293B] p-1 rounded cursor-pointer"
            title="子列表列设置"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allPagedSubSelected}
                    onChange={() => {
                      if (allPagedSubSelected) {
                        const ps = new Set(pagedSub.map((r) => r.id));
                        setSelSubIds((prev) => prev.filter((id) => !ps.has(id)));
                      } else {
                        setSelSubIds((prev) => Array.from(new Set([...prev, ...pagedSub.map((r) => r.id)])));
                      }
                    }}
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                {SUB_ALL_FIELDS.filter((f) => subVisibleCols.includes(f)).map((f) => (
                  <th key={f} className="p-2.5 border-b border-r border-[#E5E9F0]">
                    <div className="inline-flex items-center gap-1">
                      <span>{f}</span>
                      <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                    </div>
                  </th>
                ))}
                <th className="p-2.5 border-b border-[#E5E9F0] w-24 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {pagedSub.map((row) => {
                const isSelected = selSubIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-[#EBF2FF]/60' : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelSubIds((prev) =>
                            prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                          )
                        }
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    {SUB_ALL_FIELDS.filter((f) => subVisibleCols.includes(f)).map((f) => (
                      <td key={`${row.id}-${f}`} className="p-2.5 border-r border-[#EDF2F7]">
                        {renderSubCell(f, row[f] || '')}
                      </td>
                    ))}
                    <td
                      className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                        isSelected ? 'bg-[#EBF2FF]' : 'bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setViewBom(row)}
                        className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sub Pagination */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{subRows.length}</strong> 条
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSubPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 border border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold font-mono rounded-lg flex items-center justify-center">
              {safeSubPage}
            </span>
            <button
              type="button"
              onClick={() => setSubPage((p) => Math.min(subTotalPages, p + 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={subPageSize}
            onChange={(e) => {
              setSubPageSize(Number(e.target.value));
              setSubPage(1);
            }}
            className="h-7 px-2 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
          </select>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={subJump}
              onChange={(e) => setSubJump(e.target.value)}
              className="w-11 h-7 px-1.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] text-center font-mono outline-none focus:border-[#2563EB]"
            />
            <button
              type="button"
              onClick={() => {
                const n = parseInt(subJump, 10);
                if (!Number.isNaN(n) && n >= 1 && n <= subTotalPages) {
                  setSubPage(n);
                  onShowToast(`已跳转到第 ${n} 页`, 'info');
                } else {
                  onShowToast(`当前共 ${subTotalPages} 页`, 'warning');
                }
              }}
              className="h-7 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer"
            >
              确定
            </button>
          </div>
        </div>

        {/* F4 子列表列设置浮层 */}
        {openColPanel === 'sub' && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-12 w-72 max-h-[460px] bg-white border border-[#E5E9F0] rounded-xl shadow-xl z-40 flex flex-col overflow-hidden"
          >
            <div className="px-3.5 py-2.5 border-b border-[#EDF2F7] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E293B]">
                子列表列设置（{subVisibleCols.length}/{SUB_ALL_FIELDS.length}）
              </span>
              <button
                type="button"
                onClick={() => setOpenColPanel(null)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-1 divide-y divide-[#F4F6F9] text-xs">
              {SUB_ALL_FIELDS.map((field) => {
                const checked = subVisibleCols.includes(field);
                return (
                  <label
                    key={field}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F4F6F9] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSubVisibleCols((prev) => [...prev, field]);
                        } else {
                          setSubVisibleCols((prev) => prev.filter((x) => x !== field));
                        }
                      }}
                      className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                    />
                    <span className="flex-1 text-[#1E293B]">{field}</span>
                    <Pin className="w-3 h-3 text-[#CBD5E1]" />
                  </label>
                );
              })}
            </div>
            <div className="px-3.5 py-2.5 border-t border-[#EDF2F7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubVisibleCols(SUB_DEFAULT_VISIBLE);
                  onShowToast('已恢复子列表默认列', 'info');
                }}
                className="px-2.5 py-1 border border-[#E5E9F0] rounded-lg text-xs text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => setOpenColPanel(null)}
                className="px-3 py-1 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOM Detail Modal */}
      {viewBom && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewBom(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E293B]">
                查看 BOM 明细 · {viewBom['BOM编号']}
              </h3>
              <button
                type="button"
                onClick={() => setViewBom(null)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3.5 text-xs">
              {SUB_DEFAULT_VISIBLE.map((k) => (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-[#64748B]">{k}</span>
                  <div className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] flex items-center text-[#1E293B]">
                    {viewBom[k] || '—'}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#EDF2F7] flex justify-end">
              <button
                type="button"
                onClick={() => setViewBom(null)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmState.isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmState({ isOpen: false, title: '', desc: '', onConfirm: null });
            }
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
              <h3 className="text-sm font-bold text-[#1E293B]">{confirmState.title}</h3>
            </div>
            <div className="px-5 py-4 text-xs text-[#475569] leading-relaxed">
              {confirmState.desc}
            </div>
            <div className="px-5 py-3 border-t border-[#EDF2F7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmState({ isOpen: false, title: '', desc: '', onConfirm: null })
                }
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const cb = confirmState.onConfirm;
                  setConfirmState({ isOpen: false, title: '', desc: '', onConfirm: null });
                  if (cb) cb();
                }}
                className="px-4 py-1.5 bg-[#EA580C] text-white rounded-lg text-xs font-medium hover:bg-[#d96136] cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
