import React, { useState, useMemo, useRef } from 'react';
import {
  GitBranch,
  Search,
  RotateCcw,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  ArrowUpDown,
  Eye,
  Edit3,
  AlertTriangle,
  Pin,
  Inbox,
  Upload,
} from 'lucide-react';

interface ProcessInfoTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

export interface ProcessParamItem {
  id: string;
  code: string;
  name: string;
  type: '文本' | '数值' | '布尔' | '枚举';
  note: string;
}

export interface ProcessInfoItem {
  id: string;
  org: string;
  code: string;
  name: string;
  stage: string;
  type: string;
  desc: string;
  allowTestTimes: string;
  imageUrl?: string;
  createBy: string;
  createTime: string;
  modBy: string;
  modTime: string;
  category: string;
  params: ProcessParamItem[];
}

interface ColumnConfig {
  key: keyof ProcessInfoItem;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
  align?: 'left' | 'right';
  sortable?: boolean;
}

const PROCESS_CATEGORIES = [
  'ALL',
  '普通工序',
  '测试工序',
  '维修工序',
  '包装工序',
  '组立工序',
  '贴片工序',
  '烧录工序',
];

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'org', label: '组织机构', visible: true },
  { key: 'code', label: '工序编码', visible: true, highlight: true, pinned: true, sortable: true },
  { key: 'name', label: '工序名称', visible: true, highlight: true, pinned: true, sortable: true },
  { key: 'stage', label: '生产阶段', visible: true },
  { key: 'type', label: '工序类型', visible: true },
  { key: 'desc', label: '工序描述', visible: true },
  { key: 'allowTestTimes', label: '允许测试次数', visible: true, align: 'right' },
  { key: 'createBy', label: '创建人', visible: true },
  { key: 'createTime', label: '创建时间', visible: true, sortable: true },
  { key: 'modBy', label: '修改人', visible: true },
  { key: 'modTime', label: '修改时间', visible: true, sortable: true },
];

const INITIAL_PROCESS_ROWS: ProcessInfoItem[] = [
  {
    id: 'proc-01',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-23',
    name: '包装',
    stage: '其他',
    type: '普通工序',
    desc: '包装工序',
    allowTestTimes: '',
    createBy: '李元龙',
    createTime: '2026-08-26 16:47:30',
    modBy: '',
    modTime: '',
    category: '包装工序',
    params: [
      { id: 'prm-1', code: 'PACK_SPEC', name: '码垛规格', type: '文本', note: '按客户托盘标准' },
    ],
  },
  {
    id: 'proc-02',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-22',
    name: '边缘补涂',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '李元龙',
    createTime: '2026-08-26 16:42:23',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-03',
    org: '昇兴集团-中山制罐工厂',
    code: 'REWORK-01',
    name: '返工工序1',
    stage: '其他',
    type: '普通工序',
    desc: '返工处理',
    allowTestTimes: '',
    createBy: '王雷鸣',
    createTime: '2025-04-13 11:39:15',
    modBy: '',
    modTime: '',
    category: '维修工序',
    params: [],
  },
  {
    id: 'proc-04',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-21',
    name: '制罐D线工序',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-12-09 13:21:54',
    modBy: '曹雨林',
    modTime: '2024-12-09 13:24:50',
    category: '组立工序',
    params: [],
  },
  {
    id: 'proc-05',
    org: '昇兴集团-中山制罐工厂',
    code: '105001-02',
    name: '制罐A工序产出',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '刘海龙',
    createTime: '2024-12-01 14:09:00',
    modBy: '',
    modTime: '',
    category: '组立工序',
    params: [],
  },
  {
    id: 'proc-06',
    org: '昇兴集团-中山制罐工厂',
    code: '105001-01',
    name: '制罐工序',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '刘海龙',
    createTime: '2024-12-01 14:04:36',
    modBy: '刘海龙',
    modTime: '2025-01-17 17:53:32',
    category: '组立工序',
    params: [],
  },
  {
    id: 'proc-07',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-20',
    name: 'E线维修站',
    stage: '其他',
    type: '维修工序',
    desc: 'E线维修',
    allowTestTimes: '3',
    createBy: '刘海龙',
    createTime: '2024-11-30 16:10:53',
    modBy: '',
    modTime: '',
    category: '维修工序',
    params: [
      { id: 'prm-2', code: 'REPAIR_LIMIT', name: '返修次数上限', type: '数值', note: '单罐最多返修3次' },
    ],
  },
  {
    id: 'proc-08',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-18',
    name: '打包机',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:58:37',
    modBy: '',
    modTime: '',
    category: '包装工序',
    params: [],
  },
  {
    id: 'proc-09',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-17',
    name: '收罐台',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:57:01',
    modBy: '林鹏1',
    modTime: '2025-01-05 11:08:20',
    category: '组立工序',
    params: [],
  },
  {
    id: 'proc-10',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-16',
    name: 'S型提升机',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:56:28',
    modBy: '',
    modTime: '',
    category: '组立工序',
    params: [],
  },
  {
    id: 'proc-11',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-15',
    name: '光检机',
    stage: '其他',
    type: '普通工序',
    desc: '外观检测',
    allowTestTimes: '2',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:55:48',
    modBy: '潘垚尧',
    modTime: '2025-01-03 14:31:38',
    category: '测试工序',
    params: [
      { id: 'prm-3', code: 'VISION_SENS', name: '视觉检测灵敏度', type: '数值', note: '标准阈值 92%' },
    ],
  },
  {
    id: 'proc-12',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-14',
    name: '罐内检测仪',
    stage: '其他',
    type: '普通工序',
    desc: '罐内检测',
    allowTestTimes: '2',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:54:35',
    modBy: '',
    modTime: '',
    category: '测试工序',
    params: [],
  },
  {
    id: 'proc-13',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-13',
    name: '大烘炉',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:53:43',
    modBy: '林鹏',
    modTime: '2025-02-07 14:17:40',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-14',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-12',
    name: '内全喷机',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:52:19',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-15',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-11',
    name: '提升机',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:52:19',
    modBy: '',
    modTime: '',
    category: '组立工序',
    params: [],
  },
  {
    id: 'proc-16',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-10',
    name: '底盖检测仪',
    stage: '其他',
    type: '普通工序',
    desc: '底盖检测',
    allowTestTimes: '1',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:51:53',
    modBy: '',
    modTime: '',
    category: '测试工序',
    params: [],
  },
  {
    id: 'proc-17',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-09',
    name: '检漏机',
    stage: '其他',
    type: '普通工序',
    desc: '密封检测',
    allowTestTimes: '2',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:51:09',
    modBy: '',
    modTime: '',
    category: '测试工序',
    params: [],
  },
  {
    id: 'proc-18',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-08',
    name: '封口机',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:50:33',
    modBy: '林鹏',
    modTime: '2025-04-17 18:46:40',
    category: '包装工序',
    params: [],
  },
  {
    id: 'proc-19',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-07',
    name: '自动加盖机',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:49:46',
    modBy: '',
    modTime: '',
    category: '包装工序',
    params: [],
  },
  {
    id: 'proc-20',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-06',
    name: '缩颈机',
    stage: '其他',
    type: '普通工序',
    desc: '',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:48:52',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-21',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-05',
    name: '翻边机',
    stage: '制罐',
    type: '普通工序',
    desc: '罐口翻边整形',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:47:15',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-22',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-04',
    name: '滚筋机',
    stage: '制罐',
    type: '普通工序',
    desc: '加强筋成型',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:46:02',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-23',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-03',
    name: '补涂烘房',
    stage: '制罐',
    type: '普通工序',
    desc: '焊缝补涂固化',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:44:30',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-24',
    org: '昇兴集团-中山制罐工厂',
    code: '101004-02',
    name: '高频焊机',
    stage: '制罐',
    type: '普通工序',
    desc: '罐身电阻缝焊',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:43:11',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
  {
    id: 'proc-25',
    org: '昇兴集团-成都制罐工厂',
    code: '101004-01',
    name: '纵横剪板机',
    stage: '制罐',
    type: '普通工序',
    desc: '马口铁分条裁剪',
    allowTestTimes: '',
    createBy: '曹雨林',
    createTime: '2024-11-18 10:41:08',
    modBy: '',
    modTime: '',
    category: '普通工序',
    params: [],
  },
];

export const ProcessInfoTab: React.FC<ProcessInfoTabProps> = ({ onShowToast }) => {
  const [rows, setRows] = useState<ProcessInfoItem[]>(INITIAL_PROCESS_ROWS);

  // Filter state
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [nameOp, setNameOp] = useState<MatchOp>('contains');
  const [nameFilter, setNameFilter] = useState('');
  const [stageOp, setStageOp] = useState<MatchOp>('contains');
  const [stageFilter, setStageFilter] = useState('请选择');
  const [curCat, setCurCat] = useState('ALL');

  const [appliedFilters, setAppliedFilters] = useState({
    org: '请选择',
    nameOp: 'contains' as MatchOp,
    name: '',
    stageOp: 'contains' as MatchOp,
    stage: '请选择',
    category: 'ALL',
  });

  // Table selection, sorting, pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessInfoItem | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('');

  // Column settings (F4)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // F2 查看弹窗
  const [viewItem, setViewItem] = useState<ProcessInfoItem | null>(null);
  const [viewActiveTab, setViewActiveTab] = useState<'base' | 'param'>('base');

  // F3 新增/修改弹窗
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editActiveTab, setEditActiveTab] = useState<'base' | 'param'>('base');
  const [form, setForm] = useState({
    org: '昇兴集团-中山制罐工厂',
    code: '',
    name: '',
    stage: '',
    type: '',
    desc: '',
    allowTestTimes: '',
    imageUrl: '',
  });
  const [formErrors, setFormErrors] = useState<{
    code?: boolean;
    name?: boolean;
    stage?: boolean;
    type?: boolean;
  }>({});
  const [paramRows, setParamRows] = useState<ProcessParamItem[]>([]);
  const [selectedParamIds, setSelectedParamIds] = useState<string[]>([]);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

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

  // Filtering
  const filteredRows = useMemo(() => {
    const matchStr = (val: string, filter: string, op: MatchOp) => {
      if (!filter.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = filter.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };

    return rows.filter((r) => {
      if (appliedFilters.org !== '请选择' && r.org !== appliedFilters.org) return false;
      if (!matchStr(r.name, appliedFilters.name, appliedFilters.nameOp)) return false;
      if (appliedFilters.stage !== '请选择') {
        if (!matchStr(r.stage, appliedFilters.stage, appliedFilters.stageOp)) return false;
      }
      if (appliedFilters.category !== 'ALL') {
        if (appliedFilters.category === '普通工序') {
          if (r.type !== '普通工序') return false;
        } else if (r.category !== appliedFilters.category && r.type !== appliedFilters.category) {
          return false;
        }
      }
      return true;
    });
  }, [rows, appliedFilters]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredRows;
    const key = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const av = String(a[key] ?? '');
      const bv = String(b[key] ?? '');
      return av.localeCompare(bv, 'zh-CN') * dir;
    });
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const visibleColumns = columns.filter((c) => c.visible);

  const handleQuery = () => {
    setAppliedFilters({
      org: orgFilter,
      nameOp,
      name: nameFilter,
      stageOp,
      stage: stageFilter,
      category: curCat,
    });
    setCurrentPage(1);
    onShowToast('查询完成，已应用筛选条件', 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setNameOp('contains');
    setNameFilter('');
    setStageOp('contains');
    setStageFilter('请选择');
    setCurCat('ALL');
    setAppliedFilters({
      org: '请选择',
      nameOp: 'contains',
      name: '',
      stageOp: 'contains',
      stage: '请选择',
      category: 'ALL',
    });
    setSelectedIds([]);
    setCurrentPage(1);
    onShowToast('已重置筛选条件', 'info');
  };

  const handleCategoryClick = (cat: string) => {
    setCurCat(cat);
    setAppliedFilters((prev) => ({ ...prev, category: cat }));
    setSelectedIds([]);
    setCurrentPage(1);
  };

  const toggleSort = (key: keyof ProcessInfoItem) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return { key: null, dir: null };
    });
  };

  const allPagedSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allPagedSelected) {
      const pageSet = new Set(pagedRows.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !pageSet.has(id)));
    } else {
      const next = new Set([...selectedIds, ...pagedRows.map((r) => r.id)]);
      setSelectedIds(Array.from(next));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // F2 View Modal
  const openViewModal = (row: ProcessInfoItem) => {
    setViewItem(row);
    setViewActiveTab('base');
  };

  // F3 Edit / Add Modal
  const openEditModal = (mode: 'add' | 'edit', row?: ProcessInfoItem) => {
    setEditMode(mode);
    setEditActiveTab('base');
    setFormErrors({});
    setSelectedParamIds([]);
    if (mode === 'add') {
      setEditingId(null);
      setForm({
        org: '昇兴集团-中山制罐工厂',
        code: '',
        name: '',
        stage: '',
        type: '',
        desc: '',
        allowTestTimes: '',
        imageUrl: '',
      });
      setParamRows([]);
    } else if (row) {
      setEditingId(row.id);
      setForm({
        org: row.org,
        code: row.code,
        name: row.name,
        stage: row.stage,
        type: row.category || row.type,
        desc: row.desc,
        allowTestTimes: row.allowTestTimes,
        imageUrl: row.imageUrl || '',
      });
      setParamRows(row.params ? row.params.map((p) => ({ ...p })) : []);
    }
    setIsEditModalOpen(true);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      onShowToast('图片大小超过 10MB 限制', 'error');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = typeof ev.target?.result === 'string' ? ev.target.result : '';
      if (url) {
        setForm((prev) => ({ ...prev, imageUrl: url }));
        onShowToast('图片已选择（本地预览）', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProcess = (closeAfter: boolean) => {
    const errs = {
      code: !form.code.trim(),
      name: !form.name.trim(),
      stage: !form.stage.trim(),
      type: !form.type.trim(),
    };
    if (errs.code || errs.name || errs.stage || errs.type) {
      setFormErrors(errs);
      setEditActiveTab('base');
      onShowToast('请填写完整必填项（工序编码、工序名称、生产阶段、工序类别）', 'error');
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const mappedType = form.type === '维修工序' ? '维修工序' : '普通工序';

    if (editMode === 'add') {
      const newId = `proc-${Date.now()}`;
      const newItem: ProcessInfoItem = {
        id: newId,
        org: form.org,
        code: form.code.trim(),
        name: form.name.trim(),
        stage: form.stage,
        type: mappedType,
        desc: form.desc.trim(),
        allowTestTimes: form.allowTestTimes.trim(),
        imageUrl: form.imageUrl,
        createBy: '系统管理员',
        createTime: nowStr,
        modBy: '',
        modTime: '',
        category: form.type,
        params: paramRows.map((p) => ({ ...p })),
      };
      setRows((prev) => [newItem, ...prev]);
      onShowToast(`工序「${newItem.code}」新增成功`, 'success');
      if (!closeAfter) {
        setEditMode('edit');
        setEditingId(newId);
      } else {
        setIsEditModalOpen(false);
      }
    } else if (editingId) {
      setRows((prev) =>
        prev.map((item) => {
          if (item.id !== editingId) return item;
          return {
            ...item,
            org: form.org,
            name: form.name.trim(),
            stage: form.stage,
            type: mappedType,
            desc: form.desc.trim(),
            allowTestTimes: form.allowTestTimes.trim(),
            imageUrl: form.imageUrl,
            modBy: '系统管理员',
            modTime: nowStr,
            category: form.type,
            params: paramRows.map((p) => ({ ...p })),
          };
        })
      );
      onShowToast(`工序「${form.code}」信息已更新`, 'success');
      if (closeAfter) {
        setIsEditModalOpen(false);
      }
    }
  };

  const handleDeleteRow = (row: ProcessInfoItem) => {
    setConfirmState({
      isOpen: true,
      title: '删除工序',
      desc: `确定要删除工序「${row.code} · ${row.name}」吗？删除后不可恢复。`,
      onConfirm: () => {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        setSelectedIds((prev) => prev.filter((id) => id !== row.id));
        onShowToast(`已删除工序 ${row.code}`, 'success');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先选择要删除的工序', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      desc: `确定要删除选中的 ${selectedIds.length} 条工序吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setSelectedIds([]);
        onShowToast(`已批量删除 ${delSet.size} 条工序`, 'success');
      },
    });
  };

  // Param rows inside F3
  const handleAddParamRow = () => {
    setParamRows((prev) => [
      ...prev,
      {
        id: `prm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: '',
        name: '',
        type: '文本',
        note: '',
      },
    ]);
    onShowToast('已添加一行参数', 'info');
  };

  const handleDeleteParams = () => {
    if (selectedParamIds.length === 0) {
      onShowToast('请先勾选要删除的参数', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '删除参数',
      desc: `确定删除选中的 ${selectedParamIds.length} 项参数吗？删除会影响已配置该参数的工艺流程。`,
      onConfirm: () => {
        const delSet = new Set(selectedParamIds);
        setParamRows((prev) => prev.filter((p) => !delSet.has(p.id)));
        setSelectedParamIds([]);
        onShowToast(`已删除 ${delSet.size} 项参数`, 'success');
      },
    });
  };

  const allParamsSelected =
    paramRows.length > 0 && paramRows.every((p) => selectedParamIds.includes(p.id));

  const handleJumpPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const p = parseInt(jumpInput, 10);
    if (!Number.isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpInput('');
    } else {
      onShowToast(`请输入 1 ~ ${totalPages} 之间的页码`, 'warning');
    }
  };

  return (
    <div className="space-y-4 relative text-xs text-[#1E293B]">
      {/* P1 Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3">
        {/* Top Row: Title + Org + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工序信息</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">组织机构</label>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="请选择">请选择</option>
                <option value="昇兴集团-中山制罐工厂">昇兴集团-中山制罐工厂</option>
                <option value="昇兴集团-成都制罐工厂">昇兴集团-成都制罐工厂</option>
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

        {/* 工序类别 Quick Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[#1E40AF] font-medium w-16 text-right shrink-0">工序类别</span>
          <div className="flex flex-wrap items-center gap-1 bg-[#F4F6F9] p-0.5 rounded-lg border border-[#E5E9F0]">
            {PROCESS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-3 py-1 rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                  curCat === cat
                    ? 'bg-[#165DFF] text-white font-medium'
                    : 'text-[#1E40AF] hover:bg-[#EBF2FF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Filter Inputs */}
        {!filterCollapsed && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-1 pl-1">
            {/* 工序名称 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium w-16 text-right">工序名称</label>
              <select
                value={nameOp}
                onChange={(e) => setNameOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请输入"
                  className="h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-40 outline-none focus:border-[#2563EB]"
                />
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 生产阶段 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium w-16 text-right">生产阶段</label>
              <select
                value={stageOp}
                onChange={(e) => setStageOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-36 outline-none cursor-pointer"
              >
                <option value="请选择">请选择</option>
                <option value="其他">其他</option>
                <option value="制罐">制罐</option>
                <option value="包装">包装</option>
              </select>
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
              已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedIds.length}</strong> 项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条工序
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => openEditModal('add')}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className={`h-8 px-3.5 border rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                selectedIds.length === 0
                  ? 'border-[#EA580C]/40 bg-white text-[#EA580C]/70 hover:bg-[#EA580C]/5'
                  : 'border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10'
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
                    onClick={() => col.sortable && toggleSort(col.key)}
                    className={`p-2.5 border-b border-r border-[#E5E9F0] select-none transition ${
                      col.sortable ? 'cursor-pointer hover:bg-[#EDF2F7]/70' : ''
                    } ${col.align === 'right' ? 'text-right' : 'text-left'} ${
                      col.highlight ? 'bg-blue-50/70 text-blue-700' : ''
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            sortConfig.key === col.key
                              ? 'text-[#1E40AF]'
                              : col.highlight
                              ? 'text-blue-400'
                              : 'text-[#C5C8BE]'
                          }`}
                        />
                      )}
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
              {pagedRows.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('input')) return;
                      toggleSelectRow(row.id);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EBF2FF]/60 hover:bg-[#EBF2FF]/80' : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    {visibleColumns.map((col, idx) => {
                      const rawVal = row[col.key];
                      const displayVal =
                        rawVal === undefined || rawVal === '' ? '' : String(rawVal);

                      return (
                        <td
                          key={`${row.id}-${String(col.key)}-${idx}`}
                          className={`p-2.5 border-r border-[#EDF2F7] ${
                            col.align === 'right' ? 'text-right font-mono tabular-nums' : 'text-left'
                          } ${col.highlight ? 'bg-blue-50/20 font-medium' : ''}`}
                        >
                          {col.key === 'code' ? (
                            <button
                              type="button"
                              onClick={() => openViewModal(row)}
                              className="font-mono font-bold text-[#1E40AF] hover:text-[#165DFF] hover:underline cursor-pointer"
                            >
                              {displayVal}
                            </button>
                          ) : col.key === 'type' ? (
                            <span
                              className={`inline-block rounded px-2.5 py-0.5 text-[11px] font-medium text-white leading-tight ${
                                displayVal === '维修工序' ? 'bg-[#F5B400]' : 'bg-[#FF8C50]'
                              }`}
                            >
                              {displayVal}
                            </span>
                          ) : (
                            <span
                              className={
                                displayVal
                                  ? col.highlight
                                    ? 'text-[#1E293B] font-semibold'
                                    : 'text-[#1E293B]'
                                  : 'text-[#C5C8BE]'
                              }
                            >
                              {displayVal || ''}
                            </span>
                          )}
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
                          onClick={() => openViewModal(row)}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          查看
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal('edit', row)}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
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
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pagedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
                    className="py-12 text-center text-[#64748B]"
                  >
                    <div className="space-y-2">
                      <p>该工序类别下暂无数据</p>
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
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条
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
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 border rounded-lg font-mono flex items-center justify-center transition cursor-pointer ${
                  safePage === pageNum
                    ? 'border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                    : 'border-[#E5E9F0] bg-white text-[#1E40AF] hover:border-[#2563EB]'
                }`}
              >
                {pageNum}
              </button>
            ))}
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
            <option value={10}>10 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <span>跳至</span>
            <input
              type="text"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={handleJumpPage}
              className="w-11 h-7 px-1.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] text-center font-mono outline-none focus:border-[#2563EB]"
            />
            <span>页</span>
          </div>
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
                  <span className={`text-[10px] select-none ${col.highlight ? 'text-blue-500' : 'text-[#64748B]'}`}>
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
                恢复默认
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

      {/* F2 查看-工序信息弹窗 */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewItem(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">查看-工序信息</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 border-b border-[#EDF2F7] flex gap-6 bg-[#FFFFFF] shrink-0">
              <button
                type="button"
                onClick={() => setViewActiveTab('base')}
                className={`py-2.5 text-xs border-b-2 transition cursor-pointer ${
                  viewActiveTab === 'base'
                    ? 'border-[#165DFF] text-[#165DFF] font-semibold'
                    : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                基本信息
              </button>
              <button
                type="button"
                onClick={() => setViewActiveTab('param')}
                className={`py-2.5 text-xs border-b-2 transition cursor-pointer ${
                  viewActiveTab === 'param'
                    ? 'border-[#165DFF] text-[#165DFF] font-semibold'
                    : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                工序参数
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs">
              {viewActiveTab === 'base' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">工序编码</label>
                      <input
                        readOnly
                        value={viewItem.code}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">工序名称</label>
                      <input
                        readOnly
                        value={viewItem.name}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">生产阶段</label>
                      <input
                        readOnly
                        value={viewItem.stage || '—'}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">工序类别</label>
                      <input
                        readOnly
                        value={viewItem.category || viewItem.type}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[#64748B]">工序描述</label>
                      <textarea
                        readOnly
                        value={viewItem.desc || '—'}
                        rows={2}
                        className="px-3 py-2 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] outline-none resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[#64748B]">上传图片</label>
                      <div className="w-24 h-24 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] flex items-center justify-center text-[#94A3B8] overflow-hidden">
                        {viewItem.imageUrl ? (
                          <img src={viewItem.imageUrl} alt="工序图片" className="w-full h-full object-cover" />
                        ) : (
                          <span>暂无图片</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dashed border-[#E5E9F0] grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">组织机构</label>
                      <input
                        readOnly
                        value={viewItem.org}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">允许测试次数</label>
                      <input
                        readOnly
                        value={viewItem.allowTestTimes || '—'}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">创建人</label>
                      <input
                        readOnly
                        value={viewItem.createBy}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">创建时间</label>
                      <input
                        readOnly
                        value={viewItem.createTime}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">修改人</label>
                      <input
                        readOnly
                        value={viewItem.modBy || '—'}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#64748B]">修改时间</label>
                      <input
                        readOnly
                        value={viewItem.modTime || '—'}
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-[#F4F6F9] text-[#64748B] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[#EA580C] font-medium">
                    注:此配置用于工艺流程条件为特殊参数的情况，删除会影响到工艺已经配置好的参数配置
                  </p>
                  <div className="border border-[#E5E9F0] rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold">
                        <tr>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                            <input type="checkbox" disabled className="w-3.5 h-3.5" />
                          </th>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0]">参数编码</th>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0]">参数名称</th>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0]">参数类型</th>
                          <th className="p-2.5 border-b border-[#E5E9F0]">备注</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF2F7]">
                        {viewItem.params.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                              <Inbox className="w-8 h-8 mx-auto mb-1.5 text-[#CBD5E1]" />
                              <span>暂无数据</span>
                            </td>
                          </tr>
                        ) : (
                          viewItem.params.map((p) => (
                            <tr key={p.id}>
                              <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                                <input type="checkbox" disabled className="w-3.5 h-3.5" />
                              </td>
                              <td className="p-2.5 border-r border-[#EDF2F7] font-mono">{p.code || '—'}</td>
                              <td className="p-2.5 border-r border-[#EDF2F7]">{p.name || '—'}</td>
                              <td className="p-2.5 border-r border-[#EDF2F7]">{p.type}</td>
                              <td className="p-2.5">{p.note || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F3 新增/修改-工序信息弹窗 */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {editMode === 'add' ? '+新增-工序信息' : '+修改-工序信息'}
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

            {/* Modal Tabs */}
            <div className="px-5 border-b border-[#EDF2F7] flex gap-6 bg-[#FFFFFF] shrink-0">
              <button
                type="button"
                onClick={() => setEditActiveTab('base')}
                className={`py-2.5 text-xs border-b-2 transition cursor-pointer ${
                  editActiveTab === 'base'
                    ? 'border-[#165DFF] text-[#165DFF] font-semibold'
                    : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                基本信息
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('param')}
                className={`py-2.5 text-xs border-b-2 transition cursor-pointer ${
                  editActiveTab === 'param'
                    ? 'border-[#165DFF] text-[#165DFF] font-semibold'
                    : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                工序参数
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs">
              {editActiveTab === 'base' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#1E40AF] font-medium">
                        <span className="text-[#EA580C] mr-0.5">*</span>工序编码
                      </label>
                      <input
                        type="text"
                        readOnly={editMode === 'edit'}
                        value={form.code}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, code: e.target.value }));
                          if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, code: false }));
                        }}
                        placeholder="请输入"
                        className={`h-8 px-3 border rounded-lg font-mono outline-none ${
                          editMode === 'edit'
                            ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                            : formErrors.code
                            ? 'bg-white border-[#EA580C]'
                            : 'bg-white border-[#E5E9F0] focus:border-[#2563EB]'
                        }`}
                      />
                      {formErrors.code && (
                        <span className="text-[11px] text-[#EA580C]">请输入工序编码</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[#1E40AF] font-medium">
                        <span className="text-[#EA580C] mr-0.5">*</span>工序名称
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, name: e.target.value }));
                          if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, name: false }));
                        }}
                        placeholder="请输入"
                        className={`h-8 px-3 border rounded-lg bg-white outline-none ${
                          formErrors.name
                            ? 'border-[#EA580C]'
                            : 'border-[#E5E9F0] focus:border-[#2563EB]'
                        }`}
                      />
                      {formErrors.name && (
                        <span className="text-[11px] text-[#EA580C]">请输入工序名称</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[#1E40AF] font-medium">
                        <span className="text-[#EA580C] mr-0.5">*</span>生产阶段
                      </label>
                      <select
                        value={form.stage}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, stage: e.target.value }));
                          if (e.target.value) setFormErrors((prev) => ({ ...prev, stage: false }));
                        }}
                        className={`h-8 px-2.5 border rounded-lg bg-white outline-none cursor-pointer ${
                          formErrors.stage
                            ? 'border-[#EA580C]'
                            : 'border-[#E5E9F0] focus:border-[#2563EB]'
                        }`}
                      >
                        <option value="">请选择</option>
                        <option value="其他">其他</option>
                        <option value="制罐">制罐</option>
                        <option value="包装">包装</option>
                      </select>
                      {formErrors.stage && (
                        <span className="text-[11px] text-[#EA580C]">请选择生产阶段</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[#1E40AF] font-medium">
                        <span className="text-[#EA580C] mr-0.5">*</span>工序类别
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, type: e.target.value }));
                          if (e.target.value) setFormErrors((prev) => ({ ...prev, type: false }));
                        }}
                        className={`h-8 px-2.5 border rounded-lg bg-white outline-none cursor-pointer ${
                          formErrors.type
                            ? 'border-[#EA580C]'
                            : 'border-[#E5E9F0] focus:border-[#2563EB]'
                        }`}
                      >
                        <option value="">请选择</option>
                        {PROCESS_CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {formErrors.type && (
                        <span className="text-[11px] text-[#EA580C]">请选择工序类别</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[#1E40AF] font-medium">工序描述</label>
                      <textarea
                        value={form.desc}
                        maxLength={80}
                        onChange={(e) => setForm((prev) => ({ ...prev, desc: e.target.value }))}
                        placeholder="请输入"
                        rows={3}
                        className="px-3 py-2 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB] resize-y"
                      />
                      <div
                        className={`text-right text-[11px] font-mono ${
                          form.desc.length >= 80 ? 'text-[#EA580C]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {form.desc.length} / 80
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[#1E40AF] font-medium">上传图片</label>
                      <div className="flex items-start gap-4">
                        <div
                          onClick={() => uploadInputRef.current?.click()}
                          title="点击上传图片"
                          className="w-24 h-24 shrink-0 border border-dashed border-[#CBD5E1] rounded-lg flex items-center justify-center cursor-pointer bg-white hover:border-[#165DFF] hover:text-[#165DFF] text-[#94A3B8] relative overflow-hidden transition"
                        >
                          {form.imageUrl ? (
                            <>
                              <img
                                src={form.imageUrl}
                                alt="预览"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm((prev) => ({ ...prev, imageUrl: '' }));
                                  if (uploadInputRef.current) uploadInputRef.current.value = '';
                                }}
                                title="移除图片"
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="w-5 h-5" />
                              <span className="text-[11px]">点击上传</span>
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748B] leading-relaxed pt-1">
                          <div>图片大小限制：10MB</div>
                          <div>最大图片数：1</div>
                          <div>图片支持格式：.jpg、.png、.jpeg、.bmp、.gif、.tif</div>
                        </div>
                        <input
                          ref={uploadInputRef}
                          type="file"
                          accept=".jpg,.png,.jpeg,.bmp,.gif,.tif"
                          onChange={handleUploadImage}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dashed border-[#E5E9F0] grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#1E40AF] font-medium">组织机构</label>
                      <select
                        value={form.org}
                        onChange={(e) => setForm((prev) => ({ ...prev, org: e.target.value }))}
                        className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white outline-none cursor-pointer"
                      >
                        <option value="昇兴集团-中山制罐工厂">昇兴集团-中山制罐工厂</option>
                        <option value="昇兴集团-成都制罐工厂">昇兴集团-成都制罐工厂</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#1E40AF] font-medium">允许测试次数</label>
                      <input
                        type="number"
                        min={0}
                        value={form.allowTestTimes}
                        onChange={(e) => setForm((prev) => ({ ...prev, allowTestTimes: e.target.value }))}
                        placeholder="请输入整数"
                        className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white font-mono outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[#EA580C] font-medium">
                    注:此配置用于工艺流程条件为特殊参数的情况，删除会影响到工艺已经配置好的参数配置
                  </p>
                  <div className="border border-[#E5E9F0] rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold">
                        <tr>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                            <input
                              type="checkbox"
                              checked={allParamsSelected}
                              onChange={(e) =>
                                setSelectedParamIds(
                                  e.target.checked ? paramRows.map((p) => p.id) : []
                                )
                              }
                              className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                            />
                          </th>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0]">参数编码</th>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0]">参数名称</th>
                          <th className="p-2.5 border-b border-r border-[#E5E9F0]">参数类型</th>
                          <th className="p-2.5 border-b border-[#E5E9F0]">备注</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF2F7]">
                        {paramRows.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                              <Inbox className="w-8 h-8 mx-auto mb-1.5 text-[#CBD5E1]" />
                              <span>暂无数据</span>
                            </td>
                          </tr>
                        ) : (
                          paramRows.map((p) => {
                            const checked = selectedParamIds.includes(p.id);
                            return (
                              <tr key={p.id}>
                                <td className="p-2 border-r border-[#EDF2F7] text-center">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      setSelectedParamIds((prev) =>
                                        prev.includes(p.id)
                                          ? prev.filter((id) => id !== p.id)
                                          : [...prev, p.id]
                                      )
                                    }
                                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                                  />
                                </td>
                                <td className="p-2 border-r border-[#EDF2F7]">
                                  <input
                                    type="text"
                                    value={p.code}
                                    onChange={(e) =>
                                      setParamRows((prev) =>
                                        prev.map((x) =>
                                          x.id === p.id ? { ...x, code: e.target.value } : x
                                        )
                                      )
                                    }
                                    placeholder="请输入"
                                    className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white font-mono outline-none focus:border-[#2563EB]"
                                  />
                                </td>
                                <td className="p-2 border-r border-[#EDF2F7]">
                                  <input
                                    type="text"
                                    value={p.name}
                                    onChange={(e) =>
                                      setParamRows((prev) =>
                                        prev.map((x) =>
                                          x.id === p.id ? { ...x, name: e.target.value } : x
                                        )
                                      )
                                    }
                                    placeholder="请输入"
                                    className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none focus:border-[#2563EB]"
                                  />
                                </td>
                                <td className="p-2 border-r border-[#EDF2F7]">
                                  <select
                                    value={p.type}
                                    onChange={(e) =>
                                      setParamRows((prev) =>
                                        prev.map((x) =>
                                          x.id === p.id
                                            ? {
                                                ...x,
                                                type: e.target.value as ProcessParamItem['type'],
                                              }
                                            : x
                                        )
                                      )
                                    }
                                    className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none cursor-pointer"
                                  >
                                    <option value="文本">文本</option>
                                    <option value="数值">数值</option>
                                    <option value="布尔">布尔</option>
                                    <option value="枚举">枚举</option>
                                  </select>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={p.note}
                                    onChange={(e) =>
                                      setParamRows((prev) =>
                                        prev.map((x) =>
                                          x.id === p.id ? { ...x, note: e.target.value } : x
                                        )
                                      )
                                    }
                                    placeholder="请输入"
                                    className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none focus:border-[#2563EB]"
                                  />
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAddParamRow}
                      className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加参数</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteParams}
                      className="h-8 px-3 border border-[#EA580C]/50 rounded-lg bg-white text-[#EA580C] hover:bg-[#EA580C]/10 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>删除选中</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleSaveProcess(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                保存不退出
              </button>
              <button
                type="button"
                onClick={() => handleSaveProcess(true)}
                className="px-4 py-1.5 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                保存并退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmState.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
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
