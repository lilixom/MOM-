import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  RotateCcw,
  Plus,
  Edit3,
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

interface ProcessOpTemplateTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface TemplateDetailRow {
  id: string;
  fieldValue: string;
  fieldName: string;
  fieldCode: string;
}

interface ProcessOpTemplateItem {
  id: string;
  templateName: string;
  templateCode: string;
  opCategory: string;
  applicableOp: string;
  canType: string;
  craftType: string;
  coatingModel: string;
  paramCount: string;
  details?: TemplateDetailRow[];
}

interface ColumnConfig {
  key: keyof Omit<ProcessOpTemplateItem, 'id' | 'details'>;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'templateName', label: '模板名称', visible: true, highlight: true, pinned: true },
  { key: 'templateCode', label: '模板编号', visible: true, highlight: true, pinned: true },
  { key: 'opCategory', label: '工序分类', visible: true },
  { key: 'applicableOp', label: '适用工序', visible: true },
  { key: 'canType', label: '罐型', visible: true },
  { key: 'craftType', label: '工艺类型', visible: true },
  { key: 'coatingModel', label: '涂料型号', visible: true },
  { key: 'paramCount', label: '参数数量', visible: true },
];

const DEFAULT_EDIT_DETAILS: TemplateDetailRow[] = [
  { id: 'td-1', fieldValue: '83.30±0.05', fieldName: '空罐内径', fieldCode: 'Z_CAN_INNER_DIAMETER' },
  { id: 'td-2', fieldValue: '39.50±0.10', fieldName: '罐高H', fieldCode: 'Z_CAN_HEIGHT_H' },
  { id: 'td-3', fieldValue: '3.0±0.10', fieldName: '埋头深度', fieldCode: 'Z_CAN_COUNTERSINK_DEPTH' },
  { id: 'td-4', fieldValue: '2.80±0.10', fieldName: '翻边宽度', fieldCode: 'Z_CAN_FLANGE_WIDTH' },
];

const INITIAL_TEMPLATES: ProcessOpTemplateItem[] = [
  { id: 'tpl-01', templateName: '840#150g', templateCode: 'ALL+-20260924-001', opCategory: '裁剪类', applicableOp: '罐型及薄钢板规格、罐身尺寸...', canType: 'ALL+', craftType: '制罐', coatingModel: '', paramCount: '10000' },
  { id: 'tpl-02', templateName: '840#150g', templateCode: '', opCategory: '焊接类', applicableOp: '空罐尺寸', canType: 'ALL+', craftType: '制罐', coatingModel: '', paramCount: '10000' },
  { id: 'tpl-03', templateName: '840#150g(住必可)', templateCode: '', opCategory: '裁剪类', applicableOp: '包装要求', canType: 'ALL+', craftType: '制罐', coatingModel: '', paramCount: '10000' },
  { id: 'tpl-04', templateName: '基础信息测试模板', templateCode: '211#-20260921-001', opCategory: '裁剪类', applicableOp: '基础信息', canType: '211#', craftType: '制罐', coatingModel: '', paramCount: '' },
  { id: 'tpl-05', templateName: '209#26缩颈翻边', templateCode: '209#-20260915-003', opCategory: '裁剪类', applicableOp: '裁板', canType: '209#', craftType: '制罐', coatingModel: '', paramCount: '' },
  { id: 'tpl-06', templateName: '209#26缩颈翻边', templateCode: '', opCategory: '', applicableOp: '裁板', canType: '', craftType: '制罐', coatingModel: '', paramCount: '' },
  { id: 'tpl-07', templateName: '209#60全喷（阿克苏）', templateCode: '209#-20260915-002', opCategory: '', applicableOp: '全喷', canType: '209#', craftType: '制罐', coatingModel: '', paramCount: '' },
  { id: 'tpl-08', templateName: '209#60全喷（PPG）', templateCode: '209#-20260915-001', opCategory: '', applicableOp: '全喷', canType: '209#', craftType: '制罐', coatingModel: '', paramCount: '' },
  { id: 'tpl-09', templateName: '空罐尺寸111', templateCode: '211#-20260915-001', opCategory: '裁剪类', applicableOp: '空罐尺寸', canType: '211#', craftType: '制罐', coatingModel: '', paramCount: '' },
  { id: 'tpl-10', templateName: '全喷测试111', templateCode: '211#-20260914-001', opCategory: '裁剪类', applicableOp: '全喷', canType: '211#', craftType: '制罐', coatingModel: '', paramCount: '' },
];

const OP_CATEGORIES = ['裁剪类', '焊接类', '缩颈类', '包装类', '全喷类'];
const APPLICABLE_OPS = [
  '空罐尺寸',
  '罐型及薄钢板规格',
  '包装要求',
  '基础信息',
  '裁板',
  '全喷',
  '制程',
  '电阻焊',
  'SPS',
  '缩颈翻边封盖',
  '边缘补涂',
];
const CAN_TYPES = ['通用', 'ALL+', '211#', '209#', '206#', '200#'];
const CRAFT_TYPES = ['制罐', '测试', 'test'];

export const ProcessOpTemplateTab: React.FC<ProcessOpTemplateTabProps> = ({ onShowToast }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rows, setRows] = useState<ProcessOpTemplateItem[]>(INITIAL_TEMPLATES);

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [filters, setFilters] = useState({
    nameOp: 'contains' as MatchOp,
    name: '',
    codeOp: 'contains' as MatchOp,
    code: '',
    categoryOp: 'contains' as MatchOp,
    category: '',
    opOp: 'contains' as MatchOp,
    op: '',
    canOp: 'contains' as MatchOp,
    can: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Table states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Omit<ProcessOpTemplateItem, 'id' | 'details'> | null;
    dir: SortDir;
  }>({ key: null, dir: null });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');

  // Column settings
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // Form states (P2)
  const [form, setForm] = useState({
    templateName: '',
    templateCode: '自动生成',
    opCategory: '',
    applicableOp: '',
    canType: '',
    craftType: '',
    coatingModel: '',
    paramCount: '',
  });
  const [nameError, setNameError] = useState(false);
  const [detailRows, setDetailRows] = useState<TemplateDetailRow[]>([
    { id: 'td-init-1', fieldValue: '', fieldName: '', fieldCode: '' },
  ]);
  const [selectedDetailIds, setSelectedDetailIds] = useState<string[]>([]);

  // Confirm Dialog
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

  // Filtering & Sorting
  const filteredRows = useMemo(() => {
    const match = (val: string, q: string, op: MatchOp) => {
      if (!q.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = q.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    return rows.filter((r) => {
      if (!match(r.templateName, appliedFilters.name, appliedFilters.nameOp)) return false;
      if (!match(r.templateCode, appliedFilters.code, appliedFilters.codeOp)) return false;
      if (!match(r.opCategory, appliedFilters.category, appliedFilters.categoryOp)) return false;
      if (!match(r.applicableOp, appliedFilters.op, appliedFilters.opOp)) return false;
      if (!match(r.canType, appliedFilters.can, appliedFilters.canOp)) return false;
      return true;
    });
  }, [rows, appliedFilters]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredRows;
    const k = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredRows].sort((a, b) =>
      String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'zh-CN') * dir
    );
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const visibleColumns = columns.filter((c) => c.visible);

  const handleQuery = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    onShowToast(`查询完成，共 ${filteredRows.length} 条工序模板`, 'info');
  };

  const handleReset = () => {
    const empty = {
      nameOp: 'contains' as MatchOp,
      name: '',
      codeOp: 'contains' as MatchOp,
      code: '',
      categoryOp: 'contains' as MatchOp,
      category: '',
      opOp: 'contains' as MatchOp,
      op: '',
      canOp: 'contains' as MatchOp,
      can: '',
    };
    setOrgFilter('请选择');
    setFilters(empty);
    setAppliedFilters(empty);
    setSelectedIds([]);
    setCurrentPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const openForm = (mode: 'add' | 'edit' | 'view', row?: ProcessOpTemplateItem) => {
    setFormMode(mode);
    setNameError(false);
    setSelectedDetailIds([]);
    setIsColPanelOpen(false);
    if (mode === 'add') {
      setEditingId(null);
      setForm({
        templateName: '',
        templateCode: '自动生成',
        opCategory: '',
        applicableOp: '',
        canType: '',
        craftType: '',
        coatingModel: '',
        paramCount: '',
      });
      setDetailRows([{ id: `td-${Date.now()}`, fieldValue: '', fieldName: '', fieldCode: '' }]);
    } else if (row) {
      setEditingId(row.id);
      setForm({
        templateName: row.templateName,
        templateCode: row.templateCode || '自动生成',
        opCategory: row.opCategory,
        applicableOp: row.applicableOp,
        canType: row.canType,
        craftType: row.craftType,
        coatingModel: row.coatingModel,
        paramCount: row.paramCount,
      });
      setDetailRows(
        row.details && row.details.length > 0
          ? row.details.map((d) => ({ ...d }))
          : DEFAULT_EDIT_DETAILS.map((d) => ({ ...d }))
      );
    }
    setView('form');
  };

  const handleSaveForm = () => {
    if (formMode === 'view') return;
    if (!form.templateName.trim()) {
      setNameError(true);
      onShowToast('请填写模板名称', 'error');
      return;
    }

    if (formMode === 'edit' && editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                templateName: form.templateName.trim(),
                opCategory: form.opCategory,
                applicableOp: form.applicableOp,
                canType: form.canType,
                craftType: form.craftType,
                coatingModel: form.coatingModel.trim(),
                paramCount: form.paramCount.trim(),
                details: detailRows.map((d) => ({ ...d })),
              }
            : r
        )
      );
      onShowToast('工序模板已修改并保存', 'success');
    } else {
      const newRec: ProcessOpTemplateItem = {
        id: `tpl-${Date.now()}`,
        templateName: form.templateName.trim(),
        templateCode: `${form.canType || 'ALL+'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(rows.length + 1).padStart(3, '0')}`,
        opCategory: form.opCategory,
        applicableOp: form.applicableOp,
        canType: form.canType,
        craftType: form.craftType,
        coatingModel: form.coatingModel.trim(),
        paramCount: form.paramCount.trim() || String(detailRows.length),
        details: detailRows.map((d) => ({ ...d })),
      };
      setRows((prev) => [newRec, ...prev]);
      onShowToast('工序模板已新增并保存', 'success');
    }
    setSelectedIds([]);
    setView('list');
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选要删除的模板', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '删除确认',
      desc: `确定删除选中的 ${selectedIds.length} 条工序模板吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setSelectedIds([]);
        onShowToast(`已删除 ${delSet.size} 条工序模板`, 'success');
      },
    });
  };

  const allPagedSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.includes(r.id));

  // ====================== VIEW 2: 添加 / 修改 / 查看 表单 ======================
  if (view === 'form') {
    const isReadOnly = formMode === 'view';
    const allDetailsSelected =
      detailRows.length > 0 && detailRows.every((d) => selectedDetailIds.includes(d.id));

    const ctlCls = (err?: boolean, ro?: boolean) =>
      `flex-1 h-8 px-2.5 border rounded-lg outline-none min-w-0 ${
        ro || isReadOnly
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
            <Layers className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">
              {formMode === 'view'
                ? '查看-工序模板'
                : formMode === 'edit'
                ? '修改-工序模板'
                : '添加-工序模板'}
            </h2>
            <span className="text-[#64748B]">
              · {isReadOnly ? '只读查看' : '标题信息与字段明细配置'}
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

        {/* Form Body Card */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 border-b border-[#EDF2F7]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>模板名称
                </label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={form.templateName}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, templateName: e.target.value }));
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  placeholder="请输入"
                  className={ctlCls(nameError)}
                />
              </div>
              {nameError && (
                <span className="text-[11px] text-[#EA580C] pl-22">请填写模板名称</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">模板编号</label>
              <input
                type="text"
                readOnly
                value={form.templateCode}
                className={ctlCls(false, true) + ' font-mono'}
              />
            </div>

            <div className="flex items-center gap-2.5">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">工序分类</label>
              <select
                disabled={isReadOnly}
                value={form.opCategory}
                onChange={(e) => setForm((p) => ({ ...p, opCategory: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                {OP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">适用工序</label>
              <select
                disabled={isReadOnly}
                value={form.applicableOp}
                onChange={(e) => setForm((p) => ({ ...p, applicableOp: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                {APPLICABLE_OPS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
                {form.applicableOp && !APPLICABLE_OPS.includes(form.applicableOp) && (
                  <option value={form.applicableOp}>{form.applicableOp}</option>
                )}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">罐型</label>
              <select
                disabled={isReadOnly}
                value={form.canType}
                onChange={(e) => setForm((p) => ({ ...p, canType: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                {CAN_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">工艺类型</label>
              <select
                disabled={isReadOnly}
                value={form.craftType}
                onChange={(e) => setForm((p) => ({ ...p, craftType: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                {CRAFT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">涂料型号</label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={form.coatingModel}
                onChange={(e) => setForm((p) => ({ ...p, coatingModel: e.target.value }))}
                placeholder="请输入"
                className={ctlCls()}
              />
            </div>

            <div className="flex items-center gap-2.5">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">参数数量</label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={form.paramCount}
                onChange={(e) => setForm((p) => ({ ...p, paramCount: e.target.value }))}
                placeholder="请输入"
                className={ctlCls() + ' font-mono'}
              />
            </div>
          </div>

          {/* Detail Sub-table */}
          <div className="p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailRows((prev) => [
                          ...prev,
                          { id: `td-${Date.now()}`, fieldValue: '', fieldName: '', fieldCode: '' },
                        ]);
                        onShowToast('已添加一行', 'info');
                      }}
                      className="h-8 px-3 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加一行</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onShowToast('导入模板字段（演示）：请选择 Excel 文件', 'info')}
                      className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>导入</span>
                    </button>
                    <button
                      type="button"
                      disabled={selectedDetailIds.length === 0}
                      onClick={() => {
                        setConfirmState({
                          isOpen: true,
                          title: '删除确认',
                          desc: `确定删除选中的 ${selectedDetailIds.length} 行字段明细吗？`,
                          onConfirm: () => {
                            const delSet = new Set(selectedDetailIds);
                            setDetailRows((prev) => prev.filter((d) => !delSet.has(d.id)));
                            setSelectedDetailIds([]);
                            onShowToast('已删除选中字段明细', 'success');
                          },
                        });
                      }}
                      className={`h-8 px-3 border rounded-lg transition flex items-center gap-1 ${
                        selectedDetailIds.length === 0
                          ? 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                          : 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>删除</span>
                    </button>
                  </>
                )}
              </div>
              <span className="text-[#64748B]">共 {detailRows.length} 行</span>
            </div>

            <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[720px]">
                <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold">
                  <tr>
                    <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                      <input
                        type="checkbox"
                        disabled={isReadOnly}
                        checked={allDetailsSelected}
                        onChange={(e) =>
                          setSelectedDetailIds(e.target.checked ? detailRows.map((d) => d.id) : [])
                        }
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                      />
                    </th>
                    <th className="p-2.5 border-b border-r border-[#E5E9F0] w-14 text-center">序号</th>
                    <th className="p-2.5 border-b border-r border-[#E5E9F0]">字段值</th>
                    <th className="p-2.5 border-b border-r border-[#E5E9F0]">字段名称</th>
                    <th className="p-2.5 border-b border-r border-[#E5E9F0]">字段编码</th>
                    {!isReadOnly && (
                      <th className="p-2.5 border-b border-[#E5E9F0] w-20 text-center">操作</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7]">
                  {detailRows.map((d, idx) => {
                    const checked = selectedDetailIds.includes(d.id);
                    return (
                      <tr key={d.id} className={checked ? 'bg-[#EBF2FF]/60' : 'hover:bg-[#F8FAFC]'}>
                        <td className="p-2 border-r border-[#EDF2F7] text-center">
                          <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={checked}
                            onChange={() =>
                              setSelectedDetailIds((prev) =>
                                prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id]
                              )
                            }
                            className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                          />
                        </td>
                        <td className="p-2 border-r border-[#EDF2F7] text-center font-mono text-[#64748B]">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-[#EDF2F7]">
                          <div className="relative">
                            <input
                              type="text"
                              readOnly={isReadOnly}
                              value={d.fieldValue}
                              onChange={(e) =>
                                setDetailRows((prev) =>
                                  prev.map((x) =>
                                    x.id === d.id ? { ...x, fieldValue: e.target.value } : x
                                  )
                                )
                              }
                              placeholder="请输入"
                              className={`w-full h-7 pl-2.5 pr-8 border border-[#E5E9F0] rounded outline-none ${
                                isReadOnly
                                  ? 'bg-[#F4F6F9] text-[#64748B]'
                                  : 'bg-white focus:border-[#2563EB]'
                              }`}
                            />
                            <span className="absolute right-2 top-1.5 text-[10px] text-[#94A3B8] select-none font-mono">
                              A≡
                            </span>
                          </div>
                        </td>
                        <td className="p-2 border-r border-[#EDF2F7]">
                          <input
                            type="text"
                            readOnly={isReadOnly}
                            value={d.fieldName}
                            onChange={(e) =>
                              setDetailRows((prev) =>
                                prev.map((x) =>
                                  x.id === d.id ? { ...x, fieldName: e.target.value } : x
                                )
                              )
                            }
                            placeholder="请输入"
                            className={`w-full h-7 px-2.5 border border-[#E5E9F0] rounded outline-none ${
                              isReadOnly
                                ? 'bg-[#F4F6F9] text-[#64748B]'
                                : 'bg-white focus:border-[#2563EB]'
                            }`}
                          />
                        </td>
                        <td className="p-2 border-r border-[#EDF2F7]">
                          <input
                            type="text"
                            readOnly={isReadOnly}
                            value={d.fieldCode}
                            onChange={(e) =>
                              setDetailRows((prev) =>
                                prev.map((x) =>
                                  x.id === d.id ? { ...x, fieldCode: e.target.value } : x
                                )
                              )
                            }
                            placeholder="请输入"
                            className={`w-full h-7 px-2.5 border border-[#E5E9F0] rounded font-mono outline-none ${
                              isReadOnly
                                ? 'bg-[#F4F6F9] text-[#64748B]'
                                : 'bg-white focus:border-[#2563EB]'
                            }`}
                          />
                        </td>
                        {!isReadOnly && (
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmState({
                                  isOpen: true,
                                  title: '删除确认',
                                  desc: `确定删除第 ${idx + 1} 行字段明细吗？`,
                                  onConfirm: () => {
                                    setDetailRows((prev) => prev.filter((x) => x.id !== d.id));
                                    setSelectedDetailIds((prev) => prev.filter((x) => x !== d.id));
                                    onShowToast('已删除该行明细', 'success');
                                  },
                                });
                              }}
                              className="text-[#EA580C] hover:underline font-medium cursor-pointer"
                            >
                              删除
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-5 py-3.5 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2.5">
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

        {/* Confirm Dialog in Form View */}
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
  }

  // ====================== VIEW 1: 工序模板列表 ======================
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
              <Layers className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工艺单工序模板</span>
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-0.5 pl-1">
            {(
              [
                { label: '模板名称', opKey: 'nameOp', valKey: 'name' },
                { label: '模板编号', opKey: 'codeOp', valKey: 'code' },
                { label: '工序分类', opKey: 'categoryOp', valKey: 'category' },
                { label: '适用工序', opKey: 'opOp', valKey: 'op' },
                { label: '罐型', opKey: 'canOp', valKey: 'can' },
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

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedIds.length}</strong> 项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条模板
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
                if (selectedIds.length === 0) {
                  onShowToast('请先勾选要修改的模板', 'warning');
                  return;
                }
                const target = rows.find((r) => r.id === selectedIds[0]);
                if (target) openForm('edit', target);
              }}
              className="h-8 px-3.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>修改</span>
            </button>
            <button
              type="button"
              onClick={() => onShowToast('导入工序模板（演示）：请选择 Excel 文件', 'info')}
              className="h-8 px-3.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium cursor-pointer ${
                selectedIds.length === 0
                  ? 'border-[#EA580C]/40 bg-white text-[#EA580C]/70 hover:bg-[#EA580C]/5'
                  : 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
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
                        setSelectedIds((prev) => Array.from(new Set([...prev, ...pagedRows.map((r) => r.id)])));
                      }
                    }}
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                {visibleColumns.map((col, idx) => (
                  <th
                    key={`${String(col.key)}-${idx}`}
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
                <th className="p-2.5 border-b border-[#E5E9F0] w-28 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <div className="inline-flex items-center gap-2">
                    <span>操作</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsColPanelOpen((prev) => !prev);
                      }}
                      className="text-[#2563EB] hover:text-[#1E293B] cursor-pointer"
                      title="列设置"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {pagedRows.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('input')) return;
                      setSelectedIds((prev) =>
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
                          setSelectedIds((prev) =>
                            prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                          )
                        }
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    {visibleColumns.map((col, idx) => (
                      <td
                        key={`${row.id}-${String(col.key)}-${idx}`}
                        className={`p-2.5 border-r border-[#EDF2F7] ${
                          col.highlight ? 'bg-blue-50/20' : ''
                        } ${
                          col.key === 'templateCode' || col.key === 'paramCount'
                            ? 'font-mono tabular-nums'
                            : ''
                        }`}
                      >
                        {col.key === 'templateName' ? (
                          <button
                            type="button"
                            onClick={() => openForm('view', row)}
                            className="font-semibold text-[#1E40AF] hover:text-[#165DFF] hover:underline cursor-pointer"
                          >
                            {row.templateName}
                          </button>
                        ) : (
                          <span>{row[col.key] || ''}</span>
                        )}
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
                          onClick={() => openForm('view', row)}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          查看
                        </button>
                        <button
                          type="button"
                          onClick={() => openForm('edit', row)}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          修改
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-10 text-center text-[#64748B]">
                    暂无匹配的工序模板数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCurrentPage(n)}
                className={`w-7 h-7 border rounded-lg font-mono flex items-center justify-center cursor-pointer ${
                  safePage === n
                    ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                    : 'border-[#E5E9F0] bg-white text-[#1E40AF]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] cursor-pointer"
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
            className="h-7 px-2 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <span>第</span>
            <input
              type="text"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const n = parseInt(jumpInput, 10);
                  if (!Number.isNaN(n) && n >= 1 && n <= totalPages) setCurrentPage(n);
                  else onShowToast(`请输入 1 ~ ${totalPages} 之间的页码`, 'warning');
                }
              }}
              className="w-10 h-7 px-1.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] text-center font-mono outline-none focus:border-[#2563EB]"
            />
            <span>页</span>
          </div>
        </div>

        {/* F3 列设置浮层 */}
        {isColPanelOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-12 w-72 max-h-[460px] bg-white border border-[#E5E9F0] rounded-xl shadow-xl z-40 flex flex-col overflow-hidden"
          >
            <div className="px-3.5 py-2.5 border-b border-[#EDF2F7] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E293B]">列设置</span>
              <button
                type="button"
                onClick={() => setIsColPanelOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-1 divide-y divide-[#F4F6F9] text-xs">
              {columns.map((col, idx) => (
                <div
                  key={col.key}
                  className={`flex items-center gap-2.5 px-3.5 py-2 transition ${
                    col.highlight ? 'bg-blue-50/80' : 'hover:bg-[#F4F6F9]'
                  }`}
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setColumns((prev) =>
                          prev.map((c, ci) => (ci === idx ? { ...c, visible: checked } : c))
                        );
                      }}
                      className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                    />
                    <span className={`flex-1 ${col.highlight ? 'text-blue-600 font-medium' : 'text-[#1E293B]'}`}>
                      {col.label}
                    </span>
                  </label>
                  <Pin className="w-3.5 h-3.5 text-[#CBD5E1]" />
                </div>
              ))}
            </div>
            <div className="px-3.5 py-2.5 border-t border-[#EDF2F7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setColumns(INITIAL_COLUMNS);
                  onShowToast('已恢复默认列', 'info');
                }}
                className="px-2.5 py-1 border border-[#E5E9F0] rounded-lg text-xs text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => setIsColPanelOpen(false)}
                className="px-3 py-1 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
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
