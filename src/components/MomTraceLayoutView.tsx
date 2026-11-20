import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Layers,
  RotateCcw,
  Search,
} from 'lucide-react';
import type {
  MomPageSpec,
  MomSpecCol,
  MomSpecTraceLayout,
  MomSpecTracePanel,
  MomSpecTraceTable,
} from '../data/momImportedSpecs';

interface MomTraceLayoutViewProps {
  spec: MomPageSpec;
  layout: MomSpecTraceLayout;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type RowRecord = Record<string, unknown> & { __id?: string };

const STATUS_CLS: Record<string, string> = {
  已出库: 'bg-blue-50 text-blue-700 border-blue-200',
  已入库: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  已完工: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  正常: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  合格: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  结束: 'bg-slate-100 text-slate-700 border-slate-200',
  进行中: 'bg-blue-50 text-blue-700 border-blue-200',
  异常: 'bg-rose-50 text-rose-700 border-rose-200',
  NG: 'bg-rose-50 text-rose-700 border-rose-200',
  不合格: 'bg-rose-50 text-rose-700 border-rose-200',
};

function exportTraceCsv(title: string, cols: MomSpecCol[], rows: RowRecord[]) {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.map((c) => esc(c.title)).join(',');
  const body = rows.map((r) => cols.map((c) => esc(r[c.key])).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + header + '\n' + body], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}-追溯导出.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const MiniDataTable: React.FC<{
  table: MomSpecTraceTable;
  selectedIdx?: number;
  onSelectRow?: (idx: number, row: RowRecord) => void;
  compact?: boolean;
}> = ({ table, selectedIdx, onSelectRow, compact }) => {
  const [page, setPage] = useState(1);
  const pageSize = table.pageSize || 10;
  const rows = (table.rows || []) as RowRecord[];
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="border border-[#E5E9F0] rounded-xl overflow-hidden bg-white">
      {table.title && (
        <div className="px-3.5 py-2.5 bg-[#F8FAFC] border-b border-[#E5E9F0] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 rounded-full bg-[#165DFF]" />
            <span className="text-xs font-bold text-[#1E40AF]">{table.title}</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-[#64748B]">
            共 {rows.length} 条
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E9F0] text-[11px] font-semibold text-[#1E40AF]">
              <th className="w-10 px-2.5 py-2 text-center font-mono">序号</th>
              {(table.cols || []).map((c) => (
                <th
                  key={c.key}
                  style={{ minWidth: c.w ? `${Math.min(c.w, 220)}px` : '110px' }}
                  className="px-3 py-2 whitespace-nowrap"
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F7] text-xs text-[#1E293B]">
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={(table.cols?.length || 1) + 1}
                  className="py-8 text-center text-xs text-[#94A3B8]"
                >
                  {table.emptyText || '暂无数据'}
                </td>
              </tr>
            ) : (
              paged.map((row, rIdx) => {
                const absIdx = (safePage - 1) * pageSize + rIdx;
                const isSelected = selectedIdx === absIdx;
                return (
                  <tr
                    key={String(row.__id ?? absIdx)}
                    onClick={() => onSelectRow?.(absIdx, row)}
                    className={`transition-colors ${
                      onSelectRow ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'hover:bg-[#F8FAFF]'
                    }`}
                  >
                    <td className="px-2.5 py-2 text-center font-mono tabular-nums text-[#64748B]">
                      {absIdx + 1}
                    </td>
                    {(table.cols || []).map((c) => {
                      const raw = row[c.key];
                      const str = raw === undefined || raw === null || raw === '' ? '-' : String(raw);
                      const badgeCls = STATUS_CLS[str];
                      const isMono =
                        /SN|号|编码|时间|日期|数量|数|批次|单/.test(c.title) ||
                        /^\d/.test(str);
                      return (
                        <td
                          key={c.key}
                          className={`${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'} whitespace-nowrap max-w-[260px] truncate ${
                            isMono ? 'font-mono tabular-nums' : ''
                          }`}
                          title={str}
                        >
                          {badgeCls ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[11px] font-medium border rounded ${badgeCls}`}
                            >
                              {str}
                            </span>
                          ) : (
                            str
                          )}
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
      {rows.length > pageSize && (
        <div className="px-3 py-2 border-t border-[#EEF2F7] bg-[#F8FAFC] flex items-center justify-between text-[11px] text-[#64748B]">
          <span className="font-mono tabular-nums">
            第 {safePage}/{totalPages} 页 · 共 {rows.length} 条
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-[#DCE3EE] bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-[#DCE3EE] bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MomTraceLayoutView: React.FC<MomTraceLayoutViewProps> = ({
  spec,
  layout,
  onShowToast,
}) => {
  const query = layout.query || {};
  const isAdvanced = Array.isArray(query.advanced) && query.advanced.length > 0;

  const [org, setOrg] = useState(query.org || '昇兴集团-中山制罐工厂');
  const [keyword, setKeyword] = useState(query.keyword || '');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [advValues, setAdvValues] = useState<Record<number, { op: string; val: string }>>(() => {
    const init: Record<number, { op: string; val: string }> = {};
    (query.advanced || []).forEach((f, idx) => {
      init[idx] = { op: f.op || '=', val: f.value || '' };
    });
    return init;
  });
  const [appliedAdv, setAppliedAdv] = useState<Record<number, string>>({});
  const [advExpanded, setAdvExpanded] = useState(true);
  const [selectedMasterIdx, setSelectedMasterIdx] = useState(0);
  const [selectedPanelRows, setSelectedPanelRows] = useState<Record<number, number>>({});
  const [linkedOverrides, setLinkedOverrides] = useState<Record<string, string>>({});
  const [activeTabIdx, setActiveTabIdx] = useState<number>(layout.right?.activeTab ?? 0);

  useEffect(() => {
    setOrg(query.org || '昇兴集团-中山制罐工厂');
    setKeyword(query.keyword || '');
    setAppliedKeyword('');
    const init: Record<number, { op: string; val: string }> = {};
    (query.advanced || []).forEach((f, idx) => {
      init[idx] = { op: f.op || '=', val: f.value || '' };
    });
    setAdvValues(init);
    setAppliedAdv({});
    setAdvExpanded(true);
    setSelectedMasterIdx(0);
    setSelectedPanelRows({});
    setLinkedOverrides({});
    setActiveTabIdx(layout.right?.activeTab ?? 0);
  }, [spec.id]);

  const masterRows = useMemo(() => {
    const rows = (layout.master?.rows || []) as RowRecord[];
    const conds = (Object.values(appliedAdv) as string[])
      .map((s) => String(s ?? '').trim().toLowerCase())
      .filter(Boolean);
    if (!conds.length) return rows;
    return rows.filter((r) =>
      conds.every((c) =>
        Object.entries(r).some(([k, v]) => k !== '__id' && String(v ?? '').toLowerCase().includes(c))
      )
    );
  }, [layout.master, appliedAdv]);

  const filteredPanels = useMemo(() => {
    const panels = layout.left?.panels || [];
    const kw = appliedKeyword.trim().toLowerCase();
    if (!kw) return panels;
    return panels.map((p) => {
      if (p.type === 'empty' || !p.rows) return p;
      const filtered = p.rows.filter((r) =>
        Object.entries(r).some(([k, v]) => k !== '__id' && String(v ?? '').toLowerCase().includes(kw))
      );
      return { ...p, rows: filtered };
    });
  }, [layout.left, appliedKeyword]);

  const handleQuery = () => {
    if (isAdvanced) {
      const next: Record<number, string> = {};
      (Object.entries(advValues) as Array<[string, { op: string; val: string }]>).forEach(
        ([k, v]) => {
          if (v?.val?.trim()) next[Number(k)] = v.val.trim();
        }
      );
      setAppliedAdv(next);
      onShowToast('已按条件更新单据追溯列表', 'success');
    } else {
      setAppliedKeyword(keyword);
      onShowToast(keyword.trim() ? `已追溯条码：${keyword.trim()}` : '已刷新全部追溯数据', 'success');
    }
  };

  const handleReset = () => {
    setKeyword('');
    setAppliedKeyword('');
    const init: Record<number, { op: string; val: string }> = {};
    (query.advanced || []).forEach((f, idx) => {
      init[idx] = { op: f.op || '=', val: '' };
    });
    setAdvValues(init);
    setAppliedAdv({});
    setLinkedOverrides({});
    onShowToast('追溯查询条件已重置', 'info');
  };

  const handleExport = () => {
    const rightTabs = layout.right?.tabs || [];
    const curTab = rightTabs[activeTabIdx];
    const targetTable = curTab?.tables?.[0] || layout.master;
    if (targetTable && targetTable.cols?.length) {
      exportTraceCsv(
        `${spec.title}-${curTab?.name || '明细'}`,
        targetTable.cols,
        (targetTable.rows || []) as RowRecord[]
      );
      onShowToast(`已导出「${curTab?.name || spec.title}」追溯数据`, 'success');
    } else {
      const firstListPanel = filteredPanels.find((p) => p.cols && p.rows && p.rows.length > 0);
      if (firstListPanel && firstListPanel.cols) {
        exportTraceCsv(spec.title, firstListPanel.cols, (firstListPanel.rows || []) as RowRecord[]);
        onShowToast('已导出追溯列表 CSV', 'success');
      } else {
        onShowToast('当前页签暂无可导出的数据', 'warning');
      }
    }
  };

  const handleSelectPanelRow = (panelIdx: number, panel: MomSpecTracePanel, rowIdx: number, row: RowRecord) => {
    setSelectedPanelRows((prev) => ({ ...prev, [panelIdx]: rowIdx }));
    const linkKey = panel.linkKey || panel.cols?.[0]?.key;
    const linkLabel = panel.linkLabel || panel.cols?.[0]?.title;
    if (linkKey && linkLabel && row[linkKey] !== undefined) {
      const val = String(row[linkKey]);
      setLinkedOverrides((prev) => ({ ...prev, [linkLabel]: val }));
      onShowToast(`已联动定位：${linkLabel} = ${val}`, 'info');
    }
  };

  const rightTabs = layout.right?.tabs || [];
  const activeTab = rightTabs[activeTabIdx] || rightTabs[0];

  return (
    <div className="space-y-4">
      {/* Top Query Bar */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs space-y-3">
        {isAdvanced ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#1E40AF] shrink-0">组织机构</label>
                <select
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="h-8 px-2.5 text-xs border border-[#DCE3EE] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                >
                  <option value="昇兴集团-中山制罐工厂">昇兴集团-中山制罐工厂</option>
                  <option value="昇兴集团-泉州制罐工厂">昇兴集团-泉州制罐工厂</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] rounded-lg text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>重置</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuery}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#165DFF] hover:bg-[#1E40AF] text-white rounded-lg cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>查询</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdvExpanded((v) => !v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#165DFF] hover:bg-[#EFF6FF] rounded-lg cursor-pointer"
                >
                  <span>{advExpanded ? '收起' : '展开'}</span>
                  {advExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {advExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(query.advanced || []).map((f, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-[#1E40AF]">{f.label}</label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={advValues[idx]?.op || '='}
                        onChange={(e) =>
                          setAdvValues((prev) => ({
                            ...prev,
                            [idx]: { op: e.target.value, val: prev[idx]?.val || '' },
                          }))
                        }
                        className="h-8 w-16 px-1.5 text-xs border border-[#DCE3EE] rounded-lg bg-[#F8FAFC] text-[#334155] outline-none"
                      >
                        <option value="=">=</option>
                        <option value="包含">包含</option>
                        <option value="!=">!=</option>
                      </select>
                      <input
                        type="text"
                        value={advValues[idx]?.val || ''}
                        onChange={(e) =>
                          setAdvValues((prev) => ({
                            ...prev,
                            [idx]: { op: prev[idx]?.op || '=', val: e.target.value },
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuery();
                        }}
                        placeholder={f.ph || `请输入${f.label}`}
                        className="h-8 flex-1 min-w-0 px-2.5 text-xs border border-[#DCE3EE] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[#1E40AF] shrink-0">组织机构</label>
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="h-8 px-2.5 text-xs border border-[#DCE3EE] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
              >
                <option value="昇兴集团-中山制罐工厂">昇兴集团-中山制罐工厂</option>
                <option value="昇兴集团-泉州制罐工厂">昇兴集团-泉州制罐工厂</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <label className="text-xs font-semibold text-[#1E40AF] shrink-0">追溯条码</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuery();
                }}
                placeholder={query.ph || '请输入产品SN / 物料SN'}
                className="h-8 flex-1 min-w-0 px-3 text-xs font-mono border border-[#DCE3EE] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleQuery}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#165DFF] hover:bg-[#1E40AF] text-white rounded-lg cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>查询</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] rounded-lg text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                <span>重置</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] rounded-lg text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#64748B]" />
                <span>导出</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Optional Master Table (p308 单据产品追溯) */}
      {layout.master && (
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#165DFF]" />
              <span className="text-xs font-bold text-[#1E40AF]">单据主信息</span>
              <span className="px-2 py-0.5 text-[11px] font-mono tabular-nums bg-[#F1F5F9] text-[#475569] rounded border border-[#E2E8F0]">
                共 {masterRows.length} 条
              </span>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white border border-[#DCE3EE] rounded-lg text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>导出明细</span>
            </button>
          </div>
          <MiniDataTable
            table={{ ...layout.master, rows: masterRows }}
            selectedIdx={selectedMasterIdx}
            onSelectRow={(idx) => {
              setSelectedMasterIdx(idx);
              onShowToast(`已切换至第 ${idx + 1} 条单据追溯详情`, 'info');
            }}
          />
        </div>
      )}

      {/* Left / Right Split */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Panels */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-4">
          {filteredPanels.map((panel, pIdx) => (
            <div
              key={pIdx}
              className="bg-white border border-[#E5E9F0] rounded-2xl overflow-hidden shadow-xs"
            >
              <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E9F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 rounded-full bg-[#165DFF]" />
                  <span className="text-xs font-bold text-[#1E40AF]">
                    {panel.title || '关联追溯列表'}
                  </span>
                </div>
                {panel.rows && (
                  <span className="text-[11px] font-mono tabular-nums text-[#64748B]">
                    {panel.rows.length} 条
                  </span>
                )}
              </div>
              {panel.type === 'empty' || !panel.cols ? (
                <div className="py-10 text-center text-xs text-[#94A3B8]">
                  {panel.emptyText || '暂无数据'}
                </div>
              ) : (
                <div className="p-2.5">
                  <MiniDataTable
                    table={{
                      cols: panel.cols,
                      rows: panel.rows || [],
                      pageSize: panel.pageSize || 10,
                      emptyText: panel.emptyText || '暂无匹配条码',
                    }}
                    selectedIdx={selectedPanelRows[pIdx] ?? 0}
                    onSelectRow={(rIdx, row) => handleSelectPanelRow(pIdx, panel, rIdx, row)}
                    compact
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Details */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Basic Info Card (p306 / p307) */}
          {layout.right?.basic && (
            <div className="bg-white border border-[#E5E9F0] rounded-2xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E9F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 rounded-full bg-[#165DFF]" />
                  <span className="text-xs font-bold text-[#1E40AF]">
                    {layout.right.basic.title || '基本信息'}
                  </span>
                </div>
                <span className="text-[11px] text-[#64748B]">点击左侧条码可实时联动</span>
              </div>
              <div
                className={`p-4 grid gap-x-4 gap-y-2.5 ${
                  layout.right.basic.cols === 3
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
                }`}
              >
                {layout.right.basic.fields.map((field, fIdx) => {
                  const override = linkedOverrides[field.label];
                  const val = override !== undefined ? override : field.value;
                  const isHighlighted = override !== undefined;
                  return (
                    <div
                      key={fIdx}
                      className={`px-3 py-2 rounded-lg border text-xs ${
                        isHighlighted
                          ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                          : 'bg-[#F8FAFC] border-[#EEF2F7]'
                      }`}
                    >
                      <div className="text-[11px] text-[#64748B] truncate">{field.label}</div>
                      <div
                        className={`mt-0.5 font-medium truncate font-mono tabular-nums ${
                          isHighlighted ? 'text-[#165DFF] font-semibold' : 'text-[#0F172A]'
                        }`}
                        title={val || '-'}
                      >
                        {val || '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Multi-Tab Detail Area */}
          {rightTabs.length > 0 && (
            <div className="bg-white border border-[#E5E9F0] rounded-2xl overflow-hidden shadow-xs">
              <div className="px-4 pt-2 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center gap-1 overflow-x-auto">
                {rightTabs.map((t, idx) => {
                  const rowCount = (t.tables || []).reduce(
                    (acc, tb) => acc + (tb.rows?.length || 0),
                    0
                  );
                  return (
                    <button
                      key={t.name + idx}
                      type="button"
                      onClick={() => setActiveTabIdx(idx)}
                      className={`px-3.5 py-2 text-xs font-medium border-b-2 transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTabIdx === idx
                          ? 'border-[#165DFF] text-[#165DFF] font-semibold bg-white rounded-t-lg'
                          : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <span>{t.name}</span>
                      {rowCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono tabular-nums rounded bg-[#EFF6FF] text-[#1D4ED8]">
                          {rowCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 space-y-4">
                {!activeTab?.tables || activeTab.tables.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#94A3B8] border border-dashed border-[#DCE3EE] rounded-xl bg-[#F8FAFC]/60">
                    {activeTab?.emptyText || `当前「${activeTab?.name || ''}」暂无关联追溯记录`}
                  </div>
                ) : (
                  activeTab.tables.map((tb, tbIdx) => (
                    <MiniDataTable key={tbIdx} table={tb} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
