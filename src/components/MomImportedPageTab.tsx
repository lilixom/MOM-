import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownUp,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Columns3,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Layers,
  Maximize2,
  Play,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { MomLeafMeta } from '../data/momImportedMenu';
import type {
  MomPageSpec,
  MomSpecChart,
  MomSpecCol,
  MomSpecTraceNode,
} from '../data/momImportedSpecs';

interface MomImportedPageTabProps {
  pageId: string;
  leafMeta?: MomLeafMeta;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type RowRecord = Record<string, unknown> & { __id: string };

let cachedSpecs: Record<string, MomPageSpec> | null = null;
let specsLoadingPromise: Promise<Record<string, MomPageSpec>> | null = null;

async function loadImportedSpecs(): Promise<Record<string, MomPageSpec>> {
  if (cachedSpecs) return cachedSpecs;
  if (!specsLoadingPromise) {
    specsLoadingPromise = import('../data/momImportedSpecs').then((mod) => {
      cachedSpecs = mod.MOM_IMPORTED_SPECS;
      return cachedSpecs;
    });
  }
  return specsLoadingPromise;
}

const CHART_COLORS = ['#165DFF', '#0EA5E9', '#10B981', '#F59E0B', '#6366F1', '#EF4444'];

const ARCH_LABEL: Record<string, string> = {
  list: '列表查询',
  report: '报表分析',
  form: '单据处理',
  config: '基础配置',
  dashboard: '数字看板',
  trace: '信息追溯',
  iot: 'IOT 采集',
};

const STATUS_BADGE_MAP: Record<string, string> = {
  已审核: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  启用: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  合格: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  已完成: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  正常: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  运行中: 'bg-blue-50 text-blue-700 border-blue-200',
  待审核: 'bg-amber-50 text-amber-700 border-amber-200',
  草稿: 'bg-slate-100 text-slate-700 border-slate-200',
  待检: 'bg-amber-50 text-amber-700 border-amber-200',
  停用: 'bg-rose-50 text-rose-700 border-rose-200',
  不合格: 'bg-rose-50 text-rose-700 border-rose-200',
  异常: 'bg-rose-50 text-rose-700 border-rose-200',
  停机: 'bg-rose-50 text-rose-700 border-rose-200',
};

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportRowsToCsv(title: string, cols: MomSpecCol[], rows: RowRecord[], suffix?: string) {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = cols.map((c) => esc(c.title)).join(',');
  const body = rows.map((r) => cols.map((c) => esc(r[c.key])).join(',')).join('\n');
  const fileTitle = suffix ? `${title}-${suffix}` : title;
  downloadFile(`${fileTitle}-20261118.csv`, '\ufeff' + header + '\n' + body, 'text/csv;charset=utf-8');
}

function parseNumericValue(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const cleaned = String(v ?? '').replace(/[,%\s]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const MomSvgChart: React.FC<{
  chart: MomSpecChart;
  svgRef?: (el: SVGSVGElement | null) => void;
}> = ({ chart, svgRef }) => {
  const [viewMode, setViewMode] = useState<'bar' | 'line'>(
    chart.type === 'line' ? 'line' : 'bar'
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    setViewMode(chart.type === 'line' ? 'line' : 'bar');
  }, [chart.type, chart.title]);

  const isPie = chart.type === 'pie';
  const pieItems = (chart.pie || chart.data || []).map((d, i) => ({
    name: d.label || d.name || `项${i + 1}`,
    value: Number(d.value) || 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const labels = chart.labels || [];
  const series = (chart.series || []).map((s, i) => ({
    name: s.name,
    values: (s.data || s.values || []).map((x) => Number(x) || 0),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const width = 560;
  const height = 230;
  const pad = { top: 22, right: 20, bottom: 34, left: 46 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const allVals = series.flatMap((s) => s.values);
  const maxVal = Math.max(10, ...allVals) * 1.12;
  const ticks = 4;

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-xs flex flex-col">
      <div className="px-4 py-3 border-b border-[#EEF2F7] flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#0F172A] truncate">{chart.title}</span>
        {!isPie && (
          <div className="inline-flex border border-[#DCE3EE] rounded-md overflow-hidden shrink-0 bg-[#F8FAFC]">
            <button
              type="button"
              onClick={() => setViewMode('bar')}
              className={`px-2.5 py-1 text-[11px] font-medium cursor-pointer transition whitespace-nowrap ${
                viewMode === 'bar'
                  ? 'bg-[#165DFF] text-white'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              柱状
            </button>
            <button
              type="button"
              onClick={() => setViewMode('line')}
              className={`px-2.5 py-1 text-[11px] font-medium cursor-pointer transition whitespace-nowrap ${
                viewMode === 'line'
                  ? 'bg-[#165DFF] text-white'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              折线
            </button>
          </div>
        )}
      </div>

      <div className="p-3.5">
        {isPie ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 min-h-[210px]">
            <svg
              ref={svgRef}
              viewBox="0 0 220 200"
              className="w-48 h-44 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              {(() => {
                const total = pieItems.reduce((acc, p) => acc + p.value, 0) || 1;
                let angle = -Math.PI / 2;
                const cx = 110;
                const cy = 100;
                const rOuter = 78;
                const rInner = 44;
                return pieItems.map((item, idx) => {
                  const slice = (item.value / total) * Math.PI * 2;
                  const a1 = angle;
                  const a2 = angle + slice;
                  angle = a2;
                  const large = slice > Math.PI ? 1 : 0;
                  const x1 = cx + rOuter * Math.cos(a1);
                  const y1 = cy + rOuter * Math.sin(a1);
                  const x2 = cx + rOuter * Math.cos(a2);
                  const y2 = cy + rOuter * Math.sin(a2);
                  const x3 = cx + rInner * Math.cos(a2);
                  const y3 = cy + rInner * Math.sin(a2);
                  const x4 = cx + rInner * Math.cos(a1);
                  const y4 = cy + rInner * Math.sin(a1);
                  const d = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
                  return (
                    <path
                      key={idx}
                      d={d}
                      fill={item.color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      opacity={hoveredIdx === null || hoveredIdx === idx ? 1 : 0.45}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="cursor-pointer transition-opacity"
                    />
                  );
                });
              })()}
              <text
                x="110"
                y="96"
                textAnchor="middle"
                className="fill-[#64748B] text-[10px]"
              >
                {hoveredIdx !== null && pieItems[hoveredIdx]
                  ? pieItems[hoveredIdx].name
                  : '合计占比'}
              </text>
              <text
                x="110"
                y="113"
                textAnchor="middle"
                className="fill-[#0F172A] text-[13px] font-bold font-mono"
              >
                {hoveredIdx !== null && pieItems[hoveredIdx]
                  ? pieItems[hoveredIdx].value
                  : pieItems.reduce((a, b) => a + b.value, 0)}
              </text>
            </svg>
            <div className="flex-1 w-full space-y-1.5 text-xs">
              {pieItems.map((it, idx) => {
                const total = pieItems.reduce((a, b) => a + b.value, 0) || 1;
                const pct = ((it.value / total) * 100).toFixed(1);
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`flex items-center justify-between px-2 py-1 rounded transition cursor-default ${
                      hoveredIdx === idx ? 'bg-[#F1F5F9]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: it.color }}
                      />
                      <span className="text-[#334155] truncate">{it.name}</span>
                    </div>
                    <span className="font-mono tabular-nums text-[#0F172A] font-medium shrink-0 ml-2">
                      {it.value} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-[215px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid lines */}
              {Array.from({ length: ticks + 1 }).map((_, idx) => {
                const y = pad.top + (plotH * idx) / ticks;
                const val = Math.round(maxVal * (1 - idx / ticks));
                return (
                  <g key={idx}>
                    <line
                      x1={pad.left}
                      y1={y}
                      x2={width - pad.right}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={idx === ticks ? undefined : '3 3'}
                    />
                    <text
                      x={pad.left - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748B"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X labels */}
              {labels.map((lb, idx) => {
                const count = Math.max(1, labels.length);
                const step = plotW / count;
                const x =
                  viewMode === 'bar'
                    ? pad.left + step * idx + step / 2
                    : pad.left + (count === 1 ? plotW / 2 : (plotW * idx) / (count - 1));
                const showLabel =
                  labels.length <= 12 || idx % Math.ceil(labels.length / 10) === 0;
                return (
                  showLabel && (
                    <text
                      key={idx}
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748B"
                    >
                      {lb.length > 8 ? lb.slice(0, 8) + '…' : lb}
                    </text>
                  )
                );
              })}

              {/* Series */}
              {viewMode === 'bar' ? (
                labels.map((_, lIdx) => {
                  const groupW = plotW / Math.max(1, labels.length);
                  const sCount = Math.max(1, series.length);
                  const barW = Math.min(28, (groupW * 0.68) / sCount);
                  const groupStart =
                    pad.left + groupW * lIdx + (groupW - barW * sCount) / 2;
                  return series.map((s, sIdx) => {
                    const v = s.values[lIdx] ?? 0;
                    const barH = Math.max(2, (v / maxVal) * plotH);
                    const x = groupStart + sIdx * barW + sIdx * 2;
                    const y = pad.top + plotH - barH;
                    return (
                      <g key={`${sIdx}-${lIdx}`}>
                        <rect
                          x={x}
                          y={y}
                          width={Math.max(4, barW - 2)}
                          height={barH}
                          rx={2}
                          fill={s.color}
                          opacity={hoveredIdx === null || hoveredIdx === lIdx ? 0.92 : 0.45}
                          onMouseEnter={() => setHoveredIdx(lIdx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <title>{`${labels[lIdx]} · ${s.name}: ${v}`}</title>
                        </rect>
                      </g>
                    );
                  });
                })
              ) : (
                series.map((s, sIdx) => {
                  const count = Math.max(1, labels.length);
                  const pts = labels.map((_, idx) => {
                    const v = s.values[idx] ?? 0;
                    const x =
                      pad.left +
                      (count === 1 ? plotW / 2 : (plotW * idx) / (count - 1));
                    const y = pad.top + plotH - (v / maxVal) * plotH;
                    return { x, y, v };
                  });
                  const pathD = pts
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                    .join(' ');
                  return (
                    <g key={sIdx}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {pts.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r={hoveredIdx === i ? 5 : 3.5}
                          fill="#FFFFFF"
                          stroke={s.color}
                          strokeWidth={2}
                          onMouseEnter={() => setHoveredIdx(i)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <title>{`${labels[i]} · ${s.name}: ${p.v}`}</title>
                        </circle>
                      ))}
                    </g>
                  );
                })
              )}
            </svg>

            {series.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-[#F1F5F9] mt-1">
                {series.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#475569]">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const MomImportedPageTab: React.FC<MomImportedPageTabProps> = ({
  pageId,
  leafMeta,
  onShowToast,
}) => {
  const [specsMap, setSpecsMap] = useState<Record<string, MomPageSpec> | null>(cachedSpecs);
  const [activeSubTab, setActiveSubTab] = useState<number>(0);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState<boolean>(false);

  // Filter values keyed by filter index
  const [filterValues, setFilterValues] = useState<Record<number, string>>({});
  const [dateRangeValues, setDateRangeValues] = useState<
    Record<number, { from: string; to: string }>
  >({});

  // Working rows state (editable in-memory)
  const [baseRows, setBaseRows] = useState<RowRecord[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<number, string>>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [hiddenCols, setHiddenCols] = useState<Record<string, boolean>>({});
  const [reportChartType, setReportChartType] = useState<'bar' | 'line'>('bar');

  // IOT live chart simulation
  const [iotAutoRefresh, setIotAutoRefresh] = useState<boolean>(false);
  const [iotSeries, setIotSeries] = useState<number[]>(() =>
    Array.from({ length: 24 }, () => 62 + Math.round(Math.random() * 18))
  );

  // Modals & Drawers
  const [detailRow, setDetailRow] = useState<RowRecord | null>(null);
  const [traceNodeDrawer, setTraceNodeDrawer] = useState<MomSpecTraceNode | null>(null);
  const [curveDrawerRow, setCurveDrawerRow] = useState<RowRecord | null>(null);
  const [formModal, setFormModal] = useState<{
    mode: 'create' | 'edit';
    row?: RowRecord;
  } | null>(null);
  const [formDraft, setFormDraft] = useState<Record<string, string>>({});
  const [colSettingsOpen, setColSettingsOpen] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [printModalRow, setPrintModalRow] = useState<RowRecord | 'all' | null>(null);
  const [rangeModalOpen, setRangeModalOpen] = useState<boolean>(false);
  const [selectedRangeLabel, setSelectedRangeLabel] = useState<string>('本月');
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const firstSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!specsMap) {
      loadImportedSpecs().then(setSpecsMap);
    }
  }, [specsMap]);

  const spec: MomPageSpec | null = useMemo(() => {
    if (!specsMap) return null;
    if (specsMap[pageId]) return specsMap[pageId];
    if (leafMeta) {
      return {
        id: leafMeta.id,
        title: leafMeta.name,
        module: leafMeta.module,
        group: leafMeta.group,
        path: leafMeta.path,
        arch: leafMeta.arch || 'list',
        desc: `${leafMeta.path} 页面功能视图`,
        filters: [{ label: '关键字', type: 'text', ph: '编码/名称' }],
        actions: [
          { t: '新增', a: 'create', primary: true },
          { t: '导出', a: 'export' },
        ],
        rowActions: ['详情', '编辑', '删除'],
        cols: [
          { key: 'code', title: '编码', w: 140, sort: true },
          { key: 'name', title: '名称', w: 200, sort: true },
          { key: 'status', title: '状态', w: 110, sort: true },
          { key: 'updTime', title: '更新时间', w: 160, sort: true },
        ],
        rows: [],
      };
    }
    return null;
  }, [specsMap, pageId, leafMeta]);

  // Reset per-page state when navigating between pages
  useEffect(() => {
    if (!spec) return;
    const normalized: RowRecord[] = (spec.rows || []).map((r, idx) => ({
      ...(r as Record<string, unknown>),
      __id: String((r as Record<string, unknown>).__id ?? `${spec.id}-r-${idx}`),
    }));
    setBaseRows(normalized);
    setActiveSubTab(0);
    setFilterValues({});
    setAppliedFilters({});
    setDateRangeValues({});
    setSelectedIds({});
    setSortCol(null);
    setSortDir('asc');
    setPage(1);
    setHiddenCols({});
    setMoreFiltersOpen(false);
    setDetailRow(null);
    setTraceNodeDrawer(null);
    setCurveDrawerRow(null);
    setFormModal(null);
    setColSettingsOpen(false);
    setImportModalOpen(false);
    setPrintModalRow(null);
    setIotAutoRefresh(false);
    setIotSeries(Array.from({ length: 24 }, () => 62 + Math.round(Math.random() * 18)));
  }, [spec?.id]);

  // IOT 3-second auto refresh
  useEffect(() => {
    if (!iotAutoRefresh) return;
    const timer = window.setInterval(() => {
      setIotSeries(Array.from({ length: 24 }, () => 60 + Math.round(Math.random() * 20)));
    }, 3000);
    return () => window.clearInterval(timer);
  }, [iotAutoRefresh]);

  const cols: MomSpecCol[] = useMemo(() => spec?.cols || [], [spec]);
  const visibleCols = useMemo(
    () => cols.filter((c) => !hiddenCols[c.key]),
    [cols, hiddenCols]
  );

  const filteredRows = useMemo(() => {
    const activeConds = Object.values(appliedFilters)
      .map((val) => String(val ?? '').trim())
      .filter((v) => v && v !== '全部');

    let list = baseRows;
    if (activeConds.length > 0) {
      list = list.filter((row) =>
        activeConds.every((cond) => {
          const low = cond.toLowerCase();
          return Object.entries(row).some(
            ([k, v]) => k !== '__id' && String(v ?? '').toLowerCase().includes(low)
          );
        })
      );
    }

    if (sortCol) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const av = a[sortCol];
        const bv = b[sortCol];
        const an = Number(String(av ?? '').replace(/[,%]/g, ''));
        const bn = Number(String(bv ?? '').replace(/[,%]/g, ''));
        if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== '' && bv !== '') {
          return (an - bn) * dir;
        }
        return String(av ?? '').localeCompare(String(bv ?? ''), 'zh-CN') * dir;
      });
    }
    return list;
  }, [baseRows, appliedFilters, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const selectedRows = useMemo(
    () => filteredRows.filter((r) => selectedIds[r.__id]),
    [filteredRows, selectedIds]
  );

  const allOnPageSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds[r.__id]);

  // Report trend chart spec
  const reportChartSpec: MomSpecChart | null = useMemo(() => {
    if (!spec || spec.arch !== 'report' || filteredRows.length < 4) return null;
    const numCols = cols
      .filter(
        (c) =>
          /数量|金额|率|占比|数$|工时|天|次数|量/.test(c.title) &&
          !/号|编码|编号/.test(c.title)
      )
      .slice(0, 2);
    if (!numCols.length) return null;
    const labelCol =
      cols.find((c) => /日期|时间|线体|仓库|产品|班次|供应商|客户|物料/.test(c.title)) ||
      cols[0];
    if (!labelCol) return null;
    const slice = filteredRows.slice(0, 12);
    return {
      type: reportChartType,
      title: `${spec.title} · 趋势分析`,
      labels: slice.map((r) => String(r[labelCol.key] ?? '')),
      series: numCols.map((c) => ({
        name: c.title.replace(/[（(].*?[)）]/g, '').trim() || c.title,
        data: slice.map((r) => parseNumericValue(r[c.key])),
      })),
    };
  }, [spec, cols, filteredRows, reportChartType]);

  if (!spec) {
    return (
      <div className="bg-white border border-[#E5E9F0] rounded-lg p-8 text-center text-xs text-[#64748B]">
        正在加载页面规格与业务数据...
      </div>
    );
  }

  const handleQuery = () => {
    setAppliedFilters({ ...filterValues });
    setPage(1);
    const activeCount = Object.values(filterValues).filter((v) => v && v !== '全部').length;
    onShowToast(
      activeCount > 0 ? `已应用 ${activeCount} 个筛选条件完成查询` : '已完成列表数据查询',
      'success'
    );
  };

  const handleResetFilters = () => {
    setFilterValues({});
    setAppliedFilters({});
    setDateRangeValues({});
    setPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const openCreateModal = () => {
    const draft: Record<string, string> = {};
    cols.slice(0, 10).forEach((c) => {
      draft[c.key] = '';
    });
    setFormDraft(draft);
    setFormModal({ mode: 'create' });
  };

  const openEditModal = (row: RowRecord) => {
    const draft: Record<string, string> = {};
    cols.slice(0, 10).forEach((c) => {
      draft[c.key] = row[c.key] === undefined || row[c.key] === null ? '' : String(row[c.key]);
    });
    setFormDraft(draft);
    setFormModal({ mode: 'edit', row });
  };

  const handleSubmitForm = () => {
    if (!formModal) return;
    const fields = cols.slice(0, 10);
    for (let i = 0; i < Math.min(3, fields.length); i++) {
      const f = fields[i];
      if (!formDraft[f.key]?.trim()) {
        onShowToast(`请填写必填字段：${f.title}`, 'warning');
        return;
      }
    }

    if (formModal.mode === 'create') {
      const newRow: RowRecord = {
        __id: `${spec.id}-new-${Date.now()}`,
      };
      cols.forEach((c) => {
        newRow[c.key] = formDraft[c.key] ?? '';
      });
      setBaseRows((prev) => [newRow, ...prev]);
      setFormModal(null);
      onShowToast(`已新增 1 条${spec.title}记录`, 'success');
    } else if (formModal.row) {
      const targetId = formModal.row.__id;
      setBaseRows((prev) =>
        prev.map((r) => (r.__id === targetId ? { ...r, ...formDraft } : r))
      );
      setFormModal(null);
      onShowToast('修改已保存并更新至列表', 'success');
    }
  };

  const runToolbarAction = (actionCode: string, label: string) => {
    switch (actionCode) {
      case 'query':
        handleQuery();
        break;
      case 'create':
        openCreateModal();
        break;
      case 'edit':
        if (!selectedRows.length) {
          onShowToast('请先勾选一行再点击编辑', 'warning');
          return;
        }
        openEditModal(selectedRows[0]);
        break;
      case 'delete':
        if (!selectedRows.length) {
          onShowToast('请先勾选要删除的记录', 'warning');
          return;
        }
        setConfirmState({
          title: '删除确认',
          danger: true,
          message: `确认删除选中的 ${selectedRows.length} 条记录？`,
          onConfirm: () => {
            const ids = new Set(selectedRows.map((r) => r.__id));
            setBaseRows((prev) => prev.filter((r) => !ids.has(r.__id)));
            setSelectedIds({});
            setConfirmState(null);
            onShowToast(`已删除 ${ids.size} 条记录`, 'success');
          },
        });
        break;
      case 'audit':
      case 'unaudit': {
        if (!selectedRows.length) {
          onShowToast('请先勾选要操作的记录', 'warning');
          return;
        }
        const nextStatus = actionCode === 'audit' ? '已审核' : '待审核';
        setConfirmState({
          title: actionCode === 'audit' ? '审核确认' : '反审核确认',
          message: `确认将选中的 ${selectedRows.length} 条记录状态置为「${nextStatus}」？`,
          onConfirm: () => {
            const ids = new Set(selectedRows.map((r) => r.__id));
            setBaseRows((prev) =>
              prev.map((r) =>
                ids.has(r.__id)
                  ? { ...r, status: r.status !== undefined ? nextStatus : r.status }
                  : r
              )
            );
            setConfirmState(null);
            onShowToast(`已更新 ${ids.size} 条记录为${nextStatus}`, 'success');
          },
        });
        break;
      }
      case 'toggle':
        if (!selectedRows.length) {
          onShowToast('请先勾选需要启用/停用的记录', 'warning');
          return;
        }
        setConfirmState({
          title: '启用/停用确认',
          message: `确认切换选中 ${selectedRows.length} 条记录的启用状态？`,
          onConfirm: () => {
            const ids = new Set(selectedRows.map((r) => r.__id));
            setBaseRows((prev) =>
              prev.map((r) => {
                if (!ids.has(r.__id)) return r;
                if (r.flag !== undefined) {
                  return { ...r, flag: r.flag === '停用' ? '启用' : '停用' };
                }
                if (r.status !== undefined) {
                  return { ...r, status: r.status === '停用' ? '启用' : '停用' };
                }
                return r;
              })
            );
            setConfirmState(null);
            onShowToast(`已切换 ${ids.size} 条记录状态`, 'success');
          },
        });
        break;
      case 'export':
        if (!filteredRows.length) {
          onShowToast('当前没有可导出的数据', 'warning');
          return;
        }
        exportRowsToCsv(spec.title, cols, filteredRows);
        onShowToast(`已导出 ${filteredRows.length} 条数据到 CSV`, 'success');
        break;
      case 'import':
        setImportText('');
        setImportModalOpen(true);
        break;
      case 'print':
        setPrintModalRow('all');
        break;
      case 'refresh':
        onShowToast(`「${spec.title}」数据已刷新`, 'success');
        break;
      case 'columns':
        setColSettingsOpen(true);
        break;
      case 'fullscreen':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
          onShowToast('已进入全屏视图，按 Esc 可退出', 'info');
        } else {
          document.exitFullscreen?.().catch(() => {});
          onShowToast('已退出全屏视图', 'info');
        }
        break;
      case 'exportImg':
        if (firstSvgRef.current) {
          const src = '<?xml version="1.0" encoding="UTF-8"?>\n' + firstSvgRef.current.outerHTML;
          downloadFile(`${spec.title}-图表.svg`, src, 'image/svg+xml');
          onShowToast('图表已导出为 SVG 图片', 'success');
        } else {
          onShowToast('当前页面暂无可导出的图表', 'warning');
        }
        break;
      case 'range':
        setRangeModalOpen(true);
        break;
      default:
        onShowToast(`已执行「${label}」操作`, 'info');
    }
  };

  const handleRowAction = (actionLabel: string, row: RowRecord) => {
    if (actionLabel === '详情' || actionLabel === '查看' || actionLabel === '查看链路') {
      setDetailRow(row);
    } else if (actionLabel === '编辑' || actionLabel === '修改') {
      openEditModal(row);
    } else if (actionLabel === '删除') {
      setConfirmState({
        title: '删除记录',
        danger: true,
        message: '确认删除该条记录？',
        onConfirm: () => {
          setBaseRows((prev) => prev.filter((r) => r.__id !== row.__id));
          setConfirmState(null);
          onShowToast('已删除该条记录', 'success');
        },
      });
    } else if (actionLabel === '审核' || actionLabel === '反审核') {
      const next = actionLabel === '审核' ? '已审核' : '待审核';
      setBaseRows((prev) =>
        prev.map((r) => (r.__id === row.__id ? { ...r, status: next } : r))
      );
      onShowToast(`已置为「${next}」`, 'success');
    } else if (actionLabel === '停用' || actionLabel === '启用') {
      setBaseRows((prev) =>
        prev.map((r) => {
          if (r.__id !== row.__id) return r;
          const next = r.flag === '停用' || r.status === '停用' ? '启用' : '停用';
          return {
            ...r,
            ...(r.flag !== undefined ? { flag: next } : { status: next }),
          };
        })
      );
      onShowToast(`已切换为「${actionLabel}」`, 'success');
    } else if (actionLabel === '打印') {
      setPrintModalRow(row);
    } else if (actionLabel === '导出') {
      exportRowsToCsv(spec.title, cols, [row], '单条明细');
      onShowToast('已导出该条明细 CSV', 'success');
    } else if (actionLabel === '查看曲线') {
      setCurveDrawerRow(row);
    } else {
      onShowToast(`已触发「${actionLabel}」操作`, 'info');
    }
  };

  const filters = spec.filters || [];
  const actions = (spec.actions || []).filter((a) => a.a !== 'query');
  const rowActions = spec.rowActions && spec.rowActions.length ? spec.rowActions : ['详情'];

  return (
    <div className="space-y-4">
      {/* Page Title & Metadata Strip */}
      <div className="bg-white border border-[#E5E9F0] rounded-lg px-4 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-bold text-[#0F172A]">{spec.title}</h1>
            <span className="px-2 py-0.5 text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded">
              {ARCH_LABEL[spec.arch] || '列表查询'}
            </span>
            <span className="text-[11px] text-[#64748B] font-mono tabular-nums">
              {spec.id.toUpperCase()} · {spec.module} / {spec.group}
            </span>
          </div>
          {spec.desc && (
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{spec.desc}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => runToolbarAction('refresh', '刷新')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#334155] bg-white border border-[#DCE3EE] rounded-md hover:bg-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
            <span>刷新</span>
          </button>
          <button
            type="button"
            onClick={() => runToolbarAction('export', '导出')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#334155] bg-white border border-[#DCE3EE] rounded-md hover:bg-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>导出 CSV</span>
          </button>
        </div>
      </div>

      {/* Multi-Tab Strip */}
      {spec.tabs && spec.tabs.length > 1 && (
        <div className="bg-white border border-[#E5E9F0] rounded-lg px-4 pt-2 flex items-center gap-1 overflow-x-auto">
          {spec.tabs.map((tabLabel, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveSubTab(idx);
                onShowToast(`已切换至「${tabLabel}」页签`, 'info');
              }}
              className={`px-3.5 py-2 text-xs font-medium border-b-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeSubTab === idx
                  ? 'border-[#165DFF] text-[#165DFF] font-semibold'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tabLabel}
            </button>
          ))}
        </div>
      )}

      {/* Filter & Action Card */}
      {(filters.length > 0 || actions.length > 0) && (
        <div className="bg-white border border-[#E5E9F0] rounded-lg p-4 shadow-xs space-y-3">
          {filters.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filters.map((f, idx) => {
                if (!moreFiltersOpen && idx >= 4) return null;
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[#475569]">
                      {f.label}
                    </label>
                    {f.type === 'daterange' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={dateRangeValues[idx]?.from ?? '2026-11-01'}
                          onChange={(e) =>
                            setDateRangeValues((prev) => ({
                              ...prev,
                              [idx]: {
                                from: e.target.value,
                                to: prev[idx]?.to ?? '2026-11-18',
                              },
                            }))
                          }
                          className="h-8 flex-1 min-w-0 px-2 text-xs font-mono border border-[#DCE3EE] rounded-md bg-white text-[#1E293B] focus:border-[#165DFF] outline-none"
                        />
                        <span className="text-xs text-[#94A3B8]">~</span>
                        <input
                          type="date"
                          value={dateRangeValues[idx]?.to ?? '2026-11-18'}
                          onChange={(e) =>
                            setDateRangeValues((prev) => ({
                              ...prev,
                              [idx]: {
                                from: prev[idx]?.from ?? '2026-11-01',
                                to: e.target.value,
                              },
                            }))
                          }
                          className="h-8 flex-1 min-w-0 px-2 text-xs font-mono border border-[#DCE3EE] rounded-md bg-white text-[#1E293B] focus:border-[#165DFF] outline-none"
                        />
                      </div>
                    ) : f.type === 'select' ? (
                      <select
                        value={filterValues[idx] ?? ''}
                        onChange={(e) =>
                          setFilterValues((prev) => ({ ...prev, [idx]: e.target.value }))
                        }
                        className="h-8 px-2.5 text-xs border border-[#DCE3EE] rounded-md bg-white text-[#1E293B] focus:border-[#165DFF] outline-none"
                      >
                        <option value="">全部</option>
                        {(f.options || [])
                          .filter((o) => o !== '全部')
                          .map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={filterValues[idx] ?? ''}
                        onChange={(e) =>
                          setFilterValues((prev) => ({ ...prev, [idx]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuery();
                        }}
                        placeholder={f.ph || `请输入${f.label}`}
                        className="h-8 px-2.5 text-xs border border-[#DCE3EE] rounded-md bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#165DFF] outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1F5F9]">
            {filters.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleQuery}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#165DFF] hover:bg-[#1E40AF] text-white rounded-md transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>查询</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#DCE3EE] rounded-md transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>重置</span>
                </button>
              </>
            )}

            {filters.length > 4 && (
              <button
                type="button"
                onClick={() => setMoreFiltersOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#165DFF] hover:bg-[#EFF6FF] rounded-md transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{moreFiltersOpen ? '收起条件' : '更多条件'}</span>
                {moreFiltersOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {actions.map((act, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => runToolbarAction(act.a, act.t)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                  act.primary
                    ? 'bg-[#165DFF] hover:bg-[#1E40AF] text-white'
                    : 'bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#DCE3EE]'
                }`}
              >
                {act.a === 'create' && <Plus className="w-3.5 h-3.5" />}
                {act.a === 'export' && <Download className="w-3.5 h-3.5" />}
                {act.a === 'import' && <Upload className="w-3.5 h-3.5" />}
                {act.a === 'print' && <Printer className="w-3.5 h-3.5" />}
                {act.a === 'fullscreen' && <Maximize2 className="w-3.5 h-3.5" />}
                {act.a === 'delete' && <Trash2 className="w-3.5 h-3.5" />}
                <span>{act.t}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {spec.stats && spec.stats.length > 0 && (
        <div
          className={`grid gap-3 ${
            spec.stats.length >= 6
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
              : spec.stats.length === 4
              ? 'grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3'
          }`}
        >
          {spec.stats.map((st, idx) => {
            const rawDelta = String(st.delta || (st.tone === 'danger' ? '-0.4' : '+1.8'));
            const isNeg = rawDelta.startsWith('-');
            const isInverseMetric = /不良|超期|停机|退货|报废|异常|缺陷|损耗/.test(st.label);
            const isPositive = isInverseMetric ? isNeg : !isNeg;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5E9F0] rounded-lg px-4 py-3 shadow-xs"
              >
                <div className="text-[11px] font-medium text-[#64748B] truncate">
                  {st.label}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#0F172A] font-mono tabular-nums">
                    {st.value}
                  </span>
                  {st.unit && (
                    <span className="text-xs text-[#64748B]">{st.unit}</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`font-mono tabular-nums font-semibold ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isNeg ? '▼' : '▲'} {rawDelta.replace(/^-/, '')}
                  </span>
                  <span className="text-[#94A3B8]">较昨日</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dashboard Charts */}
      {spec.arch === 'dashboard' && spec.charts && spec.charts.length > 0 && (
        <div
          className={`grid gap-4 ${
            spec.charts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {spec.charts.map((ch, idx) => (
            <MomSvgChart
              key={idx}
              chart={ch}
              svgRef={
                idx === 0
                  ? (el) => {
                      firstSvgRef.current = el;
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Trace Timeline */}
      {spec.arch === 'trace' && (
        <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-xs">
          <div className="px-4 py-3 border-b border-[#EEF2F7] flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#0F172A]">
              追溯链路（正向：原料 → 成品）
            </span>
            <button
              type="button"
              onClick={() => {
                exportRowsToCsv(spec.title, cols, filteredRows, '追溯链路');
                onShowToast('追溯报告已导出为 CSV', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white border border-[#DCE3EE] rounded-md hover:bg-[#F8FAFC] text-[#334155] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>导出追溯报告</span>
            </button>
          </div>
          <div className="p-4">
            {spec.trace?.nodes && spec.trace.nodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {spec.trace.nodes.map((node, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTraceNodeDrawer(node)}
                    className="text-left p-3 rounded-lg border border-[#E5E9F0] hover:border-[#165DFF] hover:bg-[#F8FAFF] transition cursor-pointer flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded bg-[#165DFF] text-white text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#0F172A] truncate">
                        {node.node}
                      </div>
                      <div className="text-[11px] text-[#475569] truncate mt-0.5">
                        {node.obj}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono tabular-nums mt-1">
                        {node.time} · {node.qty} · {node.person}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#64748B]">
                请在上方输入批次号后点击「查询」展开追溯节点
              </div>
            )}
          </div>
        </div>
      )}

      {/* IOT 24h Acquisition Chart */}
      {spec.arch === 'iot' && (
        <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-xs">
          <div className="px-4 py-3 border-b border-[#EEF2F7] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#165DFF]" />
              <span className="text-xs font-bold text-[#0F172A]">
                设备采集曲线（近 24 小时）
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-[11px] font-medium rounded border ${
                  iotAutoRefresh
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {iotAutoRefresh ? '自动刷新：开启（3秒）' : '自动刷新：关闭'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIotAutoRefresh((v) => {
                    const next = !v;
                    onShowToast(
                      next ? '已开启 3 秒自动刷新采集曲线' : '已停止自动刷新',
                      next ? 'success' : 'info'
                    );
                    return next;
                  });
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white border border-[#DCE3EE] rounded-md hover:bg-[#F8FAFC] text-[#334155] cursor-pointer whitespace-nowrap shrink-0"
              >
                {iotAutoRefresh ? (
                  <>
                    <Square className="w-3 h-3 text-rose-600" />
                    <span>停止刷新</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-[#165DFF]" />
                    <span>开启自动刷新</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-3">
            <MomSvgChart
              chart={{
                type: 'line',
                title: `${spec.title} 24H 实时波动趋势`,
                labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
                series: [{ name: '采集数值', data: iotSeries }],
              }}
              svgRef={(el) => {
                firstSvgRef.current = el;
              }}
            />
          </div>
        </div>
      )}

      {/* Data Table Card */}
      {cols.length > 0 && (
        <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EEF2F7] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#165DFF]" />
              <span className="text-xs font-bold text-[#0F172A]">
                {spec.arch === 'dashboard' ? '看板明细数据' : `${spec.title} 明细`}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono tabular-nums bg-[#F1F5F9] text-[#475569] rounded border border-[#E2E8F0]">
                共 {filteredRows.length} 条
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 rounded-md text-xs">
                  <span className="text-[#1D4ED8] font-medium font-mono tabular-nums">
                    已选 {selectedRows.length} 条
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      exportRowsToCsv(spec.title, cols, selectedRows, '已选明细');
                      onShowToast(`已导出 ${selectedRows.length} 条选中数据`, 'success');
                    }}
                    className="px-1.5 py-0.5 text-[11px] text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    导出所选
                  </button>
                  <button
                    type="button"
                    onClick={() => runToolbarAction('audit', '批量审核')}
                    className="px-1.5 py-0.5 text-[11px] text-emerald-700 hover:underline cursor-pointer whitespace-nowrap"
                  >
                    批量审核
                  </button>
                  <button
                    type="button"
                    onClick={() => runToolbarAction('delete', '批量删除')}
                    className="px-1.5 py-0.5 text-[11px] text-rose-600 hover:underline cursor-pointer whitespace-nowrap"
                  >
                    批量删除
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setColSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#334155] bg-white border border-[#DCE3EE] rounded-md hover:bg-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Columns3 className="w-3.5 h-3.5 text-[#64748B]" />
                <span>列设置</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E9F0] text-[11px] font-semibold text-[#475569]">
                  <th className="w-10 px-3 py-2.5 text-center sticky left-0 bg-[#F8FAFC] z-10">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedIds((prev) => {
                          const next = { ...prev };
                          pagedRows.forEach((r) => {
                            next[r.__id] = checked;
                          });
                          return next;
                        });
                      }}
                      className="rounded border-[#CBD5E1] cursor-pointer"
                    />
                  </th>
                  <th className="w-12 px-2 py-2.5 text-center font-mono">序号</th>
                  {visibleCols.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.w ? `${Math.min(col.w, 220)}px` : '120px' }}
                      onClick={() => {
                        if (sortCol === col.key) {
                          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortCol(col.key);
                          setSortDir('asc');
                        }
                      }}
                      className="px-3 py-2.5 whitespace-nowrap cursor-pointer hover:text-[#165DFF] select-none"
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>{col.title}</span>
                        <ArrowDownUp
                          className={`w-3 h-3 ${
                            sortCol === col.key ? 'text-[#165DFF]' : 'text-[#CBD5E1]'
                          }`}
                        />
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right whitespace-nowrap sticky right-0 bg-[#F8FAFC] border-l border-[#E5E9F0] z-10">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7] text-xs text-[#1E293B]">
                {pagedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleCols.length + 3}
                      className="py-12 text-center text-xs text-[#64748B]"
                    >
                      暂无符合条件的记录，可点击上方「重置」查看全部数据
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row, rowIdx) => {
                    const globalIdx = (safePage - 1) * pageSize + rowIdx + 1;
                    const isChecked = !!selectedIds[row.__id];
                    return (
                      <tr
                        key={row.__id}
                        className={`hover:bg-[#F8FAFF] transition-colors ${
                          isChecked ? 'bg-[#EFF6FF]/60' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-center sticky left-0 bg-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setSelectedIds((prev) => ({
                                ...prev,
                                [row.__id]: e.target.checked,
                              }))
                            }
                            className="rounded border-[#CBD5E1] cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-2 text-center font-mono tabular-nums text-[#64748B]">
                          {globalIdx}
                        </td>
                        {visibleCols.map((col) => {
                          const val = row[col.key];
                          const strVal = val === undefined || val === null ? '-' : String(val);
                          const badgeCls = STATUS_BADGE_MAP[strVal];
                          const isNumeric =
                            typeof val === 'number' ||
                            /^[+-]?\d[\d,.]*%?$/.test(strVal) ||
                            /日期|时间|号|编码/.test(col.title);
                          return (
                            <td
                              key={col.key}
                              className={`px-3 py-2 whitespace-nowrap max-w-[260px] truncate ${
                                isNumeric ? 'font-mono tabular-nums' : ''
                              }`}
                              title={strVal}
                            >
                              {badgeCls ? (
                                <span
                                  className={`inline-block px-1.5 py-0.5 text-[11px] font-medium border rounded ${badgeCls}`}
                                >
                                  {strVal}
                                </span>
                              ) : (
                                strVal
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-right whitespace-nowrap sticky right-0 bg-white border-l border-[#EEF2F7]">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {rowActions.map((ra, raIdx) => (
                              <button
                                key={raIdx}
                                type="button"
                                onClick={() => handleRowAction(ra, row)}
                                className={`px-1.5 py-0.5 text-[11px] font-medium rounded cursor-pointer transition whitespace-nowrap ${
                                  ra === '删除'
                                    ? 'text-rose-600 hover:bg-rose-50'
                                    : 'text-[#165DFF] hover:bg-[#EFF6FF]'
                                }`}
                              >
                                {ra}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-2.5 border-t border-[#EEF2F7] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span>
                第 {safePage} / {totalPages} 页 · 共 {filteredRows.length} 条
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 px-2 border border-[#DCE3EE] rounded bg-white text-xs text-[#334155] outline-none"
              >
                <option value={10}>10 条/页</option>
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 border border-[#DCE3EE] rounded bg-white text-[#334155] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[#F1F5F9]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 border border-[#DCE3EE] rounded bg-white text-[#334155] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[#F1F5F9]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Auto Trend Chart */}
      {reportChartSpec && (
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <span className="text-[11px] text-[#64748B]">报表图形切换:</span>
            <button
              type="button"
              onClick={() => setReportChartType((t) => (t === 'bar' ? 'line' : 'bar'))}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-[#DCE3EE] rounded-md text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
            >
              切换为{reportChartType === 'bar' ? '折线图' : '柱状图'}
            </button>
          </div>
          <MomSvgChart
            chart={reportChartSpec}
            svgRef={(el) => {
              firstSvgRef.current = el;
            }}
          />
        </div>
      )}

      {/* Detail Drawer */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setDetailRow(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col">
            <div className="px-5 py-4 border-b border-[#E5E9F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#165DFF]" />
                <span className="text-sm font-bold text-[#0F172A]">
                  {spec.title} · 行详情
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
              {cols.map((c) => (
                <div
                  key={c.key}
                  className="flex items-start justify-between gap-3 py-2 border-b border-[#F1F5F9] text-xs"
                >
                  <span className="text-[#64748B] shrink-0">{c.title}</span>
                  <span className="text-[#0F172A] font-medium text-right break-all font-mono">
                    {detailRow[c.key] === undefined || detailRow[c.key] === null
                      ? '-'
                      : String(detailRow[c.key])}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] flex justify-end gap-2 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => {
                  const target = detailRow;
                  setDetailRow(null);
                  openEditModal(target);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded-md hover:bg-[#1E40AF] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>编辑此记录</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded-md hover:bg-[#F8FAFC] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trace Node Drawer */}
      {traceNodeDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setTraceNodeDrawer(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col">
            <div className="px-5 py-4 border-b border-[#E5E9F0] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">
                {traceNodeDrawer.node} · 节点详情
              </span>
              <button
                type="button"
                onClick={() => setTraceNodeDrawer(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs flex-1">
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">追溯节点</span>
                <span className="font-semibold text-[#0F172A]">{traceNodeDrawer.node}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">关联对象</span>
                <span className="font-medium text-[#0F172A]">{traceNodeDrawer.obj}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">发生时间</span>
                <span className="font-mono tabular-nums text-[#0F172A]">
                  {traceNodeDrawer.time}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">流转数量</span>
                <span className="font-mono tabular-nums font-semibold text-[#165DFF]">
                  {traceNodeDrawer.qty}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">责任人 / 产线</span>
                <span className="font-medium text-[#0F172A]">{traceNodeDrawer.person}</span>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] flex justify-end bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setTraceNodeDrawer(null)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded-md hover:bg-[#1E40AF] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curve Drawer */}
      {curveDrawerRow && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setCurveDrawerRow(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col">
            <div className="px-5 py-4 border-b border-[#E5E9F0] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">
                采集参数趋势曲线
              </span>
              <button
                type="button"
                onClick={() => setCurveDrawerRow(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <MomSvgChart
                chart={{
                  type: 'line',
                  title: `${String(curveDrawerRow[cols[0]?.key] || spec.title)} · 24H 参数曲线`,
                  labels: Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`),
                  series: [
                    {
                      name: '实时采集值',
                      data: Array.from({ length: 12 }, () => 68 + Math.round(Math.random() * 14)),
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {formModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
          <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
              <span className="text-sm font-bold text-[#0F172A]">
                {formModal.mode === 'create' ? `新增 · ${spec.title}` : `编辑 · ${spec.title}`}
              </span>
              <button
                type="button"
                onClick={() => setFormModal(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[68vh] overflow-y-auto">
              {cols.slice(0, 10).map((c, idx) => {
                const isStatus = /状态|判定|等级|是否/.test(c.title);
                return (
                  <div key={c.key} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#334155]">
                      {c.title}
                      {idx < 3 && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                    {isStatus ? (
                      <select
                        value={formDraft[c.key] ?? ''}
                        onChange={(e) =>
                          setFormDraft((prev) => ({ ...prev, [c.key]: e.target.value }))
                        }
                        className="h-8 px-2.5 text-xs border border-[#DCE3EE] rounded-md bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                      >
                        <option value="">请选择</option>
                        {['启用', '停用', '草稿', '待审核', '已审核', '合格', '不合格'].map(
                          (opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formDraft[c.key] ?? ''}
                        onChange={(e) =>
                          setFormDraft((prev) => ({ ...prev, [c.key]: e.target.value }))
                        }
                        placeholder={`请输入${c.title}`}
                        className="h-8 px-2.5 text-xs border border-[#DCE3EE] rounded-md bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormModal(null)}
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded-md hover:bg-[#F8FAFC] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmitForm}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded-md hover:bg-[#1E40AF] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{formModal.mode === 'create' ? '提交新增' : '保存修改'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Settings Modal */}
      {colSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
          <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
              <span className="text-sm font-bold text-[#0F172A]">列显示设置</span>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {cols.map((c) => {
                const isVisible = !hiddenCols[c.key];
                return (
                  <label
                    key={c.key}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#EEF2F7] hover:bg-[#F8FAFC] text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) =>
                        setHiddenCols((prev) => ({
                          ...prev,
                          [c.key]: !e.target.checked,
                        }))
                      }
                      className="rounded border-[#CBD5E1]"
                    />
                    <span className="truncate text-[#1E293B]">{c.title}</span>
                  </label>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-between">
              <button
                type="button"
                onClick={() => setHiddenCols({})}
                className="px-3 py-1.5 text-xs font-medium text-[#165DFF] hover:bg-[#EFF6FF] rounded-md cursor-pointer"
              >
                全部显示
              </button>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded-md hover:bg-[#1E40AF] cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
          <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#165DFF]" />
                <span className="text-sm font-bold text-[#0F172A]">
                  批量导入 · {spec.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-[#64748B]">
                粘贴逗号分隔行数据（每行对应前几列字段），点击确认后将解析并追加到当前表格。
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={5}
                placeholder={`示例：\n${cols
                  .slice(0, 3)
                  .map((c) => c.title)
                  .join(',')}`}
                className="w-full p-2.5 border border-[#DCE3EE] rounded-md font-mono text-xs outline-none focus:border-[#165DFF]"
              />
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded-md cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const lines = importText
                    .split(/\r?\n/)
                    .map((l) => l.trim())
                    .filter(Boolean);
                  if (!lines.length) {
                    onShowToast('请输入至少一行导入内容', 'warning');
                    return;
                  }
                  const added: RowRecord[] = lines.map((line, i) => {
                    const parts = line.split(',');
                    const row: RowRecord = {
                      __id: `${spec.id}-imp-${Date.now()}-${i}`,
                    };
                    cols.forEach((c, cIdx) => {
                      row[c.key] = parts[cIdx]?.trim() || '-';
                    });
                    return row;
                  });
                  setBaseRows((prev) => [...added, ...prev]);
                  setImportModalOpen(false);
                  onShowToast(`已成功导入 ${added.length} 条记录`, 'success');
                }}
                className="px-4 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded-md hover:bg-[#1E40AF] cursor-pointer"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Modal */}
      {rangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
          <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
              <span className="text-sm font-bold text-[#0F172A]">选择看板时间范围</span>
              <button
                type="button"
                onClick={() => setRangeModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-2.5 text-xs">
              {['今日', '本周', '本月', '本季度', '本年'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRangeLabel(r)}
                  className={`py-2 px-3 rounded-md border font-medium cursor-pointer transition ${
                    selectedRangeLabel === r
                      ? 'bg-[#EFF6FF] border-[#165DFF] text-[#165DFF]'
                      : 'bg-white border-[#DCE3EE] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRangeModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded-md cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setRangeModalOpen(false);
                  onShowToast(`时间范围已切换为「${selectedRangeLabel}」`, 'success');
                }}
                className="px-4 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded-md hover:bg-[#1E40AF] cursor-pointer"
              >
                应用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {printModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
          <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
              <span className="text-sm font-bold text-[#0F172A]">
                打印预览 · {spec.title}
              </span>
              <button
                type="button"
                onClick={() => setPrintModalRow(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto text-xs">
              <div className="text-center border-b border-[#E5E9F0] pb-3">
                <div className="text-base font-bold text-[#0F172A]">
                  昇兴集团 · 中山制罐工厂 · {spec.title}
                </div>
                <div className="text-[11px] text-[#64748B] font-mono mt-1">
                  打印时间：2026-11-18 · 经办人：系统管理员
                </div>
              </div>
              {printModalRow === 'all' ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-[#DCE3EE] text-[11px]">
                    <thead>
                      <tr className="bg-[#F8FAFC]">
                        {cols.slice(0, 6).map((c) => (
                          <th key={c.key} className="border border-[#DCE3EE] px-2 py-1.5 text-left">
                            {c.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.slice(0, 10).map((r) => (
                        <tr key={r.__id}>
                          {cols.slice(0, 6).map((c) => (
                            <td key={c.key} className="border border-[#DCE3EE] px-2 py-1.5">
                              {String(r[c.key] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {cols.map((c) => (
                    <div key={c.key} className="border border-[#E5E9F0] rounded p-2">
                      <div className="text-[11px] text-[#64748B]">{c.title}</div>
                      <div className="font-semibold text-[#0F172A] mt-0.5 font-mono">
                        {String(printModalRow[c.key] ?? '-')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPrintModalRow(null)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded-md cursor-pointer"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print?.();
                  onShowToast('已发送打印任务到系统打印队列', 'success');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded-md hover:bg-[#1E40AF] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>立即打印</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
          <div className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC]">
              <span className="text-sm font-bold text-[#0F172A]">{confirmState.title}</span>
            </div>
            <div className="p-5 text-xs text-[#334155] leading-relaxed">
              {confirmState.message}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded-md hover:bg-[#F8FAFC] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className={`px-4 py-1.5 text-xs font-medium text-white rounded-md cursor-pointer ${
                  confirmState.danger
                    ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                    : 'bg-[#165DFF] hover:bg-[#1E40AF]'
                }`}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
