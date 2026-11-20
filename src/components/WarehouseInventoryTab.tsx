import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Plus,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';

export type InventoryType = '盘盈' | '盘亏';
export type OaAuditStatus = '审核通过' | '待审核' | '审核驳回' | '草稿';
export type TextFilterOp = 'contains' | 'equals' | 'not_contains';
export type DateFilterOp = 'eq' | 'gte' | 'lte' | 'ne';
export type DrawerMode = 'create' | 'edit' | 'view';

export interface InventoryBarcodeLine {
  id: string;
  barcodeQty: number;
  countQty: number;
  barcode: string;
  materialCode: string;
  storageLocation: string;
  costCenter: string;
}

export interface WarehouseInventoryRecord {
  id: string;
  org: string;
  inventoryNo: string;
  inventoryType: InventoryType;
  processTitle: string;
  description: string;
  postingDate: string;
  oaAuditStatus: OaAuditStatus;
  fiscalYear: string;
  oaOrderNo: string;
  businessCompany: string;
  moveType: string;
  businessCompanyCode: string;
  createdAt: string;
  creator: string;
  oaCallbackMsg: string;
  systemType: string;
  oaCallbackStatus: string;
  oaAuditStatusCode: string;
  workflowId: string;
  tableName: string;
  textContent: string;
  barcodes: InventoryBarcodeLine[];
}

interface WarehouseInventoryTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ORG_OPTIONS = [
  '昇兴集团-中山制罐工厂',
  '昇兴集团-福建制罐工厂',
  '昇兴集团-山东制罐工厂',
];

const MATERIAL_SUGGESTIONS = [
  '80001021',
  '80001022',
  '80001035',
  '80002008',
];

const INITIAL_RECORDS: WarehouseInventoryRecord[] = [
  {
    id: 'inv-1',
    org: '昇兴集团-中山制罐工厂',
    inventoryNo: '2026050900001',
    inventoryType: '盘盈',
    processTitle: '2026年制罐废铁盘点申请单',
    description:
      '制罐废铁存放在户外，因雨水天气影响，2026年4月份废铁称重入库和出库时产生了255KG的磅差差异，属于正常磅差差异，申请做盘盈处理。',
    postingDate: '2026-05-09',
    oaAuditStatus: '审核通过',
    fiscalYear: '2026',
    oaOrderNo: 'SX-PDSP-20260509001',
    businessCompany: '3',
    moveType: 'Z45',
    businessCompanyCode: '1050',
    createdAt: '2026-05-09 14:55:26',
    creator: '孙运妹',
    oaCallbackMsg: '回传OA成功更新完成',
    systemType: '0',
    oaCallbackStatus: '',
    oaAuditStatusCode: '2',
    workflowId: '825',
    tableName: 'formtable_main_801',
    textContent: '文本内容',
    barcodes: [
      {
        id: 'bc-101',
        barcodeQty: 1250,
        countQty: 1505,
        barcode: 'FT202605090001',
        materialCode: '80001021',
        storageLocation: '3109',
        costCenter: '10500101',
      },
    ],
  },
  {
    id: 'inv-2',
    org: '昇兴集团-中山制罐工厂',
    inventoryNo: '2026032500001',
    inventoryType: '盘盈',
    processTitle: '2026年3月份制罐废铁盘点申请单',
    description: '2026年3月19日出库数与称重入库数存在180KG磅差差异，经复核属正常误差，申请做盘盈处理。',
    postingDate: '2026-04-03',
    oaAuditStatus: '审核通过',
    fiscalYear: '2026',
    oaOrderNo: 'SX-PDSP-20260325001',
    businessCompany: '3',
    moveType: 'Z45',
    businessCompanyCode: '1050',
    createdAt: '2026-03-25 10:18:42',
    creator: '孙运妹',
    oaCallbackMsg: '回传OA成功更新完成',
    systemType: '0',
    oaCallbackStatus: '',
    oaAuditStatusCode: '2',
    workflowId: '825',
    tableName: 'formtable_main_801',
    textContent: '文本内容',
    barcodes: [
      {
        id: 'bc-201',
        barcodeQty: 2400,
        countQty: 2580,
        barcode: 'FT202603250001',
        materialCode: '80001021',
        storageLocation: '3109',
        costCenter: '10500101',
      },
    ],
  },
  {
    id: 'inv-3',
    org: '昇兴集团-中山制罐工厂',
    inventoryNo: '2026013000001',
    inventoryType: '盘盈',
    processTitle: '大张废铁盘点差异处理申请单',
    description: '2026年1月27日出库数与大张废铁账面库存核对产生120KG盈余差异，申请做盘盈处理。',
    postingDate: '2026-01-30',
    oaAuditStatus: '审核通过',
    fiscalYear: '2026',
    oaOrderNo: 'SX-PDSP-20260130001',
    businessCompany: '3',
    moveType: 'Z45',
    businessCompanyCode: '1050',
    createdAt: '2026-01-30 16:04:11',
    creator: '孙运妹',
    oaCallbackMsg: '回传OA成功更新完成',
    systemType: '0',
    oaCallbackStatus: '',
    oaAuditStatusCode: '2',
    workflowId: '825',
    tableName: 'formtable_main_801',
    textContent: '文本内容',
    barcodes: [
      {
        id: 'bc-301',
        barcodeQty: 3100,
        countQty: 3220,
        barcode: 'FT202601300001',
        materialCode: '80001022',
        storageLocation: '3109',
        costCenter: '10500102',
      },
    ],
  },
  {
    id: 'inv-4',
    org: '昇兴集团-中山制罐工厂',
    inventoryNo: '2026012900001',
    inventoryType: '盘亏',
    processTitle: '制罐废铁盘点差异处理申请单',
    description: '2026年1月27日出库数与现场实物复盘存在95KG短少差异，申请做盘亏处理。',
    postingDate: '2026-01-29',
    oaAuditStatus: '审核通过',
    fiscalYear: '2026',
    oaOrderNo: 'SX-PDSP-20260129001',
    businessCompany: '3',
    moveType: 'Z46',
    businessCompanyCode: '1050',
    createdAt: '2026-01-29 11:32:09',
    creator: '孙运妹',
    oaCallbackMsg: '回传OA成功更新完成',
    systemType: '0',
    oaCallbackStatus: '',
    oaAuditStatusCode: '2',
    workflowId: '825',
    tableName: 'formtable_main_801',
    textContent: '文本内容',
    barcodes: [
      {
        id: 'bc-401',
        barcodeQty: 1980,
        countQty: 1885,
        barcode: 'FT202601290001',
        materialCode: '80001021',
        storageLocation: '3109',
        costCenter: '10500101',
      },
    ],
  },
];

type MainSortField =
  | 'inventoryNo'
  | 'inventoryType'
  | 'processTitle'
  | 'description'
  | 'postingDate'
  | 'oaAuditStatus'
  | 'fiscalYear'
  | 'oaOrderNo';

type BarcodeSortField =
  | 'barcodeQty'
  | 'countQty'
  | 'barcode'
  | 'materialCode'
  | 'storageLocation'
  | 'costCenter';

type ColumnKey =
  | 'inventoryNo'
  | 'inventoryType'
  | 'processTitle'
  | 'description'
  | 'postingDate'
  | 'oaAuditStatus'
  | 'fiscalYear'
  | 'oaOrderNo';

const ALL_COLUMNS: { key: ColumnKey; label: string; width: string }[] = [
  { key: 'inventoryNo', label: '盘点单号', width: 'w-[148px]' },
  { key: 'inventoryType', label: '盘点类型', width: 'w-[100px]' },
  { key: 'processTitle', label: '流程标题', width: 'w-[205px]' },
  { key: 'description', label: '说明', width: 'w-[215px]' },
  { key: 'postingDate', label: '过账日期', width: 'w-[125px]' },
  { key: 'oaAuditStatus', label: 'OA审核状态', width: 'w-[120px]' },
  { key: 'fiscalYear', label: '年度', width: 'w-[96px]' },
  { key: 'oaOrderNo', label: 'OA单号', width: 'w-[178px]' },
];

function formatDateTimeNow(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function formatDateToday(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function generateInventoryNo(existing: WarehouseInventoryRecord[]): string {
  const todayCompact = formatDateToday().replace(/-/g, '');
  let seq = 1;
  let candidate = `${todayCompact}${String(seq).padStart(5, '0')}`;
  while (existing.some((r) => r.inventoryNo === candidate)) {
    seq += 1;
    candidate = `${todayCompact}${String(seq).padStart(5, '0')}`;
  }
  return candidate;
}

function matchText(value: string, query: string, op: TextFilterOp): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const v = value.toLowerCase();
  if (op === 'equals') return v === q;
  if (op === 'not_contains') return !v.includes(q);
  return v.includes(q);
}

function matchDate(value: string, query: string, op: DateFilterOp): boolean {
  const q = query.trim();
  if (!q) return true;
  if (op === 'eq') return value === q;
  if (op === 'gte') return value >= q;
  if (op === 'lte') return value <= q;
  return value !== q;
}

export const WarehouseInventoryTab: React.FC<WarehouseInventoryTabProps> = ({
  onShowToast,
}) => {
  const [records, setRecords] = useState<WarehouseInventoryRecord[]>(INITIAL_RECORDS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter form inputs
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('');
  const [titleOp, setTitleOp] = useState<TextFilterOp>('contains');
  const [titleQuery, setTitleQuery] = useState('');
  const [descOp, setDescOp] = useState<TextFilterOp>('contains');
  const [descQuery, setDescQuery] = useState('');
  const [dateOp, setDateOp] = useState<DateFilterOp>('eq');
  const [dateQuery, setDateQuery] = useState('');
  const [typeOp, setTypeOp] = useState<TextFilterOp>('contains');
  const [typeQuery, setTypeQuery] = useState('');

  // Applied filters (triggered by 查询 / 重置)
  const [appliedFilter, setAppliedFilter] = useState({
    org: '',
    titleOp: 'contains' as TextFilterOp,
    titleQuery: '',
    descOp: 'contains' as TextFilterOp,
    descQuery: '',
    dateOp: 'eq' as DateFilterOp,
    dateQuery: '',
    typeOp: 'contains' as TextFilterOp,
    typeQuery: '',
  });

  // Sorting & Pagination
  const [sortField, setSortField] = useState<MainSortField | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column visibility settings modal
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    inventoryNo: true,
    inventoryType: true,
    processTitle: true,
    description: true,
    postingDate: true,
    oaAuditStatus: true,
    fiscalYear: true,
    oaOrderNo: true,
  });
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Unified Drawer State (create / edit / view)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('edit');
  const [formState, setFormState] = useState<WarehouseInventoryRecord | null>(null);
  const [drawerSelectedBarcodes, setDrawerSelectedBarcodes] = useState<string[]>([]);
  const [barcodeSortField, setBarcodeSortField] = useState<BarcodeSortField | null>(null);
  const [barcodeSortDir, setBarcodeSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredRecords = useMemo(() => {
    const list = records.filter((rec) => {
      if (appliedFilter.org && rec.org !== appliedFilter.org) return false;
      if (!matchText(rec.processTitle, appliedFilter.titleQuery, appliedFilter.titleOp)) {
        return false;
      }
      if (!matchText(rec.description, appliedFilter.descQuery, appliedFilter.descOp)) {
        return false;
      }
      if (!matchDate(rec.postingDate, appliedFilter.dateQuery, appliedFilter.dateOp)) {
        return false;
      }
      if (!matchText(rec.inventoryType, appliedFilter.typeQuery, appliedFilter.typeOp)) {
        return false;
      }
      return true;
    });

    if (!sortField) return list;
    return [...list].sort((a, b) => {
      const av = a[sortField] || '';
      const bv = b[sortField] || '';
      const cmp = av.localeCompare(bv, 'zh-CN');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [records, appliedFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  const allVisibleChecked =
    pagedRecords.length > 0 && pagedRecords.every((r) => selectedIds.includes(r.id));

  const handleToggleAllVisible = () => {
    if (allVisibleChecked) {
      setSelectedIds((prev) => prev.filter((id) => !pagedRecords.some((r) => r.id === id)));
    } else {
      const visibleIds = pagedRecords.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field: MainSortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSearch = () => {
    setAppliedFilter({
      org: orgFilter,
      titleOp,
      titleQuery,
      descOp,
      descQuery,
      dateOp,
      dateQuery,
      typeOp,
      typeQuery,
    });
    setCurrentPage(1);
    onShowToast('已刷新仓库盘点查询结果', 'info');
  };

  const handleReset = () => {
    setOrgFilter('');
    setTitleOp('contains');
    setTitleQuery('');
    setDescOp('contains');
    setDescQuery('');
    setDateOp('eq');
    setDateQuery('');
    setTypeOp('contains');
    setTypeQuery('');
    setAppliedFilter({
      org: '',
      titleOp: 'contains',
      titleQuery: '',
      descOp: 'contains',
      descQuery: '',
      dateOp: 'eq',
      dateQuery: '',
      typeOp: 'contains',
      typeQuery: '',
    });
    setCurrentPage(1);
    onShowToast('查询条件已重置', 'info');
  };

  const openCreateDrawer = () => {
    const nextNo = generateInventoryNo(records);
    const today = formatDateToday();
    const newRec: WarehouseInventoryRecord = {
      id: `inv-${Date.now()}`,
      org: orgFilter || ORG_OPTIONS[0],
      inventoryNo: nextNo,
      inventoryType: '盘盈',
      processTitle: '',
      description: '',
      postingDate: today,
      oaAuditStatus: '待审核',
      fiscalYear: today.slice(0, 4),
      oaOrderNo: `SX-PDSP-${nextNo.slice(0, 8)}${nextNo.slice(-3)}`,
      businessCompany: '3',
      moveType: 'Z45',
      businessCompanyCode: '1050',
      createdAt: formatDateTimeNow(),
      creator: '孙运妹',
      oaCallbackMsg: '',
      systemType: '0',
      oaCallbackStatus: '',
      oaAuditStatusCode: '0',
      workflowId: '825',
      tableName: 'formtable_main_801',
      textContent: '文本内容',
      barcodes: [],
    };
    setFormState(newRec);
    setDrawerSelectedBarcodes([]);
    setBarcodeSortField(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (rec: WarehouseInventoryRecord) => {
    setFormState({
      ...rec,
      barcodes: rec.barcodes.map((b) => ({ ...b })),
    });
    setDrawerSelectedBarcodes([]);
    setBarcodeSortField(null);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (rec: WarehouseInventoryRecord) => {
    setFormState({
      ...rec,
      barcodes: rec.barcodes.map((b) => ({ ...b })),
    });
    setDrawerSelectedBarcodes([]);
    setBarcodeSortField(null);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleOaCallback = (rec: WarehouseInventoryRecord) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.id === rec.id
          ? {
              ...item,
              oaAuditStatus: '审核通过',
              oaAuditStatusCode: '2',
              oaCallbackMsg: '回传OA成功更新完成',
              oaCallbackStatus: '成功',
            }
          : item
      )
    );
    onShowToast(`盘点单 ${rec.inventoryNo} 已成功回传OA并更新状态`, 'success');
  };

  const handleConfirmDelete = () => {
    const count = selectedIds.length;
    setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
    setIsDeleteModalOpen(false);
    onShowToast(`已删除 ${count} 条仓库盘点记录`, 'success');
  };

  const handleAddBarcodeRow = () => {
    if (!formState) return;
    const seq = formState.barcodes.length + 1;
    const prefix = formState.inventoryNo.slice(0, 8) || formatDateToday().replace(/-/g, '');
    const nextBarcode: InventoryBarcodeLine = {
      id: `bc-${Date.now()}-${seq}`,
      barcodeQty: 0,
      countQty: 0,
      barcode: `FT${prefix}${String(seq).padStart(4, '0')}`,
      materialCode: '80001021',
      storageLocation: '3109',
      costCenter: '10500101',
    };
    setFormState({
      ...formState,
      barcodes: [...formState.barcodes, nextBarcode],
    });
  };

  const handleUpdateBarcodeField = (
    lineId: string,
    field: keyof InventoryBarcodeLine,
    value: string | number
  ) => {
    if (!formState) return;
    setFormState({
      ...formState,
      barcodes: formState.barcodes.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      ),
    });
  };

  const handleRemoveBarcodeRow = (lineId: string) => {
    if (!formState) return;
    setFormState({
      ...formState,
      barcodes: formState.barcodes.filter((line) => line.id !== lineId),
    });
    setDrawerSelectedBarcodes((prev) => prev.filter((id) => id !== lineId));
  };

  const handleBarcodeSort = (field: BarcodeSortField) => {
    if (barcodeSortField === field) {
      setBarcodeSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setBarcodeSortField(field);
      setBarcodeSortDir('asc');
    }
  };

  const sortedDrawerBarcodes = useMemo(() => {
    if (!formState) return [];
    if (!barcodeSortField) return formState.barcodes;
    return [...formState.barcodes].sort((a, b) => {
      const av = a[barcodeSortField];
      const bv = b[barcodeSortField];
      if (typeof av === 'number' && typeof bv === 'number') {
        return barcodeSortDir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), 'zh-CN');
      return barcodeSortDir === 'asc' ? cmp : -cmp;
    });
  }, [formState, barcodeSortField, barcodeSortDir]);

  const handleSaveDrawer = () => {
    if (!formState) return;
    if (!formState.processTitle.trim()) {
      onShowToast('请填写必填项：流程标题', 'warning');
      return;
    }
    if (!formState.description.trim()) {
      onShowToast('请填写必填项：说明', 'warning');
      return;
    }
    if (!formState.postingDate.trim()) {
      onShowToast('请选择必填项：过账日期', 'warning');
      return;
    }
    if (!formState.businessCompany.trim()) {
      onShowToast('请填写必填项：业务归属公司', 'warning');
      return;
    }
    if (!formState.moveType.trim()) {
      onShowToast('请填写必填项：移动类型', 'warning');
      return;
    }
    if (!formState.businessCompanyCode.trim()) {
      onShowToast('请填写必填项：业务归属公司代码', 'warning');
      return;
    }
    if (!formState.systemType.trim()) {
      onShowToast('请填写必填项：系统类型', 'warning');
      return;
    }

    for (let i = 0; i < formState.barcodes.length; i += 1) {
      const row = formState.barcodes[i];
      if (Number.isNaN(row.countQty) || row.countQty < 0) {
        onShowToast(`第 ${i + 1} 行条码明细的盘点数量无效`, 'warning');
        return;
      }
      if (!row.storageLocation.trim() || !row.costCenter.trim()) {
        onShowToast(`第 ${i + 1} 行条码明细请补全库存地点与成本中心`, 'warning');
        return;
      }
    }

    const updatedRecord: WarehouseInventoryRecord = {
      ...formState,
      fiscalYear: formState.postingDate.slice(0, 4) || formState.fiscalYear,
    };

    if (drawerMode === 'create') {
      setRecords((prev) => [updatedRecord, ...prev]);
      onShowToast(`新增盘点单 ${updatedRecord.inventoryNo} 保存成功`, 'success');
    } else {
      setRecords((prev) =>
        prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
      );
      onShowToast(`盘点单 ${updatedRecord.inventoryNo} 修改已保存`, 'success');
    }
    setDrawerOpen(false);
  };

  const renderInventoryTypeBadge = (type: InventoryType) => {
    if (type === '盘盈') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[12px] font-medium rounded-xs bg-[#E6F4FF] text-[#1890FF]">
          盘盈
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[12px] font-medium rounded-xs bg-[#FFF7E6] text-[#FA8C16]">
        盘亏
      </span>
    );
  };

  const renderAuditStatusBadge = (status: OaAuditStatus) => {
    if (status === '审核通过') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[12px] font-medium rounded-xs bg-[#42C686] text-white">
          审核通过
        </span>
      );
    }
    if (status === '待审核') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[12px] font-medium rounded-xs bg-[#FAAD14] text-white">
          待审核
        </span>
      );
    }
    if (status === '审核驳回') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[12px] font-medium rounded-xs bg-[#FF4D4F] text-white">
          审核驳回
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[12px] font-medium rounded-xs bg-[#94A3B8] text-white">
        草稿
      </span>
    );
  };

  const isReadOnly = drawerMode === 'view';
  const drawerTitle =
    drawerMode === 'create'
      ? '新增-标题'
      : drawerMode === 'edit'
      ? '修改-标题'
      : '查看-标题';

  const allDrawerBarcodesChecked =
    sortedDrawerBarcodes.length > 0 &&
    sortedDrawerBarcodes.every((b) => drawerSelectedBarcodes.includes(b.id));

  return (
    <div className="space-y-4 relative text-xs text-[#1E293B]">
      {/* Filter Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          {/* Top Row Left: Title + 组织机构 */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">仓库盘点</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">组织机构</label>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="">请选择</option>
                {ORG_OPTIONS.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Row Right: 重置 / 查询 / 列设置 / 折叠 */}
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
              onClick={handleSearch}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={() => setIsColumnSettingsOpen(true)}
              title="列设置"
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] flex items-center justify-center transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFilterCollapsed((prev) => !prev)}
              title={filterCollapsed ? '展开筛选' : '收起筛选'}
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg flex items-center justify-center text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer"
            >
              {filterCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Rows 2 & 3 */}
        {!filterCollapsed && (
          <div className="space-y-2.5 pt-0.5">
            {/* Row 2: 流程标题 | 说明 | 过账日期 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              {/* 流程标题 */}
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  流程标题
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={titleOp}
                    onChange={(e) => setTitleOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={titleQuery}
                    onChange={(e) => setTitleQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              {/* 说明 */}
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  说明
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={descOp}
                    onChange={(e) => setDescOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={descQuery}
                    onChange={(e) => setDescQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              {/* 过账日期 */}
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  过账日期
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={dateOp}
                    onChange={(e) => setDateOp(e.target.value as DateFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="eq">=</option>
                    <option value="gte">&gt;=</option>
                    <option value="lte">&lt;=</option>
                    <option value="ne">!=</option>
                  </select>
                  <input
                    type="date"
                    value={dateQuery}
                    onChange={(e) => setDateQuery(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 text-xs font-mono text-[#1E293B] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: 盘点类型 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  盘点类型
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={typeOp}
                    onChange={(e) => setTypeOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <input
                    type="text"
                    list="inventory-type-filter-list"
                    value={typeQuery}
                    onChange={(e) => setTypeQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                  <datalist id="inventory-type-filter-list">
                    <option value="盘盈" />
                    <option value="盘亏" />
                  </datalist>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative flex flex-col min-h-[520px]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选{' '}
              <strong className="font-mono tabular-nums text-[#1E293B]">
                {selectedIds.length}
              </strong>{' '}
              项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配{' '}
              <strong className="font-mono tabular-nums text-[#1E293B]">
                {filteredRecords.length}
              </strong>{' '}
              条盘点单
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={openCreateDrawer}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增盘点</span>
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => setIsDeleteModalOpen(true)}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 ${
                selectedIds.length > 0
                  ? 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10 cursor-pointer'
                  : 'border-[#E5E9F0] bg-gray-50 text-[#64748B] opacity-60 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
            </button>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleChecked}
                    onChange={handleToggleAllVisible}
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                {ALL_COLUMNS.map(
                  (col) =>
                    visibleColumns[col.key] && (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`${col.width} p-2.5 border-b border-r border-[#E5E9F0] text-left cursor-pointer hover:bg-[#EDF2F7]/70 select-none transition`}
                      >
                        <div className="inline-flex items-center gap-1">
                          <span>{col.label}</span>
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              sortField === col.key ? 'text-[#1E40AF]' : 'text-[#C5C8BE]'
                            }`}
                          />
                        </div>
                      </th>
                    )
                )}
                <th className="p-2.5 border-b border-[#E5E9F0] w-36 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <div className="inline-flex items-center gap-2">
                    <span>操作</span>
                    <button
                      type="button"
                      onClick={() => setIsColumnSettingsOpen(true)}
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
              {pagedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      2 + Object.values(visibleColumns).filter(Boolean).length
                    }
                    className="py-16 text-center text-[#64748B]"
                  >
                    暂无符合条件的仓库盘点单据
                  </td>
                </tr>
              ) : (
                pagedRecords.map((rec) => {
                  const isChecked = selectedIds.includes(rec.id);
                  return (
                    <tr
                      key={rec.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('input')) return;
                        handleToggleRow(rec.id);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#EBF2FF]/60 hover:bg-[#EBF2FF]/80'
                          : 'hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(rec.id)}
                          className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                        />
                      </td>
                      {visibleColumns.inventoryNo && (
                        <td className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums font-bold text-[#1E40AF]">
                          <button
                            type="button"
                            onClick={() => openEditDrawer(rec)}
                            className="hover:text-[#1E293B] hover:underline cursor-pointer"
                          >
                            {rec.inventoryNo}
                          </button>
                        </td>
                      )}
                      {visibleColumns.inventoryType && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                          {renderInventoryTypeBadge(rec.inventoryType)}
                        </td>
                      )}
                      {visibleColumns.processTitle && (
                        <td
                          className="p-2.5 border-r border-[#EDF2F7] max-w-[205px] truncate text-[#1E293B]"
                          title={rec.processTitle}
                        >
                          {rec.processTitle}
                        </td>
                      )}
                      {visibleColumns.description && (
                        <td
                          className="p-2.5 border-r border-[#EDF2F7] max-w-[215px] truncate text-[#64748B]"
                          title={rec.description}
                        >
                          {rec.description}
                        </td>
                      )}
                      {visibleColumns.postingDate && (
                        <td className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums text-[#1E293B]">
                          {rec.postingDate}
                        </td>
                      )}
                      {visibleColumns.oaAuditStatus && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                          {renderAuditStatusBadge(rec.oaAuditStatus)}
                        </td>
                      )}
                      {visibleColumns.fiscalYear && (
                        <td className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums text-[#1E293B]">
                          {rec.fiscalYear}
                        </td>
                      )}
                      {visibleColumns.oaOrderNo && (
                        <td
                          className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums text-[#1E293B] max-w-[178px] truncate"
                          title={rec.oaOrderNo}
                        >
                          {rec.oaOrderNo}
                        </td>
                      )}
                      <td
                        className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isChecked ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                      >
                        <div className="inline-flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => openEditDrawer(rec)}
                            className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                          >
                            修改
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOaCallback(rec)}
                            className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                          >
                            OA回传
                          </button>
                          <button
                            type="button"
                            onClick={() => openViewDrawer(rec)}
                            className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                          >
                            查看
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

        {/* Pagination Bar (工单管理风格) */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计{' '}
            <strong className="font-mono tabular-nums text-[#1E293B]">
              {filteredRecords.length}
            </strong>{' '}
            条
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-lg border text-xs font-mono cursor-pointer transition ${
                  page === safePage
                    ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                    : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:border-[#2563EB]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
      </div>

      {/* Column Visibility Modal */}
      {isColumnSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs shadow-xl w-full max-w-[380px] border border-[#E5E9F0]">
            <div className="px-4 py-3 border-b border-[#E8EDF4] flex items-center justify-between">
              <span className="font-medium text-[14px] text-[#1E293B]">列表字段显示设置</span>
              <button
                type="button"
                onClick={() => setIsColumnSettingsOpen(false)}
                className="text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5">
              {ALL_COLUMNS.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 text-[13px] text-[#334155] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key]}
                    onChange={(e) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col.key]: e.target.checked,
                      }))
                    }
                    className="w-3.5 h-3.5 accent-[#1890FF]"
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-[#E8EDF4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setVisibleColumns({
                    inventoryNo: true,
                    inventoryType: true,
                    processTitle: true,
                    description: true,
                    postingDate: true,
                    oaAuditStatus: true,
                    fiscalYear: true,
                    oaOrderNo: true,
                  })
                }
                className="h-[30px] px-3 text-[12px] border border-[#D9D9D9] text-[#475569] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] cursor-pointer"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => setIsColumnSettingsOpen(false)}
                className="h-[30px] px-4 text-[12px] bg-[#1890FF] text-white rounded-xs hover:bg-[#096DD9] cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs shadow-xl w-full max-w-[400px] border border-[#E5E9F0]">
            <div className="px-4 py-3 border-b border-[#E8EDF4] flex items-center justify-between">
              <span className="font-medium text-[14px] text-[#1E293B]">删除确认</span>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-[13px] text-[#475569]">
              确定要删除已勾选的 <span className="font-semibold text-[#1E293B]">{selectedIds.length}</span>{' '}
              条仓库盘点记录吗？删除后将无法恢复。
            </div>
            <div className="px-4 py-2.5 border-t border-[#E8EDF4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="h-[30px] px-3.5 text-[13px] border border-[#D9D9D9] text-[#475569] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-[30px] px-4 text-[13px] bg-[#FF4D4F] text-white rounded-xs hover:bg-[#D9363E] cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Slide-Over Drawer for 新增 / 修改 / 查看 */}
      {drawerOpen && formState && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
          <div className="w-full max-w-[1160px] h-full bg-white shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="px-5 py-3.5 border-b border-[#E8EDF4] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-[15px] font-medium text-[#1E293B]">{drawerTitle}</h2>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Upper Form Section */}
              <div className="space-y-3.5">
                {/* Row 1: 盘点单号 | * 流程标题 | * 盘点类型 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      盘点单号
                    </label>
                    <input
                      type="text"
                      value={formState.inventoryNo}
                      disabled
                      className="flex-1 h-[32px] px-2.5 text-[13px] font-mono bg-[#F5F5F5] text-[#94A3B8] border border-[#E2E8F0] rounded-xs cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      <span className="text-[#FF4D4F] mr-1">*</span>流程标题
                    </label>
                    <input
                      type="text"
                      value={formState.processTitle}
                      disabled={isReadOnly}
                      placeholder="请输入流程标题"
                      onChange={(e) =>
                        setFormState({ ...formState, processTitle: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      <span className="text-[#FF4D4F] mr-1">*</span>盘点类型
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formState.inventoryType}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          const nextType = e.target.value as InventoryType;
                          setFormState({
                            ...formState,
                            inventoryType: nextType,
                            moveType:
                              formState.moveType === 'Z45' ||
                              formState.moveType === 'Z46' ||
                              !formState.moveType
                                ? nextType === '盘盈'
                                  ? 'Z45'
                                  : 'Z46'
                                : formState.moveType,
                          });
                        }}
                        className={`w-full h-[32px] pl-2.5 pr-7 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] appearance-none ${
                          isReadOnly
                            ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                            : 'bg-white text-[#334155]'
                        }`}
                      >
                        <option value="盘盈">盘盈</option>
                        <option value="盘亏">盘亏</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Row 2: * 说明 (full-width textarea) */}
                <div className="flex items-start gap-2.5">
                  <label className="w-[112px] pt-1.5 text-right text-[#475569] shrink-0">
                    <span className="text-[#FF4D4F] mr-1">*</span>说明
                  </label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    disabled={isReadOnly}
                    placeholder="请输入盘点差异说明"
                    onChange={(e) =>
                      setFormState({ ...formState, description: e.target.value })
                    }
                    className={`flex-1 px-2.5 py-2 text-[13px] border rounded-xs focus:outline-none focus:border-[#1890FF] resize-y ${
                      isReadOnly
                        ? 'bg-[#F5F5F5] text-[#64748B] border-[#E2E8F0] cursor-not-allowed'
                        : 'bg-white text-[#334155] border-[#1890FF]/80'
                    }`}
                  />
                </div>

                {/* Row 3: * 过账日期 | * 业务归属公司 | * 移动类型 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      <span className="text-[#FF4D4F] mr-1">*</span>过账日期
                    </label>
                    <input
                      type="date"
                      value={formState.postingDate}
                      disabled={isReadOnly}
                      onChange={(e) =>
                        setFormState({ ...formState, postingDate: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      <span className="text-[#FF4D4F] mr-1">*</span>业务归属公司
                    </label>
                    <input
                      type="text"
                      value={formState.businessCompany}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, businessCompany: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      <span className="text-[#FF4D4F] mr-1">*</span>移动类型
                    </label>
                    <input
                      type="text"
                      value={formState.moveType}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, moveType: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>
                </div>

                {/* Row 4: * 业务归属公司代码 | 创建时间 | 创建人 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      <span className="text-[#FF4D4F] mr-1">*</span>业务归属公司代码
                    </label>
                    <input
                      type="text"
                      value={formState.businessCompanyCode}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          businessCompanyCode: e.target.value,
                        })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      创建时间
                    </label>
                    <span className="text-[13px] font-mono tabular-nums text-[#334155]">
                      {formState.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      创建人
                    </label>
                    <span className="text-[13px] text-[#334155]">{formState.creator}</span>
                  </div>
                </div>
              </div>

              {/* Middle Barcode Line-Item Table Section */}
              <div className="space-y-2.5 pt-1">
                {!isReadOnly && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddBarcodeRow}
                      className="h-[32px] px-3.5 text-[13px] bg-white border border-[#D9D9D9] text-[#334155] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] transition-colors cursor-pointer"
                    >
                      新增条码
                    </button>
                    {drawerSelectedBarcodes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormState({
                            ...formState,
                            barcodes: formState.barcodes.filter(
                              (b) => !drawerSelectedBarcodes.includes(b.id)
                            ),
                          });
                          setDrawerSelectedBarcodes([]);
                        }}
                        className="h-[32px] px-3 text-[13px] bg-[#FFF1F0] border border-[#FFCCC7] text-[#CF1322] rounded-xs hover:bg-[#FFCCC7] transition-colors cursor-pointer"
                      >
                        删除选中 ({drawerSelectedBarcodes.length})
                      </button>
                    )}
                  </div>
                )}

                <div className="border border-[#E8EDF4] rounded-xs overflow-x-auto min-h-[168px] flex flex-col">
                  <datalist id="inventory-material-suggestions">
                    {MATERIAL_SUGGESTIONS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                  <table className="w-full min-w-[860px] border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-[#FFFFFF] border-b border-[#E5E9F0] text-[#1E40AF] font-semibold h-[38px]">
                        <th className="w-11 px-3 text-center border-r border-[#E5E9F0]">
                          <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={allDrawerBarcodesChecked}
                            onChange={() => {
                              if (allDrawerBarcodesChecked) {
                                setDrawerSelectedBarcodes([]);
                              } else {
                                setDrawerSelectedBarcodes(
                                  sortedDrawerBarcodes.map((b) => b.id)
                                );
                              }
                            }}
                            className="w-3.5 h-3.5 accent-[#165DFF] align-middle cursor-pointer disabled:cursor-not-allowed"
                          />
                        </th>
                        <th
                          onClick={() => handleBarcodeSort('barcodeQty')}
                          className="w-[120px] px-3 text-center border-r border-[#E5E9F0] cursor-pointer select-none hover:bg-[#EDF2F7]/70"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span>条码数量</span>
                            <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleBarcodeSort('countQty')}
                          className="w-[130px] px-3 text-center border-r border-[#E5E9F0] cursor-pointer select-none hover:bg-[#EDF2F7]/70"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span className="text-[#FF4D4F]">*</span>
                            <span>盘点数量</span>
                            <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleBarcodeSort('barcode')}
                          className="w-[180px] px-3 text-center border-r border-[#E5E9F0] cursor-pointer select-none hover:bg-[#EDF2F7]/70"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span>条码</span>
                            <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleBarcodeSort('materialCode')}
                          className="w-[135px] px-3 text-center border-r border-[#E5E9F0] cursor-pointer select-none hover:bg-[#EDF2F7]/70"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span>物料编号</span>
                            <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleBarcodeSort('storageLocation')}
                          className="w-[135px] px-3 text-center border-r border-[#E5E9F0] cursor-pointer select-none hover:bg-[#EDF2F7]/70"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span className="text-[#FF4D4F]">*</span>
                            <span>库存地点</span>
                            <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleBarcodeSort('costCenter')}
                          className="w-[135px] px-3 text-center border-r border-[#E5E9F0] cursor-pointer select-none hover:bg-[#EDF2F7]/70"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span className="text-[#FF4D4F]">*</span>
                            <span>成本中心</span>
                            <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                          </div>
                        </th>
                        <th className="w-[90px] px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span>操作</span>
                            <Settings className="w-3.5 h-3.5 text-[#2563EB]" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDrawerBarcodes.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-12 text-center text-[#94A3B8] text-[13px]"
                          >
                            {isReadOnly
                              ? '暂无盘点条码明细'
                              : '暂无条码明细，请点击上方「新增条码」添加'}
                          </td>
                        </tr>
                      ) : (
                        sortedDrawerBarcodes.map((line) => (
                          <tr
                            key={line.id}
                            className="h-[40px] border-b border-[#F0F2F5] hover:bg-[#F8FAFC]"
                          >
                            <td className="px-3 text-center">
                              <input
                                type="checkbox"
                                disabled={isReadOnly}
                                checked={drawerSelectedBarcodes.includes(line.id)}
                                onChange={() =>
                                  setDrawerSelectedBarcodes((prev) =>
                                    prev.includes(line.id)
                                      ? prev.filter((id) => id !== line.id)
                                      : [...prev, line.id]
                                  )
                                }
                                className="w-3.5 h-3.5 accent-[#1890FF] align-middle cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-2 py-1">
                              {isReadOnly ? (
                                <div className="text-right font-mono tabular-nums px-1">
                                  {line.barcodeQty}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  value={line.barcodeQty}
                                  onChange={(e) =>
                                    handleUpdateBarcodeField(
                                      line.id,
                                      'barcodeQty',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full h-[28px] px-2 text-right font-mono tabular-nums border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {isReadOnly ? (
                                <div className="text-right font-mono tabular-nums px-1 font-medium text-[#1890FF]">
                                  {line.countQty}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  value={line.countQty}
                                  onChange={(e) =>
                                    handleUpdateBarcodeField(
                                      line.id,
                                      'countQty',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full h-[28px] px-2 text-right font-mono tabular-nums border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {isReadOnly ? (
                                <div className="font-mono px-1">{line.barcode}</div>
                              ) : (
                                <input
                                  type="text"
                                  value={line.barcode}
                                  onChange={(e) =>
                                    handleUpdateBarcodeField(
                                      line.id,
                                      'barcode',
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-[28px] px-2 font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {isReadOnly ? (
                                <div className="font-mono px-1">{line.materialCode}</div>
                              ) : (
                                <input
                                  type="text"
                                  list="inventory-material-suggestions"
                                  value={line.materialCode}
                                  onChange={(e) =>
                                    handleUpdateBarcodeField(
                                      line.id,
                                      'materialCode',
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-[28px] px-2 font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {isReadOnly ? (
                                <div className="font-mono px-1">
                                  {line.storageLocation}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={line.storageLocation}
                                  onChange={(e) =>
                                    handleUpdateBarcodeField(
                                      line.id,
                                      'storageLocation',
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-[28px] px-2 font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {isReadOnly ? (
                                <div className="font-mono px-1">{line.costCenter}</div>
                              ) : (
                                <input
                                  type="text"
                                  value={line.costCenter}
                                  onChange={(e) =>
                                    handleUpdateBarcodeField(
                                      line.id,
                                      'costCenter',
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-[28px] px-2 font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                                />
                              )}
                            </td>
                            <td className="px-2 text-center">
                              {isReadOnly ? (
                                <span className="text-[#CBD5E1]">—</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBarcodeRow(line.id)}
                                  className="text-[#1890FF] hover:text-[#FF4D4F] transition-colors cursor-pointer"
                                >
                                  删除
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lower OA / System Metadata Form Section */}
              <div className="space-y-3.5 pt-1">
                {/* Row 1: OA回传信息 | * 系统类型 | oa回传状态 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      OA回传信息
                    </label>
                    <input
                      type="text"
                      value={formState.oaCallbackMsg}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, oaCallbackMsg: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      <span className="text-[#FF4D4F] mr-1">*</span>系统类型
                    </label>
                    <input
                      type="text"
                      value={formState.systemType}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, systemType: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      oa回传状态
                    </label>
                    <input
                      type="text"
                      value={formState.oaCallbackStatus}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, oaCallbackStatus: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] placeholder-[#BFBFBF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>
                </div>

                {/* Row 2: oa审核状态 | 流程id | 表名 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      oa审核状态
                    </label>
                    <input
                      type="text"
                      value={formState.oaAuditStatusCode}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, oaAuditStatusCode: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      流程id
                    </label>
                    <input
                      type="text"
                      value={formState.workflowId}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, workflowId: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      表名
                    </label>
                    <input
                      type="text"
                      value={formState.tableName}
                      disabled={isReadOnly}
                      placeholder="请输入"
                      onChange={(e) =>
                        setFormState({ ...formState, tableName: e.target.value })
                      }
                      className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                        isReadOnly
                          ? 'bg-[#F5F5F5] text-[#64748B] cursor-not-allowed'
                          : 'bg-white text-[#334155]'
                      }`}
                    />
                  </div>
                </div>

                {/* Row 3: 文本标签 -> 文本内容 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6">
                  <div className="flex items-center gap-2.5">
                    <label className="w-[112px] text-right text-[#475569] shrink-0">
                      文本标签
                    </label>
                    <span className="text-[13px] text-[#334155]">
                      {formState.textContent}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Footer */}
            <div className="px-5 py-3 border-t border-[#E8EDF4] bg-white flex items-center justify-end gap-2.5 shrink-0">
              {isReadOnly ? (
                <button
                  type="button"
                  onClick={() => setDrawerMode('edit')}
                  className="h-[32px] px-4 text-[13px] bg-[#1890FF] text-white rounded-xs hover:bg-[#096DD9] transition-colors cursor-pointer"
                >
                  修改
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  className="h-[32px] px-4 text-[13px] bg-white border border-[#D9D9D9] text-[#334155] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] transition-colors cursor-pointer"
                >
                  保存并退出
                </button>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-[32px] px-4 text-[13px] bg-white border border-[#D9D9D9] text-[#475569] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] transition-colors cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
