import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  buildInitialProdDatasets,
  getProdFormDef,
  PROD_ORG,
  PROD_PAGES,
  ProdChartDef,
  ProdColDef,
  ProdFilterDef,
  ProdFormDef,
  ProdRow,
  ProdStatCardDef,
  ProdTablePageConfig,
  ProdWorkbenchConfig,
} from '../data/productionData';

interface ProductionModuleTabProps {
  pageKey: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const CHART_PALETTE = ['#165DFF', '#10B981', '#F59E0B', '#EA580C', '#06B6D4', '#8B5CF6', '#EC4899', '#64748B'];

const TAG_STYLE_MAP: Record<string, string> = {
  开立: 'bg-blue-50 text-[#165DFF] border-blue-200',
  投产: 'bg-amber-50 text-amber-700 border-amber-200',
  下达完成: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  部分下达: 'bg-amber-50 text-amber-700 border-amber-200',
  未下达: 'bg-slate-100 text-slate-600 border-slate-200',
  精通: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  完全掌握: 'bg-blue-50 text-[#165DFF] border-blue-200',
  基本掌握: 'bg-amber-50 text-amber-700 border-amber-200',
  计划学习: 'bg-slate-100 text-slate-600 border-slate-200',
  有效: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  无效: 'bg-slate-100 text-slate-500 border-slate-200',
  早班: 'bg-blue-50 text-[#165DFF] border-blue-200',
  晚班: 'bg-amber-50 text-amber-700 border-amber-200',
  操作中: 'bg-amber-50 text-amber-700 border-amber-200',
  计划停机: 'bg-blue-50 text-[#165DFF] border-blue-200',
  设备故障: 'bg-red-50 text-[#EA580C] border-red-200',
  品质等待: 'bg-amber-50 text-amber-700 border-amber-200',
  正常: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  已回传: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  未回传: 'bg-amber-50 text-amber-700 border-amber-200',
  维修中: 'bg-red-50 text-[#EA580C] border-red-200',
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
  const today = new Date(2026, 10, 20); // 2026-11-20 matching prototype date
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

/* ---------- Pure SVG Charts (MOM Visual Style) ---------- */
const BarChartSvg: React.FC<{
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  width?: number;
}> = ({ data, height = 220, width = 640 }) => {
  const pd = { l: 44, r: 16, t: 22, b: 32 };
  const iw = width - pd.l - pd.r;
  const ih = height - pd.t - pd.b;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = iw / Math.max(data.length, 1);
  const bw = Math.min(step * 0.48, 42);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full block">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = pd.t + (ih * i) / 4;
        const tick = Math.round((max * (4 - i)) / 4);
        return (
          <g key={i}>
            <line x1={pd.l} y1={y} x2={width - pd.r} y2={y} stroke="#EEF2F6" strokeDasharray={i === 4 ? undefined : '3 3'} />
            <text x={pd.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
              {tick}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const bh = (d.value / max) * ih;
        const x = pd.l + step * i + (step - bw) / 2;
        const y = pd.t + ih - bh;
        const fill = d.color || CHART_PALETTE[i % CHART_PALETTE.length];
        return (
          <g key={`${d.name}-${i}`}>
            <rect x={x} y={y} width={bw} height={Math.max(bh, 2)} fill={fill} rx="4" className="transition-opacity hover:opacity-80">
              <title>{`${d.name}: ${d.value}`}</title>
            </rect>
            <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">
              {d.value}
            </text>
            <text x={pd.l + step * i + step / 2} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#64748B">
              {d.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const LineChartSvg: React.FC<{
  series: Array<{ name: string; data: number[]; color?: string }>;
  labels: string[];
  height?: number;
  width?: number;
}> = ({ series, labels, height = 220, width = 640 }) => {
  const pd = { l: 44, r: 18, t: 22, b: 32 };
  const iw = width - pd.l - pd.r;
  const ih = height - pd.t - pd.b;
  const allVals = series.flatMap((s) => s.data);
  const max = Math.max(...allVals, 1);

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full block">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = pd.t + (ih * i) / 4;
          const tick = Math.round((max * (4 - i)) / 4);
          return (
            <g key={i}>
              <line x1={pd.l} y1={y} x2={width - pd.r} y2={y} stroke="#EEF2F6" strokeDasharray={i === 4 ? undefined : '3 3'} />
              <text x={pd.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
                {tick}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) => {
          const x = pd.l + iw * (labels.length <= 1 ? 0 : i / (labels.length - 1));
          return (
            <text key={`${l}-${i}`} x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748B">
              {l}
            </text>
          );
        })}
        {series.map((s, si) => {
          const color = s.color || CHART_PALETTE[si % CHART_PALETTE.length];
          const pts = s.data.map((v, i) => [
            pd.l + iw * (labels.length <= 1 ? 0 : i / (labels.length - 1)),
            pd.t + ih - (v / max) * ih,
          ]);
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, pi) => (
                <circle key={pi} cx={p[0]} cy={p[1]} r="3.5" fill="#FFFFFF" stroke={color} strokeWidth="2">
                  <title>{`${s.name} (${labels[pi] || ''}): ${s.data[pi]}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
        {series.map((s, si) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs inline-block"
              style={{ backgroundColor: s.color || CHART_PALETTE[si % CHART_PALETTE.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ---------- Stat KPI Card ---------- */
const StatKpiCard: React.FC<{ item: ProdStatCardDef }> = ({ item }) => {
  const Icon =
    item.icon === 'M4' ? Clock : item.icon === 'M1' ? FileText : item.icon === 'M2' ? CheckCircle2 : BarChart3;
  return (
    <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-4 flex items-center gap-3.5">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
        style={{ backgroundColor: item.color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-[#1E293B] font-mono tabular-nums leading-tight">{item.val}</div>
        <div className="text-xs text-slate-500 mt-1 truncate">{item.label}</div>
      </div>
    </div>
  );
};

/* ---------- Custom View 1: 无效时间 (Timeline) ---------- */
const InvalidTimeView: React.FC<{
  onShowToast: ProductionModuleTabProps['onShowToast'];
}> = ({ onShowToast }) => {
  const [selectedDate, setSelectedDate] = useState('2026-11-20');
  const [selectedLine, setSelectedLine] = useState('全部线体');
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];

  const lines = [
    { line: '制罐A线', start: 3, end: 4, color: '#165DFF', type: '计划停机', reason: '换版 (06:00-08:00 / 30min)' },
    { line: '制罐B线', start: 6, end: 7, color: '#EA580C', type: '设备故障', reason: '封口机异常 (12:00-14:00 / 36min)' },
    { line: '制罐D线', start: 8, end: 9, color: '#D97706', type: '计划停机', reason: '换料 (16:00-18:00 / 22min)' },
    { line: '制罐E线', start: 10, end: 11, color: '#10B981', type: '品质等待', reason: '首件确认 (20:00-22:00 / 15min)' },
  ];

  const visibleLines = selectedLine === '全部线体' ? lines : lines.filter((l) => l.line === selectedLine);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E5E9F0]">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
            <h3 className="text-sm font-bold text-[#1E40AF]">无效时间分布时间轴</h3>
            <span className="text-xs text-slate-400 font-mono">{selectedDate}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#D8E1EE] bg-white text-xs text-slate-700 outline-none focus:border-[#165DFF]"
            >
              <option value="全部线体">全部线体</option>
              <option value="制罐A线">制罐A线</option>
              <option value="制罐B线">制罐B线</option>
              <option value="制罐D线">制罐D线</option>
              <option value="制罐E线">制罐E线</option>
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#D8E1EE] bg-white text-xs text-slate-700 font-mono outline-none focus:border-[#165DFF]"
            />
            <button
              type="button"
              onClick={() => onShowToast(`已刷新 ${selectedDate} 无效时间甘特分布`, 'info')}
              className="h-8 px-3 rounded-lg bg-[#165DFF] text-white text-xs font-medium hover:bg-[#134FD8] transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              查询
            </button>
          </div>
        </div>

        {/* Hour Scale */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            <div className="flex ml-24 mb-2">
              {hours.map((h) => (
                <span key={h} className="flex-1 text-[10px] font-mono text-slate-400">
                  {h}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {visibleLines.map((b) => (
                <div key={b.line} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-semibold text-[#1E40AF] text-right shrink-0">{b.line}</span>
                  <div className="flex-1 h-8 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg relative overflow-hidden">
                    {hours.map((_, i) => (
                      <span
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-[#E8EDF5]"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}
                    <div
                      title={`${b.line} · ${b.type} · ${b.reason}`}
                      onClick={() => onShowToast(`${b.line}：${b.type} — ${b.reason}`, 'info')}
                      className="absolute top-1 bottom-1 rounded-md cursor-pointer transition-opacity hover:opacity-85 flex items-center justify-center text-[10px] font-medium text-white shadow-xs px-1 truncate"
                      style={{
                        left: `${(b.start / 12) * 100}%`,
                        width: `${((b.end - b.start) / 12) * 100}%`,
                        backgroundColor: b.color,
                      }}
                    >
                      {b.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#165DFF]" />
              计划停机（换版）
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#EA580C]" />
              设备故障
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#D97706]" />
              计划停机（换料）
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#10B981]" />
              品质等待
            </span>
          </div>
          <span className="text-[11px] text-slate-400">点击色块可查看该时段停机明细</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Custom View 2: 葡萄图考核 (31-day Heatmap Matrix) ---------- */
const GrapeAssessmentView: React.FC<{
  onShowToast: ProductionModuleTabProps['onShowToast'];
}> = ({ onShowToast }) => {
  const [selectedCell, setSelectedCell] = useState<{ person: string; day: number; status: string } | null>(null);

  const persons = [
    { name: '黄田兴(040199)', month: '2026-07', score: 91, team: 'SD2 班组长' },
    { name: '曹雨林(cyl)', month: '2026-05', score: 52, team: '制罐车间排班员' },
  ];

  const getCellMeta = (i: number) => {
    if (i % 7 === 0) return { bg: '#EA580C', label: '扣分异常 (-5分)' };
    if (i % 5 === 0) return { bg: '#F59E0B', label: '一般提醒 (-2分)' };
    return { bg: '#10B981', label: '达标优秀 (满分)' };
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-4 md:p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E9F0]">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
          <h3 className="text-sm font-bold text-[#1E40AF]">葡萄图考核</h3>
          <span className="text-xs text-slate-400">月度 31 天班组绩效矩阵</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['项目设置', '等级设置', '员工考核'].map((btn) => (
            <button
              key={btn}
              type="button"
              onClick={() => onShowToast(`${btn}：已打开配置视图`, 'info')}
              className="h-8 px-3 rounded-lg border border-[#D8E1EE] bg-white text-xs font-medium text-slate-700 hover:border-[#165DFF] hover:text-[#165DFF] transition cursor-pointer"
            >
              {btn}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onShowToast('葡萄图考核报表导出成功', 'success')}
            className="h-8 px-3 rounded-lg bg-[#165DFF] text-white text-xs font-medium hover:bg-[#134FD8] transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {persons.map((p) => (
          <div key={p.name} className="rounded-xl border border-[#E5E9F0] bg-[#FAFBFD] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-sm text-[#1E293B]">{p.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1E40AF] border border-blue-100 font-medium">
                  {p.team}
                </span>
                <span className="text-slate-500">
                  考核月份：<b className="font-mono text-slate-700">{p.month}</b>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">当月分数</span>
                <span
                  className={`text-lg font-bold font-mono tabular-nums ${
                    p.score >= 80 ? 'text-emerald-600' : 'text-[#EA580C]'
                  }`}
                >
                  {p.score}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="grid grid-cols-[repeat(31,minmax(24px,1fr))] gap-1 min-w-[780px]">
                {Array.from({ length: 31 }, (_, i) => {
                  const meta = getCellMeta(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      title={`${p.name} · ${p.month}-${String(i + 1).padStart(2, '0')} · ${meta.label}`}
                      onClick={() => {
                        setSelectedCell({ person: p.name, day: i + 1, status: meta.label });
                        onShowToast(`${p.name} ${p.month}-${String(i + 1).padStart(2, '0')}：${meta.label}`, 'info');
                      }}
                      className="h-7 rounded-md text-[10px] font-mono font-semibold text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-2xs"
                      style={{ backgroundColor: meta.bg }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9] text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#10B981]" />
            达标优秀
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#F59E0B]" />
            一般提醒
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#EA580C]" />
            扣分异常
          </span>
        </div>
        {selectedCell && (
          <span className="text-[#1E40AF] font-medium">
            当前选中：{selectedCell.person} 第 {selectedCell.day} 日（{selectedCell.status}）
          </span>
        )}
      </div>
    </div>
  );
};

/* ---------- Workbench Renderer ---------- */
const WorkbenchView: React.FC<{
  cfg: ProdWorkbenchConfig;
  onShowToast: ProductionModuleTabProps['onShowToast'];
}> = ({ cfg, onShowToast }) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [subTabMap, setSubTabMap] = useState<Record<number, number>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [sectionRows, setSectionRows] = useState<Record<number, ProdRow[]>>({});

  useEffect(() => {
    setActiveTabIdx(0);
    setSubTabMap({});
    setFormValues({});
    const initRows: Record<number, ProdRow[]> = {};
    cfg.sections.forEach((s, idx) => {
      if (s.table) initRows[idx] = s.table.rows.map((r) => ({ ...r }));
    });
    setSectionRows(initRows);
  }, [cfg.id]);

  const handleAction = (action: string) => {
    if (action === '新增') {
      const tableSecIdx = cfg.sections.findIndex((s) => Boolean(s.table));
      if (tableSecIdx >= 0) {
        const idx = (sectionRows[tableSecIdx]?.length || 0) + 1;
        const newRow: ProdRow = {
          code: `NG-${String(idx).padStart(3, '0')}`,
          name: idx % 2 === 1 ? '卷封不良' : '焊缝偏位',
          qty: String(10 * idx),
        };
        setSectionRows((prev) => ({
          ...prev,
          [tableSecIdx]: [...(prev[tableSecIdx] || []), newRow],
        }));
        setActiveTabIdx(tableSecIdx);
        onShowToast('已新增一条不良称重明细记录', 'success');
        return;
      }
    }
    if (action === '删除') {
      const tableSecIdx = cfg.sections.findIndex((s) => Boolean(s.table));
      if (tableSecIdx >= 0 && (sectionRows[tableSecIdx]?.length || 0) > 0) {
        setSectionRows((prev) => ({
          ...prev,
          [tableSecIdx]: (prev[tableSecIdx] || []).slice(0, -1),
        }));
        onShowToast('已删除最后一条不良记录', 'info');
        return;
      }
      onShowToast('当前没有可删除的明细记录', 'warning');
      return;
    }
    onShowToast(`${cfg.title} · ${action} 执行成功`, 'success');
  };

  const currentSection = cfg.sections[activeTabIdx] || cfg.sections[0];
  const gridColsClass = (cols?: number) => {
    if (cols === 1) return 'grid-cols-1';
    if (cols === 2) return 'grid-cols-1 md:grid-cols-2';
    if (cols === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    if (cols === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs overflow-hidden">
      {/* Top Tabs & Action Bar */}
      <div className="px-4 md:px-5 border-b border-[#E5E9F0] flex flex-wrap items-center justify-between gap-3 bg-[#FAFBFD]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {cfg.tabs.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTabIdx(i)}
              className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTabIdx === i
                  ? 'border-[#165DFF] text-[#165DFF]'
                  : 'border-transparent text-slate-600 hover:text-[#1E40AF]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 py-2">
          {cfg.actions.map((act, idx) => {
            const isPrimary = idx === cfg.actions.length - 1;
            const isDanger = act === '删除';
            return (
              <button
                key={act}
                type="button"
                onClick={() => handleAction(act)}
                className={`h-8 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isPrimary
                    ? 'bg-[#165DFF] text-white hover:bg-[#134FD8] shadow-2xs'
                    : isDanger
                      ? 'border border-red-200 bg-red-50 text-[#EA580C] hover:bg-red-100'
                      : 'border border-[#D8E1EE] bg-white text-slate-700 hover:border-[#165DFF] hover:text-[#165DFF]'
                }`}
              >
                {act}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      {currentSection && (
        <div className="p-4 md:p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
            <h4 className="text-sm font-bold text-[#1E40AF]">{currentSection.title}</h4>
          </div>

          {currentSection.fields && currentSection.fields.length > 0 && (
            <div className={`grid ${gridColsClass(currentSection.cols)} gap-3.5`}>
              {currentSection.fields.map((f) => {
                const isReq = f.label.startsWith('*');
                const cleanLabel = f.label.replace(/^\*/, '');
                const val = formValues[`${activeTabIdx}:${f.key}`] || '';
                const setVal = (v: string) =>
                  setFormValues((prev) => ({ ...prev, [`${activeTabIdx}:${f.key}`]: v }));

                return (
                  <div
                    key={f.key}
                    className={`flex flex-col gap-1 ${f.type === 'textarea' ? 'sm:col-span-2 lg:col-span-full' : ''}`}
                  >
                    <label className="text-xs font-medium text-[#1E40AF]">
                      {isReq && <span className="text-[#EA580C] mr-0.5">*</span>}
                      {cleanLabel}
                    </label>
                    {f.type === 'select' ? (
                      <select
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        className="h-9 px-2.5 rounded-lg border border-[#D8E1EE] bg-white text-xs text-slate-700 outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-blue-500/10"
                      >
                        {(f.opts || ['请选择']).map((o) => (
                          <option key={o} value={o === '请选择' ? '' : o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        rows={3}
                        placeholder="请输入..."
                        className="p-2.5 rounded-lg border border-[#D8E1EE] bg-white text-xs text-slate-700 outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-blue-500/10 resize-y"
                      />
                    ) : (
                      <input
                        type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        placeholder={isReq ? '必填' : '请输入'}
                        className="h-9 px-2.5 rounded-lg border border-[#D8E1EE] bg-white text-xs text-slate-700 outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-blue-500/10"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentSection.table && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4 border-b border-[#E5E9F0]">
                {(currentSection.tabs || [currentSection.table.title]).map((st, si) => {
                  const activeSub = subTabMap[activeTabIdx] || 0;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSubTabMap((prev) => ({ ...prev, [activeTabIdx]: si }))}
                      className={`pb-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                        activeSub === si
                          ? 'border-[#165DFF] text-[#165DFF]'
                          : 'border-transparent text-slate-500 hover:text-[#1E40AF]'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#E5E9F0]">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4F7FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                      {currentSection.table.cols.map((c) => (
                        <th key={c.k} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                          {c.t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sectionRows[activeTabIdx] || []).length === 0 ? (
                      <tr>
                        <td colSpan={currentSection.table.cols.length} className="py-8 text-center text-slate-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      (sectionRows[activeTabIdx] || []).map((row, ri) => (
                        <tr key={ri} className="border-b border-[#F1F5F9] hover:bg-blue-50/40">
                          {currentSection.table!.cols.map((c) => (
                            <td key={c.k} className="px-3 py-2 text-slate-700 whitespace-nowrap font-mono">
                              {row[c.k] ?? '-'}
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
      )}
    </div>
  );
};

/* ---------- Main Component ---------- */
export const ProductionModuleTab: React.FC<ProductionModuleTabProps> = ({
  pageKey,
  onShowToast,
}) => {
  const [datasets, setDatasets] = useState<Record<string, ProdRow[]>>(buildInitialProdDatasets);
  const [filtersByPage, setFiltersByPage] = useState<Record<string, Record<string, string>>>({});
  const [pageNumByPage, setPageNumByPage] = useState<Record<string, number>>({});
  const [pageSizeByPage, setPageSizeByPage] = useState<Record<string, number>>({});
  const [sortByPage, setSortByPage] = useState<Record<string, { k: string; asc: boolean }>>({});
  const [selectedByPage, setSelectedByPage] = useState<Record<string, number[]>>({});
  const [subTabByPage, setSubTabByPage] = useState<Record<string, string>>({});
  const [filterCollapsed, setFilterCollapsed] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [modalTitle, setModalTitle] = useState('');
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [modalFormDef, setModalFormDef] = useState<ProdFormDef | null>(null);
  const [modalValues, setModalValues] = useState<Record<string, string>>({});

  // Confirm delete modal
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const pageCfg = PROD_PAGES[pageKey];

  useEffect(() => {
    setFilterCollapsed(false);
  }, [pageKey]);

  const currentFilters = filtersByPage[pageKey] || {};
  const currentPageNum = pageNumByPage[pageKey] || 1;
  const currentPageSize = pageSizeByPage[pageKey] || (pageCfg && (pageCfg.type === 'table' || pageCfg.type === 'analysis') ? pageCfg.pageSize || 10 : 10);
  const currentSort = sortByPage[pageKey];
  const currentSelected = selectedByPage[pageKey] || [];

  const updateFilter = (key: string, val: string) => {
    setFiltersByPage((prev) => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] || {}), [key]: val },
    }));
  };

  const resetFilters = () => {
    setFiltersByPage((prev) => ({ ...prev, [pageKey]: {} }));
    setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
    onShowToast('查询条件已重置', 'info');
  };

  const rawRows = useMemo(() => datasets[pageKey] || [], [datasets, pageKey]);

  const filteredRows = useMemo(() => {
    if (!pageCfg || (pageCfg.type !== 'table' && pageCfg.type !== 'analysis')) return [];
    let list = rawRows.map((row, origIdx) => ({ row, origIdx }));

    (pageCfg.search || []).forEach((f) => {
      if (!f.key || f.type === 'date' || f.type === 'radio') return;
      const val = (currentFilters[f.key] || '').trim();
      if (!val || val === 'ALL' || val === '请选择') return;
      const op = currentFilters[`_op_${f.key}`] || '包含';
      const lv = val.toLowerCase();
      list = list.filter(({ row }) => {
        const cell = String(row[f.key] ?? '').toLowerCase();
        if (op === '不包含') return !cell.includes(lv);
        if (op === '等于') return cell === lv;
        return cell.includes(lv);
      });
    });

    const kw = (currentFilters._kw || '').trim().toLowerCase();
    if (kw) {
      list = list.filter(({ row }) =>
        Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(kw))
      );
    }

    if (currentSort) {
      const { k, asc } = currentSort;
      list = [...list].sort((a, b) => {
        const av = String(a.row[k] ?? '');
        const bv = String(b.row[k] ?? '');
        return av.localeCompare(bv, 'zh-CN', { numeric: true }) * (asc ? 1 : -1);
      });
    }

    return list;
  }, [pageCfg, rawRows, currentFilters, currentSort]);

  if (!pageCfg) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E9F0] p-8 text-center text-sm text-slate-500">
        未找到对应的生产模块配置（{pageKey}）
      </div>
    );
  }

  if (pageCfg.type === 'custom') {
    if (pageCfg.custom === 'invalidTime') return <InvalidTimeView onShowToast={onShowToast} />;
    return <GrapeAssessmentView onShowToast={onShowToast} />;
  }

  if (pageCfg.type === 'workbench') {
    return <WorkbenchView cfg={pageCfg} onShowToast={onShowToast} />;
  }

  // Table / Analysis View
  const tblCfg: ProdTablePageConfig = pageCfg;
  const totalPages = Math.max(1, Math.ceil((filteredRows.length || 1) / currentPageSize));
  const safePage = Math.min(currentPageNum, totalPages);
  const pageItems = filteredRows.slice((safePage - 1) * currentPageSize, safePage * currentPageSize);
  const hasActions = (tblCfg.actions?.length || 0) > 0;
  const displayTotal =
    Object.keys(currentFilters).some((k) => Boolean(currentFilters[k]) && !k.startsWith('_op_'))
      ? filteredRows.length
      : Math.max(tblCfg.total ?? filteredRows.length, filteredRows.length);

  const handleSort = (colKey: string) => {
    setSortByPage((prev) => {
      const curr = prev[pageKey];
      const asc = curr && curr.k === colKey ? !curr.asc : true;
      onShowToast(`已按列「${colKey}」${asc ? '升序' : '降序'}排列`, 'info');
      return { ...prev, [pageKey]: { k: colKey, asc } };
    });
  };

  const toggleAllVisible = (checked: boolean) => {
    setSelectedByPage((prev) => ({
      ...prev,
      [pageKey]: checked ? pageItems.map((it) => it.origIdx) : [],
    }));
  };

  const toggleRowSelect = (origIdx: number) => {
    setSelectedByPage((prev) => {
      const curr = prev[pageKey] || [];
      const next = curr.includes(origIdx) ? curr.filter((i) => i !== origIdx) : [...curr, origIdx];
      return { ...prev, [pageKey]: next };
    });
  };

  const openFormModal = (mode: 'add' | 'edit' | 'view', row?: ProdRow, origIdx?: number, actionLabel?: string) => {
    const formDef = getProdFormDef(pageKey, tblCfg.title);
    const verb = mode === 'view' ? '查看' : mode === 'edit' ? actionLabel || '修改' : actionLabel || formDef.titlePrefix || '+新增';
    setModalMode(mode);
    setModalTitle(`${verb} - ${formDef.title}`);
    setModalFormDef(formDef);
    setEditingRowIdx(origIdx ?? null);
    const initVals: Record<string, string> = {};
    formDef.groups.forEach((g) => {
      g.fields.forEach((f) => {
        if (row && row[f.key] != null) initVals[f.key] = String(row[f.key]);
        else if (f.key === 'org') initVals[f.key] = PROD_ORG;
        else initVals[f.key] = '';
      });
    });
    setModalValues(initVals);
    setModalOpen(true);
  };

  const handleSaveModal = (exitAfter: boolean) => {
    if (!modalFormDef) return;
    for (const g of modalFormDef.groups) {
      for (const f of g.fields) {
        if (f.required && !(modalValues[f.key] || '').trim()) {
          onShowToast(`请填写必填项「${f.label}」`, 'warning');
          return;
        }
      }
    }

    const record: ProdRow = { org: PROD_ORG, ...modalValues };
    setDatasets((prev) => {
      const list = [...(prev[pageKey] || [])];
      if (modalMode === 'edit' && editingRowIdx !== null && list[editingRowIdx]) {
        list[editingRowIdx] = { ...list[editingRowIdx], ...record };
      } else {
        list.unshift(record);
      }
      return { ...prev, [pageKey]: list };
    });

    onShowToast('保存成功', 'success');
    if (exitAfter) {
      setModalOpen(false);
    } else if (modalMode === 'add') {
      const resetVals: Record<string, string> = {};
      modalFormDef.groups.forEach((g) => g.fields.forEach((f) => { resetVals[f.key] = f.key === 'org' ? PROD_ORG : ''; }));
      setModalValues(resetVals);
    }
  };

  const handleExportCsv = () => {
    const exportCols = tblCfg.cols.filter((c) => c.k && !c.cb && c.k !== '_op');
    const header = exportCols.map((c) => c.t).join(',');
    const lines = filteredRows.slice(0, 200).map(({ row }) =>
      exportCols.map((c) => `"${String(row[c.k] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = `\ufeff${header}\n${lines.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tblCfg.title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`已导出「${tblCfg.title}.csv」（共 ${lines.length} 条）`, 'success');
  };

  const handleBatchDelete = () => {
    if (currentSelected.length === 0) {
      onShowToast('请先勾选要删除的记录', 'warning');
      return;
    }
    const count = currentSelected.length;
    setConfirmState({
      message: `确定要删除选中的 ${count} 条记录吗？`,
      onConfirm: () => {
        const dropSet = new Set(currentSelected);
        setDatasets((prev) => ({
          ...prev,
          [pageKey]: (prev[pageKey] || []).filter((_, idx) => !dropSet.has(idx)),
        }));
        setSelectedByPage((prev) => ({ ...prev, [pageKey]: [] }));
        setConfirmState(null);
        onShowToast(`已删除 ${count} 条记录`, 'success');
      },
    });
  };

  const handleToolbarBtn = (label: string) => {
    if (label.includes('新增') || label === '添加' || label === '权限配置') {
      openFormModal('add', undefined, undefined, label);
      return;
    }
    if (label.includes('删除')) {
      handleBatchDelete();
      return;
    }
    if (label.includes('导出')) {
      handleExportCsv();
      return;
    }
    if (label.includes('导入')) {
      onShowToast(`${tblCfg.title}：已就绪 Excel 模板导入通道`, 'info');
      return;
    }
    onShowToast(`${label}：操作已执行`, 'info');
  };

  const handleRowAction = (action: string, row: ProdRow, origIdx: number) => {
    if (action === '查看') {
      openFormModal('view', row, origIdx, action);
      return;
    }
    if (action === '修改' || action === '编辑' || action === '修改权限') {
      openFormModal('edit', row, origIdx, action);
      return;
    }
    if (action === '删除') {
      const name = String(row.name || row.no || row.code || row.user || row.reworkNo || '该记录');
      setConfirmState({
        message: `确定要删除「${name}」吗？`,
        onConfirm: () => {
          setDatasets((prev) => ({
            ...prev,
            [pageKey]: (prev[pageKey] || []).filter((_, idx) => idx !== origIdx),
          }));
          setSelectedByPage((prev) => ({ ...prev, [pageKey]: [] }));
          setConfirmState(null);
          onShowToast('删除成功', 'success');
        },
      });
      return;
    }
    onShowToast(`${action}：执行成功`, 'info');
  };

  const renderFilterControl = (f: ProdFilterDef, idx: number) => {
    if (f.type === 'date') {
      const quickKey = `_q_${f.label}`;
      const startKey = `_ds_${f.label}`;
      const endKey = `_de_${f.label}`;
      const activePreset = currentFilters[quickKey] || '';
      return (
        <div key={`${f.label}-${idx}`} className="col-span-full flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-[#1E40AF] w-24 md:text-right shrink-0">{f.label}</label>
          <div className="inline-flex rounded-lg overflow-hidden border border-[#D8E1EE]">
            {['今天', '本周', '本月', '最近三个月', '自定义'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  const range = getDateQuickRange(preset);
                  setFiltersByPage((prev) => ({
                    ...prev,
                    [pageKey]: {
                      ...(prev[pageKey] || {}),
                      [quickKey]: preset,
                      [startKey]: range.start,
                      [endKey]: range.end,
                    },
                  }));
                }}
                className={`px-2.5 h-8 text-xs transition border-r last:border-r-0 border-[#D8E1EE] cursor-pointer ${
                  activePreset === preset
                    ? 'bg-blue-50 text-[#165DFF] font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={currentFilters[startKey] || ''}
              onChange={(e) => updateFilter(startKey, e.target.value)}
              className="h-8 px-2 rounded-lg border border-[#D8E1EE] text-xs font-mono text-slate-700 outline-none focus:border-[#165DFF]"
            />
            <span className="text-slate-400 text-xs">~</span>
            <input
              type="date"
              value={currentFilters[endKey] || ''}
              onChange={(e) => updateFilter(endKey, e.target.value)}
              className="h-8 px-2 rounded-lg border border-[#D8E1EE] text-xs font-mono text-slate-700 outline-none focus:border-[#165DFF]"
            />
          </div>
        </div>
      );
    }

    if (f.type === 'radio') {
      const curr = currentFilters[f.key] || 'ALL';
      return (
        <div key={`${f.label}-${idx}`} className="flex items-center gap-2 min-w-0 col-span-full lg:col-span-2">
          <label className="text-xs font-medium text-[#1E40AF] w-24 md:text-right shrink-0">{f.label}</label>
          <div className="inline-flex flex-wrap rounded-lg overflow-hidden border border-[#D8E1EE]">
            {['ALL', ...(f.opts || [])].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateFilter(f.key, opt)}
                className={`px-3 h-8 text-xs transition border-r last:border-r-0 border-[#D8E1EE] cursor-pointer ${
                  curr === opt
                    ? 'bg-[#165DFF] text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
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
          <label className="text-xs font-medium text-[#1E40AF] w-24 md:text-right shrink-0 truncate">{f.label}</label>
          <select
            value={currentFilters[f.key] || (f.opts?.[0] ?? '')}
            onChange={(e) => updateFilter(f.key, e.target.value)}
            className="flex-1 min-w-0 h-8 px-2.5 rounded-lg border border-[#D8E1EE] bg-white text-xs text-slate-700 outline-none focus:border-[#165DFF]"
          >
            {(f.opts || []).map((o) => (
              <option key={o} value={o}>
                {o || '请选择'}
              </option>
            ))}
          </select>
        </div>
      );
    }

    const opKey = `_op_${f.key}`;
    const opOpts = f.opts && f.opts.length > 0 ? f.opts : ['包含', '不包含', '等于'];
    return (
      <div key={`${f.label}-${idx}`} className="flex items-center gap-2 min-w-0">
        <label className="text-xs font-medium text-[#1E40AF] w-24 md:text-right shrink-0 truncate">{f.label}</label>
        <div className="flex flex-1 min-w-0 h-8">
          <select
            value={currentFilters[opKey] || opOpts[0]}
            onChange={(e) => updateFilter(opKey, e.target.value)}
            className="w-20 shrink-0 h-8 px-1.5 rounded-l-lg border border-r-0 border-[#D8E1EE] bg-[#F8FAFC] text-[11px] text-slate-600 outline-none focus:border-[#165DFF]"
          >
            {opOpts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={currentFilters[f.key] || ''}
            onChange={(e) => updateFilter(f.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
              }
            }}
            placeholder={opOpts[0] === '请选择' ? '请选择/输入' : '请输入'}
            className="flex-1 min-w-0 h-8 px-2.5 rounded-r-lg border border-[#D8E1EE] bg-white text-xs text-slate-700 outline-none focus:border-[#165DFF]"
          />
        </div>
      </div>
    );
  };

  const renderChartCard = (ch: ProdChartDef, idx: number) => (
    <div key={`${ch.title}-${idx}`} className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
        <h4 className="text-xs font-bold text-[#1E40AF]">{ch.title}</h4>
      </div>
      {ch.type === 'line' ? (
        <LineChartSvg series={ch.series || []} labels={ch.labels || []} />
      ) : (
        <BarChartSvg data={ch.data || []} />
      )}
    </div>
  );

  const allVisibleSelected =
    pageItems.length > 0 && pageItems.every((it) => currentSelected.includes(it.origIdx));

  const activeSubTab = subTabByPage[pageKey] || tblCfg.subtabs?.[0] || '';

  return (
    <div className="space-y-4">
      {/* KPI Stat Cards (for analysis pages like downtime) */}
      {tblCfg.stats && tblCfg.stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tblCfg.stats.map((st) => (
            <StatKpiCard key={st.label} item={st} />
          ))}
        </div>
      )}

      {/* Charts Row (for analysis pages with charts) */}
      {tblCfg.charts && tblCfg.charts.length > 0 && (
        <div
          className={`grid gap-4 ${
            tblCfg.charts.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {tblCfg.charts.map((ch, idx) => renderChartCard(ch, idx))}
        </div>
      )}

      {/* Search / Filter Card */}
      {tblCfg.search && tblCfg.search.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs p-4">
          {!filterCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
              {tblCfg.search.map((f, idx) => renderFilterControl(f, idx))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#165DFF]" />
              <span>{filterCollapsed ? '查询条件已收起' : `共 ${tblCfg.search.length} 项筛选条件`}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="h-8 px-3 rounded-lg border border-[#D8E1EE] bg-white text-xs font-medium text-slate-600 hover:border-[#165DFF] hover:text-[#165DFF] transition cursor-pointer"
              >
                重置
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
                  onShowToast('查询完成', 'info');
                }}
                className="h-8 px-4 rounded-lg bg-[#165DFF] text-white text-xs font-medium hover:bg-[#134FD8] transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                查询
              </button>
              <button
                type="button"
                onClick={() => onShowToast('数据已刷新', 'info')}
                title="刷新"
                className="h-8 w-8 rounded-lg border border-[#D8E1EE] bg-white text-slate-500 hover:border-[#165DFF] hover:text-[#165DFF] transition inline-flex items-center justify-center cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFilterCollapsed((c) => !c)}
                title={filterCollapsed ? '展开筛选' : '收起筛选'}
                className="h-8 w-8 rounded-lg border border-[#D8E1EE] bg-white text-slate-500 hover:border-[#165DFF] hover:text-[#165DFF] transition inline-flex items-center justify-center cursor-pointer"
              >
                {filterCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Data Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[#E5E9F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(tblCfg.buttons || []).map((btn) => {
              const isAdd = btn.includes('新增') || btn === '添加' || btn === '权限配置';
              const isDel = btn.includes('删除');
              const isImport = btn.includes('导入');
              const isExport = btn.includes('导出');
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleToolbarBtn(btn)}
                  className={`h-8 px-3 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5 cursor-pointer ${
                    isAdd
                      ? 'bg-[#165DFF] text-white hover:bg-[#134FD8] shadow-2xs'
                      : isDel
                        ? 'border border-red-200 bg-red-50 text-[#EA580C] hover:bg-red-100'
                        : 'border border-[#D8E1EE] bg-white text-slate-700 hover:border-[#165DFF] hover:text-[#165DFF]'
                  }`}
                >
                  {isAdd && <Plus className="w-3.5 h-3.5" />}
                  {isDel && <Trash2 className="w-3.5 h-3.5" />}
                  {isImport && <Upload className="w-3.5 h-3.5" />}
                  {isExport && <Download className="w-3.5 h-3.5" />}
                  <span>{btn.replace(/^[+-]/, '')}</span>
                </button>
              );
            })}
            {currentSelected.length > 0 && (
              <span className="text-xs text-[#165DFF] font-medium ml-1">
                已勾选 {currentSelected.length} 项
              </span>
            )}
          </div>

          {/* Quick keyword search */}
          <div className="flex items-center">
            <input
              type="text"
              value={currentFilters._kw || ''}
              onChange={(e) => {
                updateFilter('_kw', e.target.value);
                setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
              }}
              placeholder="关键字搜索..."
              className="h-8 w-44 md:w-56 px-2.5 rounded-l-lg border border-r-0 border-[#D8E1EE] text-xs text-slate-700 outline-none focus:border-[#165DFF]"
            />
            <button
              type="button"
              onClick={() => setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }))}
              className="h-8 px-3 rounded-r-lg bg-[#165DFF] text-white hover:bg-[#134FD8] transition inline-flex items-center justify-center cursor-pointer"
              title="搜索"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F7FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                {tblCfg.cols.map((c: ProdColDef) =>
                  c.cb ? (
                    <th key="_cb" className="w-10 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(e) => toggleAllVisible(e.target.checked)}
                        className="rounded border-slate-300 accent-[#165DFF] cursor-pointer"
                      />
                    </th>
                  ) : (
                    <th
                      key={c.k}
                      onClick={() => c.sort && handleSort(c.k)}
                      className={`px-3 py-2.5 text-left font-semibold whitespace-nowrap ${
                        c.sort ? 'cursor-pointer hover:text-[#165DFF] select-none' : ''
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.t}
                        {c.sort && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                      </span>
                    </th>
                  )
                )}
                {hasActions && (
                  <th className="px-3 py-2.5 text-center font-semibold whitespace-nowrap sticky right-0 bg-[#F4F7FC] border-l border-[#E5E9F0]">
                    <span className="inline-flex items-center gap-1">
                      操作
                      <Settings className="w-3 h-3 text-slate-400" />
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={tblCfg.cols.length + (hasActions ? 1 : 0)}
                    className="py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="w-8 h-8 text-slate-200" />
                      <span>暂无数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pageItems.map(({ row, origIdx }) => {
                  const isChecked = currentSelected.includes(origIdx);
                  return (
                    <tr
                      key={origIdx}
                      className={`border-b border-[#F1F5F9] transition-colors ${
                        isChecked ? 'bg-blue-50/70' : 'hover:bg-[#F8FAFF]'
                      }`}
                    >
                      {tblCfg.cols.map((c: ProdColDef) => {
                        if (c.cb) {
                          return (
                            <td key="_cb" className="px-3 py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRowSelect(origIdx)}
                                className="rounded border-slate-300 accent-[#165DFF] cursor-pointer"
                              />
                            </td>
                          );
                        }
                        const val = row[c.k];
                        const isNumeric =
                          typeof val === 'number' ||
                          (typeof val === 'string' && /^\d+(\.\d+)?%?$/.test(val.trim()));
                        return (
                          <td
                            key={c.k}
                            title={val == null ? '' : String(val)}
                            className={`px-3 py-2.5 text-slate-700 whitespace-nowrap max-w-[280px] truncate ${
                              isNumeric ? 'font-mono tabular-nums' : ''
                            }`}
                          >
                            {c.tag ? renderTagBadge(val) : val === '' || val == null ? '-' : String(val)}
                          </td>
                        );
                      })}
                      {hasActions && (
                        <td className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 bg-white border-l border-[#F1F5F9]">
                          <div className="inline-flex items-center gap-2.5">
                            {(tblCfg.actions || []).map((act) => (
                              <button
                                key={act}
                                type="button"
                                onClick={() => handleRowAction(act, row, origIdx)}
                                className={`text-xs font-medium cursor-pointer hover:underline ${
                                  act === '删除' ? 'text-[#EA580C]' : 'text-[#165DFF]'
                                }`}
                              >
                                {act}
                              </button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E5E9F0] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-mono tabular-nums">共计 {displayTotal} 条</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPageNumByPage((prev) => ({ ...prev, [pageKey]: Math.max(1, safePage - 1) }))}
              className="h-7 w-7 rounded-md border border-[#D8E1EE] bg-white inline-flex items-center justify-center disabled:opacity-40 hover:border-[#165DFF] hover:text-[#165DFF] cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
              const p = Math.max(1, Math.min(totalPages - 4, safePage - 2)) + idx;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPageNumByPage((prev) => ({ ...prev, [pageKey]: p }))}
                  className={`h-7 min-w-7 px-2 rounded-md border text-xs font-mono tabular-nums cursor-pointer ${
                    p === safePage
                      ? 'bg-[#165DFF] border-[#165DFF] text-white font-semibold'
                      : 'bg-white border-[#D8E1EE] text-slate-600 hover:border-[#165DFF] hover:text-[#165DFF]'
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
              className="h-7 w-7 rounded-md border border-[#D8E1EE] bg-white inline-flex items-center justify-center disabled:opacity-40 hover:border-[#165DFF] hover:text-[#165DFF] cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <select
              value={currentPageSize}
              onChange={(e) => {
                setPageSizeByPage((prev) => ({ ...prev, [pageKey]: Number(e.target.value) }));
                setPageNumByPage((prev) => ({ ...prev, [pageKey]: 1 }));
              }}
              className="h-7 px-2 rounded-md border border-[#D8E1EE] bg-white text-xs text-slate-600 outline-none focus:border-[#165DFF]"
            >
              <option value={10}>10 条/页</option>
              <option value={20}>20 条/页</option>
              <option value={50}>50 条/页</option>
            </select>
          </div>
        </div>

        {/* Optional Subtabs Section (e.g., 权限范围 on permission, 人员信息/角色信息 on andon) */}
        {tblCfg.subtabs && tblCfg.subtabs.length > 0 && (
          <div className="border-t border-[#E5E9F0] bg-[#FAFBFD]">
            <div className="px-4 flex items-center gap-4 border-b border-[#E5E9F0] bg-white">
              {tblCfg.subtabs.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSubTabByPage((prev) => ({ ...prev, [pageKey]: st }))}
                  className={`py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                    activeSubTab === st
                      ? 'border-[#165DFF] text-[#165DFF]'
                      : 'border-transparent text-slate-500 hover:text-[#1E40AF]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4F7FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                    {(tblCfg.subCols || []).map((c) => (
                      <th key={c.k} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                        {c.t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(tblCfg.subRows || []).length === 0 ? (
                    <tr>
                      <td colSpan={(tblCfg.subCols || []).length || 1} className="py-6 text-center text-slate-400">
                        暂无关联{activeSubTab}数据（请点击上方记录或通过配置添加）
                      </td>
                    </tr>
                  ) : (
                    (tblCfg.subRows || []).map((r, ri) => (
                      <tr key={ri} className="border-b border-[#F1F5F9]">
                        {(tblCfg.subCols || []).map((c) => (
                          <td key={c.k} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                            {r[c.k] ?? '-'}
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

      {/* Add / Edit / View Modal */}
      {modalOpen && modalFormDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FAFBFD]">
              <h3 className="text-sm font-bold text-[#1E40AF]">{modalTitle}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {modalFormDef.groups.map((grp) => (
                <div key={grp.name} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grp.fields.map((f) => {
                    const readonly = modalMode === 'view';
                    const val = modalValues[f.key] ?? '';
                    const setVal = (v: string) => setModalValues((prev) => ({ ...prev, [f.key]: v }));
                    return (
                      <div key={f.key} className={`flex flex-col gap-1 ${f.full ? 'sm:col-span-2' : ''}`}>
                        <label className="text-xs font-medium text-[#1E40AF]">
                          {f.required && <span className="text-[#EA580C] mr-0.5">*</span>}
                          {f.label}
                        </label>
                        {f.type === 'select' ? (
                          <select
                            disabled={readonly}
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            className="h-9 px-2.5 rounded-lg border border-[#D8E1EE] bg-white disabled:bg-slate-50 text-xs text-slate-700 outline-none focus:border-[#165DFF]"
                          >
                            <option value="">请选择</option>
                            {(f.opts || []).map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : f.type === 'textarea' ? (
                          <textarea
                            readOnly={readonly}
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            rows={3}
                            className="p-2.5 rounded-lg border border-[#D8E1EE] bg-white read-only:bg-slate-50 text-xs text-slate-700 outline-none focus:border-[#165DFF]"
                          />
                        ) : (
                          <input
                            type={f.type === 'number' ? 'number' : 'text'}
                            readOnly={readonly}
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            placeholder={f.type === 'date' ? 'YYYY-MM-DD' : '请输入'}
                            className="h-9 px-2.5 rounded-lg border border-[#D8E1EE] bg-white read-only:bg-slate-50 text-xs text-slate-700 outline-none focus:border-[#165DFF]"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] flex items-center justify-end gap-2 bg-[#FAFBFD]">
              {modalMode === 'view' ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-8 px-4 rounded-lg border border-[#D8E1EE] bg-white text-xs font-medium text-slate-700 hover:border-[#165DFF] hover:text-[#165DFF] cursor-pointer"
                >
                  关闭
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-8 px-4 rounded-lg border border-[#D8E1EE] bg-white text-xs font-medium text-slate-700 hover:border-[#165DFF] hover:text-[#165DFF] cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveModal(false)}
                    className="h-8 px-4 rounded-lg border border-[#165DFF] bg-blue-50 text-[#165DFF] text-xs font-medium hover:bg-blue-100 cursor-pointer"
                  >
                    保存不退出
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveModal(true)}
                    className="h-8 px-4 rounded-lg bg-[#165DFF] text-white text-xs font-medium hover:bg-[#134FD8] cursor-pointer"
                  >
                    保存并退出
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                <span>操作确认</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-600 leading-relaxed">{confirmState.message}</div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] flex items-center justify-end gap-2 bg-[#FAFBFD]">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="h-8 px-4 rounded-lg border border-[#D8E1EE] bg-white text-xs font-medium text-slate-700 hover:border-[#165DFF] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className="h-8 px-4 rounded-lg bg-[#EA580C] text-white text-xs font-medium hover:bg-orange-700 cursor-pointer"
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
