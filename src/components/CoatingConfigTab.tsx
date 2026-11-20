import React, { useState, useMemo } from 'react';
import {
  Palette,
  Search,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  Upload,
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

interface CoatingConfigTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface CoatingConfigItem {
  id: string;
  coatingType: string;
  supplier: string;
  coatingName: string;
  materialCode: string;
  solidContent: string;
  dryFilmWeight: string;
  creator: string;
  createdAt: string;
}

type ColumnKey = keyof Omit<CoatingConfigItem, 'id'>;

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
}

const COATING_TYPE_OPTIONS = ['外补涂', '全喷', '内涂', '底涂', '彩印', '外涂'];

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'coatingType', label: '涂料类型', visible: true, highlight: true, pinned: true },
  { key: 'supplier', label: '供应商', visible: true },
  { key: 'coatingName', label: '涂料名称', visible: true, highlight: true, pinned: true },
  { key: 'materialCode', label: '物料料号', visible: true },
  { key: 'solidContent', label: '固含量', visible: true },
  { key: 'dryFilmWeight', label: '干膜量', visible: true },
  { key: 'creator', label: '创建人', visible: false },
  { key: 'createdAt', label: '创建时间', visible: false },
];

const INITIAL_ROWS: CoatingConfigItem[] = [
  {
    id: 'coat-01',
    coatingType: '外补涂',
    supplier: '扬瑞',
    coatingName: '外边缘补涂-MC6875-801',
    materialCode: '60001030',
    solidContent: '30',
    dryFilmWeight: '20.88',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-02',
    coatingType: '外补涂',
    supplier: '合润',
    coatingName: '外边缘补涂-HyCan7111',
    materialCode: '60001008',
    solidContent: '35',
    dryFilmWeight: '22.5',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-03',
    coatingType: '外补涂',
    supplier: '合润',
    coatingName: '润滑剂-HyCan7111',
    materialCode: '60001594',
    solidContent: '35',
    dryFilmWeight: '22.5',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-04',
    coatingType: '全喷',
    supplier: '阿克苏',
    coatingName: '内全喷涂料-F290-68055E',
    materialCode: '60001011',
    solidContent: '21.5',
    dryFilmWeight: '0',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-05',
    coatingType: '全喷',
    supplier: 'PPG',
    coatingName: '内全喷涂料-P-XC240207',
    materialCode: '60010322',
    solidContent: '19',
    dryFilmWeight: '0',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-06',
    coatingType: '全喷',
    supplier: '扬瑞',
    coatingName: '内全喷涂料-MC6088-803-5/C',
    materialCode: '60001012',
    solidContent: '22',
    dryFilmWeight: '0',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-07',
    coatingType: '全喷',
    supplier: '扬瑞',
    coatingName: '内全喷涂料-MC6088-803-5/C消泡版',
    materialCode: '60008957',
    solidContent: '20',
    dryFilmWeight: '0',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-08',
    coatingType: '全喷',
    supplier: '扬瑞',
    coatingName: '内全喷涂料-MC6088-803-5/C',
    materialCode: '60001012',
    solidContent: '20',
    dryFilmWeight: '0',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-09',
    coatingType: '全喷',
    supplier: 'PPG',
    coatingName: '内全喷涂料-PPG2567-804/A',
    materialCode: '60001169',
    solidContent: '20',
    dryFilmWeight: '0',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
  {
    id: 'coat-10',
    coatingType: '全喷',
    supplier: '阿克苏',
    coatingName: '内全喷涂料-FQ190-68055',
    materialCode: '60001247',
    solidContent: '20',
    dryFilmWeight: '0',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
  },
];

const getTypeBadgeCls = (type: string) => {
  switch (type) {
    case '外补涂':
      return 'bg-blue-50 text-[#1E40AF] border border-blue-200/80';
    case '全喷':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
    case '内涂':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200/80';
    case '底涂':
      return 'bg-amber-50 text-amber-700 border border-amber-200/80';
    case '彩印':
      return 'bg-purple-50 text-purple-700 border border-purple-200/80';
    case '外涂':
      return 'bg-sky-50 text-sky-700 border border-sky-200/80';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

export const CoatingConfigTab: React.FC<CoatingConfigTabProps> = ({ onShowToast }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rows, setRows] = useState<CoatingConfigItem[]>(INITIAL_ROWS);
  const [totalVirtualCount, setTotalVirtualCount] = useState(15);

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [filters, setFilters] = useState({
    typeOp: 'contains' as MatchOp,
    typeVal: '',
    supplierOp: 'contains' as MatchOp,
    supplierVal: '',
    nameOp: 'contains' as MatchOp,
    nameVal: '',
  });

  // Table state
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

  // Import modal (F4)
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');

  // Coating name picker modal (F5)
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerKeyword, setPickerKeyword] = useState('');
  const [pickerSelectedId, setPickerSelectedId] = useState<string | null>(null);

  // Form state (P2)
  const [form, setForm] = useState({
    coatingType: '',
    supplier: '',
    coatingName: '',
    materialCode: '',
    solidContent: '',
    dryFilmWeight: '',
  });
  const [formErrors, setFormErrors] = useState({
    coatingType: false,
    coatingName: false,
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
        filters.typeVal.trim() || filters.supplierVal.trim() || filters.nameVal.trim()
      ),
    [filters]
  );

  const filteredRows = useMemo(() => {
    const match = (val: string, q: string, op: MatchOp) => {
      if (!q.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = q.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    return rows.filter((r) => {
      if (!match(r.coatingType, filters.typeVal, filters.typeOp)) return false;
      if (!match(r.supplier, filters.supplierVal, filters.supplierOp)) return false;
      if (!match(r.coatingName, filters.nameVal, filters.nameOp)) return false;
      return true;
    });
  }, [rows, filters]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredRows;
    const k = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredRows].sort(
      (a, b) =>
        String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'zh-CN', { numeric: true }) * dir
    );
  }, [filteredRows, sortConfig]);

  const displayTotal = hasActiveFilter ? sortedRows.length : totalVirtualCount;
  const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const visibleColumns = columns.filter((c) => c.visible);

  // Deduplicated options for F5 coating name picker
  const pickerRows = useMemo(() => {
    const kw = pickerKeyword.trim().toLowerCase();
    const seen = new Set<string>();
    const deduped: CoatingConfigItem[] = [];
    rows.forEach((r) => {
      const key = `${r.materialCode}|${r.coatingName}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (
        !kw ||
        r.coatingName.toLowerCase().includes(kw) ||
        r.materialCode.toLowerCase().includes(kw)
      ) {
        deduped.push(r);
      }
    });
    return deduped;
  }, [rows, pickerKeyword]);

  const handleQuery = () => {
    setCurrentPage(1);
    setJumpInput('1');
    onShowToast(`查询完成，共 ${displayTotal} 条涂料配置`, 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setFilters({
      typeOp: 'contains',
      typeVal: '',
      supplierOp: 'contains',
      supplierVal: '',
      nameOp: 'contains',
      nameVal: '',
    });
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    setCurrentPage(1);
    setJumpInput('1');
    onShowToast('筛选条件已重置', 'info');
  };

  const openForm = (mode: 'add' | 'edit' | 'view', row?: CoatingConfigItem) => {
    setFormMode(mode);
    setFormErrors({ coatingType: false, coatingName: false });
    setIsColPanelOpen(false);
    if (mode === 'add') {
      setEditingId(null);
      setForm({
        coatingType: '',
        supplier: '',
        coatingName: '',
        materialCode: '',
        solidContent: '',
        dryFilmWeight: '',
      });
    } else if (row) {
      setEditingId(row.id);
      setForm({
        coatingType: row.coatingType,
        supplier: row.supplier,
        coatingName: row.coatingName,
        materialCode: row.materialCode,
        solidContent: row.solidContent,
        dryFilmWeight: row.dryFilmWeight,
      });
    }
    setView('form');
  };

  const handleSaveForm = (keepOpen: boolean) => {
    if (formMode === 'view') {
      onShowToast('查询模式不可保存', 'warning');
      return;
    }
    const typeMissing = !form.coatingType.trim() || form.coatingType === '请选择';
    const nameMissing = !form.coatingName.trim();
    setFormErrors({ coatingType: typeMissing, coatingName: nameMissing });
    if (typeMissing || nameMissing) {
      onShowToast('请选择涂料类型与涂料名称', 'error');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (formMode === 'edit' && editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                coatingType: form.coatingType.trim(),
                supplier: form.supplier.trim(),
                coatingName: form.coatingName.trim(),
                materialCode: form.materialCode.trim() || r.materialCode,
                solidContent: form.solidContent.trim(),
                dryFilmWeight: form.dryFilmWeight.trim(),
              }
            : r
        )
      );
      onShowToast(keepOpen ? '已保存，可继续编辑' : '涂料配置已修改并保存', 'success');
    } else {
      const newId = `coat-${Date.now()}`;
      const newRec: CoatingConfigItem = {
        id: newId,
        coatingType: form.coatingType.trim(),
        supplier: form.supplier.trim(),
        coatingName: form.coatingName.trim(),
        materialCode: form.materialCode.trim(),
        solidContent: form.solidContent.trim(),
        dryFilmWeight: form.dryFilmWeight.trim(),
        creator: '潘鑫',
        createdAt: nowStr,
      };
      setRows((prev) => [newRec, ...prev]);
      setTotalVirtualCount((c) => c + 1);
      setFormMode('edit');
      setEditingId(newId);
      onShowToast(keepOpen ? '已保存，可继续编辑' : '涂料配置已新增并保存', 'success');
    }
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    if (!keepOpen) {
      setView('list');
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选要删除的记录', 'warning');
      return;
    }
    const cnt = selectedIds.length;
    setConfirmState({
      isOpen: true,
      title: '删除确认',
      desc: `确定删除已勾选的 ${cnt} 条涂料配置吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setTotalVirtualCount((c) => Math.max(0, c - cnt));
        setSelectedIds([]);
        onShowToast(`已删除 ${cnt} 条涂料配置`, 'success');
      },
    });
  };

  const handleConfirmImport = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const imported: CoatingConfigItem = {
      id: `coat-imp-${Date.now()}`,
      coatingType: '外补涂',
      supplier: '扬瑞',
      coatingName: '导入示例-外边缘补涂-MC6875-801',
      materialCode: '60009999',
      solidContent: '30',
      dryFilmWeight: '20.88',
      creator: '潘鑫',
      createdAt: nowStr,
    };
    setRows((prev) => [imported, ...prev]);
    setTotalVirtualCount((c) => c + 1);
    setIsImportOpen(false);
    setImportFileName('');
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    onShowToast('导入成功，新增 1 条涂料配置', 'success');
  };

  const handleConfirmPick = () => {
    const chosen = rows.find((r) => r.id === pickerSelectedId);
    if (!chosen) {
      onShowToast('请先选择一条涂料', 'warning');
      return;
    }
    setForm((prev) => ({
      ...prev,
      coatingName: chosen.coatingName,
      materialCode: chosen.materialCode,
    }));
    setFormErrors((prev) => ({ ...prev, coatingName: false }));
    setIsPickerOpen(false);
    onShowToast(`已选择：${chosen.coatingName}（${chosen.materialCode}）`, 'success');
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
            <Palette className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">
              {formMode === 'view'
                ? '查询-涂料配置'
                : formMode === 'edit'
                ? '修改-涂料配置'
                : '添加-涂料配置'}
            </h2>
            <span className="text-[#64748B]">
              · {isReadOnly ? '只读查询' : '维护涂料类型、供应商、物料及固含量/干膜量标准'}
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

        {/* Form Body Card (2-column 5 fields matching prototype) */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {/* 涂料类型 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>涂料类型
                </label>
                <select
                  disabled={isReadOnly}
                  value={form.coatingType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((p) => ({ ...p, coatingType: val }));
                    if (val) setFormErrors((prev) => ({ ...prev, coatingType: false }));
                  }}
                  className={ctlCls(formErrors.coatingType)}
                >
                  <option value="">请选择</option>
                  {COATING_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  {form.coatingType && !COATING_TYPE_OPTIONS.includes(form.coatingType) && (
                    <option value={form.coatingType}>{form.coatingType}</option>
                  )}
                </select>
              </div>
              {formErrors.coatingType && (
                <span className="text-[11px] text-[#EA580C] pl-23">请选择涂料类型</span>
              )}
            </div>

            {/* 供应商 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">供应商</label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={form.supplier}
                onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))}
                placeholder="请输入"
                className={ctlCls()}
              />
            </div>

            {/* 涂料名称 (with F5 picker) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>涂料名称
                </label>
                <div className="relative flex-1 max-w-xs min-w-0">
                  <input
                    type="text"
                    readOnly={isReadOnly}
                    value={form.coatingName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((p) => ({ ...p, coatingName: val }));
                      if (val.trim()) setFormErrors((prev) => ({ ...prev, coatingName: false }));
                    }}
                    placeholder="请选择"
                    className={`w-full h-8 pl-2.5 pr-8 border rounded-lg outline-none ${
                      isReadOnly
                        ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                        : formErrors.coatingName
                        ? 'bg-white text-[#1E293B] border-[#EA580C]'
                        : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
                    }`}
                  />
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setPickerKeyword('');
                        setPickerSelectedId(null);
                        setIsPickerOpen(true);
                      }}
                      title="选择涂料名称"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-[#64748B] hover:text-[#165DFF] hover:bg-[#EDF2F7] cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {formErrors.coatingName && (
                <span className="text-[11px] text-[#EA580C] pl-23">请选择或输入涂料名称</span>
              )}
              {form.materialCode && (
                <span className="text-[11px] text-[#64748B] pl-23 font-mono">
                  关联物料料号：{form.materialCode}
                </span>
              )}
            </div>

            {/* 固含量 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">固含量</label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={form.solidContent}
                onChange={(e) => setForm((p) => ({ ...p, solidContent: e.target.value }))}
                placeholder="请输入"
                className={ctlCls() + ' font-mono tabular-nums'}
              />
            </div>

            {/* 干膜量 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">干膜量</label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={form.dryFilmWeight}
                onChange={(e) => setForm((p) => ({ ...p, dryFilmWeight: e.target.value }))}
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
              <>
                <button
                  type="button"
                  onClick={() => handleSaveForm(true)}
                  className="h-8 px-4 border border-[#165DFF] rounded-lg bg-white text-[#165DFF] hover:bg-[#EBF2FF] font-medium cursor-pointer"
                >
                  保存不退出
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveForm(false)}
                  className="h-8 px-4 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
                >
                  保存并退出
                </button>
              </>
            )}
          </div>
        </div>

        {/* Coating Name Picker Modal (F5) */}
        {isPickerOpen && (
          <div
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsPickerOpen(false);
            }}
          >
            <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#EDF2F7] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-[#1E293B]">选择涂料名称</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-3 border-b border-[#EDF2F7] flex items-center gap-2 shrink-0 bg-[#F8FAFC]">
                <input
                  type="text"
                  value={pickerKeyword}
                  onChange={(e) => {
                    setPickerKeyword(e.target.value);
                    setPickerSelectedId(null);
                  }}
                  placeholder="按涂料名称 / 物料料号搜索"
                  className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-64 outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerSelectedId(null);
                    onShowToast(`查询完成，共 ${pickerRows.length} 种涂料`, 'info');
                  }}
                  className="h-8 px-3.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] font-medium cursor-pointer"
                >
                  查询
                </button>
              </div>

              <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0] w-12 text-center" />
                      <th className="p-2.5 border-b border-r border-[#E5E9F0]">涂料名称</th>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0]">物料料号</th>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0]">供应商</th>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0]">固含量</th>
                      <th className="p-2.5 border-b border-[#E5E9F0]">干膜量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF2F7]">
                    {pickerRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                          无匹配的涂料
                        </td>
                      </tr>
                    ) : (
                      pickerRows.map((item) => {
                        const isPicked = pickerSelectedId === item.id;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => setPickerSelectedId(item.id)}
                            className={`cursor-pointer transition-colors ${
                              isPicked ? 'bg-[#EBF2FF]' : 'hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                              <input
                                type="radio"
                                name="coatingPicker"
                                checked={isPicked}
                                onChange={() => setPickerSelectedId(item.id)}
                                className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                              />
                            </td>
                            <td className="p-2.5 border-r border-[#EDF2F7] font-medium text-[#1E293B]">
                              {item.coatingName}
                            </td>
                            <td className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums text-[#334155]">
                              {item.materialCode}
                            </td>
                            <td className="p-2.5 border-r border-[#EDF2F7] text-[#334155]">
                              {item.supplier}
                            </td>
                            <td className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums text-[#334155]">
                              {item.solidContent}
                            </td>
                            <td className="p-2.5 font-mono tabular-nums text-[#334155]">
                              {item.dryFilmWeight}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#F8FAFC] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPick}
                  className="px-4 py-1.5 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
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

  // ====================== VIEW 1: 涂料配置列表 ======================
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
              <Palette className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">涂料配置</span>
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
                { label: '涂料类型', opKey: 'typeOp', valKey: 'typeVal' },
                { label: '供应商', opKey: 'supplierOp', valKey: 'supplierVal' },
                { label: '涂料名称', opKey: 'nameOp', valKey: 'nameVal' },
              ] as const
            ).map((f) => (
              <div key={f.valKey} className="flex items-center gap-1.5 min-w-0">
                <label className="text-[#1E40AF] font-medium w-16 text-right whitespace-nowrap shrink-0">
                  {f.label}
                </label>
                <div className="inline-flex items-center flex-1 min-w-0">
                  <select
                    value={filters[f.opKey]}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [f.opKey]: e.target.value as MatchOp }))
                    }
                    className="h-8 px-2 border border-[#E5E9F0] border-r-0 rounded-l-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer shrink-0"
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
                    className="h-8 px-2.5 border border-[#E5E9F0] rounded-r-lg bg-white text-[#1E293B] flex-1 min-w-0 outline-none focus:border-[#2563EB]"
                  />
                </div>
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
              共计 <strong className="font-mono tabular-nums text-[#1E293B]">{displayTotal}</strong> 条涂料配置
            </span>
            <span className="hidden sm:inline text-[11px] text-[#94A3B8]">（双击行可快速查看详情）</span>
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
                  onShowToast('请先勾选 1 条要修改的记录', 'warning');
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
              title={selectedIds.length === 1 ? '修改已勾选的 1 条记录' : '勾选 1 条记录后可修改'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>修改</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium cursor-pointer ${
                selectedIds.length >= 1
                  ? 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
                  : 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8]'
              }`}
              title={
                selectedIds.length >= 1
                  ? `删除已勾选的 ${selectedIds.length} 条记录`
                  : '勾选记录后可删除'
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
            </button>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="h-8 px-3.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入</span>
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
                    暂无匹配的涂料配置记录
                  </td>
                </tr>
              ) : (
                sortedRows.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      onDoubleClick={() => openForm('view', r)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#EBF2FF]/75' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td
                        className="p-2.5 border-r border-[#EDF2F7] text-center"
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
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
                        if (col.key === 'coatingType') {
                          return (
                            <td key={col.key} className="p-2.5 border-r border-[#EDF2F7]">
                              {r.coatingType ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getTypeBadgeCls(
                                    r.coatingType
                                  )}`}
                                >
                                  {r.coatingType}
                                </span>
                              ) : (
                                <span className="text-[#CBD5E1]">-</span>
                              )}
                            </td>
                          );
                        }
                        const isMono = [
                          'materialCode',
                          'solidContent',
                          'dryFilmWeight',
                          'createdAt',
                        ].includes(col.key);
                        return (
                          <td
                            key={col.key}
                            className={`p-2.5 border-r border-[#EDF2F7] ${
                              isMono ? 'font-mono tabular-nums text-[#334155]' : ''
                            }`}
                          >
                            {r[col.key] !== '' ? r[col.key] : <span className="text-[#CBD5E1]">-</span>}
                          </td>
                        );
                      })}
                      <td
                        className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isSelected ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
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
                                desc: `确定删除涂料配置「${r.coatingName}」吗？`,
                                onConfirm: () => {
                                  setRows((prev) => prev.filter((x) => x.id !== r.id));
                                  setTotalVirtualCount((c) => Math.max(0, c - 1));
                                  setSelectedIds((prev) => prev.filter((id) => id !== r.id));
                                  onShowToast('已删除该涂料配置', 'success');
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
            ))}
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
              const nextSize = Number(e.target.value);
              setPageSize(nextSize);
              setCurrentPage(1);
              setJumpInput('1');
              onShowToast(`每页显示 ${nextSize} 条`, 'info');
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
                <h3 className="text-sm font-bold text-[#1E293B]">导入涂料配置</h3>
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
                支持 .xls / .xlsx / .csv 格式；导入字段需与「涂料配置」列表字段一致。点击确定后将模拟导入并追加一条涂料记录。
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
