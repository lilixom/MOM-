import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Search,
  RotateCcw,
  Plus,
  Files,
  Send,
  Trash2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  ArrowUpDown,
  Edit3,
  AlertTriangle,
  Pin,
  Paperclip,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface ProcessFileTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

const DEFAULT_LAYOUT_PREVIEW =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA0CAIAAABD8SzGAAAOfElEQVR42u2YSYxc13WGzx3e/OrV3FU9FZvd7G4OLU5mNJGyICmSbNoLWYkgZJlNHMAJggRJVkGArLLIznCAGAggZJEBCWwHghVZdpxIoimZlNg0SZGdZpM9VndVdc316o333XuzEEmJ4gA52Wihs6nNq/O+d85/zzn3ICklAAiAC//657M7f6OoSML/ywwEv1v/ox8mr5ycJDlHqaRUDUduMuwxBlouQGpn2GcCpTAJGLfADCL09qb7m0br9T9+gegmveMIEwwEgDyQBwF8LlYEmBBbpXqG/MHh+FgO8cFNFvssbC+yyRXzeNUlOk7ecp3tPkqaQRpH80XViokEBAD0Ya4lAAKEACRIgERggsUdLCkRekA0MYIWk1No/YiSkIFo3ni378L4qPPVYvYrZLklg6TV3CNG/zaZqUWDIdF3m37FlgjBA4EQAj8yE15M2btxlAhk8ERt1cxcIVAsj3BGNWXYyxKlZxmelHdFEQC4RDNq89uj6ze39cWbq87G1bgbG88eN5OO26vNHBp1c+IbovNMvlovDf9qZeG/eUrc+ivg+4dGgmrpmpWL5YlOZ6J1OdW7ZFhj1L2qty+nO/VyDMcVLaOlTZDQ94ELQAiEhJb7cWRRVpEkaL59rf7O1nRx7mBhfGR9ecPtepbkfnudLX6I2kvjlntiRP9O/j0i4k+i+6BkKbqSuOGw6js6XlkcbpBO3Q52jO76om/pllePRJgohiIlJAKkvEWz2gQ3BIJkNUyd33HyeOdw/mZp3/yzL788onNau5Gt7warDdoIoVcPA8/3G9l4jSImb0foARqitohCyVrp2XmvPlzJzzcyFdw1seVmnM0FjTtjWlwbysAHJQXS5RK6LnR9kABeBBjBgMkanufxlBtH725N5FlXFSWslSH0DCVFZ4uBqneboRLcqNd7CVIQCh8GxFyKaWSmXd5f/afFI38x/nvjov9icPUX0eHl0VeCC//2h+Z5w9nlHkkiFWOQEiIGMYOY3ToMRKOPT2rFMSMu7Dczae8n36V2pXD0UP/CuxpKC5pV0mV681f0eleZfTwbGUI+GAgh8EMUeGO5Sniz9PW/M09E1HHklhcedFQvNguvka8/V8geGPys29B1q9OJYZQCwSABCAYMIBEKVWPgLp0wQJk+iZnf91v68Sc7H76/1O7ODaO07cleXQMQhYkDVExbiQzRw4Di0PvuL0/udB85Zz9e1S2QyNR9rKw6NIPDfWto76sflB4LSrnllT859uPRCsQM/Ag0ClyF3QEwnWCDhkiwkbxCJBsmOO2w7ra+s72wb97IO5zaWIDnD9tDc0vmVJQQgkHKB4raRHy1fOwH5reqSU6z4KC6VecV4epuxzqNL02I1Wps/sD4rV+Vn0yBYBy8CCgFIYFxkBIEpYqpZjIWsRWsUCyZMjoqHEt7/nllbrqvk00vqFE7SKe9cu5dMvk2rQB5cISkBNPi6bLImsOXuv+xgsrfGf7zG+zoCa32hBiaavw1gTfIvjfVZ/LFOJVlrQQiBpYGzT5gBDEHTklWw4S1g0GsskSkS/LQke7aBU4whU6zu9tpq/62KJcjXWU2GyqGApw8WNQSsI1sTF4a/OQ0/eFr8pvXSiOPFTYNTXcjNUuCXNiaV+oVb2tJO4xziuzHGoWAAZcgOFANECUlDdNhZFdmBY9Vy2nsVIMYRidHes1UGHdQGDaqMeJMT6tEVQs6lT5+GBAxiW4bDHl0Un3aW8rZIVIJ121IzAii64OFCVJTzUhhlKRV3Yu7DEIGUgLBoFFQKM5aZlTd9K+zdPkJr9tFWNt76LhZMD58/+zZN96r6BMbTTxs9ycmBZqsFIr0TsoeUBi1As3MZTJhsRRqaiIMW0S862pr/hwEUYq4QjcyI6rIzDJ1vDmAngcaBVMDLsGLgVJkKGQds057S7JYAO/e3Bb9oYjNztXLS1drl9dbJ5+YPHX6yczo1BDstEIQRh/3yPvXIck45UHEaKrv7w4Kk24v7PHF9IEX2FkIY6SK0fIAfC9vdbs9sd0FVQUSgkYBAAQDjJCB5dKQPzs6DmFTtR3Lti5+/zX74IyuLZ3+7YP9WrqY1zLj+V0eB4FuUUD4ISnDEHZaxFvfMxwMr0ComRdgZCe9d2f8RblhcyUeiWvK5YugIpRdS9RqKQttFxIBzS6kDSACACEDQ9sfXFwJxp5CVDf9VHalvhEk6y3asyfyg06v0x7uy8+stvt21FUxSu70iPsONMkAkGKcz75wKTe/cuAbqq1bZHBUXunmH/Nlrsacm+3Vic6Hxd1WwKVMgUKgnIYgBsbBoiAlgEyIxtfK5tVBcjjnLO8sXykTrWILn1Rjhmfwcnq3v3LuSvV6mH5SSAQPA5KgEJlLKZcPvxId9McQNkTd4KFIJivQ8bA6cCqocMxDv7H30r/QG/EgAC6gMYCQgaUBxiCljONE5TBEbi0I+Vbro6DmjuX7MuaqWcxYgxzaspXr1SutTmufE0VcUPlQIJoxJqeLs7pUOMIIDFLWyBghJOE84iLkUNLxgiMDL2cFGbXZ8TkgAFuHvA2+C0LIYcwnLGyYioITrHBEUnkz34l6LEmuXRmUpi1u8lbLU7khiDZIRFbcmojuL+ogkVFrMDMFGUonDRhRmMED4JEE7BOzK9UCYQbIK81aL4KUDiqFKAGCoOeDTYEnosXRmFSxsLuRbrAIFCnU0OsFtomY8Lp9EiaOonmDVnPIaTcSWSEfpiHEQuv9H4098eo+Szjd66h+TXSqGCElYwiklAvHoTS3xQz23o/NYiekoCvQC6DeB8cATIEnvBEJl9Mo8SMhOm4oBGs0fclDf2ARogIkKYdxN+XLgcBGM2TTibgXSIIEkCAl6AYc2bvE2aa+eC5Zfbs73KYBchwHZ0nQZORA0N9Zt6eOPbJ3TZew0wKFQshAIxDFEAOgJGlGiJqWgqUqWwqZcANGKTMMOxyK49PPbAfX4qDtdkME8SCR/SDBgt8DRHVs21jVJQCALKiyubtS++At3NnotFHeBl2qHjO5NqovfcCsjVRp3CrwJMnmMeEAthCcIy4gq4ZEKlGQHB858fTMTKZYMcyc6J7s7I7lcnZzq71w4GuN7iNNb6dl7DTDQaQ740yI5B4gaR9PMt/DqgYggSji8pskZrXiCRIW8uPllDKo1zbIuGE4JYb3W5UFE2OhnFbnHp0QHEAqaWdIgMUsY6rahRzsuONTI8XMTKkwCgieO/psv9sI/aGcUMMYmcpUyU2LwqFeb/eipDpLILlb1BhgUB1eev9KN/ARYIRJQdQn9+nWvket4sLk1EjQbqamvMzeLFU1TtKC0shtL/90zShnQYok8EefPnVOxI1abbI84tjZaaU22NzAhVlR5EjXJFZVc9QPG/2lj5iSjhMuaGI7NnfbEvU1MQZSwmfuZchUm2rcjgLGeRzznUi5ceY/e0cOPU8P4UJBRLJGwzYRB3KzYfeKsvbe1UvYNfLZSg4IDnabyCSVzGjGNoCzVrOnJaR3cW397/8y+LPfN4ftaM8kr65zn8t/f6teq/tmxj55JPetg7bZtTwGcXyfwiik9KIIASIYYyFMJ9dv39T0Ay2vV73mna2fuSCvLrBnq74wW/81u7TqnW0XD5+SQiJy68aAMcaEsNjvDtlHjTA4d3Xlwpr2ozNY97e+9w+Y+Hpuaqc1iBiojUHJ8Gv1Ra/bzFhTkjF538LIheBSpAxDSxLdsvbrhA2q/ygvvvPWUjMKj514tLrb6/ff/Yq3XNndLVSmVdMhGBDGhBAAuLa0VN/ZOTg3oxsGcM/L6sbsCFIx4k6r6uKoM5LFjq11Il/vJaEeIaSwJKptb95ouJXCPRMjAsAIqYRQjDmAAliMTX5/8PbrNS+IfEvomVR2MqrOJB2zukJtbcXVvevX7VwGYey3208tLFxcXFxeXjYo0sr7MVFTh+bi6oWo5UM+XTGKjXZzQx3Eutaubuoy1XzznUJmDif+ejAaxRTdmzIppR/FcZIIKQ1V5UKc397p77Ue48kky94Af2P5wgvQVOu7B4+MS+NUe62302roYWBqWtDrxQl/7rnnFg4d2r9v7y/XoljS160T6nS2ZBZTutOeFu09M5QYimW6uT6h6pD6zvsDRU9vZfcDofdrrgilTYMLwTjHGA+joLpR/7Z99ODk9ub/nN925xOenpmewfFP89bej2oZUx3uKRbMdNowDKZrCsEbm5vVzU3H1BizZMLbwrMO51oCdNmwTqgD2KdDzAAzyGsQJ1KrMjyOGjnRBVn+LJAEMHD16PgZwDThXAIAgkfG+IjdUP1kKruWMqdoZQ+7dL6s7JL4xqH05pwRCSCKpmGMec5Np6YxtgghUkjTsjF4I9DN8z5BEkCkpN8GvwTtQGoBGDYK2tLhlMzjja60zsH++wBpqFHJXFXU2xkUQIrHwTnFd7fFsVlt3YwDTJySM/8SpiEtjkvvQ9E8c+tpCxT91Ku/89cs9mLfe+PsUJPxAbSKkOzKdASqDnECVANGkQilpsjIgoAinkiUABWfmqQ/fcqQlCDl7a2UBKmNkvKLgq9SgMyIj3Ml6eYkpsAFHpvj200pztxxxd3NAltEMkFKoMRqDNoqTCgy6UE6AeJLvQn5ADQVWAsyNmQFECp5CzI+GPAAIEDorkGWb7/Jaz8HhAEQIOC7nyyC+DaACD/xg4Gvv+5vvgEgTcxp7U85fvnn8qnbHRsQYAkCPtl+obu3cgkCee8pAy+CtPJpQgEi/NzLRQFCfOxHIgEYSSQ+NUjw2y+5o5FP/WAE+J46JDiPAgDjc24S72aRIOH21QoBSwQkEj7/+jSR/OMt0x0gBDA6/1Sh7GGi/Lo0CCBKIIy5Y2IECKHktPfVVDhKEf+8PEIeTuURVT4WsoS7w/h/MAnA4kRRCELodmLQr/1hCD4D9IUwDF8w+xLoS6Avgb4E+hLoiw70v7gq195f311EAAAAAElFTkSuQmCC';

interface ProcessFileItem {
  id: string;
  org: string;
  fileCode: string;
  fileName: string;
  materialNo: string;
  status: string;
  oaStarted: boolean;
  attachments: string[];
  fileSize: string;
  fileVersion: string;
  createBy: string;
  createTime: string;
  layoutImageUrl: string;
  remark: string;
}

interface DispatchLogItem {
  id: string;
  org: string;
  time: string;
  operator: string;
}

interface ColumnConfig {
  key: keyof ProcessFileItem;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
  sortable?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'org', label: '组织机构', visible: true },
  { key: 'fileCode', label: '文件编码', visible: true, highlight: true, pinned: true, sortable: true },
  { key: 'fileName', label: '文件名称', visible: true, highlight: true, pinned: true, sortable: true },
  { key: 'materialNo', label: '物料料号', visible: true, sortable: true },
  { key: 'status', label: '状态', visible: true },
  { key: 'oaStarted', label: 'OA发起状态', visible: true },
  { key: 'attachments', label: '附件', visible: true },
  { key: 'fileSize', label: '文件大小', visible: true },
  { key: 'fileVersion', label: '文件版本', visible: true, sortable: true },
  { key: 'createBy', label: '创建人', visible: true },
  { key: 'createTime', label: '创建时间', visible: true, sortable: true },
];

const INITIAL_FILES: ProcessFileItem[] = [
  {
    id: 'pf-01',
    org: '昇兴集团',
    fileCode: '10034111',
    fileName: '强人椰果湘莲八宝粥（202611...',
    materialNo: '10034111',
    status: '审核通过',
    oaStarted: false,
    attachments: ['a5fe7b91493314851ab15a89...'],
    fileSize: '2.4 MB',
    fileVersion: '03',
    createBy: '潘鑫',
    createTime: '2026-11-09 17:04:34',
    layoutImageUrl: DEFAULT_LAYOUT_PREVIEW,
    remark: '',
  },
  {
    id: 'pf-02',
    org: '昇兴集团',
    fileCode: '10034199',
    fileName: '强人银耳湘莲八宝粥（202611...',
    materialNo: '10034199',
    status: '审核通过',
    oaStarted: false,
    attachments: ['52edab1a3304b890866dc3b86...'],
    fileSize: '1.8 MB',
    fileVersion: '02',
    createBy: '潘鑫',
    createTime: '2026-11-09 16:36:31',
    layoutImageUrl: DEFAULT_LAYOUT_PREVIEW,
    remark: '',
  },
];

const INITIAL_SEND_LOGS: DispatchLogItem[] = [
  {
    id: 'snd-01',
    org: '昇兴集团-中山制罐厂',
    time: '2026-11-09 17:23:03',
    operator: '潘鑫',
  },
];

const MATERIAL_PICK_OPTIONS: Array<{ code: string; name: string; spec: string }> = [
  { code: '50054709', name: '外球面轴承座,UCPA206', spec: '' },
  { code: '50004311', name: '轴承,607-2Z,SKF', spec: '' },
  { code: '90011039', name: '墨粉盒京呈TN2520X...', spec: '' },
  { code: '90011040', name: '墨粉盒京呈TN3625X...', spec: '' },
  { code: '50081429', name: '电磁阀组,64M-1073549', spec: '' },
  { code: '50050485', name: '连接件,62M-1026521', spec: '865/65P下焊臂' },
  { code: '50081330', name: '三角带,B4597Li', spec: '' },
  { code: '50081271', name: '直线轴承,LMF20LUU,', spec: '' },
  { code: '80000379', name: '303#1250ML', spec: '' },
  { code: '90011027', name: '绿林加强棘轮扳手,8mm', spec: '' },
  { code: '90011030', name: '绿林十字冲击钻钻头...', spec: '' },
  { code: '90011031', name: '绿林十字冲击钻钻头...', spec: '' },
  { code: '90011038', name: '三十年员工纪念币,15...', spec: '' },
  { code: '90011028', name: '绿林十字冲击钻钻头...', spec: '' },
  { code: '90011029', name: '绿林十字冲击钻钻头...', spec: '' },
  { code: '90011033', name: '绿林十字冲击钻钻头...', spec: '' },
  { code: '90011037', name: '二十年员工纪念币,10...', spec: '' },
  { code: '90011026', name: '绿林加强棘轮扳手,12...', spec: '' },
  { code: '90011035', name: '海斯迪克 白大褂 HKS...', spec: '' },
  { code: '90011032', name: '绿林十字冲击钻钻头...', spec: '' },
];

export const ProcessFileTab: React.FC<ProcessFileTabProps> = ({ onShowToast }) => {
  const [rows, setRows] = useState<ProcessFileItem[]>(INITIAL_FILES);
  const [sendLogs, setSendLogs] = useState<DispatchLogItem[]>(INITIAL_SEND_LOGS);

  // Filters
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('请选择');
  const [codeOp, setCodeOp] = useState<MatchOp>('contains');
  const [codeFilter, setCodeFilter] = useState('');
  const [nameOp, setNameOp] = useState<MatchOp>('contains');
  const [nameFilter, setNameFilter] = useState('');
  const [quickDate, setQuickDate] = useState('自定义');
  const [startDate, setStartDate] = useState('2026-11-01T00:00');
  const [endDate, setEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    org: '请选择',
    codeOp: 'contains' as MatchOp,
    code: '',
    nameOp: 'contains' as MatchOp,
    name: '',
  });

  // Table state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSendIds, setSelectedSendIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessFileItem | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('');
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  // Column settings (F4)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // F2 Add / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('edit');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    fileCode: '',
    fileName: '',
    materialNo: '',
    fileVersion: '',
    remark: '',
    attachments: [] as string[],
    layoutImageUrl: '',
  });
  const [formErrors, setFormErrors] = useState<{
    fileCode?: boolean;
    fileName?: boolean;
    attachments?: boolean;
    materialNo?: boolean;
    fileVersion?: boolean;
  }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  // F5 Material Picker
  const [isPickOpen, setIsPickOpen] = useState(false);
  const [pickKeyword, setPickKeyword] = useState('');
  const [pickAppliedKeyword, setPickAppliedKeyword] = useState('');
  const [pickSelectedCode, setPickSelectedCode] = useState<string | null>(null);

  // Confirm Dialog
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    confirmText?: string;
    danger?: boolean;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    desc: '',
    onConfirm: null,
  });

  // Filtering & sorting
  const filteredRows = useMemo(() => {
    const matchStr = (val: string, filter: string, op: MatchOp) => {
      if (!filter.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = filter.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    return rows.filter((r) => {
      if (appliedFilters.org !== '请选择' && !r.org.includes(appliedFilters.org)) return false;
      if (!matchStr(r.fileCode, appliedFilters.code, appliedFilters.codeOp)) return false;
      if (!matchStr(r.fileName, appliedFilters.name, appliedFilters.nameOp)) return false;
      return true;
    });
  }, [rows, appliedFilters]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredRows;
    const key = sortConfig.key;
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return [...filteredRows].sort((a, b) =>
      String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'zh-CN') * dir
    );
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const visibleColumns = columns.filter((c) => c.visible);

  const filteredPickOptions = useMemo(() => {
    const kw = pickAppliedKeyword.trim().toLowerCase();
    if (!kw) return MATERIAL_PICK_OPTIONS;
    return MATERIAL_PICK_OPTIONS.filter(
      (m) => m.code.toLowerCase().includes(kw) || m.name.toLowerCase().includes(kw)
    );
  }, [pickAppliedKeyword]);

  // Handlers
  const handleQuickDate = (label: string) => {
    setQuickDate(label);
    if (label === '本周') {
      setStartDate('2026-11-16T00:00');
      setEndDate('2026-11-22T23:59');
    } else if (label === '本月') {
      setStartDate('2026-11-01T00:00');
      setEndDate('2026-11-30T23:59');
    }
  };

  const handleQuery = () => {
    setAppliedFilters({
      org: orgFilter,
      codeOp,
      code: codeFilter,
      nameOp,
      name: nameFilter,
    });
    setCurrentPage(1);
    onShowToast(`查询完成，共 ${filteredRows.length} 条`, 'info');
  };

  const handleReset = () => {
    setOrgFilter('请选择');
    setCodeOp('contains');
    setCodeFilter('');
    setNameOp('contains');
    setNameFilter('');
    setQuickDate('自定义');
    setStartDate('2026-11-01T00:00');
    setEndDate('');
    setAppliedFilters({
      org: '请选择',
      codeOp: 'contains',
      code: '',
      nameOp: 'contains',
      name: '',
    });
    setSelectedIds([]);
    setCurrentPage(1);
    onShowToast('已重置筛选条件', 'info');
  };

  const toggleSort = (key: keyof ProcessFileItem) => {
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

  // F2 Modal
  const openForm = (mode: 'add' | 'edit', row?: ProcessFileItem, multiHint?: boolean) => {
    setFormMode(mode);
    setFormErrors({});
    setOpenMoreId(null);
    if (mode === 'edit' && row) {
      setEditingId(row.id);
      setFormState({
        fileCode: row.fileCode,
        fileName: row.fileName,
        materialNo: row.materialNo,
        fileVersion: row.fileVersion,
        remark: row.remark || '',
        attachments: row.attachments.length ? [...row.attachments] : [row.fileCode],
        layoutImageUrl: row.layoutImageUrl || DEFAULT_LAYOUT_PREVIEW,
      });
    } else {
      setEditingId(null);
      setFormState({
        fileCode: '',
        fileName: '',
        materialNo: '',
        fileVersion: '',
        remark: '',
        attachments: [],
        layoutImageUrl: '',
      });
    }
    setIsFormOpen(true);
    if (multiHint) {
      onShowToast('多附件模式：最多可同时上传 9 个附件', 'info');
    }
  };

  const handleSaveForm = (closeAfter: boolean) => {
    const errs = {
      fileCode: !formState.fileCode.trim(),
      fileName: !formState.fileName.trim(),
      attachments: formState.attachments.length === 0,
      materialNo: !formState.materialNo.trim(),
      fileVersion: !formState.fileVersion.trim(),
    };
    if (
      errs.fileCode ||
      errs.fileName ||
      errs.attachments ||
      errs.materialNo ||
      errs.fileVersion
    ) {
      setFormErrors(errs);
      onShowToast('请填写完整必填项（文件编码、文件名称、附件、物料料号、文件版本）', 'error');
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (formMode === 'edit' && editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                fileCode: formState.fileCode.trim(),
                fileName: formState.fileName.trim(),
                materialNo: formState.materialNo.trim(),
                fileVersion: formState.fileVersion.trim(),
                attachments: [...formState.attachments],
                layoutImageUrl: formState.layoutImageUrl,
                remark: formState.remark.trim(),
              }
            : r
        )
      );
      onShowToast(closeAfter ? '工艺参数文件已保存' : '工艺参数文件已暂存（不退出）', 'success');
      if (closeAfter) setIsFormOpen(false);
    } else {
      const newId = `pf-${Date.now()}`;
      const newRec: ProcessFileItem = {
        id: newId,
        org: '昇兴集团',
        fileCode: formState.fileCode.trim(),
        fileName: formState.fileName.trim(),
        materialNo: formState.materialNo.trim(),
        status: '审核通过',
        oaStarted: false,
        attachments: [...formState.attachments],
        fileSize: '1.2 MB',
        fileVersion: formState.fileVersion.trim(),
        createBy: '潘鑫',
        createTime: nowStr,
        layoutImageUrl: formState.layoutImageUrl,
        remark: formState.remark.trim(),
      };
      setRows((prev) => [newRec, ...prev]);
      onShowToast(closeAfter ? '工艺参数文件新增成功' : '工艺参数文件已暂存（不退出）', 'success');
      if (closeAfter) {
        setIsFormOpen(false);
      } else {
        setFormMode('edit');
        setEditingId(newId);
      }
    }
  };

  // File & Image Uploads
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    if (formState.attachments.length + files.length > 9) {
      onShowToast('最多上传 9 个附件', 'warning');
      e.target.value = '';
      return;
    }
    const validNames: string[] = [];
    for (const f of files) {
      if (f.size > 50 * 1024 * 1024) {
        onShowToast(`附件超过 50MB：${f.name}`, 'error');
        continue;
      }
      validNames.push(f.name);
    }
    if (validNames.length > 0) {
      setFormState((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validNames],
      }));
      setFormErrors((prev) => ({ ...prev, attachments: false }));
      onShowToast(`已添加 ${validNames.length} 个附件`, 'success');
    }
    e.target.value = '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      onShowToast('图片超过 50MB', 'error');
      e.target.value = '';
      return;
    }
    const rd = new FileReader();
    rd.onload = (ev) => {
      const url = typeof ev.target?.result === 'string' ? ev.target.result : '';
      if (url) {
        setFormState((prev) => ({ ...prev, layoutImageUrl: url }));
        onShowToast('版面图片已上传', 'success');
      }
    };
    rd.readAsDataURL(f);
    e.target.value = '';
  };

  // Dispatch & Delete actions
  const appendDispatchLog = () => {
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setSendLogs((prev) => [
      {
        id: `snd-${Date.now()}`,
        org: '昇兴集团-中山制罐厂',
        time: nowStr,
        operator: '潘鑫',
      },
      ...prev,
    ]);
  };

  const handleSingleSend = (row: ProcessFileItem) => {
    setOpenMoreId(null);
    setConfirmState({
      isOpen: true,
      title: '下发文件',
      desc: `确定下发工艺参数文件「${row.fileCode} · ${row.fileName}」至生产工厂吗？`,
      confirmText: '确认下发',
      danger: false,
      onConfirm: () => {
        appendDispatchLog();
        onShowToast(`文件 ${row.fileCode} 下发成功`, 'success');
      },
    });
  };

  const handleBatchSend = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先选择要下发的文件', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量下发',
      desc: `确定要下发选中的 ${selectedIds.length} 个工艺参数文件吗？`,
      confirmText: '确认下发',
      danger: false,
      onConfirm: () => {
        appendDispatchLog();
        onShowToast(`已下发 ${selectedIds.length} 个工艺参数文件`, 'success');
      },
    });
  };

  const handleSingleDelete = (row: ProcessFileItem) => {
    setOpenMoreId(null);
    setConfirmState({
      isOpen: true,
      title: '删除文件',
      desc: `确定删除工艺参数文件「${row.fileCode}」吗？删除后不可恢复。`,
      confirmText: '确定删除',
      danger: true,
      onConfirm: () => {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        setSelectedIds((prev) => prev.filter((id) => id !== row.id));
        onShowToast(`已删除文件 ${row.fileCode}`, 'success');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先选择要删除的文件', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      desc: `确定要删除选中的 ${selectedIds.length} 个工艺参数文件吗？删除后不可恢复。`,
      confirmText: '确定删除',
      danger: true,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setSelectedIds([]);
        onShowToast(`已删除 ${delSet.size} 个文件`, 'success');
      },
    });
  };

  // F5 Material Picker
  const openMaterialPicker = () => {
    setPickKeyword('');
    setPickAppliedKeyword('');
    setPickSelectedCode(formState.materialNo || null);
    setIsPickOpen(true);
  };

  const handleConfirmPick = () => {
    if (!pickSelectedCode) {
      onShowToast('请先选择一个物料代码', 'warning');
      return;
    }
    setFormState((prev) => ({ ...prev, materialNo: pickSelectedCode }));
    setFormErrors((prev) => ({ ...prev, materialNo: false }));
    setIsPickOpen(false);
    onShowToast(`已选择物料：${pickSelectedCode}`, 'success');
  };

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

  const allSendSelected =
    sendLogs.length > 0 && sendLogs.every((s) => selectedSendIds.includes(s.id));

  return (
    <div
      className="space-y-4 relative text-xs text-[#1E293B]"
      onClick={() => {
        if (openMoreId) setOpenMoreId(null);
      }}
    >
      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工艺文件</span>
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
                <option value="昇兴集团-中山制罐工厂">昇兴集团-中山制罐工厂</option>
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
          <span className="text-[#1E40AF] font-medium w-16 text-right shrink-0">创建时间</span>
          <div className="flex items-center gap-1 bg-[#F4F6F9] p-0.5 rounded-lg border border-[#E5E9F0]">
            {['本月', '本周', '自定义'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickDate(label)}
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
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setQuickDate('自定义');
              }}
              className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
            />
            <span className="text-[#64748B]">→</span>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setQuickDate('自定义');
              }}
              className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] font-mono outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {!filterCollapsed && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-0.5 pl-1">
            {/* 文件编码 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium w-16 text-right">文件编码</label>
              <select
                value={codeOp}
                onChange={(e) => setCodeOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <input
                type="text"
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="请输入"
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-40 font-mono outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* 文件名称 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium w-16 text-right">文件名称</label>
              <select
                value={nameOp}
                onChange={(e) => setNameOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="请输入"
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-44 outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Card 1: 工艺文件列表 */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedIds.length}</strong> 项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条工艺文件
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => openForm('add')}
              className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
            <button
              type="button"
              onClick={() => openForm('add', undefined, true)}
              className="h-8 px-3.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#165DFF] transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Files className="w-3.5 h-3.5" />
              <span>多附件新增</span>
            </button>
            <button
              type="button"
              onClick={handleBatchSend}
              className="h-8 px-3.5 border border-[#E5E9F0] bg-white text-[#1E40AF] hover:bg-[#EDF2F7] rounded-lg transition flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>批量下发</span>
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
                    } ${col.highlight ? 'bg-blue-50/70 text-blue-700' : ''}`}
                  >
                    <div className="inline-flex items-center gap-1">
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
                <th className="p-2.5 border-b border-[#E5E9F0] w-40 text-center sticky right-0 bg-[#FFFFFF] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
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
                    {visibleColumns.map((col, idx) => (
                      <td
                        key={`${row.id}-${String(col.key)}-${idx}`}
                        className={`p-2.5 border-r border-[#EDF2F7] ${
                          col.highlight ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        {col.key === 'fileCode' ? (
                          <button
                            type="button"
                            onClick={() => openForm('edit', row)}
                            className="font-mono font-bold text-[#1E40AF] hover:text-[#165DFF] hover:underline cursor-pointer"
                          >
                            {row.fileCode}
                          </button>
                        ) : col.key === 'materialNo' ||
                          col.key === 'fileVersion' ||
                          col.key === 'createTime' ||
                          col.key === 'fileSize' ? (
                          <span className="font-mono tabular-nums text-[#1E293B]">
                            {String(row[col.key] || '')}
                          </span>
                        ) : col.key === 'status' ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                            {row.status}
                          </span>
                        ) : col.key === 'oaStarted' ? (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={row.oaStarted}
                            onClick={() => {
                              const nextVal = !row.oaStarted;
                              setRows((prev) =>
                                prev.map((x) =>
                                  x.id === row.id ? { ...x, oaStarted: nextVal } : x
                                )
                              );
                              onShowToast(`OA 发起状态已${nextVal ? '开启' : '关闭'}`, 'info');
                            }}
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${
                              row.oaStarted ? 'bg-[#165DFF]' : 'bg-[#CBD5E1]'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                row.oaStarted ? 'translate-x-3.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        ) : col.key === 'attachments' ? (
                          <span className="text-[#165DFF] font-mono inline-flex items-center gap-1">
                            <Paperclip className="w-3 h-3 shrink-0" />
                            <span>{row.attachments[0] || '—'}</span>
                            {row.attachments.length > 1 && (
                              <span className="text-[10px] text-[#64748B]">
                                (+{row.attachments.length - 1})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[#1E293B]">{String(row[col.key] || '')}</span>
                        )}
                      </td>
                    ))}
                    <td
                      className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                        isSelected ? 'bg-[#EBF2FF]' : 'bg-white'
                      }`}
                    >
                      <div className="inline-flex items-center gap-3 relative">
                        <button
                          type="button"
                          onClick={() => handleSingleSend(row)}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          下发
                        </button>
                        <button
                          type="button"
                          onClick={() => openForm('edit', row)}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          修改
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMoreId((prev) => (prev === row.id ? null : row.id));
                            }}
                            className="text-[#1E40AF] hover:text-[#165DFF] font-medium inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>更多</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {openMoreId === row.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-6 w-28 bg-white border border-[#E5E9F0] rounded-xl shadow-lg py-1 z-40 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => handleSingleSend(row)}
                                className="w-full px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#EBF2FF] hover:text-[#165DFF] flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>下发</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openForm('edit', row)}
                                className="w-full px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#EBF2FF] hover:text-[#165DFF] flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>修改</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSingleDelete(row)}
                                className="w-full px-3 py-1.5 text-xs text-[#EA580C] hover:bg-[#EA580C]/10 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>删除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-10 text-center text-[#64748B]">
                    暂无匹配的工艺文件数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
          </select>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <span>前往</span>
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-12 w-72 max-h-[480px] bg-white border border-[#E5E9F0] rounded-xl shadow-xl z-40 flex flex-col overflow-hidden"
          >
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

      {/* Card 2: 下发组织记录 */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <span className="text-xs font-bold text-[#1E293B]">下发组织记录</span>
          <span className="text-xs text-[#64748B]">
            共 <strong className="font-mono text-[#1E293B]">{sendLogs.length}</strong> 条记录
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSendSelected}
                    onChange={(e) =>
                      setSelectedSendIds(e.target.checked ? sendLogs.map((s) => s.id) : [])
                    }
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                <th className="p-2.5 border-b border-r border-[#E5E9F0]">
                  <div className="inline-flex items-center gap-1">
                    <span>下发组织</span>
                    <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                  </div>
                </th>
                <th className="p-2.5 border-b border-r border-[#E5E9F0]">
                  <div className="inline-flex items-center gap-1">
                    <span>下发时间</span>
                    <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                  </div>
                </th>
                <th className="p-2.5 border-b border-[#E5E9F0]">
                  <div className="inline-flex items-center gap-1">
                    <span>下发人</span>
                    <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {sendLogs.map((s) => {
                const checked = selectedSendIds.includes(s.id);
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      checked ? 'bg-[#EBF2FF]/60' : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedSendIds((prev) =>
                            prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                          )
                        }
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7]">{s.org}</td>
                    <td className="p-2.5 border-r border-[#EDF2F7] font-mono">{s.time}</td>
                    <td className="p-2.5">{s.operator}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-2.5 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{sendLogs.length}</strong> 条
          </span>
          <span className="w-7 h-7 border border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold font-mono rounded-lg flex items-center justify-center">
            1
          </span>
          <span className="text-[#64748B]">10 条/页</span>
        </div>
      </div>

      {/* F2 新增 / 修改-工艺参数文件弹窗 */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {formMode === 'edit' ? '修改-工艺参数文件' : '新增-工艺参数文件'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">
                    <span className="text-[#EA580C] mr-0.5">*</span>文件编码
                  </label>
                  <input
                    type="text"
                    value={formState.fileCode}
                    onChange={(e) => {
                      setFormState((prev) => ({ ...prev, fileCode: e.target.value }));
                      if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, fileCode: false }));
                    }}
                    placeholder="请输入文件编码"
                    className={`h-8 px-3 border rounded-lg bg-white font-mono outline-none ${
                      formErrors.fileCode
                        ? 'border-[#EA580C]'
                        : 'border-[#E5E9F0] focus:border-[#2563EB]'
                    }`}
                  />
                  {formErrors.fileCode && (
                    <span className="text-[11px] text-[#EA580C]">请输入文件编码</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">
                    <span className="text-[#EA580C] mr-0.5">*</span>文件名称
                  </label>
                  <input
                    type="text"
                    value={formState.fileName}
                    onChange={(e) => {
                      setFormState((prev) => ({ ...prev, fileName: e.target.value }));
                      if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, fileName: false }));
                    }}
                    placeholder="请输入文件名称"
                    className={`h-8 px-3 border rounded-lg bg-white outline-none ${
                      formErrors.fileName
                        ? 'border-[#EA580C]'
                        : 'border-[#E5E9F0] focus:border-[#2563EB]'
                    }`}
                  />
                  {formErrors.fileName && (
                    <span className="text-[11px] text-[#EA580C]">请输入文件名称</span>
                  )}
                </div>

                {/* 附件 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#1E40AF] font-medium">
                    <span className="text-[#EA580C] mr-0.5">*</span>附件
                  </label>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传文件</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleAttachmentChange}
                      className="hidden"
                    />
                  </div>
                  {formState.attachments.length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      {formState.attachments.map((file, idx) => (
                        <div
                          key={`${file}-${idx}`}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#F4F6F9] border border-[#EDF2F7]"
                        >
                          <span className="text-[#165DFF] inline-flex items-center gap-1.5 truncate font-mono">
                            <Paperclip className="w-3 h-3 shrink-0" />
                            <span className="truncate">{file}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                attachments: prev.attachments.filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-[#EA580C] hover:underline shrink-0 cursor-pointer"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] text-[#64748B] leading-relaxed">
                    <div>附件大小限制：50MB</div>
                    <div>最大文件数：9</div>
                    <div>附件支持格式：.doc,.docx,.xls,.xlsx,.ppt,.pptx</div>
                  </div>
                  {formErrors.attachments && (
                    <span className="text-[11px] text-[#EA580C]">请上传附件</span>
                  )}
                </div>

                {/* 版面图片 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#1E40AF] font-medium">版面图片</label>
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => imgInputRef.current?.click()}
                      className="w-28 h-22 shrink-0 border border-dashed border-[#CBD5E1] rounded-lg bg-[#F8FAFC] hover:border-[#165DFF] flex items-center justify-center overflow-hidden cursor-pointer transition"
                    >
                      {formState.layoutImageUrl ? (
                        <img
                          src={formState.layoutImageUrl}
                          alt="版面图片"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-[#94A3B8]">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-[11px]">点击上传图片</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setFormState((prev) => ({ ...prev, layoutImageUrl: '' }));
                          onShowToast('版面图片已删除', 'info');
                        }}
                        className="h-7 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition cursor-pointer"
                      >
                        删除图片
                      </button>
                      <div className="text-[11px] text-[#64748B] leading-relaxed">
                        <div>图片大小限制：50MB</div>
                        <div>最大图片数：1</div>
                        <div>支持格式：.jpg,.png,.jpeg,.bmp,.gif</div>
                      </div>
                    </div>
                    <input
                      ref={imgInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* 物料料号 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">
                    <span className="text-[#EA580C] mr-0.5">*</span>物料料号
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formState.materialNo}
                      onClick={openMaterialPicker}
                      placeholder="请选择"
                      className={`w-full h-8 pl-3 pr-8 border rounded-lg bg-white font-mono cursor-pointer outline-none ${
                        formErrors.materialNo
                          ? 'border-[#EA580C]'
                          : 'border-[#E5E9F0] focus:border-[#2563EB]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={openMaterialPicker}
                      className="absolute right-2 top-2 text-[#64748B] hover:text-[#165DFF] cursor-pointer"
                      title="选择物料料号"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {formErrors.materialNo && (
                    <span className="text-[11px] text-[#EA580C]">请选择物料料号</span>
                  )}
                </div>

                {/* 文件版本 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">
                    <span className="text-[#EA580C] mr-0.5">*</span>文件版本
                  </label>
                  <input
                    type="text"
                    value={formState.fileVersion}
                    onChange={(e) => {
                      setFormState((prev) => ({ ...prev, fileVersion: e.target.value }));
                      if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, fileVersion: false }));
                    }}
                    placeholder="请输入文件版本，如 03"
                    className={`h-8 px-3 border rounded-lg bg-white font-mono outline-none ${
                      formErrors.fileVersion
                        ? 'border-[#EA580C]'
                        : 'border-[#E5E9F0] focus:border-[#2563EB]'
                    }`}
                  />
                  {formErrors.fileVersion && (
                    <span className="text-[11px] text-[#EA580C]">请输入文件版本</span>
                  )}
                </div>

                {/* 备注 */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[#1E40AF] font-medium">备注</label>
                  <textarea
                    value={formState.remark}
                    maxLength={200}
                    onChange={(e) => setFormState((prev) => ({ ...prev, remark: e.target.value }))}
                    placeholder="请输入"
                    rows={3}
                    className="px-3 py-2 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB] resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                保存不退出
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm(true)}
                className="px-4 py-1.5 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                保存并退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F5 物料代码选择弹窗 */}
      {isPickOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPickOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-[#1E293B]">物料代码 选择</h3>
              <button
                type="button"
                onClick={() => setIsPickOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-[#EDF2F7] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pickKeyword}
                  onChange={(e) => setPickKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPickAppliedKeyword(pickKeyword);
                      onShowToast('物料查询完成', 'info');
                    }
                  }}
                  placeholder="物料料号 / 物料名称 搜索"
                  className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white w-56 outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickAppliedKeyword(pickKeyword);
                    onShowToast('物料查询完成', 'info');
                  }}
                  className="h-8 px-3.5 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] font-medium cursor-pointer"
                >
                  查询
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPickKeyword('');
                    setPickAppliedKeyword('');
                    setPickSelectedCode(null);
                  }}
                  className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] cursor-pointer"
                >
                  重置
                </button>
              </div>
              <span className="text-[#64748B]">单选 · 点击行选择物料</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5 border-b border-[#E5E9F0] w-12 text-center" />
                    <th className="p-2.5 border-b border-[#E5E9F0] w-40">物料料号</th>
                    <th className="p-2.5 border-b border-[#E5E9F0]">物料名称</th>
                    <th className="p-2.5 border-b border-[#E5E9F0] w-52">物料规格</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7]">
                  {filteredPickOptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#94A3B8]">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredPickOptions.map((m) => {
                      const picked = pickSelectedCode === m.code;
                      return (
                        <tr
                          key={m.code}
                          onClick={() => setPickSelectedCode(m.code)}
                          className={`cursor-pointer transition-colors ${
                            picked ? 'bg-[#EBF2FF]' : 'hover:bg-[#F4F6F9]'
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="radio"
                              name="fileMatPickRadio"
                              checked={picked}
                              onChange={() => setPickSelectedCode(m.code)}
                              className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 font-mono font-medium text-[#1E40AF]">{m.code}</td>
                          <td className="p-2.5">{m.name}</td>
                          <td className="p-2.5 text-[#64748B]">{m.spec}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPickOpen(false)}
                className="px-4 py-1.5 border border-[#E5E9F0] rounded-lg text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmPick}
                className="px-4 py-1.5 bg-[#165DFF] text-white rounded-lg text-xs font-medium hover:bg-[#0E4FD6] cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

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
              <AlertTriangle
                className={`w-4 h-4 ${confirmState.danger ? 'text-[#EA580C]' : 'text-[#165DFF]'}`}
              />
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
                className={`px-4 py-1.5 text-white rounded-lg text-xs font-medium cursor-pointer ${
                  confirmState.danger
                    ? 'bg-[#EA580C] hover:bg-[#d96136]'
                    : 'bg-[#165DFF] hover:bg-[#0E4FD6]'
                }`}
              >
                {confirmState.confirmText || '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
