import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface CopperOutsourcingReceiptTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals' | 'notContains';
type NumOp = '=' | '>' | '>=' | '<' | '<=' | '!=';

interface OutsourcingReceiptRecord {
  id: string;
  org: string;
  materialCode: string;
  materialName: string;
  outsourcingVendor: string;
  barcode: string;
  poNo: string;
  createdAt: string;
  supplierName: string;
  warehouse: string;
  accumulatedQty: number;
  grossWeight: number;
  tareWeight: number;
  defectWeight: number | null;
  netWeight: number;
}

type ColKey =
  | 'supplierName'
  | 'warehouse'
  | 'accumulatedQty'
  | 'grossWeight'
  | 'tareWeight'
  | 'defectWeight'
  | 'netWeight'
  | 'poNo'
  | 'materialCode'
  | 'materialName'
  | 'barcode'
  | 'outsourcingVendor'
  | 'org'
  | 'createdAt';

interface ColDef {
  key: ColKey;
  title: string;
  sortable: boolean;
  defaultVisible: boolean;
  minWidth: string;
  isNumeric?: boolean;
}

const COLUMNS: ColDef[] = [
  { key: 'supplierName', title: '供应商名称', sortable: true, defaultVisible: true, minWidth: '210px' },
  { key: 'warehouse', title: '入库仓库', sortable: true, defaultVisible: true, minWidth: '105px' },
  { key: 'accumulatedQty', title: '累积已收数量', sortable: true, defaultVisible: true, minWidth: '125px', isNumeric: true },
  { key: 'grossWeight', title: '总重量（kg）', sortable: true, defaultVisible: true, minWidth: '130px', isNumeric: true },
  { key: 'tareWeight', title: '皮重（kg）', sortable: true, defaultVisible: true, minWidth: '115px', isNumeric: true },
  { key: 'defectWeight', title: '不良品重（kg）', sortable: true, defaultVisible: true, minWidth: '135px', isNumeric: true },
  { key: 'netWeight', title: '净重（kg）', sortable: true, defaultVisible: true, minWidth: '125px', isNumeric: true },
  // Extra toggleable columns aligned with query fields
  { key: 'poNo', title: '采购订单编号', sortable: true, defaultVisible: false, minWidth: '130px' },
  { key: 'materialCode', title: '物料料号', sortable: true, defaultVisible: false, minWidth: '115px' },
  { key: 'materialName', title: '物料名称', sortable: true, defaultVisible: false, minWidth: '120px' },
  { key: 'barcode', title: '物料条码', sortable: true, defaultVisible: false, minWidth: '155px' },
  { key: 'outsourcingVendor', title: '委外厂家', sortable: true, defaultVisible: false, minWidth: '180px' },
  { key: 'org', title: '组织机构', sortable: true, defaultVisible: false, minWidth: '175px' },
  { key: 'createdAt', title: '创建时间', sortable: true, defaultVisible: false, minWidth: '165px' },
];

const ORGS = [
  '昇兴集团-中山制罐工厂',
  '昇兴集团-福建制罐工厂',
  '昇兴集团-山东制罐工厂',
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function fmtNum(n: number): string {
  const r = round2(n);
  if (Object.is(r, -0) || r === 0) return '0';
  return String(r);
}

// Build 820 realistic records:
// Rows 1..10 match the reference screenshot verbatim;
// All 820 rows sum cleanly to 总重量 = 630017.51, 皮重 = 72.1, 不良品重 = 0, 净重 = 630221.61.
function buildInitialReceiptRecords(): OutsourcingReceiptRecord[] {
  const fixedTen: Array<{
    accumulatedQty: number;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    poNo: string;
    createdAt: string;
  }> = [
    { accumulatedQty: 22177, grossWeight: 818, tareWeight: 0, netWeight: 818, poNo: '4500038210', createdAt: '2026-11-18 14:22:10' },
    { accumulatedQty: 22177, grossWeight: 1007.5, tareWeight: 0, netWeight: 1007.5, poNo: '4500038210', createdAt: '2026-11-18 14:19:05' },
    { accumulatedQty: 22177, grossWeight: 997.2, tareWeight: 0, netWeight: 997.2, poNo: '4500038210', createdAt: '2026-11-18 14:16:48' },
    { accumulatedQty: 12899, grossWeight: 1002.3, tareWeight: -6.1, netWeight: 996.2, poNo: '4500038196', createdAt: '2026-11-18 11:05:32' },
    { accumulatedQty: 12899, grossWeight: 1064.7, tareWeight: 0, netWeight: 1064.7, poNo: '4500038196', createdAt: '2026-11-18 11:02:18' },
    { accumulatedQty: 12899, grossWeight: 1054.4, tareWeight: 0, netWeight: 1054.4, poNo: '4500038196', createdAt: '2026-11-18 10:58:44' },
    { accumulatedQty: 12899, grossWeight: 994.5, tareWeight: 0, netWeight: 994.5, poNo: '4500038196', createdAt: '2026-11-18 10:55:19' },
    { accumulatedQty: 12899, grossWeight: 1059.8, tareWeight: 0, netWeight: 1059.8, poNo: '4500038196', createdAt: '2026-11-18 10:51:07' },
    { accumulatedQty: 12899, grossWeight: 1090.8, tareWeight: 0, netWeight: 1090.8, poNo: '4500038196', createdAt: '2026-11-18 10:47:53' },
    { accumulatedQty: 12899, grossWeight: 1003.6, tareWeight: 0, netWeight: 1003.6, poNo: '4500038196', createdAt: '2026-11-18 10:44:12' },
  ];

  const rows: OutsourcingReceiptRecord[] = fixedTen.map((r, idx) => ({
    id: `or-${String(idx + 1).padStart(4, '0')}`,
    org: '昇兴集团-中山制罐工厂',
    materialCode: '40002213',
    materialName: '铜线 Φ1.2',
    outsourcingVendor: '贵溪市智泽始创铜制品有限公司',
    barcode: `TX20261118${String(1001 + idx)}`,
    poNo: r.poNo,
    createdAt: r.createdAt,
    supplierName: '贵溪市智泽始创铜制品有限公司',
    warehouse: '2110',
    accumulatedQty: r.accumulatedQty,
    grossWeight: r.grossWeight,
    tareWeight: r.tareWeight,
    defectWeight: null,
    netWeight: r.netWeight,
  }));

  const targetGross = 630017.51;
  const targetTare = 72.1;
  const targetNet = 630221.61;

  let remGross = round2(targetGross - rows.reduce((s, r) => s + r.grossWeight, 0));
  let remTare = round2(targetTare - rows.reduce((s, r) => s + r.tareWeight, 0));
  let remNet = round2(targetNet - rows.reduce((s, r) => s + r.netWeight, 0));

  const totalRows = 820;
  const extraCount = totalRows - rows.length; // 810

  const suppliers = [
    '贵溪市智泽始创铜制品有限公司',
    '贵溪市智泽始创铜制品有限公司',
    '贵溪市智泽始创铜制品有限公司',
    '江铜铜材有限公司',
    '瑞达铜材加工有限公司',
  ];
  const warehouses = ['2110', '2110', '2110', '2120', '2130'];
  const materials = [
    { code: '40002213', name: '铜线 Φ1.2' },
    { code: '40002215', name: '铜线 Φ1.5' },
    { code: '40002218', name: '铜线 Φ1.6' },
  ];
  const accQtys = [22177, 12899, 18450, 15620, 9840, 26310];

  const grossVariations = [
    725.4, 768.2, 812.6, 745.8, 790.5, 698.3, 824.1, 756.9, 779.4, 748.2,
  ];
  // Distribute tare adjustments across a few early rows so tare totals exactly 72.1
  const tareMap: Record<number, number> = {
    3: 12.5,
    11: 18.2,
    24: 15.0,
    37: 14.5,
    52: 18.0,
  };

  for (let i = 0; i < extraCount; i++) {
    const seq = i + 11;
    const isLast = i === extraCount - 1;
    const sup = suppliers[i % suppliers.length];
    const wh = warehouses[i % warehouses.length];
    const mat = materials[i % materials.length];
    const acc = accQtys[Math.floor(i / 15) % accQtys.length];

    const month = i < 480 ? 11 : 10;
    const day =
      month === 11
        ? 18 - (Math.floor(i / 28) % 18)
        : 31 - (Math.floor((i - 480) / 14) % 28);
    const hour = 8 + ((i * 5) % 10);
    const min = (i * 7) % 60;
    const sec = (i * 11) % 60;
    const createdAt = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(
      2,
      '0'
    )} ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(
      sec
    ).padStart(2, '0')}`;

    let gross: number;
    let tare: number;
    let net: number;

    if (isLast) {
      gross = round2(remGross);
      tare = round2(remTare);
      net = round2(remNet);
    } else {
      gross = grossVariations[i % grossVariations.length];
      tare = tareMap[i] ?? 0;
      net = round2(gross + (i < 4 ? 68 : 0)); // Slight net reconciliation offset on 4 legacy rows so net totals 630221.61 cleanly
      remGross = round2(remGross - gross);
      remTare = round2(remTare - tare);
      remNet = round2(remNet - net);
    }

    rows.push({
      id: `or-${String(seq).padStart(4, '0')}`,
      org: ORGS[i % 10 === 0 ? 1 : 0],
      materialCode: mat.code,
      materialName: mat.name,
      outsourcingVendor: sup,
      barcode: `TX2026${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}${String(
        1000 + seq
      )}`,
      poNo: `45000${38190 - Math.floor(i / 12)}`,
      createdAt,
      supplierName: sup,
      warehouse: wh,
      accumulatedQty: acc,
      grossWeight: gross,
      tareWeight: tare,
      defectWeight: null,
      netWeight: net,
    });
  }

  return rows;
}

const INITIAL_RECEIPT_RECORDS = buildInitialReceiptRecords();

function matchText(source: string, query: string, op: MatchOp): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const s = source.toLowerCase();
  if (op === 'equals') return s === q;
  if (op === 'notContains') return !s.includes(q);
  return s.includes(q);
}

function matchNumeric(value: number, query: string, op: NumOp): boolean {
  const q = query.trim();
  if (!q) return true;
  const target = parseFloat(q);
  if (Number.isNaN(target)) return true;
  switch (op) {
    case '=':
      return Math.abs(value - target) < 0.0001;
    case '>':
      return value > target;
    case '>=':
      return value >= target;
    case '<':
      return value < target;
    case '<=':
      return value <= target;
    case '!=':
      return Math.abs(value - target) >= 0.0001;
    default:
      return true;
  }
}

function buildPaginationItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', total];
  }
  if (current >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export const CopperOutsourcingReceiptTab: React.FC<CopperOutsourcingReceiptTabProps> = ({
  onShowToast,
}) => {
  // Draft filter inputs (matching all 9 fields in reference screenshot)
  const [org, setOrg] = useState<string>('');
  const [matCodeOp, setMatCodeOp] = useState<MatchOp>('contains');
  const [matCodeVal, setMatCodeVal] = useState<string>('');
  const [matNameOp, setMatNameOp] = useState<MatchOp>('contains');
  const [matNameVal, setMatNameVal] = useState<string>('');
  const [vendorOp, setVendorOp] = useState<MatchOp>('contains');
  const [vendorVal, setVendorVal] = useState<string>('');
  const [barcodeOp, setBarcodeOp] = useState<MatchOp>('contains');
  const [barcodeVal, setBarcodeVal] = useState<string>('');
  const [poOp, setPoOp] = useState<MatchOp>('contains');
  const [poVal, setPoVal] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [supplierOp, setSupplierOp] = useState<MatchOp>('contains');
  const [supplierVal, setSupplierVal] = useState<string>('');
  const [grossOp, setGrossOp] = useState<NumOp>('=');
  const [grossVal, setGrossVal] = useState<string>('');

  // Applied filter state
  const [applied, setApplied] = useState({
    org: '',
    matCodeOp: 'contains' as MatchOp,
    matCodeVal: '',
    matNameOp: 'contains' as MatchOp,
    matNameVal: '',
    vendorOp: 'contains' as MatchOp,
    vendorVal: '',
    barcodeOp: 'contains' as MatchOp,
    barcodeVal: '',
    poOp: 'contains' as MatchOp,
    poVal: '',
    dateFrom: '',
    dateTo: '',
    supplierOp: 'contains' as MatchOp,
    supplierVal: '',
    grossOp: '=' as NumOp,
    grossVal: '',
  });

  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  const [sortKey, setSortKey] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [detailRow, setDetailRow] = useState<OutsourcingReceiptRecord | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpInput, setJumpInput] = useState<string>('');

  const [visibleMap, setVisibleMap] = useState<Record<ColKey, boolean>>(() => {
    const m = {} as Record<ColKey, boolean>;
    COLUMNS.forEach((c) => {
      m[c.key] = c.defaultVisible;
    });
    return m;
  });
  const [colSettingsOpen, setColSettingsOpen] = useState<boolean>(false);

  const visibleCols = useMemo(
    () => COLUMNS.filter((c) => visibleMap[c.key]),
    [visibleMap]
  );

  const filteredRecords = useMemo(() => {
    let list = INITIAL_RECEIPT_RECORDS.filter((r) => {
      if (applied.org && r.org !== applied.org) return false;
      if (!matchText(r.materialCode, applied.matCodeVal, applied.matCodeOp)) return false;
      if (!matchText(r.materialName, applied.matNameVal, applied.matNameOp)) return false;
      if (!matchText(r.outsourcingVendor, applied.vendorVal, applied.vendorOp)) return false;
      if (!matchText(r.barcode, applied.barcodeVal, applied.barcodeOp)) return false;
      if (!matchText(r.poNo, applied.poVal, applied.poOp)) return false;
      if (!matchText(r.supplierName, applied.supplierVal, applied.supplierOp)) return false;
      if (!matchNumeric(r.grossWeight, applied.grossVal, applied.grossOp)) return false;
      const datePart = r.createdAt.slice(0, 10);
      if (applied.dateFrom && datePart < applied.dateFrom) return false;
      if (applied.dateTo && datePart > applied.dateTo) return false;
      return true;
    });

    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') {
          return (av - bv) * dir;
        }
        return String(av ?? '').localeCompare(String(bv ?? ''), 'zh-CN') * dir;
      });
    }
    return list;
  }, [applied, sortKey, sortDir]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  const totals = useMemo(() => {
    let gross = 0;
    let tare = 0;
    let defect = 0;
    let net = 0;
    for (const r of filteredRecords) {
      gross += r.grossWeight;
      tare += r.tareWeight;
      defect += r.defectWeight ?? 0;
      net += r.netWeight;
    }
    return {
      gross: round2(gross),
      tare: round2(tare),
      defect: round2(defect),
      net: round2(net),
    };
  }, [filteredRecords]);

  const selectedRecords = useMemo(
    () => filteredRecords.filter((r) => selectedIds[r.id]),
    [filteredRecords, selectedIds]
  );

  const allOnPageSelected =
    pagedRecords.length > 0 && pagedRecords.every((r) => selectedIds[r.id]);

  const handleQuery = () => {
    setApplied({
      org,
      matCodeOp,
      matCodeVal,
      matNameOp,
      matNameVal,
      vendorOp,
      vendorVal,
      barcodeOp,
      barcodeVal,
      poOp,
      poVal,
      dateFrom,
      dateTo,
      supplierOp,
      supplierVal,
      grossOp,
      grossVal,
    });
    setPage(1);
    onShowToast('铜线委外收货明细查询完成', 'success');
  };

  const handleReset = () => {
    setOrg('');
    setMatCodeOp('contains');
    setMatCodeVal('');
    setMatNameOp('contains');
    setMatNameVal('');
    setVendorOp('contains');
    setVendorVal('');
    setBarcodeOp('contains');
    setBarcodeVal('');
    setPoOp('contains');
    setPoVal('');
    setDateFrom('');
    setDateTo('');
    setSupplierOp('contains');
    setSupplierVal('');
    setGrossOp('=');
    setGrossVal('');
    setApplied({
      org: '',
      matCodeOp: 'contains',
      matCodeVal: '',
      matNameOp: 'contains',
      matNameVal: '',
      vendorOp: 'contains',
      vendorVal: '',
      barcodeOp: 'contains',
      barcodeVal: '',
      poOp: 'contains',
      poVal: '',
      dateFrom: '',
      dateTo: '',
      supplierOp: 'contains',
      supplierVal: '',
      grossOp: '=',
      grossVal: '',
    });
    setSortKey(null);
    setPage(1);
    onShowToast('查询条件已重置', 'info');
  };

  const handleSort = (key: ColKey, sortable: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExportCsv = (rowsToExport: OutsourcingReceiptRecord[]) => {
    if (!rowsToExport.length) {
      onShowToast('当前没有可导出的明细记录', 'warning');
      return;
    }
    const headers = [
      '组织机构',
      '采购订单编号',
      '物料料号',
      '物料名称',
      '物料条码',
      '委外厂家',
      '供应商名称',
      '入库仓库',
      '累积已收数量',
      '总重量（kg）',
      '皮重（kg）',
      '不良品重（kg）',
      '净重（kg）',
      '创建时间',
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rowsToExport
      .map((r) =>
        [
          r.org,
          r.poNo,
          r.materialCode,
          r.materialName,
          r.barcode,
          r.outsourcingVendor,
          r.supplierName,
          r.warehouse,
          r.accumulatedQty,
          fmtNum(r.grossWeight),
          fmtNum(r.tareWeight),
          r.defectWeight === null ? '' : fmtNum(r.defectWeight),
          fmtNum(r.netWeight),
          r.createdAt,
        ]
          .map(esc)
          .join(',')
      )
      .join('\n');
    const blob = new Blob(['\ufeff' + headers.join(',') + '\n' + body], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `铜线委外收货明细表-20261119.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`已导出 ${rowsToExport.length} 条委外收货明细 CSV`, 'success');
  };

  const handleJumpPage = () => {
    const n = parseInt(jumpInput.trim(), 10);
    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) {
      setPage(n);
    } else if (jumpInput.trim()) {
      onShowToast(`请输入 1 ~ ${totalPages} 之间的页码`, 'warning');
    }
    setJumpInput('');
  };

  const paginationItems = useMemo(
    () => buildPaginationItems(safePage, totalPages),
    [safePage, totalPages]
  );

  return (
    <div className="space-y-4 relative text-xs text-[#1E293B]">
      {/* Top Query Filter Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        {/* Top Row: Page Title + Inline 组织机构 + Right Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">铜线委外收货明细表</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E40AF] font-medium">组织机构</span>
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="">请选择</option>
                {ORGS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              onClick={() => setColSettingsOpen(true)}
              title="列显示设置与导出"
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              title={filtersExpanded ? '收起筛选条件' : '展开筛选条件'}
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg flex items-center justify-center text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer shrink-0"
            >
              {filtersExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {filtersExpanded && (
          <div className="space-y-2.5 pt-0.5">
            {/* Row 1: 物料料号 / 物料名称 / 委外厂家 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  物料料号
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={matCodeOp}
                    onChange={(e) => setMatCodeOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={matCodeVal}
                    onChange={(e) => setMatCodeVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  物料名称
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={matNameOp}
                    onChange={(e) => setMatNameOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={matNameVal}
                    onChange={(e) => setMatNameVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  委外厂家
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={vendorOp}
                    onChange={(e) => setVendorOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={vendorVal}
                    onChange={(e) => setVendorVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: 物料条码 / 采购订单编号 / 创建时间 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  物料条码
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={barcodeOp}
                    onChange={(e) => setBarcodeOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={barcodeVal}
                    onChange={(e) => setBarcodeVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  采购订单编号
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={poOp}
                    onChange={(e) => setPoOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={poVal}
                    onChange={(e) => setPoVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  创建时间
                </label>
                <div className="flex items-center gap-1 h-8 flex-1 min-w-0 px-2 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="开始日期"
                    className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent flex-1 min-w-0"
                  />
                  <ArrowRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="结束日期"
                    className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent flex-1 min-w-0"
                  />
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 hidden sm:block" />
                </div>
              </div>
            </div>

            {/* Row 3: 供应商名称 / 总重量（kg） */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  供应商名称
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={supplierOp}
                    onChange={(e) => setSupplierOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={supplierVal}
                    onChange={(e) => setSupplierVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  总重量（kg）
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={grossOp}
                    onChange={(e) => setGrossOp(e.target.value as NumOp)}
                    className="h-full px-2.5 text-xs font-mono text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="=">=</option>
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="!=">!=</option>
                  </select>
                  <input
                    type="text"
                    value={grossVal}
                    onChange={(e) => setGrossVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs font-mono text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-2">
            <span>
              已选{' '}
              <strong className="font-mono tabular-nums text-[#1E293B]">
                {selectedRecords.length}
              </strong>{' '}
              项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配{' '}
              <strong className="font-mono tabular-nums text-[#1E293B]">
                {totalCount}
              </strong>{' '}
              条收货明细
            </span>
            {selectedRecords.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#1E40AF]">
                  所选总重 {fmtNum(selectedRecords.reduce((s, r) => s + r.grossWeight, 0))} kg / 净重{' '}
                  {fmtNum(selectedRecords.reduce((s, r) => s + r.netWeight, 0))} kg
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds({})}
                  className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer ml-1"
                >
                  取消勾选
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() =>
                handleExportCsv(
                  selectedRecords.length > 0 ? selectedRecords : filteredRecords
                )
              }
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{selectedRecords.length > 0 ? '导出所选 CSV' : '导出 CSV'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="w-10 p-2.5 text-center border-b border-r border-[#E5E9F0]">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedIds((prev) => {
                        const next = { ...prev };
                        pagedRecords.forEach((r) => {
                          next[r.id] = checked;
                        });
                        return next;
                      });
                    }}
                    className="w-3.5 h-3.5 cursor-pointer accent-[#165DFF] align-middle"
                  />
                </th>

                {visibleCols.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`p-2.5 border-b border-r border-[#E5E9F0] select-none transition ${
                        col.sortable ? 'cursor-pointer hover:bg-[#EDF2F7]/70' : ''
                      }`}
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>{col.title}</span>
                        {col.sortable && (
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              isSorted ? 'text-[#1E40AF]' : 'text-[#C5C8BE]'
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}

                <th className="w-16 p-2.5 border-b border-[#E5E9F0] text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <div className="inline-flex items-center gap-1.5">
                    <span>操作</span>
                    <button
                      type="button"
                      onClick={() => setColSettingsOpen(true)}
                      title="列显示设置"
                      className="text-[#2563EB] hover:text-[#1E293B] cursor-pointer transition"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EDF2F7] text-xs text-[#1E293B]">
              {pagedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleCols.length + 2}
                    className="py-14 text-center text-xs text-[#64748B]"
                  >
                    未查询到符合条件的铜线委外收货明细，请调整查询条件或点击「重置」
                  </td>
                </tr>
              ) : (
                pagedRecords.map((row) => {
                  const isChecked = !!selectedIds[row.id];
                  return (
                    <tr
                      key={row.id}
                      onDoubleClick={() => setDetailRow(row)}
                      className={`transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#EBF2FF]/60 hover:bg-[#EBF2FF]/80'
                          : 'hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <td className="p-2.5 border-r border-[#EDF2F7] text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setSelectedIds((prev) => ({
                              ...prev,
                              [row.id]: e.target.checked,
                            }))
                          }
                          className="w-3.5 h-3.5 cursor-pointer accent-[#165DFF] align-middle"
                        />
                      </td>

                      {visibleCols.map((col) => {
                        let display = '';
                        if (col.key === 'grossWeight' || col.key === 'tareWeight' || col.key === 'netWeight') {
                          display = fmtNum(row[col.key]);
                        } else if (col.key === 'defectWeight') {
                          display = row.defectWeight === null ? '' : fmtNum(row.defectWeight);
                        } else if (col.key === 'accumulatedQty') {
                          display = String(row.accumulatedQty);
                        } else {
                          display = String(row[col.key] ?? '');
                        }

                        const isMono =
                          col.isNumeric ||
                          col.key === 'warehouse' ||
                          col.key === 'poNo' ||
                          col.key === 'materialCode' ||
                          col.key === 'barcode' ||
                          col.key === 'createdAt';

                        return (
                          <td
                            key={col.key}
                            className={`p-2.5 border-r border-[#EDF2F7] whitespace-nowrap ${
                              isMono ? 'font-mono tabular-nums' : ''
                            } ${
                              col.key === 'netWeight' ? 'font-bold text-[#1E40AF]' : ''
                            }`}
                          >
                            {display}
                          </td>
                        );
                      })}

                      <td
                        className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isChecked ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setDetailRow(row)}
                          title="查看单据详情"
                          className="inline-flex items-center gap-1 text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>详情</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Summary Footer Row */}
            <tfoot>
              <tr className="bg-[#F4F6F9] border-t border-[#E5E9F0] text-xs font-semibold text-[#1E40AF]">
                <td className="p-2.5 border-r border-[#E5E9F0]" />
                {visibleCols.map((col) => {
                  let footerText = '';
                  if (col.key === 'grossWeight') {
                    footerText = `合计：${fmtNum(totals.gross)}`;
                  } else if (col.key === 'tareWeight') {
                    footerText = `合计：${fmtNum(totals.tare)}`;
                  } else if (col.key === 'defectWeight') {
                    footerText = `合计：${fmtNum(totals.defect)}`;
                  } else if (col.key === 'netWeight') {
                    footerText = `合计：${fmtNum(totals.net)}`;
                  }
                  return (
                    <td
                      key={col.key}
                      className="p-2.5 whitespace-nowrap border-r border-[#E5E9F0] font-mono tabular-nums"
                    >
                      {footerText}
                    </td>
                  );
                })}
                <td className="p-2.5 sticky right-0 bg-[#F4F6F9]" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Bar (工单管理风格) */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计{' '}
            <strong className="font-mono tabular-nums text-[#1E293B]">
              {totalCount}
            </strong>{' '}
            条
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              title="上一页"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {paginationItems.map((item, idx) =>
              item === 'ellipsis' ? (
                <span
                  key={`el-${idx}`}
                  className="px-1.5 text-[#94A3B8] select-none font-mono"
                >
                  ···
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-lg border font-mono tabular-nums transition cursor-pointer ${
                    item === safePage
                      ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                      : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:border-[#2563EB]'
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              title="下一页"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-7 px-2 border border-[#E5E9F0] rounded-lg bg-white text-xs text-[#1E293B] outline-none cursor-pointer"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
            <option value={100}>100 条/页</option>
          </select>

          <div className="flex items-center gap-1.5">
            <span>跳至</span>
            <input
              type="text"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJumpPage();
              }}
              onBlur={handleJumpPage}
              className="w-11 h-7 px-1.5 text-center font-mono tabular-nums border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB]"
            />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* Record Detail Drawer */}
      {detailRow && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40"
          onClick={() => setDetailRow(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#E5E9F0] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">
                铜线委外收货明细详情
              </span>
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5 text-xs">
              {[
                ['组织机构', detailRow.org],
                ['供应商名称', detailRow.supplierName],
                ['委外厂家', detailRow.outsourcingVendor],
                ['入库仓库', detailRow.warehouse],
                ['采购订单编号', detailRow.poNo],
                ['物料料号', detailRow.materialCode],
                ['物料名称', detailRow.materialName],
                ['物料条码', detailRow.barcode],
                ['累积已收数量', String(detailRow.accumulatedQty)],
                ['总重量（kg）', fmtNum(detailRow.grossWeight)],
                ['皮重（kg）', fmtNum(detailRow.tareWeight)],
                [
                  '不良品重（kg）',
                  detailRow.defectWeight === null ? '0' : fmtNum(detailRow.defectWeight),
                ],
                ['净重（kg）', fmtNum(detailRow.netWeight)],
                ['创建时间', detailRow.createdAt],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3 py-2 border-b border-[#F1F5F9]"
                >
                  <span className="text-[#64748B] shrink-0">{label}</span>
                  <span className="text-[#0F172A] font-medium font-mono text-right break-all">
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end">
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="px-4 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded hover:bg-[#1E40AF] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Visibility & Export Settings Modal */}
      {colSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
          onClick={() => setColSettingsOpen(false)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">
                表格列显示与导出设置
              </span>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {COLUMNS.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#EEF2F7] hover:bg-[#F8FAFC] text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleMap[c.key]}
                    onChange={(e) =>
                      setVisibleMap((prev) => ({
                        ...prev,
                        [c.key]: e.target.checked,
                      }))
                    }
                    className="rounded-xs border-[#CBD5E1] accent-[#165DFF]"
                  />
                  <span className="text-[#1E293B] truncate">{c.title}</span>
                </label>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const m = {} as Record<ColKey, boolean>;
                    COLUMNS.forEach((c) => {
                      m[c.key] = c.defaultVisible;
                    });
                    setVisibleMap(m);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:text-[#165DFF] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>恢复默认列</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportCsv(filteredRecords);
                    setColSettingsOpen(false);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#165DFF] bg-[#EFF6FF] border border-[#BFDBFE] rounded hover:bg-[#DBEAFE] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出全部 CSV</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded hover:bg-[#1E40AF] cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
