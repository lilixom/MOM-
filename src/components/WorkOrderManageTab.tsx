import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  RotateCcw,
  RefreshCw,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  AlertTriangle,
  ArrowUpDown,
  GitBranch,
  Check,
  Edit3,
  Pin,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  ExternalLink,
} from 'lucide-react';
import { WorkOrderManageItem, WorkOrderManageBomItem } from '../types';
import { DEFAULT_WORK_ORDER_MANAGE_BOM } from '../mockData';

const LAYOUT_PREVIEW_IMAGE =
  'data:image/png;base64,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';

interface WorkOrderManageTabProps {
  items: WorkOrderManageItem[];
  onUpdateItems: (items: WorkOrderManageItem[]) => void;
  onNavigateToPlanOrder?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface ColumnConfig {
  key: keyof WorkOrderManageItem;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
  align?: 'left' | 'right';
  isNumeric?: boolean;
  isLink?: boolean;
  isStatus?: 'down' | 'prod';
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'org', label: '组织机构', visible: true },
  { key: 'workshop', label: '车间', visible: true },
  { key: 'line', label: '线体', visible: true },
  { key: 'planNo', label: '计划单号', visible: true },
  { key: 'woNo', label: '工单号', visible: true, isLink: true },
  { key: 'woType', label: '工单类型', visible: true },
  { key: 'downStatus', label: '下达状态', visible: true, isStatus: 'down' },
  { key: 'prodStatus', label: '生产状态', visible: true, isStatus: 'prod' },
  { key: 'materialNo', label: '产品料号', visible: true },
  { key: 'productVersion', label: '产品版本', visible: true },
  { key: 'pickedSets', label: '已领料套数', visible: true, align: 'right', isNumeric: true },
  { key: 'planQty', label: '计划数量', visible: true, align: 'right', isNumeric: true },
  { key: 'inputQty', label: '投入数量', visible: true, highlight: true, pinned: true, align: 'right', isNumeric: true },
  { key: 'outputQty', label: '产出数量', visible: true, align: 'right', isNumeric: true },
  { key: 'craftName', label: '工艺名称', visible: true },
  { key: 'completionRate', label: '计划完成率', visible: true, highlight: true, pinned: true, align: 'right', isNumeric: true },
  { key: 'planStartTime', label: '预计开工时间', visible: true },
  { key: 'planEndTime', label: '预计完工时间', visible: true },
  { key: 'actualStartTime', label: '实际开工时间', visible: true },
  { key: 'actualEndTime', label: '实际完工时间', visible: true },
  { key: 'customerShort', label: '客户简称', visible: true },
  { key: 'soNo', label: '销售单号', visible: true },
  { key: 'createBy', label: '创建人', visible: true },
  { key: 'createTime', label: '创建时间', visible: true },
  { key: 'modBy', label: '修改人', visible: true },
  { key: 'modTime', label: '修改时间', visible: true },
  { key: 'priority', label: '优先级', visible: true, align: 'right', isNumeric: true },
];

export const WorkOrderManageTab: React.FC<WorkOrderManageTabProps> = ({
  items,
  onUpdateItems,
  onNavigateToPlanOrder,
  onShowToast,
}) => {
  // Filter states
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [quickDate, setQuickDate] = useState('自定义');
  const [startDateFilter, setStartDateFilter] = useState('2026-11-18T00:00');
  const [endDateFilter, setEndDateFilter] = useState('2026-11-25T11:09');
  const [quickDownStatus, setQuickDownStatus] = useState('ALL');

  const [woNoOp, setWoNoOp] = useState<MatchOp>('contains');
  const [woNoFilter, setWoNoFilter] = useState('');
  const [workshopOp, setWorkshopOp] = useState<MatchOp>('contains');
  const [workshopFilter, setWorkshopFilter] = useState('请选择');
  const [matOp, setMatOp] = useState<MatchOp>('contains');
  const [matFilter, setMatFilter] = useState('');

  const [woStatusOp, setWoStatusOp] = useState<MatchOp>('contains');
  const [woStatusFilter, setWoStatusFilter] = useState('请选择');
  const [planNoOp, setPlanNoOp] = useState<MatchOp>('contains');
  const [planNoFilter, setPlanNoFilter] = useState('');
  const [lineOp, setLineOp] = useState<MatchOp>('contains');
  const [lineFilter, setLineFilter] = useState('请选择');

  const [appliedFilters, setAppliedFilters] = useState({
    org: '请选择',
    downStatus: 'ALL',
    woNoOp: 'contains' as MatchOp,
    woNo: '',
    workshop: '请选择',
    matOp: 'contains' as MatchOp,
    mat: '',
    woStatus: '请选择',
    planNoOp: 'contains' as MatchOp,
    planNo: '',
    line: '请选择',
  });

  // Selection, Sorting, Pagination
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof WorkOrderManageItem | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Column settings (F4)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // Flow overview (P0)
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);

  // F2 工单同步弹窗
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncWoNo, setSyncWoNo] = useState('');
  const [syncWoNoErr, setSyncWoNoErr] = useState(false);

  // F3 修改/新增工单弹窗
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalMode, setEditModalMode] = useState<'add' | 'edit'>('edit');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [woForm, setWoForm] = useState({
    woNo: '1045403',
    materialNo: '10033897',
    productName: '',
    productSpec: '',
    productVersion: '03',
    planQty: '157320',
    woType: '量产',
    workshop: '中山制罐车间',
    customerShort: '',
    deliveryDate: '',
    planStartTime: '2026-11-20T00:00',
    planEndTime: '2026-11-21T00:00',
    soNo: '1000072640',
    planNo: '',
    sapVersion: 'SD全喷',
    prodStage: '生产通用',
    line: '制罐D线',
    sapOrderNo: '1045403',
    craftVersion: '03',
    priority: '1',
    cancelSchedule: false,
    remark: '',
  });
  const [woFormErrors, setWoFormErrors] = useState<{ woNo?: boolean; materialNo?: boolean }>({});
  const [bomItems, setBomItems] = useState<WorkOrderManageBomItem[]>(DEFAULT_WORK_ORDER_MANAGE_BOM);
  const [selectedBomIds, setSelectedBomIds] = useState<string[]>([]);

  // F5 版面图片弹窗
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isLayoutZoomed, setIsLayoutZoomed] = useState(false);
  const [layoutTitle, setLayoutTitle] = useState('包装版面设计稿（红牛维生素饮料 · 206*250）');

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

  // Filtered and Sorted rows
  const filteredItems = useMemo(() => {
    const matchStr = (val: string, filter: string, op: MatchOp) => {
      if (!filter.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = filter.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };

    return items.filter((row) => {
      if (appliedFilters.org !== '请选择' && !row.org.includes(appliedFilters.org)) return false;
      if (appliedFilters.downStatus !== 'ALL' && row.downStatus !== appliedFilters.downStatus) return false;
      if (!matchStr(row.woNo, appliedFilters.woNo, appliedFilters.woNoOp)) return false;
      if (appliedFilters.workshop !== '请选择' && row.workshop !== appliedFilters.workshop) return false;
      if (!matchStr(row.materialNo, appliedFilters.mat, appliedFilters.matOp)) return false;
      if (appliedFilters.woStatus !== '请选择') {
        if (appliedFilters.woStatus === '已下达' && row.downStatus === '未下达') return false;
        if (appliedFilters.woStatus === '未下达' && row.downStatus !== '未下达') return false;
      }
      if (!matchStr(row.planNo, appliedFilters.planNo, appliedFilters.planNoOp)) return false;
      if (appliedFilters.line !== '请选择' && row.line !== appliedFilters.line) return false;
      return true;
    });
  }, [items, appliedFilters]);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredItems;
    const key = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredItems].sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv), 'zh-CN') * dir;
    });
  }, [filteredItems, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = sortedItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  const visibleColumns = columns.filter((c) => c.visible);

  // Handlers
  const handleQuickDateSelect = (val: string) => {
    setQuickDate(val);
    const now = new Date('2026-11-18T00:00');
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (val === '今天') {
      const end = new Date(now);
      end.setHours(23, 59);
      setStartDateFilter(fmt(now));
      setEndDateFilter(fmt(end));
    } else if (val === '本周') {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      setStartDateFilter(fmt(now));
      setEndDateFilter(fmt(end));
    } else if (val === '本月') {
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      setStartDateFilter(fmt(now));
      setEndDateFilter(fmt(end));
    } else if (val === '最近三个月') {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      setStartDateFilter(fmt(start));
      setEndDateFilter(fmt(now));
    }
  };

  const handleQuickStatusSelect = (val: string) => {
    setQuickDownStatus(val);
    setAppliedFilters((prev) => ({ ...prev, downStatus: val }));
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setAppliedFilters({
      org: orgFilter,
      downStatus: quickDownStatus,
      woNoOp,
      woNo: woNoFilter,
      workshop: workshopFilter,
      matOp,
      mat: matFilter,
      woStatus: woStatusFilter,
      planNoOp,
      planNo: planNoFilter,
      line: lineFilter,
    });
    setCurrentPage(1);
    onShowToast('查询条件已应用', 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setQuickDate('自定义');
    setStartDateFilter('2026-11-18T00:00');
    setEndDateFilter('2026-11-25T11:09');
    setQuickDownStatus('ALL');
    setWoNoOp('contains');
    setWoNoFilter('');
    setWorkshopFilter('请选择');
    setMatOp('contains');
    setMatFilter('');
    setWoStatusFilter('请选择');
    setPlanNoOp('contains');
    setPlanNoFilter('');
    setLineFilter('请选择');
    setAppliedFilters({
      org: '请选择',
      downStatus: 'ALL',
      woNoOp: 'contains',
      woNo: '',
      workshop: '请选择',
      matOp: 'contains',
      mat: '',
      woStatus: '请选择',
      planNoOp: 'contains',
      planNo: '',
      line: '请选择',
    });
    setCurrentPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const toggleSort = (key: keyof WorkOrderManageItem) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return { key: null, dir: null };
    });
  };

  const allPagedSelected =
    pagedItems.length > 0 && pagedItems.every((r) => selectedKeys.includes(r.key));

  const toggleSelectAll = () => {
    if (allPagedSelected) {
      const pageKeys = new Set(pagedItems.map((r) => r.key));
      setSelectedKeys((prev) => prev.filter((k) => !pageKeys.has(k)));
    } else {
      const next = new Set([...selectedKeys, ...pagedItems.map((r) => r.key)]);
      setSelectedKeys(Array.from(next));
    }
  };

  const toggleSelectRow = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const openEditModal = (mode: 'add' | 'edit', row?: WorkOrderManageItem) => {
    setEditModalMode(mode);
    setWoFormErrors({});
    if (mode === 'add') {
      setEditingKey(null);
      setWoForm({
        woNo: `104${Math.floor(5408 + Math.random() * 500)}`,
        materialNo: '',
        productName: '',
        productSpec: '',
        productVersion: '01',
        planQty: '100000',
        woType: '量产',
        workshop: '中山制罐车间',
        customerShort: '',
        deliveryDate: '2026-11-26',
        planStartTime: '2026-11-20T08:30',
        planEndTime: '2026-11-21T20:00',
        soNo: '',
        planNo: '',
        sapVersion: 'SD全喷',
        prodStage: '生产通用',
        line: '制罐D线',
        sapOrderNo: '',
        craftVersion: '03',
        priority: '1',
        cancelSchedule: false,
        remark: '',
      });
      setBomItems(DEFAULT_WORK_ORDER_MANAGE_BOM);
    } else if (row) {
      setEditingKey(row.key);
      setWoForm({
        woNo: row.woNo,
        materialNo: row.materialNo,
        productName: row.productName || '',
        productSpec: row.productSpec || '',
        productVersion: row.productVersion || '03',
        planQty: String(row.planQty),
        woType: row.woType,
        workshop: row.workshop,
        customerShort: row.customerShort || '',
        deliveryDate: row.deliveryDate || '',
        planStartTime: row.planStartTime.replace(' ', 'T'),
        planEndTime: row.planEndTime.replace(' ', 'T'),
        soNo: row.soNo || '',
        planNo: row.planNo === '—' ? '' : row.planNo,
        sapVersion: row.sapVersion || 'SD全喷',
        prodStage: row.prodStage || '生产通用',
        line: row.line,
        sapOrderNo: row.sapOrderNo || row.woNo,
        craftVersion: row.craftVersion || '03',
        priority: String(row.priority ?? 1),
        cancelSchedule: !!row.cancelSchedule,
        remark: row.remark || '',
      });
      setBomItems(DEFAULT_WORK_ORDER_MANAGE_BOM);
    }
    setSelectedBomIds([]);
    setIsEditModalOpen(true);
  };

  const handleSyncSubmit = () => {
    if (!syncWoNo.trim()) {
      setSyncWoNoErr(true);
      onShowToast('请输入工单号', 'error');
      return;
    }
    setSyncWoNoErr(false);
    const trimmed = syncWoNo.trim();
    const exists = items.some((i) => i.woNo === trimmed);
    if (!exists) {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const syncedItem: WorkOrderManageItem = {
        key: trimmed,
        org: '昇兴集团-中山制罐工厂',
        workshop: '中山制罐车间',
        line: '制罐D线',
        planNo: '—',
        woNo: trimmed,
        woType: '量产',
        downStatus: '未下达',
        prodStatus: '未开始',
        materialNo: '10033897',
        productName: '同步上游工单产品',
        productSpec: '206*250',
        productVersion: '03',
        pickedSets: 0,
        planQty: 120000,
        inputQty: 0,
        outputQty: 0,
        craftName: '三片罐SD全喷工艺',
        craftVersion: '03',
        completionRate: '0.0%',
        planStartTime: '2026-11-20 08:30',
        planEndTime: '2026-11-21 20:00',
        actualStartTime: '—',
        actualEndTime: '—',
        customerShort: '红牛',
        soNo: '1000072888',
        sapVersion: 'SD全喷',
        sapOrderNo: trimmed,
        prodStage: '生产通用',
        deliveryDate: '2026-11-26',
        cancelSchedule: false,
        remark: '',
        createBy: 'SAP接口同步',
        createTime: nowStr,
        modBy: 'SAP接口同步',
        modTime: nowStr,
        priority: 2,
      };
      onUpdateItems([syncedItem, ...items]);
    }
    setIsSyncModalOpen(false);
    setSyncWoNo('');
    onShowToast(`工单 ${trimmed} 同步成功`, 'success');
  };

  const handleSaveWo = () => {
    const noErr = !woForm.woNo.trim();
    const matErr = !woForm.materialNo.trim();
    if (noErr || matErr) {
      setWoFormErrors({ woNo: noErr, materialNo: matErr });
      onShowToast('请补全必填项（工单号、产品料号）', 'error');
      return;
    }
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const planQtyNum = parseFloat(woForm.planQty) || 0;
    const priorityNum = parseInt(woForm.priority, 10) || 1;

    if (editModalMode === 'add') {
      const newItem: WorkOrderManageItem = {
        key: woForm.woNo.trim(),
        org: '昇兴集团-中山制罐工厂',
        workshop: woForm.workshop,
        line: woForm.line,
        planNo: woForm.planNo.trim() || '—',
        woNo: woForm.woNo.trim(),
        woType: woForm.woType,
        downStatus: '未下达',
        prodStatus: '未开始',
        materialNo: woForm.materialNo.trim(),
        productName: woForm.productName.trim() || `产品 ${woForm.materialNo.trim()}`,
        productSpec: woForm.productSpec || '206*250',
        productVersion: woForm.productVersion || '01',
        pickedSets: 0,
        planQty: planQtyNum,
        inputQty: 0,
        outputQty: 0,
        craftName: '三片罐SD全喷工艺',
        craftVersion: woForm.craftVersion || '03',
        completionRate: '0.0%',
        planStartTime: woForm.planStartTime.replace('T', ' '),
        planEndTime: woForm.planEndTime.replace('T', ' '),
        actualStartTime: '—',
        actualEndTime: '—',
        customerShort: woForm.customerShort.trim() || '—',
        soNo: woForm.soNo.trim() || '—',
        sapVersion: woForm.sapVersion,
        sapOrderNo: woForm.sapOrderNo.trim() || woForm.woNo.trim(),
        prodStage: woForm.prodStage,
        deliveryDate: woForm.deliveryDate,
        cancelSchedule: woForm.cancelSchedule,
        remark: woForm.remark,
        createBy: '系统管理员',
        createTime: nowStr,
        modBy: '系统管理员',
        modTime: nowStr,
        priority: priorityNum,
      };
      onUpdateItems([newItem, ...items]);
      onShowToast(`新增工单 ${newItem.woNo} 保存成功`, 'success');
    } else if (editingKey) {
      onUpdateItems(
        items.map((item) => {
          if (item.key !== editingKey) return item;
          return {
            ...item,
            woNo: woForm.woNo.trim(),
            materialNo: woForm.materialNo.trim(),
            productName: woForm.productName.trim() || item.productName,
            productSpec: woForm.productSpec || item.productSpec,
            productVersion: woForm.productVersion || item.productVersion,
            planQty: planQtyNum,
            woType: woForm.woType,
            workshop: woForm.workshop,
            customerShort: woForm.customerShort.trim() || item.customerShort,
            deliveryDate: woForm.deliveryDate,
            planStartTime: woForm.planStartTime.replace('T', ' '),
            planEndTime: woForm.planEndTime.replace('T', ' '),
            soNo: woForm.soNo.trim() || item.soNo,
            planNo: woForm.planNo.trim() || '—',
            sapVersion: woForm.sapVersion,
            prodStage: woForm.prodStage,
            line: woForm.line,
            sapOrderNo: woForm.sapOrderNo,
            craftVersion: woForm.craftVersion,
            priority: priorityNum,
            cancelSchedule: woForm.cancelSchedule,
            remark: woForm.remark,
            modBy: '系统管理员',
            modTime: nowStr,
          };
        })
      );
      onShowToast(`工单 ${woForm.woNo} 保存成功`, 'success');
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteRow = (row: WorkOrderManageItem) => {
    setConfirmState({
      isOpen: true,
      title: '删除工单',
      desc: `确认删除工单「${row.woNo}」？删除后不可恢复，是否继续？`,
      onConfirm: () => {
        onUpdateItems(items.filter((i) => i.key !== row.key));
        setSelectedKeys((prev) => prev.filter((k) => k !== row.key));
        onShowToast(`已删除工单 ${row.woNo}`, 'success');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedKeys.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      desc: `将删除选中的 ${selectedKeys.length} 条工单，删除后不可恢复，是否继续？`,
      onConfirm: () => {
        const delSet = new Set(selectedKeys);
        onUpdateItems(items.filter((i) => !delSet.has(i.key)));
        setSelectedKeys([]);
        onShowToast(`已批量删除 ${delSet.size} 条工单`, 'success');
      },
    });
  };

  // BOM handlers inside F3
  const handleAddBomRow = () => {
    const nextSeq = bomItems.length > 0 ? Math.max(...bomItems.map((b) => b.seq)) + 1 : 1;
    setBomItems((prev) => [
      ...prev,
      {
        id: `wobom-${Date.now()}`,
        seq: nextSeq,
        stage: '生产通用',
        materialNo: '',
        materialName: '',
        spec: '',
      },
    ]);
    onShowToast('已新增一行 BOM', 'info');
  };

  const handleLoadProductBom = () => {
    setBomItems(DEFAULT_WORK_ORDER_MANAGE_BOM);
    setSelectedBomIds([]);
    onShowToast(`已加载产品 BOM（共 ${DEFAULT_WORK_ORDER_MANAGE_BOM.length} 行）`, 'success');
  };

  const handleBatchDeleteBom = () => {
    if (selectedBomIds.length === 0) {
      onShowToast('请先勾选要删除的 BOM 行', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量删除 BOM',
      desc: `将删除选中的 ${selectedBomIds.length} 行 BOM 明细，是否继续？`,
      onConfirm: () => {
        const delSet = new Set(selectedBomIds);
        setBomItems((prev) => prev.filter((b) => !delSet.has(b.id)));
        setSelectedBomIds([]);
        onShowToast(`已删除 ${delSet.size} 行 BOM`, 'success');
      },
    });
  };

  const renderStatusText = (val: string, kind: 'down' | 'prod') => {
    if (kind === 'down') {
      if (val === '下达完成') return <span className="font-semibold text-emerald-700">{val}</span>;
      if (val === '部分下达') return <span className="font-semibold text-amber-700">{val}</span>;
      return <span className="text-[#64748B]">{val}</span>;
    }
    if (val === '生产中' || val === '已完工') {
      return <span className="font-semibold text-emerald-700">{val}</span>;
    }
    if (val === '待生产') return <span className="font-semibold text-amber-700">{val}</span>;
    return <span className="text-[#64748B]">{val}</span>;
  };

  return (
    <div className="space-y-4 relative">
      {/* P1 Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        {/* Top Row: Title + Org + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工单管理</span>
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
                <option value="中山制罐工厂">中山制罐工厂</option>
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
              onClick={() => setIsColPanelOpen((prev) => !prev)}
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

        {/* Date Range Quick Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[#1E40AF] font-medium w-20 text-right shrink-0">预计开工时间</span>
          <div className="flex items-center gap-1 bg-[#F4F6F9] p-0.5 rounded-lg border border-[#E5E9F0]">
            {['今天', '本周', '本月', '最近三个月', '自定义'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickDateSelect(label)}
                className={`px-2.5 py-1 rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                  quickDate === label
                    ? 'bg-[#165DFF] text-white font-medium'
                    : 'text-[#1E40AF] hover:bg-[#EBF2FF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="datetime-local"
              value={startDateFilter}
              onChange={(e) => {
                setStartDateFilter(e.target.value);
                setQuickDate('自定义');
              }}
              className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
            />
            <span className="text-[#64748B]">→</span>
            <input
              type="datetime-local"
              value={endDateFilter}
              onChange={(e) => {
                setEndDateFilter(e.target.value);
                setQuickDate('自定义');
              }}
              className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Collapsible Detailed Filters */}
        {!filterCollapsed && (
          <div className="space-y-2.5 pt-1">
            {/* 下达状态 */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#1E40AF] font-medium w-20 text-right shrink-0">下达状态</span>
              <div className="flex items-center gap-1 bg-[#F4F6F9] p-0.5 rounded-lg border border-[#E5E9F0]">
                {['ALL', '未下达', '部分下达', '下达完成'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleQuickStatusSelect(st)}
                    className={`px-3 py-1 rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                      quickDownStatus === st
                        ? 'bg-[#165DFF] text-white font-medium'
                        : 'text-[#1E40AF] hover:bg-[#EBF2FF]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Inputs Grid */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pl-1">
              {/* 工单号 */}
              <div className="flex items-center gap-1.5">
                <label className="text-[#1E40AF] font-medium w-16 text-right">工单号</label>
                <select
                  value={woNoOp}
                  onChange={(e) => setWoNoOp(e.target.value as MatchOp)}
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={woNoFilter}
                  onChange={(e) => setWoNoFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请输入"
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-32 outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* 车间 */}
              <div className="flex items-center gap-1.5">
                <label className="text-[#1E40AF] font-medium w-14 text-right">车间</label>
                <select
                  value={workshopOp}
                  onChange={(e) => setWorkshopOp(e.target.value as MatchOp)}
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <select
                  value={workshopFilter}
                  onChange={(e) => setWorkshopFilter(e.target.value)}
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-36 outline-none cursor-pointer"
                >
                  <option value="请选择">请选择</option>
                  <option value="中山制罐车间">中山制罐车间</option>
                  <option value="成都制罐车间">成都制罐车间</option>
                </select>
              </div>

              {/* 产品料号 */}
              <div className="flex items-center gap-1.5">
                <label className="text-[#1E40AF] font-medium w-16 text-right">产品料号</label>
                <select
                  value={matOp}
                  onChange={(e) => setMatOp(e.target.value as MatchOp)}
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    value={matFilter}
                    onChange={(e) => setMatFilter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                    placeholder="请选择"
                    className="h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-32 outline-none focus:border-[#2563EB]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 工单状态 */}
              <div className="flex items-center gap-1.5">
                <label className="text-[#1E40AF] font-medium w-16 text-right">工单状态</label>
                <select
                  value={woStatusOp}
                  onChange={(e) => setWoStatusOp(e.target.value as MatchOp)}
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <select
                  value={woStatusFilter}
                  onChange={(e) => setWoStatusFilter(e.target.value)}
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-32 outline-none cursor-pointer"
                >
                  <option value="请选择">请选择</option>
                  <option value="已下达">已下达</option>
                  <option value="未下达">未下达</option>
                </select>
              </div>

              {/* 计划单号 */}
              <div className="flex items-center gap-1.5">
                <label className="text-[#1E40AF] font-medium w-14 text-right">计划单号</label>
                <select
                  value={planNoOp}
                  onChange={(e) => setPlanNoOp(e.target.value as MatchOp)}
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={planNoFilter}
                  onChange={(e) => setPlanNoFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请输入"
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-32 outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* 线别 */}
              <div className="flex items-center gap-1.5">
                <label className="text-[#1E40AF] font-medium w-16 text-right">线别</label>
                <select
                  value={lineOp}
                  onChange={(e) => setLineOp(e.target.value as MatchOp)}
                  className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <select
                  value={lineFilter}
                  onChange={(e) => setLineFilter(e.target.value)}
                  className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-32 outline-none cursor-pointer"
                >
                  <option value="请选择">请选择</option>
                  <option value="制罐D线">制罐D线</option>
                  <option value="制罐A线">制罐A线</option>
                  <option value="制罐B线">制罐B线</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedKeys.length}</strong> 项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedItems.length}</strong> 条工单
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>工单同步</span>
            </button>
            <button
              type="button"
              onClick={() => openEditModal('add')}
              className="h-8 px-3.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#165DFF] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
            <button
              type="button"
              disabled={selectedKeys.length === 0}
              onClick={handleBatchDelete}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 ${
                selectedKeys.length === 0
                  ? 'border-[#E5E9F0] bg-gray-50 text-[#64748B] opacity-60 cursor-not-allowed'
                  : 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10 cursor-pointer'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除</span>
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allPagedSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                {visibleColumns.map((col, idx) => (
                  <th
                    key={`${String(col.key)}-${idx}`}
                    onClick={() => toggleSort(col.key)}
                    className={`p-2.5 border-b border-r border-[#E5E9F0] cursor-pointer hover:bg-[#EDF2F7]/70 select-none transition ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.highlight ? 'bg-blue-50/70 text-blue-700' : ''}`}
                  >
                    <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.label}</span>
                      <ArrowUpDown
                        className={`w-3 h-3 ${
                          sortConfig.key === col.key
                            ? 'text-[#1E40AF]'
                            : col.highlight
                            ? 'text-blue-400'
                            : 'text-[#C5C8BE]'
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
                      onClick={() => setIsColPanelOpen((prev) => !prev)}
                      className="text-[#2563EB] hover:text-[#1E293B] transition cursor-pointer"
                      title="列设置"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {pagedItems.map((row) => {
                const isSelected = selectedKeys.includes(row.key);
                return (
                  <tr
                    key={row.key}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('input')) return;
                      toggleSelectRow(row.key);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EBF2FF]/60 hover:bg-[#EBF2FF]/80' : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.key)}
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    {visibleColumns.map((col, idx) => {
                      const rawVal = row[col.key];
                      const displayVal =
                        typeof rawVal === 'number'
                          ? rawVal.toLocaleString()
                          : rawVal === undefined || rawVal === ''
                          ? '—'
                          : String(rawVal);

                      return (
                        <td
                          key={`${row.key}-${String(col.key)}-${idx}`}
                          className={`p-2.5 border-r border-[#EDF2F7] ${
                            col.align === 'right' ? 'text-right' : 'text-left'
                          } ${col.isNumeric ? 'font-mono tabular-nums font-medium' : ''} ${
                            col.highlight ? 'bg-blue-50/30 text-blue-700 font-semibold' : ''
                          }`}
                        >
                          {col.isLink ? (
                            <button
                              type="button"
                              onClick={() => openEditModal('edit', row)}
                              className="font-mono font-bold text-[#1E40AF] hover:text-[#1E293B] hover:underline cursor-pointer"
                            >
                              {displayVal}
                            </button>
                          ) : col.isStatus ? (
                            renderStatusText(displayVal, col.isStatus)
                          ) : (
                            <span
                              className={
                                displayVal === '—'
                                  ? 'text-[#C5C8BE]'
                                  : col.highlight
                                  ? 'text-blue-700'
                                  : 'text-[#1E293B]'
                              }
                            >
                              {displayVal}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td
                      className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                        isSelected ? 'bg-[#ECEEE8]' : 'bg-white'
                      }`}
                    >
                      <div className="inline-flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => openEditModal('edit', row)}
                          className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                        >
                          修改
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row)}
                          className="text-[#EA580C] hover:text-[#d96136] hover:underline font-medium cursor-pointer"
                        >
                          删除
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLayoutTitle(
                              `包装版面设计稿（${row.productName || row.materialNo}）`
                            );
                            setIsLayoutZoomed(false);
                            setIsLayoutModalOpen(true);
                          }}
                          className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-semibold cursor-pointer"
                        >
                          版面
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pagedItems.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
                    className="py-12 text-center text-[#64748B]"
                  >
                    <div className="space-y-2">
                      <p>暂无匹配的工单数据</p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-1.5 border border-[#E5E9F0] rounded-lg text-xs text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer"
                      >
                        重置筛选条件
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedItems.length}</strong> 条
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (safePage <= 1) onShowToast('已是第一页', 'warning');
                else setCurrentPage(safePage - 1);
              }}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 border border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold font-mono rounded-lg flex items-center justify-center">
              {safePage}
            </span>
            <button
              type="button"
              onClick={() => {
                if (safePage >= totalPages) onShowToast(`当前共 ${totalPages} 页`, 'warning');
                else setCurrentPage(safePage + 1);
              }}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] transition cursor-pointer"
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
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
        </div>

        {/* F4 列设置浮层 */}
        {isColPanelOpen && (
          <div className="absolute right-4 top-12 w-72 max-h-[480px] bg-white border border-[#E5E9F0] rounded-xl shadow-xl z-40 flex flex-col overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E293B]">列设置</span>
              <button
                type="button"
                onClick={() => setIsColPanelOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-1 divide-y divide-[#F4F6F9] text-xs">
              {columns.map((col, idx) => (
                <div
                  key={`${col.label}-${idx}`}
                  className={`flex items-center gap-2.5 px-3.5 py-2 transition ${
                    col.highlight ? 'bg-blue-50/80 hover:bg-blue-100/70' : 'hover:bg-[#F4F6F9]'
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
                  <button
                    type="button"
                    onClick={() => {
                      setColumns((prev) =>
                        prev.map((c, ci) => (ci === idx ? { ...c, pinned: !c.pinned } : c))
                      );
                    }}
                    title={col.pinned ? '取消固定列' : '固定列'}
                    className={`p-0.5 rounded transition cursor-pointer ${
                      col.pinned
                        ? 'text-blue-600 hover:bg-blue-100'
                        : 'text-[#B5B8AE] hover:text-[#1E40AF]'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className={`text-[10px] select-none ${
                      col.highlight ? 'text-blue-500' : 'text-[#64748B]'
                    }`}
                  >
                    ⋮⋮
                  </span>
                </div>
              ))}
            </div>
            <div className="px-3.5 py-2.5 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setColumns(INITIAL_COLUMNS);
                  onShowToast('已恢复默认列配置', 'info');
                }}
                className="px-2.5 py-1 border border-[#E5E9F0] rounded-lg text-xs text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                重置默认
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsColPanelOpen(false);
                  onShowToast('列设置已保存', 'success');
                }}
                className="px-3 py-1 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* F2 工单同步弹窗 */}
      {isSyncModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSyncModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">工单同步</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-medium text-[#1E293B]">
                  <span className="text-[#EA580C] mr-1">*</span>工单号
                </label>
                <input
                  type="text"
                  value={syncWoNo}
                  onChange={(e) => {
                    setSyncWoNo(e.target.value);
                    if (e.target.value.trim()) setSyncWoNoErr(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSyncSubmit()}
                  placeholder="请输入工单号，如 1045410"
                  className={`w-full h-9 px-3 border rounded-xl outline-none bg-white text-[#1E293B] font-mono ${
                    syncWoNoErr
                      ? 'border-[#EA580C] ring-1 ring-[#EA580C]/30'
                      : 'border-[#E5E9F0] focus:border-[#2563EB]'
                  }`}
                />
                {syncWoNoErr && <p className="text-[11px] text-[#EA580C]">请输入工单号</p>}
                <p className="text-[11px] text-[#64748B]">
                  输入上游工单号，同步后工单开始/结束日期与线体可配置
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold">业务说明：</span>
                同步工单后，工单开始/结束日期、线体、优先级与取消排产标识均可在此模块配置，配置结果将直接影响后续计划日排产运算。
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSyncSubmit}
                className="px-4 py-1.5 bg-[#165DFF] text-white rounded-xl text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                同步
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F3 修改/新增工单信息弹窗 */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {editModalMode === 'add' ? '新增-工单信息' : '修改-工单信息'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#1E40AF] shrink-0">
                      <span className="text-[#EA580C] mr-0.5">*</span>工单号
                    </label>
                    <input
                      type="text"
                      readOnly={editModalMode === 'edit'}
                      value={woForm.woNo}
                      onChange={(e) => {
                        setWoForm((prev) => ({ ...prev, woNo: e.target.value }));
                        if (e.target.value.trim()) setWoFormErrors((prev) => ({ ...prev, woNo: false }));
                      }}
                      className={`flex-1 h-8 px-2.5 border rounded-lg font-mono outline-none ${
                        editModalMode === 'edit'
                          ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                          : woFormErrors.woNo
                          ? 'bg-white text-[#1E293B] border-[#EA580C]'
                          : 'bg-white text-[#1E293B] border-[#E5E9F0] focus:border-[#2563EB]'
                      }`}
                    />
                  </div>
                  {woFormErrors.woNo && (
                    <span className="text-[11px] text-[#EA580C] pl-26 mt-0.5">请输入工单号</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#1E40AF] shrink-0">
                      <span className="text-[#EA580C] mr-0.5">*</span>产品料号
                    </label>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={woForm.materialNo}
                        onChange={(e) => {
                          setWoForm((prev) => ({ ...prev, materialNo: e.target.value }));
                          if (e.target.value.trim()) {
                            setWoFormErrors((prev) => ({ ...prev, materialNo: false }));
                          }
                        }}
                        placeholder="请选择"
                        className={`w-full h-8 pl-2.5 pr-7 border rounded-lg bg-white text-[#1E293B] font-mono outline-none ${
                          woFormErrors.materialNo
                            ? 'border-[#EA580C]'
                            : 'border-[#E5E9F0] focus:border-[#2563EB]'
                        }`}
                      />
                      <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>
                  {woFormErrors.materialNo && (
                    <span className="text-[11px] text-[#EA580C] pl-26 mt-0.5">请选择产品料号</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">产品名称</label>
                  <input
                    type="text"
                    value={woForm.productName}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, productName: e.target.value }))}
                    placeholder="请输入"
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#1E293B] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">产品规格</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.productSpec}
                    placeholder="请输入"
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">产品版本</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.productVersion}
                    placeholder="请输入"
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">
                    <span className="text-[#EA580C] mr-0.5">*</span>计划数量
                  </label>
                  <input
                    type="number"
                    value={woForm.planQty}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, planQty: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono tabular-nums outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">工单类型</label>
                  <select
                    value={woForm.woType}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, woType: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
                  >
                    <option value="量产">量产</option>
                    <option value="试产">试产</option>
                    <option value="返工">返工</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">
                    <span className="text-[#EA580C] mr-0.5">*</span>车间
                  </label>
                  <select
                    value={woForm.workshop}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, workshop: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
                  >
                    <option value="中山制罐车间">中山制罐车间</option>
                    <option value="成都制罐车间">成都制罐车间</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">客户名称</label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={woForm.customerShort}
                      onChange={(e) => setWoForm((prev) => ({ ...prev, customerShort: e.target.value }))}
                      placeholder="请选择"
                      className="w-full h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#1E293B] outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">计划交货日期</label>
                  <input
                    type="date"
                    value={woForm.deliveryDate}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">预计开工时间</label>
                  <input
                    type="datetime-local"
                    value={woForm.planStartTime}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, planStartTime: e.target.value }))}
                    className="flex-1 h-8 px-2 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">预计完工时间</label>
                  <input
                    type="datetime-local"
                    value={woForm.planEndTime}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, planEndTime: e.target.value }))}
                    className="flex-1 h-8 px-2 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">销售单号</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.soNo}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">计划单号</label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={woForm.planNo}
                      onChange={(e) => setWoForm((prev) => ({ ...prev, planNo: e.target.value }))}
                      placeholder="请选择"
                      className="w-full h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#1E293B] font-mono outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">SAP版本号</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.sapVersion}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">生产阶段</label>
                  <select
                    value={woForm.prodStage}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, prodStage: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
                  >
                    <option value="生产通用">生产通用</option>
                    <option value="拉伸">拉伸</option>
                    <option value="彩印">彩印</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">线别</label>
                  <select
                    value={woForm.line}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, line: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
                  >
                    <option value="制罐D线">制罐D线</option>
                    <option value="制罐A线">制罐A线</option>
                    <option value="制罐B线">制罐B线</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">SAP生产订单号</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.sapOrderNo}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">工艺版本</label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={woForm.craftVersion}
                      onChange={(e) => setWoForm((prev) => ({ ...prev, craftVersion: e.target.value }))}
                      className="w-full h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">优先级</label>
                  <input
                    type="number"
                    min={1}
                    value={woForm.priority}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, priority: e.target.value }))}
                    placeholder="请输入"
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono tabular-nums outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">取消排产标识</label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={woForm.cancelSchedule}
                    onClick={() => {
                      const next = !woForm.cancelSchedule;
                      setWoForm((prev) => ({ ...prev, cancelSchedule: next }));
                      onShowToast(next ? '已标记取消排产' : '已取消标记', 'info');
                    }}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                      woForm.cancelSchedule ? 'bg-[#EA580C]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                        woForm.cancelSchedule ? 'translate-x-5 left-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Remark */}
              <div className="space-y-1">
                <label className="block font-medium text-[#1E40AF]">备注</label>
                <textarea
                  value={woForm.remark}
                  onChange={(e) => setWoForm((prev) => ({ ...prev, remark: e.target.value }))}
                  maxLength={150}
                  placeholder="请输入"
                  rows={2}
                  className="w-full p-2.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] outline-none focus:border-[#2563EB] resize-y"
                />
                <div className="text-right text-[11px] font-mono text-[#64748B]">
                  {woForm.remark.length} / 150
                </div>
              </div>

              {/* 工单BOM */}
              <div className="space-y-2.5 pt-2 border-t border-[#EDF2F7]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-bold text-[#1E40AF] border-b-2 border-[#165DFF] pb-1">
                    工单BOM
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddBomRow}
                      className="px-2.5 py-1 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>新增</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadProductBom}
                      className="px-2.5 py-1 border border-[#E5E9F0] bg-white text-[#1E40AF] rounded-lg hover:bg-[#EDF2F7] transition cursor-pointer"
                    >
                      加载产品BOM
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchDeleteBom}
                      className="px-2.5 py-1 border border-[#EA580C]/50 bg-white text-[#EA580C] rounded-lg hover:bg-[#EA580C]/10 transition cursor-pointer"
                    >
                      - 批量删除
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#E5E9F0] rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
                      <tr>
                        <th className="p-2 border-b border-r border-[#E5E9F0] w-9 text-center">
                          <input
                            type="checkbox"
                            checked={
                              bomItems.length > 0 &&
                              bomItems.every((b) => selectedBomIds.includes(b.id))
                            }
                            onChange={(e) =>
                              setSelectedBomIds(e.target.checked ? bomItems.map((b) => b.id) : [])
                            }
                            className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                          />
                        </th>
                        <th className="p-2 border-b border-r border-[#E5E9F0] w-14">项次</th>
                        <th className="p-2 border-b border-r border-[#E5E9F0] w-32">
                          <span className="text-[#EA580C] mr-0.5">*</span>用料阶段
                        </th>
                        <th className="p-2 border-b border-r border-[#E5E9F0] w-36">
                          <span className="text-[#EA580C] mr-0.5">*</span>物料料号
                        </th>
                        <th className="p-2 border-b border-r border-[#E5E9F0]">物料名称</th>
                        <th className="p-2 border-b border-r border-[#E5E9F0]">物料规格</th>
                        <th className="p-2 border-b border-[#E5E9F0] w-24 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF2F7]">
                      {bomItems.map((bom) => (
                        <tr key={bom.id} className="hover:bg-[#F4F6F9]">
                          <td className="p-2 border-r border-[#EDF2F7] text-center">
                            <input
                              type="checkbox"
                              checked={selectedBomIds.includes(bom.id)}
                              onChange={(e) =>
                                setSelectedBomIds((prev) =>
                                  e.target.checked
                                    ? [...prev, bom.id]
                                    : prev.filter((id) => id !== bom.id)
                                )
                              }
                              className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                            />
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7] font-mono text-[#1E40AF]">
                            {bom.seq}
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7]">
                            <select
                              value={bom.stage}
                              onChange={(e) =>
                                setBomItems((prev) =>
                                  prev.map((x) =>
                                    x.id === bom.id ? { ...x, stage: e.target.value } : x
                                  )
                                )
                              }
                              className="w-full h-7 px-1.5 border border-[#E5E9F0] rounded bg-white text-[#1E293B]"
                            >
                              <option value="生产通用">生产通用</option>
                              <option value="拉伸">拉伸</option>
                              <option value="彩印">彩印</option>
                            </select>
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7]">
                            <input
                              type="text"
                              value={bom.materialNo}
                              onChange={(e) =>
                                setBomItems((prev) =>
                                  prev.map((x) =>
                                    x.id === bom.id ? { ...x, materialNo: e.target.value } : x
                                  )
                                )
                              }
                              placeholder="请选择"
                              className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white font-mono text-[#1E293B]"
                            />
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7] text-[#1E40AF]">
                            {bom.materialName || '—'}
                          </td>
                          <td className="p-2 border-r border-[#EDF2F7] text-[#64748B] font-mono">
                            {bom.spec || '—'}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setLayoutTitle(
                                  `包装版面设计稿（${bom.materialName || bom.materialNo || '206*250'}）`
                                );
                                setIsLayoutZoomed(false);
                                setIsLayoutModalOpen(true);
                              }}
                              className="text-[#1E40AF] hover:underline font-medium cursor-pointer"
                            >
                              查看图片
                            </button>
                          </td>
                        </tr>
                      ))}
                      {bomItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-[#64748B]">
                            暂无 BOM 明细，可点击「加载产品BOM」或「+ 新增」添加
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveWo}
                className="px-5 py-1.5 bg-[#165DFF] text-white rounded-xl text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F5 版面图片弹窗 */}
      {isLayoutModalOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLayoutModalOpen(false);
          }}
        >
          <div
            className={`bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl overflow-hidden transition-all ${
              isLayoutZoomed ? 'w-full max-w-2xl' : 'w-full max-w-md'
            }`}
          >
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">版面图片</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsLayoutZoomed((prev) => !prev)}
                  className="p-1.5 text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg cursor-pointer"
                  title={isLayoutZoomed ? '缩小' : '放大查看'}
                >
                  {isLayoutZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsLayoutModalOpen(false)}
                  className="p-1.5 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-[#FFFFFF] border border-[#E5E9F0] rounded-xl p-4 flex flex-col items-center justify-center">
                <img
                  src={LAYOUT_PREVIEW_IMAGE}
                  alt="版面图片"
                  onClick={() => setIsLayoutZoomed((prev) => !prev)}
                  className={`object-contain rounded-lg transition-all ${
                    isLayoutZoomed ? 'w-96 h-96 cursor-zoom-out' : 'w-64 h-72 cursor-zoom-in'
                  }`}
                />
                <p className="mt-3 text-xs font-medium text-[#1E40AF] text-center">{layoutTitle}</p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsLayoutModalOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* P0 流程总览弹窗 */}
      {isFlowModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFlowModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">工单管理 · 页面流程总览</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFlowModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-[#F4F6F9] space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => setIsFlowModalOpen(false)}
                  className="text-left bg-white border border-[#E5E9F0] hover:border-[#165DFF] rounded-xl p-4 transition shadow-2xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-mono text-[#2563EB] mb-1">P1 · 主页面</div>
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">工单管理列表</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      按组织机构、预计开工时间、下达状态等筛选工单，支持同步、新增、批量删除、修改与版面查看。
                    </p>
                  </div>
                  <span className="text-[#1E40AF] font-bold mt-3 inline-block">返回列表 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    setIsSyncModalOpen(true);
                  }}
                  className="text-left bg-white border border-[#E5E9F0] hover:border-[#165DFF] rounded-xl p-4 transition shadow-2xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-mono text-[#EA580C] mb-1">F2 · 弹窗</div>
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">工单同步</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      输入工单号从上游同步工单数据。同步后工单的开始/结束日期、线体等可被配置。
                    </p>
                  </div>
                  <span className="text-[#1E40AF] font-bold mt-3 inline-block">打开同步 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    openEditModal('edit', items[0]);
                  }}
                  className="text-left bg-white border border-[#E5E9F0] hover:border-[#165DFF] rounded-xl p-4 transition shadow-2xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-mono text-[#EA580C] mb-1">F3 · 弹窗</div>
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">修改-工单信息</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      编辑工单主信息与工单 BOM 明细，包含优先级、取消排产标识、SAP 生产订单号等字段。
                    </p>
                  </div>
                  <span className="text-[#1E40AF] font-bold mt-3 inline-block">打开编辑 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    setIsLayoutZoomed(false);
                    setIsLayoutModalOpen(true);
                  }}
                  className="text-left bg-white border border-[#E5E9F0] hover:border-[#165DFF] rounded-xl p-4 transition shadow-2xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-mono text-[#EA580C] mb-1">F4 / F5 · 浮层</div>
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">列设置 / 版面图片</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      列设置控制 27 个列表字段显隐；BOM 行「查看图片」或列表「版面」打开包装设计稿。
                    </p>
                  </div>
                  <span className="text-[#1E40AF] font-bold mt-3 inline-block">查看版面 →</span>
                </button>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-amber-900 leading-relaxed">
                <strong>业务说明：</strong>
                同步工单后，工单开始、结束日期与选择线体可以配置（含工单优先级、取消排产标识等），直接影响后续日排产计算。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-sm p-5 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#EA580C]/15 text-[#EA580C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#1E293B]">{confirmState.title}</h4>
              <p className="text-xs text-[#1E40AF] leading-relaxed">{confirmState.desc}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmState({ isOpen: false, title: '', desc: '', onConfirm: null })}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.onConfirm?.();
                  setConfirmState({ isOpen: false, title: '', desc: '', onConfirm: null });
                }}
                className="px-4 py-1.5 bg-[#EA580C] text-white rounded-xl text-xs font-medium hover:bg-[#e06a40] cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
