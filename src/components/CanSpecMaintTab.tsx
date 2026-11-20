import React, { useState, useMemo } from 'react';
import {
  Box,
  Search,
  RotateCcw,
  Plus,
  Upload,
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
  ArrowLeft,
} from 'lucide-react';

interface CanSpecMaintTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface CanSpecItem {
  id: string;
  foreignName: string;
  actualCapacity: string;
  bodyCode: string;
  bodyDiameter: string;
  finishedHeight: string;
  otherCompanyName: string;
  internalName: string;
  creator: string;
  createdAt: string;
}

type ColumnKey = keyof Omit<CanSpecItem, 'id'>;

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'foreignName', label: '国外罐型叫法', visible: true, highlight: true, pinned: true },
  { key: 'actualCapacity', label: '实际容量', visible: true },
  { key: 'bodyCode', label: '罐身代号', visible: true, highlight: true, pinned: true },
  { key: 'bodyDiameter', label: '罐身 φ（mm）', visible: true },
  { key: 'finishedHeight', label: '成品罐高（mm）', visible: true },
  { key: 'otherCompanyName', label: '其他公司叫法', visible: true },
  { key: 'internalName', label: '公司内部叫法', visible: true },
  { key: 'creator', label: '创建人', visible: false },
  { key: 'createdAt', label: '创建时间', visible: false },
];

const INITIAL_ROWS: CanSpecItem[] = [
  {
    id: 'can-01',
    foreignName: '113/202/200×307',
    actualCapacity: '145ml',
    bodyCode: '202',
    bodyDiameter: '52.30',
    finishedHeight: '87.50±0.20',
    otherCompanyName: '588',
    internalName: '113#145',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
];

export const CanSpecMaintTab: React.FC<CanSpecMaintTabProps> = ({ onShowToast }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rows, setRows] = useState<CanSpecItem[]>(INITIAL_ROWS);

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [bodyCodeOp, setBodyCodeOp] = useState<MatchOp>('contains');
  const [bodyCodeQuery, setBodyCodeQuery] = useState('');

  // Table state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');

  // Column settings & Import modal
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');

  // Form state (P2)
  const [form, setForm] = useState({
    foreignName: '',
    actualCapacity: '',
    bodyCode: '',
    bodyDiameter: '',
    finishedHeight: '',
    otherCompanyName: '',
    internalName: '',
  });
  const [formErrors, setFormErrors] = useState({
    foreignName: false,
    bodyCode: false,
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

  const filteredRows = useMemo(() => {
    const q = bodyCodeQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const v = (r.bodyCode || '').toLowerCase();
      return bodyCodeOp === 'equals' ? v === q : v.includes(q);
    });
  }, [rows, bodyCodeQuery, bodyCodeOp]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredRows;
    const k = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredRows].sort(
      (a, b) => String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'zh-CN', { numeric: true }) * dir
    );
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const visibleColumns = columns.filter((c) => c.visible);

  const handleQuery = () => {
    setCurrentPage(1);
    onShowToast(`查询完成，共 ${filteredRows.length} 条罐型规格`, 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setBodyCodeOp('contains');
    setBodyCodeQuery('');
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    setCurrentPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const openForm = (mode: 'add' | 'edit' | 'view', row?: CanSpecItem) => {
    setFormMode(mode);
    setFormErrors({ foreignName: false, bodyCode: false });
    setIsColPanelOpen(false);
    if (mode === 'add') {
      setEditingId(null);
      setForm({
        foreignName: '',
        actualCapacity: '',
        bodyCode: '',
        bodyDiameter: '',
        finishedHeight: '',
        otherCompanyName: '',
        internalName: '',
      });
    } else if (row) {
      setEditingId(row.id);
      setForm({
        foreignName: row.foreignName,
        actualCapacity: row.actualCapacity,
        bodyCode: row.bodyCode,
        bodyDiameter: row.bodyDiameter,
        finishedHeight: row.finishedHeight,
        otherCompanyName: row.otherCompanyName,
        internalName: row.internalName,
      });
    }
    setView('form');
  };

  const handleSaveForm = () => {
    if (formMode === 'view') {
      onShowToast('查询模式不可保存', 'warning');
      return;
    }
    const foreignMissing = !form.foreignName.trim();
    const codeMissing = !form.bodyCode.trim();
    setFormErrors({ foreignName: foreignMissing, bodyCode: codeMissing });
    if (foreignMissing || codeMissing) {
      onShowToast('请填写国外罐型叫法与罐身代号', 'error');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (formMode === 'edit' && editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                foreignName: form.foreignName.trim(),
                actualCapacity: form.actualCapacity.trim(),
                bodyCode: form.bodyCode.trim(),
                bodyDiameter: form.bodyDiameter.trim(),
                finishedHeight: form.finishedHeight.trim(),
                otherCompanyName: form.otherCompanyName.trim(),
                internalName: form.internalName.trim(),
              }
            : r
        )
      );
      onShowToast('罐型规格已修改并保存', 'success');
    } else {
      const newRec: CanSpecItem = {
        id: `can-${Date.now()}`,
        foreignName: form.foreignName.trim(),
        actualCapacity: form.actualCapacity.trim(),
        bodyCode: form.bodyCode.trim(),
        bodyDiameter: form.bodyDiameter.trim(),
        finishedHeight: form.finishedHeight.trim(),
        otherCompanyName: form.otherCompanyName.trim(),
        internalName: form.internalName.trim(),
        creator: '潘鑫',
        createdAt: nowStr,
      };
      setRows((prev) => [newRec, ...prev]);
      onShowToast('罐型规格已新增并保存', 'success');
    }
    setSelectedIds([]);
    setView('list');
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选要删除的记录', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量删除确认',
      desc: `确定删除已勾选的 ${selectedIds.length} 条罐型规格吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setSelectedIds([]);
        onShowToast(`已删除 ${delSet.size} 条罐型规格`, 'success');
      },
    });
  };

  const handleConfirmImport = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const imported: CanSpecItem = {
      id: `can-imp-${Date.now()}`,
      foreignName: '113/200/200×307',
      actualCapacity: '330ml',
      bodyCode: '200',
      bodyDiameter: '66.00',
      finishedHeight: '115.20±0.20',
      otherCompanyName: 'S88',
      internalName: '113#200',
      creator: '潘鑫',
      createdAt: nowStr,
    };
    setRows((prev) => [imported, ...prev]);
    setIsImportOpen(false);
    setImportFileName('');
    setSelectedIds([]);
    onShowToast('导入成功，新增 1 条罐型规格', 'success');
  };

  const allPagedSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.includes(r.id));

  // ====================== VIEW 2: 添加 / 修改 / 查询 表单 ======================
  if (view === 'form') {
    const isReadOnly = formMode === 'view';
    const ctlCls = (err?: boolean) =>
      `w-full max-w-md h-8 px-2.5 border rounded-lg outline-none ${
        isReadOnly
          ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
          : err
          ? 'bg-white text-[#1E293B] border-[#EA580C]'
          : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
      }`;

    const fields: Array<{
      key: keyof typeof form;
      label: string;
      required?: boolean;
      mono?: boolean;
      error?: boolean;
      errorText?: string;
    }> = [
      {
        key: 'foreignName',
        label: '国外罐型叫法',
        required: true,
        mono: true,
        error: formErrors.foreignName,
        errorText: '请填写国外罐型叫法',
      },
      { key: 'actualCapacity', label: '实际容量', mono: true },
      {
        key: 'bodyCode',
        label: '罐身代号',
        required: true,
        mono: true,
        error: formErrors.bodyCode,
        errorText: '请填写罐身代号',
      },
      { key: 'bodyDiameter', label: '罐身 φ（mm）', mono: true },
      { key: 'finishedHeight', label: '成品罐高（mm）', mono: true },
      { key: 'otherCompanyName', label: '其他公司叫法' },
      { key: 'internalName', label: '公司内部叫法', mono: true },
    ];

    return (
      <div className="space-y-4 text-xs text-[#1E293B]">
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Box className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">
              {formMode === 'view'
                ? '查询-罐型规格'
                : formMode === 'edit'
                ? '修改-罐型规格'
                : '添加-罐型规格'}
            </h2>
            <span className="text-[#64748B]">
              · {isReadOnly ? '只读查看' : '维护标准罐型规格尺寸与代号映射'}
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

        {/* Form Body Card (Single-column 7 fields matching prototype) */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
          <div className="p-6 space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="sm:w-32 text-left sm:text-right text-[#1E40AF] font-medium shrink-0">
                    {f.required && <span className="text-[#EA580C] mr-0.5">*</span>}
                    {f.label}
                  </label>
                  <input
                    type="text"
                    readOnly={isReadOnly}
                    value={form[f.key]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => ({ ...prev, [f.key]: val }));
                      if (f.key === 'foreignName' && val.trim()) {
                        setFormErrors((prev) => ({ ...prev, foreignName: false }));
                      }
                      if (f.key === 'bodyCode' && val.trim()) {
                        setFormErrors((prev) => ({ ...prev, bodyCode: false }));
                      }
                    }}
                    placeholder="请输入"
                    className={ctlCls(f.error) + (f.mono ? ' font-mono' : '')}
                  />
                </div>
                {f.error && f.errorText && (
                  <span className="text-[11px] text-[#EA580C] sm:pl-35">{f.errorText}</span>
                )}
              </div>
            ))}
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

  // ====================== VIEW 1: 罐型规格列表 ======================
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
              <Box className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">罐型规格维护</span>
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
          <div className="flex flex-wrap items-center gap-4 pt-0.5 pl-1">
            <div className="flex items-center gap-2">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">罐身代号</label>
              <div className="inline-flex items-center">
                <select
                  value={bodyCodeOp}
                  onChange={(e) => setBodyCodeOp(e.target.value as MatchOp)}
                  className="h-8 px-2 border border-[#E5E9F0] border-r-0 rounded-l-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={bodyCodeQuery}
                  onChange={(e) => setBodyCodeQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请输入"
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-r-lg bg-white text-[#1E293B] w-52 outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
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
              当前匹配 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条规格
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
              onClick={() => setIsImportOpen(true)}
              className="h-8 px-3.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium cursor-pointer ${
                selectedIds.length === 0
                  ? 'border-[#EA580C]/40 bg-white text-[#EA580C]/70 hover:bg-[#EA580C]/5'
                  : 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除</span>
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
                    checked={allPagedSelected}
                    onChange={() => {
                      if (allPagedSelected) {
                        const ps = new Set(pagedRows.map((r) => r.id));
                        setSelectedIds((prev) => prev.filter((id) => !ps.has(id)));
                      } else {
                        setSelectedIds((prev) =>
                          Array.from(new Set([...prev, ...pagedRows.map((r) => r.id)]))
                        );
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
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-12 text-center text-[#94A3B8]">
                    暂无匹配的罐型规格记录
                  </td>
                </tr>
              ) : (
                pagedRows.map((r) => {
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
                        const isMono = [
                          'foreignName',
                          'actualCapacity',
                          'bodyCode',
                          'bodyDiameter',
                          'finishedHeight',
                          'internalName',
                          'createdAt',
                        ].includes(col.key);
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
                            查看
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
                                desc: `确定删除罐型规格「${r.foreignName}」吗？`,
                                onConfirm: () => {
                                  setRows((prev) => prev.filter((x) => x.id !== r.id));
                                  setSelectedIds((prev) => prev.filter((id) => id !== r.id));
                                  onShowToast('已删除该罐型规格', 'success');
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
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 border border-[#E5E9F0] rounded flex items-center justify-center bg-white hover:bg-[#EDF2F7] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`h-7 min-w-7 px-2 border rounded font-mono tabular-nums cursor-pointer ${
                  p === safePage
                    ? 'border-[#165DFF] bg-[#EBF2FF] text-[#165DFF] font-semibold'
                    : 'border-[#E5E9F0] bg-white text-[#475569] hover:bg-[#EDF2F7]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                  const target = Math.min(totalPages, Math.max(1, Number(jumpInput) || 1));
                  setCurrentPage(target);
                  setJumpInput(String(target));
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
            <div className="py-1.5 max-h-80 overflow-y-auto divide-y divide-[#F8FAFC]">
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

      {/* Import Modal (F4) */}
      {isImportOpen && (
        <div
          className="fixed inset-0 z-[65] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsImportOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#1E293B]">导入罐型规格</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <label className="block text-[#1E40AF] font-medium">选择文件</label>
              <input
                type="file"
                accept=".xls,.xlsx,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImportFileName(file.name);
                    onShowToast(`已选择文件：${file.name}`, 'info');
                  }
                }}
                className="block w-full text-xs text-[#475569] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#E5E9F0] file:bg-[#F8FAFC] file:text-[#1E40AF] file:font-medium hover:file:bg-[#EDF2F7] cursor-pointer"
              />
              {importFileName && (
                <div className="text-[11px] text-[#165DFF] font-mono">当前文件：{importFileName}</div>
              )}
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                支持 .xls / .xlsx / .csv 格式；导入字段需与「罐型规格维护」列表字段一致。点击确定后将模拟导入并追加一条规格记录。
              </p>
            </div>
            <div className="px-5 py-3 border-t border-[#EDF2F7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-1.5 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                确定
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
