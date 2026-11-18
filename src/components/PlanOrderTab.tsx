import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  RotateCcw,
  RefreshCw,
  Plus,
  Calculator,
  Trash2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  X,
  AlertTriangle,
  ArrowUpDown,
  GitBranch,
  Check,
  Edit3,
  Pin,
} from 'lucide-react';
import { PlanOrder, PlanOrderBomItem } from '../types';
import { DEFAULT_PLAN_ORDER_BOM, FACTORY_LINES, capByLineMat } from '../mockData';

interface PlanOrderTabProps {
  planOrders: PlanOrder[];
  onUpdatePlanOrders: (orders: PlanOrder[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface ColumnConfig {
  key: keyof PlanOrder;
  label: string;
  visible: boolean;
  disabled?: boolean;
  highlight?: boolean;
  pinned?: boolean;
  align?: 'left' | 'right';
  isNumeric?: boolean;
  isLink?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'unit', label: '单位名称', visible: true },
  { key: 'planNo', label: '计划单号', visible: true, isLink: true },
  { key: 'customer', label: '客户', visible: true },
  { key: 'materialNo', label: '产品料号', visible: true },
  { key: 'version', label: '产品版本', visible: true },
  { key: 'productName', label: '产品名称', visible: true },
  { key: 'planFactory', label: '计划工厂', visible: true },
  { key: 'prodFactory', label: '生产工厂', visible: true },
  { key: 'planType', label: '计划单类型', visible: true },
  { key: 'purchaseType', label: '采购类型', visible: true },
  { key: 'specialProc', label: '特殊获取', visible: true },
  { key: 'totalOrderQty', label: '总订单数量', visible: true, highlight: true, pinned: true, align: 'right', isNumeric: true },
  { key: 'orderStartDate', label: '订单开始日期', visible: true },
  { key: 'orderEndDate', label: '订单结束日期', visible: true },
  { key: 'orderInitDate', label: '订单初日期', visible: true },
  { key: 'expandDate', label: '展开日期', visible: true },
  { key: 'mrpController', label: 'MRP控制员', visible: true },
  { key: 'planQty', label: '计划数量', visible: true, align: 'right', isNumeric: true },
  { key: 'orderedQty', label: '已下单数量', visible: true, highlight: true, pinned: true, align: 'right', isNumeric: true },
  { key: 'unitMeasure', label: '单位', visible: true },
  { key: 'deliveryDate', label: '计划交货日期', visible: true },
  { key: 'convertFlag', label: '转换标识', visible: true },
  { key: 'acctCategory', label: '科目分配类别', visible: true },
  { key: 'soNo', label: '销售订单号', visible: true },
  { key: 'soItemNo', label: '销售订单行项目号', visible: true },
  { key: 'reserveNo', label: '预留号', visible: true },
  { key: 'storageLoc', label: '库存地点', visible: true },
  { key: 'specialStock', label: '特殊库存', visible: true },
  { key: 'prodVersion', label: '生产版本', visible: true },
  { key: 'capReqFlag', label: '产能需求标识', visible: true },
  { key: 'mrpArea', label: 'MRP范围', visible: true },
  { key: 'lastModTime', label: '最后修改时间戳', visible: true },
  { key: 'createTime', label: '创建时间', visible: false, disabled: true },
  { key: 'productId', label: '产品ID', visible: false, disabled: true },
  { key: 'spec', label: '物料规格', visible: false, disabled: true },
  { key: 'materialId', label: '物料ID', visible: true },
];

export const PlanOrderTab: React.FC<PlanOrderTabProps> = ({
  planOrders,
  onUpdatePlanOrders,
  onShowToast,
}) => {
  // Filter states
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [planNoOp, setPlanNoOp] = useState<MatchOp>('contains');
  const [planNoFilter, setPlanNoFilter] = useState('');
  const [custOp, setCustOp] = useState<MatchOp>('contains');
  const [custFilter, setCustFilter] = useState('');
  const [matOp, setMatOp] = useState<MatchOp>('contains');
  const [matFilter, setMatFilter] = useState('');
  const [pnameOp, setPnameOp] = useState<MatchOp>('contains');
  const [pnameFilter, setPnameFilter] = useState('');
  const [deletedFlagFilter, setDeletedFlagFilter] = useState<'empty' | 'nonempty'>('empty');

  // Applied filter snapshot (so clicking 查询 applies filters, or live typing updates immediately after query)
  const [appliedFilters, setAppliedFilters] = useState({
    org: '请选择',
    planNoOp: 'contains' as MatchOp,
    planNo: '',
    custOp: 'contains' as MatchOp,
    cust: '',
    matOp: 'contains' as MatchOp,
    mat: '',
    pnameOp: 'contains' as MatchOp,
    pname: '',
    deletedFlag: 'empty' as 'empty' | 'nonempty',
  });

  // Selection & Sorting & Pagination
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['8494552']);
  const [sortConfig, setSortConfig] = useState<{ key: keyof PlanOrder | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column settings (F3)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // Flow overview modal (P0)
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);

  // Sync modal (F1)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncFactory, setSyncFactory] = useState('1050');
  const [syncMat, setSyncMat] = useState('');
  const [syncStartDate, setSyncStartDate] = useState('2026-11-18');
  const [syncLastModDate, setSyncLastModDate] = useState('2026-11-18');
  const [syncFactoryErr, setSyncFactoryErr] = useState(false);

  // Work Order Info modal (F2)
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [woModalMode, setWoModalMode] = useState<'add' | 'edit' | 'convert'>('add');
  const [editingOrderKey, setEditingOrderKey] = useState<string | null>(null);
  const [woForm, setWoForm] = useState({
    woNo: 'LS-1794971030092',
    materialNo: '10032076',
    productName: '珍珍朱姆妈广式香浓八宝粥（',
    spec: '',
    version: '01',
    planQty: '735',
    woType: '量产',
    workshop: '中山制罐车间',
    customer: '',
    deliveryDate: '',
    planStartTime: '2026-11-18T00:00',
    planEndTime: '2026-11-19T00:00',
    guideControl: '',
    sapVersion: 'SA非全',
    planNo: '8494962',
    autoReleaseMo: false,
    craft: '',
    craftVersion: '',
    prodStage: '',
    line: '',
    soNo: '',
    soItemNo: '',
    remark: '',
    theoryQty: '0',
    recordId: '15441bac2b4e135d9216c41e20bec9',
  });
  const [woFormErrors, setWoFormErrors] = useState<{ materialNo?: boolean; planNo?: boolean }>({});

  // BOM items inside F2
  const [bomItems, setBomItems] = useState<PlanOrderBomItem[]>(DEFAULT_PLAN_ORDER_BOM);
  const [selectedBomIds, setSelectedBomIds] = useState<string[]>([]);
  const [expandedBomIds, setExpandedBomIds] = useState<string[]>([]);
  const [editingBomId, setEditingBomId] = useState<string | null>(null);

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
  const filteredOrders = useMemo(() => {
    const matchStr = (val: string, filter: string, op: MatchOp) => {
      if (!filter.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = filter.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };

    return planOrders.filter((row) => {
      if (appliedFilters.deletedFlag === 'empty' && row.deleted) return false;
      if (appliedFilters.deletedFlag === 'nonempty' && !row.deleted) return false;

      if (appliedFilters.org !== '请选择' && !row.unit.includes(appliedFilters.org)) {
        return false;
      }
      if (!matchStr(row.planNo, appliedFilters.planNo, appliedFilters.planNoOp)) return false;
      if (!matchStr(row.customer, appliedFilters.cust, appliedFilters.custOp)) return false;
      if (!matchStr(row.materialNo, appliedFilters.mat, appliedFilters.matOp)) return false;
      if (!matchStr(row.productName, appliedFilters.pname, appliedFilters.pnameOp)) return false;
      return true;
    });
  }, [planOrders, appliedFilters]);

  const sortedOrders = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredOrders;
    const key = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredOrders].sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv), 'zh-CN') * dir;
    });
  }, [filteredOrders, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedOrders = sortedOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  const visibleColumns = columns.filter((c) => c.visible && !c.disabled);

  // Handlers
  const handleQuery = () => {
    setAppliedFilters({
      org: orgFilter,
      planNoOp,
      planNo: planNoFilter,
      custOp,
      cust: custFilter,
      matOp,
      mat: matFilter,
      pnameOp,
      pname: pnameFilter,
      deletedFlag: deletedFlagFilter,
    });
    setCurrentPage(1);
    onShowToast('查询条件已应用', 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setPlanNoOp('contains');
    setPlanNoFilter('');
    setCustOp('contains');
    setCustFilter('');
    setMatOp('contains');
    setMatFilter('');
    setPnameOp('contains');
    setPnameFilter('');
    setDeletedFlagFilter('empty');
    setAppliedFilters({
      org: '请选择',
      planNoOp: 'contains',
      planNo: '',
      custOp: 'contains',
      cust: '',
      matOp: 'contains',
      mat: '',
      pnameOp: 'contains',
      pname: '',
      deletedFlag: 'empty',
    });
    setCurrentPage(1);
    onShowToast('筛选条件已重置', 'info');
  };

  const toggleSort = (key: keyof PlanOrder) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return { key: null, dir: null };
    });
  };

  const allPagedSelected =
    pagedOrders.length > 0 && pagedOrders.every((r) => selectedKeys.includes(r.key));

  const toggleSelectAll = () => {
    if (allPagedSelected) {
      const pageKeys = new Set(pagedOrders.map((r) => r.key));
      setSelectedKeys((prev) => prev.filter((k) => !pageKeys.has(k)));
    } else {
      const next = new Set([...selectedKeys, ...pagedOrders.map((r) => r.key)]);
      setSelectedKeys(Array.from(next));
    }
  };

  const toggleSelectRow = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const openWoModal = (mode: 'add' | 'edit' | 'convert', row?: PlanOrder) => {
    setWoModalMode(mode);
    setWoFormErrors({});
    if (mode === 'add') {
      setEditingOrderKey(null);
      setWoForm({
        woNo: `LS-${Date.now().toString().slice(-13)}`,
        materialNo: '',
        productName: '',
        spec: '',
        version: '01',
        planQty: '500',
        woType: '量产',
        workshop: '中山制罐车间',
        customer: '',
        deliveryDate: '2026-11-25',
        planStartTime: '2026-11-18T08:30',
        planEndTime: '2026-11-19T08:30',
        guideControl: '',
        sapVersion: 'SA非全',
        planNo: `849${Math.floor(5000 + Math.random() * 4999)}`,
        autoReleaseMo: false,
        craft: '',
        craftVersion: '',
        prodStage: '',
        line: '',
        soNo: '',
        soItemNo: '',
        remark: '',
        theoryQty: '0',
        recordId: '15441bac2b4e135d9216c41e20bec9',
      });
      setBomItems(DEFAULT_PLAN_ORDER_BOM);
    } else if (row) {
      setEditingOrderKey(row.key);
      setWoForm({
        woNo: `LS-1794971030092`,
        materialNo: row.materialNo,
        productName: row.productName,
        spec: row.spec || '',
        version: row.version || '01',
        planQty: String(row.planQty || 735),
        woType: '量产',
        workshop: '中山制罐车间',
        customer: row.customer || '',
        deliveryDate: row.deliveryDate || '',
        planStartTime: '2026-11-18T00:00',
        planEndTime: '2026-11-19T00:00',
        guideControl: '',
        sapVersion: 'SA非全',
        planNo: row.planNo,
        autoReleaseMo: false,
        craft: '',
        craftVersion: '',
        prodStage: '',
        line: '',
        soNo: row.soNo || '',
        soItemNo: row.soItemNo || '',
        remark: '',
        theoryQty: '0',
        recordId: `15441bac2b4e135d9216c41e20${row.key.slice(-4)}`,
      });
      setBomItems(DEFAULT_PLAN_ORDER_BOM);
    }
    setSelectedBomIds([]);
    setExpandedBomIds([]);
    setEditingBomId(null);
    setIsWoModalOpen(true);
  };

  const handleDeleteRow = (row: PlanOrder) => {
    setConfirmState({
      isOpen: true,
      title: '删除计划单',
      desc: `确认删除计划单「${row.planNo}」？删除后不可恢复，是否继续？`,
      onConfirm: () => {
        onUpdatePlanOrders(planOrders.filter((p) => p.key !== row.key));
        setSelectedKeys((prev) => prev.filter((k) => k !== row.key));
        onShowToast(`已删除计划单 ${row.planNo}`, 'success');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedKeys.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      desc: `将删除选中的 ${selectedKeys.length} 条计划单，删除后不可恢复，是否继续？`,
      onConfirm: () => {
        const keySet = new Set(selectedKeys);
        onUpdatePlanOrders(planOrders.filter((p) => !keySet.has(p.key)));
        setSelectedKeys([]);
        onShowToast(`已批量删除 ${keySet.size} 条计划单`, 'success');
      },
    });
  };

  const handleSyncSubmit = () => {
    if (!syncFactory.trim()) {
      setSyncFactoryErr(true);
      onShowToast('请填写工厂', 'error');
      return;
    }
    setSyncFactoryErr(false);
    setIsSyncModalOpen(false);
    const matched = syncMat.trim()
      ? planOrders.filter((p) => p.materialNo.includes(syncMat.trim())).length
      : planOrders.length;
    onShowToast(
      `同步任务已提交（工厂 ${syncFactory.trim()} · ${syncStartDate}），共匹配 ${matched} 条计划单`,
      'success'
    );
  };

  const handleWoCalcQty = () => {
    const q = parseFloat(woForm.planQty) || 0;
    const rate = woForm.line && FACTORY_LINES.includes(woForm.line)
      ? capByLineMat(woForm.line, woForm.materialNo)
      : null;
    const theory = rate ? Math.round(q * 1.05) : Math.round(q * 1.05);
    setWoForm((prev) => ({ ...prev, theoryQty: String(theory) }));
    onShowToast('理论产量计算完成', 'success');
  };

  const handleWoSave = () => {
    const matErr = !woForm.materialNo.trim();
    const planErr = !woForm.planNo.trim();
    if (matErr || planErr) {
      setWoFormErrors({ materialNo: matErr, planNo: planErr });
      onShowToast('请补全必填项（产品料号、计划单号）', 'error');
      return;
    }

    const qtyNum = parseFloat(woForm.planQty) || 0;
    if (woModalMode === 'add') {
      const newOrder: PlanOrder = {
        key: woForm.planNo.trim(),
        unit: `昇兴集团-${woForm.workshop.replace('车间', '工厂')}`,
        planNo: woForm.planNo.trim(),
        customer: woForm.customer.trim(),
        materialNo: woForm.materialNo.trim(),
        version: woForm.version || '01',
        productName: woForm.productName.trim() || `产品 ${woForm.materialNo.trim()}`,
        spec: woForm.spec || '标准罐型',
        planFactory: '1050',
        prodFactory: '1050',
        planType: woForm.woType === '试产' ? 'KD' : 'LA',
        purchaseType: 'E',
        totalOrderQty: qtyNum * 1000,
        orderStartDate: woForm.planStartTime.slice(0, 10),
        orderEndDate: woForm.planEndTime.slice(0, 10),
        orderInitDate: new Date().toISOString().slice(0, 10),
        expandDate: new Date().toISOString().slice(0, 10),
        mrpController: 'M01',
        planQty: qtyNum,
        orderedQty: 0,
        unitMeasure: '千罐',
        deliveryDate: woForm.deliveryDate || '2026-11-25',
        convertFlag: '未转换',
        acctCategory: 'M',
        soNo: woForm.soNo.trim(),
        soItemNo: woForm.soItemNo.trim(),
        storageLoc: '1051',
        prodVersion: 'V01',
        capReqFlag: 'X',
        mrpArea: '1050',
        lastModTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        productId: `PRD-${woForm.materialNo.trim()}`,
        materialId: `MAT-${woForm.materialNo.trim()}`,
      };
      onUpdatePlanOrders([newOrder, ...planOrders]);
      onShowToast(`新增计划单 ${newOrder.planNo} 保存成功`, 'success');
    } else if (editingOrderKey) {
      onUpdatePlanOrders(
        planOrders.map((p) => {
          if (p.key !== editingOrderKey) return p;
          const nextOrdered =
            woModalMode === 'convert' ? Math.min(p.planQty || qtyNum, (p.orderedQty || 0) + qtyNum) : p.orderedQty;
          return {
            ...p,
            planNo: woForm.planNo.trim(),
            materialNo: woForm.materialNo.trim(),
            productName: woForm.productName.trim() || p.productName,
            customer: woForm.customer.trim(),
            planQty: qtyNum || p.planQty,
            orderedQty: nextOrdered,
            deliveryDate: woForm.deliveryDate || p.deliveryDate,
            convertFlag:
              woModalMode === 'convert'
                ? nextOrdered >= (qtyNum || p.planQty)
                  ? '已转换'
                  : '部分转换'
                : p.convertFlag,
            soNo: woForm.soNo.trim(),
            soItemNo: woForm.soItemNo.trim(),
            lastModTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          };
        })
      );
      onShowToast(
        woModalMode === 'convert'
          ? `已转工单（${woForm.woNo}），计划单 ${woForm.planNo} 已更新`
          : `工单与计划单 ${woForm.planNo} 修改保存成功`,
        'success'
      );
    }
    setIsWoModalOpen(false);
  };

  // BOM handlers inside F2
  const handleAddBomRow = () => {
    const nextSeq = bomItems.length > 0 ? Math.max(...bomItems.map((b) => b.seq)) + 10 : 10;
    const newItem: PlanOrderBomItem = {
      id: `bom-${Date.now()}`,
      seq: nextSeq,
      stage: '拉伸',
      materialNo: '',
      materialName: '',
      spec: '',
      dosage: 1,
      unit: '只',
    };
    setBomItems((prev) => [...prev, newItem]);
    setEditingBomId(newItem.id);
    onShowToast('已新增一行 BOM，可直接填写料号与阶段', 'info');
  };

  const handleLoadProductBom = () => {
    setBomItems(DEFAULT_PLAN_ORDER_BOM);
    setSelectedBomIds([]);
    onShowToast(`已加载产品 BOM（共 ${DEFAULT_PLAN_ORDER_BOM.length} 行）`, 'success');
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

  const currentLineBeat = useMemo(() => {
    if (!woForm.line) return '—';
    if (FACTORY_LINES.includes(woForm.line)) {
      return `${capByLineMat(woForm.line, woForm.materialNo).toLocaleString()} 件/小时`;
    }
    return '38,000 件/小时';
  }, [woForm.line, woForm.materialNo]);

  return (
    <div className="space-y-4 relative">
      {/* Filter Card (P1 Top Filter) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4">
        {!filterCollapsed && (
          <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-xs">
            {/* 组织机构 */}
            <div className="flex items-center gap-1.5">
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

            {/* 计划单号 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">计划单号</label>
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

            {/* 客户 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">客户</label>
              <select
                value={custOp}
                onChange={(e) => setCustOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <input
                type="text"
                value={custFilter}
                onChange={(e) => setCustFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="请输入"
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-28 outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* 产品料号 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">产品料号</label>
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

            {/* 产品名称 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">产品名称</label>
              <select
                value={pnameOp}
                onChange={(e) => setPnameOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <input
                type="text"
                value={pnameFilter}
                onChange={(e) => setPnameFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="请输入"
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-36 outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* 删除标识 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">删除标识</label>
              <select
                value={deletedFlagFilter}
                onChange={(e) => setDeletedFlagFilter(e.target.value as 'empty' | 'nonempty')}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="empty">为空</option>
                <option value="nonempty">不为空</option>
              </select>
            </div>

            {/* Filter Actions */}
            <div className="ml-auto flex items-center gap-2">
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
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedKeys.length}</strong> 项</span>
            <span aria-hidden="true">·</span>
            <span>当前匹配 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedOrders.length}</strong> 条计划单</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>同步</span>
            </button>
            <button
              type="button"
              onClick={() => openWoModal('add')}
              className="h-8 px-3.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#165DFF] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const totalPlan = sortedOrders.reduce((s, r) => s + (r.planQty || 0), 0);
                onShowToast(
                  `计算完成：共 ${sortedOrders.length} 条计划单，计划总数量 ${totalPlan.toLocaleString()} 千罐`,
                  'success'
                );
              }}
              className="h-8 px-3.5 border border-[#E5E9F0] bg-white text-[#1E40AF] rounded-lg hover:bg-[#EDF2F7] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>计算</span>
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
              {pagedOrders.map((row) => {
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
                            col.key === 'productName' ? 'max-w-[230px] truncate' : ''
                          } ${col.highlight ? 'bg-blue-50/30 text-blue-700 font-semibold' : ''}`}
                          title={col.key === 'productName' ? displayVal : undefined}
                        >
                          {col.isLink ? (
                            <button
                              type="button"
                              onClick={() => openWoModal('edit', row)}
                              className="font-mono font-bold text-[#1E40AF] hover:text-[#1E293B] hover:underline cursor-pointer"
                            >
                              {displayVal}
                            </button>
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
                          onClick={() => openWoModal('edit', row)}
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
                          onClick={() => openWoModal('convert', row)}
                          className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-semibold cursor-pointer"
                        >
                          转工单
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pagedOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
                    className="py-12 text-center text-[#64748B]"
                  >
                    <div className="space-y-2">
                      <p>暂无匹配的计划单数据</p>
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
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedOrders.length}</strong> 条
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (safePage <= 1) {
                  onShowToast('已是第一页', 'warning');
                } else {
                  setCurrentPage(safePage - 1);
                }
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
                if (safePage >= totalPages) {
                  onShowToast(`当前共 ${totalPages} 页`, 'warning');
                } else {
                  setCurrentPage(safePage + 1);
                }
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
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
        </div>

        {/* F3 列设置浮层 */}
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
                    col.disabled
                      ? 'opacity-45 cursor-not-allowed bg-gray-50/50'
                      : col.highlight
                      ? 'bg-blue-50/80 hover:bg-blue-100/70'
                      : 'hover:bg-[#F4F6F9]'
                  }`}
                >
                  <label className={`flex items-center gap-2.5 flex-1 ${col.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={col.visible}
                      disabled={col.disabled}
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
                    disabled={col.disabled}
                    onClick={() => {
                      setColumns((prev) =>
                        prev.map((c, ci) => (ci === idx ? { ...c, pinned: !c.pinned } : c))
                      );
                    }}
                    title={col.pinned ? '取消固定列' : '固定列'}
                    className={`p-0.5 rounded transition ${
                      col.disabled
                        ? 'cursor-not-allowed text-gray-300'
                        : col.pinned
                        ? 'text-blue-600 hover:bg-blue-100 cursor-pointer'
                        : 'text-[#B5B8AE] hover:text-[#1E40AF] cursor-pointer'
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

      {/* F1 同步弹窗 */}
      {isSyncModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSyncModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">同步计划单</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-medium text-[#1E293B]">
                    <span className="text-[#EA580C] mr-1">*</span>工厂
                  </label>
                  <input
                    type="text"
                    value={syncFactory}
                    onChange={(e) => {
                      setSyncFactory(e.target.value);
                      if (e.target.value.trim()) setSyncFactoryErr(false);
                    }}
                    placeholder="请输入工厂代码，如 1050"
                    className={`w-full h-9 px-3 border rounded-xl outline-none bg-white text-[#1E293B] ${
                      syncFactoryErr
                        ? 'border-[#EA580C] ring-1 ring-[#EA580C]/30'
                        : 'border-[#E5E9F0] focus:border-[#2563EB]'
                    }`}
                  />
                  {syncFactoryErr && (
                    <p className="text-[11px] text-[#EA580C]">请输入工厂</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-[#1E293B]">物料料号</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={syncMat}
                      onChange={(e) => setSyncMat(e.target.value)}
                      placeholder="请选择"
                      className="w-full h-9 pl-3 pr-8 border border-[#E5E9F0] rounded-xl outline-none bg-white text-[#1E293B] focus:border-[#2563EB]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-[#64748B]">可为空，为空时同步全部物料</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-[#1E293B]">计划开始日期</label>
                  <input
                    type="date"
                    value={syncStartDate}
                    onChange={(e) => setSyncStartDate(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E5E9F0] rounded-xl outline-none bg-white text-[#1E293B] font-mono focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-[#1E293B]">最后修改时间</label>
                  <input
                    type="date"
                    value={syncLastModDate}
                    onChange={(e) => setSyncLastModDate(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E5E9F0] rounded-xl outline-none bg-white text-[#1E293B] font-mono focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold">业务规则提示：</span>
                支持按工厂与增量时间戳从 SAP 同步未转制令单的 MRP 计划单；工厂为必填过滤范围，「最后修改时间」用于增量拉取变更单据。
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

      {/* F2 工单信息弹窗 */}
      {isWoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWoModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Head */}
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {woModalMode === 'add'
                    ? '新增工单'
                    : woModalMode === 'convert'
                    ? '计划单转工单 · 工单信息'
                    : '工单信息'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWoModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {/* 3-Column Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">工单号</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.woNo}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono cursor-not-allowed"
                  />
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
                    placeholder="自动带出或输入"
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#1E293B] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">产品规格</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.spec}
                    placeholder="请输入"
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">产品版本</label>
                  <input
                    type="text"
                    readOnly
                    value={woForm.version}
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
                      value={woForm.customer}
                      onChange={(e) => setWoForm((prev) => ({ ...prev, customer: e.target.value }))}
                      placeholder="请选择"
                      className="w-full h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB]"
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
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">导段管控</label>
                  <input
                    type="text"
                    value={woForm.guideControl}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, guideControl: e.target.value }))}
                    placeholder="请输入"
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">SAP版本号</label>
                  <select
                    value={woForm.sapVersion}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, sapVersion: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
                  >
                    <option value="SA非全">SA非全</option>
                    <option value="SA全">SA全</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#1E40AF] shrink-0">
                      <span className="text-[#EA580C] mr-0.5">*</span>计划单号
                    </label>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={woForm.planNo}
                        onChange={(e) => {
                          setWoForm((prev) => ({ ...prev, planNo: e.target.value }));
                          if (e.target.value.trim()) {
                            setWoFormErrors((prev) => ({ ...prev, planNo: false }));
                          }
                        }}
                        placeholder="请选择"
                        className={`w-full h-8 pl-2.5 pr-7 border rounded-lg bg-white text-[#1E293B] font-mono outline-none ${
                          woFormErrors.planNo
                            ? 'border-[#EA580C]'
                            : 'border-[#E5E9F0] focus:border-[#2563EB]'
                        }`}
                      />
                      <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>
                  {woFormErrors.planNo && (
                    <span className="text-[11px] text-[#EA580C] pl-26 mt-0.5">请选择计划单号</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">自动下达制令单</label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={woForm.autoReleaseMo}
                    onClick={() => {
                      const next = !woForm.autoReleaseMo;
                      setWoForm((prev) => ({ ...prev, autoReleaseMo: next }));
                      onShowToast(
                        next ? '已开启自动下达制令单' : '已关闭自动下达制令单',
                        'info'
                      );
                    }}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                      woForm.autoReleaseMo ? 'bg-[#165DFF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                        woForm.autoReleaseMo ? 'translate-x-5 left-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">工艺</label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={woForm.craft}
                      onChange={(e) => setWoForm((prev) => ({ ...prev, craft: e.target.value }))}
                      placeholder="请选择"
                      className="w-full h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">工艺版本</label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={woForm.craftVersion}
                      onChange={(e) =>
                        setWoForm((prev) => ({ ...prev, craftVersion: e.target.value }))
                      }
                      placeholder="请选择"
                      className="w-full h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">生产阶段</label>
                  <select
                    value={woForm.prodStage}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, prodStage: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
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
                    <option value="">请选择</option>
                    <option value="一线">一线</option>
                    <option value="二线">二线</option>
                    {FACTORY_LINES.map((ln) => (
                      <option key={ln} value={ln}>
                        {ln}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculation Notice Box */}
                <div className="border border-[#E5E9F0] rounded-xl p-3 bg-[#FFFFFF] space-y-1.5">
                  <div className="font-semibold text-[#1E293B] text-[11px]">
                    要求：产品、线别、节拍、预计开工时间必需配置
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748B]">当前节拍</span>
                    <strong className="font-mono text-[#1E293B]">{currentLineBeat}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748B]">理论产量计算</span>
                    <strong className="font-mono tabular-nums text-[#1E40AF] text-sm">
                      {woForm.theoryQty}
                    </strong>
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] pt-1 border-t border-[#EDF2F7] truncate">
                    id: {woForm.recordId}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">销售单号</label>
                  <input
                    type="text"
                    value={woForm.soNo}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, soNo: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-[#1E40AF] shrink-0">销售单行项目</label>
                  <input
                    type="text"
                    value={woForm.soItemNo}
                    onChange={(e) => setWoForm((prev) => ({ ...prev, soItemNo: e.target.value }))}
                    className="flex-1 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
                  />
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

              {/* 工单BOM Section */}
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
                            onChange={(e) => {
                              setSelectedBomIds(
                                e.target.checked ? bomItems.map((b) => b.id) : []
                              );
                            }}
                            className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                          />
                        </th>
                        <th className="p-2 border-b border-r border-[#E5E9F0] w-16">项次</th>
                        <th className="p-2 border-b border-r border-[#E5E9F0] w-28">
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
                      {bomItems.map((bom) => {
                        const isExpanded = expandedBomIds.includes(bom.id);
                        const isEditing = editingBomId === bom.id;
                        return (
                          <React.Fragment key={bom.id}>
                            <tr className="hover:bg-[#F4F6F9]">
                              <td className="p-2 border-r border-[#EDF2F7] text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedBomIds.includes(bom.id)}
                                  onChange={(e) => {
                                    setSelectedBomIds((prev) =>
                                      e.target.checked
                                        ? [...prev, bom.id]
                                        : prev.filter((id) => id !== bom.id)
                                    );
                                  }}
                                  className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                                />
                              </td>
                              <td className="p-2 border-r border-[#EDF2F7] font-mono">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedBomIds((prev) =>
                                      prev.includes(bom.id)
                                        ? prev.filter((id) => id !== bom.id)
                                        : [...prev, bom.id]
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-[#1E40AF] hover:text-[#1E293B] cursor-pointer"
                                >
                                  <span>{isExpanded ? '▾' : '▸'}</span>
                                  <span>{bom.seq}</span>
                                </button>
                              </td>
                              <td className="p-2 border-r border-[#EDF2F7]">
                                {isEditing ? (
                                  <select
                                    value={bom.stage}
                                    onChange={(e) =>
                                      setBomItems((prev) =>
                                        prev.map((x) =>
                                          x.id === bom.id ? { ...x, stage: e.target.value } : x
                                        )
                                      )
                                    }
                                    className="w-full h-7 px-1.5 border border-[#E5E9F0] rounded bg-white"
                                  >
                                    <option value="彩印">彩印</option>
                                    <option value="拉伸">拉伸</option>
                                    <option value="包装">包装</option>
                                  </select>
                                ) : (
                                  bom.stage || '—'
                                )}
                              </td>
                              <td className="p-2 border-r border-[#EDF2F7] font-mono">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={bom.materialNo}
                                    onChange={(e) =>
                                      setBomItems((prev) =>
                                        prev.map((x) =>
                                          x.id === bom.id
                                            ? { ...x, materialNo: e.target.value }
                                            : x
                                        )
                                      )
                                    }
                                    placeholder="料号"
                                    className="w-full h-7 px-1.5 border border-[#E5E9F0] rounded bg-white"
                                  />
                                ) : (
                                  bom.materialNo || '—'
                                )}
                              </td>
                              <td className="p-2 border-r border-[#EDF2F7]">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={bom.materialName}
                                    onChange={(e) =>
                                      setBomItems((prev) =>
                                        prev.map((x) =>
                                          x.id === bom.id
                                            ? { ...x, materialName: e.target.value }
                                            : x
                                        )
                                      )
                                    }
                                    placeholder="物料名称"
                                    className="w-full h-7 px-1.5 border border-[#E5E9F0] rounded bg-white"
                                  />
                                ) : (
                                  bom.materialName || '—'
                                )}
                              </td>
                              <td className="p-2 border-r border-[#EDF2F7] text-[#1E40AF]">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={bom.spec}
                                    onChange={(e) =>
                                      setBomItems((prev) =>
                                        prev.map((x) =>
                                          x.id === bom.id ? { ...x, spec: e.target.value } : x
                                        )
                                      )
                                    }
                                    placeholder="规格"
                                    className="w-full h-7 px-1.5 border border-[#E5E9F0] rounded bg-white"
                                  />
                                ) : (
                                  bom.spec || '—'
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingBomId(isEditing ? null : bom.id)
                                    }
                                    className="text-[#1E40AF] hover:underline cursor-pointer"
                                  >
                                    {isEditing ? '完成' : '修改'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setBomItems((prev) => prev.filter((x) => x.id !== bom.id))
                                    }
                                    className="text-[#EA580C] hover:underline cursor-pointer"
                                  >
                                    删除
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-[#FFFFFF] text-[11px] text-[#1E40AF]">
                                <td colSpan={7} className="px-10 py-2 border-t border-[#EDF2F7]">
                                  <span>单耗：<strong className="font-mono">{bom.dosage ?? 1}</strong> {bom.unit || '件'}</span>
                                  <span className="mx-3 text-[#CBD5E1]">|</span>
                                  <span>
                                    需求估算：
                                    <strong className="font-mono">
                                      {((parseFloat(woForm.planQty) || 0) * (bom.dosage ?? 1)).toLocaleString()}
                                    </strong>{' '}
                                    {bom.unit || '件'}
                                  </span>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
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

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleWoCalcQty}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer mr-auto"
              >
                计算数量
              </button>
              <button
                type="button"
                onClick={() => setIsWoModalOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleWoSave}
                className="px-5 py-1.5 bg-[#165DFF] text-white rounded-xl text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                保存
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
                <h3 className="text-sm font-bold text-[#1E293B]">计划单 · 页面流程总览</h3>
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
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">计划单列表</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      筛选区 + 数据表格 + 分页。集中管理计划单，支持查询、同步、新增、转工单、列设置等操作。
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
                    <div className="text-[11px] font-mono text-[#EA580C] mb-1">F1 · 弹窗</div>
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">同步</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      由列表页「同步」按钮唤起。按工厂、物料料号、日期范围筛选后从上游同步计划数据。
                    </p>
                  </div>
                  <span className="text-[#1E40AF] font-bold mt-3 inline-block">打开同步 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    openWoModal('edit', planOrders[0]);
                  }}
                  className="text-left bg-white border border-[#E5E9F0] hover:border-[#165DFF] rounded-xl p-4 transition shadow-2xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-mono text-[#EA580C] mb-1">F2 · 弹窗</div>
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">工单信息</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      由「新增 / 修改 / 转工单」唤起。含工单主表单与工单 BOM 明细，支持保存与数量计算。
                    </p>
                  </div>
                  <span className="text-[#1E40AF] font-bold mt-3 inline-block">打开工单信息 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFlowModalOpen(false);
                    setIsColPanelOpen(true);
                  }}
                  className="text-left bg-white border border-[#E5E9F0] hover:border-[#165DFF] rounded-xl p-4 transition shadow-2xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-mono text-[#EA580C] mb-1">F3 · 浮层</div>
                    <div className="text-sm font-bold text-[#1E293B] mb-1.5">列设置</div>
                    <p className="text-[#1E40AF] leading-relaxed">
                      由工具栏齿轮唤起。勾选字段可实时控制列表列的显示 / 隐藏，支持默认配置重置。
                    </p>
                  </div>
                  <span className="text-[#1E40AF] font-bold mt-3 inline-block">打开列设置 →</span>
                </button>
              </div>

              <div className="bg-white border border-[#E5E9F0] rounded-xl p-3.5 text-[#1E40AF] leading-relaxed">
                <strong className="text-[#1E293B]">流转路径：</strong>
                列表页 P1 → 同步 F1 / 工单信息 F2 / 列设置 F3。支持筛选查询、重置、单选/全选、行高亮、排序、修改/删除/转工单、同步校验、开关切换、BOM 增删改查与列显隐实时联动。
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
