import React, { useState, useMemo } from 'react';
import {
  Settings2,
  Search,
  RotateCcw,
  Plus,
  Edit3,
  Download,
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
  ArrowLeft,
} from 'lucide-react';

interface ProcessOpConfigItemTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface OpConfigItem {
  id: string;
  paramCode: string;
  paramName: string;
  opCategory: string;
  sortOrder: string;
  creator: string;
  createdAt: string;
}

type ColumnKey = keyof Omit<OpConfigItem, 'id'>;

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'paramCode', label: '参数编码', visible: true, highlight: true, pinned: true },
  { key: 'paramName', label: '参数名称', visible: true, highlight: true, pinned: true },
  { key: 'opCategory', label: '工序类别', visible: true },
  { key: 'sortOrder', label: '排序', visible: true },
  { key: 'creator', label: '创建人', visible: false },
  { key: 'createdAt', label: '创建时间', visible: false },
];

const INITIAL_ROWS: OpConfigItem[] = [
  {
    id: 'cfg-01',
    paramCode: 'STERILIZATION',
    paramName: '客户杀菌',
    opCategory: '基础信息',
    sortOrder: '5',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-02',
    paramCode: 'PROCESS_TYPE',
    paramName: '工艺类型',
    opCategory: '基础信息',
    sortOrder: '4',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-03',
    paramCode: 'STEEL_SPEC',
    paramName: '涂印薄钢板规格',
    opCategory: '基础信息',
    sortOrder: '3',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-04',
    paramCode: 'TIN_COATING',
    paramName: '镀锡量（内/外）g/m2',
    opCategory: '基础信息',
    sortOrder: '2',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-05',
    paramCode: 'CAN_TYPE',
    paramName: '罐型',
    opCategory: '基础信息',
    sortOrder: '1',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-06',
    paramCode: 'PALLET_TYPE',
    paramName: '栈板',
    opCategory: '包装',
    sortOrder: '10',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-07',
    paramCode: 'OUTER_PACKAGE',
    paramName: '外包装',
    opCategory: '包装',
    sortOrder: '9',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-08',
    paramCode: 'SEPARATOR_REQUIREMENT',
    paramName: '隔离板放置要求',
    opCategory: '包装',
    sortOrder: '8',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-09',
    paramCode: 'SEPARATOR_BOARD',
    paramName: '隔离板',
    opCategory: '包装',
    sortOrder: '7',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
  {
    id: 'cfg-10',
    paramCode: 'STRAP_METHOD',
    paramName: '打带方式',
    opCategory: '包装',
    sortOrder: '6',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:23:03',
  },
];

const CATEGORY_OPTIONS = [
  '基础信息',
  '包装',
  '制程',
  '电阻焊',
  'SPS烘干',
  '边缘补涂',
  '全喷',
  '缩颈、翻边、封盖',
  '裁剪',
  '清洗',
  '底涂',
  '内涂',
  '彩印',
  '堆垛',
  '手挑罐',
];

export const ProcessOpConfigItemTab: React.FC<ProcessOpConfigItemTabProps> = ({ onShowToast }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rows, setRows] = useState<OpConfigItem[]>(INITIAL_ROWS);
  const [totalVirtualCount, setTotalVirtualCount] = useState(71);

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [filters, setFilters] = useState({
    codeOp: 'contains' as MatchOp,
    code: '',
    nameOp: 'contains' as MatchOp,
    name: '',
    catOp: 'contains' as MatchOp,
    cat: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Table states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');

  // Column settings (F3)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // Form states (P2)
  const [form, setForm] = useState({
    paramCode: '',
    paramName: '',
    opCategory: '',
    sortOrder: '',
  });
  const [formErrors, setFormErrors] = useState({
    paramCode: false,
    paramName: false,
  });

  // Confirm dialog
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    desc: '',
    onConfirm: null,
  });

  const hasActiveFilter = useMemo(
    () =>
      Boolean(
        appliedFilters.code.trim() || appliedFilters.name.trim() || appliedFilters.cat.trim()
      ),
    [appliedFilters]
  );

  const filteredRows = useMemo(() => {
    const match = (val: string, q: string, op: MatchOp) => {
      if (!q.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = q.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    return rows.filter((r) => {
      if (!match(r.paramCode, appliedFilters.code, appliedFilters.codeOp)) return false;
      if (!match(r.paramName, appliedFilters.name, appliedFilters.nameOp)) return false;
      if (!match(r.opCategory, appliedFilters.cat, appliedFilters.catOp)) return false;
      return true;
    });
  }, [rows, appliedFilters]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredRows;
    const k = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredRows].sort(
      (a, b) => String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'zh-CN', { numeric: true }) * dir
    );
  }, [filteredRows, sortConfig]);

  const displayTotal = hasActiveFilter ? sortedRows.length : totalVirtualCount;
  const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const visibleColumns = columns.filter((c) => c.visible);

  const handleQuery = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setJumpInput('1');
    const match = (val: string, q: string, op: MatchOp) => {
      if (!q.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = q.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    const isFiltering = Boolean(filters.code.trim() || filters.name.trim() || filters.cat.trim());
    const count = isFiltering
      ? rows.filter(
          (r) =>
            match(r.paramCode, filters.code, filters.codeOp) &&
            match(r.paramName, filters.name, filters.nameOp) &&
            match(r.opCategory, filters.cat, filters.catOp)
        ).length
      : totalVirtualCount;
    onShowToast(`查询完成，共 ${count} 条工序配置项`, 'info');
  };

  const handleReset = () => {
    const empty = {
      codeOp: 'contains' as MatchOp,
      code: '',
      nameOp: 'contains' as MatchOp,
      name: '',
      catOp: 'contains' as MatchOp,
      cat: '',
    };
    setOrgFilter('请选择');
    setFilters(empty);
    setAppliedFilters(empty);
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    setCurrentPage(1);
    setJumpInput('1');
    onShowToast('筛选条件已重置', 'info');
  };

  const openForm = (mode: 'add' | 'edit' | 'view', row?: OpConfigItem) => {
    setFormMode(mode);
    setFormErrors({ paramCode: false, paramName: false });
    setIsColPanelOpen(false);
    if (mode === 'add') {
      setEditingId(null);
      setForm({ paramCode: '', paramName: '', opCategory: '', sortOrder: '' });
    } else if (row) {
      setEditingId(row.id);
      setForm({
        paramCode: row.paramCode,
        paramName: row.paramName,
        opCategory: row.opCategory,
        sortOrder: row.sortOrder,
      });
    }
    setView('form');
  };

  const handleSaveForm = () => {
    if (formMode === 'view') {
      onShowToast('查询模式不可保存', 'warning');
      return;
    }
    const codeMissing = !form.paramCode.trim();
    const nameMissing = !form.paramName.trim();
    setFormErrors({ paramCode: codeMissing, paramName: nameMissing });
    if (codeMissing || nameMissing) {
      onShowToast('请填写参数编码与参数名称', 'error');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (formMode === 'edit' && editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                paramCode: form.paramCode.trim(),
                paramName: form.paramName.trim(),
                opCategory: form.opCategory,
                sortOrder: form.sortOrder.trim(),
              }
            : r
        )
      );
      onShowToast('工序配置项已修改并保存', 'success');
    } else {
      const newRec: OpConfigItem = {
        id: `cfg-${Date.now()}`,
        paramCode: form.paramCode.trim(),
        paramName: form.paramName.trim(),
        opCategory: form.opCategory,
        sortOrder: form.sortOrder.trim(),
        creator: '潘鑫',
        createdAt: nowStr,
      };
      setRows((prev) => [newRec, ...prev]);
      setTotalVirtualCount((c) => c + 1);
      onShowToast('工序配置项已新增并保存', 'success');
    }
    setSelectedIds([]);
    setView('list');
  };

  const handleExport = () => {
    const header = visibleColumns.map((c) => c.label).join(',');
    const body = sortedRows
      .map((r) => visibleColumns.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `工艺单工序参数配置_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`已导出当前页 ${sortedRows.length} 条工序配置项`, 'success');
  };

  const goPage = (n: number) => {
    const target = Math.min(totalPages, Math.max(1, n));
    setCurrentPage(target);
    setJumpInput(String(target));
    if (target !== currentPage) {
      onShowToast(`已切换到第 ${target} 页（共 ${totalPages} 页）`, 'info');
    }
  };

  const allVisibleSelected =
    sortedRows.length > 0 && sortedRows.every((r) => selectedIds.includes(r.id));

  const pageNumbers = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return [1, 2, 3, 4, 5, -1, totalPages];
  }, [totalPages]);

  // ====================== VIEW 2: 添加 / 修改 / 查询 表单 ======================
  if (view === 'form') {
    const isReadOnly = formMode === 'view';
    const ctlCls = (err?: boolean) =>
      `flex-1 max-w-xs h-8 px-2.5 border rounded-lg outline-none min-w-0 ${
        isReadOnly
          ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
          : err
          ? 'bg-white text-[#1E293B] border-[#EA580C]'
          : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
      }`;

    return (
      <div className="space-y-4 text-xs text-[#1E293B]">
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">
              {formMode === 'view'
                ? '查询-工序配置项'
                : formMode === 'edit'
                ? '修改-工序配置项'
                : '添加-工序配置项'}
            </h2>
            <span className="text-[#64748B]">
              · {isReadOnly ? '只读查询' : '维护工艺单工序参数字段编码与展示排序'}
            </span>
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

        {/* Form Body Card (2x2 fields matching prototype) */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {/* 参数编码 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>参数编码
                </label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={form.paramCode}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, paramCode: e.target.value }));
                    if (e.target.value.trim()) {
                      setFormErrors((prev) => ({ ...prev, paramCode: false }));
                    }
                  }}
                  placeholder="请输入"
                  className={ctlCls(formErrors.paramCode) + ' font-mono'}
                />
              </div>
              {formErrors.paramCode && (
                <span className="text-[11px] text-[#EA580C] pl-23">请填写参数编码</span>
              )}
            </div>

            {/* 参数名称 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>参数名称
                </label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={form.paramName}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, paramName: e.target.value }));
                    if (e.target.value.trim()) {
                      setFormErrors((prev) => ({ ...prev, paramName: false }));
                    }
                  }}
                  placeholder="请输入"
                  className={ctlCls(formErrors.paramName)}
                />
              </div>
              {formErrors.paramName && (
                <span className="text-[11px] text-[#EA580C] pl-23">请填写参数名称</span>
              )}
            </div>

            {/* 工序类别 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                工序类别
              </label>
              <select
                disabled={isReadOnly}
                value={form.opCategory}
                onChange={(e) => setForm((p) => ({ ...p, opCategory: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {form.opCategory && !CATEGORY_OPTIONS.includes(form.opCategory) && (
                  <option value={form.opCategory}>{form.opCategory}</option>
                )}
              </select>
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">排序</label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                placeholder="请输入"
                className={ctlCls() + ' font-mono tabular-nums'}
              />
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-3.5 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setView('list')}
              className="h-8 px-4 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] font-medium cursor-pointer"
            >
              取消
            </button>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSaveForm}
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

  // ====================== VIEW 1: 工序配置项列表 ======================
  return (
    <div
      className="space-y-4 relative text-xs text-[#1E293B]"
      onClick={() => {
        if (isColPanelOpen) setIsColPanelOpen(false);
      }}
    >
      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工艺单工序参数配置</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">组织机构</label>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="请选择">请选择</option>
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
                setIsColPanelOpen((prev) => !prev);
              }}
              className={`h-8 w-8 border rounded-lg flex items-center justify-center transition cursor-pointer ${
                isColPanelOpen
                  ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B]'
                  : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
              title="列设置"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0.5">
            {(
              [
                { label: '参数编码', opKey: 'codeOp', valKey: 'code' },
                { label: '参数名称', opKey: 'nameOp', valKey: 'name' },
                { label: '工序类别', opKey: 'catOp', valKey: 'cat' },
              ] as const
            ).map((f) => (
              <div key={f.valKey} className="flex items-center gap-1.5 min-w-0">
                <label className="text-[#1E40AF] font-medium w-16 text-right whitespace-nowrap shrink-0">
                  {f.label}
                </label>
                <select
                  value={filters[f.opKey]}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [f.opKey]: e.target.value as MatchOp }))
                  }
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer shrink-0"
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
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] flex-1 min-w-0 outline-none focus:border-[#2563EB]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedIds.length}</strong> 项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              共计 <strong className="font-mono tabular-nums text-[#1E293B]">{displayTotal}</strong> 条配置项
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => openForm('add')}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedIds.length !== 1) {
                  onShowToast('请先勾选 1 条要修改的配置项', 'warning');
                  return;
                }
                const target = rows.find((r) => r.id === selectedIds[0]);
                if (target) openForm('edit', target);
              }}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium cursor-pointer ${
                selectedIds.length === 1
                  ? 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7]'
                  : 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8]'
              }`}
              title="勾选 1 条记录后可修改"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>修改</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="h-8 px-3.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={() => {
                      if (allVisibleSelected) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(sortedRows.map((r) => r.id));
                      }
                    }}
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() =>
                      setSortConfig((prev) =>
                        prev.key !== col.key
                          ? { key: col.key, dir: 'asc' }
                          : prev.dir === 'asc'
                          ? { key: col.key, dir: 'desc' }
                          : { key: null, dir: null }
                      )
                    }
                    className={`p-2.5 border-b border-r border-[#E5E9F0] cursor-pointer hover:bg-[#EDF2F7]/70 select-none ${
                      col.highlight ? 'bg-blue-50/70 text-blue-700' : ''
                    }`}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>{col.label}</span>
                      <ArrowUpDown
                        className={`w-3 h-3 ${
                          sortConfig.key === col.key ? 'text-[#1E40AF]' : 'text-[#C5C8BE]'
                        }`}
                      />
                    </div>
                  </th>
                ))}
                <th className="p-2.5 border-b border-[#E5E9F0] w-36 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <div className="inline-flex items-center gap-2">
                    <span>操作</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsColPanelOpen((prev) => !prev);
                      }}
                      className="text-[#64748B] hover:text-[#1E40AF] cursor-pointer"
                      title="列设置"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7] text-[#1E293B]">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-12 text-center text-[#94A3B8]">
                    暂无匹配的工序参数配置项
                  </td>
                </tr>
              ) : (
                sortedRows.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#EBF2FF]/75' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                            )
                          }
                          className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                        />
                      </td>
                      {visibleColumns.map((col) => {
                        const isMono = ['paramCode', 'sortOrder', 'createdAt'].includes(col.key);
                        return (
                          <td
                            key={col.key}
                            className={`p-2.5 border-r border-[#EDF2F7] ${
                              isMono ? 'font-mono tabular-nums text-[#334155]' : ''
                            }`}
                          >
                            {r[col.key] || <span className="text-[#CBD5E1]">-</span>}
                          </td>
                        );
                      })}
                      <td
                        className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isSelected ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                      >
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openForm('view', r)}
                            className="text-[#165DFF] hover:underline font-medium cursor-pointer"
                          >
                            查询
                          </button>
                          <button
                            type="button"
                            onClick={() => openForm('edit', r)}
                            className="text-[#165DFF] hover:underline font-medium cursor-pointer"
                          >
                            修改
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                title: '删除确认',
                                desc: `确定删除工序配置项「${r.paramName}」吗？`,
                                onConfirm: () => {
                                  setRows((prev) => prev.filter((x) => x.id !== r.id));
                                  setTotalVirtualCount((c) => Math.max(0, c - 1));
                                  setSelectedIds((prev) => prev.filter((id) => id !== r.id));
                                  onShowToast('已删除该工序配置项', 'success');
                                },
                              })
                            }
                            className="text-[#EA580C] hover:underline font-medium cursor-pointer"
                          >
                            删除
                          </button>
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
        <div className="px-4 py-2.5 border-t border-[#EDF2F7] bg-[#FFFFFF] flex flex-wrap items-center justify-end gap-2.5 text-xs text-[#64748B]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{displayTotal}</strong> 条
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => goPage(safePage - 1)}
              className="h-7 w-7 border border-[#E5E9F0] rounded flex items-center justify-center bg-white hover:bg-[#EDF2F7] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {pageNumbers.map((p, idx) =>
              p === -1 ? (
                <span key={`dots-${idx}`} className="px-1.5 text-[#94A3B8]">
                  ···
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goPage(p)}
                  className={`h-7 min-w-7 px-2 border rounded font-mono tabular-nums cursor-pointer ${
                    p === safePage
                      ? 'border-[#165DFF] bg-[#EBF2FF] text-[#165DFF] font-semibold'
                      : 'border-[#E5E9F0] bg-white text-[#475569] hover:bg-[#EDF2F7]'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => goPage(safePage + 1)}
              className="h-7 w-7 border border-[#E5E9F0] rounded flex items-center justify-center bg-white hover:bg-[#EDF2F7] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
              setJumpInput('1');
            }}
            className="h-7 px-2 border border-[#E5E9F0] rounded bg-white text-[#1E293B] outline-none cursor-pointer"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
          <div className="flex items-center gap-1">
            <span>跳至</span>
            <input
              type="text"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  goPage(Number(jumpInput) || 1);
                }
              }}
              className="w-10 h-7 px-1.5 border border-[#E5E9F0] rounded text-center font-mono tabular-nums outline-none focus:border-[#2563EB]"
            />
            <span>页</span>
          </div>
        </div>

        {/* Floating Column Settings Panel (F3) */}
        {isColPanelOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-12 z-40 w-72 bg-white rounded-xl border border-[#E5E9F0] shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#EDF2F7] flex items-center justify-between">
              <span className="font-bold text-xs text-[#1E293B]">列设置</span>
              <button
                type="button"
                onClick={() => setIsColPanelOpen(false)}
                className="text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-1.5 max-h-72 overflow-y-auto divide-y divide-[#F8FAFC]">
              {columns.map((col) => (
                <label
                  key={col.key}
                  className={`flex items-center justify-between px-4 py-2 text-xs cursor-pointer hover:bg-[#F8FAFC] ${
                    col.highlight ? 'bg-[#EBF2FF]/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() =>
                        setColumns((prev) =>
                          prev.map((c) => (c.key === col.key ? { ...c, visible: !c.visible } : c))
                        )
                      }
                      className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                    />
                    <span className="text-[#1E293B]">{col.label}</span>
                  </div>
                  <Pin className={`w-3.5 h-3.5 ${col.pinned ? 'text-[#2563EB]' : 'text-[#CBD5E1]'}`} />
                </label>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-[#EDF2F7] bg-[#F8FAFC] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setColumns(INITIAL_COLUMNS.map((c) => ({ ...c })));
                  onShowToast('已恢复默认列', 'info');
                }}
                className="h-7 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => setIsColPanelOpen(false)}
                className="h-7 px-3 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        )}
      </div>

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
