import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FolderPlus,
  Plus,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react';

export type TextFilterOp = 'contains' | 'equals' | 'not_contains';
export type NodeLevel = '仓库' | '库区' | '库位';
export type DrawerMode = 'create_wh' | 'create_child' | 'edit' | 'view';

export interface WarehouseModelItem {
  id: string;
  parentId: string | null;
  level: NodeLevel;
  org: string;
  category: string; // 类别 / 仓库类型 (e.g. 其他, 原料仓, 成品仓...)
  code: string;
  name: string;
  rackCategory: string;
  rackHardwareCode: string;
  rackServiceIp: string;
  capacity: string;
  volume: string;
  ownerDept: string;
  creator: string;
  createdAt: string;
  enabled: boolean;
  remark: string;
}

interface WarehouseModelingTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ORG_OPTIONS = [
  '昇兴集团-中山制罐工厂',
  '昇兴集团-福建制罐工厂',
  '昇兴集团-山东制罐工厂',
];

const WAREHOUSE_TYPE_OPTIONS = [
  '其他',
  '原料仓',
  '成品仓',
  '线边仓',
  '委外仓',
  '不良品仓',
];

const LEVEL_OPTIONS: NodeLevel[] = ['仓库', '库区', '库位'];

const RACK_CATEGORY_OPTIONS = [
  '平面库',
  '高位货架',
  '重型货架',
  '穿梭车货架',
  '流利式货架',
];

const DEFAULT_ORG = '昇兴集团-中山制罐工厂';

const BASE_WAREHOUSES: WarehouseModelItem[] = [
  {
    id: 'wh-2110',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2110',
    name: '铜针、铜线仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '999',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-14 09:20:15',
    enabled: true,
    remark: '铜线委外及电极铜针专用仓',
  },
  {
    id: 'wh-2100',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2100',
    name: '原材料待处理仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-14 09:18:40',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-1070',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '1070',
    name: '成品退货仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '靳铁伟',
    createdAt: '2025-08-12 16:45:10',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2030',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2030',
    name: '包材仓',
    rackCategory: '高位货架',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '10000000',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-12 15:10:02',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-4130',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '4130',
    name: '制罐线边仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-11 11:25:33',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-1040',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '1040',
    name: '成品不良品仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-10 14:32:18',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-1030',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '1030',
    name: '成品隔离仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-10 14:30:05',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-4330',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '4330',
    name: '制罐车间线边客供料仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-09 10:15:44',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-3010',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '3010',
    name: '备品备件仓',
    rackCategory: '重型货架',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-09 09:42:19',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-4230',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '4230',
    name: '制罐车间线边待处理仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-08 17:06:51',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2070',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2070',
    name: '不良品仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-08 16:40:22',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2010',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2010',
    name: '原材料仓',
    rackCategory: '高位货架',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-08 15:20:09',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-1100',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '1100',
    name: '成品仓',
    rackCategory: '高位货架',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-08 14:55:31',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-0000',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '0000',
    name: '委外仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '林鹏',
    createdAt: '2025-08-07 10:12:08',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2060',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2060',
    name: '废品仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-07 09:44:16',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2300',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2300',
    name: '客供料仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-06 16:30:27',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-1060',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '1060',
    name: '成品外租仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-06 15:18:11',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-1020',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '1020',
    name: '成品待处理仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-06 14:22:09',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2020',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2020',
    name: '薄钢板仓',
    rackCategory: '重型货架',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-06 11:05:40',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2040',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2040',
    name: '化工仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-05 17:19:52',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2050',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2050',
    name: 'VMI仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-05 16:40:12',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2080',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2080',
    name: '原辅材料外租仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-05 15:11:04',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2090',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2090',
    name: '维修仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-05 14:28:39',
    enabled: true,
    remark: '',
  },
  {
    id: 'wh-2120',
    parentId: null,
    level: '仓库',
    org: DEFAULT_ORG,
    category: '其他',
    code: '2120',
    name: '栈板仓',
    rackCategory: '平面库',
    rackHardwareCode: '',
    rackServiceIp: '',
    capacity: '',
    volume: '',
    ownerDept: '',
    creator: '',
    createdAt: '2025-08-05 11:08:23',
    enabled: true,
    remark: '',
  },
];

// Build realistic child 库区 & 库位 nodes so every warehouse in the left tree is expandable
function buildInitialItems(): WarehouseModelItem[] {
  const items: WarehouseModelItem[] = [...BASE_WAREHOUSES];

  for (const wh of BASE_WAREHOUSES) {
    const zoneId = `${wh.id}-z01`;
    const zoneCode = `${wh.code}-01`;
    items.push({
      id: zoneId,
      parentId: wh.id,
      level: '库区',
      org: wh.org,
      category: '库区',
      code: zoneCode,
      name: `${wh.name}-库区1`,
      rackCategory: wh.rackCategory,
      rackHardwareCode: '',
      rackServiceIp: '',
      capacity: '',
      volume: '',
      ownerDept: '',
      creator: wh.creator || '林鹏',
      createdAt: wh.createdAt,
      enabled: true,
      remark: '',
    });

    for (let i = 1; i <= 2; i += 1) {
      const locCode = `${zoneCode}-${String(i).padStart(2, '0')}`;
      items.push({
        id: `${zoneId}-l0${i}`,
        parentId: zoneId,
        level: '库位',
        org: wh.org,
        category: '库位',
        code: locCode,
        name: `${wh.name}-库区1-库位${i}`,
        rackCategory: wh.rackCategory,
        rackHardwareCode: `HW-${wh.code}-${i}`,
        rackServiceIp: '',
        capacity: '500',
        volume: '120',
        ownerDept: '仓储物流部',
        creator: wh.creator || '林鹏',
        createdAt: wh.createdAt,
        enabled: true,
        remark: '',
      });
    }
  }

  return items;
}

// Left tree root display order matching screenshot verbatim (ascending by code)
const TREE_ORDER_CODES = [
  '0000',
  '1020',
  '1030',
  '1040',
  '1060',
  '1070',
  '1100',
  '2010',
  '2020',
  '2030',
  '2040',
  '2050',
  '2060',
  '2070',
  '2080',
  '2090',
  '2100',
  '2110',
  '2120',
  '2300',
  '3010',
  '4130',
  '4230',
  '4330',
];

type SortField = 'category' | 'code' | 'name' | 'rackHardwareCode';

type ColumnKey =
  | 'category'
  | 'code'
  | 'name'
  | 'rackHardwareCode'
  | 'capacity'
  | 'volume'
  | 'ownerDept'
  | 'creator'
  | 'createdAt';

const ALL_COLUMNS: {
  key: ColumnKey;
  label: string;
  width: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}[] = [
  { key: 'category', label: '类别', width: 'w-[86px]', sortable: true, align: 'center' },
  { key: 'code', label: '编码', width: 'w-[120px]', sortable: true, align: 'left' },
  { key: 'name', label: '名称', width: 'w-[185px]', sortable: true, align: 'left' },
  {
    key: 'rackHardwareCode',
    label: '货架硬体编码',
    width: 'w-[125px]',
    sortable: true,
    align: 'center',
  },
  { key: 'capacity', label: '容量', width: 'w-[96px]', align: 'center' },
  { key: 'volume', label: '容积', width: 'w-[82px]', align: 'center' },
  { key: 'ownerDept', label: '货位归属部门', width: 'w-[116px]', align: 'center' },
  { key: 'creator', label: '创建人', width: 'w-[94px]', align: 'center' },
  { key: 'createdAt', label: '创建时间', width: 'w-[148px]', align: 'center' },
];

function matchText(value: string, query: string, op: TextFilterOp): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const v = (value || '').toLowerCase();
  if (op === 'equals') return v === q;
  if (op === 'not_contains') return !v.includes(q);
  return v.includes(q);
}

function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const WarehouseModelingTab: React.FC<WarehouseModelingTabProps> = ({
  onShowToast,
}) => {
  const [items, setItems] = useState<WarehouseModelItem[]>(buildInitialItems);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Left tree state (委外仓 0000 and its 库区1 expanded by default just like screenshot)
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([
    'wh-0000',
    'wh-0000-z01',
  ]);
  const [activeTreeNodeId, setActiveTreeNodeId] = useState<string | null>(null);

  // Top 3-row filter state
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState(DEFAULT_ORG);
  const [codeOp, setCodeOp] = useState<TextFilterOp>('contains');
  const [codeQuery, setCodeQuery] = useState('');
  const [whTypeOp, setWhTypeOp] = useState<TextFilterOp>('contains');
  const [whTypeQuery, setWhTypeQuery] = useState('');
  const [nameOp, setNameOp] = useState<TextFilterOp>('contains');
  const [nameQuery, setNameQuery] = useState('');
  const [levelOp, setLevelOp] = useState<TextFilterOp>('contains');
  const [levelQuery, setLevelQuery] = useState('');
  const [rackCatOp, setRackCatOp] = useState<TextFilterOp>('contains');
  const [rackCatQuery, setRackCatQuery] = useState('');
  const [rackIpOp, setRackIpOp] = useState<TextFilterOp>('contains');
  const [rackIpQuery, setRackIpQuery] = useState('');

  // Applied filter snapshot
  const [appliedFilter, setAppliedFilter] = useState({
    org: DEFAULT_ORG,
    codeOp: 'contains' as TextFilterOp,
    codeQuery: '',
    whTypeOp: 'contains' as TextFilterOp,
    whTypeQuery: '',
    nameOp: 'contains' as TextFilterOp,
    nameQuery: '',
    levelOp: 'contains' as TextFilterOp,
    levelQuery: '',
    rackCatOp: 'contains' as TextFilterOp,
    rackCatQuery: '',
    rackIpOp: 'contains' as TextFilterOp,
    rackIpQuery: '',
  });

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [jumpInput, setJumpInput] = useState('');

  // Column settings modal
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    category: true,
    code: true,
    name: true,
    rackHardwareCode: true,
    capacity: true,
    volume: true,
    ownerDept: true,
    creator: true,
    createdAt: true,
  });
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // Floating "更多" row menu
  const [openMoreRowId, setOpenMoreRowId] = useState<string | null>(null);
  const [moreMenuPos, setMoreMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Delete confirmation modal
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[] | null>(null);

  // Unified Slide-over Drawer (新增仓库 / 新增子区域 / 修改 / 查看)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create_wh');
  const [formState, setFormState] = useState<WarehouseModelItem | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setOpenMoreRowId(null);
      }
    };
    if (openMoreRowId) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [openMoreRowId]);

  // Build parent->children lookup
  const childrenMap = useMemo(() => {
    const map = new Map<string | null, WarehouseModelItem[]>();
    for (const item of items) {
      if (appliedFilter.org && item.org !== appliedFilter.org) continue;
      const key = item.parentId;
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    }
    // Sort root warehouses according to TREE_ORDER_CODES / code
    const roots = map.get(null) || [];
    roots.sort((a, b) => {
      const ia = TREE_ORDER_CODES.indexOf(a.code);
      const ib = TREE_ORDER_CODES.indexOf(b.code);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.code.localeCompare(b.code, 'zh-CN');
    });
    map.set(null, roots);
    return map;
  }, [items, appliedFilter.org]);

  // Collect all descendant IDs of a node (inclusive)
  const getSubtreeIds = (rootId: string): Set<string> => {
    const result = new Set<string>([rootId]);
    const queue = [rootId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const kids = items.filter((it) => it.parentId === curr);
      for (const k of kids) {
        if (!result.has(k.id)) {
          result.add(k.id);
          queue.push(k.id);
        }
      }
    }
    return result;
  };

  // Filtered table rows
  const filteredRows = useMemo(() => {
    const subtreeSet = activeTreeNodeId ? getSubtreeIds(activeTreeNodeId) : null;

    const list = items.filter((item) => {
      if (appliedFilter.org && item.org !== appliedFilter.org) return false;
      if (subtreeSet && !subtreeSet.has(item.id)) return false;
      if (!matchText(item.code, appliedFilter.codeQuery, appliedFilter.codeOp)) {
        return false;
      }
      if (!matchText(item.category, appliedFilter.whTypeQuery, appliedFilter.whTypeOp)) {
        return false;
      }
      if (!matchText(item.name, appliedFilter.nameQuery, appliedFilter.nameOp)) {
        return false;
      }
      if (!matchText(item.level, appliedFilter.levelQuery, appliedFilter.levelOp)) {
        return false;
      }
      if (
        !matchText(item.rackCategory, appliedFilter.rackCatQuery, appliedFilter.rackCatOp)
      ) {
        return false;
      }
      if (
        !matchText(
          item.rackServiceIp,
          appliedFilter.rackIpQuery,
          appliedFilter.rackIpOp
        )
      ) {
        return false;
      }
      return true;
    });

    if (!sortField) return list;
    return [...list].sort((a, b) => {
      const cmp = (a[sortField] || '').localeCompare(b[sortField] || '', 'zh-CN');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, activeTreeNodeId, appliedFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const allVisibleChecked =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.includes(r.id));

  const handleToggleAllVisible = () => {
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

  const handleSort = (field: SortField) => {
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
      codeOp,
      codeQuery,
      whTypeOp,
      whTypeQuery,
      nameOp,
      nameQuery,
      levelOp,
      levelQuery,
      rackCatOp,
      rackCatQuery,
      rackIpOp,
      rackIpQuery,
    });
    setCurrentPage(1);
    onShowToast('仓库建模查询结果已刷新', 'info');
  };

  const handleReset = () => {
    setOrgFilter(DEFAULT_ORG);
    setCodeOp('contains');
    setCodeQuery('');
    setWhTypeOp('contains');
    setWhTypeQuery('');
    setNameOp('contains');
    setNameQuery('');
    setLevelOp('contains');
    setLevelQuery('');
    setRackCatOp('contains');
    setRackCatQuery('');
    setRackIpOp('contains');
    setRackIpQuery('');
    setActiveTreeNodeId(null);
    setAppliedFilter({
      org: DEFAULT_ORG,
      codeOp: 'contains',
      codeQuery: '',
      whTypeOp: 'contains',
      whTypeQuery: '',
      nameOp: 'contains',
      nameQuery: '',
      levelOp: 'contains',
      levelQuery: '',
      rackCatOp: 'contains',
      rackCatQuery: '',
      rackIpOp: 'contains',
      rackIpQuery: '',
    });
    setCurrentPage(1);
    onShowToast('查询条件已重置', 'info');
  };

  const toggleExpandTree = (id: string) => {
    setExpandedNodeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openCreateWarehouse = () => {
    setFormState({
      id: `wh-${Date.now()}`,
      parentId: null,
      level: '仓库',
      org: orgFilter || DEFAULT_ORG,
      category: '其他',
      code: '',
      name: '',
      rackCategory: '平面库',
      rackHardwareCode: '',
      rackServiceIp: '',
      capacity: '',
      volume: '',
      ownerDept: '',
      creator: '林鹏',
      createdAt: formatNow(),
      enabled: true,
      remark: '',
    });
    setDrawerMode('create_wh');
    setDrawerOpen(true);
  };

  const openCreateChildArea = (parentItem?: WarehouseModelItem) => {
    const targetParent =
      parentItem ||
      items.find((it) => it.id === activeTreeNodeId) ||
      items.find((it) => selectedIds.includes(it.id)) ||
      items.find((it) => it.code === '0000');

    if (!targetParent) {
      onShowToast('请先在左侧仓库树或列表中选择上级仓库/库区', 'warning');
      return;
    }

    if (targetParent.level === '库位') {
      onShowToast('库位为最末级节点，不能继续新增下级子区域', 'warning');
      return;
    }

    const nextLevel: NodeLevel = targetParent.level === '仓库' ? '库区' : '库位';
    const siblingCount = items.filter((it) => it.parentId === targetParent.id).length + 1;
    const suggestedCode = `${targetParent.code}-${String(siblingCount).padStart(2, '0')}`;

    setFormState({
      id: `area-${Date.now()}`,
      parentId: targetParent.id,
      level: nextLevel,
      org: targetParent.org,
      category: nextLevel,
      code: suggestedCode,
      name: `${targetParent.name}-${nextLevel}${siblingCount}`,
      rackCategory: targetParent.rackCategory || '平面库',
      rackHardwareCode: '',
      rackServiceIp: '',
      capacity: '',
      volume: '',
      ownerDept: targetParent.ownerDept || '',
      creator: '林鹏',
      createdAt: formatNow(),
      enabled: true,
      remark: '',
    });
    setDrawerMode('create_child');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: WarehouseModelItem) => {
    setFormState({ ...item });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (item: WarehouseModelItem) => {
    setFormState({ ...item });
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveDrawer = () => {
    if (!formState) return;
    if (!formState.code.trim()) {
      onShowToast('请填写必填项：编码', 'warning');
      return;
    }
    if (!formState.name.trim()) {
      onShowToast('请填写必填项：名称', 'warning');
      return;
    }

    const duplicate = items.some(
      (it) =>
        it.code.trim().toLowerCase() === formState.code.trim().toLowerCase() &&
        it.id !== formState.id
    );
    if (duplicate) {
      onShowToast(`编码 ${formState.code} 已存在，请更换编码`, 'warning');
      return;
    }

    if (drawerMode === 'create_wh' || drawerMode === 'create_child') {
      setItems((prev) => [formState, ...prev]);
      if (formState.parentId && !expandedNodeIds.includes(formState.parentId)) {
        setExpandedNodeIds((prev) => [...prev, formState.parentId!]);
      }
      onShowToast(
        `${drawerMode === 'create_wh' ? '新增仓库' : '新增子区域'}「${formState.name}」保存成功`,
        'success'
      );
    } else {
      setItems((prev) =>
        prev.map((it) => (it.id === formState.id ? formState : it))
      );
      onShowToast(`「${formState.name}」修改已保存`, 'success');
    }
    setDrawerOpen(false);
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选需要批量删除的记录', 'warning');
      return;
    }
    setDeleteTargetIds(selectedIds);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetIds || deleteTargetIds.length === 0) return;
    // Also remove descendants of any deleted node to keep tree consistent
    const allToRemove = new Set<string>();
    for (const id of deleteTargetIds) {
      const sub = getSubtreeIds(id);
      sub.forEach((s) => allToRemove.add(s));
    }
    setItems((prev) => prev.filter((it) => !allToRemove.has(it.id)));
    setSelectedIds((prev) => prev.filter((id) => !allToRemove.has(id)));
    if (activeTreeNodeId && allToRemove.has(activeTreeNodeId)) {
      setActiveTreeNodeId(null);
    }
    onShowToast(`已删除 ${deleteTargetIds.length} 条记录及其下级区域`, 'success');
    setDeleteTargetIds(null);
  };

  const handleOpenMoreMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    rowId: string
  ) => {
    e.stopPropagation();
    if (openMoreRowId === rowId) {
      setOpenMoreRowId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 148;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4;
    const left = Math.min(window.innerWidth - 136, Math.max(8, rect.right - 120));
    setMoreMenuPos({ top, left });
    setOpenMoreRowId(rowId);
  };

  // Recursive Tree Renderer
  const treeSearchLower = treeSearch.trim().toLowerCase();

  const nodeMatchesTreeSearch = (node: WarehouseModelItem): boolean => {
    if (!treeSearchLower) return true;
    const selfMatch =
      node.name.toLowerCase().includes(treeSearchLower) ||
      node.code.toLowerCase().includes(treeSearchLower);
    if (selfMatch) return true;
    const kids = childrenMap.get(node.id) || [];
    return kids.some((k) => nodeMatchesTreeSearch(k));
  };

  const renderTreeNodes = (parentId: string | null, depth: number) => {
    const nodes = (childrenMap.get(parentId) || []).filter(nodeMatchesTreeSearch);
    return nodes.map((node) => {
      const kids = (childrenMap.get(node.id) || []).filter(nodeMatchesTreeSearch);
      const hasKids = kids.length > 0;
      const isExpanded =
        treeSearchLower.length > 0 || expandedNodeIds.includes(node.id);
      const isActive = activeTreeNodeId === node.id;

      return (
        <div key={node.id}>
          <div
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
            className={`group flex items-center gap-1 py-1.5 pr-2 text-[12.5px] rounded-xs cursor-pointer select-none transition-colors ${
              isActive
                ? 'bg-[#E6F4FF] text-[#1890FF] font-medium'
                : 'text-[#334155] hover:bg-[#F5F7FA]'
            }`}
            onClick={() => {
              setActiveTreeNodeId((prev) => (prev === node.id ? null : node.id));
              setCurrentPage(1);
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (hasKids) toggleExpandTree(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-[#64748B] shrink-0"
            >
              {hasKids ? (
                <span className="text-[9px] leading-none">
                  {isExpanded ? '▼' : '▶'}
                </span>
              ) : (
                <span className="w-3" />
              )}
            </button>
            <span
              className="truncate"
              title={`${node.name} (${node.code})`}
            >
              {node.name} ({node.code})
            </span>
          </div>
          {hasKids && isExpanded && renderTreeNodes(node.id, depth + 1)}
        </div>
      );
    });
  };

  // Pagination page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 4) pages.push('ellipsis');
      const start = Math.max(2, safePage - 2);
      const end = Math.min(totalPages - 1, safePage + 2);
      for (let i = start; i <= end; i += 1) pages.push(i);
      if (safePage < totalPages - 3) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const handleJumpPage = () => {
    const num = parseInt(jumpInput, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
    setJumpInput('');
  };

  const activeMoreRow = openMoreRowId
    ? items.find((it) => it.id === openMoreRowId) || null
    : null;
  const isReadOnly = drawerMode === 'view';
  const drawerTitle =
    drawerMode === 'create_wh'
      ? '新增仓库'
      : drawerMode === 'create_child'
      ? '新增子区域'
      : drawerMode === 'edit'
      ? '修改仓库建模'
      : '查看仓库建模';

  const parentNodeForForm = formState?.parentId
    ? items.find((it) => it.id === formState.parentId)
    : null;

  return (
    <div className="space-y-4 relative text-xs text-[#1E293B]">
      {/* Top 3-Row Filter Card (工单管理风格) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3 text-xs">
        {/* Top Row: Title + 组织机构 + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">仓库建模</span>
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

        {/* Rows 2 & 3 */}
        {!filterCollapsed && (
          <div className="space-y-2.5 pt-0.5">
            {/* Row 2: 编码 | 仓库类型 | 名称 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              {/* 编码 */}
              <div className="flex items-center gap-2">
                <label className="w-[72px] text-right text-[#1E40AF] font-medium shrink-0">
                  编码
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={codeOp}
                    onChange={(e) => setCodeOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={codeQuery}
                    onChange={(e) => setCodeQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              {/* 仓库类型 */}
              <div className="flex items-center gap-2">
                <label className="w-[72px] text-right text-[#1E40AF] font-medium shrink-0">
                  仓库类型
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={whTypeOp}
                    onChange={(e) => setWhTypeOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <select
                    value={whTypeQuery}
                    onChange={(e) => setWhTypeQuery(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {WAREHOUSE_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 名称 */}
              <div className="flex items-center gap-2">
                <label className="w-[72px] text-right text-[#1E40AF] font-medium shrink-0">
                  名称
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={nameOp}
                    onChange={(e) => setNameOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: 仓库类别 | 货架类别 | 货架服务IP */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2.5">
              {/* 仓库类别 */}
              <div className="flex items-center gap-2">
                <label className="w-[72px] text-right text-[#1E40AF] font-medium shrink-0">
                  仓库类别
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={levelOp}
                    onChange={(e) => setLevelOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <select
                    value={levelQuery}
                    onChange={(e) => setLevelQuery(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {LEVEL_OPTIONS.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 货架类别 */}
              <div className="flex items-center gap-2">
                <label className="w-[72px] text-right text-[#1E40AF] font-medium shrink-0">
                  货架类别
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={rackCatOp}
                    onChange={(e) => setRackCatOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <select
                    value={rackCatQuery}
                    onChange={(e) => setRackCatQuery(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] bg-white outline-none cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {RACK_CATEGORY_OPTIONS.map((rc) => (
                      <option key={rc} value={rc}>
                        {rc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 货架服务IP */}
              <div className="flex items-center gap-2">
                <label className="w-[72px] text-right text-[#1E40AF] font-medium shrink-0">
                  货架服务IP
                </label>
                <div className="flex flex-1 max-w-[260px] h-8 border border-[#E5E9F0] rounded-lg overflow-hidden bg-white focus-within:border-[#2563EB] transition">
                  <select
                    value={rackIpOp}
                    onChange={(e) => setRackIpOp(e.target.value as TextFilterOp)}
                    className="h-full px-2 text-xs text-[#475569] bg-white border-r border-[#EDF2F7] outline-none cursor-pointer shrink-0"
                  >
                    <option value="contains">包含</option>
                    <option value="equals">等于</option>
                    <option value="not_contains">不包含</option>
                  </select>
                  <input
                    type="text"
                    value={rackIpQuery}
                    onChange={(e) => setRackIpQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Card (Toolbar + Left Tree + Right Table) */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative flex flex-col">
        {/* Top Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2 flex-wrap">
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
                {filteredRows.length}
              </strong>{' '}
              条仓库/区域
            </span>
            {activeTreeNodeId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs bg-[#EBF2FF] text-[#1E40AF] rounded-lg font-medium">
                <span>
                  节点：{items.find((it) => it.id === activeTreeNodeId)?.name || ''}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTreeNodeId(null)}
                  className="hover:text-[#165DFF] cursor-pointer"
                  title="显示全部仓库"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={openCreateWarehouse}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增仓库</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDeleteClick}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                selectedIds.length === 0
                  ? 'border-[#EA580C]/40 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
                  : 'border-[#EA580C]/60 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateChildArea()}
              className="h-8 px-3.5 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>新增子区域</span>
            </button>
          </div>
        </div>

        {/* Split Pane: Left Tree + Right Table */}
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Warehouse Tree Panel */}
          <div className="w-full lg:w-[252px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#EDF2F7] flex flex-col bg-white max-h-[660px]">
            <div className="p-2.5 border-b border-[#EDF2F7]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="搜索仓库/库区/库位"
                  className="w-full h-8 pl-8 pr-6 text-xs bg-[#F4F6F9] border border-[#E5E9F0] rounded-lg text-[#1E293B] placeholder-[#94A3B8] outline-none focus:bg-white focus:border-[#2563EB] transition"
                />
                {treeSearch && (
                  <button
                    type="button"
                    onClick={() => setTreeSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {renderTreeNodes(null, 0)}
            </div>
          </div>

          {/* Right Data Table + Pagination */}
          <div className="flex-1 min-w-0 flex flex-col bg-white">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
                  <tr>
                    <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allVisibleChecked}
                        onChange={handleToggleAllVisible}
                        className="w-3.5 h-3.5 accent-[#165DFF] align-middle cursor-pointer"
                      />
                    </th>
                    {ALL_COLUMNS.map(
                      (col) =>
                        visibleColumns[col.key] && (
                          <th
                            key={col.key}
                            onClick={() =>
                              col.sortable && handleSort(col.key as SortField)
                            }
                            className={`${col.width} p-2.5 border-b border-r border-[#E5E9F0] select-none transition ${
                              col.sortable
                                ? 'cursor-pointer hover:bg-[#EDF2F7]/70'
                                : ''
                            } ${col.align === 'center' ? 'text-center' : 'text-left'}`}
                          >
                            <div
                              className={`inline-flex items-center gap-1 ${
                                col.align === 'center' ? 'justify-center' : ''
                              }`}
                            >
                              <span>{col.label}</span>
                              {col.sortable && (
                                <ArrowUpDown
                                  className={`w-3 h-3 ${
                                    sortField === col.key
                                      ? 'text-[#1E40AF]'
                                      : 'text-[#C5C8BE]'
                                  }`}
                                />
                              )}
                            </div>
                          </th>
                        )
                    )}
                    <th className="p-2.5 border-b border-[#E5E9F0] w-36 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                      <div className="inline-flex items-center gap-2">
                        <span>操作</span>
                        <button
                          type="button"
                          onClick={() => setIsColumnModalOpen(true)}
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
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          2 + Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="py-16 text-center text-[#64748B]"
                      >
                        暂无符合条件的仓库建模数据
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row) => {
                      const isChecked = selectedIds.includes(row.id);
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
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
                          {visibleColumns.category && (
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center text-[#1E293B]">
                              {row.category}
                            </td>
                          )}
                          {visibleColumns.code && (
                            <td className="p-2.5 border-r border-[#EDF2F7] font-mono tabular-nums font-semibold text-[#1E40AF]">
                              <button
                                type="button"
                                onClick={() => openEditDrawer(row)}
                                className="hover:text-[#1E293B] hover:underline cursor-pointer"
                              >
                                {row.code}
                              </button>
                            </td>
                          )}
                          {visibleColumns.name && (
                            <td
                              className="p-2.5 border-r border-[#EDF2F7] text-[#1E293B] max-w-[190px] truncate"
                              title={row.name}
                            >
                              {row.name}
                            </td>
                          )}
                          {visibleColumns.rackHardwareCode && (
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono text-[#64748B]">
                              {row.rackHardwareCode || '—'}
                            </td>
                          )}
                          {visibleColumns.capacity && (
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#1E293B]">
                              {row.capacity || '—'}
                            </td>
                          )}
                          {visibleColumns.volume && (
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#64748B]">
                              {row.volume || '—'}
                            </td>
                          )}
                          {visibleColumns.ownerDept && (
                            <td
                              className="p-2.5 border-r border-[#EDF2F7] text-center text-[#64748B] max-w-[116px] truncate"
                              title={row.ownerDept}
                            >
                              {row.ownerDept || '—'}
                            </td>
                          )}
                          {visibleColumns.creator && (
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center text-[#1E293B]">
                              {row.creator || '—'}
                            </td>
                          )}
                          {visibleColumns.createdAt && (
                            <td className="p-2.5 border-r border-[#EDF2F7] text-center font-mono tabular-nums text-[#64748B]">
                              {row.createdAt}
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
                                onClick={() => openEditDrawer(row)}
                                className="text-[#1E40AF] hover:text-[#1E293B] hover:underline font-medium cursor-pointer"
                              >
                                修改
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTargetIds([row.id])}
                                className="text-[#EA580C] hover:text-[#d96136] hover:underline font-medium cursor-pointer"
                              >
                                删除
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleOpenMoreMenu(e, row.id)}
                                className="inline-flex items-center gap-0.5 text-[#1E40AF] hover:text-[#1E293B] font-medium cursor-pointer"
                              >
                                <span>更多</span>
                                <ChevronDown className="w-3 h-3" />
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
                  {filteredRows.length}
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
                {pageNumbers.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`el-${idx}`} className="px-1 text-[#94A3B8]">
                      ···
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-lg border text-xs font-mono cursor-pointer transition ${
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
              <div className="flex items-center gap-1.5">
                <span>跳至</span>
                <input
                  type="text"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
                  onBlur={handleJumpPage}
                  className="w-11 h-7 px-1.5 text-center font-mono border border-[#E5E9F0] rounded-lg text-xs text-[#1E293B] outline-none focus:border-[#2563EB]"
                />
                <span>页</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating "更多" Dropdown Menu */}
      {openMoreRowId && moreMenuPos && activeMoreRow && (
        <div
          ref={moreMenuRef}
          style={{ top: moreMenuPos.top, left: moreMenuPos.left }}
          className="fixed z-50 w-[124px] bg-white border border-[#E5E9F0] rounded-xs shadow-lg py-1 text-[13px]"
        >
          <button
            type="button"
            onClick={() => {
              setOpenMoreRowId(null);
              openViewDrawer(activeMoreRow);
            }}
            className="w-full px-3.5 py-2 text-left text-[#1890FF] hover:bg-[#F5F7FA] cursor-pointer"
          >
            查看详情
          </button>
          {activeMoreRow.level !== '库位' && (
            <button
              type="button"
              onClick={() => {
                setOpenMoreRowId(null);
                openCreateChildArea(activeMoreRow);
              }}
              className="w-full px-3.5 py-2 text-left text-[#1890FF] hover:bg-[#F5F7FA] cursor-pointer"
            >
              新增子区域
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpenMoreRowId(null);
              onShowToast(
                `已生成「${activeMoreRow.name} (${activeMoreRow.code})」库位条码打印任务`,
                'success'
              );
            }}
            className="w-full px-3.5 py-2 text-left text-[#1890FF] hover:bg-[#F5F7FA] cursor-pointer"
          >
            条码打印
          </button>
          <button
            type="button"
            onClick={() => {
              setOpenMoreRowId(null);
              setItems((prev) =>
                prev.map((it) =>
                  it.id === activeMoreRow.id ? { ...it, enabled: !it.enabled } : it
                )
              );
              onShowToast(
                `「${activeMoreRow.name}」已${activeMoreRow.enabled ? '停用' : '启用'}`,
                'info'
              );
            }}
            className="w-full px-3.5 py-2 text-left text-[#1890FF] hover:bg-[#F5F7FA] cursor-pointer"
          >
            {activeMoreRow.enabled ? '停用区域' : '启用区域'}
          </button>
        </div>
      )}

      {/* Column Visibility Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs shadow-xl w-full max-w-[380px] border border-[#E5E9F0]">
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
                    category: true,
                    code: true,
                    name: true,
                    rackHardwareCode: true,
                    capacity: true,
                    volume: true,
                    ownerDept: true,
                    creator: true,
                    createdAt: true,
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

      {/* Delete Confirmation Modal */}
      {deleteTargetIds && deleteTargetIds.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs shadow-xl w-full max-w-[400px] border border-[#E5E9F0]">
            <div className="px-4 py-3 border-b border-[#E8EDF4] flex items-center justify-between">
              <span className="font-medium text-[14px] text-[#1E293B]">删除确认</span>
              <button
                type="button"
                onClick={() => setDeleteTargetIds(null)}
                className="text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-[13px] text-[#475569]">
              确定要删除选中的{' '}
              <span className="font-semibold text-[#1E293B]">
                {deleteTargetIds.length}
              </span>{' '}
              条仓库/区域记录（含其下级子区域）吗？删除后将无法恢复。
            </div>
            <div className="px-4 py-2.5 border-t border-[#E8EDF4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetIds(null)}
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

      {/* Slide-Over Drawer for 新增仓库 / 新增子区域 / 修改 / 查看 */}
      {drawerOpen && formState && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
          <div className="w-full max-w-[780px] h-full bg-white shadow-2xl flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E8EDF4] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-[15px] font-medium text-[#1E293B]">{drawerTitle}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    组织机构
                  </label>
                  <select
                    value={formState.org}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      setFormState({ ...formState, org: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  >
                    {ORG_OPTIONS.map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    仓库类别
                  </label>
                  <input
                    type="text"
                    value={formState.level}
                    disabled
                    className="flex-1 h-[32px] px-2.5 text-[13px] bg-[#F5F5F5] text-[#64748B] border border-[#E2E8F0] rounded-xs cursor-not-allowed"
                  />
                </div>

                {parentNodeForForm && (
                  <div className="flex items-center gap-2.5 md:col-span-2">
                    <label className="w-[100px] text-right text-[#475569] shrink-0">
                      上级区域
                    </label>
                    <input
                      type="text"
                      value={`${parentNodeForForm.name} (${parentNodeForForm.code})`}
                      disabled
                      className="flex-1 h-[32px] px-2.5 text-[13px] bg-[#F5F5F5] text-[#64748B] border border-[#E2E8F0] rounded-xs cursor-not-allowed"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    <span className="text-[#FF4D4F] mr-1">*</span>编码
                  </label>
                  <input
                    type="text"
                    value={formState.code}
                    disabled={isReadOnly}
                    placeholder="请输入编码"
                    onChange={(e) =>
                      setFormState({ ...formState, code: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    <span className="text-[#FF4D4F] mr-1">*</span>名称
                  </label>
                  <input
                    type="text"
                    value={formState.name}
                    disabled={isReadOnly}
                    placeholder="请输入名称"
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    类别 / 类型
                  </label>
                  <select
                    value={formState.category}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      setFormState({ ...formState, category: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  >
                    {Array.from(
                      new Set([...WAREHOUSE_TYPE_OPTIONS, '库区', '库位'])
                    ).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    货架类别
                  </label>
                  <select
                    value={formState.rackCategory}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      setFormState({ ...formState, rackCategory: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  >
                    <option value="">请选择</option>
                    {RACK_CATEGORY_OPTIONS.map((rc) => (
                      <option key={rc} value={rc}>
                        {rc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    货架硬体编码
                  </label>
                  <input
                    type="text"
                    value={formState.rackHardwareCode}
                    disabled={isReadOnly}
                    placeholder="请输入"
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        rackHardwareCode: e.target.value,
                      })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    货架服务IP
                  </label>
                  <input
                    type="text"
                    value={formState.rackServiceIp}
                    disabled={isReadOnly}
                    placeholder="请输入"
                    onChange={(e) =>
                      setFormState({ ...formState, rackServiceIp: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    容量
                  </label>
                  <input
                    type="text"
                    value={formState.capacity}
                    disabled={isReadOnly}
                    placeholder="请输入"
                    onChange={(e) =>
                      setFormState({ ...formState, capacity: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    容积
                  </label>
                  <input
                    type="text"
                    value={formState.volume}
                    disabled={isReadOnly}
                    placeholder="请输入"
                    onChange={(e) =>
                      setFormState({ ...formState, volume: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] font-mono border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    货位归属部门
                  </label>
                  <input
                    type="text"
                    value={formState.ownerDept}
                    disabled={isReadOnly}
                    placeholder="请输入"
                    onChange={(e) =>
                      setFormState({ ...formState, ownerDept: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="w-[100px] text-right text-[#475569] shrink-0">
                    创建人
                  </label>
                  <input
                    type="text"
                    value={formState.creator}
                    disabled={isReadOnly}
                    placeholder="请输入"
                    onChange={(e) =>
                      setFormState({ ...formState, creator: e.target.value })
                    }
                    className={`flex-1 h-[32px] px-2.5 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>

                <div className="flex items-start gap-2.5 md:col-span-2">
                  <label className="w-[100px] pt-1.5 text-right text-[#475569] shrink-0">
                    备注
                  </label>
                  <textarea
                    rows={3}
                    value={formState.remark}
                    disabled={isReadOnly}
                    placeholder="请输入备注"
                    onChange={(e) =>
                      setFormState({ ...formState, remark: e.target.value })
                    }
                    className={`flex-1 px-2.5 py-2 text-[13px] border border-[#D9D9D9] rounded-xs focus:outline-none focus:border-[#1890FF] ${
                      isReadOnly ? 'bg-[#F5F5F5] text-[#64748B]' : 'bg-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E8EDF4] bg-white flex items-center justify-end gap-2.5 shrink-0">
              {isReadOnly ? (
                <button
                  type="button"
                  onClick={() => setDrawerMode('edit')}
                  className="h-[32px] px-4 text-[13px] bg-[#1890FF] text-white rounded-xs hover:bg-[#096DD9] cursor-pointer"
                >
                  修改
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  className="h-[32px] px-4 text-[13px] bg-[#1890FF] text-white rounded-xs hover:bg-[#096DD9] cursor-pointer"
                >
                  保存并退出
                </button>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-[32px] px-4 text-[13px] bg-white border border-[#D9D9D9] text-[#475569] rounded-xs hover:border-[#1890FF] hover:text-[#1890FF] cursor-pointer"
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
