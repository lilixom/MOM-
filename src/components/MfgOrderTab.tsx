import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  RotateCcw,
  Download,
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
  Pin,
  ExternalLink,
  Clock,
  CheckCircle2,
  ArrowDown,
  Layers,
  Edit3,
  Eye,
} from 'lucide-react';
import { MfgOrderItem } from '../types';
import { DEFAULT_MFG_BOM, DEFAULT_MFG_CTRL, DEFAULT_MFG_PACE } from '../mockData';

interface MfgOrderTabProps {
  items: MfgOrderItem[];
  onUpdateItems: (items: MfgOrderItem[]) => void;
  onNavigateToPlanOrder?: () => void;
  onNavigateToWorkOrder?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;
type ViewTabKey = 'base' | 'bom' | 'ctrl' | 'log' | 'pace' | 'esop';

interface ColumnConfig {
  key: keyof MfgOrderItem;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
  sortable?: boolean;
  isNumeric?: boolean;
  isLink?: boolean;
  statusKind?: 'mo' | 'audit';
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'org', label: '组织机构', visible: true },
  { key: 'line', label: '线别', visible: true },
  { key: 'moNo', label: '制令单号', visible: true, sortable: true, isLink: true },
  { key: 'status', label: '状态', visible: true, sortable: true, statusKind: 'mo' },
  { key: 'materialNo', label: '产品料号', visible: true, sortable: true },
  { key: 'productName', label: '产品名称', visible: true },
  { key: 'productVersion', label: '产品版本', visible: true },
  { key: 'planQty', label: '计划数量', visible: true, isNumeric: true },
  { key: 'inputQty', label: '投入数量', visible: true, isNumeric: true },
  { key: 'outputQty', label: '产出数量', visible: true, isNumeric: true },
  { key: 'scrapQty', label: '报废数量', visible: true, isNumeric: true },
  { key: 'planStartTime', label: '预计开工时间', visible: true },
  { key: 'planEndTime', label: '预计完工时间', visible: true, highlight: true },
  { key: 'woNo', label: '工单号', visible: true },
  { key: 'customer', label: '客户', visible: true },
  { key: 'soNo', label: '销售单号', visible: true },
  { key: 'releaseBy', label: '下达人', visible: true },
  { key: 'releaseTime', label: '下达时间', visible: true },
  { key: 'modBy', label: '修改人', visible: true },
  { key: 'modTime', label: '修改时间', visible: true, highlight: true },
  { key: 'morningHours', label: '早班工时', visible: true, isNumeric: true },
  { key: 'eveningHours', label: '晚班工时', visible: true, isNumeric: true },
  { key: 'prodHours', label: '生产工时', visible: true, isNumeric: true },
  { key: 'qaStatus', label: '品质审核标识', visible: true, statusKind: 'audit' },
  { key: 'qaBy', label: '品质审核人', visible: true },
  { key: 'qaTime', label: '品质审核时间', visible: true },
  { key: 'prodAuditStatus', label: '生产审核标识', visible: true, statusKind: 'audit' },
  { key: 'prodAuditBy', label: '生产审核人', visible: true },
  { key: 'prodAuditTime', label: '生产审核时间', visible: true },
  { key: 'totalHours', label: '总工时', visible: true, isNumeric: true },
  { key: 'actualProdHours', label: '实际生产工时', visible: true, isNumeric: true },
];

export const MfgOrderTab: React.FC<MfgOrderTabProps> = ({
  items,
  onUpdateItems,
  onNavigateToPlanOrder,
  onNavigateToWorkOrder,
  onShowToast,
}) => {
  // Filter states
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [moNoOp, setMoNoOp] = useState<MatchOp>('contains');
  const [moNoFilter, setMoNoFilter] = useState('');
  const [matOp, setMatOp] = useState<MatchOp>('contains');
  const [matFilter, setMatFilter] = useState('');

  const [lineOp, setLineOp] = useState<MatchOp>('contains');
  const [lineFilter, setLineFilter] = useState('');
  const [statusOp, setStatusOp] = useState<MatchOp>('contains');
  const [statusFilter, setStatusFilter] = useState('请选择');
  const [woNoOp, setWoNoOp] = useState<MatchOp>('contains');
  const [woNoFilter, setWoNoFilter] = useState('');

  const [startDateFilter, setStartDateFilter] = useState('2026-11-18T00:00');
  const [endDateFilter, setEndDateFilter] = useState('2026-11-19T11:28');

  const [appliedFilters, setAppliedFilters] = useState({
    org: '请选择',
    moNoOp: 'contains' as MatchOp,
    moNo: '',
    matOp: 'contains' as MatchOp,
    mat: '',
    lineOp: 'contains' as MatchOp,
    line: '',
    statusOp: 'contains' as MatchOp,
    status: '请选择',
    woNoOp: 'contains' as MatchOp,
    woNo: '',
    startDate: '',
    endDate: '',
  });

  // Selection, Sorting, Pagination
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof MfgOrderItem | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Column settings (F3)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // Flow overview (P0)
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);

  // F4 row "更多" menu state
  const [openMoreKey, setOpenMoreKey] = useState<string | null>(null);

  // F2 查看弹窗
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTabKey>('base');
  const [viewItem, setViewItem] = useState<MfgOrderItem | null>(null);
  const [viewRemark, setViewRemark] = useState('');
  const [viewStartInput, setViewStartInput] = useState('');
  const [viewEndInput, setViewEndInput] = useState('');
  const [viewLineInput, setViewLineInput] = useState('');
  const [viewCtrlTypeInput, setViewCtrlTypeInput] = useState('');
  const [viewMaxRepairInput, setViewMaxRepairInput] = useState('');
  const [selectedBomSeqs, setSelectedBomSeqs] = useState<number[]>([]);
  const [selectedCtrlSeqs, setSelectedCtrlSeqs] = useState<number[]>([]);

  // F6 工艺流程弹窗
  const [isCraftFlowModalOpen, setIsCraftFlowModalOpen] = useState(false);

  // F5 修改弹窗
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    prodStage: '生产通用',
    moNo: '',
    materialNo: '',
    productVersion: '01',
    productName: '',
    productSpec: '209#360ML',
    customer: '',
    line: '制罐A线',
    planQty: '310000',
    planStartTime: '',
    planEndTime: '',
    ctrlType: '',
    craftName: '制罐工艺',
    startOp: '制罐工序',
    endOp: '制罐工序',
    releaseTime: '',
    releaseBy: '',
    maxRepairCount: '',
    remark: '',
  });
  const [editErrors, setEditErrors] = useState({ moNo: false, materialNo: false, craftName: false });

  // 修改生产时间快捷弹窗 (from F4 更多)
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [editTimeTargetKey, setEditTimeTargetKey] = useState<string | null>(null);
  const [editTimeStart, setEditTimeStart] = useState('');
  const [editTimeEnd, setEditTimeEnd] = useState('');

  // Confirm Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    desc: '',
    onConfirm: () => {},
  });

  // Close F4 dropdown on outside click / Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMoreKey(null);
        setIsColPanelOpen(false);
        setIsCraftFlowModalOpen(false);
        setIsEditTimeModalOpen(false);
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    const matchText = (val: string, query: string, op: MatchOp) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const v = (val || '').toLowerCase();
      return op === 'equals' ? v === q : v.includes(q);
    };

    const result = items.filter((item) => {
      if (appliedFilters.org !== '请选择' && item.org !== appliedFilters.org) return false;
      if (!matchText(item.moNo, appliedFilters.moNo, appliedFilters.moNoOp)) return false;
      if (!matchText(item.materialNo, appliedFilters.mat, appliedFilters.matOp)) return false;
      if (!matchText(item.line, appliedFilters.line, appliedFilters.lineOp)) return false;
      if (appliedFilters.status !== '请选择' && !matchText(item.status, appliedFilters.status, appliedFilters.statusOp)) return false;
      if (!matchText(item.woNo, appliedFilters.woNo, appliedFilters.woNoOp)) return false;

      if (appliedFilters.startDate || appliedFilters.endDate) {
        const itemDate = item.planStartTime.replace(' ', 'T');
        if (appliedFilters.startDate && itemDate < appliedFilters.startDate) return false;
        if (appliedFilters.endDate && itemDate > appliedFilters.endDate) return false;
      }
      return true;
    });

    if (sortConfig.key && sortConfig.dir) {
      const k = sortConfig.key;
      const dir = sortConfig.dir === 'asc' ? 1 : -1;
      return [...result].sort((a, b) => {
        const va = a[k] ?? '';
        const vb = b[k] ?? '';
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir;
        }
        return String(va).localeCompare(String(vb), 'zh-CN') * dir;
      });
    }

    return result;
  }, [items, appliedFilters, sortConfig]);

  // Totals
  const totals = useMemo(() => {
    const plan = filteredItems.reduce((acc, r) => acc + (r.planQty || 0), 0);
    const input = filteredItems.reduce((acc, r) => acc + (r.inputQty || 0), 0);
    const output = filteredItems.reduce((acc, r) => acc + (r.outputQty || 0), 0);
    return { plan, input, output, all: plan + input + output };
  }, [filteredItems]);

  // Pagination
  const totalCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, safePage, pageSize]);

  // Visible columns sorted by pinned first
  const visibleColumns = useMemo(() => {
    const visible = columns.filter((c) => c.visible);
    const pinned = visible.filter((c) => c.pinned);
    const unpinned = visible.filter((c) => !c.pinned);
    return [...pinned, ...unpinned];
  }, [columns]);

  // Handlers
  const handleQuery = () => {
    setAppliedFilters({
      org: orgFilter,
      moNoOp,
      moNo: moNoFilter,
      matOp,
      mat: matFilter,
      lineOp,
      line: lineFilter,
      statusOp,
      status: statusFilter,
      woNoOp,
      woNo: woNoFilter,
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
    onShowToast('查询成功，已刷新制令单列表', 'success');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setMoNoOp('contains');
    setMoNoFilter('');
    setMatOp('contains');
    setMatFilter('');
    setLineOp('contains');
    setLineFilter('');
    setStatusOp('contains');
    setStatusFilter('请选择');
    setWoNoOp('contains');
    setWoNoFilter('');
    setStartDateFilter('2026-11-18T00:00');
    setEndDateFilter('2026-11-19T11:28');
    setAppliedFilters({
      org: '请选择',
      moNoOp: 'contains',
      moNo: '',
      matOp: 'contains',
      mat: '',
      lineOp: 'contains',
      line: '',
      statusOp: 'contains',
      status: '请选择',
      woNoOp: 'contains',
      woNo: '',
      startDate: '',
      endDate: '',
    });
    setSortConfig({ key: null, dir: null });
    setCurrentPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const handleSort = (key: keyof MfgOrderItem) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return { key: null, dir: null };
    });
  };

  const allOnPageSelected =
    pagedItems.length > 0 && pagedItems.every((r) => selectedKeys.includes(r.key));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      const pageSet = new Set(pagedItems.map((r) => r.key));
      setSelectedKeys((prev) => prev.filter((k) => !pageSet.has(k)));
    } else {
      const merged = new Set([...selectedKeys, ...pagedItems.map((r) => r.key)]);
      setSelectedKeys(Array.from(merged));
    }
  };

  const toggleSelectRow = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Export CSV
  const handleExport = () => {
    if (filteredItems.length === 0) {
      onShowToast('当前无数据可导出', 'warning');
      return;
    }
    const headers = visibleColumns.map((c) => c.label);
    const csvRows = [
      headers.join(','),
      ...filteredItems.map((row) =>
        visibleColumns
          .map((c) => {
            const val = row[c.key] ?? '';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `制令单信息_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`已导出 ${filteredItems.length} 条制令单记录（CSV）`, 'success');
  };

  // Open F2 查看弹窗
  const openViewModal = (row: MfgOrderItem) => {
    setOpenMoreKey(null);
    setViewItem(row);
    setViewTab('base');
    setViewRemark(
      row.remark ??
        '用(侯洋) 209#-0.25mm-FA全开盖-素面盖-，福建彩印铁批次2008732，测试武钢基板，详见联络单'
    );
    setViewStartInput(row.planStartTime || '2025-01-02 08:30:00');
    setViewEndInput(row.planEndTime || '2025-01-02 20:30:00');
    setViewLineInput(row.line || '制罐A线');
    setViewCtrlTypeInput(row.ctrlType || '');
    setViewMaxRepairInput(row.maxRepairCount || '');
    setSelectedBomSeqs([]);
    setSelectedCtrlSeqs([]);
    setIsViewModalOpen(true);
  };

  // Open F5 修改弹窗
  const openEditModal = (row: MfgOrderItem) => {
    setOpenMoreKey(null);
    setEditingKey(row.key);
    setEditErrors({ moNo: false, materialNo: false, craftName: false });
    setEditForm({
      prodStage: row.prodStage || '生产通用',
      moNo: row.moNo,
      materialNo: row.materialNo,
      productVersion: row.productVersion || '01',
      productName: row.productName,
      productSpec: row.productSpec || '209#360ML',
      customer: row.customer || '可口可乐（中国）有限公司',
      line: row.line || '制罐A线',
      planQty: String(row.planQty ?? 0),
      planStartTime: row.planStartTime,
      planEndTime: row.planEndTime,
      ctrlType: row.ctrlType || '',
      craftName: row.craftName || '制罐工艺',
      startOp: row.startOp || '制罐工序',
      endOp: row.endOp || '制罐工序',
      releaseTime: row.releaseTime,
      releaseBy: row.releaseBy,
      maxRepairCount: row.maxRepairCount || '',
      remark:
        row.remark ??
        '用(侯洋) 209#-0.25mm-FA全开盖-素面盖-，福建彩印铁批次2008732，测试武钢基板，详见联络单',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    const moErr = !editForm.moNo.trim();
    const matErr = !editForm.materialNo.trim();
    const craftErr = !editForm.craftName.trim();
    if (moErr || matErr || craftErr) {
      setEditErrors({ moNo: moErr, materialNo: matErr, craftName: craftErr });
      onShowToast('请补全必填项（制令单号 / 产品料号 / 工艺）', 'error');
      return;
    }
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const planQtyNum = parseFloat(editForm.planQty) || 0;

    if (editingKey) {
      onUpdateItems(
        items.map((item) => {
          if (item.key !== editingKey) return item;
          return {
            ...item,
            prodStage: editForm.prodStage,
            moNo: editForm.moNo.trim(),
            materialNo: editForm.materialNo.trim(),
            customer: editForm.customer.trim() || item.customer,
            line: editForm.line,
            planQty: planQtyNum,
            planStartTime: editForm.planStartTime,
            planEndTime: editForm.planEndTime,
            ctrlType: editForm.ctrlType,
            craftName: editForm.craftName.trim(),
            maxRepairCount: editForm.maxRepairCount,
            remark: editForm.remark,
            modBy: '系统管理员',
            modTime: nowStr,
          };
        })
      );
      onShowToast(`制令单 ${editForm.moNo.trim()} 修改已保存`, 'success');
    }
    setIsEditModalOpen(false);
  };

  // Delete single / batch
  const handleDeleteRow = (row: MfgOrderItem) => {
    setOpenMoreKey(null);
    setConfirmState({
      isOpen: true,
      title: '删除制令单',
      desc: `确认删除制令单「${row.moNo}」？删除后不可恢复，是否继续？`,
      onConfirm: () => {
        onUpdateItems(items.filter((i) => i.key !== row.key));
        setSelectedKeys((prev) => prev.filter((k) => k !== row.key));
        onShowToast(`已删除制令单 ${row.moNo}`, 'success');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedKeys.length === 0) {
      onShowToast('请先勾选需要删除的制令单', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      desc: `将删除选中的 ${selectedKeys.length} 条制令单，删除后不可恢复，是否继续？`,
      onConfirm: () => {
        const delSet = new Set(selectedKeys);
        onUpdateItems(items.filter((i) => !delSet.has(i.key)));
        setSelectedKeys([]);
        onShowToast(`已批量删除 ${delSet.size} 条制令单`, 'success');
      },
    });
  };

  // F4 actions: 品质审核 / 生产审核 / 修改生产时间
  const handleQualityAudit = (row: MfgOrderItem) => {
    setOpenMoreKey(null);
    const nextStatus = row.qaStatus === '已审核' ? '未审核' : '已审核';
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setConfirmState({
      isOpen: true,
      title: '品质审核',
      desc: `确认将制令单「${row.moNo}」的品质审核状态变更为「${nextStatus}」？`,
      onConfirm: () => {
        onUpdateItems(
          items.map((item) =>
            item.key === row.key
              ? {
                  ...item,
                  qaStatus: nextStatus,
                  qaBy: '系统管理员',
                  qaTime: nextStatus === '已审核' ? nowStr : '',
                }
              : item
          )
        );
        onShowToast(`制令单 ${row.moNo} 品质审核已更新为「${nextStatus}」`, 'success');
      },
    });
  };

  const handleProduceAudit = (row: MfgOrderItem) => {
    setOpenMoreKey(null);
    const nextStatus = row.prodAuditStatus === '已审核' ? '未审核' : '已审核';
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setConfirmState({
      isOpen: true,
      title: '生产审核',
      desc: `确认将制令单「${row.moNo}」的生产审核状态变更为「${nextStatus}」？`,
      onConfirm: () => {
        onUpdateItems(
          items.map((item) =>
            item.key === row.key
              ? {
                  ...item,
                  prodAuditStatus: nextStatus,
                  prodAuditBy: '系统管理员',
                  prodAuditTime: nextStatus === '已审核' ? nowStr : '',
                }
              : item
          )
        );
        onShowToast(`制令单 ${row.moNo} 生产审核已更新为「${nextStatus}」`, 'success');
      },
    });
  };

  const openEditTimeModal = (row: MfgOrderItem) => {
    setOpenMoreKey(null);
    setEditTimeTargetKey(row.key);
    setEditTimeStart(row.planStartTime);
    setEditTimeEnd(row.planEndTime);
    setIsEditTimeModalOpen(true);
  };

  const handleSaveEditTime = () => {
    if (!editTimeStart.trim() || !editTimeEnd.trim()) {
      onShowToast('请填写完整的预计开工与完工时间', 'warning');
      return;
    }
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (editTimeTargetKey) {
      onUpdateItems(
        items.map((item) =>
          item.key === editTimeTargetKey
            ? {
                ...item,
                planStartTime: editTimeStart.trim(),
                planEndTime: editTimeEnd.trim(),
                modBy: '系统管理员',
                modTime: nowStr,
              }
            : item
        )
      );
      onShowToast('生产时间已更新', 'success');
    }
    setIsEditTimeModalOpen(false);
  };

  // Column move up/down in F3
  const moveColumn = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= columns.length) return;
    setColumns((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const renderStatusText = (val: string, kind: 'mo' | 'audit') => {
    if (kind === 'mo') {
      if (val === '生产中') {
        return <span className="font-semibold text-emerald-700">{val}</span>;
      }
      if (val === '关结') {
        return <span className="font-semibold text-amber-700">{val}</span>;
      }
      return <span className="text-[#64748B]">{val}</span>;
    }
    if (val === '已审核') {
      return <span className="font-semibold text-emerald-700">{val}</span>;
    }
    return <span className="text-[#64748B]">{val}</span>;
  };

  const activeMoNo = viewItem?.moNo || items[0]?.moNo || '1015314-05001';

  return (
    <div
      className="space-y-4 relative"
      onClick={() => {
        if (openMoreKey) setOpenMoreKey(null);
      }}
    >

      {/* Filter Panel */}
      <div className="bg-[#FFFFFF] border border-[#E5E9F0] rounded-2xl p-4 space-y-3 shadow-2xs">
        {/* Line 1: 组织机构 / 制令单号 / 产品料号 + Query Ops */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#475569] font-medium w-16 text-right shrink-0">组织机构</span>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] min-w-[165px]"
            >
              <option value="请选择">请选择</option>
              <option value="昇兴集团-中山制罐工厂">昇兴集团-中山制罐工厂</option>
              <option value="昇兴集团-成都制罐工厂">昇兴集团-成都制罐工厂</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#475569] font-medium w-16 text-right shrink-0">制令单号</span>
            <select
              value={moNoOp}
              onChange={(e) => setMoNoOp(e.target.value as MatchOp)}
              className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
            >
              <option value="contains">包含</option>
              <option value="equals">等于</option>
            </select>
            <input
              type="text"
              value={moNoFilter}
              onChange={(e) => setMoNoFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="请输入"
              className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] w-36 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#475569] font-medium w-16 text-right shrink-0">产品料号</span>
            <select
              value={matOp}
              onChange={(e) => setMatOp(e.target.value as MatchOp)}
              className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
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
                className="h-8 pl-2.5 pr-7 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] w-36 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleReset}
              className="h-8 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-[#1E40AF] font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
            <button
              onClick={handleQuery}
              className="h-8 px-4 rounded-lg bg-[#165DFF] hover:bg-[#0E4FD6] text-[#FFFFFF] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsColPanelOpen((v) => !v);
              }}
              title="列设置"
              className="h-8 w-8 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-[#1E40AF] flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Lines 2 & 3 */}
        {!filterCollapsed && (
          <>
            <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-[#EDF2F7]">
              <div className="flex items-center gap-1.5">
                <span className="text-[#475569] font-medium w-16 text-right shrink-0">生产线条</span>
                <select
                  value={lineOp}
                  onChange={(e) => setLineOp(e.target.value as MatchOp)}
                  className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={lineFilter}
                  onChange={(e) => setLineFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请选择（如 制罐A线）"
                  className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] w-40"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#475569] font-medium w-16 text-right shrink-0">状态</span>
                <select
                  value={statusOp}
                  onChange={(e) => setStatusOp(e.target.value as MatchOp)}
                  className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                >
                  <option value="contains">包含</option>
                  <option value="equals">等于</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] min-w-[120px]"
                >
                  <option value="请选择">请选择</option>
                  <option value="关结">关结</option>
                  <option value="生产中">生产中</option>
                  <option value="未下达">未下达</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#475569] font-medium w-16 text-right shrink-0">工单号</span>
                <select
                  value={woNoOp}
                  onChange={(e) => setWoNoOp(e.target.value as MatchOp)}
                  className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
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
                  className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] w-36 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-[#EDF2F7]">
              <span className="text-[#475569] font-medium w-20 text-right shrink-0">预计开工时间</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="datetime-local"
                  value={startDateFilter}
                  onChange={(e) => {
                    setStartDateFilter(e.target.value);
                    setAppliedFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                      endDate: endDateFilter,
                    }));
                  }}
                  className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] font-mono text-xs"
                />
                <span className="text-[#64748B]">~</span>
                <input
                  type="datetime-local"
                  value={endDateFilter}
                  onChange={(e) => {
                    setEndDateFilter(e.target.value);
                    setAppliedFilters((prev) => ({
                      ...prev,
                      startDate: startDateFilter,
                      endDate: e.target.value,
                    }));
                  }}
                  className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] font-mono text-xs"
                />
              </div>
              {appliedFilters.startDate || appliedFilters.endDate ? (
                <button
                  onClick={() =>
                    setAppliedFilters((prev) => ({ ...prev, startDate: '', endDate: '' }))
                  }
                  className="text-[#64748B] hover:text-[#1E293B] underline cursor-pointer whitespace-nowrap"
                >
                  清除时间筛选
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* Data Table Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E9F0] rounded-2xl overflow-hidden shadow-2xs">
        {/* Table Toolbar */}
        <div className="px-4 py-3 border-b border-[#E5E9F0] flex flex-wrap items-center justify-between gap-2 bg-[#F4F6F9]/60">
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <span>已选</span>
            <span className="font-mono font-bold text-[#1E40AF] tabular-nums">{selectedKeys.length}</span>
            <span>项</span>
            <span className="text-[#CBD5E1]">·</span>
            <span>共</span>
            <span className="font-mono font-bold text-[#1E293B] tabular-nums">{totalCount}</span>
            <span>条制令单</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="h-8 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E40AF] flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>

            <button
              onClick={handleBatchDelete}
              disabled={selectedKeys.length === 0}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                selectedKeys.length > 0
                  ? 'border-red-300 bg-white hover:bg-red-50 text-red-600 cursor-pointer'
                  : 'border-[#E5E9F0] bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除</span>
            </button>
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[#F7F9FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                <th className="w-10 px-3 py-2.5 text-center border-r border-[#E5E9F0]/70 sticky left-0 bg-[#F7F9FC] z-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                  />
                </th>

                {visibleColumns.map((col) => {
                  const isSorted = sortConfig.key === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-3 py-2.5 font-semibold border-r border-[#E5E9F0]/70 cursor-pointer select-none hover:bg-[#E2E8F0] transition ${
                        col.isNumeric ? 'text-right' : 'text-left'
                      } ${col.highlight ? 'text-blue-700 bg-blue-50/40' : ''}`}
                    >
                      <div
                        className={`flex items-center gap-1 ${
                          col.isNumeric ? 'justify-end' : 'justify-between'
                        }`}
                      >
                        <span>{col.label}</span>
                        {(col.sortable || isSorted) && (
                          <ArrowUpDown
                            className={`w-3 h-3 shrink-0 ${
                              isSorted ? 'text-[#1E40AF]' : 'text-[#94A3B8]'
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}

                <th className="px-3 py-2.5 text-center font-semibold sticky right-0 bg-[#F7F9FC] z-10 border-l border-[#E5E9F0] min-w-[205px]">
                  <div className="flex items-center justify-center gap-2">
                    <span>操作</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsColPanelOpen((v) => !v);
                      }}
                      title="列设置"
                      className="text-[#2563EB] hover:text-[#1E293B] cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEF2F7]">
              {pagedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
                    className="py-12 text-center text-[#64748B]"
                  >
                    <div className="space-y-2">
                      <p>未查询到匹配的制令单数据</p>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E40AF] cursor-pointer"
                      >
                        重置筛选条件
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedItems.map((row) => {
                  const isSelected = selectedKeys.includes(row.key);
                  return (
                    <tr
                      key={row.key}
                      onClick={() => toggleSelectRow(row.key)}
                      className={`h-10 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#EBF2FF]' : 'bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td
                        className={`px-3 text-center border-r border-[#EDF2F7] sticky left-0 z-10 ${
                          isSelected ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(row.key)}
                          className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                        />
                      </td>

                      {visibleColumns.map((col) => {
                        const rawVal = row[col.key];
                        if (col.isLink) {
                          return (
                            <td
                              key={col.key}
                              className="px-3 border-r border-[#EDF2F7] font-mono tabular-nums"
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewModal(row);
                              }}
                            >
                              <button
                                className="text-[#2563EB] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                                title="点击查看制令单详情"
                              >
                                {String(rawVal || '')}
                              </button>
                            </td>
                          );
                        }

                        if (col.statusKind) {
                          return (
                            <td key={col.key} className="px-3 border-r border-[#EDF2F7]">
                              {renderStatusText(String(rawVal || ''), col.statusKind)}
                            </td>
                          );
                        }

                        if (col.isNumeric) {
                          const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal || 0);
                          return (
                            <td
                              key={col.key}
                              className="px-3 border-r border-[#EDF2F7] text-right font-mono tabular-nums text-[#1E293B]"
                            >
                              {Number.isFinite(numVal) ? numVal.toLocaleString('en-US') : String(rawVal || '')}
                            </td>
                          );
                        }

                        const isMono =
                          col.key.includes('Time') ||
                          col.key.includes('No') ||
                          col.key === 'productVersion';

                        return (
                          <td
                            key={col.key}
                            className={`px-3 border-r border-[#EDF2F7] text-[#1E293B] ${
                              isMono ? 'font-mono tabular-nums' : ''
                            } ${col.highlight ? 'bg-blue-50/20' : ''}`}
                          >
                            {rawVal === '' || rawVal === undefined ? '—' : String(rawVal)}
                          </td>
                        );
                      })}

                      {/* Sticky Operation Cell */}
                      <td
                        className={`px-3 text-center sticky right-0 z-10 border-l border-[#E5E9F0] ${
                          isSelected ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2.5 relative">
                          <button
                            onClick={() => openViewModal(row)}
                            className="text-[#1E40AF] hover:text-[#0F172A] font-medium hover:underline cursor-pointer whitespace-nowrap"
                          >
                            查看
                          </button>
                          <button
                            onClick={() => openEditModal(row)}
                            className="text-[#1E40AF] hover:text-[#0F172A] font-medium hover:underline cursor-pointer whitespace-nowrap"
                          >
                            修改
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row)}
                            className="text-red-600 hover:text-red-700 font-medium hover:underline cursor-pointer whitespace-nowrap"
                          >
                            删除
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMoreKey((prev) => (prev === row.key ? null : row.key));
                              }}
                              className="text-[#2563EB] hover:text-blue-800 font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                            >
                              <span>更多</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {openMoreKey === row.key && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-6 w-32 bg-white border border-[#E5E9F0] rounded-xl shadow-lg py-1 z-50 text-left"
                              >
                                <button
                                  onClick={() => handleQualityAudit(row)}
                                  className="w-full px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#F7F9FC] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF]" />
                                  <span>品质审核</span>
                                </button>
                                <button
                                  onClick={() => handleProduceAudit(row)}
                                  className="w-full px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#F7F9FC] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF]" />
                                  <span>生产审核</span>
                                </button>
                                <button
                                  onClick={() => openEditTimeModal(row)}
                                  className="w-full px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#F7F9FC] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                >
                                  <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                                  <span>修改生产时间</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Bar */}
        <div className="px-4 py-2.5 border-t border-[#E5E9F0] bg-[#F4F6F9] flex flex-wrap items-center gap-6 text-xs text-[#475569]">
          <div>
            合计 · 计划：
            <span className="font-mono font-bold text-[#1E293B] tabular-nums ml-1">
              {totals.plan.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            合计 · 投入：
            <span className="font-mono font-bold text-[#1E293B] tabular-nums ml-1">
              {totals.input.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            合计 · 产出：
            <span className="font-mono font-bold text-[#1E293B] tabular-nums ml-1">
              {totals.output.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            总计：
            <span className="font-mono font-bold text-[#1E40AF] tabular-nums ml-1">
              {totals.all.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-2.5 border-t border-[#E5E9F0] bg-white flex flex-wrap items-center justify-end gap-3 text-xs text-[#475569]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{totalCount}</strong> 条
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (safePage <= 1) {
                  onShowToast('已是第一页', 'warning');
                } else {
                  setCurrentPage((p) => p - 1);
                }
              }}
              className="w-7 h-7 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F7F9FC] flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 rounded-lg border border-[#165DFF] bg-[#165DFF]/10 text-[#1E40AF] font-mono font-bold flex items-center justify-center tabular-nums">
              {safePage}
            </span>
            <button
              onClick={() => {
                if (safePage >= totalPages) {
                  onShowToast(`当前共 ${totalPages} 页`, 'warning');
                } else {
                  setCurrentPage((p) => p + 1);
                }
              }}
              className="w-7 h-7 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F7F9FC] flex items-center justify-center cursor-pointer"
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
            className="h-7 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none"
          >
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
        </div>
      </div>

      {/* F3 列设置 Floating Panel */}
      {isColPanelOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed right-6 top-24 w-80 max-h-[75vh] bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-between">
            <span className="text-sm font-bold text-[#1E293B]">列设置（31列）</span>
            <button
              onClick={() => setIsColPanelOpen(false)}
              className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-1.5 divide-y divide-[#F1F5F9]">
            {columns.map((col, idx) => (
              <div
                key={col.key}
                className={`flex items-center gap-2 px-4 py-2 text-xs hover:bg-[#F4F6F9] ${
                  col.highlight ? 'bg-blue-50/70' : ''
                }`}
              >
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
                <span
                  onClick={() =>
                    setColumns((prev) =>
                      prev.map((c) => (c.key === col.key ? { ...c, visible: !c.visible } : c))
                    )
                  }
                  className={`flex-1 cursor-pointer select-none ${
                    col.highlight ? 'text-blue-700 font-semibold' : 'text-[#1E293B]'
                  }`}
                >
                  {col.label}
                </span>

                <button
                  onClick={() =>
                    setColumns((prev) =>
                      prev.map((c) => (c.key === col.key ? { ...c, pinned: !c.pinned } : c))
                    )
                  }
                  title={col.pinned ? '取消固定' : '固定靠前'}
                  className={`p-1 rounded cursor-pointer transition ${
                    col.pinned ? 'text-[#1E40AF] bg-[#165DFF]/10' : 'text-[#94A3B8] hover:text-[#1E40AF]'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveColumn(idx, -1)}
                    disabled={idx === 0}
                    title="上移"
                    className="p-0.5 text-[#64748B] hover:text-[#1E293B] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveColumn(idx, 1)}
                    disabled={idx === columns.length - 1}
                    title="下移"
                    className="p-0.5 text-[#64748B] hover:text-[#1E293B] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setColumns(INITIAL_COLUMNS);
                onShowToast('已恢复默认列设置', 'info');
              }}
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E40AF] cursor-pointer"
            >
              恢复默认
            </button>
            <button
              onClick={() => {
                setIsColPanelOpen(false);
                onShowToast('列设置已保存', 'success');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#165DFF] hover:bg-[#0E4FD6] text-xs font-semibold text-[#FFFFFF] cursor-pointer"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* F2 查看-制令单信息 Modal (6 Tabs) */}
      {isViewModalOpen && viewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-[#1E40AF]" />
                <h2 className="text-sm font-bold text-[#1E293B]">查看-制令单信息</h2>
                <span className="text-xs font-mono text-[#64748B]">/ {viewItem.moNo}</span>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 6 Tabs */}
            <div className="px-5 border-b border-[#E5E9F0] bg-white flex items-center gap-1 overflow-x-auto">
              {(
                [
                  { id: 'base', label: '基础信息' },
                  { id: 'bom', label: 'BOM' },
                  { id: 'ctrl', label: '管控物料' },
                  { id: 'log', label: '上线日志' },
                  { id: 'pace', label: '生产节拍' },
                  { id: 'esop', label: 'ESOP' },
                ] as { id: ViewTabKey; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setViewTab(t.id)}
                  className={`px-4 py-3 text-xs font-medium relative transition cursor-pointer whitespace-nowrap shrink-0 ${
                    viewTab === t.id
                      ? 'text-[#1E40AF] font-bold'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {t.label}
                  {viewTab === t.id && (
                    <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-[#165DFF] rounded-t" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 text-xs">
              {viewTab === 'base' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">生产阶段</label>
                      <input
                        readOnly
                        value={viewItem.prodStage || '生产通用'}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">
                        <span className="text-red-500 mr-0.5">*</span>制令单号
                      </label>
                      <div className="relative">
                        <input
                          readOnly
                          value={viewItem.moNo}
                          className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#1E293B] font-mono"
                        />
                        <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">产品料号</label>
                      <input
                        readOnly
                        value={viewItem.materialNo}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569] font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">产品版本</label>
                      <input
                        readOnly
                        value={viewItem.productVersion}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569] font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">产品名称</label>
                      <input
                        readOnly
                        value={viewItem.productName}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">产品规格</label>
                      <input
                        readOnly
                        value={viewItem.productSpec || '209#360ML'}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">客户</label>
                      <div className="relative">
                        <input
                          readOnly
                          value={viewItem.customer || '请选择'}
                          className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                        />
                        <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">线别</label>
                      <select
                        value={viewLineInput}
                        onChange={(e) => setViewLineInput(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none"
                      >
                        <option value="制罐A线">制罐A线</option>
                        <option value="制罐B线">制罐B线</option>
                        <option value="制罐D线">制罐D线</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">计划数量</label>
                      <input
                        readOnly
                        value={viewItem.planQty.toLocaleString('en-US')}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569] font-mono tabular-nums"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">预计开工时间</label>
                      <input
                        value={viewStartInput}
                        onChange={(e) => setViewStartInput(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">预计完工时间</label>
                      <input
                        value={viewEndInput}
                        onChange={(e) => setViewEndInput(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">管控类型</label>
                      <select
                        value={viewCtrlTypeInput}
                        onChange={(e) => setViewCtrlTypeInput(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none"
                      >
                        <option value=""></option>
                        <option value="严格管控">严格管控</option>
                        <option value="一般管控">一般管控</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">
                        <span className="text-red-500 mr-0.5">*</span>工艺
                      </label>
                      <div className="relative">
                        <input
                          readOnly
                          value={viewItem.craftName || '制罐工艺'}
                          className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                        />
                        <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">开始工序</label>
                      <input
                        readOnly
                        value={viewItem.startOp || '制罐工序'}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">结束工序</label>
                      <input
                        readOnly
                        value={viewItem.endOp || '制罐工序'}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">下达时间</label>
                      <input
                        readOnly
                        value={viewItem.releaseTime}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569] font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">下达人</label>
                      <input
                        readOnly
                        value={viewItem.releaseBy}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#475569]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#475569]">最大维修次数</label>
                      <input
                        value={viewMaxRepairInput}
                        onChange={(e) => setViewMaxRepairInput(e.target.value)}
                        placeholder="请输入"
                        className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* 备注 */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[#475569]">备注</label>
                    <textarea
                      value={viewRemark}
                      onChange={(e) => setViewRemark(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 rounded-lg border border-[#E5E9F0] bg-[#F8FAFC] text-[#1E293B] outline-none resize-y"
                    />
                    <div className="text-right text-[11px] text-[#64748B] font-mono tabular-nums">
                      {viewRemark.length} / 80
                    </div>
                  </div>

                  {/* 生产设备 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1E40AF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#165DFF]" />
                      <span>生产设备</span>
                    </div>
                    <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
                      <table className="w-full border-collapse text-xs whitespace-nowrap">
                        <thead>
                          <tr className="bg-[#F7F9FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                            <th className="w-9 px-2 py-2 border-r border-[#E5E9F0]" />
                            <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">工作中心</th>
                            <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">设备编号</th>
                            <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">设备名称</th>
                            <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">设备型号</th>
                            <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">设备序号</th>
                            <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">状态</th>
                            <th className="px-3 py-2 text-center">轨道</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-[#64748B]">
                              暂无数据
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {viewTab === 'bom' && (
                <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
                  <table className="w-full border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#F7F9FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                        <th className="w-9 px-2 py-2 border-r border-[#E5E9F0] text-center">
                          <input
                            type="checkbox"
                            checked={selectedBomSeqs.length === DEFAULT_MFG_BOM.length}
                            onChange={() =>
                              setSelectedBomSeqs((prev) =>
                                prev.length === DEFAULT_MFG_BOM.length
                                  ? []
                                  : DEFAULT_MFG_BOM.map((b) => b.seq)
                              )
                            }
                            className="w-3.5 h-3.5 accent-[#165DFF]"
                          />
                        </th>
                        <th className="w-9 px-2 py-2 border-r border-[#E5E9F0] text-center" />
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">项次</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">阶别</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">料号</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">产品名称</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">产品规格</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">单位</th>
                        <th className="px-3 py-2 text-center">用量</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF2F7]">
                      {DEFAULT_MFG_BOM.map((b) => {
                        const checked = selectedBomSeqs.includes(b.seq);
                        return (
                          <tr
                            key={b.seq}
                            className={`hover:bg-[#F8FAFC] ${
                              checked ? 'bg-[#EBF2FF]' : 'bg-white'
                            }`}
                          >
                            <td className="px-2 py-2 border-r border-[#EDF2F7] text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedBomSeqs((prev) =>
                                    prev.includes(b.seq)
                                      ? prev.filter((s) => s !== b.seq)
                                      : [...prev, b.seq]
                                  )
                                }
                                className="w-3.5 h-3.5 accent-[#165DFF]"
                              />
                            </td>
                            <td className="px-2 py-2 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#64748B]">
                              {b.seq}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] text-center font-mono tabular-nums">
                              {b.level}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7]">{b.stage}</td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] font-mono tabular-nums">
                              {b.materialNo}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] max-w-[220px] truncate">
                              {b.productName}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] font-mono">
                              {b.spec}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] text-center">
                              {b.unit}
                            </td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums">
                              {b.dosage}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {viewTab === 'ctrl' && (
                <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
                  <table className="w-full border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#F7F9FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                        <th className="w-9 px-2 py-2 border-r border-[#E5E9F0] text-center">
                          <input
                            type="checkbox"
                            checked={selectedCtrlSeqs.length === DEFAULT_MFG_CTRL.length}
                            onChange={() =>
                              setSelectedCtrlSeqs((prev) =>
                                prev.length === DEFAULT_MFG_CTRL.length
                                  ? []
                                  : DEFAULT_MFG_CTRL.map((c) => c.seq)
                              )
                            }
                            className="w-3.5 h-3.5 accent-[#165DFF]"
                          />
                        </th>
                        <th className="w-9 px-2 py-2 border-r border-[#E5E9F0] text-center" />
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">物料类型</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">物料料号</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">物料名称</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">管控工序</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">管控数量</th>
                        <th className="px-3 py-2 text-center">来源</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF2F7]">
                      {DEFAULT_MFG_CTRL.map((c, idx) => {
                        const checked = selectedCtrlSeqs.includes(c.seq);
                        return (
                          <tr
                            key={c.seq}
                            className={`hover:bg-[#F8FAFC] ${
                              checked
                                ? 'bg-[#EBF2FF]'
                                : idx % 2 === 0
                                  ? 'bg-[#F4F6F9]'
                                  : 'bg-white'
                            }`}
                          >
                            <td className="px-2 py-2 border-r border-[#EDF2F7] text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedCtrlSeqs((prev) =>
                                    prev.includes(c.seq)
                                      ? prev.filter((s) => s !== c.seq)
                                      : [...prev, c.seq]
                                  )
                                }
                                className="w-3.5 h-3.5 accent-[#165DFF]"
                              />
                            </td>
                            <td className="px-2 py-2 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#64748B]">
                              {c.seq}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7]">{c.materialType}</td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] font-mono tabular-nums">
                              {c.materialNo}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] max-w-[220px] truncate">
                              {c.materialName}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] text-center font-mono">
                              {c.process}
                            </td>
                            <td className="px-3 py-2 border-r border-[#EDF2F7] text-right font-mono tabular-nums">
                              {c.qty}
                            </td>
                            <td className="px-3 py-2 text-center font-mono">{c.source}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {viewTab === 'log' && (
                <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
                  <table className="w-full border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#F7F9FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                        <th className="w-9 px-2 py-2 border-r border-[#E5E9F0]" />
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">制令单号</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">工单号</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">线别</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">产品料号</th>
                        <th className="px-3 py-2 text-center">产品名称</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[#F4F6F9] hover:bg-[#F7F9FC]">
                        <td className="px-2 py-2.5 border-r border-[#EDF2F7] text-center text-[#1E40AF]">
                          ▸
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#EDF2F7] font-mono">
                          {viewItem.moNo}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#EDF2F7] font-mono">
                          {viewItem.woNo}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#EDF2F7]">{viewItem.line}</td>
                        <td className="px-3 py-2.5 border-r border-[#EDF2F7] font-mono">
                          {viewItem.materialNo}
                        </td>
                        <td className="px-3 py-2.5">{viewItem.productName}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {viewTab === 'pace' && (
                <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
                  <table className="w-full border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#F7F9FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                        <th className="w-9 px-2 py-2 border-r border-[#E5E9F0]" />
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">制令单号</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">产品料号</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">产品版本</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">生产节拍(s)</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">生产面别</th>
                        <th className="w-9 px-2 py-2 text-center">
                          <Settings className="w-3.5 h-3.5 mx-auto text-[#2563EB]" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF2F7]">
                      {DEFAULT_MFG_PACE.map((p, idx) => (
                        <tr key={idx} className="bg-white hover:bg-[#F8FAFC]">
                          <td className="px-2 py-2.5 border-r border-[#EDF2F7] text-center text-[#64748B]">
                            ▸
                          </td>
                          <td className="px-3 py-2.5 border-r border-[#EDF2F7] font-mono">
                            {activeMoNo}
                          </td>
                          <td className="px-3 py-2.5 border-r border-[#EDF2F7] font-mono">
                            {viewItem.materialNo || p.materialNo}
                          </td>
                          <td className="px-3 py-2.5 border-r border-[#EDF2F7] text-center font-mono">
                            {viewItem.productVersion || p.version}
                          </td>
                          <td className="px-3 py-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums">
                            {p.paceSeconds}
                          </td>
                          <td className="px-3 py-2.5 border-r border-[#EDF2F7] text-center">
                            {p.side}
                          </td>
                          <td className="px-2 py-2.5 text-center text-[#64748B]">
                            <Settings className="w-3.5 h-3.5 mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {viewTab === 'esop' && (
                <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
                  <table className="w-full border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#F7F9FC] text-[#1E40AF] border-b border-[#E5E9F0]">
                        <th className="w-9 px-2 py-2 border-r border-[#E5E9F0]" />
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">文件编码</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">文件名称</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">文件版本</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">生产工序</th>
                        <th className="px-3 py-2 border-r border-[#E5E9F0] text-center">附件</th>
                        <th className="px-3 py-2 text-center">DCI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-[#64748B]">
                          暂无数据
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCraftFlowModalOpen(true)}
                className="px-4 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E40AF] flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>工艺流程</span>
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E293B] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F6 工艺流程 Modal */}
      {isCraftFlowModalOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCraftFlowModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#1E40AF]" />
                <h2 className="text-sm font-bold text-[#1E293B]">工艺流程</h2>
              </div>
              <button
                onClick={() => setIsCraftFlowModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 md:p-10 bg-[#F8FAFC] min-h-[380px] flex flex-col items-start">
              <div className="w-32 text-center text-xs text-[#64748B] mb-2.5 font-medium">
                开始/结束
              </div>

              <div className="w-32 h-11 border border-[#CBD5E1] rounded-lg bg-white flex items-center justify-center text-xs font-medium text-[#1E293B] shadow-2xs">
                制罐工序
              </div>

              <div className="w-32 flex flex-col items-center py-2 gap-1">
                <span className="text-[11px] font-bold text-red-600">NG</span>
                <ArrowDown className="w-4 h-4 text-[#64748B]" />
              </div>

              <div className="w-32 h-11 border border-[#CBD5E1] rounded-lg bg-white flex items-center justify-center text-xs font-medium text-[#1E293B] shadow-2xs">
                E线维修站
              </div>

              <div className="w-32 flex flex-col items-center py-2 gap-1">
                <span className="text-[11px] font-bold text-emerald-600">OK</span>
                <ArrowDown className="w-4 h-4 text-[#64748B]" />
              </div>

              <div className="w-32 h-11 border border-[#165DFF] rounded-lg bg-[#EBF2FF] flex items-center justify-center text-xs font-bold text-[#0F3C8A] shadow-2xs">
                制罐工序
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#FFFFFF] flex justify-end">
              <button
                onClick={() => setIsCraftFlowModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E293B] cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F5 修改-制令单信息 Modal (Editable) */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1E40AF]" />
                <h2 className="text-sm font-bold text-[#1E293B]">修改-制令单信息</h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">生产阶段</label>
                  <select
                    value={editForm.prodStage}
                    onChange={(e) => setEditForm((f) => ({ ...f, prodStage: e.target.value }))}
                    className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                  >
                    <option value="生产通用">生产通用</option>
                    <option value="试产">试产</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">
                    <span className="text-red-500 mr-0.5">*</span>制令单号
                  </label>
                  <div className="relative">
                    <input
                      value={editForm.moNo}
                      onChange={(e) => {
                        setEditForm((f) => ({ ...f, moNo: e.target.value }));
                        setEditErrors((err) => ({ ...err, moNo: false }));
                      }}
                      className={`w-full h-8 pl-2.5 pr-7 rounded-lg border bg-white text-[#1E293B] font-mono outline-none ${
                        editErrors.moNo ? 'border-red-500' : 'border-[#CBD5E1] focus:border-[#165DFF]'
                      }`}
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2" />
                  </div>
                  {editErrors.moNo && (
                    <span className="text-[11px] text-red-500">请选择制令单号</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">
                    <span className="text-red-500 mr-0.5">*</span>产品料号
                  </label>
                  <div className="relative">
                    <input
                      value={editForm.materialNo}
                      onChange={(e) => {
                        setEditForm((f) => ({ ...f, materialNo: e.target.value }));
                        setEditErrors((err) => ({ ...err, materialNo: false }));
                      }}
                      className={`w-full h-8 pl-2.5 pr-7 rounded-lg border bg-white text-[#1E293B] font-mono outline-none ${
                        editErrors.materialNo
                          ? 'border-red-500'
                          : 'border-[#CBD5E1] focus:border-[#165DFF]'
                      }`}
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2" />
                  </div>
                  {editErrors.materialNo && (
                    <span className="text-[11px] text-red-500">请选择产品料号</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">产品版本</label>
                  <input
                    readOnly
                    value={editForm.productVersion}
                    className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#64748B] font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">产品名称</label>
                  <input
                    readOnly
                    value={editForm.productName}
                    className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#64748B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">产品规格</label>
                  <input
                    readOnly
                    value={editForm.productSpec}
                    className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#64748B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">客户</label>
                  <div className="relative">
                    <input
                      value={editForm.customer}
                      onChange={(e) => setEditForm((f) => ({ ...f, customer: e.target.value }))}
                      className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">线别</label>
                  <select
                    value={editForm.line}
                    onChange={(e) => setEditForm((f) => ({ ...f, line: e.target.value }))}
                    className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                  >
                    <option value="制罐A线">制罐A线</option>
                    <option value="制罐B线">制罐B线</option>
                    <option value="制罐D线">制罐D线</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">计划数量</label>
                  <input
                    value={editForm.planQty}
                    onChange={(e) => setEditForm((f) => ({ ...f, planQty: e.target.value }))}
                    className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono tabular-nums outline-none focus:border-[#165DFF]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">预计开工时间</label>
                  <input
                    value={editForm.planStartTime}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, planStartTime: e.target.value }))
                    }
                    className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono outline-none focus:border-[#165DFF]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">预计完工时间</label>
                  <input
                    value={editForm.planEndTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, planEndTime: e.target.value }))}
                    className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono outline-none focus:border-[#165DFF]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">管控类型</label>
                  <select
                    value={editForm.ctrlType}
                    onChange={(e) => setEditForm((f) => ({ ...f, ctrlType: e.target.value }))}
                    className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
                  >
                    <option value=""></option>
                    <option value="严格管控">严格管控</option>
                    <option value="一般管控">一般管控</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">
                    <span className="text-red-500 mr-0.5">*</span>工艺
                  </label>
                  <div className="relative">
                    <input
                      value={editForm.craftName}
                      onChange={(e) => {
                        setEditForm((f) => ({ ...f, craftName: e.target.value }));
                        setEditErrors((err) => ({ ...err, craftName: false }));
                      }}
                      className={`w-full h-8 pl-2.5 pr-7 rounded-lg border bg-white text-[#1E293B] outline-none ${
                        editErrors.craftName
                          ? 'border-red-500'
                          : 'border-[#CBD5E1] focus:border-[#165DFF]'
                      }`}
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2" />
                  </div>
                  {editErrors.craftName && (
                    <span className="text-[11px] text-red-500">请选择工艺</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">开始工序</label>
                  <input
                    readOnly
                    value={editForm.startOp}
                    className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#64748B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">结束工序</label>
                  <input
                    readOnly
                    value={editForm.endOp}
                    className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#64748B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">下达时间</label>
                  <input
                    readOnly
                    value={editForm.releaseTime}
                    className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#64748B] font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">下达人</label>
                  <input
                    readOnly
                    value={editForm.releaseBy}
                    className="h-8 px-2.5 rounded-lg border border-[#E5E9F0] bg-[#F1F5F9] text-[#64748B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#475569]">最大维修次数</label>
                  <input
                    value={editForm.maxRepairCount}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, maxRepairCount: e.target.value }))
                    }
                    placeholder="请输入"
                    className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono outline-none focus:border-[#165DFF]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#475569]">备注</label>
                <textarea
                  value={editForm.remark}
                  onChange={(e) => setEditForm((f) => ({ ...f, remark: e.target.value }))}
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] outline-none focus:border-[#165DFF] resize-y"
                />
                <div className="text-right text-[11px] text-[#64748B] font-mono tabular-nums">
                  {editForm.remark.length} / 80
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl border border-[#E5E9F0] bg-[#F4F6F9] text-[11px] text-[#475569]">
                修改保存后将回写制令单主数据；灰底字段为系统只读项，不可编辑。带{' '}
                <span className="text-red-500 font-bold">*</span> 为必填项。
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#FFFFFF] flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E293B] cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-[#165DFF] hover:bg-[#0E4FD6] text-xs font-semibold text-[#FFFFFF] cursor-pointer"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改生产时间 Quick Modal (from F4 更多) */}
      {isEditTimeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditTimeModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <h2 className="text-sm font-bold text-[#1E293B]">修改生产时间</h2>
              </div>
              <button
                onClick={() => setIsEditTimeModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[#475569] font-medium">预计开工时间</label>
                <input
                  value={editTimeStart}
                  onChange={(e) => setEditTimeStart(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm"
                  className="h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono outline-none focus:border-[#165DFF]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[#475569] font-medium">预计完工时间</label>
                <input
                  value={editTimeEnd}
                  onChange={(e) => setEditTimeEnd(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm"
                  className="h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] font-mono outline-none focus:border-[#165DFF]"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#FFFFFF] flex justify-end gap-2">
              <button
                onClick={() => setIsEditTimeModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E293B] cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditTime}
                className="px-4 py-1.5 rounded-xl bg-[#165DFF] hover:bg-[#0E4FD6] text-xs font-semibold text-[#FFFFFF] cursor-pointer"
              >
                保存时间
              </button>
            </div>
          </div>
        </div>
      )}

      {/* P0 流程总览 Modal */}
      {isFlowModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsFlowModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#E5E9F0] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[86vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">制令单信息 · 页面流程总览</h2>
                <p className="text-[11px] text-[#64748B]">
                  昇兴排程系统 · 计划管理 · 制令单信息（点击卡片快捷跳转对应交互界面）
                </p>
              </div>
              <button
                onClick={() => setIsFlowModalOpen(false)}
                className="p-1.5 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  onClick={() => setIsFlowModalOpen(false)}
                  className="bg-white border border-[#E5E9F0] rounded-xl p-4 hover:border-[#165DFF] transition cursor-pointer space-y-2"
                >
                  <div className="text-[11px] font-semibold text-[#1E40AF]">P1 · 主页面</div>
                  <h3 className="text-sm font-bold text-[#1E293B]">制令单信息列表</h3>
                  <p className="text-[#475569] leading-relaxed">
                    按组织机构、制令单号、产品料号、状态、工单号、预计开工时间筛选制令单，支持导出、批量删除、查看与更多操作。
                  </p>
                  <span className="inline-block font-semibold text-[#1E40AF]">当前页面 →</span>
                </div>

                <div
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    if (items[0]) openViewModal(items[0]);
                  }}
                  className="bg-white border border-[#E5E9F0] rounded-xl p-4 hover:border-[#165DFF] transition cursor-pointer space-y-2"
                >
                  <div className="text-[11px] font-semibold text-[#D97706]">F2 · 模态弹窗</div>
                  <h3 className="text-sm font-bold text-[#1E293B]">查看-制令单信息</h3>
                  <p className="text-[#475569] leading-relaxed">
                    6 个 Tab：基础信息、BOM、管控物料、上线日志、生产节拍、ESOP。展示制令单全生命周期信息与工艺流程入口。
                  </p>
                  <span className="inline-block font-semibold text-[#1E40AF]">打开弹窗 →</span>
                </div>

                <div
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    if (items[0]) openEditModal(items[0]);
                  }}
                  className="bg-white border border-[#E5E9F0] rounded-xl p-4 hover:border-[#165DFF] transition cursor-pointer space-y-2"
                >
                  <div className="text-[11px] font-semibold text-[#D97706]">F5 · 模态弹窗</div>
                  <h3 className="text-sm font-bold text-[#1E293B]">修改-制令单信息</h3>
                  <p className="text-[#475569] leading-relaxed">
                    操作列「修改」入口。独立可编辑表单，含必填校验（制令单号/产品料号/工艺）、只读灰底字段与备注字数统计。
                  </p>
                  <span className="inline-block font-semibold text-[#1E40AF]">打开弹窗 →</span>
                </div>

                <div
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    setIsColPanelOpen(true);
                  }}
                  className="bg-white border border-[#E5E9F0] rounded-xl p-4 hover:border-[#165DFF] transition cursor-pointer space-y-2"
                >
                  <div className="text-[11px] font-semibold text-[#D97706]">F3 · 浮层面板</div>
                  <h3 className="text-sm font-bold text-[#1E293B]">列设置</h3>
                  <p className="text-[#475569] leading-relaxed">
                    31 个可勾选字段，含预计完工时间/修改时间高亮项，支持固定列与排序调整，实时控制表格列显隐。
                  </p>
                  <span className="inline-block font-semibold text-[#1E40AF]">打开面板 →</span>
                </div>

                <div
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    if (items[0]) openEditTimeModal(items[0]);
                  }}
                  className="bg-white border border-[#E5E9F0] rounded-xl p-4 hover:border-[#165DFF] transition cursor-pointer space-y-2"
                >
                  <div className="text-[11px] font-semibold text-[#D97706]">F4 · 更多操作</div>
                  <h3 className="text-sm font-bold text-[#1E293B]">审核与生产时间调整</h3>
                  <p className="text-[#475569] leading-relaxed">
                    操作列「更多」菜单包含品质审核、生产审核与修改生产时间，快捷更新对应制令单的审核与排程时间。
                  </p>
                  <span className="inline-block font-semibold text-[#1E40AF]">调整生产时间 →</span>
                </div>

                <div
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    setIsCraftFlowModalOpen(true);
                  }}
                  className="bg-white border border-[#E5E9F0] rounded-xl p-4 hover:border-[#165DFF] transition cursor-pointer space-y-2"
                >
                  <div className="text-[11px] font-semibold text-[#D97706]">F6 · 流程视图</div>
                  <h3 className="text-sm font-bold text-[#1E293B]">工艺流程图</h3>
                  <p className="text-[#475569] leading-relaxed">
                    查看制罐工序 → NG 维修站 → OK 回流制罐工序的标准工艺流转路径。
                  </p>
                  <span className="inline-block font-semibold text-[#1E40AF]">查看工艺流程 →</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[#475569] py-2">
                <span className="px-3 py-1.5 rounded-lg border border-dashed border-[#CBD5E1] bg-white">
                  列表筛选
                </span>
                <span>→</span>
                <span className="px-3 py-1.5 rounded-lg border border-dashed border-[#CBD5E1] bg-white">
                  查看制令单（6 Tab） / 修改制令单
                </span>
                <span>→</span>
                <span className="px-3 py-1.5 rounded-lg border border-dashed border-[#CBD5E1] bg-white">
                  品质 / 生产审核
                </span>
              </div>

              <div className="bg-white border border-amber-200 rounded-xl p-4 text-[#475569] leading-relaxed">
                <strong className="text-amber-800">业务规则备注：</strong>
                ①「状态」包含关结、生产中、未下达；② 品质审核 / 生产审核支持在行操作「更多」菜单中更新审核标识、审核人与审核时间；③ 底部汇总栏实时计算当前筛选结果下的计划、投入、产出合计。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmState.isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#1E293B]">{confirmState.title}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">{confirmState.desc}</p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                onClick={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#EDF2F7] text-xs font-medium text-[#1E293B] cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const fn = confirmState.onConfirm;
                  setConfirmState((prev) => ({ ...prev, isOpen: false }));
                  fn();
                }}
                className="px-4 py-1.5 rounded-xl bg-[#165DFF] hover:bg-[#0E4FD6] text-xs font-semibold text-[#FFFFFF] cursor-pointer"
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
