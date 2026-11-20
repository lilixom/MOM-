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
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Trash2,
  Truck,
  Upload,
  X,
} from 'lucide-react';

interface SalesDeliveryTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals' | 'notContains';
type QuickDateRange = 'today' | 'week' | 'month' | 'threeMonths' | 'custom';
type DeliveryStatus = '开立' | '操作中' | '已关结';
type StatusFilter = 'ALL' | DeliveryStatus;

interface DeliveryMaterialLine {
  id: string;
  org: string;
  deliveryNo: string;
  outboundNo: string;
  salesOrderNo: string;
  itemNo: string;
  productCode: string;
  materialCode: string;
  materialName: string;
  lineStatus: '开立' | '已拣货' | '已出库' | '已关结';
  qty: number;
  writebackDone: boolean;
}

interface DeliverySnItem {
  id: string;
  org: string;
  materialSn: string;
  materialLineNo: string;
  materialCode: string;
  materialBatch: string;
  sapBatch: string;
  materialQty: number;
  newDeliveryNo: string;
  erpStatus: string;
  erpFlag: string;
}

interface SalesDeliveryRecord {
  id: string;
  org: string;
  deliveryNo: string;
  status: DeliveryStatus;
  urgent: boolean;
  erpWritebackFlag: boolean;
  erpWritebackResult: string;
  planOutboundDate: string;
  actualOutboundDate: string;
  customer: string;
  warehouse: string;
  productCode: string;
  materialCode: string;
  productName: string;
  exportCoa: '是' | '否';
  materials: DeliveryMaterialLine[];
  snList: DeliverySnItem[];
}

type MainColKey =
  | 'org'
  | 'deliveryNo'
  | 'status'
  | 'urgent'
  | 'erpWritebackFlag'
  | 'erpWritebackResult'
  | 'planOutboundDate'
  | 'actualOutboundDate';

const ORGS = [
  '昇兴集团-中山制罐工厂',
  '昇兴集团-福建制罐工厂',
  '昇兴集团-山东制罐工厂',
];

const CUSTOMERS = [
  '广州泰奇食品有限公司',
  '养元饮品股份有限公司',
  '露露股份（承德）有限公司',
  '王老吉大健康产业有限公司',
  '银鹭食品集团有限公司',
  '旺旺控股有限公司',
];

const WAREHOUSES = [
  '3101-成品一仓',
  '3102-成品二仓',
  '3105-成品立体库',
  '3110-外发待装区',
];

const PRODUCTS = [
  { code: '10023727', name: '泰奇八宝粥香滑椰汁三片罐' },
  { code: '10023815', name: '六个核桃240ml经典罐' },
  { code: '10024012', name: '王老吉310ml红罐凉茶罐' },
  { code: '10024108', name: '银鹭花生牛奶370ml罐' },
  { code: '10024290', name: '旺仔牛奶245ml红罐' },
  { code: '10024511', name: '露露杏仁露240ml三片罐' },
];

const MAIN_COLS: Array<{
  key: MainColKey;
  title: string;
  sortable: boolean;
  minWidth: string;
}> = [
  { key: 'org', title: '组织机构', sortable: false, minWidth: '175px' },
  { key: 'deliveryNo', title: '发货单号', sortable: true, minWidth: '130px' },
  { key: 'status', title: '单据状态', sortable: true, minWidth: '110px' },
  { key: 'urgent', title: '加急标志', sortable: false, minWidth: '105px' },
  { key: 'erpWritebackFlag', title: '回传ERP标志', sortable: false, minWidth: '120px' },
  { key: 'erpWritebackResult', title: '回写ERP结果', sortable: false, minWidth: '150px' },
  { key: 'planOutboundDate', title: '计划出库日期', sortable: true, minWidth: '135px' },
  { key: 'actualOutboundDate', title: '实际出库日期', sortable: true, minWidth: '135px' },
];

function buildInitialDeliveries(): SalesDeliveryRecord[] {
  const fixedTwelve: Array<{
    deliveryNo: string;
    planDate: string;
    actualDate: string;
    prodIdx: number;
    custIdx: number;
    hasSn: boolean;
  }> = [
    { deliveryNo: '2000362026', planDate: '2026-05-31', actualDate: '2026-06-02', prodIdx: 0, custIdx: 0, hasSn: false },
    { deliveryNo: '2000360064', planDate: '2026-04-30', actualDate: '2026-06-02', prodIdx: 1, custIdx: 1, hasSn: true },
    { deliveryNo: '2000356370', planDate: '2026-04-01', actualDate: '2026-05-29', prodIdx: 2, custIdx: 3, hasSn: true },
    { deliveryNo: '2000347755', planDate: '2026-05-13', actualDate: '2026-05-13', prodIdx: 3, custIdx: 4, hasSn: true },
    { deliveryNo: '2000347756', planDate: '2026-05-13', actualDate: '2026-05-13', prodIdx: 3, custIdx: 4, hasSn: false },
    { deliveryNo: '2000344490', planDate: '2026-04-30', actualDate: '2026-06-02', prodIdx: 4, custIdx: 5, hasSn: true },
    { deliveryNo: '2000344484', planDate: '2026-04-30', actualDate: '2026-05-08', prodIdx: 5, custIdx: 2, hasSn: true },
    { deliveryNo: '2000341987', planDate: '2026-04-30', actualDate: '2026-06-02', prodIdx: 1, custIdx: 1, hasSn: false },
    { deliveryNo: '2000341843', planDate: '2026-04-30', actualDate: '2026-04-30', prodIdx: 2, custIdx: 3, hasSn: true },
    { deliveryNo: '2000341798', planDate: '2026-04-10', actualDate: '2026-05-04', prodIdx: 0, custIdx: 0, hasSn: true },
    { deliveryNo: '2000341715', planDate: '2026-04-30', actualDate: '2026-04-30', prodIdx: 4, custIdx: 5, hasSn: false },
    { deliveryNo: '2000339585', planDate: '2026-04-01', actualDate: '2026-04-24', prodIdx: 5, custIdx: 2, hasSn: true },
  ];

  const list: SalesDeliveryRecord[] = [];

  // 1) First 12 closed records matching screenshot verbatim
  fixedTwelve.forEach((item, idx) => {
    const prod = PRODUCTS[item.prodIdx];
    const cust = CUSTOMERS[item.custIdx];
    const wh = WAREHOUSES[idx % WAREHOUSES.length];
    const snList: DeliverySnItem[] = item.hasSn
      ? [
          {
            id: `sn-${idx}-1`,
            org: '昇兴集团-中山制罐工厂',
            materialSn: `SN${item.deliveryNo}001`,
            materialLineNo: '10',
            materialCode: prod.code,
            materialBatch: `B202605${String(10 + idx).padStart(2, '0')}`,
            sapBatch: `SAP2605${String(10 + idx).padStart(2, '0')}`,
            materialQty: 4800,
            newDeliveryNo: item.deliveryNo,
            erpStatus: '已回传',
            erpFlag: 'Y',
          },
          {
            id: `sn-${idx}-2`,
            org: '昇兴集团-中山制罐工厂',
            materialSn: `SN${item.deliveryNo}002`,
            materialLineNo: '10',
            materialCode: prod.code,
            materialBatch: `B202605${String(10 + idx).padStart(2, '0')}`,
            sapBatch: `SAP2605${String(10 + idx).padStart(2, '0')}`,
            materialQty: 4800,
            newDeliveryNo: item.deliveryNo,
            erpStatus: '已回传',
            erpFlag: 'Y',
          },
        ]
      : [];

    list.push({
      id: `sd-${String(idx + 1).padStart(4, '0')}`,
      org: '昇兴集团-中山制罐工厂',
      deliveryNo: item.deliveryNo,
      status: '已关结',
      urgent: false,
      erpWritebackFlag: false,
      erpWritebackResult: '',
      planOutboundDate: item.planDate,
      actualOutboundDate: item.actualDate,
      customer: cust,
      warehouse: wh,
      productCode: prod.code,
      materialCode: prod.code,
      productName: prod.name,
      exportCoa: idx % 3 === 0 ? '是' : '否',
      materials: [
        {
          id: `ml-${idx + 1}-1`,
          org: '昇兴集团-中山制罐工厂',
          deliveryNo: item.deliveryNo,
          outboundNo: `OUT${item.deliveryNo.slice(-6)}`,
          salesOrderNo: `SO2026${String(5001 + idx)}`,
          itemNo: '10',
          productCode: prod.code,
          materialCode: prod.code,
          materialName: prod.name,
          lineStatus: '已关结',
          qty: 9600,
          writebackDone: false,
        },
      ],
      snList,
    });
  });

  // 2) Remaining 222 closed records -> total 234 "已关结" matching screenshot ("共计 234 条", 12 pages @ 20/page)
  const baseNo = 2000339500;
  for (let i = 12; i < 234; i++) {
    const num = baseNo - (i - 12) * 17;
    const deliveryNo = String(num);
    const prod = PRODUCTS[i % PRODUCTS.length];
    const cust = CUSTOMERS[i % CUSTOMERS.length];
    const wh = WAREHOUSES[i % WAREHOUSES.length];
    const month = i % 3 === 0 ? '03' : i % 3 === 1 ? '04' : '02';
    const day = String(1 + ((i * 7) % 27)).padStart(2, '0');
    const actualDay = String(Math.min(28, Number(day) + (i % 4))).padStart(2, '0');
    const planDate = `2026-${month}-${day}`;
    const actualDate = `2026-${month}-${actualDay}`;

    list.push({
      id: `sd-${String(i + 1).padStart(4, '0')}`,
      org: '昇兴集团-中山制罐工厂',
      deliveryNo,
      status: '已关结',
      urgent: false,
      erpWritebackFlag: false,
      erpWritebackResult: '',
      planOutboundDate: planDate,
      actualOutboundDate: actualDate,
      customer: cust,
      warehouse: wh,
      productCode: prod.code,
      materialCode: prod.code,
      productName: prod.name,
      exportCoa: i % 4 === 0 ? '是' : '否',
      materials: [
        {
          id: `ml-${i + 1}-1`,
          org: '昇兴集团-中山制罐工厂',
          deliveryNo,
          outboundNo: `OUT${deliveryNo.slice(-6)}`,
          salesOrderNo: `SO2026${String(5100 + i)}`,
          itemNo: '10',
          productCode: prod.code,
          materialCode: prod.code,
          materialName: prod.name,
          lineStatus: '已关结',
          qty: 6000 + (i % 5) * 1200,
          writebackDone: false,
        },
      ],
      snList:
        i % 2 === 0
          ? [
              {
                id: `sn-${i}-1`,
                org: '昇兴集团-中山制罐工厂',
                materialSn: `SN${deliveryNo}001`,
                materialLineNo: '10',
                materialCode: prod.code,
                materialBatch: `B2026${month}${day}`,
                sapBatch: `SAP26${month}${day}`,
                materialQty: 3600,
                newDeliveryNo: deliveryNo,
                erpStatus: '已回传',
                erpFlag: 'Y',
              },
            ]
          : [],
    });
  }

  // 3) Extra open / in-progress records so switching 单据状态 tabs (ALL / 开立 / 操作中) works naturally
  const activeSeeds: Array<{
    deliveryNo: string;
    status: DeliveryStatus;
    urgent: boolean;
    planDate: string;
    actualDate: string;
    prodIdx: number;
    custIdx: number;
  }> = [
    { deliveryNo: '2000364108', status: '开立', urgent: true, planDate: '2026-11-20', actualDate: '', prodIdx: 0, custIdx: 0 },
    { deliveryNo: '2000364102', status: '开立', urgent: false, planDate: '2026-11-21', actualDate: '', prodIdx: 1, custIdx: 1 },
    { deliveryNo: '2000364088', status: '开立', urgent: false, planDate: '2026-11-22', actualDate: '', prodIdx: 2, custIdx: 3 },
    { deliveryNo: '2000363995', status: '操作中', urgent: true, planDate: '2026-11-19', actualDate: '2026-11-19', prodIdx: 3, custIdx: 4 },
    { deliveryNo: '2000363971', status: '操作中', urgent: false, planDate: '2026-11-19', actualDate: '2026-11-19', prodIdx: 4, custIdx: 5 },
  ];

  activeSeeds.forEach((seed, idx) => {
    const prod = PRODUCTS[seed.prodIdx];
    const cust = CUSTOMERS[seed.custIdx];
    list.push({
      id: `sd-active-${idx + 1}`,
      org: '昇兴集团-中山制罐工厂',
      deliveryNo: seed.deliveryNo,
      status: seed.status,
      urgent: seed.urgent,
      erpWritebackFlag: false,
      erpWritebackResult: '',
      planOutboundDate: seed.planDate,
      actualOutboundDate: seed.actualDate,
      customer: cust,
      warehouse: WAREHOUSES[idx % WAREHOUSES.length],
      productCode: prod.code,
      materialCode: prod.code,
      productName: prod.name,
      exportCoa: '是',
      materials: [
        {
          id: `ml-act-${idx + 1}`,
          org: '昇兴集团-中山制罐工厂',
          deliveryNo: seed.deliveryNo,
          outboundNo: `OUT${seed.deliveryNo.slice(-6)}`,
          salesOrderNo: `SO20269${String(10 + idx)}`,
          itemNo: '10',
          productCode: prod.code,
          materialCode: prod.code,
          materialName: prod.name,
          lineStatus: seed.status === '开立' ? '开立' : '已拣货',
          qty: 12000,
          writebackDone: false,
        },
      ],
      snList:
        seed.status === '操作中'
          ? [
              {
                id: `sn-act-${idx}-1`,
                org: '昇兴集团-中山制罐工厂',
                materialSn: `SN${seed.deliveryNo}001`,
                materialLineNo: '10',
                materialCode: prod.code,
                materialBatch: 'B20261119',
                sapBatch: 'SAP261119',
                materialQty: 6000,
                newDeliveryNo: seed.deliveryNo,
                erpStatus: '待回传',
                erpFlag: 'N',
              },
            ]
          : [],
    });
  });

  return list;
}

function matchText(source: string, query: string, op: MatchOp): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const s = source.toLowerCase();
  if (op === 'equals') return s === q;
  if (op === 'notContains') return !s.includes(q);
  return s.includes(q);
}

function buildPaginationItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', total];
  }
  if (current >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export const SalesDeliveryTab: React.FC<SalesDeliveryTabProps> = ({ onShowToast }) => {
  const [records, setRecords] = useState<SalesDeliveryRecord[]>(buildInitialDeliveries);

  // Filter draft states matching Screenshot 1
  const [org, setOrg] = useState<string>('昇兴集团-中山制罐工厂');
  const [quickRange, setQuickRange] = useState<QuickDateRange>('custom');
  const [planFrom, setPlanFrom] = useState<string>('');
  const [planTo, setPlanTo] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('已关结');

  const [deliveryOp, setDeliveryOp] = useState<MatchOp>('contains');
  const [deliveryVal, setDeliveryVal] = useState<string>('');
  const [productOp, setProductOp] = useState<MatchOp>('contains');
  const [productVal, setProductVal] = useState<string>('');
  const [customerOp, setCustomerOp] = useState<MatchOp>('contains');
  const [customerVal, setCustomerVal] = useState<string>('');
  const [warehouseOp, setWarehouseOp] = useState<MatchOp>('contains');
  const [warehouseVal, setWarehouseVal] = useState<string>('');
  const [matOp, setMatOp] = useState<MatchOp>('contains');
  const [matVal, setMatVal] = useState<string>('');
  const [prodNameOp, setProdNameOp] = useState<MatchOp>('contains');
  const [prodNameVal, setProdNameVal] = useState<string>('');
  const [coaOp, setCoaOp] = useState<MatchOp>('contains');
  const [coaVal, setCoaVal] = useState<string>('');

  const [applied, setApplied] = useState({
    org: '昇兴集团-中山制罐工厂',
    planFrom: '',
    planTo: '',
    statusFilter: '已关结' as StatusFilter,
    deliveryOp: 'contains' as MatchOp,
    deliveryVal: '',
    productOp: 'contains' as MatchOp,
    productVal: '',
    customerOp: 'contains' as MatchOp,
    customerVal: '',
    warehouseOp: 'contains' as MatchOp,
    warehouseVal: '',
    matOp: 'contains' as MatchOp,
    matVal: '',
    prodNameOp: 'contains' as MatchOp,
    prodNameVal: '',
    coaOp: 'contains' as MatchOp,
    coaVal: '',
  });

  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  const [sortKey, setSortKey] = useState<MainColKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Pre-check rows 1 (sd-0001) & 3 (sd-0003) matching Screenshot 1 blue highlight!
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({
    'sd-0001': true,
    'sd-0003': true,
  });
  const [focusedActualCellId, setFocusedActualCellId] = useState<string | null>('sd-0001');

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [jumpInput, setJumpInput] = useState<string>('');

  // Row "更多 v" floating popover state (fixed coords prevent table overflow clipping)
  const [moreMenuState, setMoreMenuState] = useState<{
    id: string;
    top: number;
    right: number;
    openUp: boolean;
  } | null>(null);
  const moreMenuId = moreMenuState?.id ?? null;
  const setMoreMenuId = (val: string | null) => {
    if (val === null) setMoreMenuState(null);
  };

  // Column Settings
  const [colSettingsOpen, setColSettingsOpen] = useState<boolean>(false);
  const [hiddenCols, setHiddenCols] = useState<Record<MainColKey, boolean>>({
    org: false,
    deliveryNo: false,
    status: false,
    urgent: false,
    erpWritebackFlag: false,
    erpWritebackResult: false,
    planOutboundDate: false,
    actualOutboundDate: false,
  });

  // Modals & Drawers
  const [viewRecord, setViewRecord] = useState<SalesDeliveryRecord | null>(null);
  const [printRecord, setPrintRecord] = useState<SalesDeliveryRecord | null>(null);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [createDraft, setCreateDraft] = useState({
    org: '昇兴集团-中山制罐工厂',
    deliveryNo: '',
    status: '开立' as DeliveryStatus,
    customer: CUSTOMERS[0],
    warehouse: WAREHOUSES[0],
    productCode: PRODUCTS[0].code,
    planOutboundDate: '2026-11-20',
    qty: '9600',
    exportCoa: '是' as '是' | '否',
  });
  const [importOpen, setImportOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<{
    ids: string[];
    label: string;
  } | null>(null);

  // Drawer 1: 查看物料清单 (Screenshot 2)
  const [materialDrawerRecId, setMaterialDrawerRecId] = useState<string | null>(null);
  const [matDrawerFiltersExpanded, setMatDrawerFiltersExpanded] = useState(true);
  const [matDrawerDraft, setMatDrawerDraft] = useState({
    org: '',
    matOp: 'contains' as MatchOp,
    matVal: '',
    outOp: 'contains' as MatchOp,
    outVal: '',
    soOp: 'contains' as MatchOp,
    soVal: '',
    statusOp: 'contains' as MatchOp,
    statusVal: '',
  });
  const [matDrawerApplied, setMatDrawerApplied] = useState({
    org: '',
    matOp: 'contains' as MatchOp,
    matVal: '',
    outOp: 'contains' as MatchOp,
    outVal: '',
    soOp: 'contains' as MatchOp,
    soVal: '',
    statusOp: 'contains' as MatchOp,
    statusVal: '',
  });
  const [matDrawerSelected, setMatDrawerSelected] = useState<Record<string, boolean>>({});
  const [matDrawerSort, setMatDrawerSort] = useState<{
    key: 'deliveryNo' | 'productCode' | 'materialCode' | null;
    dir: 'asc' | 'desc';
  }>({ key: null, dir: 'asc' });
  const [matDrawerPageSize, setMatDrawerPageSize] = useState(10);

  // Drawer 2: 查看SN清单 (Screenshot 4)
  const [snDrawerRecId, setSnDrawerRecId] = useState<string | null>(null);
  const [snDrawerFiltersExpanded, setSnDrawerFiltersExpanded] = useState(true);
  const [snDrawerDraft, setSnDrawerDraft] = useState({
    org: '',
    snOp: 'contains' as MatchOp,
    snVal: '',
    matOp: 'contains' as MatchOp,
    matVal: '',
    newDelOp: 'contains' as MatchOp,
    newDelVal: '',
    erpStatusOp: 'contains' as MatchOp,
    erpStatusVal: '',
    erpFlagOp: 'contains' as MatchOp,
    erpFlagVal: '',
  });
  const [snDrawerApplied, setSnDrawerApplied] = useState({
    org: '',
    snOp: 'contains' as MatchOp,
    snVal: '',
    matOp: 'contains' as MatchOp,
    matVal: '',
    newDelOp: 'contains' as MatchOp,
    newDelVal: '',
    erpStatusOp: 'contains' as MatchOp,
    erpStatusVal: '',
    erpFlagOp: 'contains' as MatchOp,
    erpFlagVal: '',
  });
  const [snDrawerSelected, setSnDrawerSelected] = useState<Record<string, boolean>>({});
  const [snDrawerSort, setSnDrawerSort] = useState<{
    key: 'materialSn' | 'materialLineNo' | 'materialCode' | 'materialBatch' | 'sapBatch' | null;
    dir: 'asc' | 'desc';
  }>({ key: null, dir: 'asc' });
  const [snDrawerPageSize, setSnDrawerPageSize] = useState(10);

  // Drawer 3: 灌装发货 (exact match to uploaded 灌装发货 popup screenshot)
  interface FillingBarcodeRow {
    id: string;
    barcode: string;
    materialCode: string;
    materialName: string;
    qty: number;
    salesOrderNo: string;
    sapBatch: string;
    warehouseCode: string;
  }

  const [fillingDrawerRecId, setFillingDrawerRecId] = useState<string | null>(null);
  const [fillingScanInput, setFillingScanInput] = useState<string>('');
  const [fillingShipDate, setFillingShipDate] = useState<string>('');
  const [fillingFilterExpanded, setFillingFilterExpanded] = useState<boolean>(true);
  const [fillingFilters, setFillingFilters] = useState({
    barcodeOp: 'contains' as MatchOp,
    barcodeVal: '',
    matCode: '10029352',
    soOp: 'contains' as MatchOp,
    soVal: '',
    sapBatchOp: 'contains' as MatchOp,
    sapBatchVal: '',
    whOp: 'contains' as MatchOp,
    whVal: '',
  });
  const [fillingRows, setFillingRows] = useState<FillingBarcodeRow[]>([]);
  const [fillingSelectedIds, setFillingSelectedIds] = useState<Record<string, boolean>>({});
  const [fillingSortDir, setFillingSortDir] = useState<'asc' | 'desc' | null>(null);

  const fillingDrawerRecord = useMemo(
    () => records.find((r) => r.id === fillingDrawerRecId) || null,
    [records, fillingDrawerRecId]
  );

  const fillingTotalQty = useMemo(
    () => fillingRows.reduce((sum, r) => sum + r.qty, 0),
    [fillingRows]
  );

  const sortedFillingRows = useMemo(() => {
    if (!fillingSortDir) return fillingRows;
    const mult = fillingSortDir === 'asc' ? 1 : -1;
    return [...fillingRows].sort(
      (a, b) => a.barcode.localeCompare(b.barcode, 'zh-CN') * mult
    );
  }, [fillingRows, fillingSortDir]);

  const activeMoreRecord = useMemo(
    () => (moreMenuState ? records.find((r) => r.id === moreMenuState.id) || null : null),
    [records, moreMenuState]
  );

  const handleCloseOrder = (rec: SalesDeliveryRecord) => {
    setMoreMenuState(null);
    if (rec.status === '已关结') {
      onShowToast(`销售发货单 ${rec.deliveryNo} 已处于关结状态`, 'info');
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.id === rec.id
          ? {
              ...r,
              status: '已关结',
              actualOutboundDate: r.actualOutboundDate || '2026-11-19',
            }
          : r
      )
    );
    onShowToast(`销售发货单 ${rec.deliveryNo} 已关结`, 'success');
  };

  const handleExportCoaReport = (rec: SalesDeliveryRecord) => {
    setMoreMenuState(null);
    const headers = [
      '组织机构',
      '发货单号',
      '客户',
      '物料料号',
      '产品名称',
      '计划出库日期',
      '实际出库日期',
      '检验结论',
      'COA导出状态',
    ];
    const rowVals = [
      rec.org,
      rec.deliveryNo,
      rec.customer,
      rec.materialCode,
      rec.productName,
      rec.planOutboundDate,
      rec.actualOutboundDate || '2026-11-19',
      '合格（符合三片罐出厂检验标准）',
      '已导出',
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = '\ufeff' + headers.map(esc).join(',') + '\n' + rowVals.map(esc).join(',');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `COA质量报告-${rec.deliveryNo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setRecords((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, exportCoa: '是' } : r))
    );
    onShowToast(`已导出发货单 ${rec.deliveryNo} 的 COA 质量检测报告`, 'success');
  };

  const handleFillingWriteback = (rec: SalesDeliveryRecord) => {
    setMoreMenuState(null);
    setRecords((prev) =>
      prev.map((r) =>
        r.id === rec.id
          ? {
              ...r,
              erpWritebackFlag: true,
              erpWritebackResult: `灌装发货回写成功 (SAP-${r.deliveryNo.slice(-4)})`,
            }
          : r
      )
    );
    onShowToast(`发货单 ${rec.deliveryNo} 灌装发货回写 SAP 成功`, 'success');
  };

  const handleOpenFillingDrawer = (rec: SalesDeliveryRecord) => {
    setMoreMenuState(null);
    const primaryMat = rec.materials[0]?.materialCode || rec.materialCode || '10029352';
    setFillingScanInput('');
    setFillingShipDate('');
    setFillingFilterExpanded(true);
    setFillingFilters({
      barcodeOp: 'contains',
      barcodeVal: '',
      matCode: primaryMat,
      soOp: 'contains',
      soVal: '',
      sapBatchOp: 'contains',
      sapBatchVal: '',
      whOp: 'contains',
      whVal: '',
    });
    // Start empty ("暂无数据") matching uploaded screenshot
    setFillingRows([]);
    setFillingSelectedIds({});
    setFillingSortDir(null);
    setFillingDrawerRecId(rec.id);
  };

  const handleFillingScanEnter = () => {
    const code = fillingScanInput.trim();
    if (!code || !fillingDrawerRecord) return;
    if (fillingRows.some((r) => r.barcode === code)) {
      onShowToast(`产品条码 ${code} 已存在于列表中`, 'warning');
      setFillingScanInput('');
      return;
    }
    const primaryMat = fillingDrawerRecord.materials[0];
    const newRow: FillingBarcodeRow = {
      id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      barcode: code,
      materialCode: fillingFilters.matCode || primaryMat?.materialCode || '10029352',
      materialName: primaryMat?.materialName || fillingDrawerRecord.productName,
      qty: 2000,
      salesOrderNo: primaryMat?.salesOrderNo || `SO26${fillingDrawerRecord.deliveryNo.slice(-6)}`,
      sapBatch: `SAP${fillingDrawerRecord.deliveryNo.slice(-5)}`,
      warehouseCode: fillingDrawerRecord.warehouse.split('-')[0] || '3101',
    };
    setFillingRows((prev) => [newRow, ...prev]);
    setFillingSelectedIds((prev) => ({ ...prev, [newRow.id]: true }));
    setFillingScanInput('');
    onShowToast(`已添加产品条码 ${code}`, 'success');
  };

  const handleFillingQuery = () => {
    if (!fillingDrawerRecord) return;
    const primaryMat = fillingDrawerRecord.materials[0];
    const matCode = fillingFilters.matCode || primaryMat?.materialCode || '10029352';
    const matName = primaryMat?.materialName || fillingDrawerRecord.productName;
    const soNo = primaryMat?.salesOrderNo || `SO26${fillingDrawerRecord.deliveryNo.slice(-6)}`;
    const whCode = fillingDrawerRecord.warehouse.split('-')[0] || '3101';

    const pool: FillingBarcodeRow[] = [1, 2, 3].map((n) => ({
      id: `fill-q-${fillingDrawerRecord.id}-${n}`,
      barcode: `SN${matCode.slice(-4)}${fillingDrawerRecord.deliveryNo.slice(-4)}0${n}`,
      materialCode: matCode,
      materialName: matName,
      qty: 2000,
      salesOrderNo: soNo,
      sapBatch: `SAP26${String(1020 + n)}`,
      warehouseCode: whCode,
    }));

    const filtered = pool.filter((item) => {
      if (!matchText(item.barcode, fillingFilters.barcodeVal, fillingFilters.barcodeOp)) return false;
      if (!matchText(item.salesOrderNo, fillingFilters.soVal, fillingFilters.soOp)) return false;
      if (!matchText(item.sapBatch, fillingFilters.sapBatchVal, fillingFilters.sapBatchOp)) return false;
      if (!matchText(item.warehouseCode, fillingFilters.whVal, fillingFilters.whOp)) return false;
      return true;
    });

    setFillingRows(filtered);
    const nextSel: Record<string, boolean> = {};
    filtered.forEach((f) => {
      nextSel[f.id] = true;
    });
    setFillingSelectedIds(nextSel);
    onShowToast(`查询到 ${filtered.length} 条可发灌装产品条码`, 'success');
  };

  const handleFillingKeepSelected = () => {
    const kept = fillingRows.filter((r) => fillingSelectedIds[r.id]);
    if (!kept.length) {
      onShowToast('请先勾选需要保留的产品条码行', 'warning');
      return;
    }
    setFillingRows(kept);
    onShowToast(`已保留选中的 ${kept.length} 条产品条码`, 'info');
  };

  const handleFillingSave = () => {
    if (!fillingDrawerRecord) return;
    if (!fillingRows.length) {
      onShowToast('请先扫描条码或点击「查询」加载待发货条码', 'warning');
      return;
    }
    const targetId = fillingDrawerRecord.id;
    const shipDate = fillingShipDate || fillingDrawerRecord.actualOutboundDate || '2026-11-19';
    const appendedSns: DeliverySnItem[] = fillingRows.map((row, i) => ({
      id: `sn-fill-${Date.now()}-${i}`,
      org: fillingDrawerRecord.org,
      materialSn: row.barcode,
      materialLineNo: '10',
      materialCode: row.materialCode,
      materialBatch: `MB${shipDate.replace(/-/g, '')}`,
      sapBatch: row.sapBatch,
      materialQty: row.qty,
      newDeliveryNo: `ND${fillingDrawerRecord.deliveryNo.slice(-6)}`,
      erpStatus: '待回传',
      erpFlag: 'N',
    }));

    setRecords((prev) =>
      prev.map((r) =>
        r.id === targetId
          ? {
              ...r,
              actualOutboundDate: shipDate,
              erpWritebackResult: `已灌装发货 (${fillingRows.length} 托 / ${fillingTotalQty})`,
              snList: [...appendedSns, ...r.snList],
            }
          : r
      )
    );
    setFillingDrawerRecId(null);
    onShowToast(
      `发货单 ${fillingDrawerRecord.deliveryNo} 灌装发货保存成功（共 ${fillingRows.length} 条，总数 ${fillingTotalQty}）`,
      'success'
    );
  };

  const visibleCols = useMemo(
    () => MAIN_COLS.filter((c) => !hiddenCols[c.key]),
    [hiddenCols]
  );

  const filteredRecords = useMemo(() => {
    let list = records.filter((r) => {
      if (applied.org && r.org !== applied.org) return false;
      if (applied.statusFilter !== 'ALL' && r.status !== applied.statusFilter) return false;
      if (applied.planFrom && r.planOutboundDate < applied.planFrom) return false;
      if (applied.planTo && r.planOutboundDate > applied.planTo) return false;
      if (!matchText(r.deliveryNo, applied.deliveryVal, applied.deliveryOp)) return false;
      if (!matchText(r.productCode, applied.productVal, applied.productOp)) return false;
      if (!matchText(r.customer, applied.customerVal, applied.customerOp)) return false;
      if (!matchText(r.warehouse, applied.warehouseVal, applied.warehouseOp)) return false;
      if (!matchText(r.materialCode, applied.matVal, applied.matOp)) return false;
      if (!matchText(r.productName, applied.prodNameVal, applied.prodNameOp)) return false;
      if (!matchText(r.exportCoa, applied.coaVal, applied.coaOp)) return false;
      return true;
    });

    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list = [...list].sort(
        (a, b) =>
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
  const someOnPageSelected =
    pagedRecords.some((r) => selectedIds[r.id]) && !allOnPageSelected;

  const paginationItems = useMemo(
    () => buildPaginationItems(safePage, totalPages),
    [safePage, totalPages]
  );

  // Material Drawer Data
  const materialDrawerRecord = useMemo(
    () => records.find((r) => r.id === materialDrawerRecId) || null,
    [records, materialDrawerRecId]
  );

  const filteredMaterialLines = useMemo(() => {
    if (!materialDrawerRecord) return [];
    let rows = materialDrawerRecord.materials.filter((m) => {
      if (matDrawerApplied.org && m.org !== matDrawerApplied.org) return false;
      if (!matchText(m.materialCode, matDrawerApplied.matVal, matDrawerApplied.matOp)) {
        return false;
      }
      if (!matchText(m.outboundNo, matDrawerApplied.outVal, matDrawerApplied.outOp)) {
        return false;
      }
      if (!matchText(m.salesOrderNo, matDrawerApplied.soVal, matDrawerApplied.soOp)) {
        return false;
      }
      if (!matchText(m.lineStatus, matDrawerApplied.statusVal, matDrawerApplied.statusOp)) {
        return false;
      }
      return true;
    });
    if (matDrawerSort.key) {
      const k = matDrawerSort.key;
      const mult = matDrawerSort.dir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => a[k].localeCompare(b[k], 'zh-CN') * mult);
    }
    return rows;
  }, [materialDrawerRecord, matDrawerApplied, matDrawerSort]);

  // SN Drawer Data
  const snDrawerRecord = useMemo(
    () => records.find((r) => r.id === snDrawerRecId) || null,
    [records, snDrawerRecId]
  );

  const filteredSnRows = useMemo(() => {
    if (!snDrawerRecord) return [];
    let rows = snDrawerRecord.snList.filter((s) => {
      if (snDrawerApplied.org && s.org !== snDrawerApplied.org) return false;
      if (!matchText(s.materialSn, snDrawerApplied.snVal, snDrawerApplied.snOp)) return false;
      if (!matchText(s.materialCode, snDrawerApplied.matVal, snDrawerApplied.matOp)) return false;
      if (!matchText(s.newDeliveryNo, snDrawerApplied.newDelVal, snDrawerApplied.newDelOp)) {
        return false;
      }
      if (!matchText(s.erpStatus, snDrawerApplied.erpStatusVal, snDrawerApplied.erpStatusOp)) {
        return false;
      }
      if (!matchText(s.erpFlag, snDrawerApplied.erpFlagVal, snDrawerApplied.erpFlagOp)) {
        return false;
      }
      return true;
    });
    if (snDrawerSort.key) {
      const k = snDrawerSort.key;
      const mult = snDrawerSort.dir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => a[k].localeCompare(b[k], 'zh-CN') * mult);
    }
    return rows;
  }, [snDrawerRecord, snDrawerApplied, snDrawerSort]);

  const handleQuickDate = (range: QuickDateRange) => {
    setQuickRange(range);
    if (range === 'today') {
      setPlanFrom('2026-11-19');
      setPlanTo('2026-11-19');
    } else if (range === 'week') {
      setPlanFrom('2026-11-13');
      setPlanTo('2026-11-19');
    } else if (range === 'month') {
      setPlanFrom('2026-11-01');
      setPlanTo('2026-11-30');
    } else if (range === 'threeMonths') {
      setPlanFrom('2026-08-19');
      setPlanTo('2026-11-19');
    } else {
      setPlanFrom('');
      setPlanTo('');
    }
  };

  const handleStatusTabClick = (next: StatusFilter) => {
    setStatusFilter(next);
    setApplied((prev) => ({ ...prev, statusFilter: next }));
    setPage(1);
  };

  const handleQuery = () => {
    setApplied({
      org,
      planFrom,
      planTo,
      statusFilter,
      deliveryOp,
      deliveryVal,
      productOp,
      productVal,
      customerOp,
      customerVal,
      warehouseOp,
      warehouseVal,
      matOp,
      matVal,
      prodNameOp,
      prodNameVal,
      coaOp,
      coaVal,
    });
    setPage(1);
    onShowToast('销售发货单查询完成', 'success');
  };

  const handleReset = () => {
    setOrg('昇兴集团-中山制罐工厂');
    setQuickRange('custom');
    setPlanFrom('');
    setPlanTo('');
    setStatusFilter('已关结');
    setDeliveryOp('contains');
    setDeliveryVal('');
    setProductOp('contains');
    setProductVal('');
    setCustomerOp('contains');
    setCustomerVal('');
    setWarehouseOp('contains');
    setWarehouseVal('');
    setMatOp('contains');
    setMatVal('');
    setProdNameOp('contains');
    setProdNameVal('');
    setCoaOp('contains');
    setCoaVal('');
    setApplied({
      org: '昇兴集团-中山制罐工厂',
      planFrom: '',
      planTo: '',
      statusFilter: '已关结',
      deliveryOp: 'contains',
      deliveryVal: '',
      productOp: 'contains',
      productVal: '',
      customerOp: 'contains',
      customerVal: '',
      warehouseOp: 'contains',
      warehouseVal: '',
      matOp: 'contains',
      matVal: '',
      prodNameOp: 'contains',
      prodNameVal: '',
      coaOp: 'contains',
      coaVal: '',
    });
    setSortKey(null);
    setPage(1);
    onShowToast('查询条件已重置', 'info');
  };

  const handleSort = (key: MainColKey, sortable: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleToggleUrgent = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, urgent: !r.urgent } : r))
    );
  };

  const handleWritebackErp = (id: string, forceOn?: boolean) => {
    let targetNo = '';
    let nextState = false;
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        targetNo = r.deliveryNo;
        nextState = forceOn !== undefined ? forceOn : !r.erpWritebackFlag;
        return {
          ...r,
          erpWritebackFlag: nextState,
          erpWritebackResult: nextState ? `回传成功 (ERP-${r.deliveryNo.slice(-4)})` : '',
        };
      })
    );
    onShowToast(
      nextState
        ? `发货单 ${targetNo} 已成功回传 ERP`
        : `已取消发货单 ${targetNo} 的 ERP 回传标识`,
      nextState ? 'success' : 'info'
    );
  };

  const handleOpenMaterialDrawer = (rec: SalesDeliveryRecord) => {
    setMoreMenuId(null);
    setMatDrawerDraft({
      org: '',
      matOp: 'contains',
      matVal: '',
      outOp: 'contains',
      outVal: '',
      soOp: 'contains',
      soVal: '',
      statusOp: 'contains',
      statusVal: '',
    });
    setMatDrawerApplied({
      org: '',
      matOp: 'contains',
      matVal: '',
      outOp: 'contains',
      outVal: '',
      soOp: 'contains',
      soVal: '',
      statusOp: 'contains',
      statusVal: '',
    });
    setMatDrawerSelected({});
    setMatDrawerSort({ key: null, dir: 'asc' });
    setMaterialDrawerRecId(rec.id);
  };

  const handleOpenSnDrawer = (recId: string, presetMatCode?: string) => {
    setMoreMenuId(null);
    setSnDrawerDraft({
      org: '',
      snOp: 'contains',
      snVal: '',
      matOp: 'contains',
      matVal: presetMatCode || '',
      newDelOp: 'contains',
      newDelVal: '',
      erpStatusOp: 'contains',
      erpStatusVal: '',
      erpFlagOp: 'contains',
      erpFlagVal: '',
    });
    setSnDrawerApplied({
      org: '',
      snOp: 'contains',
      snVal: '',
      matOp: 'contains',
      matVal: presetMatCode || '',
      newDelOp: 'contains',
      newDelVal: '',
      erpStatusOp: 'contains',
      erpStatusVal: '',
      erpFlagOp: 'contains',
      erpFlagVal: '',
    });
    setSnDrawerSelected({});
    setSnDrawerSort({ key: null, dir: 'asc' });
    setSnDrawerRecId(recId);
  };

  const handleOpenCreate = () => {
    setCreateDraft({
      org: '昇兴集团-中山制罐工厂',
      deliveryNo: `200036${Math.floor(4200 + Math.random() * 600)}`,
      status: '开立',
      customer: CUSTOMERS[0],
      warehouse: WAREHOUSES[0],
      productCode: PRODUCTS[0].code,
      planOutboundDate: '2026-11-20',
      qty: '9600',
      exportCoa: '是',
    });
    setCreateOpen(true);
  };

  const handleConfirmCreate = () => {
    if (!createDraft.deliveryNo.trim()) {
      onShowToast('请输入发货单号', 'warning');
      return;
    }
    const prod =
      PRODUCTS.find((p) => p.code === createDraft.productCode) || PRODUCTS[0];
    const newId = `sd-new-${Date.now()}`;
    const newRec: SalesDeliveryRecord = {
      id: newId,
      org: createDraft.org,
      deliveryNo: createDraft.deliveryNo.trim(),
      status: createDraft.status,
      urgent: false,
      erpWritebackFlag: false,
      erpWritebackResult: '',
      planOutboundDate: createDraft.planOutboundDate,
      actualOutboundDate:
        createDraft.status === '已关结' ? createDraft.planOutboundDate : '',
      customer: createDraft.customer,
      warehouse: createDraft.warehouse,
      productCode: prod.code,
      materialCode: prod.code,
      productName: prod.name,
      exportCoa: createDraft.exportCoa,
      materials: [
        {
          id: `ml-new-${Date.now()}`,
          org: createDraft.org,
          deliveryNo: createDraft.deliveryNo.trim(),
          outboundNo: `OUT${createDraft.deliveryNo.trim().slice(-6)}`,
          salesOrderNo: `SO2026${Math.floor(8000 + Math.random() * 900)}`,
          itemNo: '10',
          productCode: prod.code,
          materialCode: prod.code,
          materialName: prod.name,
          lineStatus: createDraft.status === '已关结' ? '已关结' : '开立',
          qty: Math.max(1, parseInt(createDraft.qty, 10) || 9600),
          writebackDone: false,
        },
      ],
      snList: [],
    };
    setRecords((prev) => [newRec, ...prev]);
    if (statusFilter !== 'ALL' && statusFilter !== newRec.status) {
      setStatusFilter(newRec.status);
      setApplied((prev) => ({ ...prev, statusFilter: newRec.status }));
    }
    setPage(1);
    setCreateOpen(false);
    onShowToast(`已新增销售发货单 ${newRec.deliveryNo}`, 'success');
  };

  const handleBatchDeleteClick = () => {
    if (!selectedRecords.length) {
      onShowToast('请先勾选需要删除的销售发货单', 'warning');
      return;
    }
    setConfirmDelete({
      ids: selectedRecords.map((r) => r.id),
      label: `确认批量删除已勾选的 ${selectedRecords.length} 条销售发货单？`,
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
    setConfirmDelete(null);
    onShowToast(`已删除 ${idSet.size} 条销售发货单`, 'success');
  };

  const handleExportCsv = () => {
    const rows = selectedRecords.length ? selectedRecords : filteredRecords;
    if (!rows.length) {
      onShowToast('没有可导出的销售发货数据', 'warning');
      return;
    }
    const headers = [
      '组织机构',
      '发货单号',
      '单据状态',
      '加急标志',
      '回传ERP标志',
      '回写ERP结果',
      '计划出库日期',
      '实际出库日期',
      '客户',
      '产品料号',
      '产品名称',
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows
      .map((r) =>
        [
          r.org,
          r.deliveryNo,
          r.status,
          r.urgent ? '是' : '否',
          r.erpWritebackFlag ? '已回传' : '未回传',
          r.erpWritebackResult,
          r.planOutboundDate,
          r.actualOutboundDate,
          r.customer,
          r.productCode,
          r.productName,
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
    a.download = `销售发货单-20261119.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`已导出 ${rows.length} 条销售发货单 CSV`, 'success');
  };

  const handleFillingPush = () => {
    if (!selectedRecords.length) {
      onShowToast('请先勾选需要推送至灌装线的销售发货单', 'warning');
      return;
    }
    onShowToast(
      `已将 ${selectedRecords.length} 张销售发货单推送至灌装发货协同系统`,
      'success'
    );
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

  const statusBadgeClass = (s: DeliveryStatus) => {
    if (s === '已关结') return 'bg-[#8C8C8C] text-white';
    if (s === '开立') return 'bg-[#0052D9] text-white';
    return 'bg-[#F59A5B] text-white';
  };

  return (
    <div
      className="space-y-4 relative text-xs text-[#1E293B]"
      onClick={() => setMoreMenuId(null)}
    >
      {/* Top Filter Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        {/* Top Row: Page Title + Inline 组织机构 + Right Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">销售发货</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E40AF] font-medium">组织机构</span>
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="">请选择</option>
                {ORGS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
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
            {/* Row 1: 计划出库日期 */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                计划出库日期
              </label>
              <div className="flex flex-wrap items-center gap-1 bg-[#F4F6F9] p-0.5 rounded-lg border border-[#E5E9F0]">
                {(
                  [
                    ['today', '今天'],
                    ['week', '本周'],
                    ['month', '本月'],
                    ['threeMonths', '最近三个月'],
                    ['custom', '自定义'],
                  ] as Array<[QuickDateRange, string]>
                ).map(([code, label]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleQuickDate(code)}
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
                  type="date"
                  value={planFrom}
                  onChange={(e) => {
                    setQuickRange('custom');
                    setPlanFrom(e.target.value);
                  }}
                  aria-label="开始日期"
                  className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent w-[112px]"
                />
                <ArrowRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
                <input
                  type="date"
                  value={planTo}
                  onChange={(e) => {
                    setQuickRange('custom');
                    setPlanTo(e.target.value);
                  }}
                  aria-label="结束日期"
                  className="text-xs font-mono tabular-nums text-[#1E293B] outline-none bg-transparent w-[112px]"
                />
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 hidden sm:block" />
              </div>
            </div>

            {/* Row 2: 单据状态 (ALL / 开立 / 操作中 / 已关结) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                单据状态
              </label>
              <div className="flex flex-wrap items-center gap-1 bg-[#F4F6F9] p-0.5 rounded-lg border border-[#E5E9F0]">
                {(['ALL', '开立', '操作中', '已关结'] as StatusFilter[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusTabClick(st)}
                    className={`px-2.5 py-1 text-xs rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                      statusFilter === st
                        ? 'bg-[#165DFF] text-white font-medium'
                        : 'text-[#1E40AF] hover:bg-[#EBF2FF]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: 发货单号 / 产品料号 / 客户 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  发货单号
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={deliveryOp}
                    onChange={(e) => setDeliveryOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={deliveryVal}
                    onChange={(e) => setDeliveryVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  产品料号
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={productOp}
                    onChange={(e) => setProductOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    list="sd-product-codes"
                    value={productVal}
                    onChange={(e) => setProductVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请选择"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] mr-2 shrink-0" />
                  <datalist id="sd-product-codes">
                    {PRODUCTS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  客户
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={customerOp}
                    onChange={(e) => setCustomerOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    list="sd-customers"
                    value={customerVal}
                    onChange={(e) => setCustomerVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请选择"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] mr-2 shrink-0" />
                  <datalist id="sd-customers">
                    {CUSTOMERS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Row 4: 仓库 / 物料料号 / 产品名称 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  仓库
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={warehouseOp}
                    onChange={(e) => setWarehouseOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <select
                    value={warehouseVal}
                    onChange={(e) => setWarehouseVal(e.target.value)}
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {WAREHOUSES.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
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
                    value={matVal}
                    onChange={(e) => setMatVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-20 text-right text-[#1E40AF] font-medium shrink-0">
                  产品名称
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={prodNameOp}
                    onChange={(e) => setProdNameOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={prodNameVal}
                    onChange={(e) => setProdNameVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuery();
                    }}
                    placeholder="请输入"
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: 是否导出COA报告 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-24 text-right text-[#1E40AF] font-medium shrink-0">
                  导出COA报告
                </label>
                <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-lg bg-white focus-within:border-[#2563EB] transition overflow-hidden">
                  <select
                    value={coaOp}
                    onChange={(e) => setCoaOp(e.target.value as MatchOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="notContains">不包含</option>
                  </select>
                  <select
                    value={coaVal}
                    onChange={(e) => setCoaVal(e.target.value)}
                    className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
                    <option value="是">是</option>
                    <option value="否">否</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card (工单管理风格) */}
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
              张发货单
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
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
              onClick={() => {
                setImportText('');
                setImportOpen(true);
              }}
              className="h-8 px-3 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-8 px-3 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onShowToast('已完成 SAP 销售交货单增量同步（最新状态已刷新）', 'success')
              }
              className="h-8 px-3 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>同步</span>
            </button>
            <button
              type="button"
              onClick={handleFillingPush}
              className="h-8 px-3.5 bg-[#2563EB] text-white hover:bg-[#165DFF] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>灌装发货推送</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="w-10 p-2.5 text-center border-b border-r border-[#E5E9F0]">
                  <input
                    type="checkbox"
                    ref={(el) => {
                      if (el) el.indeterminate = someOnPageSelected;
                    }}
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

                {visibleCols.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      onClick={() => handleSort(col.key, col.sortable)}
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

                <th className="p-2.5 border-b border-[#E5E9F0] text-center min-w-[155px] sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
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
                    colSpan={visibleCols.length + 2}
                    className="py-12 text-center text-xs text-[#64748B]"
                  >
                    未查询到符合条件的销售发货单
                  </td>
                </tr>
              ) : (
                pagedRecords.map((row) => {
                  const isChecked = !!selectedIds[row.id];
                  return (
                    <tr
                      key={row.id}
                      onClick={() =>
                        setSelectedIds((prev) => ({
                          ...prev,
                          [row.id]: !prev[row.id],
                        }))
                      }
                      className={`transition-colors cursor-pointer ${
                        isChecked
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

                      {visibleCols.map((col) => {
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

                        if (col.key === 'urgent') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                role="switch"
                                aria-checked={row.urgent}
                                onClick={() => handleToggleUrgent(row.id)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                                  row.urgent ? 'bg-[#EA580C]' : 'bg-[#CBD5E1]'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                    row.urgent ? 'translate-x-4.5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        }

                        if (col.key === 'erpWritebackFlag') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                role="switch"
                                aria-checked={row.erpWritebackFlag}
                                onClick={() => handleWritebackErp(row.id)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                                  row.erpWritebackFlag ? 'bg-[#165DFF]' : 'bg-[#CBD5E1]'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                    row.erpWritebackFlag
                                      ? 'translate-x-4.5'
                                      : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        }

                        if (col.key === 'actualOutboundDate') {
                          const isFocusedCell =
                            focusedActualCellId === row.id && isChecked;
                          return (
                            <td
                              key={col.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFocusedActualCellId(row.id);
                              }}
                              className={`p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap font-mono tabular-nums ${
                                isFocusedCell
                                  ? 'bg-[#DBEAFE] ring-1 ring-inset ring-[#165DFF]'
                                  : ''
                              }`}
                            >
                              {row.actualOutboundDate || '—'}
                            </td>
                          );
                        }

                        if (col.key === 'deliveryNo') {
                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#EDF2F7] text-center whitespace-nowrap font-mono tabular-nums font-bold text-[#1E40AF]"
                            >
                              {row[col.key]}
                            </td>
                          );
                        }

                        if (col.key === 'planOutboundDate') {
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

                      {/* Actions: 查看 / 回传 / 更多 v */}
                      <td
                        className={`p-2.5 text-center whitespace-nowrap sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                          isChecked ? 'bg-[#EBF2FF]' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-center gap-2.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setViewRecord(row)}
                            className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                          >
                            查看
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWritebackErp(row.id, true)}
                            className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                          >
                            回传
                          </button>
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (moreMenuId === row.id) {
                                  setMoreMenuState(null);
                                  return;
                                }
                                const rect = e.currentTarget.getBoundingClientRect();
                                const menuHeight = 352;
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const openUp = spaceBelow < menuHeight && rect.top > menuHeight;
                                setMoreMenuState({
                                  id: row.id,
                                  top: openUp ? rect.top - 8 : rect.bottom + 8,
                                  right: Math.max(12, window.innerWidth - rect.right - 8),
                                  openUp,
                                });
                              }}
                              className="inline-flex items-center gap-0.5 text-[#1E40AF] hover:text-[#1E293B] font-medium cursor-pointer"
                            >
                              <span>更多</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
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

            {paginationItems.map((item, idx) =>
              item === 'ellipsis' ? (
                <span
                  key={`e-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-[#94A3B8] select-none font-mono"
                >
                  ···
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-lg border font-mono tabular-nums transition cursor-pointer ${
                    item === safePage
                      ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                      : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:border-[#2563EB]'
                  }`}
                >
                  {item}
                </button>
              )
            )}

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

      {/* Drawer: 查看物料清单 (Screenshot 2) */}
      {materialDrawerRecord && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/35"
          onClick={() => setMaterialDrawerRecId(null)}
        >
          <div
            className="w-full max-w-[1040px] bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#F0F2F5] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMaterialDrawerRecId(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[15px] font-medium text-[#1E293B]">
                查看物料清单
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* 5-row Filter Form */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2.5 flex-1 max-w-md">
                  <div className="flex items-center gap-2.5">
                    <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                      组织机构
                    </label>
                    <select
                      value={matDrawerDraft.org}
                      onChange={(e) =>
                        setMatDrawerDraft((p) => ({ ...p, org: e.target.value }))
                      }
                      className="h-8 flex-1 px-2.5 text-xs text-[#1E293B] bg-white border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF]"
                    >
                      <option value="">请选择</option>
                      {ORGS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  {matDrawerFiltersExpanded && (
                    <>
                      <div className="flex items-center gap-2.5">
                        <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                          物料料号
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={matDrawerDraft.matOp}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                matOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            value={matDrawerDraft.matVal}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                matVal: e.target.value,
                              }))
                            }
                            placeholder="请输入"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                          出库单号
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={matDrawerDraft.outOp}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                outOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            value={matDrawerDraft.outVal}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                outVal: e.target.value,
                              }))
                            }
                            placeholder="请输入"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                          销售单号
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={matDrawerDraft.soOp}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                soOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            value={matDrawerDraft.soVal}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                soVal: e.target.value,
                              }))
                            }
                            placeholder="请输入"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                          物料行状态
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={matDrawerDraft.statusOp}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                statusOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <select
                            value={matDrawerDraft.statusVal}
                            onChange={(e) =>
                              setMatDrawerDraft((p) => ({
                                ...p,
                                statusVal: e.target.value,
                              }))
                            }
                            className="h-full flex-1 px-2.5 text-xs bg-white outline-none"
                          >
                            <option value="">请选择</option>
                            <option value="开立">开立</option>
                            <option value="已拣货">已拣货</option>
                            <option value="已出库">已出库</option>
                            <option value="已关结">已关结</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    type="button"
                    onClick={() => {
                      const empty = {
                        org: '',
                        matOp: 'contains' as MatchOp,
                        matVal: '',
                        outOp: 'contains' as MatchOp,
                        outVal: '',
                        soOp: 'contains' as MatchOp,
                        soVal: '',
                        statusOp: 'contains' as MatchOp,
                        statusVal: '',
                      };
                      setMatDrawerDraft(empty);
                      setMatDrawerApplied(empty);
                    }}
                    className="h-8 px-4 text-xs font-medium text-[#334155] bg-white border border-[#D9E1EC] rounded-xs hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatDrawerApplied({ ...matDrawerDraft })}
                    className="h-8 px-4 text-xs font-medium text-white bg-[#1890FF] hover:bg-[#165DFF] rounded-xs cursor-pointer"
                  >
                    查询
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('物料清单列配置已是默认视图', 'info')}
                    className="h-8 w-8 flex items-center justify-center text-[#475569] bg-white border border-[#D9E1EC] rounded-xs hover:text-[#1890FF] cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatDrawerFiltersExpanded((v) => !v)}
                    className="h-8 w-7 flex items-center justify-center text-[#475569] hover:text-[#1890FF] cursor-pointer"
                  >
                    {matDrawerFiltersExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Material Lines Table */}
              <div className="border border-[#E5E9F0] rounded-xs overflow-x-auto bg-white min-h-[190px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E9F0] text-xs font-medium text-[#334155]">
                      <th className="w-11 px-3 py-2.5 text-center border-r border-[#F0F2F5]">
                        <input
                          type="checkbox"
                          checked={
                            filteredMaterialLines.length > 0 &&
                            filteredMaterialLines.every((m) => matDrawerSelected[m.id])
                          }
                          onChange={(e) => {
                            const next: Record<string, boolean> = {};
                            if (e.target.checked) {
                              filteredMaterialLines.forEach((m) => {
                                next[m.id] = true;
                              });
                            }
                            setMatDrawerSelected(next);
                          }}
                          className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] accent-[#1890FF] cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[140px]">
                        组织机构
                      </th>
                      {(
                        [
                          ['deliveryNo', '发货单号', '120px'],
                          ['itemNo', '项次', '75px'],
                          ['productCode', '产品料号', '115px'],
                          ['materialCode', '物料料号', '115px'],
                          ['materialName', '物料名称', '175px'],
                        ] as const
                      ).map(([k, label, w]) => {
                        const sortable =
                          k === 'deliveryNo' ||
                          k === 'productCode' ||
                          k === 'materialCode';
                        return (
                          <th
                            key={k}
                            style={{ minWidth: w }}
                            onClick={() => {
                              if (!sortable) return;
                              setMatDrawerSort((prev) =>
                                prev.key === k
                                  ? {
                                      key: prev.dir === 'asc' ? k : null,
                                      dir: 'desc',
                                    }
                                  : { key: k, dir: 'asc' }
                              );
                            }}
                            className={`px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap select-none ${
                              sortable ? 'cursor-pointer hover:text-[#1890FF]' : ''
                            }`}
                          >
                            <div className="inline-flex items-center justify-center gap-1">
                              <span>{label}</span>
                              {sortable && (
                                <span className="inline-flex flex-col leading-none text-[8px]">
                                  <span
                                    className={
                                      matDrawerSort.key === k &&
                                      matDrawerSort.dir === 'asc'
                                        ? 'text-[#1890FF]'
                                        : 'text-[#B8C2CC]'
                                    }
                                  >
                                    ▲
                                  </span>
                                  <span
                                    className={`-mt-0.5 ${
                                      matDrawerSort.key === k &&
                                      matDrawerSort.dir === 'desc'
                                        ? 'text-[#1890FF]'
                                        : 'text-[#B8C2CC]'
                                    }`}
                                  >
                                    ▼
                                  </span>
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                      <th className="px-3 py-2.5 text-center whitespace-nowrap min-w-[130px] sticky right-0 bg-[#FAFAFA] border-l border-[#F0F2F5]">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span>操作</span>
                          <Settings className="w-3.5 h-3.5 text-[#475569]" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7] text-xs text-[#1E293B]">
                    {filteredMaterialLines.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-[#94A3B8]"
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <Inbox className="w-9 h-9 text-[#CBD5E1] stroke-[1.3]" />
                            <span>暂无数据</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMaterialLines.map((line) => (
                        <tr key={line.id} className="hover:bg-[#F5F9FF]">
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={!!matDrawerSelected[line.id]}
                              onChange={(e) =>
                                setMatDrawerSelected((prev) => ({
                                  ...prev,
                                  [line.id]: e.target.checked,
                                }))
                              }
                              className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] accent-[#1890FF] cursor-pointer"
                            />
                          </td>
                          <td
                            title={line.org}
                            className="px-3 py-2.5 text-center max-w-[140px] truncate"
                          >
                            {line.org}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {line.deliveryNo}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {line.itemNo}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {line.productCode}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {line.materialCode}
                          </td>
                          <td
                            title={line.materialName}
                            className="px-3 py-2.5 text-center max-w-[180px] truncate"
                          >
                            {line.materialName}
                          </td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 bg-white border-l border-[#F0F2F5]">
                            <div className="inline-flex items-center justify-center gap-3 text-xs">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenSnDrawer(
                                    materialDrawerRecord.id,
                                    line.materialCode
                                  )
                                }
                                className="text-[#1890FF] hover:underline cursor-pointer"
                              >
                                查询SN
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleWritebackErp(materialDrawerRecord.id, true);
                                }}
                                className="text-[#1890FF] hover:underline cursor-pointer"
                              >
                                回传
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Drawer Pagination */}
              <div className="flex items-center justify-end gap-2.5 text-xs text-[#475569]">
                <span className="font-mono tabular-nums">
                  共计 {filteredMaterialLines.length} 条
                </span>
                <button
                  type="button"
                  disabled
                  className="w-6 h-6 flex items-center justify-center text-[#94A3B8] opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 h-6 flex items-center justify-center border border-[#1890FF] text-[#1890FF] rounded-xs font-mono">
                  1
                </span>
                <button
                  type="button"
                  disabled
                  className="w-6 h-6 flex items-center justify-center text-[#94A3B8] opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <select
                  value={matDrawerPageSize}
                  onChange={(e) => setMatDrawerPageSize(Number(e.target.value))}
                  className="h-7 px-2 border border-[#D9E1EC] rounded-xs bg-white text-xs text-[#334155]"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-[#F0F2F5] bg-white flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setMaterialDrawerRecId(null)}
                className="h-8 px-4 text-xs font-medium bg-white border border-[#D9E1EC] hover:bg-[#F8FAFC] text-[#334155] rounded-xs cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: 查看SN清单 (Screenshot 4) */}
      {snDrawerRecord && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-slate-900/35"
          onClick={() => setSnDrawerRecId(null)}
        >
          <div
            className="w-full max-w-[1040px] bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#F0F2F5] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSnDrawerRecId(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[15px] font-medium text-[#1E293B]">
                查看SN清单
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* 6-row Filter Form matching Screenshot 4 */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2.5 flex-1 max-w-md">
                  <div className="flex items-center gap-2.5">
                    <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                      组织机构
                    </label>
                    <select
                      value={snDrawerDraft.org}
                      onChange={(e) =>
                        setSnDrawerDraft((p) => ({ ...p, org: e.target.value }))
                      }
                      className="h-8 flex-1 px-2.5 text-xs text-[#1E293B] bg-white border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF]"
                    >
                      <option value="">请选择</option>
                      {ORGS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  {snDrawerFiltersExpanded && (
                    <>
                      <div className="flex items-center gap-2.5">
                        <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                          物料SN
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={snDrawerDraft.snOp}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                snOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            value={snDrawerDraft.snVal}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                snVal: e.target.value,
                              }))
                            }
                            placeholder="请输入"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                          物料料号
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#91CAFF] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={snDrawerDraft.matOp}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                matOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            list="sn-drawer-mat-codes"
                            value={snDrawerDraft.matVal}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                matVal: e.target.value,
                              }))
                            }
                            placeholder="请选择"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                          <Search className="w-3.5 h-3.5 text-[#94A3B8] mr-2 shrink-0" />
                          <datalist id="sn-drawer-mat-codes">
                            {PRODUCTS.map((p) => (
                              <option key={p.code} value={p.code}>
                                {p.name}
                              </option>
                            ))}
                          </datalist>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                          新交货单号
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={snDrawerDraft.newDelOp}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                newDelOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            value={snDrawerDraft.newDelVal}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                newDelVal: e.target.value,
                              }))
                            }
                            placeholder="请输入"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                          回传ERP状态
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={snDrawerDraft.erpStatusOp}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                erpStatusOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            value={snDrawerDraft.erpStatusVal}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                erpStatusVal: e.target.value,
                              }))
                            }
                            placeholder="请输入"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="w-24 text-right text-xs text-[#334155] shrink-0">
                          回传ERP标识
                        </label>
                        <div className="flex items-center h-8 flex-1 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                          <select
                            value={snDrawerDraft.erpFlagOp}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                erpFlagOp: e.target.value as MatchOp,
                              }))
                            }
                            className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="notContains">不包含</option>
                          </select>
                          <input
                            type="text"
                            value={snDrawerDraft.erpFlagVal}
                            onChange={(e) =>
                              setSnDrawerDraft((p) => ({
                                ...p,
                                erpFlagVal: e.target.value,
                              }))
                            }
                            placeholder="请输入"
                            className="h-full flex-1 px-2.5 text-xs placeholder-[#94A3B8] outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    type="button"
                    onClick={() => {
                      const empty = {
                        org: '',
                        snOp: 'contains' as MatchOp,
                        snVal: '',
                        matOp: 'contains' as MatchOp,
                        matVal: '',
                        newDelOp: 'contains' as MatchOp,
                        newDelVal: '',
                        erpStatusOp: 'contains' as MatchOp,
                        erpStatusVal: '',
                        erpFlagOp: 'contains' as MatchOp,
                        erpFlagVal: '',
                      };
                      setSnDrawerDraft(empty);
                      setSnDrawerApplied(empty);
                    }}
                    className="h-8 px-4 text-xs font-medium text-[#334155] bg-white border border-[#D9E1EC] rounded-xs hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    onClick={() => setSnDrawerApplied({ ...snDrawerDraft })}
                    className="h-8 px-4 text-xs font-medium text-white bg-[#1890FF] hover:bg-[#165DFF] rounded-xs cursor-pointer"
                  >
                    查询
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('SN 清单列配置已是默认视图', 'info')}
                    className="h-8 w-8 flex items-center justify-center text-[#475569] bg-white border border-[#D9E1EC] rounded-xs hover:text-[#1890FF] cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSnDrawerFiltersExpanded((v) => !v)}
                    className="h-8 w-7 flex items-center justify-center text-[#475569] hover:text-[#1890FF] cursor-pointer"
                  >
                    {snDrawerFiltersExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* SN Table */}
              <div className="border border-[#E5E9F0] rounded-xs overflow-x-auto bg-white min-h-[200px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E9F0] text-xs font-medium text-[#334155]">
                      <th className="w-11 px-3 py-2.5 text-center border-r border-[#F0F2F5]">
                        <input
                          type="checkbox"
                          disabled={filteredSnRows.length === 0}
                          checked={
                            filteredSnRows.length > 0 &&
                            filteredSnRows.every((s) => snDrawerSelected[s.id])
                          }
                          onChange={(e) => {
                            const next: Record<string, boolean> = {};
                            if (e.target.checked) {
                              filteredSnRows.forEach((s) => {
                                next[s.id] = true;
                              });
                            }
                            setSnDrawerSelected(next);
                          }}
                          className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] accent-[#1890FF] cursor-pointer"
                        />
                      </th>
                      {(
                        [
                          ['materialSn', '物料SN', '220px', true],
                          ['materialLineNo', '物料行号', '95px', true],
                          ['materialCode', '物料料号', '115px', true],
                          ['materialBatch', '物料批次', '115px', true],
                          ['sapBatch', 'SAP批次', '115px', true],
                          ['materialQty', '物料数量', '100px', false],
                        ] as const
                      ).map(([k, label, w, sortable]) => (
                        <th
                          key={k}
                          style={{ minWidth: w }}
                          onClick={() => {
                            if (!sortable) return;
                            const sortField = k as
                              | 'materialSn'
                              | 'materialLineNo'
                              | 'materialCode'
                              | 'materialBatch'
                              | 'sapBatch';
                            setSnDrawerSort((prev) =>
                              prev.key === sortField
                                ? {
                                    key: prev.dir === 'asc' ? sortField : null,
                                    dir: 'desc',
                                  }
                                : { key: sortField, dir: 'asc' }
                            );
                          }}
                          className={`px-3 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap select-none ${
                            sortable ? 'cursor-pointer hover:text-[#1890FF]' : ''
                          }`}
                        >
                          <div className="inline-flex items-center justify-center gap-1">
                            <span>{label}</span>
                            {sortable && (
                              <span className="inline-flex flex-col leading-none text-[8px]">
                                <span
                                  className={
                                    snDrawerSort.key === k &&
                                    snDrawerSort.dir === 'asc'
                                      ? 'text-[#1890FF]'
                                      : 'text-[#B8C2CC]'
                                  }
                                >
                                  ▲
                                </span>
                                <span
                                  className={`-mt-0.5 ${
                                    snDrawerSort.key === k &&
                                    snDrawerSort.dir === 'desc'
                                      ? 'text-[#1890FF]'
                                      : 'text-[#B8C2CC]'
                                  }`}
                                >
                                  ▼
                                </span>
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="w-11 px-3 py-2.5 text-center sticky right-0 bg-[#FAFAFA] border-l border-[#F0F2F5]">
                        <Settings className="w-3.5 h-3.5 text-[#94A3B8] mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7] text-xs text-[#1E293B]">
                    {filteredSnRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-[#94A3B8]"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Inbox className="w-10 h-10 text-[#CBD5E1] stroke-[1.3]" />
                            <span className="text-xs text-[#94A3B8]">暂无数据</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSnRows.map((sn) => (
                        <tr key={sn.id} className="hover:bg-[#F5F9FF]">
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={!!snDrawerSelected[sn.id]}
                              onChange={(e) =>
                                setSnDrawerSelected((prev) => ({
                                  ...prev,
                                  [sn.id]: e.target.checked,
                                }))
                              }
                              className="w-3.5 h-3.5 rounded-xs border-[#CBD5E1] accent-[#1890FF] cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {sn.materialSn}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {sn.materialLineNo}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {sn.materialCode}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {sn.materialBatch}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                            {sn.sapBatch}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono tabular-nums font-medium">
                            {sn.materialQty}
                          </td>
                          <td className="px-3 py-2.5 text-center text-[#94A3B8]">
                            —
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination matching Screenshot 4 */}
              <div className="flex items-center justify-end gap-2.5 text-xs text-[#475569]">
                <span className="font-mono tabular-nums">
                  共计 {filteredSnRows.length} 条
                </span>
                <button
                  type="button"
                  disabled
                  className="w-6 h-6 flex items-center justify-center text-[#94A3B8] opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 h-6 flex items-center justify-center text-[#64748B] font-mono">
                  1
                </span>
                <button
                  type="button"
                  disabled
                  className="w-6 h-6 flex items-center justify-center text-[#94A3B8] opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <select
                  value={snDrawerPageSize}
                  onChange={(e) => setSnDrawerPageSize(Number(e.target.value))}
                  className="h-7 px-2 border border-[#D9E1EC] rounded-xs bg-white text-xs text-[#334155]"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-[#F0F2F5] bg-white flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSnDrawerRecId(null)}
                className="h-8 px-4 text-xs font-medium bg-white border border-[#D9E1EC] hover:bg-[#F8FAFC] text-[#334155] rounded-xs cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating 9-item "更多" Dropdown Popover (exact match to uploaded screenshot) */}
      {moreMenuState && activeMoreRecord && (
        <div
          style={{
            position: 'fixed',
            top: moreMenuState.openUp ? undefined : moreMenuState.top,
            bottom: moreMenuState.openUp
              ? window.innerHeight - moreMenuState.top
              : undefined,
            right: moreMenuState.right,
          }}
          onClick={(e) => e.stopPropagation()}
          className="z-50 w-36 bg-white border border-[#E5E9F0] rounded-sm shadow-[0_6px_20px_rgba(15,23,42,0.12)] py-1.5 text-left text-[13px]"
        >
          {/* Crisp white diamond pointer matching screenshot */}
          <span
            className={`absolute right-5 w-2.5 h-2.5 bg-white rotate-45 border-[#E5E9F0] ${
              moreMenuState.openUp
                ? '-bottom-1.5 border-r border-b'
                : '-top-1.5 border-l border-t'
            }`}
          />
          <button
            type="button"
            onClick={() => {
              const target = activeMoreRecord;
              setMoreMenuState(null);
              setConfirmDelete({
                ids: [target.id],
                label: `确认删除销售发货单 ${target.deliveryNo}？`,
              });
            }}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            删除
          </button>
          <button
            type="button"
            onClick={() => handleCloseOrder(activeMoreRecord)}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            关结
          </button>
          <button
            type="button"
            onClick={() => {
              const target = activeMoreRecord;
              setMoreMenuState(null);
              setPrintRecord(target);
            }}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            单据打印
          </button>
          <button
            type="button"
            onClick={() => handleOpenMaterialDrawer(activeMoreRecord)}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            查看物料清单
          </button>
          <button
            type="button"
            onClick={() => handleOpenSnDrawer(activeMoreRecord.id)}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            查看SN清单
          </button>
          <button
            type="button"
            onClick={() => {
              const targetId = activeMoreRecord.id;
              setMoreMenuState(null);
              handleWritebackErp(targetId, true);
            }}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            回传SAP
          </button>
          <button
            type="button"
            onClick={() => handleExportCoaReport(activeMoreRecord)}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            COA报告导出
          </button>
          <button
            type="button"
            onClick={() => handleOpenFillingDrawer(activeMoreRecord)}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            灌装发货
          </button>
          <button
            type="button"
            onClick={() => handleFillingWriteback(activeMoreRecord)}
            className="relative w-full px-4 py-2 text-left text-[#1890FF] hover:bg-[#F0F7FF] transition cursor-pointer"
          >
            灌装发货回写
          </button>
        </div>
      )}

      {/* Drawer 3: 灌装发货 (exact match to uploaded 灌装发货 popup screenshot) */}
      {fillingDrawerRecord && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/35"
          onClick={() => setFillingDrawerRecId(null)}
        >
          <div
            className="w-full max-w-[1120px] bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: × 灌装发货 */}
            <div className="px-5 py-4 border-b border-[#F0F2F5] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setFillingDrawerRecId(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[15px] font-medium text-[#1E293B]">
                灌装发货
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Top Scan Row: 产品条码 (Enter to add) + 出货日期 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 pb-2">
                <div className="flex items-center gap-2.5">
                  <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                    产品条码
                  </label>
                  <input
                    type="text"
                    value={fillingScanInput}
                    onChange={(e) => setFillingScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFillingScanEnter();
                      }
                    }}
                    placeholder="产品物料SN按enter键添加"
                    className="h-8 w-56 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] font-mono"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                    出货日期
                  </label>
                  <input
                    type="date"
                    value={fillingShipDate}
                    onChange={(e) => setFillingShipDate(e.target.value)}
                    aria-label="出货日期"
                    className="h-8 w-56 px-2.5 text-xs font-mono tabular-nums text-[#1E293B] border border-[#D9E1EC] rounded-xs outline-none focus:border-[#1890FF] bg-white"
                  />
                </div>
              </div>

              {/* Filter Area with Right Buttons (重置 / 查询 / ⚙️ / ∧) */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pt-1">
                <div className="flex-1 space-y-2.5 min-w-0">
                  {fillingFilterExpanded && (
                    <>
                      {/* Row 1: 产品条码 / 物料料号 (= locked gray) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 max-w-3xl">
                        <div className="flex items-center gap-2.5">
                          <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                            产品条码
                          </label>
                          <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                            <select
                              value={fillingFilters.barcodeOp}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  barcodeOp: e.target.value as MatchOp,
                                }))
                              }
                              className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none bg-white shrink-0"
                            >
                              <option value="contains">包含</option>
                              <option value="equals">等于</option>
                              <option value="notContains">不包含</option>
                            </select>
                            <input
                              type="text"
                              value={fillingFilters.barcodeVal}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  barcodeVal: e.target.value,
                                }))
                              }
                              placeholder="请输入"
                              className="h-full flex-1 min-w-0 px-2.5 text-xs outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                            物料料号
                          </label>
                          <div className="flex items-center h-8 flex-1 min-w-0 border border-[#E5E9F0] rounded-xs bg-[#F5F5F5] overflow-hidden">
                            <select
                              disabled
                              value="equals"
                              className="h-full px-2.5 text-xs text-[#64748B] border-r border-[#E5E9F0] outline-none bg-[#F5F5F5] shrink-0 cursor-not-allowed"
                            >
                              <option value="equals">=</option>
                            </select>
                            <input
                              type="text"
                              disabled
                              value={fillingFilters.matCode}
                              className="h-full flex-1 min-w-0 px-2.5 text-xs text-[#94A3B8] bg-[#F5F5F5] outline-none font-mono cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: 销售订单号 / SAP批次 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 max-w-3xl">
                        <div className="flex items-center gap-2.5">
                          <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                            销售订单号
                          </label>
                          <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                            <select
                              value={fillingFilters.soOp}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  soOp: e.target.value as MatchOp,
                                }))
                              }
                              className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none bg-white shrink-0"
                            >
                              <option value="contains">包含</option>
                              <option value="equals">等于</option>
                              <option value="notContains">不包含</option>
                            </select>
                            <input
                              type="text"
                              value={fillingFilters.soVal}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  soVal: e.target.value,
                                }))
                              }
                              placeholder="请输入"
                              className="h-full flex-1 min-w-0 px-2.5 text-xs outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                            SAP批次
                          </label>
                          <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                            <select
                              value={fillingFilters.sapBatchOp}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  sapBatchOp: e.target.value as MatchOp,
                                }))
                              }
                              className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none bg-white shrink-0"
                            >
                              <option value="contains">包含</option>
                              <option value="equals">等于</option>
                              <option value="notContains">不包含</option>
                            </select>
                            <input
                              type="text"
                              value={fillingFilters.sapBatchVal}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  sapBatchVal: e.target.value,
                                }))
                              }
                              placeholder="请输入"
                              className="h-full flex-1 min-w-0 px-2.5 text-xs outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 3: 仓库编码 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 max-w-3xl">
                        <div className="flex items-center gap-2.5">
                          <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                            仓库编码
                          </label>
                          <div className="flex items-center h-8 flex-1 min-w-0 border border-[#D9E1EC] rounded-xs bg-white focus-within:border-[#1890FF] overflow-hidden">
                            <select
                              value={fillingFilters.whOp}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  whOp: e.target.value as MatchOp,
                                }))
                              }
                              className="h-full px-2 text-xs text-[#475569] border-r border-[#E5E9F0] outline-none bg-white shrink-0"
                            >
                              <option value="contains">包含</option>
                              <option value="equals">等于</option>
                              <option value="notContains">不包含</option>
                            </select>
                            <input
                              type="text"
                              value={fillingFilters.whVal}
                              onChange={(e) =>
                                setFillingFilters((p) => ({
                                  ...p,
                                  whVal: e.target.value,
                                }))
                              }
                              placeholder="请输入"
                              className="h-full flex-1 min-w-0 px-2.5 text-xs outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Buttons: 重置 / 查询 / ⚙️ / ∧ */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-start">
                  <button
                    type="button"
                    onClick={() =>
                      setFillingFilters((p) => ({
                        ...p,
                        barcodeOp: 'contains',
                        barcodeVal: '',
                        soOp: 'contains',
                        soVal: '',
                        sapBatchOp: 'contains',
                        sapBatchVal: '',
                        whOp: 'contains',
                        whVal: '',
                      }))
                    }
                    className="h-8 px-4 text-xs text-[#334155] bg-white border border-[#D9E1EC] hover:bg-[#F8FAFC] rounded-xs cursor-pointer"
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    onClick={handleFillingQuery}
                    className="h-8 px-4 text-xs text-white bg-[#1890FF] hover:bg-[#165DFF] rounded-xs cursor-pointer"
                  >
                    查询
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('当前已展示全部灌装发货列', 'info')}
                    title="列显示设置"
                    className="h-8 w-8 flex items-center justify-center text-[#475569] bg-white border border-[#D9E1EC] hover:text-[#1890FF] rounded-xs cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFillingFilterExpanded((v) => !v)}
                    className="h-8 w-7 flex items-center justify-center text-[#475569] hover:text-[#1890FF] cursor-pointer"
                  >
                    {fillingFilterExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Right-aligned "保留选中" + Left-aligned "发货总数" */}
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleFillingKeepSelected}
                    className="h-8 px-4 text-xs text-[#334155] bg-white border border-[#D9E1EC] hover:border-[#1890FF] hover:text-[#1890FF] rounded-xs transition cursor-pointer"
                  >
                    保留选中
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-20 text-right text-xs text-[#334155] shrink-0">
                    发货总数
                  </label>
                  <input
                    type="text"
                    disabled
                    value={fillingRows.length > 0 ? String(fillingTotalQty) : ''}
                    placeholder="请输入"
                    className="h-8 w-44 px-2.5 text-xs font-mono tabular-nums text-[#334155] placeholder-[#94A3B8] bg-[#F5F5F5] border border-[#E5E9F0] rounded-xs cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Filling Barcode Table */}
              <div className="border border-[#E5E9F0] rounded-xs overflow-x-auto bg-white min-h-[260px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E9F0] text-xs font-medium text-[#334155]">
                      <th className="w-11 px-3 py-2.5 text-center border-r border-[#F0F2F5]">
                        <input
                          type="checkbox"
                          disabled={sortedFillingRows.length === 0}
                          checked={
                            sortedFillingRows.length > 0 &&
                            sortedFillingRows.every((r) => fillingSelectedIds[r.id])
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const next: Record<string, boolean> = {};
                            if (checked) {
                              sortedFillingRows.forEach((r) => {
                                next[r.id] = true;
                              });
                            }
                            setFillingSelectedIds(next);
                          }}
                          className="w-3.5 h-3.5 accent-[#1890FF] cursor-pointer disabled:cursor-not-allowed"
                        />
                      </th>
                      <th className="w-10 px-2 py-2.5 text-center border-r border-[#F0F2F5]" />
                      <th
                        onClick={() =>
                          setFillingSortDir((prev) =>
                            prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
                          )
                        }
                        className="px-4 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[210px] cursor-pointer hover:text-[#1890FF] select-none"
                      >
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span>产品条码</span>
                          <span className="inline-flex flex-col leading-none text-[8px]">
                            <span
                              className={
                                fillingSortDir === 'asc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={`-mt-0.5 ${
                                fillingSortDir === 'desc'
                                  ? 'text-[#1890FF]'
                                  : 'text-[#B8C2CC]'
                              }`}
                            >
                              ▼
                            </span>
                          </span>
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[150px]">
                        物料料号
                      </th>
                      <th className="px-4 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[200px]">
                        物料名称
                      </th>
                      <th className="px-4 py-2.5 text-center border-r border-[#F0F2F5] whitespace-nowrap min-w-[120px]">
                        产品数量
                      </th>
                      <th className="px-4 py-2.5 text-center whitespace-nowrap min-w-[115px]">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span>操作</span>
                          <Settings className="w-3.5 h-3.5 text-[#475569]" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7] text-xs text-[#1E293B]">
                    {sortedFillingRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-[#94A3B8]">
                          <div className="flex flex-col items-center gap-2">
                            <Inbox className="w-10 h-10 text-[#CBD5E1] stroke-[1.3]" />
                            <span>暂无数据</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedFillingRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-[#F5F9FF]">
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={!!fillingSelectedIds[row.id]}
                              onChange={(e) =>
                                setFillingSelectedIds((p) => ({
                                  ...p,
                                  [row.id]: e.target.checked,
                                }))
                              }
                              className="w-3.5 h-3.5 accent-[#1890FF] cursor-pointer"
                            />
                          </td>
                          <td className="px-2 py-2 text-center font-mono tabular-nums text-[#64748B]">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2 text-center font-mono tabular-nums font-medium">
                            {row.barcode}
                          </td>
                          <td className="px-4 py-2 text-center font-mono tabular-nums">
                            {row.materialCode}
                          </td>
                          <td className="px-4 py-2 text-center">{row.materialName}</td>
                          <td className="px-4 py-2 text-center font-mono tabular-nums">
                            {row.qty}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setFillingRows((prev) =>
                                  prev.filter((item) => item.id !== row.id)
                                )
                              }
                              className="text-[#FF4D4F] hover:underline cursor-pointer"
                            >
                              移除
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer: 保存 / 取消 */}
            <div className="px-6 py-3.5 border-t border-[#F0F2F5] bg-white flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleFillingSave}
                className="h-8 px-4 text-xs font-medium text-[#334155] bg-white border border-[#D9E1EC] hover:border-[#1890FF] hover:text-[#1890FF] rounded-xs transition cursor-pointer"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setFillingDrawerRecId(null)}
                className="h-8 px-4 text-xs font-medium text-[#334155] bg-white border border-[#D9E1EC] hover:bg-[#F8FAFC] rounded-xs transition cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Sales Delivery Detail Drawer */}
      {viewRecord && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/35"
          onClick={() => setViewRecord(null)}
        >
          <div
            className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#E5E9F0] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">
                销售发货单详情 · {viewRecord.deliveryNo}
              </span>
              <button
                type="button"
                onClick={() => setViewRecord(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['组织机构', viewRecord.org],
                  ['发货单号', viewRecord.deliveryNo],
                  ['单据状态', viewRecord.status],
                  ['客户', viewRecord.customer],
                  ['发货仓库', viewRecord.warehouse],
                  ['是否导出COA报告', viewRecord.exportCoa],
                  ['计划出库日期', viewRecord.planOutboundDate],
                  ['实际出库日期', viewRecord.actualOutboundDate || '—'],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="border border-[#EEF2F7] rounded p-2.5"
                  >
                    <div className="text-[11px] text-[#64748B]">{label}</div>
                    <div className="font-semibold text-[#0F172A] mt-0.5 font-mono">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewRecord;
                    setViewRecord(null);
                    handleOpenMaterialDrawer(target);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-[#1890FF] bg-[#E6F4FF] border border-[#91CAFF] rounded-xs cursor-pointer"
                >
                  查看物料清单 ({viewRecord.materials.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = viewRecord.id;
                    setViewRecord(null);
                    handleOpenSnDrawer(id);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-[#1890FF] bg-[#E6F4FF] border border-[#91CAFF] rounded-xs cursor-pointer"
                >
                  查看SN清单 ({viewRecord.snList.length})
                </button>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end">
              <button
                type="button"
                onClick={() => setViewRecord(null)}
                className="px-4 py-1.5 text-xs font-medium bg-white border border-[#D9E1EC] text-[#334155] rounded-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal ("单据打印") */}
      {printRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
          onClick={() => setPrintRecord(null)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#1890FF]" />
                <span className="text-sm font-bold text-[#0F172A]">
                  销售发货单打印预览 · {printRecord.deliveryNo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPrintRecord(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="text-center border-b border-[#E5E9F0] pb-3">
                <div className="text-base font-bold text-[#0F172A]">
                  {printRecord.org} · 销售发货单
                </div>
                <div className="text-[11px] text-[#64748B] font-mono mt-1">
                  发货单号：{printRecord.deliveryNo} ｜ 状态：{printRecord.status}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[#64748B]">客户名称：</span>
                  <span className="font-medium text-[#0F172A]">{printRecord.customer}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">出库仓库：</span>
                  <span className="font-medium text-[#0F172A]">{printRecord.warehouse}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">计划出库日期：</span>
                  <span className="font-mono text-[#0F172A]">
                    {printRecord.planOutboundDate}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B]">实际出库日期：</span>
                  <span className="font-mono text-[#0F172A]">
                    {printRecord.actualOutboundDate || '待出库'}
                  </span>
                </div>
              </div>
              <table className="w-full border border-[#D9E1EC] text-xs">
                <thead>
                  <tr className="bg-[#FAFAFA]">
                    <th className="border border-[#D9E1EC] px-2 py-1.5">项次</th>
                    <th className="border border-[#D9E1EC] px-2 py-1.5">产品料号</th>
                    <th className="border border-[#D9E1EC] px-2 py-1.5">物料名称</th>
                    <th className="border border-[#D9E1EC] px-2 py-1.5">出库数量</th>
                  </tr>
                </thead>
                <tbody>
                  {printRecord.materials.map((m) => (
                    <tr key={m.id}>
                      <td className="border border-[#D9E1EC] px-2 py-1.5 text-center font-mono">
                        {m.itemNo}
                      </td>
                      <td className="border border-[#D9E1EC] px-2 py-1.5 text-center font-mono">
                        {m.productCode}
                      </td>
                      <td className="border border-[#D9E1EC] px-2 py-1.5">
                        {m.materialName}
                      </td>
                      <td className="border border-[#D9E1EC] px-2 py-1.5 text-right font-mono">
                        {m.qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPrintRecord(null)}
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#D9E1EC] text-[#334155] rounded-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onShowToast(`已发送发货单 ${printRecord.deliveryNo} 至默认打印机`, 'success');
                  setPrintRecord(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#1890FF] hover:bg-[#165DFF] text-white rounded-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>立即打印</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sales Delivery Modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">新增销售发货单</span>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">组织机构</label>
                <select
                  value={createDraft.org}
                  onChange={(e) =>
                    setCreateDraft((p) => ({ ...p, org: e.target.value }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs bg-white outline-none focus:border-[#1890FF]"
                >
                  {ORGS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">
                  发货单号 <span className="text-[#FF4D4F]">*</span>
                </label>
                <input
                  type="text"
                  value={createDraft.deliveryNo}
                  onChange={(e) =>
                    setCreateDraft((p) => ({ ...p, deliveryNo: e.target.value }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs font-mono outline-none focus:border-[#1890FF]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">单据状态</label>
                <select
                  value={createDraft.status}
                  onChange={(e) =>
                    setCreateDraft((p) => ({
                      ...p,
                      status: e.target.value as DeliveryStatus,
                    }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs bg-white outline-none focus:border-[#1890FF]"
                >
                  <option value="开立">开立</option>
                  <option value="操作中">操作中</option>
                  <option value="已关结">已关结</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">计划出库日期</label>
                <input
                  type="date"
                  value={createDraft.planOutboundDate}
                  onChange={(e) =>
                    setCreateDraft((p) => ({
                      ...p,
                      planOutboundDate: e.target.value,
                    }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs font-mono outline-none focus:border-[#1890FF]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">客户</label>
                <select
                  value={createDraft.customer}
                  onChange={(e) =>
                    setCreateDraft((p) => ({ ...p, customer: e.target.value }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs bg-white outline-none focus:border-[#1890FF]"
                >
                  {CUSTOMERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">出库仓库</label>
                <select
                  value={createDraft.warehouse}
                  onChange={(e) =>
                    setCreateDraft((p) => ({ ...p, warehouse: e.target.value }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs bg-white outline-none focus:border-[#1890FF]"
                >
                  {WAREHOUSES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">产品料号</label>
                <select
                  value={createDraft.productCode}
                  onChange={(e) =>
                    setCreateDraft((p) => ({ ...p, productCode: e.target.value }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs bg-white outline-none focus:border-[#1890FF]"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} · {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-[#334155]">发货数量</label>
                <input
                  type="number"
                  value={createDraft.qty}
                  onChange={(e) =>
                    setCreateDraft((p) => ({ ...p, qty: e.target.value }))
                  }
                  className="h-8 px-2.5 border border-[#D9E1EC] rounded-xs font-mono outline-none focus:border-[#1890FF]"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#D9E1EC] text-[#334155] rounded-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                className="px-4 py-1.5 text-xs font-medium bg-[#1890FF] hover:bg-[#165DFF] text-white rounded-xs cursor-pointer"
              >
                确认新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
          onClick={() => setImportOpen(false)}
        >
          <div
            className="bg-white border border-[#E5E9F0] rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1890FF]" />
                <span className="text-sm font-bold text-[#0F172A]">批量导入销售发货单</span>
              </div>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5 text-xs">
              <p className="text-[#64748B]">
                每行一条：发货单号,计划出库日期(YYYY-MM-DD),单据状态(开立/操作中/已关结)
              </p>
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="2000365001,2026-11-22,已关结"
                className="w-full p-2.5 border border-[#D9E1EC] rounded-xs font-mono text-xs outline-none focus:border-[#1890FF]"
              />
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#D9E1EC] text-[#334155] rounded-xs cursor-pointer"
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
                  const added: SalesDeliveryRecord[] = lines.map((line, i) => {
                    const [no, dt, stRaw] = line.split(',').map((s) => s.trim());
                    const st: DeliveryStatus =
                      stRaw === '开立' || stRaw === '操作中' ? stRaw : '已关结';
                    const prod = PRODUCTS[i % PRODUCTS.length];
                    const delNo = no || `200036${5100 + i}`;
                    return {
                      id: `sd-imp-${Date.now()}-${i}`,
                      org: '昇兴集团-中山制罐工厂',
                      deliveryNo: delNo,
                      status: st,
                      urgent: false,
                      erpWritebackFlag: false,
                      erpWritebackResult: '',
                      planOutboundDate: dt || '2026-11-20',
                      actualOutboundDate: st === '已关结' ? dt || '2026-11-20' : '',
                      customer: CUSTOMERS[i % CUSTOMERS.length],
                      warehouse: WAREHOUSES[0],
                      productCode: prod.code,
                      materialCode: prod.code,
                      productName: prod.name,
                      exportCoa: '是',
                      materials: [
                        {
                          id: `ml-imp-${Date.now()}-${i}`,
                          org: '昇兴集团-中山制罐工厂',
                          deliveryNo: delNo,
                          outboundNo: `OUT${delNo.slice(-6)}`,
                          salesOrderNo: `SO202699${i}`,
                          itemNo: '10',
                          productCode: prod.code,
                          materialCode: prod.code,
                          materialName: prod.name,
                          lineStatus: st === '已关结' ? '已关结' : '开立',
                          qty: 9600,
                          writebackDone: false,
                        },
                      ],
                      snList: [],
                    };
                  });
                  setRecords((prev) => [...added, ...prev]);
                  setImportOpen(false);
                  onShowToast(`已导入 ${added.length} 条销售发货单`, 'success');
                }}
                className="px-4 py-1.5 text-xs font-medium bg-[#1890FF] hover:bg-[#165DFF] text-white rounded-xs cursor-pointer"
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
              <span className="text-sm font-bold text-[#0F172A]">列显示设置</span>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {MAIN_COLS.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#EEF2F7] hover:bg-[#F8FAFC] text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!hiddenCols[c.key]}
                    onChange={(e) =>
                      setHiddenCols((prev) => ({
                        ...prev,
                        [c.key]: !e.target.checked,
                      }))
                    }
                    className="rounded-xs border-[#CBD5E1] accent-[#1890FF]"
                  />
                  <span className="text-[#1E293B] truncate">{c.title}</span>
                </label>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex justify-between">
              <button
                type="button"
                onClick={() =>
                  setHiddenCols({
                    org: false,
                    deliveryNo: false,
                    status: false,
                    urgent: false,
                    erpWritebackFlag: false,
                    erpWritebackResult: false,
                    planOutboundDate: false,
                    actualOutboundDate: false,
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-[#475569] hover:text-[#1890FF] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>全部显示</span>
              </button>
              <button
                type="button"
                onClick={() => setColSettingsOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#1890FF] text-white rounded-xs hover:bg-[#165DFF] cursor-pointer"
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
                className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#D9E1EC] text-[#334155] rounded-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-medium bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs cursor-pointer"
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
