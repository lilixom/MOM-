import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Inbox,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface PurchaseOrderTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals' | 'notContains';
type QuickTimeRange = 'today' | 'week' | 'month' | 'threeMonths' | 'custom';
type PoStatus = '开立' | '操作中' | '已审核' | '已关结';
type PoOrderType = '其他' | '公司间采购' | '标准采购' | '委外采购';
type SapOrderTypeCode = 'Z030' | 'UB' | 'Z010' | 'Z020' | 'NB';

interface PurchaseOrderLineItem {
  id: string;
  itemNo: string;
  materialCode: string;
  materialName: string;
  materialSpec: string;
  planQty: number;
  releasedQty: number;
  receivedQty: number;
  overReceiptRate: string;
  deliveryDate: string;
  remark: string;
}

interface PurchaseOrderRecord {
  id: string;
  org: string;
  poNo: string;
  orderType: PoOrderType;
  sapOrderType: SapOrderTypeCode;
  status: PoStatus;
  writebackErp: boolean;
  writebackResult: string;
  arrivalDate: string;
  createdAt: string;
  inboundDate: string;
  supplierCode: string;
  supplier: string;
  remark: string;
  lines: PurchaseOrderLineItem[];
}

type MasterColKey =
  | 'org'
  | 'poNo'
  | 'orderType'
  | 'status'
  | 'writebackErp'
  | 'writebackResult'
  | 'arrivalDate';

type DetailColKey =
  | 'itemNo'
  | 'materialCode'
  | 'materialName'
  | 'materialSpec'
  | 'planQty'
  | 'releasedQty'
  | 'receivedQty';

type DrawerLineSortKey = 'itemNo' | 'materialCode' | 'planQty' | 'deliveryDate' | 'remark';

const ORGS = [
  '昇兴集团-中山制罐工厂',
  '昇兴集团-福建制罐工厂',
  '昇兴集团-山东制罐工厂',
];

const SUPPLIER_LIST = [
  { code: 'V10086', name: '合肥先卓科技有限公司' },
  { code: 'V10001', name: '宝山钢铁股份有限公司' },
  { code: 'V10002', name: '首钢京唐钢铁联合有限责任公司' },
  { code: 'V10003', name: '贵溪市智泽始创铜制品有限公司' },
  { code: 'V10004', name: '东莞市永晖焊材有限公司' },
  { code: 'V10005', name: '昇兴集团股份有限公司（内部调拨）' },
  { code: 'V10006', name: '中粮包装（成都）有限公司' },
];

const SUPPLIERS = SUPPLIER_LIST.map((s) => s.name);

const SAP_ORDER_TYPE_OPTIONS: Array<{
  code: SapOrderTypeCode;
  displayType: PoOrderType;
  desc: string;
}> = [
  { code: 'Z030', displayType: '其他', desc: 'Z030' },
  { code: 'UB', displayType: '公司间采购', desc: 'UB' },
  { code: 'Z010', displayType: '标准采购', desc: 'Z010' },
  { code: 'Z020', displayType: '委外采购', desc: 'Z020' },
  { code: 'NB', displayType: '标准采购', desc: 'NB' },
];

function sapCodeToOrderType(code: SapOrderTypeCode): PoOrderType {
  return SAP_ORDER_TYPE_OPTIONS.find((o) => o.code === code)?.displayType ?? '其他';
}

const MATERIAL_CATALOG = [
  { code: '90007824', name: '硅胶两用魔术扫把', spec: '' },
  { code: '40002213', name: '铜线 Φ1.2', spec: 'Φ1.2mm 卷装' },
  { code: '10008421', name: '马口铁 0.22×860', spec: '0.22×860×820mm DR8' },
  { code: '20005110', name: '易拉盖 200#', spec: '200# 金色铝盖' },
  { code: '20005118', name: '底盖 202#', spec: '202# 马口铁底盖' },
  { code: '30001892', name: '食品级内涂涂料', spec: '20KG/桶 环氧酚醛' },
  { code: '30001944', name: '密封胶', spec: '25KG/桶 水性密封胶' },
];

const MASTER_COLS: Array<{
  key: MasterColKey;
  title: string;
  sortable: boolean;
  align?: 'left' | 'center';
  minWidth: string;
}> = [
  { key: 'org', title: '组织机构', sortable: true, align: 'center', minWidth: '175px' },
  { key: 'poNo', title: '采购单号', sortable: true, align: 'center', minWidth: '130px' },
  { key: 'orderType', title: '订单类型', sortable: true, align: 'center', minWidth: '125px' },
  { key: 'status', title: '单据状态', sortable: true, align: 'center', minWidth: '115px' },
  { key: 'writebackErp', title: '回写ERP标识', sortable: false, align: 'center', minWidth: '125px' },
  { key: 'writebackResult', title: '回写ERP结果', sortable: false, align: 'center', minWidth: '150px' },
  { key: 'arrivalDate', title: '到货时间', sortable: true, align: 'center', minWidth: '125px' },
];

const DETAIL_COLS: Array<{
  key: DetailColKey;
  title: string;
  minWidth: string;
  isNumeric?: boolean;
}> = [
  { key: 'itemNo', title: '项次', minWidth: '90px', isNumeric: true },
  { key: 'materialCode', title: '物料料号', minWidth: '140px' },
  { key: 'materialName', title: '物料名称', minWidth: '170px' },
  { key: 'materialSpec', title: '物料规格', minWidth: '190px' },
  { key: 'planQty', title: '计划数量', minWidth: '120px', isNumeric: true },
  { key: 'releasedQty', title: '已下达数量', minWidth: '120px', isNumeric: true },
  { key: 'receivedQty', title: '接收数量', minWidth: '120px', isNumeric: true },
];

function buildInitialPurchaseOrders(): PurchaseOrderRecord[] {
  const fixedTen: Array<{
    poNo: string;
    orderType: PoOrderType;
    sapOrderType: SapOrderTypeCode;
    status: PoStatus;
    arrivalDate: string;
    createdAt: string;
    supplierCode: string;
    supplier: string;
  }> = [
    { poNo: '5300023356', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-19', createdAt: '2026-11-19 09:12:30', supplierCode: 'V10086', supplier: '合肥先卓科技有限公司' },
    { poNo: '5300023357', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-19', createdAt: '2026-11-19 08:45:12', supplierCode: 'V10001', supplier: '宝山钢铁股份有限公司' },
    { poNo: '5300023357', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-19', createdAt: '2026-11-19 08:45:12', supplierCode: 'V10002', supplier: '首钢京唐钢铁联合有限责任公司' },
    { poNo: '6200000855', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-19', createdAt: '2026-11-18 17:20:05', supplierCode: 'V10003', supplier: '贵溪市智泽始创铜制品有限公司' },
    { poNo: '6200000855', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-19', createdAt: '2026-11-18 17:20:05', supplierCode: 'V10003', supplier: '贵溪市智泽始创铜制品有限公司' },
    { poNo: '6200000854', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-19', createdAt: '2026-11-18 15:10:48', supplierCode: 'V10004', supplier: '东莞市永晖焊材有限公司' },
    { poNo: '5100021121', orderType: '其他', sapOrderType: 'Z030', status: '操作中', arrivalDate: '2026-11-18', createdAt: '2026-11-17 14:32:18', supplierCode: 'V10002', supplier: '首钢京唐钢铁联合有限责任公司' },
    { poNo: '5600036880', orderType: '公司间采购', sapOrderType: 'UB', status: '开立', arrivalDate: '2026-11-17', createdAt: '2026-11-16 11:05:44', supplierCode: 'V10005', supplier: '昇兴集团股份有限公司（内部调拨）' },
    { poNo: '5600036879', orderType: '公司间采购', sapOrderType: 'UB', status: '开立', arrivalDate: '2026-11-17', createdAt: '2026-11-16 10:28:15', supplierCode: 'V10005', supplier: '昇兴集团股份有限公司（内部调拨）' },
    { poNo: '5600036878', orderType: '公司间采购', sapOrderType: 'UB', status: '开立', arrivalDate: '2026-11-17', createdAt: '2026-11-15 16:40:22', supplierCode: 'V10005', supplier: '昇兴集团股份有限公司（内部调拨）' },
  ];

  const extraNine: Array<{
    poNo: string;
    orderType: PoOrderType;
    sapOrderType: SapOrderTypeCode;
    status: PoStatus;
    arrivalDate: string;
    createdAt: string;
    supplierCode: string;
    supplier: string;
  }> = [
    { poNo: '5600036877', orderType: '公司间采购', sapOrderType: 'UB', status: '开立', arrivalDate: '2026-11-16', createdAt: '2026-11-15 11:20:10', supplierCode: 'V10005', supplier: '昇兴集团股份有限公司（内部调拨）' },
    { poNo: '5300023352', orderType: '其他', sapOrderType: 'Z030', status: '操作中', arrivalDate: '2026-11-16', createdAt: '2026-11-14 16:08:30', supplierCode: 'V10001', supplier: '宝山钢铁股份有限公司' },
    { poNo: '5300023351', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-15', createdAt: '2026-11-14 10:15:09', supplierCode: 'V10006', supplier: '中粮包装（成都）有限公司' },
    { poNo: '6200000851', orderType: '其他', sapOrderType: 'Z030', status: '已审核', arrivalDate: '2026-11-15', createdAt: '2026-11-14 09:05:40', supplierCode: 'V10003', supplier: '贵溪市智泽始创铜制品有限公司' },
    { poNo: '5100021118', orderType: '其他', sapOrderType: 'Z030', status: '操作中', arrivalDate: '2026-11-14', createdAt: '2026-11-13 17:42:12', supplierCode: 'V10002', supplier: '首钢京唐钢铁联合有限责任公司' },
    { poNo: '5600036874', orderType: '公司间采购', sapOrderType: 'UB', status: '开立', arrivalDate: '2026-11-14', createdAt: '2026-11-13 14:18:55', supplierCode: 'V10005', supplier: '昇兴集团股份有限公司（内部调拨）' },
    { poNo: '5300023348', orderType: '其他', sapOrderType: 'Z030', status: '已关结', arrivalDate: '2026-11-13', createdAt: '2026-11-13 11:30:00', supplierCode: 'V10001', supplier: '宝山钢铁股份有限公司' },
    { poNo: '6200000849', orderType: '其他', sapOrderType: 'Z030', status: '已审核', arrivalDate: '2026-11-13', createdAt: '2026-11-13 09:12:44', supplierCode: 'V10004', supplier: '东莞市永晖焊材有限公司' },
    { poNo: '5300023345', orderType: '其他', sapOrderType: 'Z030', status: '开立', arrivalDate: '2026-11-13', createdAt: '2026-11-12 18:22:19', supplierCode: 'V10006', supplier: '中粮包装（成都）有限公司' },
  ];

  const all = [...fixedTen, ...extraNine];
  return all.map((item, idx) => {
    // Row 0 (5300023356) matches the user's "修改-采购单" screenshot verbatim
    if (idx === 0) {
      return {
        id: 'po-001',
        org: '昇兴集团-中山制罐工厂',
        poNo: item.poNo,
        orderType: item.orderType,
        sapOrderType: item.sapOrderType,
        status: item.status,
        writebackErp: false,
        writebackResult: '',
        arrivalDate: item.arrivalDate,
        createdAt: item.createdAt,
        inboundDate: '',
        supplierCode: item.supplierCode,
        supplier: item.supplier,
        remark: 'SAP同步',
        lines: [
          {
            id: 'po-1-l1',
            itemNo: '10',
            materialCode: '90007824',
            materialName: '硅胶两用魔术扫把',
            materialSpec: '',
            planQty: 2,
            releasedQty: 0,
            receivedQty: 0,
            overReceiptRate: '',
            deliveryDate: '',
            remark: '',
          },
        ],
      };
    }

    const m1 = MATERIAL_CATALOG[(idx % (MATERIAL_CATALOG.length - 1)) + 1];
    const m2 = MATERIAL_CATALOG[((idx + 2) % (MATERIAL_CATALOG.length - 1)) + 1];
    const plan1 = 2000 + (idx % 5) * 800;
    const plan2 = 1200 + (idx % 4) * 500;
    const isWorking = item.status === '操作中' || item.status === '已审核' || item.status === '已关结';
    const isClosed = item.status === '已关结';

    return {
      id: `po-${String(idx + 1).padStart(3, '0')}`,
      org: '昇兴集团-中山制罐工厂',
      poNo: item.poNo,
      orderType: item.orderType,
      sapOrderType: item.sapOrderType,
      status: item.status,
      writebackErp: false,
      writebackResult: '',
      arrivalDate: item.arrivalDate,
      createdAt: item.createdAt,
      inboundDate: item.status === '已关结' ? item.arrivalDate : '',
      supplierCode: item.supplierCode,
      supplier: item.supplier,
      remark: 'SAP同步',
      lines: [
        {
          id: `po-${idx + 1}-l1`,
          itemNo: '10',
          materialCode: m1.code,
          materialName: m1.name,
          materialSpec: m1.spec,
          planQty: plan1,
          releasedQty: isWorking ? plan1 : Math.round(plan1 * 0.5),
          receivedQty: isClosed ? plan1 : isWorking ? Math.round(plan1 * 0.6) : 0,
          overReceiptRate: '5',
          deliveryDate: item.arrivalDate,
          remark: '',
        },
        {
          id: `po-${idx + 1}-l2`,
          itemNo: '20',
          materialCode: m2.code,
          materialName: m2.name,
          materialSpec: m2.spec,
          planQty: plan2,
          releasedQty: isWorking ? plan2 : 0,
          receivedQty: isClosed ? plan2 : isWorking ? Math.round(plan2 * 0.4) : 0,
          overReceiptRate: '',
          deliveryDate: item.arrivalDate,
          remark: '',
        },
      ],
    };
  });
}

function matchText(source: string, query: string, op: MatchOp): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const s = source.toLowerCase();
  if (op === 'equals') return s === q;
  if (op === 'notContains') return !s.includes(q);
  return s.includes(q);
}

export const PurchaseOrderTab: React.FC<PurchaseOrderTabProps> = ({ onShowToast }) => {
  const [records, setRecords] = useState<PurchaseOrderRecord[]>(buildInitialPurchaseOrders);

  // Filter draft inputs matching screenshot
  const [org, setOrg] = useState<string>('昇兴集团-中山制罐工厂');
  const [quickRange, setQuickRange] = useState<QuickTimeRange>('custom');
  const [createdFrom, setCreatedFrom] = useState<string>('2026-11-12 17:55:20');
  const [createdTo, setCreatedTo] = useState<string>('2026-11-19 23:59:59');
  const [poOp, setPoOp] = useState<MatchOp>('contains');
  const [poVal, setPoVal] = useState<string>('');
  const [matOp, setMatOp] = useState<MatchOp>('contains');
  const [matVal, setMatVal] = useState<string>('');
  const [supOp, setSupOp] = useState<MatchOp>('contains');
  const [supVal, setSupVal] = useState<string>('');
  const [statusOp, setStatusOp] = useState<MatchOp>('contains');
  const [statusVal, setStatusVal] = useState<string>('');
  const [inboundFrom, setInboundFrom] = useState<string>('');
  const [inboundTo, setInboundTo] = useState<string>('');

  const [applied, setApplied] = useState({
    org: '昇兴集团-中山制罐工厂',
    createdFrom: '2026-11-12 17:55:20',
    createdTo: '2026-11-19 23:59:59',
    poOp: 'contains' as MatchOp,
    poVal: '',
    matOp: 'contains' as MatchOp,
    matVal: '',
    supOp: 'contains' as MatchOp,
    supVal: '',
    statusOp: 'contains' as MatchOp,
    statusVal: '',
    inboundFrom: '',
    inboundTo: '',
  });

  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  const [sortKey, setSortKey] = useState<MasterColKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  // Start with no active master row so lower detail panel shows "暂无数据" matching screenshot,
  // clicking any PO row reveals its line items in the lower detail grid!
  const [activePoId, setActivePoId] = useState<string | null>(null);
  const [detailSortKey, setDetailSortKey] = useState<DetailColKey | null>(null);
  const [detailSortDir, setDetailSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedLineIds, setSelectedLineIds] = useState<Record<string, boolean>>({});

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpInput, setJumpInput] = useState<string>('');

  const [moreMenuPoId, setMoreMenuPoId] = useState<string | null>(null);

  // SAP Sync Drawer ("采购单据表") replacing manual +新增
  const [sapSyncOpen, setSapSyncOpen] = useState(false);
  const [sapSyncForm, setSapSyncForm] = useState({
    supplierCode: '',
    poNo: '',
    materialCode: '',
    lastModifiedDate: '2026-11-19',
  });
  const [sapSyncing, setSapSyncing] = useState(false);

  // Unified Edit / View PO Drawer ("修改-采购单" / "查看-采购单") matching screenshot
  const [poDrawer, setPoDrawer] = useState<{
    mode: 'edit' | 'view';
    recordId: string;
  } | null>(null);
  const [drawerDraft, setDrawerDraft] = useState<{
    supplier: string;
    arrivalDate: string;
    poNo: string;
    sapOrderType: SapOrderTypeCode;
    remark: string;
    lines: PurchaseOrderLineItem[];
  }>({
    supplier: '',
    arrivalDate: '2026-11-19',
    poNo: '',
    sapOrderType: 'Z030',
    remark: 'SAP同步',
    lines: [],
  });
  const [drawerSelectedLineIds, setDrawerSelectedLineIds] = useState<Record<string, boolean>>({});
  const [drawerLineSortKey, setDrawerLineSortKey] = useState<DrawerLineSortKey | null>(null);
  const [drawerLineSortDir, setDrawerLineSortDir] = useState<'asc' | 'desc'>('asc');

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [colSettingsOpen, setColSettingsOpen] = useState(false);
  const [hiddenMasterCols, setHiddenMasterCols] = useState<Record<MasterColKey, boolean>>({
    org: false,
    poNo: false,
    orderType: false,
    status: false,
    writebackErp: false,
    writebackResult: false,
    arrivalDate: false,
  });
  const [confirmDelete, setConfirmDelete] = useState<{
    ids: string[];
    label: string;
  } | null>(null);

  const visibleMasterCols = useMemo(
    () => MASTER_COLS.filter((c) => !hiddenMasterCols[c.key]),
    [hiddenMasterCols]
  );

  const filteredRecords = useMemo(() => {
    let list = records.filter((r) => {
      if (applied.org && r.org !== applied.org) return false;
      if (!matchText(r.poNo, applied.poVal, applied.poOp)) return false;
      if (!matchText(r.supplier, applied.supVal, applied.supOp)) return false;
      if (!matchText(r.status, applied.statusVal, applied.statusOp)) return false;
      if (applied.matVal.trim()) {
        const hit = r.lines.some((l) =>
          matchText(`${l.materialCode} ${l.materialName}`, applied.matVal, applied.matOp)
        );
        if (!hit) return false;
      }
      if (applied.createdFrom && r.createdAt < applied.createdFrom) return false;
      if (applied.createdTo && r.createdAt > applied.createdTo) return false;
      if (applied.inboundFrom && (!r.inboundDate || r.inboundDate < applied.inboundFrom)) return false;
      if (applied.inboundTo && (!r.inboundDate || r.inboundDate > applied.inboundTo)) return false;
      return true;
    });

    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) =>
        String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'zh-CN') * dir
      );
    }
    return list;
  }, [records, applied, sortKey, sortDir]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  const selectedRecords = useMemo(
    () => filteredRecords.filter((r) => selectedIds[r.id]),
    [filteredRecords, selectedIds]
  );

  const allOnPageSelected =
    pagedRecords.length > 0 && pagedRecords.every((r) => selectedIds[r.id]);

  const activePo = useMemo(
    () => records.find((r) => r.id === activePoId) || null,
    [records, activePoId]
  );

  const sortedDetailLines = useMemo(() => {
    if (!activePo) return [];
    const lines = [...activePo.lines];
    if (detailSortKey) {
      const dir = detailSortDir === 'asc' ? 1 : -1;
      lines.sort((a, b) => {
        const av = a[detailSortKey];
        const bv = b[detailSortKey];
        if (typeof av === 'number' && typeof bv === 'number') {
          return (av - bv) * dir;
        }
        return String(av).localeCompare(String(bv), 'zh-CN') * dir;
      });
    }
    return lines;
  }, [activePo, detailSortKey, detailSortDir]);

  const handleQuickRange = (r: QuickTimeRange) => {
    setQuickRange(r);
    if (r === 'today') {
      setCreatedFrom('2026-11-19 00:00:00');
      setCreatedTo('2026-11-19 23:59:59');
    } else if (r === 'week') {
      setCreatedFrom('2026-11-13 00:00:00');
      setCreatedTo('2026-11-19 23:59:59');
    } else if (r === 'month') {
      setCreatedFrom('2026-11-01 00:00:00');
      setCreatedTo('2026-11-19 23:59:59');
    } else if (r === 'threeMonths') {
      setCreatedFrom('2026-08-19 00:00:00');
      setCreatedTo('2026-11-19 23:59:59');
    } else {
      setCreatedFrom('2026-11-12 17:55:20');
      setCreatedTo('2026-11-19 23:59:59');
    }
  };

  const handleQuery = () => {
    setApplied({
      org,
      createdFrom,
      createdTo,
      poOp,
      poVal,
      matOp,
      matVal,
      supOp,
      supVal,
      statusOp,
      statusVal,
      inboundFrom,
      inboundTo,
    });
    setPage(1);
    onShowToast('采购订单查询完成', 'success');
  };

  const handleReset = () => {
    setOrg('昇兴集团-中山制罐工厂');
    setQuickRange('custom');
    setCreatedFrom('2026-11-12 17:55:20');
    setCreatedTo('2026-11-19 23:59:59');
    setPoOp('contains');
    setPoVal('');
    setMatOp('contains');
    setMatVal('');
    setSupOp('contains');
    setSupVal('');
    setStatusOp('contains');
    setStatusVal('');
    setInboundFrom('');
    setInboundTo('');
    setApplied({
      org: '昇兴集团-中山制罐工厂',
      createdFrom: '2026-11-12 17:55:20',
      createdTo: '2026-11-19 23:59:59',
      poOp: 'contains',
      poVal: '',
      matOp: 'contains',
      matVal: '',
      supOp: 'contains',
      supVal: '',
      statusOp: 'contains',
      statusVal: '',
      inboundFrom: '',
      inboundTo: '',
    });
    setSortKey(null);
    setPage(1);
    onShowToast('查询条件已重置', 'info');
  };

  const handleSortMaster = (key: MasterColKey, sortable: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSortDetail = (key: DetailColKey) => {
    if (detailSortKey === key) {
      if (detailSortDir === 'asc') setDetailSortDir('desc');
      else setDetailSortKey(null);
    } else {
      setDetailSortKey(key);
      setDetailSortDir('asc');
    }
  };

  const handleToggleErpWriteback = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = !r.writebackErp;
        return {
          ...r,
          writebackErp: next,
          writebackResult: next ? `回写成功 (SAP-${r.poNo.slice(-4)})` : '',
        };
      })
    );
    onShowToast('已更新回写 ERP 标识', 'info');
  };

  const handleOpenDrawer = (rec: PurchaseOrderRecord, mode: 'edit' | 'view') => {
    setDrawerDraft({
      supplier: rec.supplier,
      arrivalDate: rec.arrivalDate,
      poNo: rec.poNo,
      sapOrderType: rec.sapOrderType,
      remark: rec.remark,
      lines: rec.lines.map((l) => ({ ...l })),
    });
    setDrawerSelectedLineIds({});
    setDrawerLineSortKey(null);
    setPoDrawer({ mode, recordId: rec.id });
  };

  const handleDrawerAddLine = () => {
    setDrawerDraft((prev) => {
      const maxItem = prev.lines.reduce((acc, l) => {
        const n = parseInt(l.itemNo, 10);
        return Number.isNaN(n) ? acc : Math.max(acc, n);
      }, 0);
      const nextItemNo = String(maxItem + 10);
      return {
        ...prev,
        lines: [
          ...prev.lines,
          {
            id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            itemNo: nextItemNo,
            materialCode: '',
            materialName: '',
            materialSpec: '',
            planQty: 1,
            releasedQty: 0,
            receivedQty: 0,
            overReceiptRate: '',
            deliveryDate: '',
            remark: '',
          },
        ],
      };
    });
  };

  const handleDrawerBatchDeleteLines = () => {
    const selectedKeys = Object.keys(drawerSelectedLineIds).filter(
      (k) => drawerSelectedLineIds[k]
    );
    if (!selectedKeys.length) {
      onShowToast('请先勾选需要删除的明细行', 'warning');
      return;
    }
    const delSet = new Set(selectedKeys);
    setDrawerDraft((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => !delSet.has(l.id)),
    }));
    setDrawerSelectedLineIds({});
    onShowToast(`已移除 ${delSet.size} 条采购明细行`, 'info');
  };

  const handleDrawerLineChange = (
    lineId: string,
    patch: Partial<PurchaseOrderLineItem>
  ) => {
    setDrawerDraft((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => {
        if (l.id !== lineId) return l;
        const next = { ...l, ...patch };
        if (patch.materialCode !== undefined) {
          const matched = MATERIAL_CATALOG.find(
            (m) => m.code === patch.materialCode?.trim()
          );
          if (matched) {
            next.materialName = matched.name;
            next.materialSpec = matched.spec;
          }
        }
        return next;
      }),
    }));
  };

  const handleSortDrawerLines = (key: DrawerLineSortKey) => {
    let nextDir: 'asc' | 'desc' = 'asc';
    if (drawerLineSortKey === key) {
      if (drawerLineSortDir === 'asc') nextDir = 'desc';
      else {
        setDrawerLineSortKey(null);
        return;
      }
    }
    setDrawerLineSortKey(key);
    setDrawerLineSortDir(nextDir);
    const mult = nextDir === 'asc' ? 1 : -1;
    setDrawerDraft((prev) => ({
      ...prev,
      lines: [...prev.lines].sort((a, b) => {
        if (key === 'planQty') return (a.planQty - b.planQty) * mult;
        if (key === 'itemNo') {
          return (parseInt(a.itemNo, 10) - parseInt(b.itemNo, 10)) * mult;
        }
        return String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'zh-CN') * mult;
      }),
    }));
  };

  const handleSaveDrawer = () => {
    if (!poDrawer || poDrawer.mode !== 'edit') return;
    if (!drawerDraft.supplier.trim()) {
      onShowToast('请填写必填项：供应商', 'warning');
      return;
    }
    if (!drawerDraft.arrivalDate.trim()) {
      onShowToast('请填写必填项：到货时间', 'warning');
      return;
    }
    for (let i = 0; i < drawerDraft.lines.length; i++) {
      const l = drawerDraft.lines[i];
      if (!l.itemNo.trim() || !l.materialCode.trim()) {
        onShowToast(`第 ${i + 1} 行明细的「项次」与「物料料号」不能为空`, 'warning');
        return;
      }
    }

    const matchedSupplier = SUPPLIER_LIST.find(
      (s) => s.name === drawerDraft.supplier.trim()
    );
    const targetId = poDrawer.recordId;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === targetId
          ? {
              ...r,
              supplier: drawerDraft.supplier.trim(),
              supplierCode: matchedSupplier?.code || r.supplierCode,
              arrivalDate: drawerDraft.arrivalDate,
              sapOrderType: drawerDraft.sapOrderType,
              orderType: sapCodeToOrderType(drawerDraft.sapOrderType),
              remark: drawerDraft.remark,
              lines: drawerDraft.lines.map((l) => ({ ...l })),
            }
          : r
      )
    );
    setPoDrawer(null);
    onShowToast(`已保存采购订单 ${drawerDraft.poNo} 的修改`, 'success');
  };

  const handleOpenSapSync = () => {
    setSapSyncForm({
      supplierCode: '',
      poNo: '',
      materialCode: '',
      lastModifiedDate: '2026-11-19',
    });
    setSapSyncOpen(true);
  };

  const handleExecuteSapSync = () => {
    if (sapSyncing) return;
    setSapSyncing(true);

    window.setTimeout(() => {
      const poInput = sapSyncForm.poNo.trim();
      const supInput = sapSyncForm.supplierCode.trim();
      const matInput = sapSyncForm.materialCode.trim();
      const modDate = sapSyncForm.lastModifiedDate || '2026-11-19';

      const matchedSup =
        SUPPLIER_LIST.find(
          (s) =>
            s.code.toLowerCase() === supInput.toLowerCase() ||
            s.name.includes(supInput)
        ) || SUPPLIER_LIST[0];

      const matchedMat =
        MATERIAL_CATALOG.find((m) => m.code === matInput) || MATERIAL_CATALOG[0];

      const syncedPoNo =
        poInput || `530002${Math.floor(3360 + Math.random() * 500)}`;

      const existingIdx = records.findIndex((r) => r.poNo === syncedPoNo);
      if (existingIdx >= 0) {
        setRecords((prev) =>
          prev.map((r, i) =>
            i === existingIdx
              ? {
                  ...r,
                  arrivalDate: modDate,
                  supplier: supInput ? matchedSup.name : r.supplier,
                  supplierCode: supInput ? matchedSup.code : r.supplierCode,
                  remark: 'SAP同步',
                  writebackErp: true,
                  writebackResult: `SAP同步成功 (${modDate})`,
                }
              : r
          )
        );
        setActivePoId(records[existingIdx].id);
        onShowToast(`已从 SAP 更新同步采购订单 ${syncedPoNo}`, 'success');
      } else {
        const newId = `po-sap-${Date.now()}`;
        const newRec: PurchaseOrderRecord = {
          id: newId,
          org: '昇兴集团-中山制罐工厂',
          poNo: syncedPoNo,
          orderType: '其他',
          sapOrderType: 'Z030',
          status: '开立',
          writebackErp: false,
          writebackResult: '',
          arrivalDate: modDate,
          createdAt: `${modDate} 10:30:00`,
          inboundDate: '',
          supplierCode: supInput || matchedSup.code,
          supplier: matchedSup.name,
          remark: 'SAP同步',
          lines: [
            {
              id: `sap-l-${Date.now()}`,
              itemNo: '10',
              materialCode: matInput || matchedMat.code,
              materialName: matchedMat.name,
              materialSpec: matchedMat.spec,
              planQty: matchedMat.code === '90007824' ? 2 : 1500,
              releasedQty: 0,
              receivedQty: 0,
              overReceiptRate: '',
              deliveryDate: modDate,
              remark: 'SAP同步',
            },
          ],
        };
        setRecords((prev) => [newRec, ...prev]);
        setPage(1);
        setActivePoId(newId);
        onShowToast(`已从 SAP 拉取并同步采购订单 ${syncedPoNo}（1 条）`, 'success');
      }

      setSapSyncing(false);
      setSapSyncOpen(false);
    }, 260);
  };

  const handleBatchDeleteClick = () => {
    if (!selectedRecords.length) {
      onShowToast('请先勾选需要删除的采购订单', 'warning');
      return;
    }
    setConfirmDelete({
      ids: selectedRecords.map((r) => r.id),
      label: `确认批量删除已勾选的 ${selectedRecords.length} 张采购订单？`,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const idSet = new Set(confirmDelete.ids);
    setRecords((prev) => prev.filter((r) => !idSet.has(r.id)));
    setSelectedIds((prev) => {
      const next = { ...prev };
      confirmDelete.ids.forEach((id) => delete next[id]);
      return next;
    });
    if (activePoId && idSet.has(activePoId)) {
      setActivePoId(null);
    }
    setConfirmDelete(null);
    onShowToast(`已删除 ${idSet.size} 张采购订单`, 'success');
  };

  const handleExportCsv = () => {
    const rows = selectedRecords.length ? selectedRecords : filteredRecords;
    if (!rows.length) {
      onShowToast('没有可导出的采购订单数据', 'warning');
      return;
    }
    const headers = [
      '组织机构',
      '采购单号',
      '订单类型',
      '单据状态',
      '回写ERP标识',
      '回写ERP结果',
      '到货时间',
      '供应商',
      '创建时间',
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows
      .map((r) =>
        [
          r.org,
          r.poNo,
          r.orderType,
          r.status,
          r.writebackErp ? '已回写' : '未回写',
          r.writebackResult,
          r.arrivalDate,
          r.supplier,
          r.createdAt,
        ]
          .map(esc)
          .join(',')
      )
      .join('\n');
    const blob = new Blob(['\ufeff' + headers.join(',') + '\n' + body], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `采购订单-20261119.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`已导出 ${rows.length} 张采购订单 CSV`, 'success');
  };

  const handleSyncErp = () => {
    handleOpenSapSync();
  };

  const handleJumpPage = () => {
    const n = parseInt(jumpInput.trim(), 10);
    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) {
      setPage(n);
    } else if (jumpInput.trim()) {
      onShowToast(`请输入 1 ~ ${totalPages} 之间的页码`, 'warning');
    }
    setJumpInput('');
  };

  const statusBadgeClass = (s: PoStatus) => {
    switch (s) {
      case '开立':
        return 'bg-[#0052D9] text-white';
      case '操作中':
        return 'bg-[#F59A5B] text-white';
      case '已审核':
        return 'bg-emerald-600 text-white';
      case '已关结':
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div
      className="space-y-4 relative text-xs text-[#1E293B]"
      onClick={() => setMoreMenuPoId(null)}
    >
      {/* Top Query Filter Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        {/* Header Bar: Title + Inline 组织机构 + Right Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">采购订单</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E40AF] font-medium">组织机构</span>
              <div className="relative flex items-center w-60">
                <select
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="h-8 w-full pl-2.5 pr-8 text-xs text-[#1E293B] bg-white border border-[#E5E9F0] rounded-lg outline-none focus:border-[#2563EB] transition appearance-none cursor-pointer"
                >
                  <option value="">请选择</option>
                  {ORGS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {org && (
                  <button
                    type="button"
                    onClick={() => setOrg('')}
                    title="清空组织机构"
                    className="absolute right-2.5 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              onClick={() => setColSettingsOpen(true)}
              title="列显示设置"
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              title={filtersExpanded ? '收起筛选条件' : '展开筛选条件'}
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg flex items-center justify-center text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer shrink-0"
            >
              {filtersExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {filtersExpanded && (
          <div className="space-y-2.5 pt-0.5">
            {/* Row 1: 创建时间 (segmented tabs + datetime range) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                创建时间
              </label>
              <div className="flex flex-wrap items-center gap-1 bg-[#F4F6F9] p-0.5 rounded-lg border border-[#E5E9F0]">
                {(
                  [
                    ['today', '今天'],
                    ['week', '本周'],
                    ['month', '本月'],
                    ['threeMonths', '最近三个月'],
                    ['custom', '自定义'],
                  ] as Array<[QuickTimeRange, string]>
                ).map(([code, label]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleQuickRange(code)}
                    className={`px-2.5 py-1 text-xs rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                      quickRange === code
                        ? 'bg-[#165DFF] text-white font-medium'
                        : 'text-[#1E40AF] hover:bg-[#EBF2FF]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition">
                <input
                  type="text"
                  value={createdFrom}
                  onChange={(e) => {
                    setQuickRange('custom');
                    setCreatedFrom(e.target.value);
                  }}
                  className="w-[134px] text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent"
                />
                <ArrowRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
                <input
                  type="text"
                  value={createdTo}
                  onChange={(e) => {
                    setQuickRange('custom');
                    setCreatedTo(e.target.value);
                  }}
                  className="w-[134px] text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent"
                />
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              </div>
            </div>

            {/* Row 2: 采购单号 / 物料料号 / 供应商 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  采购单号
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={poOp}
                    onChange={(e) => setPoOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={poVal}
                    onChange={(e) => setPoVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  物料料号
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={matOp}
                    onChange={(e) => setMatOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    list="po-mat-options"
                    value={matVal}
                    onChange={(e) => setMatVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请选择"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] mr-2 shrink-0" />
                  <datalist id="po-mat-options">
                    {MATERIAL_CATALOG.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  供应商
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={supOp}
                    onChange={(e) => setSupOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    list="po-sup-options"
                    value={supVal}
                    onChange={(e) => setSupVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请选择"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] mr-2 shrink-0" />
                  <datalist id="po-sup-options">
                    {SUPPLIERS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Row 3: 单据状态 / 入库时间 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  单据状态
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={statusOp}
                    onChange={(e) => setStatusOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
                    <option value="开立">开立</option>
                    <option value="操作中">操作中</option>
                    <option value="已审核">已审核</option>
                    <option value="已关结">已关结</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-[#1E40AF] font-medium shrink-0">
                  入库时间
                </label>
                <div className="flex items-center gap-1.5 h-8 flex-1 min-w-0 px-2.5 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition">
                  <input
                    type="date"
                    value={inboundFrom}
                    onChange={(e) => setInboundFrom(e.target.value)}
                    aria-label="入库开始日期"
                    className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent flex-1 min-w-0"
                  />
                  <ArrowRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  <input
                    type="date"
                    value={inboundTo}
                    onChange={(e) => setInboundTo(e.target.value)}
                    aria-label="入库结束日期"
                    className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent flex-1 min-w-0"
                  />
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 hidden sm:block" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Master Table Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-2">
            <span>
              已选{' '}
              <strong className="font-mono tabular-nums text-[#1E293B]">
                {selectedRecords.length}
              </strong>{' '}
              项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配{' '}
              <strong className="font-mono tabular-nums text-[#1E293B]">
                {totalCount}
              </strong>{' '}
              张采购订单
            </span>
            {activePo && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  明细视图：
                  <strong className="font-mono text-[#1E40AF] mx-0.5">
                    {activePo.poNo}
                  </strong>
                  <button
                    type="button"
                    onClick={() => setActivePoId(null)}
                    className="text-[#1E40AF] hover:text-[#1E293B] hover:underline ml-1 cursor-pointer"
                  >
                    取消
                  </button>
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSyncErp}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>同步SAP</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDeleteClick}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                selectedRecords.length > 0
                  ? 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
                  : 'border-[#E5E9F0] bg-white text-[#EA580C]/80 hover:border-[#EA580C]/50 hover:bg-[#EA580C]/5'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-8 px-3.5 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setImportText('');
                setImportModalOpen(true);
              }}
              className="h-8 px-3.5 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入</span>
            </button>
          </div>
        </div>

        {/* Upper Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="w-10 p-2.5 text-center border-b border-r border-[#E5E9F0]">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedIds((prev) => {
                        const next = { ...prev };
                        pagedRecords.forEach((r) => {
                          next[r.id] = checked;
                        });
                        return next;
                      });
                    }}
                    className="w-3.5 h-3.5 cursor-pointer accent-[#165DFF] align-middle"
                  />
                </th>

                {visibleMasterCols.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      onClick={() => handleSortMaster(col.key, col.sortable)}
                      className={`p-2.5 border-b border-r border-[#E5E9F0] select-none text-center transition ${
                        col.sortable ? 'cursor-pointer hover:bg-[#EDF2F7]/70' : ''
                      }`}
                    >
                      <div className="inline-flex items-center justify-center gap-1">
                        <span>{col.title}</span>
                        {col.sortable && (
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              isSorted ? 'text-[#1E40AF]' : 'text-[#C5C8BE]'
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}

                <th className="p-2.5 border-b border-[#E5E9F0] text-center min-w-[145px] sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  <div className="inline-flex items-center justify-center gap-2">
                    <span>操作</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setColSettingsOpen(true);
                      }}
                      title="列显示设置"
                      className="text-[#2563EB] hover:text-[#1E293B] cursor-pointer transition"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EDF2F7] text-xs text-[#1E293B]">
              {pagedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleMasterCols.length + 2}
                    className="py-12 text-center text-xs text-[#64748B]"
                  >
                    未查询到符合条件的采购订单，请调整筛选条件或点击「重置」
                  </td>
                </tr>
              ) : (
                pagedRecords.map((row) => {
                  const isChecked = !!selectedIds[row.id];
                  const isSelectedMaster = activePoId === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setActivePoId((prev) => (prev === row.id ? null : row.id));
                        setSelectedLineIds({});
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelectedMaster || isChecked
                          ? 'bg-[#EBF2FF]/60 hover:bg-[#EBF2FF]/80'
                          : 'hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <td
                        className="p-2.5 border-r border-[#EDF2F7] text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setSelectedIds((prev) => ({
                              ...prev,
                              [row.id]: e.target.checked,
                            }))
                          }
                          className="w-3.5 h-3.5 cursor-pointer accent-[#165DFF] align-middle"
                        />
                      </td>

                      {visibleMasterCols.map((col) => {
                        if (col.key === 'orderType') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap"
                            >
                              {row.orderType === '公司间采购' ? (
                                <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-[#1E40AF] bg-[#EBF2FF] border border-[#BFDBFE] rounded-md">
                                  公司间采购
                                </span>
                              ) : (
                                <span className="text-xs text-[#1E293B]">{row.orderType}</span>
                              )}
                            </td>
                          );
                        }

                        if (col.key === 'status') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap"
                            >
                              <span
                                className={`inline-block min-w-[60px] px-2.5 py-0.5 text-[11px] font-medium rounded-md ${statusBadgeClass(
                                  row.status
                                )}`}
                              >
                                {row.status}
                              </span>
                            </td>
                          );
                        }

                        if (col.key === 'writebackErp') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                role="switch"
                                aria-checked={row.writebackErp}
                                onClick={() => handleToggleErpWriteback(row.id)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                                  row.writebackErp ? 'bg-[#165DFF]' : 'bg-[#CBD5E1]'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                    row.writebackErp ? 'translate-x-4.5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        }

                        if (col.key === 'poNo') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap font-mono tabular-nums font-bold text-[#1E40AF]"
                            >
                              {row[col.key]}
                            </td>
                          );
                        }

                        if (col.key === 'arrivalDate') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap font-mono tabular-nums"
                            >
                              {row[col.key]}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={col.key}
                            className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap"
                          >
                            {row[col.key]}
                          </td>
                        );
                      })}

                      <td
                        className={`p-2.5 text-center whitespace-nowrap sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isSelectedMaster || isChecked ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-center gap-2.5 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(row, 'view')}
                            className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                          >
                            查看
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(row, 'edit')}
                            className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                          >
                            修改
                          </button>
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() =>
                                setMoreMenuPoId((prev) =>
                                  prev === row.id ? null : row.id
                                )
                              }
                              className="inline-flex items-center gap-0.5 text-[#1E40AF] hover:text-[#1E293B] font-medium cursor-pointer"
                            >
                              <span>更多</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {moreMenuPoId === row.id && (
                              <div className="absolute right-0 mt-1 w-28 bg-white border border-[#E5E9F0] rounded-lg shadow-lg py-1 z-30 text-left text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecords((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id ? { ...r, status: '已审核' } : r
                                      )
                                    );
                                    setMoreMenuPoId(null);
                                    onShowToast(`采购订单 ${row.poNo} 已审核`, 'success');
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#1E293B] hover:bg-[#F4F6F9] cursor-pointer"
                                >
                                  审核单据
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecords((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id ? { ...r, status: '已关结' } : r
                                      )
                                    );
                                    setMoreMenuPoId(null);
                                    onShowToast(`采购订单 ${row.poNo} 已关结`, 'info');
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#1E293B] hover:bg-[#F4F6F9] cursor-pointer"
                                >
                                  关结单据
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleErpWriteback(row.id);
                                    setMoreMenuPoId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#1E293B] hover:bg-[#F4F6F9] cursor-pointer"
                                >
                                  回写 ERP
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMoreMenuPoId(null);
                                    setConfirmDelete({
                                      ids: [row.id],
                                      label: `确认删除采购订单 ${row.poNo}？`,
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#EA580C] hover:bg-[#EA580C]/10 cursor-pointer"
                                >
                                  删除
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

        {/* Pagination Bar (工单管理风格) */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计{' '}
            <strong className="font-mono tabular-nums text-[#1E293B]">
              {totalCount}
            </strong>{' '}
            条
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              title="上一页"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-lg border font-mono tabular-nums transition cursor-pointer ${
                  p === safePage
                    ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                    : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:border-[#2563EB]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 border border-[#E5E9F0] rounded-lg bg-white flex items-center justify-center hover:border-[#2563EB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              title="下一页"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-7 px-2 border border-[#E5E9F0] rounded-lg bg-white text-xs text-[#1E293B] outline-none cursor-pointer"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>

          <div className="flex items-center gap-1.5">
            <span>跳至</span>
            <input
              type="text"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJumpPage();
              }}
              onBlur={handleJumpPage}
              className="w-11 h-7 px-1.5 text-center font-mono tabular-nums border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB]"
            />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* Lower Detail Table Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#1E293B]">采购订单明细行</span>
            {activePo ? (
              <span className="px-2 py-0.5 rounded-md bg-[#EBF2FF] text-[#1E40AF] font-mono font-medium">
                {activePo.poNo} · {sortedDetailLines.length} 项
              </span>
            ) : (
              <span className="text-[#64748B]">点击上方任意采购订单行查看明细</span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="w-10 p-2.5 text-center border-b border-r border-[#E5E9F0]">
                  <input
                    type="checkbox"
                    checked={
                      sortedDetailLines.length > 0 &&
                      sortedDetailLines.every((l) => selectedLineIds[l.id])
                    }
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const next: Record<string, boolean> = {};
                      if (checked) {
                        sortedDetailLines.forEach((l) => {
                          next[l.id] = true;
                        });
                      }
                      setSelectedLineIds(next);
                    }}
                    className="w-3.5 h-3.5 cursor-pointer accent-[#165DFF] align-middle"
                  />
                </th>

                {DETAIL_COLS.map((col) => {
                  const isSorted = detailSortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      onClick={() => handleSortDetail(col.key)}
                      className="p-2.5 border-b border-r border-[#E5E9F0] text-center cursor-pointer hover:bg-[#EDF2F7]/70 select-none transition"
                    >
                      <div className="inline-flex items-center justify-center gap-1">
                        <span>{col.title}</span>
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            isSorted ? 'text-[#1E40AF]' : 'text-[#C5C8BE]'
                          }`}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EDF2F7] text-xs text-[#1E293B]">
              {sortedDetailLines.length === 0 ? (
                <tr>
                  <td
                    colSpan={DETAIL_COLS.length + 1}
                    className="py-12 text-center text-[#64748B]"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-10 h-10 text-[#CBD5E1] stroke-[1.3]" />
                      <span className="text-xs text-[#64748B]">暂无数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedDetailLines.map((line) => (
                  <tr key={line.id} className="hover:bg-[#F4F6F9] transition-colors">
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={!!selectedLineIds[line.id]}
                        onChange={(e) =>
                          setSelectedLineIds((prev) => ({
                            ...prev,
                            [line.id]: e.target.checked,
                          }))
                        }
                        className="w-3.5 h-3.5 cursor-pointer accent-[#165DFF] align-middle"
                      />
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums">
                      {line.itemNo}
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums font-bold text-[#1E40AF]">
                      {line.materialCode}
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      {line.materialName}
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center text-[#64748B]">
                      {line.materialSpec}
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums font-medium">
                      {line.planQty}
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#1E40AF]">
                      {line.releasedQty}
                    </td>
                    <td className="p-2.5 text-center font-mono tabular-nums text-emerald-700 font-medium">
                      {line.receivedQty}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SAP Sync Drawer ("采购单据表") matching screenshot */}
      {sapSyncOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/35"
          onClick={() => setSapSyncOpen(false)}
        >
          <div
            className="w-full max-w-[780px] bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: × 采购单据表 */}
            <div className="px-5 py-4 border-b border-[#F0F2F5] flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSapSyncOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[15px] font-medium text-[#1E293B]">
                采购单据表
              </span>
            </div>

            {/* Body: 4 left-aligned SAP sync query fields */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-3.5 max-w-sm">
                <div className="flex items-center gap-3">
                  <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                    供应商编码
                  </label>
                  <input
                    type="text"
                    list="sap-sync-sup-codes"
                    value={sapSyncForm.supplierCode}
                    onChange={(e) =>
                      setSapSyncForm((p) => ({ ...p, supplierCode: e.target.value }))
                    }
                    placeholder="请输入"
                    className="h-8 flex-1 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] transition font-mono"
                  />
                  <datalist id="sap-sync-sup-codes">
                    {SUPPLIER_LIST.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                    采购订单编号
                  </label>
                  <input
                    type="text"
                    value={sapSyncForm.poNo}
                    onChange={(e) =>
                      setSapSyncForm((p) => ({ ...p, poNo: e.target.value }))
                    }
                    placeholder="请输入"
                    className="h-8 flex-1 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] transition font-mono"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                    物料料号
                  </label>
                  <input
                    type="text"
                    list="sap-sync-mat-codes"
                    value={sapSyncForm.materialCode}
                    onChange={(e) =>
                      setSapSyncForm((p) => ({ ...p, materialCode: e.target.value }))
                    }
                    placeholder="请输入"
                    className="h-8 flex-1 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] transition font-mono"
                  />
                  <datalist id="sap-sync-mat-codes">
                    {MATERIAL_CATALOG.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                    最后修改时间
                  </label>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="date"
                      value={sapSyncForm.lastModifiedDate}
                      onChange={(e) =>
                        setSapSyncForm((p) => ({
                          ...p,
                          lastModifiedDate: e.target.value,
                        }))
                      }
                      className="h-8 w-full px-2.5 text-xs text-[#1E293B] font-mono tabular-nums border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] transition bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: Bottom-right "同步" button matching screenshot */}
            <div className="px-6 py-3.5 border-t border-[#F0F2F5] bg-white flex justify-end">
              <button
                type="button"
                disabled={sapSyncing}
                onClick={handleExecuteSapSync}
                className="h-8 px-5 text-xs font-medium text-[#334155] bg-white border border-[#D9E1EC] hover:border-[#1890FF] hover:text-[#1890FF] rounded-xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {sapSyncing ? '同步中...' : '同步'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / View PO Full-Height Drawer ("修改-采购单" / "查看-采购单") matching screenshot */}
      {poDrawer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/35"
          onClick={() => setPoDrawer(null)}
        >
          <div
            className="w-full max-w-[1160px] bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: × 修改-采购单 / 查看-采购单 */}
            <div className="px-5 py-4 border-b border-[#F0F2F5] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setPoDrawer(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[15px] font-medium text-[#1E293B]">
                {poDrawer.mode === 'edit' ? '修改-采购单' : '查看-采购单'}
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Row 1: * 供应商 / * 到货时间 / 采购单号 / 订单类型 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3">
                {/* 供应商 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#334155]">
                    <span className="text-[#FF4D4F] mr-1">*</span>供应商
                  </label>
                  <div
                    className={`flex items-center h-8 px-2.5 border rounded-xs transition ${
                      poDrawer.mode === 'view'
                        ? 'bg-[#F5F5F5] border-[#E5E9F0] text-[#64748B]'
                        : 'bg-white border-[#D9E1EC] focus-within:border-[#1890FF]'
                    }`}
                  >
                    <input
                      type="text"
                      list="drawer-supplier-options"
                      disabled={poDrawer.mode === 'view'}
                      value={drawerDraft.supplier}
                      onChange={(e) =>
                        setDrawerDraft((p) => ({ ...p, supplier: e.target.value }))
                      }
                      placeholder="请选择供应商"
                      className="flex-1 min-w-0 text-xs bg-transparent outline-none disabled:cursor-not-allowed text-[#1E293B] disabled:text-[#64748B]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 ml-1.5" />
                    <datalist id="drawer-supplier-options">
                      {SUPPLIER_LIST.map((s) => (
                        <option key={s.code} value={s.name}>
                          {s.code}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* 到货时间 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#334155]">
                    <span className="text-[#FF4D4F] mr-1">*</span>到货时间
                  </label>
                  <input
                    type="date"
                    disabled={poDrawer.mode === 'view'}
                    value={drawerDraft.arrivalDate}
                    onChange={(e) =>
                      setDrawerDraft((p) => ({ ...p, arrivalDate: e.target.value }))
                    }
                    className="h-8 px-2.5 text-xs font-mono tabular-nums border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] bg-white disabled:bg-[#F5F5F5] disabled:text-[#64748B] disabled:cursor-not-allowed"
                  />
                </div>

                {/* 采购单号 (always read-only / disabled gray matching screenshot) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#334155]">采购单号</label>
                  <input
                    type="text"
                    disabled
                    value={drawerDraft.poNo}
                    className="h-8 px-2.5 text-xs font-mono tabular-nums bg-[#F5F5F5] text-[#94A3B8] border border-[#E5E9F0] rounded-xs cursor-not-allowed"
                  />
                </div>

                {/* 订单类型 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#334155]">订单类型</label>
                  <select
                    disabled={poDrawer.mode === 'view'}
                    value={drawerDraft.sapOrderType}
                    onChange={(e) =>
                      setDrawerDraft((p) => ({
                        ...p,
                        sapOrderType: e.target.value as SapOrderTypeCode,
                      }))
                    }
                    className="h-8 px-2.5 text-xs font-mono text-[#1E293B] bg-white border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] disabled:bg-[#F5F5F5] disabled:text-[#64748B] disabled:cursor-not-allowed"
                  >
                    {SAP_ORDER_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: 备注 (spanning ~3 columns width matching screenshot) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8">
                <div className="lg:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs text-[#334155]">备注</label>
                  <input
                    type="text"
                    disabled={poDrawer.mode === 'view'}
                    value={drawerDraft.remark}
                    onChange={(e) =>
                      setDrawerDraft((p) => ({ ...p, remark: e.target.value }))
                    }
                    placeholder="请输入备注"
                    className="h-8 px-2.5 text-xs text-[#1E293B] bg-white border border-[#93C5FD] focus:border-[#1890FF] rounded-xs outline-none disabled:bg-[#F5F5F5] disabled:border-[#E5E9F0] disabled:text-[#64748B] disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Line Items Action Bar (+新增 / -批量删除 in edit mode) */}
              {poDrawer.mode === 'edit' && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDrawerAddLine}
                    className="inline-flex items-center gap-1 h-8 px-3.5 text-xs font-medium bg-[#1890FF] hover:bg-[#165DFF] text-white rounded-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDrawerBatchDeleteLines}
                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium text-[#FF4D4F] bg-white border border-[#FFA39E] hover:bg-rose-50 rounded-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>批量删除</span>
                  </button>
                </div>
              )}

              {/* Line Items Table matching screenshot */}
              <div className="border border-[#E5E9F0] rounded-xs overflow-x-auto bg-white min-h-[210px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E9F0] text-xs font-medium text-[#334155]">
                      <th className="w-11 px-3 py-2.5 text-center border-r border-[#F0F2F5]">
                        <input
                          type="checkbox"
                          disabled={poDrawer.mode === 'view'}
                          checked={
                            drawerDraft.lines.length > 0 &&
                            drawerDraft.lines.every((l) => drawerSelectedLineIds[l.id])
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const next: Record<string, boolean> = {};
                            if (checked) {
                              drawerDraft.lines.forEach((l) => {
                                next[l.id] = true;
                              });
                            }
                            setDrawerSelectedLineIds(next);
                          }}
                          className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] accent-[#1890FF] cursor-pointer disabled:cursor-not-allowed"
                        />
                      </th>
                      <th className="w-11 px-2 py-2.5 text-center border-r border-[#F0F2F5]" />
                      <th
                        onClick={() => handleSortDrawerLines('itemNo')}
                        className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[115px] cursor-pointer hover:text-[#1890FF] select-none"
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          <span className="text-[#FF4D4F]">*</span>
                          <span>项次</span>
                          <span className="inline-flex flex-col leading-none text-[8px]">
                            <span
                              className={
                                drawerLineSortKey === 'itemNo' && drawerLineSortDir === 'asc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={`-mt-0.5 ${
                                drawerLineSortKey === 'itemNo' && drawerLineSortDir === 'desc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }`}
                            >
                              ▼
                            </span>
                          </span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortDrawerLines('materialCode')}
                        className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[140px] cursor-pointer hover:text-[#1890FF] select-none"
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          <span className="text-[#FF4D4F]">*</span>
                          <span>物料料号</span>
                          <span className="inline-flex flex-col leading-none text-[8px]">
                            <span
                              className={
                                drawerLineSortKey === 'materialCode' &&
                                drawerLineSortDir === 'asc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={`-mt-0.5 ${
                                drawerLineSortKey === 'materialCode' &&
                                drawerLineSortDir === 'desc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }`}
                            >
                              ▼
                            </span>
                          </span>
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[155px]">
                        物料名称
                      </th>
                      <th className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[125px]">
                        物料规格
                      </th>
                      <th
                        onClick={() => handleSortDrawerLines('planQty')}
                        className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[125px] cursor-pointer hover:text-[#1890FF] select-none"
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          <span className="text-[#FF4D4F]">*</span>
                          <span>计划数量</span>
                          <span className="inline-flex flex-col leading-none text-[8px]">
                            <span
                              className={
                                drawerLineSortKey === 'planQty' && drawerLineSortDir === 'asc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={`-mt-0.5 ${
                                drawerLineSortKey === 'planQty' && drawerLineSortDir === 'desc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }`}
                            >
                              ▼
                            </span>
                          </span>
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[95px]">
                        超收率(%)
                      </th>
                      <th
                        onClick={() => handleSortDrawerLines('deliveryDate')}
                        className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[135px] cursor-pointer hover:text-[#1890FF] select-none"
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          <span>交货日期</span>
                          <span className="inline-flex flex-col leading-none text-[8px]">
                            <span
                              className={
                                drawerLineSortKey === 'deliveryDate' &&
                                drawerLineSortDir === 'asc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={`-mt-0.5 ${
                                drawerLineSortKey === 'deliveryDate' &&
                                drawerLineSortDir === 'desc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }`}
                            >
                              ▼
                            </span>
                          </span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortDrawerLines('remark')}
                        className="px-3 py-2.5 text-center whitespace-nowrap min-w-[115px] cursor-pointer hover:text-[#1890FF] select-none"
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          <span>备注</span>
                          <span className="inline-flex flex-col leading-none text-[8px]">
                            <span
                              className={
                                drawerLineSortKey === 'remark' && drawerLineSortDir === 'asc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={`-mt-0.5 ${
                                drawerLineSortKey === 'remark' && drawerLineSortDir === 'desc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }`}
                            >
                              ▼
                            </span>
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7] text-xs text-[#1E293B]">
                    {drawerDraft.lines.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="py-10 text-center text-xs text-[#94A3B8]"
                        >
                          暂无采购明细行
                        </td>
                      </tr>
                    ) : (
                      drawerDraft.lines.map((line, index) => {
                        const isView = poDrawer.mode === 'view';
                        return (
                          <tr key={line.id} className="hover:bg-[#FAFBFD]">
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                disabled={isView}
                                checked={!!drawerSelectedLineIds[line.id]}
                                onChange={(e) =>
                                  setDrawerSelectedLineIds((prev) => ({
                                    ...prev,
                                    [line.id]: e.target.checked,
                                  }))
                                }
                                className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] accent-[#1890FF] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-2 py-2 text-center font-mono tabular-nums text-[#475569]">
                              {index + 1}
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                disabled={isView}
                                value={line.itemNo}
                                onChange={(e) =>
                                  handleDrawerLineChange(line.id, {
                                    itemNo: e.target.value,
                                  })
                                }
                                className="h-7 w-full px-2 text-xs font-mono tabular-nums border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] bg-white disabled:bg-[#F5F5F5] disabled:text-[#64748B]"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <div
                                className={`flex items-center h-7 px-2 border rounded-xs ${
                                  isView
                                    ? 'bg-[#F5F5F5] border-[#E5E9F0]'
                                    : 'bg-white border-[#D9E1EC] focus-within:border-[#1890FF]'
                                }`}
                              >
                                <input
                                  type="text"
                                  list="drawer-mat-options"
                                  disabled={isView}
                                  value={line.materialCode}
                                  onChange={(e) =>
                                    handleDrawerLineChange(line.id, {
                                      materialCode: e.target.value,
                                    })
                                  }
                                  placeholder="料号"
                                  className="flex-1 min-w-0 text-xs font-mono tabular-nums bg-transparent outline-none disabled:text-[#64748B]"
                                />
                                <Search className="w-3 h-3 text-[#94A3B8] shrink-0 ml-1" />
                              </div>
                            </td>
                            <td className="px-3 py-2 text-[#1E293B] whitespace-nowrap">
                              {line.materialName}
                            </td>
                            <td className="px-3 py-2 text-[#475569] whitespace-nowrap">
                              {line.materialSpec}
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="0.01"
                                disabled={isView}
                                value={
                                  isView
                                    ? line.planQty.toFixed(2)
                                    : line.planQty
                                }
                                onChange={(e) =>
                                  handleDrawerLineChange(line.id, {
                                    planQty: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="h-7 w-full px-2 text-xs font-mono tabular-nums border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] bg-white disabled:bg-[#F5F5F5] disabled:text-[#64748B]"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                disabled={isView}
                                value={line.overReceiptRate}
                                onChange={(e) =>
                                  handleDrawerLineChange(line.id, {
                                    overReceiptRate: e.target.value,
                                  })
                                }
                                placeholder="请..."
                                className="h-7 w-full px-2 text-xs font-mono tabular-nums placeholder-[#B8C2CC] border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] bg-white disabled:bg-[#F5F5F5] disabled:text-[#64748B]"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="date"
                                disabled={isView}
                                value={line.deliveryDate}
                                onChange={(e) =>
                                  handleDrawerLineChange(line.id, {
                                    deliveryDate: e.target.value,
                                  })
                                }
                                className="h-7 w-full px-2 text-xs font-mono tabular-nums border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] bg-white disabled:bg-[#F5F5F5] disabled:text-[#64748B]"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                disabled={isView}
                                value={line.remark}
                                onChange={(e) =>
                                  handleDrawerLineChange(line.id, {
                                    remark: e.target.value,
                                  })
                                }
                                placeholder="请..."
                                className="h-7 w-full px-2 text-xs placeholder-[#B8C2CC] border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] bg-white disabled:bg-[#F5F5F5] disabled:text-[#64748B]"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                <datalist id="drawer-mat-options">
                  {MATERIAL_CATALOG.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.name}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Footer: 保存并退出 / 取消 (Edit) or 进入修改 / 关闭 (View) */}
            <div className="px-5 py-3.5 border-t border-[#F0F2F5] bg-white flex justify-end gap-2.5 shrink-0">
              {poDrawer.mode === 'edit' ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveDrawer}
                    className="h-8 px-4 text-xs font-medium bg-[#1890FF] hover:bg-[#165DFF] text-white rounded-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    保存并退出
                  </button>
                  <button
                    type="button"
                    onClick={() => setPoDrawer(null)}
                    className="h-8 px-4 text-xs font-medium bg-white border border-[#D9E1EC] hover:bg-[#F8FAFC] text-[#334155] rounded-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPoDrawer((prev) =>
                        prev ? { ...prev, mode: 'edit' } : null
                      )
                    }
                    className="h-8 px-4 text-xs font-medium bg-[#1890FF] hover:bg-[#165DFF] text-white rounded-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    修改
                  </button>
                  <button
                    type="button"
                    onClick={() => setPoDrawer(null)}
                    className="h-8 px-4 text-xs font-medium bg-white border border-[#D9E1EC] hover:bg-[#F8FAFC] text-[#334155] rounded-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    取消
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
          onClick={() => setImportModalOpen(false)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#165DFF]" />
                <span className="text-sm font-bold text-[#0F172A]">批量导入采购订单</span>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5 text-xs">
              <p className="text-[#64748B]">
                每行一条：采购单号,订单类型(其他/公司间采购),到货时间(YYYY-MM-DD)
              </p>
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="5300023380,其他,2026-11-20"
                className="w-full p-2.5 border border-[#D9E1EC] rounded-sm font-mono text-xs outline-none focus:border-[#165DFF]"
              />
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const lines = importText
                    .split(/\r?\n/)
                    .map((l) => l.trim())
                    .filter(Boolean);
                  if (!lines.length) {
                    onShowToast('请输入至少一条导入数据', 'warning');
                    return;
                  }
                  const added: PurchaseOrderRecord[] = lines.map((line, i) => {
                    const [poNo, typeRaw, arrDate] = line.split(',').map((s) => s.trim());
                    const isIntercompany = typeRaw === '公司间采购';
                    return {
                      id: `po-imp-${Date.now()}-${i}`,
                      org: '昇兴集团-中山制罐工厂',
                      poNo: poNo || `530002${3400 + i}`,
                      orderType: isIntercompany ? '公司间采购' : '其他',
                      sapOrderType: isIntercompany ? 'UB' : 'Z030',
                      status: '开立',
                      writebackErp: false,
                      writebackResult: '',
                      arrivalDate: arrDate || '2026-11-19',
                      createdAt: '2026-11-19 10:15:00',
                      inboundDate: '',
                      supplierCode: SUPPLIER_LIST[0].code,
                      supplier: SUPPLIER_LIST[0].name,
                      remark: '批量导入',
                      lines: [
                        {
                          id: `imp-l-${Date.now()}-${i}`,
                          itemNo: '10',
                          materialCode: MATERIAL_CATALOG[0].code,
                          materialName: MATERIAL_CATALOG[0].name,
                          materialSpec: MATERIAL_CATALOG[0].spec,
                          planQty: 2,
                          releasedQty: 0,
                          receivedQty: 0,
                          overReceiptRate: '',
                          deliveryDate: arrDate || '2026-11-19',
                          remark: '',
                        },
                      ],
                    };
                  });
                  setRecords((prev) => [...added, ...prev]);
                  setImportModalOpen(false);
                  onShowToast(`已导入 ${added.length} 张采购订单`, 'success');
                }}
                className="px-4 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded hover:bg-[#1E40AF] cursor-pointer"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Settings Modal */}
      {colSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
          onClick={() => setColSettingsOpen(false)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">主表列显示设置</span>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {MASTER_COLS.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#EEF2F7] hover:bg-[#F8FAFC] text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!hiddenMasterCols[c.key]}
                    onChange={(e) =>
                      setHiddenMasterCols((prev) => ({
                        ...prev,
                        [c.key]: !e.target.checked,
                      }))
                    }
                    className="rounded-xs border-[#CBD5E1] accent-[#165DFF]"
                  />
                  <span className="text-[#1E293B] truncate">{c.title}</span>
                </label>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-between">
              <button
                type="button"
                onClick={() =>
                  setHiddenMasterCols({
                    org: false,
                    poNo: false,
                    orderType: false,
                    status: false,
                    writebackErp: false,
                    writebackResult: false,
                    arrivalDate: false,
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-[#475569] hover:text-[#165DFF] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>全部显示</span>
              </button>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#165DFF] text-white rounded hover:bg-[#1E40AF] cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC]">
              <span className="text-sm font-bold text-[#0F172A]">删除确认</span>
            </div>
            <div className="p-5 text-xs text-[#334155]">{confirmDelete.label}</div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#DCE3EE] text-[#334155] rounded cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-medium bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
