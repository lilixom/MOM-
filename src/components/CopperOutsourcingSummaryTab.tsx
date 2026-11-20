import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  RotateCcw,
  Settings,
  X,
} from 'lucide-react';

interface CopperOutsourcingSummaryTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals' | 'notContains';
type NumOp = '=' | '>' | '>=' | '<' | '<=' | '!=';

interface OutsourcingSummaryRecord {
  id: string;
  org: string;
  materialCode: string;
  materialName: string;
  outsourcingVendor: string;
  supplierName: string;
  poNo: string;
  accumulatedQty: number | null;
  grossWeight: number;
  outWarehouse: string;
  shipmentPieces: number;
  createdAt: string;
}

type ColKey =
  | 'outsourcingVendor'
  | 'supplierName'
  | 'poNo'
  | 'accumulatedQty'
  | 'grossWeight'
  | 'outWarehouse'
  | 'shipmentPieces'
  | 'createdAt'
  | 'materialCode'
  | 'materialName'
  | 'org';

interface ColDef {
  key: ColKey;
  title: string;
  sortable: boolean;
  defaultVisible: boolean;
  minWidth: string;
  isNumeric?: boolean;
}

const COLUMNS: ColDef[] = [
  { key: 'outsourcingVendor', title: '委外厂家', sortable: true, defaultVisible: true, minWidth: '105px' },
  { key: 'supplierName', title: '供应商名称', sortable: true, defaultVisible: true, minWidth: '205px' },
  { key: 'poNo', title: '采购订单编号', sortable: true, defaultVisible: true, minWidth: '130px' },
  { key: 'accumulatedQty', title: '累积已收数量', sortable: true, defaultVisible: true, minWidth: '120px', isNumeric: true },
  { key: 'grossWeight', title: '总重量（kg）', sortable: true, defaultVisible: true, minWidth: '130px', isNumeric: true },
  { key: 'outWarehouse', title: '出库仓库', sortable: true, defaultVisible: true, minWidth: '105px' },
  { key: 'shipmentPieces', title: '发货件数', sortable: true, defaultVisible: true, minWidth: '100px', isNumeric: true },
  { key: 'createdAt', title: '创建时间', sortable: true, defaultVisible: true, minWidth: '162px' },
  { key: 'materialCode', title: '物料料号', sortable: true, defaultVisible: false, minWidth: '115px' },
  { key: 'materialName', title: '物料名称', sortable: true, defaultVisible: false, minWidth: '120px' },
  { key: 'org', title: '组织机构', sortable: true, defaultVisible: false, minWidth: '175px' },
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

// Build 299 records: rows 1..10 match the reference screenshot verbatim;
// All 299 rows sum to 总重量（kg）= 1230685.71, 发货件数 = 1387.
function buildInitialSummaryRecords(): OutsourcingSummaryRecord[] {
  const fixedTen: Array<{
    supplierName: string;
    poNo: string;
    accumulatedQty: number | null;
    grossWeight: number;
    shipmentPieces: number;
    createdAt: string;
  }> = [
    { supplierName: '东莞市永晖焊材有限公司', poNo: '5500002938', accumulatedQty: 18595, grossWeight: 3303.4, shipmentPieces: 3, createdAt: '2026-11-13 15:24:10' },
    { supplierName: '东莞市永晖焊材有限公司', poNo: '5500002938', accumulatedQty: 36361, grossWeight: 4050.4, shipmentPieces: 4, createdAt: '2026-11-13 14:18:22' },
    { supplierName: '贵溪市智泽始创铜制品有限公司', poNo: '5500003028', accumulatedQty: null, grossWeight: 6173.2, shipmentPieces: 7, createdAt: '2026-11-11 16:40:05' },
    { supplierName: '贵溪市智泽始创铜制品有限公司', poNo: '5500003011', accumulatedQty: 22177, grossWeight: 2822.7, shipmentPieces: 2, createdAt: '2026-11-11 11:32:18' },
    { supplierName: '贵溪市智泽始创铜制品有限公司', poNo: '5500003011', accumulatedQty: 41213, grossWeight: 7054.6, shipmentPieces: 5, createdAt: '2026-11-11 10:15:42' },
    { supplierName: '贵溪市智泽始创铜制品有限公司', poNo: '5500003011', accumulatedQty: 12899, grossWeight: 9278.1, shipmentPieces: 9, createdAt: '2026-11-04 16:08:30' },
    { supplierName: '贵溪市智泽始创铜制品有限公司', poNo: '5500003011', accumulatedQty: 23010, grossWeight: 8924.8, shipmentPieces: 6, createdAt: '2026-11-04 14:52:11' },
    { supplierName: '东莞市永晖焊材有限公司', poNo: '5500002938', accumulatedQty: 12807, grossWeight: 5787.7, shipmentPieces: 6, createdAt: '2026-11-02 15:40:19' },
    { supplierName: '东莞市永晖焊材有限公司', poNo: '5500002938', accumulatedQty: 24522, grossWeight: 6051.1, shipmentPieces: 6, createdAt: '2026-11-02 11:22:08' },
    { supplierName: '贵溪市智泽始创铜制品有限公司', poNo: '5500003011', accumulatedQty: 13349, grossWeight: 9660.8, shipmentPieces: 8, createdAt: '2026-10-28 16:10:55' },
  ];

  const rows: OutsourcingSummaryRecord[] = fixedTen.map((r, idx) => ({
    id: `os-${String(idx + 1).padStart(3, '0')}`,
    org: '昇兴集团-中山制罐工厂',
    materialCode: idx % 2 === 0 ? '40002213' : '40002218',
    materialName: idx % 2 === 0 ? '铜线 Φ1.2' : '铜针 Φ2.0',
    outsourcingVendor: '',
    supplierName: r.supplierName,
    poNo: r.poNo,
    accumulatedQty: r.accumulatedQty,
    grossWeight: r.grossWeight,
    outWarehouse: '2110',
    shipmentPieces: r.shipmentPieces,
    createdAt: r.createdAt,
  }));

  const targetGross = 1230685.71;
  const targetPieces = 1387;
  const totalCount = 299;
  const extraCount = totalCount - rows.length; // 289

  let remGross = round2(targetGross - rows.reduce((s, r) => s + r.grossWeight, 0));
  let remPieces = targetPieces - rows.reduce((s, r) => s + r.shipmentPieces, 0); // 1331

  const suppliers = [
    '贵溪市智泽始创铜制品有限公司',
    '东莞市永晖焊材有限公司',
    '贵溪市智泽始创铜制品有限公司',
    '江铜铜材有限公司',
  ];
  const poNos = ['5500003011', '5500002938', '5500003028', '5500002915', '5500002890'];
  const weightPattern = [3620.5, 4215.8, 3890.2, 4480.6, 3955.4, 4120.0, 3760.8, 4345.2];
  const piecesPattern = [4, 5, 4, 5, 5, 4, 5, 5];

  for (let i = 0; i < extraCount; i++) {
    const seq = i + 11;
    const isLast = i === extraCount - 1;
    const sup = suppliers[i % suppliers.length];
    const po = poNos[i % poNos.length];

    const monthsBack = Math.floor(i / 65);
    const month = Math.max(1, 10 - monthsBack);
    const day = Math.max(1, 27 - (i % 26));
    const hour = 9 + (i % 9);
    const min = (i * 11) % 60;
    const sec = (i * 17) % 60;
    const createdAt = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(
      2,
      '0'
    )} ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(
      sec
    ).padStart(2, '0')}`;

    let gross: number;
    let pieces: number;
    if (isLast) {
      gross = round2(remGross);
      pieces = remPieces;
    } else {
      gross = weightPattern[i % weightPattern.length];
      pieces = piecesPattern[i % piecesPattern.length];
      // Prevent remPieces from dropping below remaining count
      const leftAfter = extraCount - 1 - i;
      if (remPieces - pieces < leftAfter) {
        pieces = Math.max(1, remPieces - leftAfter);
      }
      remGross = round2(remGross - gross);
      remPieces -= pieces;
    }

    rows.push({
      id: `os-${String(seq).padStart(3, '0')}`,
      org: ORGS[i % 9 === 0 ? 1 : 0],
      materialCode: i % 3 === 0 ? '40002218' : '40002213',
      materialName: i % 3 === 0 ? '铜针 Φ2.0' : '铜线 Φ1.2',
      outsourcingVendor: i % 5 === 0 ? sup : '',
      supplierName: sup,
      poNo: po,
      accumulatedQty: 12000 + ((i * 1373) % 29000),
      grossWeight: gross,
      outWarehouse: i % 8 === 0 ? '2120' : '2110',
      shipmentPieces: pieces,
      createdAt,
    });
  }

  return rows;
}

const INITIAL_SUMMARY_RECORDS = buildInitialSummaryRecords();

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

export const CopperOutsourcingSummaryTab: React.FC<CopperOutsourcingSummaryTabProps> = ({
  onShowToast,
}) => {
  // Draft filter inputs (exact 9 filters from screenshot)
  const [org, setOrg] = useState<string>('');
  const [matCodeOp, setMatCodeOp] = useState<MatchOp>('contains');
  const [matCodeVal, setMatCodeVal] = useState<string>('');
  const [matNameOp, setMatNameOp] = useState<MatchOp>('contains');
  const [matNameVal, setMatNameVal] = useState<string>('');
  const [vendorOp, setVendorOp] = useState<MatchOp>('contains');
  const [vendorVal, setVendorVal] = useState<string>('');
  const [whOp, setWhOp] = useState<MatchOp>('contains');
  const [whVal, setWhVal] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [poOp, setPoOp] = useState<MatchOp>('contains');
  const [poVal, setPoVal] = useState<string>('');
  const [supplierOp, setSupplierOp] = useState<MatchOp>('contains');
  const [supplierVal, setSupplierVal] = useState<string>('');
  const [grossOp, setGrossOp] = useState<NumOp>('=');
  const [grossVal, setGrossVal] = useState<string>('');

  const [applied, setApplied] = useState({
    org: '',
    matCodeOp: 'contains' as MatchOp,
    matCodeVal: '',
    matNameOp: 'contains' as MatchOp,
    matNameVal: '',
    vendorOp: 'contains' as MatchOp,
    vendorVal: '',
    whOp: 'contains' as MatchOp,
    whVal: '',
    dateFrom: '',
    dateTo: '',
    poOp: 'contains' as MatchOp,
    poVal: '',
    supplierOp: 'contains' as MatchOp,
    supplierVal: '',
    grossOp: '=' as NumOp,
    grossVal: '',
  });

  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  const [sortKey, setSortKey] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Pre-select row 5 matching screenshot highlight
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({
    'os-005': true,
  });
  const [detailRow, setDetailRow] = useState<OutsourcingSummaryRecord | null>(null);

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
    let list = INITIAL_SUMMARY_RECORDS.filter((r) => {
      if (applied.org && r.org !== applied.org) return false;
      if (!matchText(r.materialCode, applied.matCodeVal, applied.matCodeOp)) return false;
      if (!matchText(r.materialName, applied.matNameVal, applied.matNameOp)) return false;
      if (!matchText(r.outsourcingVendor || r.supplierName, applied.vendorVal, applied.vendorOp)) return false;
      if (!matchText(r.outWarehouse, applied.whVal, applied.whOp)) return false;
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
    let pieces = 0;
    for (const r of filteredRecords) {
      gross += r.grossWeight;
      pieces += r.shipmentPieces;
    }
    return {
      gross: round2(gross),
      pieces,
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
      whOp,
      whVal,
      dateFrom,
      dateTo,
      poOp,
      poVal,
      supplierOp,
      supplierVal,
      grossOp,
      grossVal,
    });
    setPage(1);
    onShowToast('铜线委外收发货汇总查询完成', 'success');
  };

  const handleReset = () => {
    setOrg('');
    setMatCodeOp('contains');
    setMatCodeVal('');
    setMatNameOp('contains');
    setMatNameVal('');
    setVendorOp('contains');
    setVendorVal('');
    setWhOp('contains');
    setWhVal('');
    setDateFrom('');
    setDateTo('');
    setPoOp('contains');
    setPoVal('');
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
      whOp: 'contains',
      whVal: '',
      dateFrom: '',
      dateTo: '',
      poOp: 'contains',
      poVal: '',
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

  const handleExportCsv = (rowsToExport: OutsourcingSummaryRecord[]) => {
    if (!rowsToExport.length) {
      onShowToast('当前没有可导出的汇总记录', 'warning');
      return;
    }
    const headers = [
      '组织机构',
      '委外厂家',
      '供应商名称',
      '采购订单编号',
      '物料料号',
      '物料名称',
      '累积已收数量',
      '总重量（kg）',
      '出库仓库',
      '发货件数',
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
          r.outsourcingVendor,
          r.supplierName,
          r.poNo,
          r.materialCode,
          r.materialName,
          r.accumulatedQty === null ? '' : r.accumulatedQty,
          fmtNum(r.grossWeight),
          r.outWarehouse,
          r.shipmentPieces,
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
    a.download = `铜线委外收发货汇总表-20261119.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`已导出 ${rowsToExport.length} 条委外收发货汇总 CSV`, 'success');
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
    <div className="space-y-3">
      {/* Top Query Filter Card (exact 6-row layout from screenshot) */}
      <div className="bg-white border border-[#E5E9F0] rounded-lg px-4 py-3.5 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-3">
          <div className="flex-1 space-y-2.5 min-w-0">
            {/* Row 1: 组织机构 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                  组织机构
                </label>
                <select
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="h-8 flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white border border-[#D9E1EC] rounded-sm outline-none focus:border-[#165DFF] transition"
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

            {filtersExpanded && (
              <>
                {/* Row 2: 物料料号 / 物料名称 / 委外厂家 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      物料料号
                    </label>
                    <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition overflow-hidden">
                      <select
                        value={matCodeOp}
                        onChange={(e) => setMatCodeOp(e.target.value as MatchOp)}
                        className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#E5E9F0] outline-none shrink-0"
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
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      物料名称
                    </label>
                    <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition overflow-hidden">
                      <select
                        value={matNameOp}
                        onChange={(e) => setMatNameOp(e.target.value as MatchOp)}
                        className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#E5E9F0] outline-none shrink-0"
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
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      委外厂家
                    </label>
                    <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition overflow-hidden">
                      <select
                        value={vendorOp}
                        onChange={(e) => setVendorOp(e.target.value as MatchOp)}
                        className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#E5E9F0] outline-none shrink-0"
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

                {/* Row 3: 出库仓库 / 创建时间 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      出库仓库
                    </label>
                    <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition overflow-hidden">
                      <select
                        value={whOp}
                        onChange={(e) => setWhOp(e.target.value as MatchOp)}
                        className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#E5E9F0] outline-none shrink-0"
                      >
                        <option value="contains">包含</option>
                        <option value="equals">等于</option>
                        <option value="notContains">不包含</option>
                      </select>
                      <input
                        type="text"
                        value={whVal}
                        onChange={(e) => setWhVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuery();
                        }}
                        placeholder="请输入"
                        className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      创建时间
                    </label>
                    <div className="flex items-center gap-1 h-8 flex-1 min-w-0 px-2 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition">
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

                {/* Row 4: 采购订单编号 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      采购订单编号
                    </label>
                    <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition overflow-hidden">
                      <select
                        value={poOp}
                        onChange={(e) => setPoOp(e.target.value as MatchOp)}
                        className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#E5E9F0] outline-none shrink-0"
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
                </div>

                {/* Row 5: 供应商名称 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      供应商名称
                    </label>
                    <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition overflow-hidden">
                      <select
                        value={supplierOp}
                        onChange={(e) => setSupplierOp(e.target.value as MatchOp)}
                        className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#E5E9F0] outline-none shrink-0"
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
                </div>

                {/* Row 6: 总重量（kg） */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      总重量（kg）
                    </label>
                    <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-sm bg-white focus-within:border-[#165DFF] transition overflow-hidden">
                      <select
                        value={grossOp}
                        onChange={(e) => setGrossOp(e.target.value as NumOp)}
                        className="h-full px-2.5 text-xs font-mono text-[#475569] bg-white border-r border-[#E5E9F0] outline-none shrink-0"
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
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0 self-end xl:self-start">
            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-4 text-xs font-medium text-[#334155] bg-white border border-[#D9E1EC] rounded-sm hover:bg-[#F8FAFC] hover:border-[#B8C4D4] transition cursor-pointer whitespace-nowrap shrink-0"
            >
              重置
            </button>
            <button
              type="button"
              onClick={handleQuery}
              className="h-8 px-4 text-xs font-medium text-white bg-[#165DFF] hover:bg-[#1E40AF] rounded-sm transition cursor-pointer whitespace-nowrap shrink-0"
            >
              查询
            </button>
            <button
              type="button"
              onClick={() => setColSettingsOpen(true)}
              title="列显示设置与导出"
              className="h-8 w-8 flex items-center justify-center text-[#475569] bg-white border border-[#D9E1EC] rounded-sm hover:bg-[#F8FAFC] hover:text-[#165DFF] transition cursor-pointer shrink-0"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              title={filtersExpanded ? '收起筛选条件' : '展开筛选条件'}
              className="h-8 w-7 flex items-center justify-center text-[#475569] hover:text-[#165DFF] transition cursor-pointer shrink-0"
            >
              {filtersExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Compact Selection Bar */}
      {selectedRecords.length > 0 && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[#1E3A8A]">
            <span className="font-semibold font-mono tabular-nums">
              已勾选 {selectedRecords.length} 条记录
            </span>
            <span className="font-mono tabular-nums text-[#2563EB]">
              所选总重量：{fmtNum(selectedRecords.reduce((s, r) => s + r.grossWeight, 0))} kg
            </span>
            <span className="font-mono tabular-nums text-[#2563EB]">
              所选发货件数：{selectedRecords.reduce((s, r) => s + r.shipmentPieces, 0)} 件
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCsv(selectedRecords)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#165DFF] text-white rounded hover:bg-[#1E40AF] cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出所选 CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds({})}
              className="px-2.5 py-1 text-xs font-medium text-[#475569] bg-white border border-[#DCE3EE] rounded hover:bg-[#F8FAFC] cursor-pointer whitespace-nowrap"
            >
              取消勾选
            </button>
          </div>
        </div>
      )}

      {/* Main Summary Table Card */}
      <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E9F0] text-xs font-medium text-[#334155]">
                <th className="w-12 px-3 py-3 text-center border-r border-[#F0F2F5]">
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
                    className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] cursor-pointer accent-[#165DFF]"
                  />
                </th>

                {visibleCols.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`px-3.5 py-3 whitespace-nowrap border-r border-[#F0F2F5] select-none ${
                        col.sortable ? 'cursor-pointer hover:text-[#165DFF]' : ''
                      }`}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>{col.title}</span>
                        {col.sortable && (
                          <span className="inline-flex flex-col leading-none text-[8px]">
                            <span
                              className={
                                isSorted && sortDir === 'asc'
                                  ? 'text-[#165DFF]'
                                  : 'text-[#B8C2CC]'
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={`-mt-0.5 ${
                                isSorted && sortDir === 'desc'
                                  ? 'text-[#165DFF]'
                                  : 'text-[#B8C2CC]'
                              }`}
                            >
                              ▼
                            </span>
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}

                <th className="w-11 px-2 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setColSettingsOpen(true)}
                    title="列显示设置"
                    className="p-1 text-[#475569] hover:text-[#165DFF] cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEF2F7] text-xs text-[#1E293B]">
              {pagedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleCols.length + 2}
                    className="py-14 text-center text-xs text-[#64748B]"
                  >
                    未查询到符合条件的委外收发货汇总记录，请调整筛选条件或点击「重置」
                  </td>
                </tr>
              ) : (
                pagedRecords.map((row) => {
                  const isChecked = !!selectedIds[row.id];
                  return (
                    <tr
                      key={row.id}
                      onDoubleClick={() => setDetailRow(row)}
                      className={`transition-colors ${
                        isChecked
                          ? 'bg-[#BAE0FF]/85'
                          : 'bg-white hover:bg-[#F5F9FF]'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setSelectedIds((prev) => ({
                              ...prev,
                              [row.id]: e.target.checked,
                            }))
                          }
                          className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] cursor-pointer accent-[#165DFF]"
                        />
                      </td>

                      {visibleCols.map((col) => {
                        let display = '';
                        if (col.key === 'grossWeight') {
                          display = fmtNum(row.grossWeight);
                        } else if (col.key === 'accumulatedQty') {
                          display = row.accumulatedQty === null ? '' : String(row.accumulatedQty);
                        } else {
                          display = String(row[col.key] ?? '');
                        }

                        const isMono =
                          col.isNumeric ||
                          col.key === 'poNo' ||
                          col.key === 'outWarehouse' ||
                          col.key === 'materialCode' ||
                          col.key === 'createdAt';

                        return (
                          <td
                            key={col.key}
                            className={`px-3.5 py-2.5 whitespace-nowrap ${
                              isMono ? 'font-mono tabular-nums' : ''
                            }`}
                          >
                            {display}
                          </td>
                        );
                      })}

                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setDetailRow(row)}
                          title="查看汇总详情"
                          className="p-1 text-[#94A3B8] hover:text-[#165DFF] cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Summary Footer Row matching screenshot: 合计：1230685.71 under 总重量（kg）, 合计：1387 under 发货件数 */}
            <tfoot>
              <tr className="bg-[#FAFAFA] border-t border-[#E5E9F0] text-xs font-medium text-[#1E293B]">
                <td className="px-3 py-2.5 border-r border-[#E5E9F0]" />
                {visibleCols.map((col) => {
                  let footerText = '';
                  if (col.key === 'grossWeight') {
                    footerText = `合计：${fmtNum(totals.gross)}`;
                  } else if (col.key === 'shipmentPieces') {
                    footerText = `合计：${totals.pieces}`;
                  }
                  return (
                    <td
                      key={col.key}
                      className="px-3.5 py-2.5 whitespace-nowrap border-r border-[#E5E9F0] font-mono tabular-nums"
                    >
                      {footerText}
                    </td>
                  );
                })}
                <td className="px-2 py-2.5" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Bar matching screenshot (共计 299 条 < 1 2 3 4 5 ... 30 > 10 条/页 跳至 [ ] 页) */}
        <div className="px-4 py-3 border-t border-[#EEF2F7] bg-white flex flex-wrap items-center justify-end gap-3 text-xs text-[#475569]">
          <span className="font-mono tabular-nums text-[#475569]">
            共计 {totalCount} 条
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-xs text-[#475569] hover:text-[#165DFF] hover:bg-[#F1F5F9] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed transition"
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
                  className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-xs font-mono tabular-nums transition cursor-pointer ${
                    item === safePage
                      ? 'border border-[#165DFF] text-[#165DFF] bg-white font-semibold'
                      : 'text-[#475569] hover:text-[#165DFF] hover:bg-[#F1F5F9]'
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
              className="w-7 h-7 flex items-center justify-center rounded-xs text-[#475569] hover:text-[#165DFF] hover:bg-[#F1F5F9] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed transition"
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
            className="h-7 px-2 border border-[#D9E1EC] rounded-xs bg-white text-xs text-[#334155] outline-none focus:border-[#165DFF]"
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
              className="w-12 h-7 px-1.5 text-center font-mono tabular-nums border border-[#D9E1EC] rounded-xs bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
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
                委外收发货汇总详情
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
                ['委外厂家', detailRow.outsourcingVendor || '—'],
                ['供应商名称', detailRow.supplierName],
                ['采购订单编号', detailRow.poNo],
                ['物料料号', detailRow.materialCode],
                ['物料名称', detailRow.materialName],
                [
                  '累积已收数量',
                  detailRow.accumulatedQty === null ? '—' : String(detailRow.accumulatedQty),
                ],
                ['总重量（kg）', fmtNum(detailRow.grossWeight)],
                ['出库仓库', detailRow.outWarehouse],
                ['发货件数', String(detailRow.shipmentPieces)],
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
