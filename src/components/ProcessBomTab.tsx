import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  RotateCcw,
  Plus,
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
  Send,
  CheckCircle2,
  XCircle,
  GitMerge,
  Calendar,
  Sparkles,
  FilePlus2,
} from 'lucide-react';

interface ProcessBomTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface BomItem {
  id: string;
  bomNo: string;
  productName: string;
  productCode: string;
  type: string;
  version: string;
  factory: string;
  baseQty: string;
  itemCount: string;
  status: string;
  creator: string;
  createdAt: string;
  // Extended header metadata for Edit view
  sapSyncStatus: string;
  parentMaterial: string;
  bomUsage: string;
  effectiveDate: string;
  validUntil: string;
  bomText: string;
  itemCategory: string;
  outerCoatCustomer: string;
  innerCoatCustomer: string;
}

interface BomDetailRow {
  id: string;
  lineNo: string;
  compQuery: string;
  compCode: string;
  compDesc: string;
  qty: string;
}

type ColumnKey =
  | 'bomNo'
  | 'productName'
  | 'type'
  | 'version'
  | 'factory'
  | 'baseQty'
  | 'itemCount'
  | 'status'
  | 'creator'
  | 'createdAt';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'bomNo', label: 'BOM编号', visible: true, highlight: true, pinned: true },
  { key: 'productName', label: '产品名称', visible: true, highlight: true, pinned: true },
  { key: 'type', label: '类型', visible: true },
  { key: 'version', label: '版本', visible: true },
  { key: 'factory', label: '工厂', visible: true },
  { key: 'baseQty', label: '基本数量', visible: true },
  { key: 'itemCount', label: '行项目数', visible: true },
  { key: 'status', label: '状态', visible: true },
  { key: 'creator', label: '创建人', visible: false },
  { key: 'createdAt', label: '创建时间', visible: false },
];

const INITIAL_BOM_ROWS: BomItem[] = [
  {
    id: 'bom-01',
    bomNo: 'BOM-2026-0016',
    productName: '泰奇八宝粥大罐装(刷防腐剂2412版)空罐-209#430',
    productCode: '10024251',
    type: '正式',
    version: 'V2',
    factory: '1050',
    baseQty: '25000',
    itemCount: '',
    status: '',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-02',
    bomNo: 'BOM-2026-0015',
    productName: '金罐空罐-206#250',
    productCode: '10024252',
    type: '正式',
    version: '1',
    factory: '1050',
    baseQty: '1000',
    itemCount: '',
    status: '',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-03',
    bomNo: 'BOM-2026-0014',
    productName: '印铁-209#350可口营养八宝粥2020年版',
    productCode: '10024253',
    type: '正式',
    version: 'V1.0',
    factory: '1050',
    baseQty: '1000',
    itemCount: '',
    status: '',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-04',
    bomNo: 'BOM-2026-0011',
    productName: '',
    productCode: '',
    type: '',
    version: '',
    factory: '',
    baseQty: '',
    itemCount: '',
    status: '已驳回',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: '未同步',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-05',
    bomNo: 'BOM-2026-0009',
    productName: '可口营养八宝粥（202608版）空罐-209#360_COPY',
    productCode: '10024255',
    type: '测试',
    version: 'V1.0',
    factory: '1050',
    baseQty: '10000',
    itemCount: '',
    status: '待确认',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: '待提交',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-06',
    bomNo: 'BOM-2026-0008',
    productName: '杏仁效果杏仁露空罐',
    productCode: '10024256',
    type: '测试',
    version: 'V1.0',
    factory: '1050',
    baseQty: '1100',
    itemCount: '',
    status: '已确认',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-07',
    bomNo: 'BOM-2026-0008',
    productName: '杏仁效果杏仁露空罐',
    productCode: '10024256',
    type: '测试',
    version: 'V1.0',
    factory: '1050',
    baseQty: '1100',
    itemCount: '9',
    status: '已确认',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-08',
    bomNo: 'BOM-2026-0007',
    productName: '杏仁效果杏仁露空罐_COPY',
    productCode: '10024257',
    type: '测试',
    version: 'V1.0',
    factory: 'ahsp',
    baseQty: '13333',
    itemCount: '',
    status: '已确认',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-09',
    bomNo: 'BOM-2026-0006',
    productName: '杏仁效果杏仁露空罐_COPY',
    productCode: '10024258',
    type: '测试',
    version: 'V1.0',
    factory: 'G01',
    baseQty: '11111',
    itemCount: '',
    status: '已确认',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
  {
    id: 'bom-10',
    bomNo: 'BOM-2026-0005',
    productName: '杏仁效果杏仁露空罐',
    productCode: '10024259',
    type: '正式',
    version: 'V1.0',
    factory: 'G01',
    baseQty: '',
    itemCount: '',
    status: '待确认',
    creator: '潘鑫',
    createdAt: '2026-11-20 09:12:33',
    sapSyncStatus: '待提交',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  },
];

const DEFAULT_COMPONENTS: Array<{ compCode: string; compDesc: string; qty: string }> = [
  { compCode: '60001011', compDesc: '内全喷涂料-F290-68055E', qty: '12.32' },
  { compCode: '60009682', compDesc: '稀释剂-FQ850-69456', qty: '2.465' },
  { compCode: '60010322', compDesc: '内全喷涂料-P-XC240207', qty: '14.07' },
  { compCode: '60001000', compDesc: '稀释剂-PPG50779', qty: '2.816' },
  { compCode: '60001009', compDesc: '内边缘补涂-粉末-DS-672016', qty: '2.554' },
  { compCode: '60001030', compDesc: '外边缘补涂-MC6875-801', qty: '2.426' },
  { compCode: '60001007', compDesc: '稀释剂-MC50598', qty: '0.485' },
  { compCode: '60001092', compDesc: '稀释剂-PPG60598', qty: '1' },
  { compCode: '10024252', compDesc: '印铁-209#430泰奇八宝粥大罐', qty: '1000' },
];

const createDefaultDetails = (): BomDetailRow[] =>
  DEFAULT_COMPONENTS.map((c, idx) => ({
    id: `det-${Date.now()}-${idx}`,
    lineNo: String((idx + 1) * 10),
    compQuery: '',
    compCode: c.compCode,
    compDesc: c.compDesc,
    qty: c.qty,
  }));

const getStatusBadge = (status: string) => {
  switch (status) {
    case '已确认':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
    case '待确认':
      return 'bg-amber-50 text-amber-700 border border-amber-200/80';
    case '已驳回':
      return 'bg-rose-50 text-rose-700 border border-rose-200/80';
    default:
      return '';
  }
};

const getTypeBadge = (type: string) => {
  if (type === '正式') return 'bg-blue-50 text-[#1E40AF] border border-blue-200/80';
  if (type === '测试') return 'bg-slate-100 text-slate-700 border border-slate-200';
  return '';
};

export const ProcessBomTab: React.FC<ProcessBomTabProps> = ({ onShowToast }) => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');

  const [rows, setRows] = useState<BomItem[]>(INITIAL_BOM_ROWS);
  const [totalVirtualCount, setTotalVirtualCount] = useState(14);
  const [bomSeq, setBomSeq] = useState(17);

  // Per-BOM saved detail rows so session edits persist across BOMs
  const [bomDetailsMap, setBomDetailsMap] = useState<Record<string, BomDetailRow[]>>({});

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [filters, setFilters] = useState({
    bomOp: 'contains' as MatchOp,
    bomVal: '',
    factoryOp: 'contains' as MatchOp,
    factoryVal: '',
    prodOp: 'contains' as MatchOp,
    prodVal: '',
    matOp: 'contains' as MatchOp,
    matVal: '',
  });

  // Table states (pre-select rows 3 & 4 matching prototype)
  const [selectedIds, setSelectedIds] = useState<string[]>(['bom-03', 'bom-04']);
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

  // P2 Add BOM form state
  const [addForm, setAddForm] = useState({
    parentMaterial: '',
    type: '',
    factory: '',
    itemCount: '',
    baseQty: '',
    effectiveDate: '2026-11-20',
    validUntil: '9999-12-31',
    bomText: '',
    bomUsage: '生产',
    itemCategory: 'L',
    version: '',
    outerCoatCustomer: '',
    innerCoatCustomer: '',
  });
  const [addParentError, setAddParentError] = useState(false);

  // P3 Edit BOM form state
  const [editingBomId, setEditingBomId] = useState<string | null>(null);
  const [editingBomNo, setEditingBomNo] = useState<string>('');
  const [editForm, setEditForm] = useState({
    factory: '1050',
    productCode: '10024251',
    baseQty: '25000',
    type: '正式',
    version: 'V2',
    sapSyncStatus: 'SAP已回传',
    parentMaterial: '承德顺天喜坊',
    bomUsage: '生产',
    effectiveDate: '2026-10-22',
    validUntil: '9999-12-31',
    bomText: '普通',
    itemCategory: 'L',
    outerCoatCustomer: '露露',
    innerCoatCustomer: '普通罐',
  });
  const [detailRows, setDetailRows] = useState<BomDetailRow[]>(createDefaultDetails);
  const [selectedDetailIds, setSelectedDetailIds] = useState<string[]>([]);

  // F4 Import components modal
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');

  // F5 Component picker modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTargetDetailId, setPickerTargetDetailId] = useState<string | null>(null);
  const [pickerKeyword, setPickerKeyword] = useState('');
  const [pickerSelectedIdx, setPickerSelectedIdx] = useState<number>(-1);

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
        filters.bomVal.trim() ||
          filters.factoryVal.trim() ||
          filters.prodVal.trim() ||
          filters.matVal.trim()
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
      if (!match(r.bomNo, filters.bomVal, filters.bomOp)) return false;
      if (!match(r.factory, filters.factoryVal, filters.factoryOp)) return false;
      if (!match(r.productName, filters.prodVal, filters.prodOp)) return false;
      if (
        filters.matVal.trim() &&
        !match(r.productCode, filters.matVal, filters.matOp) &&
        !match(r.productName, filters.matVal, filters.matOp)
      ) {
        return false;
      }
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

  const pickerFiltered = useMemo(() => {
    const kw = pickerKeyword.trim().toLowerCase();
    return DEFAULT_COMPONENTS.map((item, idx) => ({ item, idx })).filter(
      ({ item }) =>
        !kw ||
        item.compCode.toLowerCase().includes(kw) ||
        item.compDesc.toLowerCase().includes(kw)
    );
  }, [pickerKeyword]);

  const handleQuery = () => {
    setCurrentPage(1);
    setJumpInput('1');
    onShowToast(`查询完成，共 ${displayTotal} 条 BOM`, 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setFilters({
      bomOp: 'contains',
      bomVal: '',
      factoryOp: 'contains',
      factoryVal: '',
      prodOp: 'contains',
      prodVal: '',
      matOp: 'contains',
      matVal: '',
    });
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    setCurrentPage(1);
    setJumpInput('1');
    onShowToast('筛选条件已重置', 'info');
  };

  const handleBatchStatus = (nextStatus: string) => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选要操作的 BOM', 'warning');
      return;
    }
    const selSet = new Set(selectedIds);
    setRows((prev) => prev.map((r) => (selSet.has(r.id) ? { ...r, status: nextStatus } : r)));
    onShowToast(`已将 ${selectedIds.length} 条 BOM 状态更新为「${nextStatus}」`, 'success');
  };

  const handleSubmitSap = () => {
    if (selectedIds.length > 0) {
      const selSet = new Set(selectedIds);
      setRows((prev) =>
        prev.map((r) => (selSet.has(r.id) ? { ...r, sapSyncStatus: 'SAP已回传' } : r))
      );
      onShowToast(`已提交 ${selectedIds.length} 条 BOM 至 SAP 同步`, 'success');
    } else {
      onShowToast('已提交 SAP 同步', 'success');
    }
  };

  const handleMergeBom = () => {
    if (selectedIds.length < 2) {
      onShowToast('工艺BOM合并：已合并选中记录', 'info');
      return;
    }
    onShowToast(`工艺BOM合并：已合并选中的 ${selectedIds.length} 条 BOM 记录`, 'success');
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选要删除的 BOM', 'warning');
      return;
    }
    const cnt = selectedIds.length;
    setConfirmState({
      isOpen: true,
      title: '删除确认',
      desc: `确定删除已勾选的 ${cnt} 条 BOM 吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setTotalVirtualCount((c) => Math.max(0, c - cnt));
        setSelectedIds([]);
        onShowToast(`已删除 ${cnt} 条 BOM`, 'success');
      },
    });
  };

  const openAddView = () => {
    setAddForm({
      parentMaterial: '',
      type: '',
      factory: '',
      itemCount: '',
      baseQty: '',
      effectiveDate: '2026-11-20',
      validUntil: '9999-12-31',
      bomText: '',
      bomUsage: '生产',
      itemCategory: 'L',
      version: '',
      outerCoatCustomer: '',
      innerCoatCustomer: '',
    });
    setAddParentError(false);
    setIsColPanelOpen(false);
    setView('add');
  };

  const handleSaveAdd = () => {
    if (!addForm.parentMaterial || addForm.parentMaterial === '请选择') {
      setAddParentError(true);
      onShowToast('请选择父项物料号', 'error');
      return;
    }
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const nextNo = `BOM-2026-${String(bomSeq).padStart(4, '0')}`;
    const newBom: BomItem = {
      id: `bom-${Date.now()}`,
      bomNo: nextNo,
      productName: `${addForm.parentMaterial}（${addForm.type || '正式'} BOM）`,
      productCode: /^\d+$/.test(addForm.parentMaterial) ? addForm.parentMaterial : '10024251',
      type: addForm.type || '正式',
      version: addForm.version.trim() || 'V1.0',
      factory: addForm.factory || '1050',
      baseQty: addForm.baseQty.trim() || '0',
      itemCount: '',
      status: '待确认',
      creator: '潘鑫',
      createdAt: nowStr,
      sapSyncStatus: '待提交',
      parentMaterial: addForm.parentMaterial,
      bomUsage: addForm.bomUsage || '生产',
      effectiveDate: addForm.effectiveDate || '2026-11-20',
      validUntil: addForm.validUntil || '9999-12-31',
      bomText: addForm.bomText || '普通',
      itemCategory: addForm.itemCategory.trim() || 'L',
      outerCoatCustomer: addForm.outerCoatCustomer || '露露',
      innerCoatCustomer: addForm.innerCoatCustomer || '普通罐',
    };
    setRows((prev) => [newBom, ...prev]);
    setBomSeq((n) => n + 1);
    setTotalVirtualCount((c) => c + 1);
    setSelectedIds([]);
    setSortConfig({ key: null, dir: null });
    onShowToast(`BOM（${nextNo}）已新增并保存`, 'success');
    setView('list');
  };

  const openEditView = (bom: BomItem) => {
    setEditingBomId(bom.id);
    setEditingBomNo(bom.bomNo);
    setEditForm({
      factory: bom.factory || '1050',
      productCode: bom.productCode || '10024251',
      baseQty: bom.baseQty || '25000',
      type: bom.type || '正式',
      version: bom.version || 'V2',
      sapSyncStatus: bom.sapSyncStatus || 'SAP已回传',
      parentMaterial: bom.parentMaterial || '承德顺天喜坊',
      bomUsage: bom.bomUsage || '生产',
      effectiveDate: bom.effectiveDate || '2026-10-22',
      validUntil: bom.validUntil || '9999-12-31',
      bomText: bom.bomText || '普通',
      itemCategory: bom.itemCategory || 'L',
      outerCoatCustomer: bom.outerCoatCustomer || '露露',
      innerCoatCustomer: bom.innerCoatCustomer || '普通罐',
    });
    const existingDetails = bomDetailsMap[bom.id];
    setDetailRows(
      existingDetails ? existingDetails.map((d) => ({ ...d })) : createDefaultDetails()
    );
    setSelectedDetailIds([]);
    setIsColPanelOpen(false);
    setView('edit');
  };

  const handleSaveEdit = () => {
    if (editingBomId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingBomId
            ? {
                ...r,
                factory: editForm.factory.trim(),
                productCode: editForm.productCode.trim(),
                baseQty: editForm.baseQty.trim(),
                type: editForm.type,
                version: editForm.version.trim(),
                sapSyncStatus: editForm.sapSyncStatus.trim(),
                effectiveDate: editForm.effectiveDate.trim(),
                validUntil: editForm.validUntil.trim(),
                itemCount: String(detailRows.length),
              }
            : r
        )
      );
      setBomDetailsMap((prev) => ({
        ...prev,
        [editingBomId]: detailRows.map((d) => ({ ...d })),
      }));
    }
    onShowToast(`编辑BOM 已保存（组件 ${detailRows.length} 行）`, 'success');
    setView('list');
  };

  const handleDetailChange = (
    rowId: string,
    field: keyof Omit<BomDetailRow, 'id'>,
    value: string
  ) => {
    setDetailRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (field === 'compQuery' && value) {
          const matched = DEFAULT_COMPONENTS.find((c) => c.compCode === value);
          if (matched) {
            return {
              ...row,
              compQuery: value,
              compCode: matched.compCode,
              compDesc: matched.compDesc,
              qty: matched.qty,
            };
          }
        }
        return { ...row, [field]: value };
      })
    );
  };

  const handleAddDetailRow = () => {
    const nextLine = String((detailRows.length + 1) * 10);
    setDetailRows((prev) => [
      ...prev,
      {
        id: `det-${Date.now()}`,
        lineNo: nextLine,
        compQuery: '',
        compCode: '',
        compDesc: '',
        qty: '',
      },
    ]);
    onShowToast('已添加一行组件', 'info');
  };

  const handleDeleteSelectedDetails = () => {
    if (selectedDetailIds.length === 0) {
      onShowToast('请先勾选要删除的组件行', 'warning');
      return;
    }
    const delSet = new Set(selectedDetailIds);
    setDetailRows((prev) => prev.filter((r) => !delSet.has(r.id)));
    setSelectedDetailIds([]);
    onShowToast(`已删除 ${delSet.size} 行组件`, 'success');
  };

  const handleConfirmImportComp = () => {
    const nextLine = String((detailRows.length + 1) * 10);
    setDetailRows((prev) => [
      ...prev,
      {
        id: `det-imp-${Date.now()}`,
        lineNo: nextLine,
        compQuery: '',
        compCode: '60009999',
        compDesc: '导入示例组件',
        qty: '1',
      },
    ]);
    setIsImportOpen(false);
    setImportFileName('');
    onShowToast('导入成功，追加 1 行组件', 'success');
  };

  const handleConfirmPickComp = () => {
    if (pickerSelectedIdx < 0 || !DEFAULT_COMPONENTS[pickerSelectedIdx]) {
      onShowToast('请先选择一个组件', 'warning');
      return;
    }
    const chosen = DEFAULT_COMPONENTS[pickerSelectedIdx];
    if (pickerTargetDetailId) {
      setDetailRows((prev) =>
        prev.map((row) =>
          row.id === pickerTargetDetailId
            ? {
                ...row,
                compCode: chosen.compCode,
                compDesc: chosen.compDesc,
                qty: chosen.qty,
              }
            : row
        )
      );
    }
    setIsPickerOpen(false);
    onShowToast(`已选择组件：${chosen.compDesc}`, 'success');
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

  const allDetailsSelected =
    detailRows.length > 0 && detailRows.every((r) => selectedDetailIds.includes(r.id));

  // ====================== VIEW 2: P2 BOM添加 ======================
  if (view === 'add') {
    const ctlCls = (err?: boolean) =>
      `flex-1 max-w-xs h-8 px-2.5 border rounded-lg outline-none min-w-0 bg-white text-[#1E293B] ${
        err ? 'border-[#EA580C]' : 'border-[#E5E9F0] focus:border-[#2563EB]'
      }`;

    return (
      <div className="space-y-4 text-xs text-[#1E293B]">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">BOM添加</h2>
            <span className="text-[#64748B]">· 新建工艺单 BOM 主数据与有效期配置</span>
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

        {/* Form Body */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {/* 父项物料号 (Required) */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center gap-3">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  <span className="text-[#EA580C] mr-0.5">*</span>父项物料号
                </label>
                <select
                  value={addForm.parentMaterial}
                  onChange={(e) => {
                    setAddForm((p) => ({ ...p, parentMaterial: e.target.value }));
                    if (e.target.value) setAddParentError(false);
                  }}
                  className={`flex-1 max-w-md h-8 px-2.5 border rounded-lg outline-none bg-white text-[#1E293B] ${
                    addParentError ? 'border-[#EA580C]' : 'border-[#E5E9F0] focus:border-[#2563EB]'
                  }`}
                >
                  <option value="">请选择</option>
                  <option value="承德顺天喜坊">承德顺天喜坊</option>
                  <option value="10024251">10024251</option>
                  <option value="10024252">10024252</option>
                </select>
              </div>
              {addParentError && (
                <span className="text-[11px] text-[#EA580C] pl-27">请选择父项物料号</span>
              )}
            </div>

            {/* 类型 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">类型</label>
              <select
                value={addForm.type}
                onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                <option value="正式">正式</option>
                <option value="测试">测试</option>
              </select>
            </div>

            {/* 工厂 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">工厂</label>
              <select
                value={addForm.factory}
                onChange={(e) => setAddForm((p) => ({ ...p, factory: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                <option value="1050">1050</option>
                <option value="G01">G01</option>
                <option value="ahsp">ahsp</option>
              </select>
            </div>

            {/* 行项目数 (Disabled) */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">行项目数</label>
              <input
                type="text"
                disabled
                value={addForm.itemCount}
                placeholder="由组件明细自动汇总"
                className="flex-1 max-w-xs h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#94A3B8] cursor-not-allowed min-w-0"
              />
            </div>

            {/* 基本数量 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">基本数量</label>
              <input
                type="text"
                value={addForm.baseQty}
                onChange={(e) => setAddForm((p) => ({ ...p, baseQty: e.target.value }))}
                placeholder="请输入"
                className={ctlCls() + ' font-mono tabular-nums'}
              />
            </div>

            {/* 生效日期 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">生效日期</label>
              <div className="relative flex-1 max-w-xs min-w-0">
                <input
                  type="text"
                  value={addForm.effectiveDate}
                  onChange={(e) => setAddForm((p) => ({ ...p, effectiveDate: e.target.value }))}
                  className="w-full h-8 pl-2.5 pr-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono tabular-nums outline-none focus:border-[#2563EB]"
                />
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 有效期 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">有效期</label>
              <div className="relative flex-1 max-w-xs min-w-0">
                <input
                  type="text"
                  value={addForm.validUntil}
                  onChange={(e) => setAddForm((p) => ({ ...p, validUntil: e.target.value }))}
                  className="w-full h-8 pl-2.5 pr-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono tabular-nums outline-none focus:border-[#2563EB]"
                />
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* BOM文本 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">BOM文本</label>
              <select
                value={addForm.bomText}
                onChange={(e) => setAddForm((p) => ({ ...p, bomText: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                <option value="普通">普通</option>
                <option value="特殊">特殊</option>
              </select>
            </div>

            {/* BOM用途 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">BOM用途</label>
              <select
                value={addForm.bomUsage}
                onChange={(e) => setAddForm((p) => ({ ...p, bomUsage: e.target.value }))}
                className={ctlCls()}
              >
                <option value="生产">生产</option>
                <option value="研发">研发</option>
              </select>
            </div>

            {/* 项目类别 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">项目类别</label>
              <input
                type="text"
                value={addForm.itemCategory}
                onChange={(e) => setAddForm((p) => ({ ...p, itemCategory: e.target.value }))}
                className={ctlCls() + ' font-mono'}
              />
            </div>

            {/* 版本可选BOM */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                版本可选BOM
              </label>
              <input
                type="text"
                value={addForm.version}
                onChange={(e) => setAddForm((p) => ({ ...p, version: e.target.value }))}
                placeholder="请输入"
                className={ctlCls() + ' font-mono'}
              />
            </div>

            {/* 外补涂客户 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                外补涂客户
              </label>
              <select
                value={addForm.outerCoatCustomer}
                onChange={(e) => setAddForm((p) => ({ ...p, outerCoatCustomer: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                <option value="露露">露露</option>
                <option value="普通罐">普通罐</option>
              </select>
            </div>

            {/* 内补涂客户 */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                内补涂客户
              </label>
              <select
                value={addForm.innerCoatCustomer}
                onChange={(e) => setAddForm((p) => ({ ...p, innerCoatCustomer: e.target.value }))}
                className={ctlCls()}
              >
                <option value="">请选择</option>
                <option value="普通罐">普通罐</option>
                <option value="露露">露露</option>
              </select>
            </div>
          </div>

          <div className="px-6 py-3.5 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setView('list')}
              className="h-8 px-4 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveAdd}
              className="h-8 px-4 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
            >
              保存并退出
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====================== VIEW 3: P3 编辑BOM ======================
  if (view === 'edit') {
    const editCtl =
      'flex-1 max-w-xs h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] min-w-0';
    const roCtl =
      'flex-1 max-w-xs h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] cursor-not-allowed min-w-0';

    return (
      <div className="space-y-4 text-xs text-[#1E293B]">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1E293B]">编辑BOM</h2>
            {editingBomNo && (
              <span className="px-2 py-0.5 rounded bg-[#EBF2FF] text-[#165DFF] font-mono font-semibold text-[11px]">
                {editingBomNo}
              </span>
            )}
            <span className="text-[#64748B]">· 维护 BOM 基础属性及组件明细清单</span>
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

        {/* Upper Form Card (14 fields) */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5">
            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">工厂</label>
              <input
                type="text"
                value={editForm.factory}
                onChange={(e) => setEditForm((p) => ({ ...p, factory: e.target.value }))}
                className={editCtl + ' font-mono'}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">产品编码</label>
              <input
                type="text"
                value={editForm.productCode}
                onChange={(e) => setEditForm((p) => ({ ...p, productCode: e.target.value }))}
                className={editCtl + ' font-mono'}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">基本数量</label>
              <input
                type="text"
                value={editForm.baseQty}
                onChange={(e) => setEditForm((p) => ({ ...p, baseQty: e.target.value }))}
                className={editCtl + ' font-mono tabular-nums'}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">类型</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                className={editCtl}
              >
                <option value="正式">正式</option>
                <option value="测试">测试</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                版本可选BOM
              </label>
              <input
                type="text"
                value={editForm.version}
                onChange={(e) => setEditForm((p) => ({ ...p, version: e.target.value }))}
                className={editCtl + ' font-mono'}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                SAP同步状态
              </label>
              <input
                type="text"
                value={editForm.sapSyncStatus}
                onChange={(e) => setEditForm((p) => ({ ...p, sapSyncStatus: e.target.value }))}
                className={editCtl}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                父项物料号
              </label>
              <select disabled value={editForm.parentMaterial} className={roCtl}>
                <option value={editForm.parentMaterial}>{editForm.parentMaterial}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">BOM用途</label>
              <select disabled value={editForm.bomUsage} className={roCtl}>
                <option value={editForm.bomUsage}>{editForm.bomUsage}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">生效日期</label>
              <div className="relative flex-1 max-w-xs min-w-0">
                <input
                  type="text"
                  value={editForm.effectiveDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, effectiveDate: e.target.value }))}
                  className="w-full h-8 pl-2.5 pr-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono tabular-nums outline-none focus:border-[#2563EB]"
                />
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">有效期</label>
              <div className="relative flex-1 max-w-xs min-w-0">
                <input
                  type="text"
                  value={editForm.validUntil}
                  onChange={(e) => setEditForm((p) => ({ ...p, validUntil: e.target.value }))}
                  className="w-full h-8 pl-2.5 pr-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono tabular-nums outline-none focus:border-[#2563EB]"
                />
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">BOM文本</label>
              <input type="text" disabled value={editForm.bomText} className={roCtl} />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">项目类别</label>
              <input type="text" disabled value={editForm.itemCategory} className={roCtl + ' font-mono'} />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                外补涂客户
              </label>
              <select disabled value={editForm.outerCoatCustomer} className={roCtl}>
                <option value={editForm.outerCoatCustomer}>{editForm.outerCoatCustomer}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                内补涂客户
              </label>
              <select disabled value={editForm.innerCoatCustomer} className={roCtl}>
                <option value={editForm.innerCoatCustomer}>{editForm.innerCoatCustomer}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Component Detail Table Card */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAddDetailRow}
                className="h-8 px-3 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加一行</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>导入</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const fresh = createDefaultDetails();
                  setDetailRows(fresh);
                  setSelectedDetailIds([]);
                  onShowToast(`已根据工艺单生成 ${fresh.length} 个组件`, 'success');
                }}
                className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>根据工艺单生成组件</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDetailRows(createDefaultDetails());
                  setSelectedDetailIds([]);
                  onShowToast('已生成默认数据', 'success');
                }}
                className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>生成默认数据</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedDetails}
                className={`h-8 px-3 border rounded-lg transition flex items-center gap-1.5 font-medium cursor-pointer ${
                  selectedDetailIds.length > 0
                    ? 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
                    : 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除</span>
              </button>
            </div>

            <div className="text-xs text-[#64748B] flex items-center gap-2">
              <span>
                已选{' '}
                <strong className="font-mono tabular-nums text-[#1E293B]">
                  {selectedDetailIds.length}
                </strong>{' '}
                行
              </span>
              <span aria-hidden="true">·</span>
              <span>
                共计{' '}
                <strong className="font-mono tabular-nums text-[#1E293B]">
                  {detailRows.length}
                </strong>{' '}
                个组件
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-[920px]">
              <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
                <tr>
                  <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allDetailsSelected}
                      onChange={() => {
                        if (allDetailsSelected) setSelectedDetailIds([]);
                        else setSelectedDetailIds(detailRows.map((d) => d.id));
                      }}
                      className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                    />
                  </th>
                  <th className="p-2.5 border-b border-r border-[#E5E9F0] w-24">
                    <span className="text-[#EA580C] mr-0.5">*</span>行项目
                  </th>
                  <th className="p-2.5 border-b border-r border-[#E5E9F0] w-48">组件查询</th>
                  <th className="p-2.5 border-b border-r border-[#E5E9F0] w-44 bg-blue-50/70 text-blue-700">
                    <span className="text-[#EA580C] mr-0.5">*</span>组件
                  </th>
                  <th className="p-2.5 border-b border-r border-[#E5E9F0]">组件描述</th>
                  <th className="p-2.5 border-b border-r border-[#E5E9F0] w-32">数量</th>
                  <th className="p-2.5 border-b border-[#E5E9F0] w-20 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF2F7]">
                {detailRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                      暂无组件明细，请点击「添加一行」或「根据工艺单生成组件」
                    </td>
                  </tr>
                ) : (
                  detailRows.map((row) => {
                    const isPicked = selectedDetailIds.includes(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isPicked ? 'bg-[#EBF2FF]/70' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="p-2 border-r border-[#EDF2F7] text-center">
                          <input
                            type="checkbox"
                            checked={isPicked}
                            onChange={() =>
                              setSelectedDetailIds((prev) =>
                                prev.includes(row.id)
                                  ? prev.filter((id) => id !== row.id)
                                  : [...prev, row.id]
                              )
                            }
                            className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                          />
                        </td>
                        <td className="p-1.5 border-r border-[#EDF2F7]">
                          <input
                            type="text"
                            value={row.lineNo}
                            onChange={(e) => handleDetailChange(row.id, 'lineNo', e.target.value)}
                            className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white font-mono tabular-nums outline-none focus:border-[#2563EB]"
                          />
                        </td>
                        <td className="p-1.5 border-r border-[#EDF2F7]">
                          <select
                            value={row.compQuery}
                            onChange={(e) =>
                              handleDetailChange(row.id, 'compQuery', e.target.value)
                            }
                            className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white text-[#1E293B] outline-none focus:border-[#2563EB]"
                          >
                            <option value="">请选择</option>
                            {DEFAULT_COMPONENTS.map((c) => (
                              <option key={c.compCode} value={c.compCode}>
                                {c.compCode} - {c.compDesc}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-[#EDF2F7]">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={row.compCode}
                              onChange={(e) =>
                                handleDetailChange(row.id, 'compCode', e.target.value)
                              }
                              onDoubleClick={() => {
                                setPickerTargetDetailId(row.id);
                                setPickerKeyword('');
                                setPickerSelectedIdx(-1);
                                setIsPickerOpen(true);
                              }}
                              title="双击或点击搜索图标选择组件"
                              className="w-full h-7 pl-2 pr-7 border border-[#E5E9F0] rounded bg-white font-mono tabular-nums outline-none focus:border-[#2563EB]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPickerTargetDetailId(row.id);
                                setPickerKeyword('');
                                setPickerSelectedIdx(-1);
                                setIsPickerOpen(true);
                              }}
                              title="选择组件"
                              className="absolute right-1 text-[#64748B] hover:text-[#165DFF] p-0.5 rounded cursor-pointer"
                            >
                              <Search className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-[#EDF2F7]">
                          <input
                            type="text"
                            value={row.compDesc}
                            onChange={(e) =>
                              handleDetailChange(row.id, 'compDesc', e.target.value)
                            }
                            className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none focus:border-[#2563EB]"
                          />
                        </td>
                        <td className="p-1.5 border-r border-[#EDF2F7]">
                          <input
                            type="text"
                            value={row.qty}
                            onChange={(e) => handleDetailChange(row.id, 'qty', e.target.value)}
                            className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white font-mono tabular-nums outline-none focus:border-[#2563EB]"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailRows((prev) => prev.filter((x) => x.id !== row.id));
                              setSelectedDetailIds((prev) => prev.filter((id) => id !== row.id));
                              onShowToast('已删除该行组件', 'info');
                            }}
                            className="text-[#EA580C] hover:underline font-medium cursor-pointer"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3.5 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setView('list')}
              className="h-8 px-4 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="h-8 px-4 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
            >
              保存并退出
            </button>
          </div>
        </div>

        {/* F4 Import Component Modal */}
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
                  <h3 className="text-sm font-bold text-[#1E293B]">导入组件</h3>
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
                  支持 .xls / .xlsx / .csv 格式；导入字段需与「编辑BOM」组件明细一致。点击确定后将模拟导入并追加一行组件。
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
                  onClick={handleConfirmImportComp}
                  className="px-4 py-1.5 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* F5 Component Picker Modal */}
        {isPickerOpen && (
          <div
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsPickerOpen(false);
            }}
          >
            <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#EDF2F7] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-[#1E293B]">选择组件</h3>
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
                    setPickerSelectedIdx(-1);
                  }}
                  placeholder="按组件号 / 组件描述搜索"
                  className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-64 outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerSelectedIdx(-1);
                    onShowToast(`查询完成，共 ${pickerFiltered.length} 个组件`, 'info');
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
                      <th className="p-2.5 border-b border-r border-[#E5E9F0]">组件号</th>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0]">组件描述</th>
                      <th className="p-2.5 border-b border-[#E5E9F0]">参考数量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF2F7]">
                    {pickerFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-[#94A3B8]">
                          无匹配的组件
                        </td>
                      </tr>
                    ) : (
                      pickerFiltered.map(({ item, idx }) => {
                        const isPicked = pickerSelectedIdx === idx;
                        return (
                          <tr
                            key={item.compCode}
                            onClick={() => setPickerSelectedIdx(idx)}
                            className={`cursor-pointer transition-colors ${
                              isPicked ? 'bg-[#EBF2FF]' : 'hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                              <input
                                type="radio"
                                name="bomCompPick"
                                checked={isPicked}
                                onChange={() => setPickerSelectedIdx(idx)}
                                className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                              />
                            </td>
                            <td className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums font-medium text-[#1E293B]">
                              {item.compCode}
                            </td>
                            <td className="p-2.5 border-r border-[#EDF2F7] text-[#334155]">
                              {item.compDesc}
                            </td>
                            <td className="p-2.5 font-mono tabular-nums text-[#334155]">
                              {item.qty}
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
                  onClick={handleConfirmPickComp}
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

  // ====================== VIEW 1: P1 BOM列表 ======================
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
              <Boxes className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工艺单BOM</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-0.5">
            {(
              [
                { label: 'BOM编号', opKey: 'bomOp', valKey: 'bomVal' },
                { label: '工厂', opKey: 'factoryOp', valKey: 'factoryVal' },
                { label: '产品名称', opKey: 'prodOp', valKey: 'prodVal' },
                { label: '产品料号', opKey: 'matOp', valKey: 'matVal' },
              ] as const
            ).map((f) => (
              <div key={f.valKey} className="flex items-center gap-2 min-w-0">
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
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={handleSubmitSap}
              className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>提交SAP</span>
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatus('已确认')}
              className="h-8 px-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>确认</span>
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatus('已驳回')}
              className="h-8 px-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>驳回</span>
            </button>
            <button
              type="button"
              onClick={handleMergeBom}
              className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>工艺BOM合并</span>
            </button>
            <button
              type="button"
              onClick={openAddView}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加BOM</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className={`h-8 px-3 border rounded-lg transition flex items-center gap-1.5 font-medium cursor-pointer ${
                selectedIds.length > 0
                  ? 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
                  : 'border-[#E5E9F0] bg-[#F8FAFC] text-[#94A3B8]'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
            </button>
          </div>

          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedIds.length}</strong> 项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              共计 <strong className="font-mono tabular-nums text-[#1E293B]">{displayTotal}</strong> 条BOM
            </span>
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
                      if (allVisibleSelected) setSelectedIds([]);
                      else setSelectedIds(sortedRows.map((r) => r.id));
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
                    暂无匹配的工艺单 BOM 记录
                  </td>
                </tr>
              ) : (
                sortedRows.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      onDoubleClick={() => openEditView(r)}
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
                        if (col.key === 'status') {
                          return (
                            <td key={col.key} className="p-2.5 border-r border-[#EDF2F7]">
                              {r.status ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getStatusBadge(
                                    r.status
                                  )}`}
                                >
                                  {r.status}
                                </span>
                              ) : (
                                <span className="text-[#CBD5E1]">-</span>
                              )}
                            </td>
                          );
                        }
                        if (col.key === 'type') {
                          return (
                            <td key={col.key} className="p-2.5 border-r border-[#EDF2F7]">
                              {r.type ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getTypeBadge(
                                    r.type
                                  )}`}
                                >
                                  {r.type}
                                </span>
                              ) : (
                                <span className="text-[#CBD5E1]">-</span>
                              )}
                            </td>
                          );
                        }
                        const isMono = [
                          'bomNo',
                          'version',
                          'factory',
                          'baseQty',
                          'itemCount',
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
                        <button
                          type="button"
                          onClick={() => openEditView(r)}
                          className="text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          编辑BOM
                        </button>
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
