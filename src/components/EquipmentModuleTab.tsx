import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Cpu,
  Download,
  FilePlus2,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Upload,
  Wrench,
  X,
} from 'lucide-react';
import {
  buildInitialEquipmentData,
  EQ_BOARD_CATEGORY_DATA,
  EQ_BOARD_TREND_LABELS,
  EQ_BOARD_TREND_VALUES,
  EQ_FORMS,
  EQ_HOME_FAULT_SERIES,
  EQ_HOME_STATUS_DATA,
  EQ_METRIC_CONFIGS,
  EQ_ORG,
  EQ_PAGES,
  EqFilterDef,
  EqFormDef,
  EqFormField,
  EqPageConfig,
  EqRow,
} from '../data/equipmentData';

interface EquipmentModuleTabProps {
  pageKey: string;
  onNavigate: (pageKey: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const TAG_STYLE_MAP: Record<string, string> = {
  在用: 'bg-amber-50 text-amber-700 border-amber-200',
  维修中: 'bg-red-50 text-red-700 border-red-200',
  封存: 'bg-slate-100 text-slate-600 border-slate-200',
  待启用: 'bg-blue-50 text-[#165DFF] border-blue-200',
  报废: 'bg-slate-100 text-slate-500 border-slate-200',
  正常: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  库存不足: 'bg-red-50 text-red-700 border-red-200',
  库存超上限: 'bg-amber-50 text-amber-700 border-amber-200',
  已完成: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  已关结: 'bg-slate-100 text-slate-600 border-slate-200',
  已修复: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  已审核: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  待接单: 'bg-amber-50 text-amber-700 border-amber-200',
  进行中: 'bg-blue-50 text-[#165DFF] border-blue-200',
  执行中: 'bg-blue-50 text-[#165DFF] border-blue-200',
  已验证: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  待处理: 'bg-amber-50 text-amber-700 border-amber-200',
  待审核: 'bg-amber-50 text-amber-700 border-amber-200',
  审核通过: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  已领用: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  待领用: 'bg-blue-50 text-[#165DFF] border-blue-200',
  开立: 'bg-blue-50 text-[#165DFF] border-blue-200',
  操作中: 'bg-amber-50 text-amber-700 border-amber-200',
  关结: 'bg-slate-100 text-slate-600 border-slate-200',
  盘点中: 'bg-blue-50 text-[#165DFF] border-blue-200',
  待盘点: 'bg-amber-50 text-amber-700 border-amber-200',
  紧急: 'bg-red-50 text-red-700 border-red-200',
  重要: 'bg-amber-50 text-amber-700 border-amber-200',
  一般: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  临时保养: 'bg-amber-50 text-amber-700 border-amber-200',
  周保养: 'bg-blue-50 text-[#165DFF] border-blue-200',
  月度保养: 'bg-blue-50 text-[#165DFF] border-blue-200',
  年度保养: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  是: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  否: 'bg-slate-100 text-slate-600 border-slate-200',
  批量: 'bg-blue-50 text-[#165DFF] border-blue-200',
  个体: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  电能: 'bg-blue-50 text-[#165DFF] border-blue-200',
  压缩空气: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  水: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  蒸汽: 'bg-amber-50 text-amber-700 border-amber-200',
  禁用: 'bg-red-50 text-red-700 border-red-200',
  在库: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  上线: 'bg-blue-50 text-[#165DFF] border-blue-200',
  故障: 'bg-red-50 text-red-700 border-red-200',
  到期: 'bg-amber-50 text-amber-700 border-amber-200',
  过期: 'bg-red-50 text-red-700 border-red-200',
};

function renderTagBadge(val: string | number | undefined) {
  const s = val == null ? '' : String(val);
  if (!s) return <span className="text-slate-300">-</span>;
  const cls = TAG_STYLE_MAP[s] || 'bg-blue-50 text-[#165DFF] border-blue-200';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap ${cls}`}
    >
      {s}
    </span>
  );
}

function getDateQuickRange(preset: string): { start: string; end: string } {
  const today = new Date(2026, 10, 19); // 2026-11-19 matching system dataset date
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const end = fmt(today);
  if (preset === '今天') return { start: end, end };
  if (preset === '本周') {
    const d = new Date(today);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return { start: fmt(d), end };
  }
  if (preset === '本月') {
    return { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end };
  }
  if (preset === '最近三个月') {
    return { start: fmt(new Date(today.getFullYear(), today.getMonth() - 3, 1)), end };
  }
  return { start: '', end: '' };
}

/* ---------- Reusable SVG Charts (Pure Tailwind + SVG) ---------- */
const DonutChartSvg: React.FC<{
  data: Array<{ name: string; value: number; color: string }>;
  size?: number;
  centerLabel?: string;
}> = ({ data, size = 196, centerLabel = '设备总数' }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const ir = r * 0.58;
  let a0 = -Math.PI / 2;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px] mx-auto block">
      {data.map((d) => {
        const angle = (d.value / total) * Math.PI * 2;
        const a1 = a0 + angle;
        const large = angle > Math.PI ? 1 : 0;
        const x0 = cx + r * Math.cos(a0);
        const y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const xi1 = cx + ir * Math.cos(a1);
        const yi1 = cy + ir * Math.sin(a1);
        const xi0 = cx + ir * Math.cos(a0);
        const yi0 = cy + ir * Math.sin(a0);
        const path = `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} L${xi1} ${yi1} A${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z`;
        a0 = a1;
        return (
          <path key={d.name} d={path} fill={d.color} className="transition-opacity hover:opacity-85">
            <title>
              {d.name}: {d.value} ({((d.value / total) * 100).toFixed(1)}%)
            </title>
          </path>
        );
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        className="fill-[#1E293B] text-xl font-bold"
        fontSize="20"
        fontWeight="700"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        className="fill-[#64748B]"
        fontSize="11"
      >
        {centerLabel}
      </text>
    </svg>
  );
};

const BarChartSvg: React.FC<{
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  width?: number;
}> = ({ data, height = 225, width = 680 }) => {
  const pad = { l: 40, r: 16, t: 20, b: 32 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = iw / Math.max(data.length, 1);
  const bw = Math.min(step * 0.52, 38);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full block">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = pad.t + ih * (i / 4);
        const tick = Math.round((max * (4 - i)) / 4);
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="#E5E9F0" strokeDasharray={i === 4 ? undefined : '3 3'} />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="10.5" fill="#64748B">
              {tick}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * ih, d.value > 0 ? 2 : 0);
        const x = pad.l + step * i + (step - bw) / 2;
        const y = pad.t + ih - bh;
        return (
          <g key={`${d.name}-${i}`}>
            <rect
              x={x}
              y={y}
              width={bw}
              height={bh}
              fill={d.color || '#165DFF'}
              rx="4"
              className="transition-opacity hover:opacity-80"
            >
              <title>
                {d.name}: {d.value}
              </title>
            </rect>
            {d.value > 0 && (
              <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#1E40AF" fontWeight="600">
                {d.value}
              </text>
            )}
            <text x={pad.l + step * i + step / 2} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#475569">
              {d.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const LineChartSvg: React.FC<{
  series: Array<{ name: string; data: number[]; color: string; dashed?: boolean }>;
  labels: string[];
  height?: number;
  width?: number;
}> = ({ series, labels, height = 260, width = 760 }) => {
  const pad = { l: 44, r: 20, t: 22, b: 32 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const allVals = series.flatMap((s) => s.data);
  const max = Math.max(...allVals, 1) * 1.12;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full block">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = pad.t + ih * (i / 4);
        const tick = ((max * (4 - i)) / 4).toFixed(max < 15 ? 1 : 0);
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="#E5E9F0" strokeDasharray={i === 4 ? undefined : '3 3'} />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="10.5" fill="#64748B">
              {tick}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => {
        const x = pad.l + iw * (labels.length === 1 ? 0 : i / (labels.length - 1));
        return (
          <text key={l} x={x} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#475569">
            {l}
          </text>
        );
      })}
      {series.map((s) => {
        const pts = s.data.map((v, i) => [
          pad.l + iw * (labels.length === 1 ? 0 : i / (labels.length - 1)),
          pad.t + ih - (v / max) * ih,
        ]);
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');
        return (
          <g key={s.name}>
            <path
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={s.dashed ? 2 : 2.5}
              strokeDasharray={s.dashed ? '6 4' : undefined}
            />
            {pts.map((p, idx) => (
              <circle
                key={idx}
                cx={p[0]}
                cy={p[1]}
                r={s.dashed ? 2.5 : 4}
                fill="#FFFFFF"
                stroke={s.color}
                strokeWidth="2"
              >
                <title>
                  {s.name} ({labels[idx]}): {s.data[idx]}
                </title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- Contextual Sub-Table Data Helper ---------- */
function buildContextualSubRows(pageKey: string, subtab: string, selectedRow: EqRow | null): EqRow[] {
  if (!selectedRow) return [];
  const code = String(selectedRow.code || selectedRow.no || '1020000067');
  const name = String(selectedRow.name || selectedRow.eq || 'A线高频电阻焊机');
  if (pageKey === 'bom') {
    if (subtab === '设备关联') {
      return [
        { code, name, maker: '昇兴机械', dept: '0405_生产部', loc: String(selectedRow.loc || '制罐A线') },
      ];
    }
    if (subtab === '备件') {
      return [
        { code: 'YHP01665', name: '聚氨酯带钢PU同步带', maker: '盖茨传动', dept: '备件库', loc: 'B-02-01' },
        { code: '50080374', name: '光电传感器 E3FB-DN23', maker: '欧姆龙', dept: '主仓库', loc: 'A-04-08' },
      ];
    }
    return [
      { code: '52001076', name: '下焊轮 64M-448052', maker: '昇兴工装', dept: '制罐车间', loc: '工装库-01' },
    ];
  }
  if (pageKey === 'eqTypePart') {
    return [
      { part: `${String(selectedRow.type || '设备')} - 传动与输送系统` },
      { part: `${String(selectedRow.type || '设备')} - 电气控制与传感单元` },
      { part: `${String(selectedRow.type || '设备')} - 润滑与气动执行机构` },
    ];
  }
  if (pageKey === 'checkPlan') {
    return [
      { part: '主体机构', desc: String(selectedRow.plan || '关键部件清洁点检'), method: '目视/实测', hours: '0.5h', range: '正常', max: '85', min: '20', unit: '℃' },
      { part: '润滑管路', desc: '检查油位及管路无渗漏', method: '目视点检', hours: '0.3h', range: '达标', max: '100', min: '60', unit: '%' },
    ];
  }
  if (pageKey === 'maintain') {
    return [
      { no: String(selectedRow.no || ''), item: String(selectedRow.plan || '周期保养项目'), result: selectedRow.status === '已验证' || selectedRow.status === '已关结' ? '合格' : '待执行', user: '黄田兴' },
    ];
  }
  if (pageKey === 'inspect') {
    return [
      { no: String(selectedRow.no || ''), item: `${String(selectedRow.type || '点检')} - ${String(selectedRow.plan || '标准项')}`, result: selectedRow.status === '已完成' ? '正常' : '待点检', user: '刘起飞' },
    ];
  }
  if (pageKey === 'repair') {
    if (subtab === '执行记录') {
      return [
        { otype: '故障报修', user: String(selectedRow.reporter || '李元龙'), time: String(selectedRow.rtime || '2026-11-17 08:30:00') },
        ...(selectedRow.repairman
          ? [{ otype: '维修处理', user: String(selectedRow.repairman), time: String(selectedRow.etime || '2026-11-18 10:15:00') }]
          : []),
      ];
    }
    return [
      { otype: '更换备件: 光电传感器 E3FB-DN23 × 1', user: String(selectedRow.repairman || '黄田兴'), time: String(selectedRow.etime || '2026-11-18 10:10:00') },
    ];
  }
  if (pageKey === 'spareStock') {
    return [
      { mat: String(selectedRow.mat || code), name: String(selectedRow.name || ''), spec: String(selectedRow.spec || '-'), qty: selectedRow.qty ?? 18, wh: String(selectedRow.wh || '备件库') },
    ];
  }
  if (pageKey === 'spareCheck') {
    return [
      { mat: 'YHP01650', name: '烘炉纠偏铜套', spec: '标准件', status: '已盘点', qty: 4, cqty: 4, diff: 0 },
    ];
  }
  if (pageKey === 'spareUse') {
    return [
      { mat: '50080374', name: '光电传感器,E3FB-DN23,NPN,12-24V', qty: 2 },
    ];
  }
  if (pageKey === 'toolHistory') {
    return [
      { code, otype: String(selectedRow.otype || '入库'), time: '2026-11-18 09:30:00', user: '汪家周' },
    ];
  }
  return [];
}

export const EquipmentModuleTab: React.FC<EquipmentModuleTabProps> = ({
  pageKey,
  onNavigate,
  onShowToast,
}) => {
  const [rowsByPage, setRowsByPage] = useState<Record<string, EqRow[]>>(() => buildInitialEquipmentData());
  const [filtersByPage, setFiltersByPage] = useState<Record<string, Record<string, string>>>({});
  const [sortByPage, setSortByPage] = useState<Record<string, { key: string; asc: boolean }>>({});
  const [pageNumByPage, setPageNumByPage] = useState<Record<string, number>>({});
  const [pageSizeByPage, setPageSizeByPage] = useState<Record<string, number>>({});
  const [selectedIdsByPage, setSelectedIdsByPage] = useState<Record<string, number[]>>({});
  const [activeRowIdxByPage, setActiveRowIdxByPage] = useState<Record<string, number>>({});
  const [subtabByPage, setSubtabByPage] = useState<Record<string, string>>({});
  const [filterCollapsed, setFilterCollapsed] = useState(false);

  // Home dashboard local interactive state
  const [homeRangeStart, setHomeRangeStart] = useState('2026-11-04');
  const [homeRangeEnd, setHomeRangeEnd] = useState('2026-11-18');
  const [homeGranularity, setHomeGranularity] = useState<'day' | 'week' | 'month'>('day');

  // Form Modal state
  const [formModal, setFormModal] = useState<{
    open: boolean;
    readonly: boolean;
    actionLabel: string;
    rowIndex: number | null;
    values: Record<string, string>;
    subRows: EqRow[];
    uploadedFiles: Record<string, string[]>;
    activeGroupIdx: number;
  }>({
    open: false,
    readonly: false,
    actionLabel: '+新增',
    rowIndex: null,
    values: {},
    subRows: [],
    uploadedFiles: {},
    activeGroupIdx: 0,
  });

  // Confirm Dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({ open: false, message: '', onConfirm: null });

  // More actions modal
  const [moreModal, setMoreModal] = useState<{ open: boolean; rowIndex: number | null }>({
    open: false,
    rowIndex: null,
  });

  const cfg: EqPageConfig = EQ_PAGES[pageKey] || EQ_PAGES.home;
  const pageFilters = filtersByPage[pageKey] || {};
  const pageSort = sortByPage[pageKey];
  const currentPage = pageNumByPage[pageKey] || 1;
  const pageSize = pageSizeByPage[pageKey] || cfg.pageSize || 10;
  const selectedRowIndices = selectedIdsByPage[pageKey] || [];
  const rawRows = rowsByPage[pageKey] || [];

  const updateFilter = (k: string, v: string) => {
    setFiltersByPage((prev) => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] || {}), [k]: v },
    }));
    setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
  };

  const resetFilters = () => {
    setFiltersByPage((prev) => ({ ...prev, [pageKey]: {} }));
    setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
    onShowToast('已重置筛选条件', 'info');
  };

  // Apply filtering and sorting while preserving original row index for edits/deletes
  const filteredEntries = useMemo(() => {
    if (cfg.type !== 'table') return [];
    let entries = rawRows.map((row, origIdx) => ({ row, origIdx }));

    (cfg.search || []).forEach((f: EqFilterDef) => {
      if (f.type === 'date') {
        const ds = pageFilters[`_ds_${f.label}`];
        const de = pageFilters[`_de_${f.label}`];
        if (f.key && (ds || de)) {
          entries = entries.filter(({ row }) => {
            const rawDate = String(row[f.key] || '').slice(0, 10);
            if (!rawDate) return true;
            if (ds && rawDate < ds) return false;
            if (de && rawDate > de) return false;
            return true;
          });
        }
        return;
      }
      if (!f.key) return;
      const val = pageFilters[f.key];
      if (!val || val === 'ALL' || val === '请选择') return;
      const op = pageFilters[`_op_${f.key}`] || '包含';
      const needle = val.trim().toLowerCase();
      entries = entries.filter(({ row }) => {
        const cell = String(row[f.key] ?? '').toLowerCase();
        if (op === '不包含') return !cell.includes(needle);
        if (op === '等于') return cell === needle;
        return cell.includes(needle);
      });
    });

    const kw = (pageFilters._kw || '').trim().toLowerCase();
    if (kw) {
      entries = entries.filter(({ row }) =>
        Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(kw))
      );
    }

    if (pageSort) {
      entries = [...entries].sort((a, b) => {
        const va = String(a.row[pageSort.key] ?? '');
        const vb = String(b.row[pageSort.key] ?? '');
        const na = Number(va);
        const nb = Number(vb);
        const cmp =
          !Number.isNaN(na) && !Number.isNaN(nb) && va !== '' && vb !== ''
            ? na - nb
            : va.localeCompare(vb, 'zh-CN');
        return pageSort.asc ? cmp : -cmp;
      });
    }

    return entries;
  }, [cfg, rawRows, pageFilters, pageSort]);

  const totalPages = Math.max(1, Math.ceil(Math.max(filteredEntries.length, 1) / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleEntries = filteredEntries.slice((safePage - 1) * pageSize, safePage * pageSize);

  const displayTotal = useMemo(() => {
    const hasFilter = Object.entries(pageFilters).some(
      ([k, v]) => !k.startsWith('_op_') && !k.startsWith('_q_') && v && v !== 'ALL' && v !== '请选择' && v !== EQ_ORG
    );
    if (hasFilter) return filteredEntries.length;
    if (cfg.total != null && rawRows.length === (buildInitialEquipmentData()[pageKey]?.length ?? 0)) {
      return cfg.total;
    }
    return filteredEntries.length;
  }, [cfg.total, filteredEntries.length, pageFilters, pageKey, rawRows.length]);

  const getFormDef = (id: string): EqFormDef => {
    return (
      EQ_FORMS[id] || {
        title: cfg.title || '记录',
        titlePrefix: '+新增',
        groups: [
          {
            name: '基础信息',
            fields: [
              { label: '编码', key: 'code', type: 'text', required: true },
              { label: '名称', key: 'name', type: 'text', required: true },
              { label: '状态', key: 'status', type: 'select', opts: ['正常', '待处理', '已完成'] },
              { label: '备注', key: 'remark', type: 'textarea', full: true },
            ],
          },
        ],
      }
    );
  };

  const openRecordModal = (rowIndex: number | null, actionLabel: string, readonly: boolean) => {
    const formDef = getFormDef(pageKey);
    const existing = rowIndex != null ? rawRows[rowIndex] : null;
    const values: Record<string, string> = {};
    formDef.groups.forEach((g) => {
      g.fields.forEach((f) => {
        values[f.key] = existing && existing[f.key] != null ? String(existing[f.key]) : f.key === 'org' ? EQ_ORG : '';
      });
    });
    const subRows =
      formDef.subtable?.rows ||
      (existing && (formDef.subtable || formDef.subCols)
        ? [{ code: String(existing.code || 'SUB-01'), name: '默认配置项', remark: '系统初始化' }]
        : []);
    setFormModal({
      open: true,
      readonly,
      actionLabel,
      rowIndex,
      values,
      subRows,
      uploadedFiles: {},
      activeGroupIdx: 0,
    });
  };

  const handleSaveForm = (closeAfter: boolean) => {
    const formDef = getFormDef(pageKey);
    const missing = formDef.groups
      .flatMap((g) => g.fields)
      .filter((f) => f.required && !String(formModal.values[f.key] || '').trim());

    if (missing.length > 0) {
      onShowToast(`请填写必填项：${missing.map((m) => m.label).join('、')}`, 'warning');
      return;
    }

    const nextRow: EqRow = { org: EQ_ORG, ...formModal.values };
    if (pageKey === 'repair' && formModal.rowIndex == null) {
      nextRow.no = nextRow.no || `20261119${String(rawRows.length + 1).padStart(5, '0')}`;
      nextRow.status = nextRow.status || '待接单';
      nextRow.audit = nextRow.audit || '待审核';
      nextRow.dtype = '维修';
    }
    if (pageKey === 'sparePurchase' && formModal.rowIndex == null) {
      nextRow.status = nextRow.status || '开立';
      nextRow.creator = '系统管理员';
      nextRow.ctime = '2026-11-19 10:30:00';
    }

    setRowsByPage((prev) => {
      const list = [...(prev[pageKey] || [])];
      if (formModal.rowIndex != null && list[formModal.rowIndex]) {
        list[formModal.rowIndex] = { ...list[formModal.rowIndex], ...nextRow };
      } else {
        list.unshift(nextRow);
      }
      return { ...prev, [pageKey]: list };
    });

    onShowToast(formModal.rowIndex != null ? '记录修改已保存' : '新增记录已保存', 'success');
    if (closeAfter) {
      setFormModal((prev) => ({ ...prev, open: false }));
    } else if (formModal.rowIndex == null) {
      // Clear form for continuous entry
      setFormModal((prev) => ({
        ...prev,
        values: Object.fromEntries(Object.keys(prev.values).map((k) => [k, k === 'org' ? EQ_ORG : ''])),
      }));
    }
  };

  const handleExportCsv = () => {
    const cols = (cfg.cols || []).filter((c) => c.k && !c.cb && c.k !== '_op');
    if (!cols.length) return;
    const header = cols.map((c) => c.t).join(',');
    const body = filteredEntries
      .map(({ row }) =>
        cols.map((c) => `"${String(row[c.k] ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([`\ufeff${header}\n${body}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cfg.title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`已导出「${cfg.title}」共 ${filteredEntries.length} 条记录`, 'success');
  };

  const handleBatchUpdateSelected = (patch: Partial<EqRow>, successMsg: string) => {
    if (!selectedRowIndices.length) {
      onShowToast('请先勾选至少一条记录', 'warning');
      return;
    }
    setRowsByPage((prev) => {
      const list = [...(prev[pageKey] || [])];
      selectedRowIndices.forEach((idx) => {
        if (list[idx]) list[idx] = { ...list[idx], ...patch };
      });
      return { ...prev, [pageKey]: list };
    });
    setSelectedIdsByPage((prev) => ({ ...prev, [pageKey]: [] }));
    onShowToast(`${successMsg}（共 ${selectedRowIndices.length} 条）`, 'success');
  };

  const handleToolbarAction = (btn: string) => {
    if (btn.includes('新增') || btn === '添加' || btn === '故障报修') {
      openRecordModal(null, btn, false);
      return;
    }
    if (btn.includes('删除')) {
      if (!selectedRowIndices.length) {
        onShowToast('请先勾选需要删除的记录', 'warning');
        return;
      }
      setConfirmState({
        open: true,
        message: `确定要删除选中的 ${selectedRowIndices.length} 条「${cfg.title}」记录吗？删除后不可恢复。`,
        onConfirm: () => {
          const toDelete = new Set(selectedRowIndices);
          setRowsByPage((prev) => ({
            ...prev,
            [pageKey]: (prev[pageKey] || []).filter((_, i) => !toDelete.has(i)),
          }));
          setSelectedIdsByPage((prev) => ({ ...prev, [pageKey]: [] }));
          onShowToast(`已删除 ${selectedRowIndices.length} 条记录`, 'success');
        },
      });
      return;
    }
    if (btn.includes('导出')) {
      handleExportCsv();
      return;
    }
    if (btn === '修改') {
      if (selectedRowIndices.length !== 1) {
        onShowToast('请勾选 1 条记录进行修改', 'warning');
        return;
      }
      openRecordModal(selectedRowIndices[0], '修改', false);
      return;
    }
    if (btn === '计划关结') {
      handleBatchUpdateSelected({ status: '已关结' }, '已完成计划关结');
      return;
    }
    if (btn === '一键未生产') {
      handleBatchUpdateSelected({ produce: '否' }, '已批量标记为未生产');
      return;
    }
    if (btn === '审核通过' || btn.includes('审核')) {
      if (pageKey === 'repair') {
        handleBatchUpdateSelected({ audit: '已审核' }, `已完成${btn}`);
      } else {
        handleBatchUpdateSelected({ status: '审核通过' }, `已完成${btn}`);
      }
      return;
    }
    if (pageKey === 'toolLedger' && ['禁用', '解禁', '维修', '维修确认', '报废'].includes(btn)) {
      const targetStatus = btn === '解禁' ? '在库' : btn === '维修' ? '故障' : btn;
      handleBatchUpdateSelected({ status: targetStatus }, `工装状态已更新为「${targetStatus}」`);
      return;
    }
    onShowToast(`已执行「${btn}」操作`, 'info');
  };

  const handleRowAction = (origIdx: number, action: string) => {
    const row = rawRows[origIdx];
    if (!row) return;
    if (action === '查看') {
      openRecordModal(origIdx, '查看', true);
      return;
    }
    if (action === '更多') {
      setMoreModal({ open: true, rowIndex: origIdx });
      return;
    }
    if (action === '删除') {
      setConfirmState({
        open: true,
        message: `确定要删除「${String(row.name || row.no || row.code || '该记录')}」吗？删除后不可恢复。`,
        onConfirm: () => {
          setRowsByPage((prev) => ({
            ...prev,
            [pageKey]: (prev[pageKey] || []).filter((_, i) => i !== origIdx),
          }));
          setSelectedIdsByPage((prev) => ({
            ...prev,
            [pageKey]: (prev[pageKey] || []).filter((i) => i !== origIdx),
          }));
          onShowToast('删除成功', 'success');
        },
      });
      return;
    }
    if (action === '备件关联' || action === '工装关联') {
      setActiveRowIdxByPage((prev) => ({ ...prev, [pageKey]: origIdx }));
      setSubtabByPage((prev) => ({ ...prev, [pageKey]: action === '备件关联' ? '备件' : '工装' }));
      onShowToast(`已切换至「${String(row.code || '')}」的${action}明细`, 'info');
      return;
    }
    openRecordModal(origIdx, action, false);
  };

  /* ============================================================
   *  VIEW 1: 设备管理首页 (eq-home)
   * ============================================================ */
  if (cfg.type === 'home') {
    const spareRows = (rowsByPage.spareStock || []).slice(0, 7);
    const totalEq = EQ_HOME_STATUS_DATA.reduce((s, d) => s + d.value, 0);
    const statusTableRows = [
      ...EQ_HOME_STATUS_DATA.map((d) => ({
        name: d.name,
        value: d.value,
        pct: `${((d.value / totalEq) * 100).toFixed(2)}%`,
        color: d.color,
      })),
      { name: '租赁', value: 0, pct: '0.00%', color: '#94A3B8' },
      { name: '报废', value: 0, pct: '0.00%', color: '#CBD5E1' },
    ];

    const quickShortcuts = [
      { key: 'ledger', label: '设备台账', icon: Cpu },
      { key: 'repair', label: '故障报修', icon: Wrench },
      { key: 'maintainPlan', label: '保养计划', icon: ClipboardCheck },
      { key: 'inspect', label: '设备点检', icon: Activity },
      { key: 'spareStock', label: '备件库存', icon: Boxes },
      { key: 'board', label: '管理看板', icon: BarChart3 },
    ];

    return (
      <div className="space-y-4">
        {/* Top Row: Equipment Status Donut + Quick Ops & Status Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
                设备状态分布
              </h3>
              <span className="text-xs text-[#64748B] font-mono tabular-nums">总计 {totalEq} 台</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-2">
              <DonutChartSvg data={EQ_HOME_STATUS_DATA} size={204} centerLabel="设备总数" />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#475569]">
                {EQ_HOME_STATUS_DATA.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 tabular-nums">
                    <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: d.color }} />
                    <span>{d.name}</span>
                    <span className="font-semibold text-[#1E293B]">{d.value}</span>
                    <span className="text-[#94A3B8]">({((d.value / totalEq) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
                常用操作与设备状态汇总
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('board')}
                className="text-xs text-[#165DFF] hover:text-[#104CE0] font-medium flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                进入设备看板
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {quickShortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-[#E5E9F0] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#93C5FD] text-[#334155] hover:text-[#165DFF] transition cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[#165DFF]" />
                    <span className="text-xs font-medium truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto border border-[#E5E9F0] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#1E40AF] border-b border-[#E5E9F0]">
                    <th className="py-2.5 px-3 font-semibold">设备状态</th>
                    <th className="py-2.5 px-3 font-semibold text-right">设备数量</th>
                    <th className="py-2.5 px-3 font-semibold text-right">占比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] tabular-nums">
                  {statusTableRows.map((row) => (
                    <tr key={row.name} className="hover:bg-[#F8FAFC]">
                      <td className="py-2 px-3 font-medium text-[#334155] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                        {row.name}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-[#1E293B]">{row.value}</td>
                      <td className="py-2 px-3 text-right text-[#64748B]">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Middle Row: Equipment Fault Repair Statistics */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
              设备故障报修统计
            </h3>
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="text-[#1E40AF] font-medium">统计范围</span>
              <input
                type="date"
                value={homeRangeStart}
                onChange={(e) => setHomeRangeStart(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
              />
              <span className="text-[#94A3B8]">至</span>
              <input
                type="date"
                value={homeRangeEnd}
                onChange={(e) => setHomeRangeEnd(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
              />
              <div className="inline-flex rounded-lg border border-[#CBD5E1] overflow-hidden">
                {(
                  [
                    ['day', '日'],
                    ['week', '周'],
                    ['month', '月'],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setHomeGranularity(k)}
                    className={`px-3 h-8 text-xs font-medium transition cursor-pointer ${
                      homeGranularity === k
                        ? 'bg-[#165DFF] text-white'
                        : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onShowToast('故障报修统计数据已刷新', 'success')}
                className="h-8 px-3.5 rounded-lg bg-[#165DFF] hover:bg-[#104CE0] text-white font-medium transition cursor-pointer"
              >
                查询
              </button>
            </div>
          </div>
          <div className="pt-4">
            <BarChartSvg data={EQ_HOME_FAULT_SERIES[homeGranularity]} height={230} width={760} />
          </div>
        </div>

        {/* Bottom Row: Spare Safety Status + Detail Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
              备件库存安全状态
            </h3>
            <div className="space-y-3">
              {[
                { count: '441 种', label: '高于安全库存上限', tone: 'bg-blue-50 text-[#165DFF] border-blue-100', iconBg: 'bg-[#165DFF]' },
                { count: '4 种', label: '低于安全库存下限（需补货）', tone: 'bg-red-50 text-[#DC2626] border-red-100', iconBg: 'bg-[#EF4444]' },
                { count: '118 种', label: '安全库存水位正常', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconBg: 'bg-[#10B981]' },
                { count: '1,600 种', label: '在管备件总品类', tone: 'bg-amber-50 text-amber-700 border-amber-100', iconBg: 'bg-[#F59E0B]' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3.5 p-3 rounded-xl border ${item.tone}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold tabular-nums leading-tight">{item.count}</div>
                    <div className="text-xs opacity-85 mt-0.5 truncate">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E9F0] shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#E5E9F0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
                备件库存安全明细
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('spareStock')}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-medium text-[#165DFF] transition cursor-pointer"
              >
                查看全部
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#1E40AF] border-b border-[#E5E9F0]">
                    <th className="py-2.5 px-4 font-semibold">备件料号</th>
                    <th className="py-2.5 px-4 font-semibold">备件名称</th>
                    <th className="py-2.5 px-4 font-semibold text-right">最大安全库存</th>
                    <th className="py-2.5 px-4 font-semibold text-right">最小安全库存</th>
                    <th className="py-2.5 px-4 font-semibold text-right">实际库存</th>
                    <th className="py-2.5 px-4 font-semibold">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] tabular-nums">
                  {spareRows.map((s, idx) => {
                    const qty = Number(s.qty ?? 15);
                    const state = qty < 5 ? '库存不足' : qty > 50 ? '库存超上限' : '正常';
                    return (
                      <tr key={`${s.code}-${idx}`} className="hover:bg-[#F0F7FF]/60">
                        <td className="py-2.5 px-4 font-mono text-[#1E293B]">{String(s.code || '')}</td>
                        <td className="py-2.5 px-4 text-[#334155]">{String(s.name || '')}</td>
                        <td className="py-2.5 px-4 text-right text-[#64748B]">50</td>
                        <td className="py-2.5 px-4 text-right text-[#64748B]">5</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-[#1E293B]">{qty}</td>
                        <td className="py-2.5 px-4">{renderTagBadge(state)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
   *  VIEW 2: 设备管理看板 (eq-board)
   * ============================================================ */
  if (cfg.type === 'board') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '设备总数', value: '142', sub: '含全厂6大类产线设备', icon: Cpu, iconBg: 'bg-[#165DFF]' },
            { label: '在用设备', value: '92', sub: '运行占比 64.8%', icon: CheckCircle2, iconBg: 'bg-[#10B981]' },
            { label: '本月维修', value: '25 单', sub: '已闭环 21 单', icon: Wrench, iconBg: 'bg-[#EA580C]' },
            { label: '设备完好率', value: '96.8%', sub: '目标基准 ≥ 95.0%', icon: TrendingUp, iconBg: 'bg-[#0EA5E9]' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#64748B]">{card.label}</div>
                  <div className="text-2xl font-bold text-[#1E293B] tabular-nums mt-0.5">{card.value}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{card.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
              设备状态分布
            </h3>
            <DonutChartSvg data={EQ_HOME_STATUS_DATA} size={210} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#475569]">
              {EQ_HOME_STATUS_DATA.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5 tabular-nums">
                  <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: d.color }} />
                  {d.name} <b className="text-[#1E293B]">{d.value}</b>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
              设备类别统计
            </h3>
            <BarChartSvg data={EQ_BOARD_CATEGORY_DATA} height={240} width={540} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
              近12个月设备故障趋势
            </h3>
            <span className="text-xs text-[#64748B]">单位：故障次数（次/月）</span>
          </div>
          <LineChartSvg
            series={[{ name: '故障次数', data: EQ_BOARD_TREND_VALUES, color: '#165DFF' }]}
            labels={EQ_BOARD_TREND_LABELS}
            height={250}
            width={820}
          />
        </div>
      </div>
    );
  }

  /* ============================================================
   *  VIEW 3: MTTR / MTBF 指标分析页 (eq-mttr / eq-mtbf)
   * ============================================================ */
  if (cfg.type === 'chart') {
    const metricKey = pageKey === 'mtbf' ? 'mtbf' : 'mttr';
    const metric = EQ_METRIC_CONFIGS[metricKey];
    const avg = (metric.data.reduce((a, b) => a + b, 0) / metric.data.length).toFixed(1);
    const quarterData = [
      { name: '一季度', value: Number((metric.data.slice(0, 3).reduce((a, b) => a + b, 0) / 3).toFixed(1)), color: '#165DFF' },
      { name: '二季度', value: Number((metric.data.slice(3, 6).reduce((a, b) => a + b, 0) / 3).toFixed(1)), color: '#2563EB' },
      { name: '三季度', value: Number((metric.data.slice(6, 9).reduce((a, b) => a + b, 0) / 3).toFixed(1)), color: '#0EA5E9' },
      { name: '四季度', value: Number((metric.data.slice(9, 12).reduce((a, b) => a + b, 0) / 3).toFixed(1)), color: '#10B981' },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '当前月值', value: `${metric.data[11]}${metric.unit}`, icon: Clock, iconBg: 'bg-[#165DFF]' },
            { label: '年度均值', value: `${avg}${metric.unit}`, icon: BarChart3, iconBg: 'bg-[#0EA5E9]' },
            { label: '目标基准值', value: `${metric.goal}${metric.unit}`, icon: CheckCircle2, iconBg: 'bg-[#10B981]' },
            { label: '同比变化', value: metric.yoy, icon: TrendingUp, iconBg: 'bg-[#EA580C]' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} text-white flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#64748B]">{card.label}</div>
                  <div className="text-2xl font-bold text-[#1E293B] tabular-nums mt-0.5">{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
              {metric.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span>统计周期：2026年</span>
              <button
                type="button"
                onClick={() => onShowToast(`${metric.title} 数据已刷新`, 'success')}
                className="px-3 py-1.5 rounded-lg bg-[#165DFF] hover:bg-[#104CE0] text-white font-medium transition cursor-pointer"
              >
                查询刷新
              </button>
            </div>
          </div>
          <div className="pt-4">
            <LineChartSvg
              series={[
                { name: '实际值', data: metric.data, color: '#165DFF' },
                { name: '目标值', data: EQ_BOARD_TREND_LABELS.map(() => metric.goal), color: '#10B981', dashed: true },
              ]}
              labels={EQ_BOARD_TREND_LABELS}
              height={280}
              width={820}
            />
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-[#475569]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-[#165DFF]" />
                实际值
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#10B981]" />
                目标基准 ({metric.goal}{metric.unit})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-5">
          <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
            季度均值对比
          </h3>
          <BarChartSvg data={quarterData} height={220} width={720} />
        </div>
      </div>
    );
  }

  /* ============================================================
   *  VIEW 4: 标准设备管理表格页 (22 Pages)
   * ============================================================ */
  const allVisibleSelected =
    visibleEntries.length > 0 &&
    visibleEntries.every((e) => selectedRowIndices.includes(e.origIdx));

  const toggleAllVisible = (checked: boolean) => {
    if (checked) {
      const merged = Array.from(new Set([...selectedRowIndices, ...visibleEntries.map((e) => e.origIdx)]));
      setSelectedIdsByPage((prev) => ({ ...prev, [pageKey]: merged }));
    } else {
      const visibleSet = new Set(visibleEntries.map((e) => e.origIdx));
      setSelectedIdsByPage((prev) => ({
        ...prev,
        [pageKey]: selectedRowIndices.filter((i) => !visibleSet.has(i)),
      }));
    }
  };

  const toggleRowCheck = (origIdx: number, checked: boolean) => {
    setSelectedIdsByPage((prev) => {
      const curr = prev[pageKey] || [];
      return {
        ...prev,
        [pageKey]: checked ? [...curr, origIdx] : curr.filter((i) => i !== origIdx),
      };
    });
  };

  const activeSubTab = subtabByPage[pageKey] || (cfg.subtabs ? cfg.subtabs[0] : '');
  const activeMainRowIdx = activeRowIdxByPage[pageKey] ?? (visibleEntries[0]?.origIdx ?? -1);
  const activeMainRow = activeMainRowIdx >= 0 ? rawRows[activeMainRowIdx] || null : null;
  const subTableRows = cfg.subtabs ? buildContextualSubRows(pageKey, activeSubTab, activeMainRow) : [];
  const activeFormDef = getFormDef(pageKey);

  return (
    <div className="space-y-4">
      {/* Search Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#165DFF]" />
            <span>查询条件</span>
            <span className="text-[11px] font-normal text-[#64748B]">({cfg.title})</span>
          </div>
          <button
            type="button"
            onClick={() => setFilterCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#165DFF] cursor-pointer"
          >
            {filterCollapsed ? '展开筛选' : '收起筛选'}
            {filterCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!filterCollapsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-3">
              {(cfg.search || []).map((f, idx) => {
                if (f.type === 'date') {
                  const preset = pageFilters[`_q_${f.label}`] || '';
                  return (
                    <div
                      key={`${f.label}-${idx}`}
                      className="md:col-span-2 xl:col-span-3 flex flex-wrap items-center gap-2"
                    >
                      <label className="w-24 text-right text-xs font-medium text-[#1E40AF] shrink-0">
                        {f.label}
                      </label>
                      <div className="inline-flex flex-wrap rounded-lg border border-[#CBD5E1] overflow-hidden">
                        {['今天', '本周', '本月', '最近三个月', '自定义'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              const range = getDateQuickRange(p);
                              setFiltersByPage((prev) => ({
                                ...prev,
                                [pageKey]: {
                                  ...(prev[pageKey] || {}),
                                  [`_q_${f.label}`]: p,
                                  [`_ds_${f.label}`]: range.start,
                                  [`_de_${f.label}`]: range.end,
                                },
                              }));
                            }}
                            className={`px-2.5 h-8 text-xs border-r last:border-r-0 border-[#CBD5E1] transition cursor-pointer ${
                              preset === p
                                ? 'bg-[#EFF6FF] text-[#165DFF] font-semibold'
                                : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={pageFilters[`_ds_${f.label}`] || ''}
                          onChange={(e) => updateFilter(`_ds_${f.label}`, e.target.value)}
                          className="h-8 px-2 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
                        />
                        <span className="text-[#94A3B8]">~</span>
                        <input
                          type="date"
                          value={pageFilters[`_de_${f.label}`] || ''}
                          onChange={(e) => updateFilter(`_de_${f.label}`, e.target.value)}
                          className="h-8 px-2 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
                        />
                      </div>
                    </div>
                  );
                }

                if (f.type === 'radio') {
                  const selectedVal = pageFilters[f.key] || 'ALL';
                  const isWide = (f.opts || []).length > 6;
                  return (
                    <div
                      key={`${f.label}-${idx}`}
                      className={`${isWide ? 'md:col-span-2 xl:col-span-3' : ''} flex items-start gap-2`}
                    >
                      <label className="w-24 text-right text-xs font-medium text-[#1E40AF] shrink-0 leading-8">
                        {f.label}
                      </label>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {['ALL', ...(f.opts || [])].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateFilter(f.key, opt)}
                            className={`px-2.5 h-7 rounded-md text-xs border transition cursor-pointer ${
                              selectedVal === opt
                                ? 'bg-[#EFF6FF] text-[#165DFF] border-[#93C5FD] font-semibold'
                                : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (f.type === 'select') {
                  return (
                    <div key={`${f.label}-${idx}`} className="flex items-center gap-2 min-w-0">
                      <label className="w-24 text-right text-xs font-medium text-[#1E40AF] shrink-0 truncate">
                        {f.label}
                      </label>
                      <select
                        value={pageFilters[f.key] ?? (f.opts?.[0] || '')}
                        onChange={(e) => updateFilter(f.key, e.target.value)}
                        className="flex-1 min-w-0 h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
                      >
                        {(f.opts || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt || '请选择'}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // Operator + text input
                const opOpts = f.opts && f.opts.length > 0 ? f.opts : ['包含', '不包含', '等于'];
                return (
                  <div key={`${f.label}-${idx}`} className="flex items-center gap-2 min-w-0">
                    <label className="w-24 text-right text-xs font-medium text-[#1E40AF] shrink-0 truncate">
                      {f.label}
                    </label>
                    <div className="flex flex-1 min-w-0 h-8 rounded-lg border border-[#CBD5E1] overflow-hidden focus-within:border-[#165DFF]">
                      <select
                        value={pageFilters[`_op_${f.key}`] || opOpts[0]}
                        onChange={(e) => updateFilter(`_op_${f.key}`, e.target.value)}
                        className="w-20 shrink-0 px-1.5 bg-[#F8FAFC] border-r border-[#CBD5E1] text-xs text-[#475569] outline-none"
                      >
                        {opOpts.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={pageFilters[f.key] || ''}
                        onChange={(e) => updateFilter(f.key, e.target.value)}
                        placeholder={opOpts[0] === '请选择' ? '请选择或输入' : '请输入'}
                        className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] outline-none bg-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={resetFilters}
                className="h-8 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-medium text-[#334155] transition cursor-pointer"
              >
                重置
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
                  onShowToast(`查询完成，共匹配 ${filteredEntries.length} 条记录`, 'info');
                }}
                className="h-8 px-4 rounded-lg bg-[#165DFF] hover:bg-[#104CE0] text-white text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                查询
              </button>
              <button
                type="button"
                onClick={() => onShowToast('列表数据已刷新', 'info')}
                className="h-8 w-8 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#64748B] flex items-center justify-center transition cursor-pointer"
                title="刷新数据"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Data Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[#E5E9F0] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {(cfg.buttons || []).map((btn) => {
              const isPrimary =
                btn.startsWith('+') || btn === '添加' || btn === '新增' || btn === '新增报废' || btn === '故障报修';
              const isDanger = btn.includes('删除');
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleToolbarAction(btn)}
                  className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer ${
                    isPrimary
                      ? 'bg-[#165DFF] hover:bg-[#104CE0] text-white shadow-xs'
                      : isDanger
                      ? 'border border-[#FDBA74] bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C]'
                      : 'border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#334155]'
                  }`}
                >
                  {isPrimary && <Plus className="w-3.5 h-3.5" />}
                  {isDanger && <Trash2 className="w-3.5 h-3.5" />}
                  {btn.includes('导出') && !isPrimary && <Download className="w-3.5 h-3.5" />}
                  {btn === '导入' && <Upload className="w-3.5 h-3.5" />}
                  <span>{btn.replace(/^[+-]/, '')}</span>
                </button>
              );
            })}
            {selectedRowIndices.length > 0 && (
              <span className="text-xs text-[#165DFF] bg-[#EFF6FF] px-2.5 py-1 rounded-md font-medium tabular-nums">
                已选 {selectedRowIndices.length} 项
              </span>
            )}
          </div>

          {/* Quick keyword search */}
          <div className="flex items-center h-8 rounded-lg border border-[#CBD5E1] overflow-hidden focus-within:border-[#165DFF]">
            <input
              type="text"
              value={pageFilters._kw || ''}
              onChange={(e) => updateFilter('_kw', e.target.value)}
              placeholder="关键字快速搜索..."
              className="w-44 px-2.5 text-xs text-[#1E293B] outline-none bg-white"
            />
            <span className="h-8 px-2.5 bg-[#F8FAFC] border-l border-[#E5E9F0] flex items-center text-[#64748B]">
              <Search className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Optional Stat Strip (kbList) */}
        {cfg.statRow && cfg.statRow.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-[#E5E9F0] bg-[#F8FAFC]/80 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E9F0]">
            {cfg.statRow.map((st) => (
              <div key={st.label} className="py-3 px-4 flex flex-col items-center justify-center">
                <span className="text-[11px] text-[#64748B]">{st.label}</span>
                <span className="text-lg font-bold text-[#1E40AF] tabular-nums mt-0.5">
                  {st.label === '知识库数量' ? rawRows.length : st.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#1E40AF] border-b border-[#E5E9F0]">
                {(cfg.cols || []).map((col) => {
                  if (col.cb) {
                    return (
                      <th key="_cb" className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={(e) => toggleAllVisible(e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-[#165DFF] cursor-pointer"
                        />
                      </th>
                    );
                  }
                  if (col.k === '_op') {
                    return (
                      <th
                        key="_op"
                        className="py-2.5 px-3 font-semibold whitespace-nowrap sticky right-0 bg-[#F8FAFC] shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]"
                      >
                        {col.t}
                      </th>
                    );
                  }
                  return (
                    <th
                      key={`${col.k}-${col.t}`}
                      onClick={() => {
                        if (!col.sort) return;
                        setSortByPage((prev) => {
                          const curr = prev[pageKey];
                          const nextAsc = curr && curr.key === col.k ? !curr.asc : true;
                          return { ...prev, [pageKey]: { key: col.k, asc: nextAsc } };
                        });
                      }}
                      className={`py-2.5 px-3 font-semibold whitespace-nowrap ${
                        col.sort ? 'cursor-pointer hover:text-[#165DFF] select-none' : ''
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.t}
                        {col.sort && (
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              pageSort?.key === col.k ? 'text-[#165DFF]' : 'text-[#94A3B8]'
                            }`}
                          />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] tabular-nums">
              {visibleEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={(cfg.cols || []).length || 1}
                    className="py-12 text-center text-xs text-[#94A3B8]"
                  >
                    暂无数据
                  </td>
                </tr>
              ) : (
                visibleEntries.map(({ row, origIdx }) => {
                  const isChecked = selectedRowIndices.includes(origIdx);
                  const isFocused = cfg.subtabs && activeMainRowIdx === origIdx;
                  return (
                    <tr
                      key={origIdx}
                      onClick={() => {
                        if (cfg.subtabs) {
                          setActiveRowIdxByPage((prev) => ({ ...prev, [pageKey]: origIdx }));
                        }
                      }}
                      className={`transition-colors ${
                        isFocused
                          ? 'bg-[#EFF6FF]/85'
                          : isChecked
                          ? 'bg-[#F0F7FF]'
                          : 'hover:bg-[#F8FAFC]'
                      } ${cfg.subtabs ? 'cursor-pointer' : ''}`}
                    >
                      {(cfg.cols || []).map((col) => {
                        if (col.cb) {
                          return (
                            <td
                              key="_cb"
                              className="py-2.5 px-3 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => toggleRowCheck(origIdx, e.target.checked)}
                                className="w-3.5 h-3.5 rounded accent-[#165DFF] cursor-pointer"
                              />
                            </td>
                          );
                        }
                        if (col.k === '_op') {
                          return (
                            <td
                              key="_op"
                              onClick={(e) => e.stopPropagation()}
                              className="py-2.5 px-3 whitespace-nowrap sticky right-0 bg-white/95 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]"
                            >
                              <div className="inline-flex items-center gap-2.5">
                                {(cfg.actions || []).map((act) => (
                                  <button
                                    key={act}
                                    type="button"
                                    onClick={() => handleRowAction(origIdx, act)}
                                    className={`text-xs font-medium transition cursor-pointer ${
                                      act === '删除'
                                        ? 'text-[#EA580C] hover:text-[#C2410C]'
                                        : 'text-[#165DFF] hover:text-[#104CE0]'
                                    }`}
                                  >
                                    {act}
                                  </button>
                                ))}
                              </div>
                            </td>
                          );
                        }
                        const val = row[col.k];
                        return (
                          <td
                            key={`${col.k}-${col.t}`}
                            className="py-2.5 px-3 text-[#334155] whitespace-nowrap max-w-[260px] truncate"
                            title={val != null ? String(val) : ''}
                          >
                            {col.tag ? renderTagBadge(val) : val != null && val !== '' ? String(val) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E5E9F0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
          <span className="tabular-nums">
            共计 <b className="text-[#1E293B]">{displayTotal}</b> 条
            {filteredEntries.length !== displayTotal && (
              <span className="text-[#94A3B8] ml-1.5">（当前展示样本 {filteredEntries.length} 条）</span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPageNumByPage((prev) => ({ ...prev, [pageKey]: Math.max(1, safePage - 1) }))}
              className="w-7 h-7 rounded-lg border border-[#CBD5E1] bg-white hover:border-[#165DFF] hover:text-[#165DFF] disabled:opacity-40 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPageNumByPage((prev) => ({ ...prev, [pageKey]: p }))}
                  className={`min-w-7 h-7 px-2 rounded-lg text-xs font-medium tabular-nums transition cursor-pointer ${
                    p === safePage
                      ? 'bg-[#165DFF] text-white border border-[#165DFF]'
                      : 'bg-white text-[#475569] border border-[#CBD5E1] hover:border-[#165DFF] hover:text-[#165DFF]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setPageNumByPage((prev) => ({ ...prev, [pageKey]: Math.min(totalPages, safePage + 1) }))
              }
              className="w-7 h-7 rounded-lg border border-[#CBD5E1] bg-white hover:border-[#165DFF] hover:text-[#165DFF] disabled:opacity-40 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSizeByPage((prev) => ({ ...prev, [pageKey]: Number(e.target.value) }));
                setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
              }}
              className="h-7 px-2 rounded-lg border border-[#CBD5E1] bg-white text-xs text-[#475569] outline-none"
            >
              <option value={10}>10 条/页</option>
              <option value={20}>20 条/页</option>
              <option value={50}>50 条/页</option>
            </select>
          </div>
        </div>

        {/* Linked Sub-Tabs & Sub-Table */}
        {cfg.subtabs && cfg.subtabs.length > 0 && (
          <div className="border-t-2 border-[#E5E9F0] bg-[#FAFBFD]">
            <div className="px-4 flex items-center justify-between border-b border-[#E5E9F0] bg-white">
              <div className="flex items-center gap-1">
                {cfg.subtabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSubtabByPage((prev) => ({ ...prev, [pageKey]: tab }))}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                      activeSubTab === tab
                        ? 'border-[#165DFF] text-[#165DFF]'
                        : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeMainRow && (
                <span className="text-[11px] text-[#64748B] hidden sm:inline">
                  当前关联：{String(activeMainRow.no || activeMainRow.code || activeMainRow.type || '')}{' '}
                  {activeMainRow.name ? `· ${String(activeMainRow.name)}` : ''}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#1E40AF] border-b border-[#E5E9F0]">
                    {(cfg.subCols || []).map((sc) => (
                      <th key={`${sc.k}-${sc.t}`} className="py-2 px-3 font-semibold whitespace-nowrap">
                        {sc.t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] bg-white">
                  {subTableRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={(cfg.subCols || []).length || 1}
                        className="py-6 text-center text-xs text-[#94A3B8]"
                      >
                        暂无关联明细数据
                      </td>
                    </tr>
                  ) : (
                    subTableRows.map((sr, sIdx) => (
                      <tr key={sIdx} className="hover:bg-[#F8FAFC]">
                        {(cfg.subCols || []).map((sc) => (
                          <td key={`${sc.k}-${sc.t}`} className="py-2 px-3 text-[#334155] whitespace-nowrap">
                            {sc.k === '_op' ? (
                              <button
                                type="button"
                                onClick={() => onShowToast('已打开部位明细配置', 'info')}
                                className="text-[#165DFF] hover:underline font-medium cursor-pointer"
                              >
                                编辑
                              </button>
                            ) : (
                              String(sr[sc.k] ?? '-')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit / View Multi-Tab Form Modal */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#0B2860] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FilePlus2 className="w-4 h-4 text-[#93C5FD]" />
                <span className="text-sm font-bold">
                  {formModal.readonly ? '查看' : formModal.actionLabel} - {activeFormDef.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormModal((prev) => ({ ...prev, open: false }))}
                className="p-1 rounded-lg hover:bg-white/15 text-[#C8DAFA] hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Group Tabs */}
            {activeFormDef.groups.length > 1 && (
              <div className="px-5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center gap-2 shrink-0">
                {activeFormDef.groups.map((grp, gi) => (
                  <button
                    key={grp.name}
                    type="button"
                    onClick={() => setFormModal((prev) => ({ ...prev, activeGroupIdx: gi }))}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                      formModal.activeGroupIdx === gi
                        ? 'border-[#165DFF] text-[#165DFF]'
                        : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {grp.name}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {activeFormDef.groups.map((grp, gi) => {
                if (gi !== formModal.activeGroupIdx) return null;
                return (
                  <div key={grp.name} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {grp.fields.map((field: EqFormField) => (
                      <div
                        key={field.key}
                        className={`${field.full ? 'md:col-span-2' : ''} flex items-start gap-3`}
                      >
                        <label className="w-24 text-right text-xs font-medium text-[#1E40AF] shrink-0 pt-2">
                          {field.required && <span className="text-[#EA580C] mr-0.5">*</span>}
                          {field.label}
                        </label>
                        <div className="flex-1 min-w-0">
                          {field.type === 'select' ? (
                            <select
                              disabled={formModal.readonly}
                              value={formModal.values[field.key] || ''}
                              onChange={(e) =>
                                setFormModal((prev) => ({
                                  ...prev,
                                  values: { ...prev.values, [field.key]: e.target.value },
                                }))
                              }
                              className="w-full h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white disabled:bg-[#F8FAFC] text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
                            >
                              <option value="">请选择</option>
                              {(field.opts || []).map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              readOnly={formModal.readonly}
                              rows={3}
                              value={formModal.values[field.key] || ''}
                              onChange={(e) =>
                                setFormModal((prev) => ({
                                  ...prev,
                                  values: { ...prev.values, [field.key]: e.target.value },
                                }))
                              }
                              className="w-full p-2.5 rounded-lg border border-[#CBD5E1] bg-white read-only:bg-[#F8FAFC] text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
                            />
                          ) : field.type === 'upload' ? (
                            <div className="flex items-start gap-3">
                              <label
                                className={`w-20 h-20 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center text-[#64748B] shrink-0 ${
                                  formModal.readonly
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:border-[#165DFF] hover:text-[#165DFF] cursor-pointer'
                                }`}
                              >
                                <Upload className="w-5 h-5" />
                                <span className="text-[11px] mt-1">点击上传</span>
                                <input
                                  type="file"
                                  disabled={formModal.readonly}
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (!f) return;
                                    setFormModal((prev) => ({
                                      ...prev,
                                      uploadedFiles: {
                                        ...prev.uploadedFiles,
                                        [field.key]: [...(prev.uploadedFiles[field.key] || []), f.name],
                                      },
                                    }));
                                  }}
                                />
                              </label>
                              <div className="text-[11px] text-[#64748B] space-y-1 pt-1">
                                <p>{field.hint || '支持常见图片与文档格式上传'}</p>
                                {(formModal.uploadedFiles[field.key] || []).length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {(formModal.uploadedFiles[field.key] || []).map((fname, fi) => (
                                      <span
                                        key={`${fname}-${fi}`}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EFF6FF] text-[#165DFF] border border-[#BFDBFE]"
                                      >
                                        {fname}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <input
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              readOnly={formModal.readonly}
                              value={formModal.values[field.key] || ''}
                              onChange={(e) =>
                                setFormModal((prev) => ({
                                  ...prev,
                                  values: { ...prev.values, [field.key]: e.target.value },
                                }))
                              }
                              className="w-full h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white read-only:bg-[#F8FAFC] text-xs text-[#1E293B] outline-none focus:border-[#165DFF]"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Optional Form Subtable */}
              {formModal.activeGroupIdx === 0 && (activeFormDef.subtable || activeFormDef.subCols) && (
                <div className="pt-4 border-t border-[#E5E9F0]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#165DFF]" />
                      {activeFormDef.subtable?.title || activeFormDef.subtabs?.[0] || '明细清单'}
                    </span>
                    {!formModal.readonly && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const cols = activeFormDef.subtable?.cols || activeFormDef.subCols || [];
                            const blank: EqRow = {};
                            cols.forEach((c) => {
                              blank[c.key] = '';
                            });
                            setFormModal((prev) => ({ ...prev, subRows: [...prev.subRows, blank] }));
                          }}
                          className="h-7 px-2.5 rounded-lg bg-[#EFF6FF] text-[#165DFF] hover:bg-[#DBEAFE] text-xs font-medium cursor-pointer"
                        >
                          + 新增行
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="border border-[#E5E9F0] rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8FAFC] text-[#1E40AF] border-b border-[#E5E9F0]">
                          {(activeFormDef.subtable?.cols || activeFormDef.subCols || []).map((c) => (
                            <th key={c.key} className="py-2 px-3 font-semibold">
                              {c.label}
                            </th>
                          ))}
                          {!formModal.readonly && <th className="py-2 px-3 w-16 font-semibold">操作</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {formModal.subRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={(activeFormDef.subtable?.cols || activeFormDef.subCols || []).length + 1}
                              className="py-6 text-center text-[#94A3B8]"
                            >
                              暂无明细行
                            </td>
                          </tr>
                        ) : (
                          formModal.subRows.map((sr, ri) => (
                            <tr key={ri}>
                              {(activeFormDef.subtable?.cols || activeFormDef.subCols || []).map((c) => (
                                <td key={c.key} className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    readOnly={formModal.readonly}
                                    value={String(sr[c.key] ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormModal((prev) => {
                                        const next = [...prev.subRows];
                                        next[ri] = { ...next[ri], [c.key]: val };
                                        return { ...prev, subRows: next };
                                      });
                                    }}
                                    className="w-full h-7 px-2 rounded border border-[#E2E8F0] read-only:border-transparent read-only:bg-transparent text-xs outline-none focus:border-[#165DFF]"
                                  />
                                </td>
                              ))}
                              {!formModal.readonly && (
                                <td className="py-1.5 px-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormModal((prev) => ({
                                        ...prev,
                                        subRows: prev.subRows.filter((_, i) => i !== ri),
                                      }))
                                    }
                                    className="text-[#EA580C] hover:underline cursor-pointer"
                                  >
                                    删除
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-end gap-2 shrink-0">
              {formModal.readonly ? (
                <button
                  type="button"
                  onClick={() => setFormModal((prev) => ({ ...prev, open: false }))}
                  className="h-8 px-4 rounded-lg bg-[#165DFF] hover:bg-[#104CE0] text-white text-xs font-medium cursor-pointer"
                >
                  关闭
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setFormModal((prev) => ({ ...prev, open: false }))}
                    className="h-8 px-4 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-medium text-[#334155] cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveForm(false)}
                    className="h-8 px-4 rounded-lg border border-[#165DFF] text-[#165DFF] bg-white hover:bg-[#EFF6FF] text-xs font-medium cursor-pointer"
                  >
                    保存不退出
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveForm(true)}
                    className="h-8 px-4 rounded-lg bg-[#165DFF] hover:bg-[#104CE0] text-white text-xs font-medium cursor-pointer"
                  >
                    保存并退出
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* More Row Actions Modal */}
      {moreModal.open && moreModal.rowIndex != null && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between">
              <span className="text-sm font-bold text-[#1E293B]">更多操作</span>
              <button
                type="button"
                onClick={() => setMoreModal({ open: false, rowIndex: null })}
                className="text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {[
                {
                  label: '查看详细信息',
                  fn: () => openRecordModal(moreModal.rowIndex, '查看', true),
                },
                {
                  label: '编辑当前记录',
                  fn: () => openRecordModal(moreModal.rowIndex, '修改', false),
                },
                {
                  label: '复制并新增',
                  fn: () => {
                    const src = rawRows[moreModal.rowIndex!];
                    if (src) {
                      setRowsByPage((prev) => ({
                        ...prev,
                        [pageKey]: [{ ...src, code: `${String(src.code || 'NEW')}-COPY` }, ...(prev[pageKey] || [])],
                      }));
                      onShowToast('已复制记录并添加到列表顶部', 'success');
                    }
                  },
                },
                {
                  label: '导出当前台账 CSV',
                  fn: () => handleExportCsv(),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMoreModal({ open: false, rowIndex: null });
                    item.fn();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border border-[#E5E9F0] hover:border-[#93C5FD] hover:bg-[#EFF6FF] text-xs font-medium text-[#334155] hover:text-[#165DFF] transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
              <span className="text-sm font-bold text-[#1E293B]">操作确认</span>
            </div>
            <div className="p-5 text-xs text-[#334155] leading-relaxed">{confirmState.message}</div>
            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E5E9F0] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmState({ open: false, message: '', onConfirm: null })}
                className="h-8 px-4 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-medium text-[#334155] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const cb = confirmState.onConfirm;
                  setConfirmState({ open: false, message: '', onConfirm: null });
                  if (cb) cb();
                }}
                className="h-8 px-4 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-medium cursor-pointer"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
