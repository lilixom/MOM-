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
  RotateCcw,
  Scale,
  Search,
  Settings,
  SlidersHorizontal,
  X,
  ZoomIn,
} from 'lucide-react';

interface CopperWeighingRecordTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals' | 'notContains';

interface WeighingRecord {
  id: string;
  org: string;
  orderNo: string;
  materialCode: string;
  materialName: string;
  pieces: number;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  createdAt: string;
  creator: string;
  imageUrl: string;
}

type ColKey =
  | 'orderNo'
  | 'materialCode'
  | 'materialName'
  | 'pieces'
  | 'grossWeight'
  | 'tareWeight'
  | 'netWeight'
  | 'createdAt'
  | 'creator'
  | 'imageUrl';

interface ColDef {
  key: ColKey;
  title: string;
  sortable: boolean;
  align?: 'left' | 'center' | 'right';
  minWidth?: string;
}

const COLUMNS: ColDef[] = [
  { key: 'orderNo', title: '订单号', sortable: true, minWidth: '115px' },
  { key: 'materialCode', title: '物料料号', sortable: true, minWidth: '105px' },
  { key: 'materialName', title: '物料名称', sortable: true, minWidth: '96px' },
  { key: 'pieces', title: '件数', sortable: true, minWidth: '68px' },
  { key: 'grossWeight', title: '总重量', sortable: true, minWidth: '92px' },
  { key: 'tareWeight', title: '皮重（kg）', sortable: true, minWidth: '108px' },
  { key: 'netWeight', title: '净重（kg）', sortable: true, minWidth: '112px' },
  { key: 'createdAt', title: '创建时间', sortable: true, minWidth: '162px' },
  { key: 'creator', title: '创建人', sortable: true, minWidth: '92px' },
  { key: 'imageUrl', title: '图片', sortable: false, align: 'center', minWidth: '340px' },
];

const ORGS = [
  '昇兴集团-中山制罐工厂',
  '昇兴集团-福建制罐工厂',
  '昇兴集团-山东制罐工厂',
];

const MATERIAL_OPTIONS = ['铜线', '不良铜线', '铜针', '不良铜针'];

const PHOTOS = [
  '/assets/weighing/weigh-1.jpg',
  '/assets/weighing/weigh-2.jpg',
  '/assets/weighing/weigh-3.jpg',
  '/assets/weighing/weigh-4.jpg',
  '/assets/weighing/weigh-5.jpg',
];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function fmtNum(n: number): string {
  const r = round1(n);
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

// Build exact 59 records: rows 1..6 match the reference screenshot verbatim,
// and all 59 records sum to 皮重 = 3314, 净重 = 55810.8 (with 总重量 = 皮重 + 净重).
function buildInitialWeighingRecords(): WeighingRecord[] {
  const fixedFirstSix: WeighingRecord[] = [
    {
      id: 'cw-01',
      org: '昇兴集团-中山制罐工厂',
      orderNo: '5500002938',
      materialCode: '40002213',
      materialName: '铜线',
      pieces: 1,
      grossWeight: 1290.5,
      tareWeight: 61,
      netWeight: 1229.5,
      createdAt: '2026-11-12 11:41:14',
      creator: '欧阳妙斯',
      imageUrl: PHOTOS[0],
    },
    {
      id: 'cw-02',
      org: '昇兴集团-中山制罐工厂',
      orderNo: '5500002938',
      materialCode: '40002213',
      materialName: '铜线',
      pieces: 1,
      grossWeight: 1131.6,
      tareWeight: 58.5,
      netWeight: 1073.1,
      createdAt: '2026-11-12 11:41:14',
      creator: '欧阳妙斯',
      imageUrl: PHOTOS[1],
    },
    {
      id: 'cw-03',
      org: '昇兴集团-中山制罐工厂',
      orderNo: '5500002938',
      materialCode: '40002213',
      materialName: '铜线',
      pieces: 1,
      grossWeight: 1064.8,
      tareWeight: 64,
      netWeight: 1000.8,
      createdAt: '2026-11-12 11:41:14',
      creator: '欧阳妙斯',
      imageUrl: PHOTOS[2],
    },
    {
      id: 'cw-04',
      org: '昇兴集团-中山制罐工厂',
      orderNo: '5500002938',
      materialCode: '',
      materialName: '不良铜线',
      pieces: 1,
      grossWeight: 766.4,
      tareWeight: 69.5,
      netWeight: 696.9,
      createdAt: '2026-11-12 11:34:04',
      creator: '欧阳妙斯',
      imageUrl: PHOTOS[3],
    },
    {
      id: 'cw-05',
      org: '昇兴集团-中山制罐工厂',
      orderNo: '5500002938',
      materialCode: '',
      materialName: '不良铜线',
      pieces: 1,
      grossWeight: 843,
      tareWeight: 30,
      netWeight: 813,
      createdAt: '2026-11-12 11:34:04',
      creator: '欧阳妙斯',
      imageUrl: PHOTOS[4],
    },
    {
      id: 'cw-06',
      org: '昇兴集团-中山制罐工厂',
      orderNo: '5500002938',
      materialCode: '',
      materialName: '不良铜线',
      pieces: 1,
      grossWeight: 904.5,
      tareWeight: 50,
      netWeight: 854.5,
      createdAt: '2026-11-12 11:34:04',
      creator: '欧阳妙斯',
      imageUrl: PHOTOS[0],
    },
  ];

  const targetTotalTare = 3314;
  const targetTotalNet = 55810.8;

  const fixedTareSum = fixedFirstSix.reduce((s, r) => s + r.tareWeight, 0); // 333
  const fixedNetSum = fixedFirstSix.reduce((s, r) => s + r.netWeight, 0); // 5667.8

  const remainingCount = 59 - fixedFirstSix.length; // 53
  let remTare = round1(targetTotalTare - fixedTareSum); // 2981.0
  let remNet = round1(targetTotalNet - fixedNetSum); // 50143.0

  const orderNos = [
    '5500002938',
    '5500002941',
    '5500002946',
    '5500002952',
    '5500002960',
    '5500002965',
  ];
  const creators = ['欧阳妙斯', '陈志强', '黄伟明', '李海燕', '周建华'];
  const templates = [
    { code: '40002213', name: '铜线' },
    { code: '', name: '不良铜线' },
    { code: '40002218', name: '铜针' },
    { code: '40002213', name: '铜线' },
    { code: '', name: '不良铜针' },
  ];

  // Deterministic pseudo-random tare/net values for rows 7..58, row 59 absorbs exact remainder
  const extraRows: WeighingRecord[] = [];
  for (let i = 0; i < remainingCount; i++) {
    const idx = i + 7;
    const isLast = i === remainingCount - 1;
    const tpl = templates[i % templates.length];
    const orderNo = orderNos[Math.floor(i / 9) % orderNos.length];
    const creator = i < 18 ? '欧阳妙斯' : creators[i % creators.length];

    const day = 18 - (Math.floor(i / 4) % 16); // 2026-11-03 .. 2026-11-18
    const hour = 8 + ((i * 3) % 10);
    const min = 10 + ((i * 7) % 48);
    const sec = (i * 13) % 60;
    const createdAt = `2026-11-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    let tare: number;
    let net: number;
    if (isLast) {
      tare = round1(remTare);
      net = round1(remNet);
    } else {
      const tareVariations = [48, 52.5, 55, 58.5, 61, 64, 50, 56.5, 60, 54];
      const netVariations = [
        886.5, 942.0, 1024.5, 795.0, 1112.4, 868.2, 975.8, 1048.6, 832.0, 961.5,
      ];
      tare = tareVariations[i % tareVariations.length];
      net = netVariations[i % netVariations.length];
      remTare = round1(remTare - tare);
      remNet = round1(remNet - net);
    }

    const gross = round1(tare + net);

    extraRows.push({
      id: `cw-${String(idx).padStart(2, '0')}`,
      org: '昇兴集团-中山制罐工厂',
      orderNo,
      materialCode: tpl.code,
      materialName: tpl.name,
      pieces: 1,
      grossWeight: gross,
      tareWeight: tare,
      netWeight: net,
      createdAt,
      creator,
      imageUrl: PHOTOS[(i + 1) % PHOTOS.length],
    });
  }

  return [...fixedFirstSix, ...extraRows];
}

const INITIAL_RECORDS = buildInitialWeighingRecords();

function matchString(source: string, query: string, op: MatchOp): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const s = source.toLowerCase();
  if (op === 'equals') return s === q;
  if (op === 'notContains') return !s.includes(q);
  return s.includes(q);
}

export const CopperWeighingRecordTab: React.FC<CopperWeighingRecordTabProps> = ({
  onShowToast,
}) => {
  // Draft filter inputs
  const [org, setOrg] = useState<string>('昇兴集团-中山制罐工厂');
  const [matNameOp, setMatNameOp] = useState<MatchOp>('contains');
  const [matNameVal, setMatNameVal] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('2026-11-01');
  const [dateTo, setDateTo] = useState<string>('2026-11-19');
  const [matCodeOp, setMatCodeOp] = useState<MatchOp>('contains');
  const [matCodeVal, setMatCodeVal] = useState<string>('');
  const [orderNoOp, setOrderNoOp] = useState<MatchOp>('contains');
  const [orderNoVal, setOrderNoVal] = useState<string>('');

  // Applied filters
  const [applied, setApplied] = useState({
    org: '昇兴集团-中山制罐工厂',
    matNameOp: 'contains' as MatchOp,
    matNameVal: '',
    dateFrom: '2026-11-01',
    dateTo: '2026-11-19',
    matCodeOp: 'contains' as MatchOp,
    matCodeVal: '',
    orderNoOp: 'contains' as MatchOp,
    orderNoVal: '',
  });

  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  const [sortKey, setSortKey] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [activeRowId, setActiveRowId] = useState<string>('cw-01');

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpInput, setJumpInput] = useState<string>('');

  const [hiddenCols, setHiddenCols] = useState<Record<ColKey, boolean>>({
    orderNo: false,
    materialCode: false,
    materialName: false,
    pieces: false,
    grossWeight: false,
    tareWeight: false,
    netWeight: false,
    createdAt: false,
    creator: false,
    imageUrl: false,
  });
  const [colSettingsOpen, setColSettingsOpen] = useState<boolean>(false);
  const [previewRecordId, setPreviewRecordId] = useState<string | null>(null);

  const visibleCols = useMemo(
    () => COLUMNS.filter((c) => !hiddenCols[c.key]),
    [hiddenCols]
  );

  const filteredRecords = useMemo(() => {
    let list = INITIAL_RECORDS.filter((r) => {
      if (applied.org && applied.org !== 'ALL' && r.org !== applied.org) return false;
      if (!matchString(r.materialName, applied.matNameVal, applied.matNameOp)) return false;
      if (!matchString(r.materialCode, applied.matCodeVal, applied.matCodeOp)) return false;
      if (!matchString(r.orderNo, applied.orderNoVal, applied.orderNoOp)) return false;
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
        return String(av).localeCompare(String(bv), 'zh-CN') * dir;
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
    let tare = 0;
    let net = 0;
    let gross = 0;
    let pieces = 0;
    for (const r of filteredRecords) {
      tare += r.tareWeight;
      net += r.netWeight;
      gross += r.grossWeight;
      pieces += r.pieces;
    }
    return {
      tare: round1(tare),
      net: round1(net),
      gross: round1(gross),
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
      matNameOp,
      matNameVal,
      dateFrom,
      dateTo,
      matCodeOp,
      matCodeVal,
      orderNoOp,
      orderNoVal,
    });
    setPage(1);
    onShowToast('称重记录查询完成', 'success');
  };

  const handleReset = () => {
    setOrg('昇兴集团-中山制罐工厂');
    setMatNameOp('contains');
    setMatNameVal('');
    setDateFrom('2026-11-01');
    setDateTo('2026-11-19');
    setMatCodeOp('contains');
    setMatCodeVal('');
    setOrderNoOp('contains');
    setOrderNoVal('');
    setApplied({
      org: '昇兴集团-中山制罐工厂',
      matNameOp: 'contains',
      matNameVal: '',
      dateFrom: '2026-11-01',
      dateTo: '2026-11-19',
      matCodeOp: 'contains',
      matCodeVal: '',
      orderNoOp: 'contains',
      orderNoVal: '',
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

  const handleExportCsv = (rowsToExport: WeighingRecord[]) => {
    if (!rowsToExport.length) {
      onShowToast('当前没有可导出的称重记录', 'warning');
      return;
    }
    const headers = [
      '组织机构',
      '订单号',
      '物料料号',
      '物料名称',
      '件数',
      '总重量',
      '皮重（kg）',
      '净重（kg）',
      '创建时间',
      '创建人',
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rowsToExport
      .map((r) =>
        [
          r.org,
          r.orderNo,
          r.materialCode,
          r.materialName,
          r.pieces,
          fmtNum(r.grossWeight),
          fmtNum(r.tareWeight),
          fmtNum(r.netWeight),
          r.createdAt,
          r.creator,
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
    a.download = `铜针铜线称重记录表-20261119.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`已导出 ${rowsToExport.length} 条称重记录 CSV`, 'success');
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

  const previewIndex = useMemo(
    () =>
      previewRecordId
        ? filteredRecords.findIndex((r) => r.id === previewRecordId)
        : -1,
    [previewRecordId, filteredRecords]
  );
  const previewRecord = previewIndex >= 0 ? filteredRecords[previewIndex] : null;

  // Build page number list (up to 6 visible around current)
  const pageNumbers = useMemo(() => {
    const arr: number[] = [];
    for (let p = 1; p <= totalPages; p++) {
      arr.push(p);
    }
    return arr;
  }, [totalPages]);

  return (
    <div className="space-y-4 relative text-xs text-[#1E293B]">
      {/* Top Query Filter Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        {/* Top Row: Page Title + Inline 组织机构 + Right Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">铜针铜线称重记录</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E40AF] font-medium">组织机构</span>
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="ALL">全部组织机构</option>
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
              title="表格列设置与导出"
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
            {/* Row 1: 物料名称 + 创建时间 */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  物料名称
                </label>
                <div className="flex items-center h-8 w-64 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={matNameOp}
                    onChange={(e) => setMatNameOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <select
                    value={matNameVal}
                    onChange={(e) => setMatNameVal(e.target.value)}
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {MATERIAL_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  创建时间
                </label>
                <div className="flex items-center gap-1.5 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent w-[112px]"
                  />
                  <ArrowRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent w-[112px]"
                  />
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 hidden sm:block" />
                </div>
              </div>
            </div>

            {/* Row 2: 物料料号 + 订单号 */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  物料料号
                </label>
                <div className="flex items-center h-8 w-64 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
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
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  订单号
                </label>
                <div className="flex items-center h-8 w-64 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={orderNoOp}
                    onChange={(e) => setOrderNoOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={orderNoVal}
                    onChange={(e) => setOrderNoVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Weighing Records Table Card (工单管理风格) */}
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
              条称重记录
            </span>
            {selectedRecords.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#1E40AF]">
                  所选皮重 {fmtNum(selectedRecords.reduce((s, r) => s + r.tareWeight, 0))} kg / 净重{' '}
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
                      } ${col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${
                          col.align === 'center' ? 'justify-center w-full' : ''
                        }`}
                      >
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

                <th className="w-11 p-2.5 border-b border-[#E5E9F0] text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <button
                    type="button"
                    onClick={() => setColSettingsOpen(true)}
                    title="列设置"
                    className="text-[#2563EB] hover:text-[#1E293B] cursor-pointer transition"
                  >
                    <Settings className="w-3.5 h-3.5 inline" />
                  </button>
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
                    未查询到符合条件的铜针铜线称重记录，请调整筛选条件或点击「重置」
                  </td>
                </tr>
              ) : (
                pagedRecords.map((row) => {
                  const isChecked = !!selectedIds[row.id];
                  const isActiveRow = activeRowId === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setActiveRowId(row.id)}
                      className={`transition-colors cursor-pointer ${
                        isActiveRow || isChecked
                          ? 'bg-[#EBF2FF]/60 hover:bg-[#EBF2FF]/80'
                          : 'hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <td
                        className="p-2.5 border-r border-[#EDF2F7] text-center align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                        if (col.key === 'imageUrl') {
                          return (
                            <td
                              key={col.key}
                              className="px-2 py-1.5 border-r border-[#EDF2F7] align-middle"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewRecordId(row.id);
                                }}
                                title="点击放大查看称重现场抓拍图"
                                className="group relative block w-full min-w-[300px] max-w-[440px] h-[76px] overflow-hidden rounded-lg border border-[#E5E9F0] bg-[#0F172A] cursor-pointer"
                              >
                                <img
                                  src={row.imageUrl}
                                  alt={`${row.orderNo} ${row.materialName} 称重抓拍`}
                                  loading="lazy"
                                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-200"
                                />
                                <span className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[11px] font-medium">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                    <span>查看大图</span>
                                  </span>
                                </span>
                              </button>
                            </td>
                          );
                        }

                        if (col.key === 'grossWeight' || col.key === 'tareWeight' || col.key === 'netWeight') {
                          return (
                            <td
                              key={col.key}
                              className={`p-2.5 border-r border-[#EDF2F7] whitespace-nowrap font-mono tabular-nums ${
                                col.key === 'netWeight'
                                  ? 'font-bold text-[#1E40AF]'
                                  : 'text-[#1E293B]'
                              }`}
                            >
                              {fmtNum(row[col.key])}
                            </td>
                          );
                        }

                        if (col.key === 'orderNo') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] whitespace-nowrap font-mono tabular-nums font-bold text-[#1E40AF]"
                            >
                              {row[col.key]}
                            </td>
                          );
                        }

                        if (col.key === 'materialCode' || col.key === 'pieces' || col.key === 'createdAt') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] whitespace-nowrap font-mono tabular-nums text-[#1E293B]"
                            >
                              {row[col.key] === '' ? '' : row[col.key]}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={col.key}
                            className="p-2.5 border-r border-[#EDF2F7] whitespace-nowrap text-[#1E293B]"
                          >
                            {row[col.key]}
                          </td>
                        );
                      })}

                      <td
                        className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isActiveRow || isChecked ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                      />
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Summary Footer Row */}
            <tfoot>
              <tr className="bg-[#F4F6F9] border-t border-[#E5E9F0] text-xs font-semibold text-[#1E40AF]">
                <td className="p-2.5 border-r border-[#E5E9F0]" />
                {visibleCols.map((col) => (
                  <td
                    key={col.key}
                    className="p-2.5 whitespace-nowrap border-r border-[#E5E9F0] font-mono tabular-nums"
                  >
                    {col.key === 'tareWeight'
                      ? `合计：${fmtNum(totals.tare)}`
                      : col.key === 'netWeight'
                      ? `合计：${fmtNum(totals.net)}`
                      : ''}
                  </td>
                ))}
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

            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-lg border font-mono tabular-nums transition cursor-pointer ${
                  p === safePage
                    ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                    : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:border-[#2563EB]'
                }`}
              >
                {p}
              </button>
            ))}

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

      {/* Weighing Camera Photo Lightbox Modal */}
      {previewRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70"
          onClick={() => setPreviewRecordId(null)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-bold text-[#0F172A] truncate">
                  称重抓拍照片 · 订单 {previewRecord.orderNo}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded">
                  {previewRecord.materialName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRecordId(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#0F172A] flex items-center justify-center relative">
              <img
                src={previewRecord.imageUrl}
                alt={`称重照片 ${previewRecord.orderNo}`}
                className="max-h-[54vh] w-full object-contain rounded"
              />
              {previewIndex > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setPreviewRecordId(filteredRecords[previewIndex - 1].id)
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md bg-slate-900/75 text-white hover:bg-[#165DFF] flex items-center justify-center cursor-pointer transition"
                  title="上一条称重抓拍"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {previewIndex < filteredRecords.length - 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setPreviewRecordId(filteredRecords[previewIndex + 1].id)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md bg-slate-900/75 text-white hover:bg-[#165DFF] flex items-center justify-center cursor-pointer transition"
                  title="下一条称重抓拍"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="px-5 py-3.5 bg-white border-t border-[#E5E9F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#64748B]">订单号 / 物料料号</div>
                <div className="font-mono font-semibold text-[#0F172A] mt-0.5">
                  {previewRecord.orderNo} / {previewRecord.materialCode || '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#64748B]">总重量 / 皮重 / 净重</div>
                <div className="font-mono tabular-nums font-semibold text-[#165DFF] mt-0.5">
                  {fmtNum(previewRecord.grossWeight)} / {fmtNum(previewRecord.tareWeight)} /{' '}
                  {fmtNum(previewRecord.netWeight)} kg
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#64748B]">创建时间</div>
                <div className="font-mono tabular-nums text-[#0F172A] mt-0.5">
                  {previewRecord.createdAt}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#64748B]">创建人 / 组织机构</div>
                <div className="text-[#0F172A] mt-0.5 truncate">
                  {previewRecord.creator} · {previewRecord.org}
                </div>
              </div>
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

            <div className="p-4 grid grid-cols-2 gap-2">
              {COLUMNS.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#EEF2F7] hover:bg-[#F8FAFC] text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!hiddenCols[c.key]}
                    onChange={(e) =>
                      setHiddenCols((prev) => ({
                        ...prev,
                        [c.key]: !e.target.checked,
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
                  onClick={() =>
                    setHiddenCols({
                      orderNo: false,
                      materialCode: false,
                      materialName: false,
                      pieces: false,
                      grossWeight: false,
                      tareWeight: false,
                      netWeight: false,
                      createdAt: false,
                      creator: false,
                      imageUrl: false,
                    })
                  }
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
