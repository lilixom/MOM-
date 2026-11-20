import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  RotateCcw,
  Plus,
  Edit3,
  Upload,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  ArrowUpDown,
  Pin,
} from 'lucide-react';

interface PackListConfigTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface PackListItem {
  id: string;
  factory: string;
  packMatCode: string;
  materialName: string;
  formula: string;
  creator: string;
  createdAt: string;
}

type ColumnKey = keyof Omit<PackListItem, 'id'>;

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'factory', label: '工厂', visible: true, highlight: true, pinned: true },
  { key: 'packMatCode', label: '包材料号', visible: true, highlight: true, pinned: true },
  { key: 'materialName', label: '物料名称', visible: true },
  { key: 'formula', label: '公式', visible: true },
  { key: 'creator', label: '创建人', visible: false },
  { key: 'createdAt', label: '创建时间', visible: false },
];

const INITIAL_ROWS: PackListItem[] = [
  {
    id: 'pk-01',
    factory: '3040',
    packMatCode: '40002149',
    materialName: '包装防水保护膜-1620mm*1320mm*10um',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-02',
    factory: '3040',
    packMatCode: '40002128',
    materialName: '新木栈板-1400*1100*120mm',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-03',
    factory: '3040',
    packMatCode: '40002162',
    materialName: '新木盖板-1400*1100*20mm',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-04',
    factory: '3040',
    packMatCode: '40002214',
    materialName: '铜针-φ 1.30mm',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-05',
    factory: '3040',
    packMatCode: '40002134',
    materialName: '隔层纸板-单灰-1395mm*1100mm*350g',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-06',
    factory: '3040',
    packMatCode: '40002154',
    materialName: 'PP打包带-机用-本色-13mm*0.85mm',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-07',
    factory: '3040',
    packMatCode: '40002213',
    materialName: '铜线加工-φ 1.30mm',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-08',
    factory: '3020',
    packMatCode: '41000176',
    materialName: '',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-09',
    factory: '3040',
    packMatCode: '40000000',
    materialName: 'PE拉伸缠绕膜-机用-15.5um*500mm',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
  {
    id: 'pk-10',
    factory: '3020',
    packMatCode: '40001391',
    materialName: '',
    formula: '',
    creator: '潘鑫',
    createdAt: '2026-11-19 17:20:11',
  },
];

export const PackListConfigTab: React.FC<PackListConfigTabProps> = ({ onShowToast }) => {
  const [rows, setRows] = useState<PackListItem[]>(INITIAL_ROWS);
  const [totalVirtualCount, setTotalVirtualCount] = useState(111);

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [filters, setFilters] = useState({
    factoryOp: 'contains' as MatchOp,
    factory: '',
    matOp: 'contains' as MatchOp,
    mat: '',
    descOp: 'contains' as MatchOp,
    desc: '',
  });

  // Table states (default select 8th row pk-08 matching prototype)
  const [selectedIds, setSelectedIds] = useState<string[]>(['pk-08']);
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');

  // Column settings (F3) & Import modal (F4)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');

  // Right Drawer (F2: add / edit / view)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerForm, setDrawerForm] = useState({
    factory: '',
    packMatValue: '',
    formula: '',
  });
  const [drawerErrors, setDrawerErrors] = useState({
    factory: false,
    packMatValue: false,
  });

  // Material Picker Modal (F5)
  const [pickOpen, setPickOpen] = useState(false);
  const [pickTarget, setPickTarget] = useState<'filter' | 'drawer'>('drawer');
  const [pickSearch, setPickSearch] = useState('');
  const [pickSelectedId, setPickSelectedId] = useState<string | null>(null);

  const hasActiveFilter = useMemo(
    () => Boolean(filters.factory.trim() || filters.mat.trim() || filters.desc.trim()),
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
      if (!match(r.factory, filters.factory, filters.factoryOp)) return false;
      if (
        filters.mat.trim() &&
        !match(r.packMatCode, filters.mat, filters.matOp) &&
        !match(r.materialName, filters.mat, filters.matOp)
      ) {
        return false;
      }
      if (!match(r.materialName, filters.desc, filters.descOp)) return false;
      return true;
    });
  }, [rows, filters]);

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

  const pickCandidates = useMemo(() => {
    const kw = pickSearch.trim().toLowerCase();
    return rows.filter((r) => {
      if (!r.materialName) return false;
      if (!kw) return true;
      return (
        r.packMatCode.toLowerCase().includes(kw) ||
        r.materialName.toLowerCase().includes(kw) ||
        r.factory.toLowerCase().includes(kw)
      );
    });
  }, [rows, pickSearch]);

  const handleQuery = () => {
    setCurrentPage(1);
    onShowToast(`查询完成，共 ${displayTotal} 条包材清单`, 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setFilters({
      factoryOp: 'contains',
      factory: '',
      matOp: 'contains',
      mat: '',
      descOp: 'contains',
      desc: '',
    });
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    setCurrentPage(1);
    setJumpInput('1');
    onShowToast('筛选条件已重置', 'info');
  };

  const openDrawer = (mode: 'add' | 'edit' | 'view', row?: PackListItem) => {
    setDrawerMode(mode);
    setDrawerErrors({ factory: false, packMatValue: false });
    setIsColPanelOpen(false);
    if (mode === 'add') {
      setEditingId(null);
      setDrawerForm({ factory: '', packMatValue: '', formula: '' });
    } else if (row) {
      setEditingId(row.id);
      setDrawerForm({
        factory: row.factory,
        packMatValue: row.materialName || row.packMatCode,
        formula: row.formula,
      });
    }
    setDrawerOpen(true);
  };

  const handleSaveDrawer = () => {
    if (drawerMode === 'view') {
      onShowToast('查询模式不可保存', 'warning');
      return;
    }
    const fMissing = !drawerForm.factory.trim();
    const mMissing = !drawerForm.packMatValue.trim();
    setDrawerErrors({ factory: fMissing, packMatValue: mMissing });
    if (fMissing || mMissing) {
      onShowToast('请填写工厂与包材料号', 'error');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (drawerMode === 'edit' && editingId) {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== editingId) return r;
          const v = drawerForm.packMatValue.trim();
          const matched = rows.find((x) => x.materialName === v || x.packMatCode === v);
          return {
            ...r,
            factory: drawerForm.factory.trim(),
            packMatCode:
              v === r.materialName
                ? r.packMatCode
                : matched
                ? matched.packMatCode
                : v,
            materialName:
              v === r.materialName
                ? r.materialName
                : matched
                ? matched.materialName
                : r.materialName,
            formula: drawerForm.formula.trim(),
          };
        })
      );
      onShowToast('包材清单已修改并保存', 'success');
    } else {
      const v = drawerForm.packMatValue.trim();
      const matched = rows.find((x) => x.materialName === v || x.packMatCode === v);
      const newRec: PackListItem = {
        id: `pk-${Date.now()}`,
        factory: drawerForm.factory.trim(),
        packMatCode: matched ? matched.packMatCode : v,
        materialName: matched ? matched.materialName : '',
        formula: drawerForm.formula.trim(),
        creator: '潘鑫',
        createdAt: nowStr,
      };
      setRows((prev) => [newRec, ...prev]);
      setTotalVirtualCount((c) => c + 1);
      onShowToast('包材清单已新增并保存', 'success');
    }
    setSelectedIds([]);
    setDrawerOpen(false);
  };

  const handleOpenPicker = (target: 'filter' | 'drawer') => {
    setPickTarget(target);
    setPickSearch('');
    setPickSelectedId(null);
    setPickOpen(true);
  };

  const handleConfirmPick = () => {
    if (!pickSelectedId) {
      onShowToast('请先选择一条包材物料', 'warning');
      return;
    }
    const picked = rows.find((r) => r.id === pickSelectedId);
    if (!picked) return;
    if (pickTarget === 'filter') {
      setFilters((prev) => ({ ...prev, mat: picked.packMatCode }));
    } else {
      setDrawerForm((prev) => ({
        ...prev,
        packMatValue: picked.materialName || picked.packMatCode,
        factory: prev.factory || picked.factory,
      }));
      setDrawerErrors((prev) => ({ ...prev, packMatValue: false }));
    }
    setPickOpen(false);
    onShowToast(`已选择：${picked.materialName || picked.packMatCode}`, 'success');
  };

  const handleConfirmImport = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const imported: PackListItem = {
      id: `pk-imp-${Date.now()}`,
      factory: '3040',
      packMatCode: '40009999',
      materialName: '导入示例-PE膜-500mm',
      formula: '',
      creator: '潘鑫',
      createdAt: nowStr,
    };
    setRows((prev) => [imported, ...prev]);
    setTotalVirtualCount((c) => c + 1);
    setIsImportOpen(false);
    setImportFileName('');
    setSelectedIds([]);
    onShowToast('导入成功，新增 1 条包材记录', 'success');
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
              <Package className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">包材清单配置</span>
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
            {/* 工厂 */}
            <div className="flex items-center gap-2 min-w-0">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap shrink-0 w-16 text-right">
                工厂
              </label>
              <div className="flex flex-1 min-w-0">
                <select
                  value={filters.factoryOp}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, factoryOp: e.target.value as MatchOp }))
                  }
                  className="h-8 px-2 border border-[#E5E9F0] border-r-0 rounded-l-lg bg-white text-[#1E293B] outline-none cursor-pointer shrink-0"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={filters.factory}
                  onChange={(e) => setFilters((prev) => ({ ...prev, factory: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请输入"
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-r-lg bg-white text-[#1E293B] flex-1 min-w-0 outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* 包材料号 */}
            <div className="flex items-center gap-2 min-w-0">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap shrink-0 w-16 text-right">
                包材料号
              </label>
              <div className="flex flex-1 min-w-0">
                <select
                  value={filters.matOp}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, matOp: e.target.value as MatchOp }))
                  }
                  className="h-8 px-2 border border-[#E5E9F0] border-r-0 rounded-l-lg bg-white text-[#1E293B] outline-none cursor-pointer shrink-0"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={filters.mat}
                  onChange={(e) => setFilters((prev) => ({ ...prev, mat: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请选择"
                  className="h-8 px-2.5 border border-[#E5E9F0] border-r-0 bg-white text-[#1E293B] flex-1 min-w-0 outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => handleOpenPicker('filter')}
                  className="h-8 w-8 border border-[#E5E9F0] rounded-r-lg bg-[#F8FAFC] hover:bg-[#EBF2FF] text-[#64748B] hover:text-[#165DFF] flex items-center justify-center shrink-0 cursor-pointer transition"
                  title="选择包材料号"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 包材描述 */}
            <div className="flex items-center gap-2 min-w-0">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap shrink-0 w-16 text-right">
                包材描述
              </label>
              <div className="flex flex-1 min-w-0">
                <select
                  value={filters.descOp}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, descOp: e.target.value as MatchOp }))
                  }
                  className="h-8 px-2 border border-[#E5E9F0] border-r-0 rounded-l-lg bg-white text-[#1E293B] outline-none cursor-pointer shrink-0"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={filters.desc}
                  onChange={(e) => setFilters((prev) => ({ ...prev, desc: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请输入"
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-r-lg bg-white text-[#1E293B] flex-1 min-w-0 outline-none focus:border-[#2563EB]"
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
              共计 <strong className="font-mono tabular-nums text-[#1E293B]">{displayTotal}</strong> 条包材记录
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => openDrawer('add')}
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
              onClick={() => {
                if (selectedIds.length !== 1) {
                  onShowToast('请先勾选 1 条要修改的记录', 'warning');
                  return;
                }
                const target = rows.find((r) => r.id === selectedIds[0]);
                if (target) openDrawer('edit', target);
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
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-12 text-center text-[#94A3B8]">
                    暂无匹配的包材清单记录
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
                        const isMono = ['factory', 'packMatCode', 'createdAt'].includes(col.key);
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
                            onClick={() => openDrawer('edit', r)}
                            className="text-[#165DFF] hover:underline font-medium cursor-pointer"
                          >
                            修改
                          </button>
                          <button
                            type="button"
                            onClick={() => openDrawer('view', r)}
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

      {/* Right Drawer (F2: 添加 / 修改 / 查询) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-xs flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E5E9F0]">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {drawerMode === 'view'
                    ? '查询-包材清单'
                    : drawerMode === 'edit'
                    ? '修改-包材清单'
                    : '添加-包材清单'}
                </h3>
                {drawerMode === 'view' && (
                  <span className="text-[11px] text-[#64748B]">（只读）</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* 工厂 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <label className="w-18 text-right text-[#1E40AF] font-medium shrink-0">
                      <span className="text-[#EA580C] mr-0.5">*</span>工厂
                    </label>
                    <input
                      type="text"
                      readOnly={drawerMode === 'view'}
                      value={drawerForm.factory}
                      onChange={(e) => {
                        setDrawerForm((p) => ({ ...p, factory: e.target.value }));
                        if (e.target.value.trim()) {
                          setDrawerErrors((prev) => ({ ...prev, factory: false }));
                        }
                      }}
                      placeholder="请输入"
                      className={`flex-1 h-8 px-2.5 border rounded-lg outline-none min-w-0 font-mono ${
                        drawerMode === 'view'
                          ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                          : drawerErrors.factory
                          ? 'bg-white text-[#1E293B] border-[#EA580C]'
                          : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
                      }`}
                    />
                  </div>
                  {drawerErrors.factory && (
                    <span className="text-[11px] text-[#EA580C] pl-20">请填写工厂</span>
                  )}
                </div>

                {/* 包材料号 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <label className="w-18 text-right text-[#1E40AF] font-medium shrink-0">
                      <span className="text-[#EA580C] mr-0.5">*</span>包材料号
                    </label>
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="text"
                        readOnly={drawerMode === 'view'}
                        value={drawerForm.packMatValue}
                        onChange={(e) => {
                          setDrawerForm((p) => ({ ...p, packMatValue: e.target.value }));
                          if (e.target.value.trim()) {
                            setDrawerErrors((prev) => ({ ...prev, packMatValue: false }));
                          }
                        }}
                        placeholder="请选择"
                        className={`w-full h-8 pl-2.5 pr-8 border rounded-lg outline-none ${
                          drawerMode === 'view'
                            ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                            : drawerErrors.packMatValue
                            ? 'bg-white text-[#1E293B] border-[#EA580C]'
                            : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
                        }`}
                      />
                      {drawerMode !== 'view' && (
                        <button
                          type="button"
                          onClick={() => handleOpenPicker('drawer')}
                          className="absolute right-2 top-2 text-[#64748B] hover:text-[#165DFF] cursor-pointer"
                          title="选择包材料号"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {drawerErrors.packMatValue && (
                    <span className="text-[11px] text-[#EA580C] pl-20">请选择或输入包材料号</span>
                  )}
                </div>

                {/* 公式 */}
                <div className="sm:col-span-2 flex items-start gap-2.5">
                  <label className="w-18 text-right text-[#1E40AF] font-medium shrink-0 pt-2">
                    公式
                  </label>
                  <textarea
                    readOnly={drawerMode === 'view'}
                    rows={4}
                    value={drawerForm.formula}
                    onChange={(e) => setDrawerForm((p) => ({ ...p, formula: e.target.value }))}
                    placeholder="请输入"
                    className={`flex-1 px-2.5 py-2 border rounded-lg outline-none resize-y min-h-[92px] ${
                      drawerMode === 'view'
                        ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                        : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-8 px-4 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] font-medium cursor-pointer"
              >
                取消
              </button>
              {drawerMode !== 'view' && (
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  className="h-8 px-4 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
                >
                  保存并退出
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Material Picker Modal (F5) */}
      {pickOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPickOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-2xl max-h-[82vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-[#1E293B]">选择包材料号</h3>
              <button
                type="button"
                onClick={() => setPickOpen(false)}
                className="text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-[#EDF2F7] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={pickSearch}
                onChange={(e) => {
                  setPickSearch(e.target.value);
                  setPickSelectedId(null);
                }}
                placeholder="按包材料号 / 物料名称搜索"
                className="h-8 px-3 border border-[#E5E9F0] rounded-lg w-64 outline-none focus:border-[#2563EB]"
              />
              <button
                type="button"
                onClick={() =>
                  onShowToast(`查询完成，共 ${pickCandidates.length} 个包材物料`, 'info')
                }
                className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
              >
                查询
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5 border-b border-[#E5E9F0] w-12 text-center"></th>
                    <th className="p-2.5 border-b border-[#E5E9F0]">包材料号</th>
                    <th className="p-2.5 border-b border-[#E5E9F0]">物料名称</th>
                    <th className="p-2.5 border-b border-[#E5E9F0] w-20">工厂</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7]">
                  {pickCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[#94A3B8]">
                        无匹配的包材物料
                      </td>
                    </tr>
                  ) : (
                    pickCandidates.map((item) => {
                      const picked = pickSelectedId === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setPickSelectedId(item.id)}
                          className={`cursor-pointer ${
                            picked ? 'bg-[#EBF2FF]' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="radio"
                              name="packMatPick"
                              checked={picked}
                              onChange={() => setPickSelectedId(item.id)}
                              className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 font-mono tabular-nums text-[#334155]">
                            {item.packMatCode}
                          </td>
                          <td className="p-2.5 text-[#1E293B]">{item.materialName}</td>
                          <td className="p-2.5 font-mono tabular-nums text-[#64748B]">
                            {item.factory}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-[#EDF2F7] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPickOpen(false)}
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
                <h3 className="text-sm font-bold text-[#1E293B]">导入包材清单</h3>
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
                支持 .xls / .xlsx / .csv 格式；导入字段需与「包材清单配置」列表字段一致。点击确定后将模拟导入并追加一条包材记录。
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
    </div>
  );
};
