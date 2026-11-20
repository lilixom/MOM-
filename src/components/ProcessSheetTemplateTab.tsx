import React, { useState, useMemo } from 'react';
import {
  FileCog,
  Search,
  RotateCcw,
  Plus,
  Edit3,
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

interface ProcessSheetTemplateTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface SheetTemplateDetailRow {
  id: string;
  applicableOp: string;
  opTemplate: string;
  sortOrder: string;
}

interface ProcessSheetTemplateItem {
  id: string;
  templateName: string;
  templateCode: string;
  remark: string;
  customer: string;
  productCode: string;
  craftType: string;
  canType: string;
  details?: SheetTemplateDetailRow[];
}

type ColumnKey = 'templateName' | 'templateCode' | 'remark' | 'customer' | 'productCode' | 'craftType';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'templateName', label: '工艺单模板名称', visible: true, highlight: true, pinned: true },
  { key: 'templateCode', label: '工艺单模板编号', visible: true, highlight: true, pinned: true },
  { key: 'remark', label: '备注', visible: true },
  { key: 'customer', label: '客户', visible: false },
  { key: 'productCode', label: '产品编码', visible: false },
  { key: 'craftType', label: '工艺类型', visible: false },
];

const DEFAULT_EDIT_DETAILS: SheetTemplateDetailRow[] = [
  { id: 'std-01', applicableOp: '基础信息', opTemplate: '基础信息测试模板', sortOrder: '1' },
  { id: 'std-02', applicableOp: '边缘补涂', opTemplate: '粉末补涂2', sortOrder: '2' },
  { id: 'std-03', applicableOp: '全喷', opTemplate: '209#360全喷（阿克苏）', sortOrder: '3' },
  { id: 'std-04', applicableOp: '包装', opTemplate: '209#360包装', sortOrder: '4' },
  { id: 'std-05', applicableOp: '缩颈、翻边、封盖', opTemplate: '封209#铝全开盖', sortOrder: '5' },
  { id: 'std-06', applicableOp: '边缘补涂', opTemplate: '粉末补涂1', sortOrder: '6' },
  { id: 'std-07', applicableOp: 'SPS烘干', opTemplate: 'SPS烘干', sortOrder: '7' },
  { id: 'std-08', applicableOp: '全喷', opTemplate: '209#360全喷（PPG）', sortOrder: '8' },
  { id: 'std-09', applicableOp: '电阻焊', opTemplate: '电阻焊标准参数-206#', sortOrder: '9' },
  { id: 'std-10', applicableOp: '裁剪', opTemplate: '209#280银鹭裁剪', sortOrder: '10' },
];

const INITIAL_ROWS: ProcessSheetTemplateItem[] = [
  {
    id: 'pst-01',
    templateName: '佳必可840#150g金枪鱼空罐',
    templateCode: '',
    remark: '',
    customer: '佳必可',
    productCode: '',
    craftType: '三片罐事业部制罐工艺单',
    canType: '840#',
  },
  {
    id: 'pst-02',
    templateName: '两片罐测试',
    templateCode: 'IPOce',
    remark: '',
    customer: '',
    productCode: '',
    craftType: '两片罐事业部制罐工艺单',
    canType: '202#',
  },
  {
    id: 'pst-03',
    templateName: '银鹭八宝粥209#280',
    templateCode: '20260915',
    remark: '测试',
    customer: '银鹭',
    productCode: '209#280',
    craftType: '三片罐事业部制罐工艺单',
    canType: '209#',
  },
  {
    id: 'pst-04',
    templateName: '工艺单模板测试',
    templateCode: 'GYD001',
    remark: '测试',
    customer: '',
    productCode: '',
    craftType: '制罐工艺单',
    canType: '通用',
  },
];

const SHEET_TYPES = [
  '三片罐事业部制罐工艺单',
  '两片罐事业部制罐工艺单',
  '三片罐事业部制盖工艺单',
  '制罐工艺单',
];

const APPLICABLE_OP_OPTIONS = [
  '基础信息',
  '制程',
  '电阻焊',
  'SPS烘干',
  '边缘补涂',
  '全喷',
  '缩颈、翻边、封盖',
  '包装',
  '裁剪',
  '清洗',
  '底涂',
  '内涂',
  '彩印',
  '堆垛',
  '手挑罐',
];

const OP_TEMPLATE_OPTIONS = [
  '基础信息测试模板',
  '粉末补涂1',
  '粉末补涂2',
  '209#360全喷（阿克苏）',
  '209#360全喷（PPG）',
  '209#360包装',
  '封209#铝全开盖',
  'SPS烘干',
  '电阻焊标准参数-206#',
  '209#280银鹭裁剪',
];

export const ProcessSheetTemplateTab: React.FC<ProcessSheetTemplateTabProps> = ({ onShowToast }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rows, setRows] = useState<ProcessSheetTemplateItem[]>(INITIAL_ROWS);

  // Filter states (4 + 2 grid)
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [filters, setFilters] = useState({
    nameOp: 'contains' as MatchOp,
    name: '',
    codeOp: 'contains' as MatchOp,
    code: '',
    canOp: 'contains' as MatchOp,
    can: '',
    craftOp: 'contains' as MatchOp,
    craft: '',
    customerOp: 'contains' as MatchOp,
    customer: '',
    productOp: 'contains' as MatchOp,
    product: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Table states (default select 3rd row matching prototype)
  const [selectedIds, setSelectedIds] = useState<string[]>(['pst-03']);
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
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
    craftType: '',
    remark: '',
  });
  const [formErrors, setFormErrors] = useState({
    templateName: false,
    craftType: false,
  });
  const [detailRows, setDetailRows] = useState<SheetTemplateDetailRow[]>([
    { id: 'std-init-1', applicableOp: '', opTemplate: '', sortOrder: '' },
  ]);
  const [selectedDetailIds, setSelectedDetailIds] = useState<string[]>([]);
  const [detailSortDir, setDetailSortDir] = useState<SortDir>(null);

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

  // Filtering & sorting
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
      if (!match(r.canType || r.templateName, appliedFilters.can, appliedFilters.canOp)) return false;
      if (!match(r.craftType, appliedFilters.craft, appliedFilters.craftOp)) return false;
      if (!match(r.customer, appliedFilters.customer, appliedFilters.customerOp)) return false;
      if (!match(r.productCode, appliedFilters.product, appliedFilters.productOp)) return false;
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
    const match = (val: string, q: string, op: MatchOp) => {
      if (!q.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = q.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    const count = rows.filter(
      (r) =>
        match(r.templateName, filters.name, filters.nameOp) &&
        match(r.templateCode, filters.code, filters.codeOp) &&
        match(r.canType || r.templateName, filters.can, filters.canOp) &&
        match(r.craftType, filters.craft, filters.craftOp) &&
        match(r.customer, filters.customer, filters.customerOp) &&
        match(r.productCode, filters.product, filters.productOp)
    ).length;
    onShowToast(`查询完成，共 ${count} 条工艺单配置模板`, 'info');
  };

  const handleReset = () => {
    const empty = {
      nameOp: 'contains' as MatchOp,
      name: '',
      codeOp: 'contains' as MatchOp,
      code: '',
      canOp: 'contains' as MatchOp,
      can: '',
      craftOp: 'contains' as MatchOp,
      craft: '',
      customerOp: 'contains' as MatchOp,
      customer: '',
      productOp: 'contains' as MatchOp,
      product: '',
    };
    setOrgFilter('请选择');
    setFilters(empty);
    setAppliedFilters(empty);
    setSelectedIds([]);
    setCurrentPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const openForm = (mode: 'add' | 'edit' | 'view', row?: ProcessSheetTemplateItem) => {
    setFormMode(mode);
    setFormErrors({ templateName: false, craftType: false });
    setSelectedDetailIds([]);
    setDetailSortDir(null);
    setIsColPanelOpen(false);
    if (mode === 'add') {
      setEditingId(null);
      setForm({
        templateName: '',
        templateCode: '自动生成',
        craftType: '',
        remark: '',
      });
      setDetailRows([
        { id: `std-${Date.now()}`, applicableOp: '', opTemplate: '', sortOrder: '1' },
      ]);
    } else if (row) {
      setEditingId(row.id);
      setForm({
        templateName: row.templateName,
        templateCode: row.templateCode || '自动生成',
        craftType: row.craftType || '',
        remark: row.remark || '',
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
    if (formMode === 'view') {
      onShowToast('查询模式不可保存', 'warning');
      return;
    }
    const nameMissing = !form.templateName.trim();
    const typeMissing = !form.craftType.trim();
    setFormErrors({ templateName: nameMissing, craftType: typeMissing });
    if (nameMissing || typeMissing) {
      onShowToast('请填写完整必填项', 'error');
      return;
    }

    const genCode = () => {
      const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      return `GYD${d.slice(4)}${String(rows.length + 1).padStart(2, '0')}`;
    };

    if (formMode === 'edit' && editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                templateName: form.templateName.trim(),
                templateCode: r.templateCode || genCode(),
                craftType: form.craftType,
                remark: form.remark.trim(),
                details: detailRows.map((d) => ({ ...d })),
              }
            : r
        )
      );
      onShowToast('工艺单配置模板已修改并保存', 'success');
    } else {
      const newRec: ProcessSheetTemplateItem = {
        id: `pst-${Date.now()}`,
        templateName: form.templateName.trim(),
        templateCode: genCode(),
        remark: form.remark.trim(),
        customer: '',
        productCode: '',
        craftType: form.craftType,
        canType: '',
        details: detailRows.map((d) => ({ ...d })),
      };
      setRows((prev) => [newRec, ...prev]);
      onShowToast('工艺单配置模板已新增并保存', 'success');
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
      desc: `确定删除选中的 ${selectedIds.length} 条工艺单配置模板吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setSelectedIds([]);
        onShowToast(`已删除 ${delSet.size} 条工艺单配置模板`, 'success');
      },
    });
  };

  const handleSortDetailByOrder = () => {
    const nextDir: SortDir = detailSortDir === 'asc' ? 'desc' : 'asc';
    setDetailSortDir(nextDir);
    setDetailRows((prev) =>
      [...prev].sort((a, b) => {
        const na = Number(a.sortOrder) || 9999;
        const nb = Number(b.sortOrder) || 9999;
        return nextDir === 'asc' ? na - nb : nb - na;
      })
    );
  };

  const allPagedSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.includes(r.id));

  // ====================== VIEW 2: 添加 / 修改 / 查询 表单 ======================
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
            <FileCog className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">
              {formMode === 'view'
                ? '查询-工艺单配置模板'
                : formMode === 'edit'
                ? '修改-工艺单配置模板'
                : '添加-工艺单配置模板'}
            </h2>
            <span className="text-[#64748B]">
              · {isReadOnly ? '只读查询' : '标题信息与适用工序模板配置'}
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
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 border-b border-[#EDF2F7]">
            {/* 工艺单模板名称 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>工艺单模板名称
                </label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={form.templateName}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, templateName: e.target.value }));
                    if (e.target.value.trim()) {
                      setFormErrors((prev) => ({ ...prev, templateName: false }));
                    }
                  }}
                  placeholder="请输入"
                  className={ctlCls(formErrors.templateName)}
                />
              </div>
              {formErrors.templateName && (
                <span className="text-[11px] text-[#EA580C] pl-30">请填写工艺单模板名称</span>
              )}
            </div>

            {/* 工艺单模板编号 */}
            <div className="flex items-center gap-2.5">
              <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">
                工艺单模板编号
              </label>
              <input
                type="text"
                readOnly
                value={form.templateCode}
                className={ctlCls(false, true) + ' font-mono'}
              />
            </div>

            {/* 工艺单类型 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>工艺单类型
                </label>
                <select
                  disabled={isReadOnly}
                  value={form.craftType}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, craftType: e.target.value }));
                    if (e.target.value) {
                      setFormErrors((prev) => ({ ...prev, craftType: false }));
                    }
                  }}
                  className={ctlCls(formErrors.craftType)}
                >
                  <option value="">请选择</option>
                  {SHEET_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                  {form.craftType && !SHEET_TYPES.includes(form.craftType) && (
                    <option value={form.craftType}>{form.craftType}</option>
                  )}
                </select>
              </div>
              {formErrors.craftType && (
                <span className="text-[11px] text-[#EA580C] pl-30">请选择工艺单类型</span>
              )}
            </div>

            {/* 备注 */}
            <div className="flex items-start gap-2.5">
              <label className="w-28 text-right text-[#1E40AF] font-medium shrink-0 pt-2">
                备注
              </label>
              <div className="relative flex-1 min-w-0">
                <textarea
                  readOnly={isReadOnly}
                  maxLength={80}
                  value={form.remark}
                  onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
                  placeholder="请输入"
                  rows={2}
                  className={`w-full px-2.5 py-2 pb-5 border rounded-lg outline-none resize-y min-h-[64px] ${
                    isReadOnly
                      ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                      : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
                  }`}
                />
                <span className="absolute right-2.5 bottom-1.5 text-[10px] font-mono tabular-nums text-[#94A3B8] select-none">
                  {form.remark.length}/80
                </span>
              </div>
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
                          {
                            id: `std-${Date.now()}`,
                            applicableOp: '',
                            opTemplate: '',
                            sortOrder: String(prev.length + 1),
                          },
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
                      disabled={selectedDetailIds.length === 0}
                      onClick={() => {
                        setConfirmState({
                          isOpen: true,
                          title: '删除确认',
                          desc: `确定删除选中的 ${selectedDetailIds.length} 行工序明细吗？`,
                          onConfirm: () => {
                            const delSet = new Set(selectedDetailIds);
                            setDetailRows((prev) => prev.filter((d) => !delSet.has(d.id)));
                            setSelectedDetailIds([]);
                            onShowToast('已删除选中工序明细', 'success');
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
              <span className="text-[#64748B] font-mono tabular-nums">共 {detailRows.length} 行</span>
            </div>

            <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
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
                    <th className="p-2.5 border-b border-r border-[#E5E9F0] w-[28%]">适用工序</th>
                    <th className="p-2.5 border-b border-r border-[#E5E9F0] w-[32%]">工序模板</th>
                    <th
                      onClick={handleSortDetailByOrder}
                      className="p-2.5 border-b border-r border-[#E5E9F0] cursor-pointer hover:bg-[#EDF2F7] select-none"
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>排序</span>
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            detailSortDir ? 'text-[#1E40AF]' : 'text-[#C5C8BE]'
                          }`}
                        />
                      </div>
                    </th>
                    {!isReadOnly && (
                      <th className="p-2.5 border-b border-[#E5E9F0] w-20 text-center">操作</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7]">
                  {detailRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isReadOnly ? 5 : 6}
                        className="py-10 text-center text-[#94A3B8]"
                      >
                        暂无工序明细，点击“添加一行”配置适用工序与模板
                      </td>
                    </tr>
                  ) : (
                    detailRows.map((d, idx) => {
                      const checked = selectedDetailIds.includes(d.id);
                      return (
                        <tr
                          key={d.id}
                          className={checked ? 'bg-[#EBF2FF]/60' : 'hover:bg-[#F8FAFC]'}
                        >
                          <td className="p-2 border-r border-[#EDF2F7] text-center">
                            <input
                              type="checkbox"
                              disabled={isReadOnly}
                              checked={checked}
                              onChange={() =>
                                setSelectedDetailIds((prev) =>
                                  prev.includes(d.id)
                                    ? prev.filter((x) => x !== d.id)
                                    : [...prev, d.id]
                                )
                              }
                              className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                            />
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#64748B]">
                            {idx + 1}
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7]">
                            <select
                              disabled={isReadOnly}
                              value={d.applicableOp}
                              onChange={(e) =>
                                setDetailRows((prev) =>
                                  prev.map((x) =>
                                    x.id === d.id ? { ...x, applicableOp: e.target.value } : x
                                  )
                                )
                              }
                              className={`w-full h-7 px-2 border border-[#E5E9F0] rounded outline-none ${
                                isReadOnly
                                  ? 'bg-[#F4F6F9] text-[#64748B] cursor-not-allowed'
                                  : 'bg-white text-[#1E293B] focus:border-[#2563EB]'
                              }`}
                            >
                              <option value="">请选择</option>
                              {APPLICABLE_OP_OPTIONS.map((op) => (
                                <option key={op} value={op}>
                                  {op}
                                </option>
                              ))}
                              {d.applicableOp && !APPLICABLE_OP_OPTIONS.includes(d.applicableOp) && (
                                <option value={d.applicableOp}>{d.applicableOp}</option>
                              )}
                            </select>
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7]">
                            <select
                              disabled={isReadOnly}
                              value={d.opTemplate}
                              onChange={(e) =>
                                setDetailRows((prev) =>
                                  prev.map((x) =>
                                    x.id === d.id ? { ...x, opTemplate: e.target.value } : x
                                  )
                                )
                              }
                              className={`w-full h-7 px-2 border border-[#E5E9F0] rounded outline-none ${
                                isReadOnly
                                  ? 'bg-[#F4F6F9] text-[#64748B] cursor-not-allowed'
                                  : 'bg-white text-[#1E293B] focus:border-[#2563EB]'
                              }`}
                            >
                              <option value="">请选择</option>
                              {OP_TEMPLATE_OPTIONS.map((tpl) => (
                                <option key={tpl} value={tpl}>
                                  {tpl}
                                </option>
                              ))}
                              {d.opTemplate && !OP_TEMPLATE_OPTIONS.includes(d.opTemplate) && (
                                <option value={d.opTemplate}>{d.opTemplate}</option>
                              )}
                            </select>
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7]">
                            <input
                              type="text"
                              readOnly={isReadOnly}
                              value={d.sortOrder}
                              onChange={(e) =>
                                setDetailRows((prev) =>
                                  prev.map((x) =>
                                    x.id === d.id ? { ...x, sortOrder: e.target.value } : x
                                  )
                                )
                              }
                              placeholder="请输入"
                              className={`w-full h-7 px-2.5 border border-[#E5E9F0] rounded font-mono tabular-nums outline-none ${
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
                                    desc: `确定删除第 ${idx + 1} 行工序明细吗？`,
                                    onConfirm: () => {
                                      setDetailRows((prev) => prev.filter((x) => x.id !== d.id));
                                      setSelectedDetailIds((prev) =>
                                        prev.filter((x) => x !== d.id)
                                      );
                                      onShowToast('已删除该行工序明细', 'success');
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
                    })
                  )}
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

  // ====================== VIEW 1: 工艺单配置模板列表 ======================
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
              <FileCog className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工艺单模板</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2.5 pt-0.5">
            {(
              [
                { label: '工艺单模板名称', opKey: 'nameOp', valKey: 'name' },
                { label: '工艺单模板编号', opKey: 'codeOp', valKey: 'code' },
                { label: '罐型', opKey: 'canOp', valKey: 'can' },
                { label: '工艺类型', opKey: 'craftOp', valKey: 'craft' },
                { label: '客户', opKey: 'customerOp', valKey: 'customer' },
                { label: '产品编码', opKey: 'productOp', valKey: 'product' },
              ] as const
            ).map((f) => (
              <div key={f.valKey} className="flex items-center gap-1.5 min-w-0">
                <label className="text-[#1E40AF] font-medium whitespace-nowrap shrink-0 w-24 text-right">
                  {f.label}
                </label>
                <select
                  value={filters[f.opKey]}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [f.opKey]: e.target.value as MatchOp }))
                  }
                  className="h-8 px-1.5 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer shrink-0"
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
                <th className="p-2.5 border-b border-[#E5E9F0] w-28 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
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
                    暂无匹配的工艺单配置模板
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
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={`p-2.5 border-r border-[#EDF2F7] ${
                            col.key === 'templateCode' || col.key === 'productCode'
                              ? 'font-mono tabular-nums text-[#334155]'
                              : ''
                          }`}
                        >
                          {r[col.key] || <span className="text-[#CBD5E1]">-</span>}
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
                            onClick={() => openForm('edit', r)}
                            className="text-[#165DFF] hover:underline font-medium cursor-pointer"
                          >
                            修改
                          </button>
                          <button
                            type="button"
                            onClick={() => openForm('view', r)}
                            className="text-[#165DFF] hover:underline font-medium cursor-pointer"
                          >
                            查询
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
                          prev.map((c) =>
                            c.key === col.key ? { ...c, visible: !c.visible } : c
                          )
                        )
                      }
                      className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                    />
                    <span className="text-[#1E293B]">{col.label}</span>
                  </div>
                  <Pin
                    className={`w-3.5 h-3.5 ${
                      col.pinned ? 'text-[#2563EB]' : 'text-[#CBD5E1]'
                    }`}
                  />
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
