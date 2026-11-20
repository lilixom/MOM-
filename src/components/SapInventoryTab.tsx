import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Database,
  Download,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export type FilterOp = 'eq' | 'contains' | 'ne' | 'starts_with';
export type SummaryMode = '' | 'detail' | 'by_wh_mat' | 'by_mat' | 'by_wh_mat_batch';

export interface SapInventoryRow {
  id: string;
  org: string;
  warehouseCode: string;
  warehouseName: string;
  materialCode: string;
  materialName: string;
  sapBatch: string;
  supplierBatch: string;
  salesOrderNo: string;
  salesOrderItem: string;
  sapStock: number;
  qcStock: number;
  unit: string;
  syncTime: string;
}

interface SapInventoryTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ORG_OPTIONS = [
  '昇兴集团-中山制罐工厂',
  '昇兴集团-福建制罐工厂',
  '昇兴集团-山东制罐工厂',
];

const SUMMARY_MODE_OPTIONS: { value: SummaryMode; label: string }[] = [
  { value: '', label: '请选择' },
  { value: 'detail', label: '明细展示（不汇总）' },
  { value: 'by_wh_mat', label: '按仓库+物料汇总' },
  { value: 'by_mat', label: '按物料料号汇总' },
  { value: 'by_wh_mat_batch', label: '按仓库+物料+SAP批次汇总' },
];

const SAP_MOCK_SOURCE: SapInventoryRow[] = [
  {
    id: 'sap-1',
    org: '昇兴集团-中山制罐工厂',
    warehouseCode: '3101',
    warehouseName: '马口铁原料仓',
    materialCode: '10023727',
    materialName: '泰奇八宝粥香浓椰奶罐身铁 0.20*845*918',
    sapBatch: '260508001A',
    supplierBatch: 'BS-20260501-01',
    salesOrderNo: '2000362026',
    salesOrderItem: '10',
    sapStock: 48250,
    qcStock: 1200,
    unit: '张',
    syncTime: '2026-11-19 03:45:12',
  },
  {
    id: 'sap-2',
    org: '昇兴集团-中山制罐工厂',
    warehouseCode: '3101',
    warehouseName: '马口铁原料仓',
    materialCode: '10023727',
    materialName: '泰奇八宝粥香浓椰奶罐身铁 0.20*845*918',
    sapBatch: '260509002B',
    supplierBatch: 'BS-20260503-04',
    salesOrderNo: '2000362026',
    salesOrderItem: '20',
    sapStock: 31600,
    qcStock: 0,
    unit: '张',
    syncTime: '2026-11-19 03:45:12',
  },
  {
    id: 'sap-3',
    org: '昇兴集团-中山制罐工厂',
    warehouseCode: '3102',
    warehouseName: '制罐成品一仓',
    materialCode: '20041108',
    materialName: '370ml银鹭花生牛奶三片空罐',
    sapBatch: '260510015C',
    supplierBatch: 'SX-ZS-260510',
    salesOrderNo: '2000362118',
    salesOrderItem: '10',
    sapStock: 185400,
    qcStock: 4500,
    unit: '罐',
    syncTime: '2026-11-19 03:45:12',
  },
  {
    id: 'sap-4',
    org: '昇兴集团-中山制罐工厂',
    warehouseCode: '3102',
    warehouseName: '制罐成品一仓',
    materialCode: '20041112',
    materialName: '245ml旺仔牛奶三片空罐',
    sapBatch: '260511008A',
    supplierBatch: 'SX-ZS-260511',
    salesOrderNo: '2000362205',
    salesOrderItem: '10',
    sapStock: 264000,
    qcStock: 0,
    unit: '罐',
    syncTime: '2026-11-19 03:45:12',
  },
  {
    id: 'sap-5',
    org: '昇兴集团-中山制罐工厂',
    warehouseCode: '3105',
    warehouseName: '易拉盖与底盖仓',
    materialCode: '30010566',
    materialName: '202#铝质易拉盖（银色）',
    sapBatch: '260507021D',
    supplierBatch: 'GY-20260428-09',
    salesOrderNo: '2000362118',
    salesOrderItem: '20',
    sapStock: 420000,
    qcStock: 12000,
    unit: '片',
    syncTime: '2026-11-19 03:45:12',
  },
  {
    id: 'sap-6',
    org: '昇兴集团-中山制罐工厂',
    warehouseCode: '3109',
    warehouseName: '废铁及辅料暂存仓',
    materialCode: '80001021',
    materialName: '制罐边角料废铁（打包）',
    sapBatch: '260509001F',
    supplierBatch: 'FT-20260509',
    salesOrderNo: '',
    salesOrderItem: '',
    sapStock: 1505,
    qcStock: 0,
    unit: 'KG',
    syncTime: '2026-11-19 03:45:12',
  },
  {
    id: 'sap-7',
    org: '昇兴集团-福建制罐工厂',
    warehouseCode: '3201',
    warehouseName: '福建印铁原料仓',
    materialCode: '10025890',
    materialName: '王老吉红罐印铁板 0.19*880*960',
    sapBatch: '260512003A',
    supplierBatch: 'SG-20260505-02',
    salesOrderNo: '2000363009',
    salesOrderItem: '10',
    sapStock: 62800,
    qcStock: 3200,
    unit: '张',
    syncTime: '2026-11-19 03:45:12',
  },
  {
    id: 'sap-8',
    org: '昇兴集团-山东制罐工厂',
    warehouseCode: '3301',
    warehouseName: '山东成品发运仓',
    materialCode: '20048820',
    materialName: '310ml露露杏仁露三片空罐',
    sapBatch: '260514006B',
    supplierBatch: 'SX-SD-260514',
    salesOrderNo: '2000363412',
    salesOrderItem: '10',
    sapStock: 198600,
    qcStock: 2400,
    unit: '罐',
    syncTime: '2026-11-19 03:45:12',
  },
];

type ColumnKey =
  | 'warehouseCode'
  | 'warehouseName'
  | 'materialCode'
  | 'materialName'
  | 'sapBatch'
  | 'supplierBatch'
  | 'salesOrderNo'
  | 'salesOrderItem'
  | 'sapStock'
  | 'qcStock';

const ALL_COLUMNS: {
  key: ColumnKey;
  label: string;
  width: string;
  align?: 'left' | 'center' | 'right';
}[] = [
  { key: 'warehouseCode', label: '仓库编码', width: 'w-[105px]', align: 'center' },
  { key: 'warehouseName', label: '仓库名称', width: 'w-[135px]', align: 'center' },
  { key: 'materialCode', label: '物料料号', width: 'w-[120px]', align: 'center' },
  { key: 'materialName', label: '物料名称', width: 'w-[185px]', align: 'left' },
  { key: 'sapBatch', label: 'SAP批次', width: 'w-[130px]', align: 'center' },
  { key: 'supplierBatch', label: '供应商批次', width: 'w-[140px]', align: 'center' },
  { key: 'salesOrderNo', label: '销售单号', width: 'w-[125px]', align: 'center' },
  { key: 'salesOrderItem', label: '销售单项次', width: 'w-[105px]', align: 'center' },
  { key: 'sapStock', label: 'SAP库存', width: 'w-[120px]', align: 'right' },
  { key: 'qcStock', label: '质检库存', width: 'w-[110px]', align: 'right' },
];

function matchFilter(value: string, query: string, op: FilterOp): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const v = (value || '').toLowerCase();
  if (op === 'eq') return v === q;
  if (op === 'ne') return v !== q;
  if (op === 'starts_with') return v.startsWith(q);
  return v.includes(q);
}

function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const SapInventoryTab: React.FC<SapInventoryTabProps> = ({ onShowToast }) => {
  // Initial empty state matching the uploaded screenshot ("暂无数据", "共计 0 条")
  const [hasLoaded, setHasLoaded] = useState(false);
  const [rawData, setRawData] = useState<SapInventoryRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter form state (4 rows matching screenshot)
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('');
  const [materialOp, setMaterialOp] = useState<FilterOp>('eq');
  const [materialQuery, setMaterialQuery] = useState('');
  const [sapBatchOp, setSapBatchOp] = useState<FilterOp>('eq');
  const [sapBatchQuery, setSapBatchQuery] = useState('');
  const [supplierBatchOp, setSupplierBatchOp] = useState<FilterOp>('eq');
  const [supplierBatchQuery, setSupplierBatchQuery] = useState('');
  const [warehouseOp, setWarehouseOp] = useState<FilterOp>('eq');
  const [warehouseQuery, setWarehouseQuery] = useState('');
  const [summaryOp, setSummaryOp] = useState<FilterOp>('eq');
  const [summaryMode, setSummaryMode] = useState<SummaryMode>('');

  // Applied filter snapshot
  const [appliedFilter, setAppliedFilter] = useState({
    org: '',
    materialOp: 'eq' as FilterOp,
    materialQuery: '',
    sapBatchOp: 'eq' as FilterOp,
    sapBatchQuery: '',
    supplierBatchOp: 'eq' as FilterOp,
    supplierBatchQuery: '',
    warehouseOp: 'eq' as FilterOp,
    warehouseQuery: '',
    summaryMode: '' as SummaryMode,
  });

  // Sorting & Pagination
  const [sortField, setSortField] = useState<ColumnKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column visibility settings modal
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    warehouseCode: true,
    warehouseName: true,
    materialCode: true,
    materialName: true,
    sapBatch: true,
    supplierBatch: true,
    salesOrderNo: true,
    salesOrderItem: true,
    sapStock: true,
    qcStock: true,
  });
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // SAP Sync modal
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncOrg, setSyncOrg] = useState('');
  const [syncWarehouse, setSyncWarehouse] = useState('');
  const [syncMaterial, setSyncMaterial] = useState('');
  const [syncBatch, setSyncBatch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const displayedRows = useMemo(() => {
    if (!hasLoaded) return [];

    const filtered = rawData.filter((row) => {
      if (appliedFilter.org && row.org !== appliedFilter.org) return false;
      if (
        !matchFilter(
          row.materialCode,
          appliedFilter.materialQuery,
          appliedFilter.materialOp
        )
      ) {
        return false;
      }
      if (
        !matchFilter(row.sapBatch, appliedFilter.sapBatchQuery, appliedFilter.sapBatchOp)
      ) {
        return false;
      }
      if (
        !matchFilter(
          row.supplierBatch,
          appliedFilter.supplierBatchQuery,
          appliedFilter.supplierBatchOp
        )
      ) {
        return false;
      }
      if (
        !matchFilter(
          row.warehouseCode,
          appliedFilter.warehouseQuery,
          appliedFilter.warehouseOp
        )
      ) {
        return false;
      }
      return true;
    });

    // Apply aggregation according to 汇总方式
    let result: SapInventoryRow[] = filtered;
    const mode = appliedFilter.summaryMode;
    if (mode === 'by_wh_mat' || mode === 'by_mat' || mode === 'by_wh_mat_batch') {
      const groupMap = new Map<string, SapInventoryRow>();
      for (const row of filtered) {
        let key = '';
        if (mode === 'by_wh_mat') {
          key = `${row.warehouseCode}__${row.materialCode}`;
        } else if (mode === 'by_mat') {
          key = row.materialCode;
        } else {
          key = `${row.warehouseCode}__${row.materialCode}__${row.sapBatch}`;
        }

        const existing = groupMap.get(key);
        if (!existing) {
          groupMap.set(key, {
            ...row,
            id: `grp-${key}`,
            warehouseCode: mode === 'by_mat' ? '汇总' : row.warehouseCode,
            warehouseName: mode === 'by_mat' ? '全部仓库汇总' : row.warehouseName,
            sapBatch: mode === 'by_wh_mat_batch' ? row.sapBatch : '—',
            supplierBatch: '—',
            salesOrderNo: '—',
            salesOrderItem: '—',
          });
        } else {
          existing.sapStock += row.sapStock;
          existing.qcStock += row.qcStock;
        }
      }
      result = Array.from(groupMap.values());
    }

    if (!sortField) return result;
    return [...result].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av || '').localeCompare(String(bv || ''), 'zh-CN');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [hasLoaded, rawData, appliedFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(displayedRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return displayedRows.slice(start, start + pageSize);
  }, [displayedRows, safePage, pageSize]);

  const allVisibleChecked =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.includes(r.id));

  const handleToggleAll = () => {
    if (allVisibleChecked) {
      setSelectedIds((prev) => prev.filter((id) => !pagedRows.some((r) => r.id === id)));
    } else {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...pagedRows.map((r) => r.id)]))
      );
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (key: ColumnKey) => {
    if (sortField === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(key);
      setSortDir('asc');
    }
  };

  const handleSearch = () => {
    const baseSource = rawData.length > 0 ? rawData : SAP_MOCK_SOURCE;
    if (rawData.length === 0) {
      setRawData(baseSource);
    }
    setHasLoaded(true);
    setAppliedFilter({
      org: orgFilter,
      materialOp,
      materialQuery,
      sapBatchOp,
      sapBatchQuery,
      supplierBatchOp,
      supplierBatchQuery,
      warehouseOp,
      warehouseQuery,
      summaryMode,
    });
    setSelectedIds([]);
    setCurrentPage(1);
    onShowToast('SAP库存查询已完成', 'info');
  };

  const handleReset = () => {
    setOrgFilter('');
    setMaterialOp('eq');
    setMaterialQuery('');
    setSapBatchOp('eq');
    setSapBatchQuery('');
    setSupplierBatchOp('eq');
    setSupplierBatchQuery('');
    setWarehouseOp('eq');
    setWarehouseQuery('');
    setSummaryOp('eq');
    setSummaryMode('');
    setAppliedFilter({
      org: '',
      materialOp: 'eq',
      materialQuery: '',
      sapBatchOp: 'eq',
      sapBatchQuery: '',
      supplierBatchOp: 'eq',
      supplierBatchQuery: '',
      warehouseOp: 'eq',
      warehouseQuery: '',
      summaryMode: '',
    });
    setSelectedIds([]);
    setCurrentPage(1);
    setHasLoaded(false);
    setRawData([]);
    onShowToast('查询条件已重置', 'info');
  };

  const openSyncModal = () => {
    setSyncOrg(orgFilter);
    setSyncWarehouse(warehouseQuery);
    setSyncMaterial(materialQuery);
    setSyncBatch(sapBatchQuery);
    setIsSyncModalOpen(true);
  };

  const handleConfirmSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const nowStr = formatNow();
      const synced = SAP_MOCK_SOURCE.filter((row) => {
        if (syncOrg && row.org !== syncOrg) return false;
        if (
          syncWarehouse.trim() &&
          !row.warehouseCode.toLowerCase().includes(syncWarehouse.trim().toLowerCase())
        ) {
          return false;
        }
        if (
          syncMaterial.trim() &&
          !row.materialCode.toLowerCase().includes(syncMaterial.trim().toLowerCase())
        ) {
          return false;
        }
        if (
          syncBatch.trim() &&
          !row.sapBatch.toLowerCase().includes(syncBatch.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      }).map((row) => ({ ...row, syncTime: nowStr }));

      setRawData(synced);
      setHasLoaded(true);
      setOrgFilter(syncOrg);
      setWarehouseQuery(syncWarehouse);
      setMaterialQuery(syncMaterial);
      setSapBatchQuery(syncBatch);
      setAppliedFilter({
        org: syncOrg,
        materialOp,
        materialQuery: syncMaterial,
        sapBatchOp,
        sapBatchQuery: syncBatch,
        supplierBatchOp,
        supplierBatchQuery,
        warehouseOp,
        warehouseQuery: syncWarehouse,
        summaryMode,
      });
      setSelectedIds([]);
      setCurrentPage(1);
      setIsSyncing(false);
      setIsSyncModalOpen(false);
      onShowToast(`已从 SAP 实时同步 ${synced.length} 条库存数据`, 'success');
    }, 450);
  };

  const handleExport = () => {
    if (displayedRows.length === 0) {
      onShowToast('当前列表暂无数据可导出，请先查询或同步SAP库存', 'warning');
      return;
    }
    const exportList =
      selectedIds.length > 0
        ? displayedRows.filter((r) => selectedIds.includes(r.id))
        : displayedRows;
    const activeCols = ALL_COLUMNS.filter((c) => visibleColumns[c.key]);
    const headerLine = activeCols.map((c) => c.label).join(',');
    const bodyLines = exportList.map((row) =>
      activeCols
        .map((c) => {
          const val = row[c.key];
          const str = String(val ?? '').replace(/"/g, '""');
          return str.includes(',') ? `"${str}"` : str;
        })
        .join(',')
    );
    const csvContent = `\uFEFF${[headerLine, ...bodyLines].join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAP库存_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`已导出 ${exportList.length} 条SAP库存记录`, 'success');
  };

  const visibleColCount = ALL_COLUMNS.filter((c) => visibleColumns[c.key]).length;

  return (
    <div className="space-y-4 relative text-xs text-[#1E293B]">
      {/* Filter Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        {/* Top Row: Title + 组织机构 + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">SAP库存</span>
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
              onClick={() => setIsColumnModalOpen(true)}
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

        {/* Collapsible Rows 2, 3, 4 */}
        {!filterCollapsed && (
          <div className="space-y-2.5 pt-0.5">
            {/* Row 2: 物料料号 | SAP批次 | 供应商批次 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              {/* 物料料号 */}
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  物料料号
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={materialOp}
                    onChange={(e) => setMaterialOp(e.target.value as FilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="eq">=</option>
                    <option value="contains">包含</option>
                    <option value="starts_with">左匹配</option>
                    <option value="ne">!=</option>
                  </select>
                  <input
                    type="text"
                    value={materialQuery}
                    onChange={(e) => setMaterialQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              {/* SAP批次 */}
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  SAP批次
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={sapBatchOp}
                    onChange={(e) => setSapBatchOp(e.target.value as FilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="eq">=</option>
                    <option value="contains">包含</option>
                    <option value="starts_with">左匹配</option>
                    <option value="ne">!=</option>
                  </select>
                  <input
                    type="text"
                    value={sapBatchQuery}
                    onChange={(e) => setSapBatchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              {/* 供应商批次 */}
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  供应商批次
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={supplierBatchOp}
                    onChange={(e) => setSupplierBatchOp(e.target.value as FilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="eq">=</option>
                    <option value="contains">包含</option>
                    <option value="starts_with">左匹配</option>
                    <option value="ne">!=</option>
                  </select>
                  <input
                    type="text"
                    value={supplierBatchQuery}
                    onChange={(e) => setSupplierBatchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 3 & 4: 仓库编码 | 汇总方式 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  仓库编码
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={warehouseOp}
                    onChange={(e) => setWarehouseOp(e.target.value as FilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="eq">=</option>
                    <option value="contains">包含</option>
                    <option value="starts_with">左匹配</option>
                    <option value="ne">!=</option>
                  </select>
                  <input
                    type="text"
                    value={warehouseQuery}
                    onChange={(e) => setWarehouseQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-[68px] text-right text-[#1E40AF] font-medium shrink-0">
                  汇总方式
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={summaryOp}
                    onChange={(e) => setSummaryOp(e.target.value as FilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="eq">=</option>
                  </select>
                  <select
                    value={summaryMode}
                    onChange={(e) => setSummaryMode(e.target.value as SummaryMode)}
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    {SUMMARY_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative flex flex-col min-h-[520px]">
        {/* Table Toolbar */}
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
                {displayedRows.length}
              </strong>{' '}
              条SAP库存
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={openSyncModal}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>同步</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="h-8 px-3.5 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleChecked}
                    onChange={handleToggleAll}
                    disabled={pagedRows.length === 0}
                    className="w-3.5 h-3.5 accent-[#165DFF] align-middle cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center text-[#64748B]">
                  #
                </th>
                {ALL_COLUMNS.map(
                  (col) =>
                    visibleColumns[col.key] && (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`${col.width} p-2.5 border-b border-r border-[#E5E9F0] cursor-pointer hover:bg-[#EDF2F7]/70 select-none transition ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${
                          col.key === 'sapStock' || col.key === 'qcStock'
                            ? 'bg-blue-50/70 text-blue-700'
                            : ''
                        }`}
                      >
                        <div
                          className={`inline-flex items-center gap-1 ${
                            col.align === 'right' ? 'justify-end' : ''
                          }`}
                        >
                          <span>{col.label}</span>
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              sortField === col.key
                                ? 'text-[#1E40AF]'
                                : col.key === 'sapStock' || col.key === 'qcStock'
                                ? 'text-blue-400'
                                : 'text-[#C5C8BE]'
                            }`}
                          />
                        </div>
                      </th>
                    )
                )}
                <th className="p-2.5 border-b border-[#E5E9F0] w-11 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <button
                    type="button"
                    onClick={() => setIsColumnModalOpen(true)}
                    title="列设置"
                    className="text-[#2563EB] hover:text-[#1E293B] transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={3 + visibleColCount} className="py-24 text-center">
                    <div className="inline-flex flex-col items-center justify-center gap-2 select-none">
                      <svg
                        width="64"
                        height="44"
                        viewBox="0 0 64 44"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="opacity-90"
                      >
                        <ellipse cx="32" cy="39" rx="26" ry="4" fill="#F1F5F9" />
                        <path
                          d="M16 14L22 7H42L48 14V34C48 35.6569 46.6569 37 45 37H19C17.3431 37 16 35.6569 16 34V14Z"
                          fill="#FAFAFA"
                          stroke="#CBD5E1"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M16 21H25.5C26.5 23.5 29 25 32 25C35 25 37.5 23.5 38.5 21H48"
                          stroke="#CBD5E1"
                          strokeWidth="1.4"
                        />
                      </svg>
                      <span className="text-xs text-[#64748B]">暂无数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, index) => {
                  const isChecked = selectedIds.includes(row.id);
                  const rowNum = (safePage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={row.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('input')) return;
                        handleToggleRow(row.id);
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
                          onChange={() => handleToggleRow(row.id)}
                          className="w-3.5 h-3.5 accent-[#165DFF] align-middle cursor-pointer"
                        />
                      </td>
                      <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono text-[#64748B]">
                        {rowNum}
                      </td>
                      {visibleColumns.warehouseCode && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums font-semibold text-[#1E40AF]">
                          {row.warehouseCode}
                        </td>
                      )}
                      {visibleColumns.warehouseName && (
                        <td
                          className="p-2.5 border-r border-[#EDF2F7] text-center text-[#1E293B] max-w-[140px] truncate"
                          title={row.warehouseName}
                        >
                          {row.warehouseName}
                        </td>
                      )}
                      {visibleColumns.materialCode && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#1E293B]">
                          {row.materialCode}
                        </td>
                      )}
                      {visibleColumns.materialName && (
                        <td
                          className="p-2.5 border-r border-[#EDF2F7] text-[#1E293B] max-w-[210px] truncate"
                          title={row.materialName}
                        >
                          {row.materialName}
                        </td>
                      )}
                      {visibleColumns.sapBatch && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#1E293B]">
                          {row.sapBatch || '—'}
                        </td>
                      )}
                      {visibleColumns.supplierBatch && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#64748B]">
                          {row.supplierBatch || '—'}
                        </td>
                      )}
                      {visibleColumns.salesOrderNo && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#1E293B]">
                          {row.salesOrderNo || '—'}
                        </td>
                      )}
                      {visibleColumns.salesOrderItem && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#64748B]">
                          {row.salesOrderItem || '—'}
                        </td>
                      )}
                      {visibleColumns.sapStock && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-right font-mono tabular-nums font-semibold bg-blue-50/30 text-blue-700">
                          {row.sapStock.toLocaleString('zh-CN')}
                        </td>
                      )}
                      {visibleColumns.qcStock && (
                        <td className="p-2.5 border-r border-[#EDF2F7] text-right font-mono tabular-nums font-medium bg-blue-50/30 text-blue-700">
                          {row.qcStock.toLocaleString('zh-CN')}
                        </td>
                      )}
                      <td
                        className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isChecked ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                      />
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar (工单管理风格) */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计{' '}
            <strong className="font-mono tabular-nums text-[#1E293B]">
              {displayedRows.length}
            </strong>{' '}
            条
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1 || displayedRows.length === 0}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              disabled={safePage >= totalPages || displayedRows.length === 0}
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
            <option value={100}>100 条/页</option>
          </select>
        </div>
      </div>

      {/* Column Visibility Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs shadow-xl w-full max-w-[400px] border border-[#E5E9F0]">
            <div className="px-4 py-3 border-b border-[#E8EDF4] flex items-center justify-between">
              <span className="font-medium text-[14px] text-[#1E293B]">列表字段显示设置</span>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
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
                    warehouseCode: true,
                    warehouseName: true,
                    materialCode: true,
                    materialName: true,
                    sapBatch: true,
                    supplierBatch: true,
                    salesOrderNo: true,
                    salesOrderItem: true,
                    sapStock: true,
                    qcStock: true,
                  })
                }
                className="h-[30px] px-3 text-[12px] border border-[#D9D9D9] text-[#475569] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] cursor-pointer"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="h-[30px] px-4 text-[12px] bg-[#1890FF] text-white rounded-xs hover:bg-[#096DD9] cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAP 同步 Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs shadow-xl w-full max-w-[460px] border border-[#E5E9F0]">
            <div className="px-4 py-3 border-b border-[#E8EDF4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1890FF]" />
                <span className="font-medium text-[14px] text-[#1E293B]">同步 SAP 实时库存</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <label className="w-[82px] text-right text-[#475569] shrink-0">组织机构</label>
                <div className="relative flex-1">
                  <select
                    value={syncOrg}
                    onChange={(e) => setSyncOrg(e.target.value)}
                    className="w-full h-[32px] pl-2.5 pr-7 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] appearance-none bg-white"
                  >
                    <option value="">全部组织机构</option>
                    {ORG_OPTIONS.map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <label className="w-[82px] text-right text-[#475569] shrink-0">仓库编码</label>
                <input
                  type="text"
                  value={syncWarehouse}
                  onChange={(e) => setSyncWarehouse(e.target.value)}
                  placeholder="留空同步全部仓库（如 3101）"
                  className="flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <label className="w-[82px] text-right text-[#475569] shrink-0">物料料号</label>
                <input
                  type="text"
                  value={syncMaterial}
                  onChange={(e) => setSyncMaterial(e.target.value)}
                  placeholder="留空同步全部物料（如 10023727）"
                  className="flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <label className="w-[82px] text-right text-[#475569] shrink-0">SAP批次</label>
                <input
                  type="text"
                  value={syncBatch}
                  onChange={(e) => setSyncBatch(e.target.value)}
                  placeholder="可选，指定SAP批次号"
                  className="flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF]"
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#E8EDF4] flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => setIsSyncModalOpen(false)}
                className="h-[32px] px-4 text-[13px] bg-white border border-[#D9D9D9] text-[#475569] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] cursor-pointer disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleConfirmSync}
                className="h-[32px] px-4 text-[13px] bg-[#1890FF] text-white rounded-xs hover:bg-[#096DD9] transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>同步中...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>立即同步</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
