import React, { useState, useMemo } from 'react';
import {
  Sliders,
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
  ArrowUpDown,
  Edit3,
  AlertTriangle,
  Pin,
  Inbox,
  Send,
  Copy,
} from 'lucide-react';

interface ProcessParamTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type MatchOp = 'contains' | 'equals';
type SortDir = 'asc' | 'desc' | null;

interface ProcessParamMaster {
  id: string;
  org: string;
  productCode: string;
  productName: string;
  productSpec: string;
  productVersion: string;
  craftVersion: string;
  opName: string;
  opCode: string;
  standardHours?: string;
  remark?: string;
}

interface MaterialParamDetail {
  id: string;
  matNo: string;
  matName: string;
  itemName: string;
  itemType: string;
  required: boolean;
  fixedVal: string;
  lowVal: string;
  highVal: string;
  unit: string;
}

interface DispatchRecord {
  id: string;
  org: string;
  time: string;
  operator: string;
}

interface ModalParamRow {
  id: string;
  code: string;
  name: string;
  item: string;
  type: '记录值' | '固定值' | '公式' | '枚举' | '';
}

interface ColumnConfig {
  key: keyof ProcessParamMaster;
  label: string;
  visible: boolean;
  highlight?: boolean;
  pinned?: boolean;
  sortable?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: 'org', label: '组织机构', visible: true },
  { key: 'productCode', label: '产品料号', visible: true, highlight: true, pinned: true, sortable: true },
  { key: 'productName', label: '产品名称', visible: true, highlight: true, pinned: true },
  { key: 'productSpec', label: '产品规格', visible: true },
  { key: 'productVersion', label: '产品版本', visible: true },
  { key: 'craftVersion', label: '工艺版本', visible: true, sortable: true },
  { key: 'opName', label: '工序名称', visible: true },
  { key: 'opCode', label: '工序编码', visible: true },
];

const INITIAL_MASTER_ROWS: ProcessParamMaster[] = [
  { id: 'pp-01', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '01', opName: '包装', opCode: '105004-23' },
  { id: 'pp-02', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '01', opName: '内全脱机', opCode: '105004-12' },
  { id: 'pp-03', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '01', opName: '自动加膜机', opCode: '105004-07' },
  { id: 'pp-04', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '边缘补涂', opCode: '105004-22' },
  { id: 'pp-05', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '电脑喷码机', opCode: '105004-02' },
  { id: 'pp-06', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '裁罩', opCode: '105004-01' },
  { id: 'pp-07', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '制罐工序', opCode: '105001-03' },
  { id: 'pp-08', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '包装', opCode: '105004-23' },
  { id: 'pp-09', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '内全脱机', opCode: '105004-12' },
  { id: 'pp-10', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '自动加膜机', opCode: '105004-07' },
  { id: 'pp-11', org: '昇兴集团', productCode: '10034111', productName: '狂人脾酒随八宝粥(202611...)', productSpec: '2090360', productVersion: '01', craftVersion: '03', opName: '自动加膜机', opCode: '105004-07' },
];

const INITIAL_MAT_ROWS: MaterialParamDetail[] = [
  { id: 'mp-1', matNo: '600001010', matName: '外边缘涂料-MC4875-801', itemName: '上机粘度(s)', itemType: '其他', required: false, fixedVal: '26-10', lowVal: '', highVal: '', unit: '' },
  { id: 'mp-2', matNo: '600001010', matName: '外边缘涂料-MC4875-801', itemName: '喷涂厚度(mm)', itemType: '其他', required: false, fixedVal: '8-10', lowVal: '', highVal: '', unit: '' },
  { id: 'mp-3', matNo: '600001010', matName: '外边缘涂料-MC4875-801', itemName: '涂料供应商', itemType: '其他', required: false, fixedVal: '豫南', lowVal: '', highVal: '', unit: '' },
  { id: 'mp-4', matNo: '600001010', matName: '外边缘涂料-MC4875-801', itemName: '溶剂代号', itemType: '其他', required: false, fixedVal: 'MC30598', lowVal: '', highVal: '', unit: '' },
  { id: 'mp-5', matNo: '600000101', matName: '内边缘涂料-PPG2238-801/A', itemName: '上机粘度(s)', itemType: '其他', required: false, fixedVal: '17-22', lowVal: '', highVal: '', unit: '' },
  { id: 'mp-6', matNo: '600000101', matName: '内边缘涂料-PPG2238-801/A', itemName: '喷涂厚度(mm)', itemType: '其他', required: false, fixedVal: '8-10', lowVal: '', highVal: '', unit: '' },
  { id: 'mp-7', matNo: '600000101', matName: '内边缘涂料-PPG2238-801/A', itemName: '涂料供应商', itemType: '其他', required: false, fixedVal: 'PPG', lowVal: '', highVal: '', unit: '' },
  { id: 'mp-8', matNo: '600000101', matName: '内边缘涂料-PPG2238-801/A', itemName: '溶剂代号', itemType: '其他', required: false, fixedVal: 'PPG07079', lowVal: '', highVal: '', unit: '' },
];

const INITIAL_DISPATCH_ROWS: DispatchRecord[] = [
  { id: 'ds-1', org: '昇兴集团-中山制罐厂', time: '2026-11-19 17:23:03', operator: '潘鑫' },
];

const MATERIAL_PICK_OPTIONS: Array<{ code: string; name: string; spec: string }> = [
  { code: '50054709', name: '外球面轴承座,UCPA206', spec: '' },
  { code: '50004311', name: '轴承,607-2Z,SKF', spec: '' },
  { code: '90011039', name: '墨粉盒京呈TN2520X...', spec: '' },
  { code: '90011040', name: '墨粉盒京呈TN3625X...', spec: '' },
  { code: '50081429', name: '电磁阀组,64M-1073549', spec: '' },
  { code: '50050485', name: '连接件,62M-1026521', spec: '865/65P下焊臂' },
  { code: '50081330', name: '三角带,B4597Li', spec: '' },
  { code: '50081271', name: '直线轴承,LMF20LUU,...', spec: '' },
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

const DEFAULT_EDIT_PARAM_NAMES = [
  '打包方式',
  '每层放置要求',
  '栈板',
  '隔层板',
  '打包带数量',
  '垛数',
  '绕膜层数',
  '每层罐数',
  '包装层数',
  '打包带材质',
  '',
];

function createDefaultEditParams(): ModalParamRow[] {
  return DEFAULT_EDIT_PARAM_NAMES.map((name, i) => ({
    id: `edp-${i + 1}`,
    code: '',
    name: '',
    item: name,
    type: name ? '记录值' : '',
  }));
}

export const ProcessParamTab: React.FC<ProcessParamTabProps> = ({ onShowToast }) => {
  const [rows, setRows] = useState<ProcessParamMaster[]>(INITIAL_MASTER_ROWS);
  const [matRows, setMatRows] = useState<MaterialParamDetail[]>(INITIAL_MAT_ROWS);
  const [dispatchRows, setDispatchRows] = useState<DispatchRecord[]>(INITIAL_DISPATCH_ROWS);

  // Filter states
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [orgFilter, setOrgFilter] = useState('昇兴集团');
  const [pnOp, setPnOp] = useState<MatchOp>('contains');
  const [pnFilter, setPnFilter] = useState('');
  const [opOp, setOpOp] = useState<MatchOp>('contains');
  const [opFilter, setOpFilter] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    org: '昇兴集团',
    pnOp: 'contains' as MatchOp,
    pn: '',
    opOp: 'contains' as MatchOp,
    op: '',
  });

  // Main table states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDetailId, setActiveDetailId] = useState<string>(INITIAL_MASTER_ROWS[0].id);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessParamMaster | null; dir: SortDir }>({
    key: null,
    dir: null,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('');

  // Row "更多" floating menu
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  // Sub-tables selection
  const [selectedMatIds, setSelectedMatIds] = useState<string[]>([]);
  const [selectedDispatchIds, setSelectedDispatchIds] = useState<string[]>([]);

  // Column settings (F4)
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColPanelOpen, setIsColPanelOpen] = useState(false);

  // F2 / F3 Add & Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    productCode: '',
    opCode: '',
    version: '',
    standardHours: '',
    remark: '',
  });
  const [formErrors, setFormErrors] = useState<{ productCode?: boolean; opCode?: boolean }>({});
  const [modalParams, setModalParams] = useState<ModalParamRow[]>([]);
  const [selectedModalParamIds, setSelectedModalParamIds] = useState<string[]>([]);

  // F5 Material Picker Modal
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [pickTargetRowId, setPickTargetRowId] = useState<string | null>(null);
  const [pickKeyword, setPickKeyword] = useState('');
  const [pickAppliedKeyword, setPickAppliedKeyword] = useState('');
  const [pickSelectedCode, setPickSelectedCode] = useState<string | null>(null);

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

  // Filtered & sorted main rows
  const filteredRows = useMemo(() => {
    const matchStr = (val: string, filter: string, op: MatchOp) => {
      if (!filter.trim()) return true;
      const v = (val || '').toLowerCase();
      const f = filter.trim().toLowerCase();
      return op === 'equals' ? v === f : v.includes(f);
    };
    return rows.filter((r) => {
      if (appliedFilters.org !== '全部' && !r.org.includes(appliedFilters.org)) return false;
      if (!matchStr(r.productCode, appliedFilters.pn, appliedFilters.pnOp)) return false;
      if (
        appliedFilters.op.trim() &&
        !matchStr(r.opName, appliedFilters.op, appliedFilters.opOp) &&
        !matchStr(r.opCode, appliedFilters.op, appliedFilters.opOp)
      ) {
        return false;
      }
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
  const activeDetailRow =
    rows.find((r) => r.id === activeDetailId) || rows[0] || null;

  const filteredPickOptions = useMemo(() => {
    const kw = pickAppliedKeyword.trim().toLowerCase();
    if (!kw) return MATERIAL_PICK_OPTIONS;
    return MATERIAL_PICK_OPTIONS.filter(
      (m) => m.code.toLowerCase().includes(kw) || m.name.toLowerCase().includes(kw)
    );
  }, [pickAppliedKeyword]);

  // Handlers
  const handleQuery = () => {
    setAppliedFilters({
      org: orgFilter,
      pnOp,
      pn: pnFilter,
      opOp,
      op: opFilter,
    });
    setCurrentPage(1);
    onShowToast('查询完成，已应用筛选条件', 'info');
  };

  const handleReset = () => {
    setOrgFilter('昇兴集团');
    setPnOp('contains');
    setPnFilter('');
    setOpOp('contains');
    setOpFilter('');
    setAppliedFilters({
      org: '昇兴集团',
      pnOp: 'contains',
      pn: '',
      opOp: 'contains',
      op: '',
    });
    setSelectedIds([]);
    setCurrentPage(1);
    onShowToast('已重置筛选条件', 'info');
  };

  const toggleSort = (key: keyof ProcessParamMaster) => {
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

  // Open F2/F3 Form Modal
  const openFormModal = (mode: 'add' | 'edit', row?: ProcessParamMaster) => {
    setFormMode(mode);
    setFormErrors({});
    setSelectedModalParamIds([]);
    setOpenMoreId(null);
    if (mode === 'add') {
      setEditingId(null);
      setFormState({
        productCode: '',
        opCode: '',
        version: '',
        standardHours: '',
        remark: '',
      });
      setModalParams([]);
    } else if (row) {
      setEditingId(row.id);
      setFormState({
        productCode: row.productCode,
        opCode: row.opCode,
        version: row.craftVersion || '',
        standardHours: row.standardHours || '',
        remark: row.remark || '',
      });
      setModalParams(createDefaultEditParams());
    }
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (closeAfter: boolean) => {
    if (formMode === 'add') {
      const errs = {
        productCode: !formState.productCode.trim(),
        opCode: !formState.opCode.trim(),
      };
      if (errs.productCode || errs.opCode) {
        setFormErrors(errs);
        onShowToast('请填写完整必填项（产品料号、生产工序）', 'error');
        return;
      }
      if (modalParams.length === 0) {
        onShowToast('请至少新增一行物料参数', 'warning');
        return;
      }
      const newId = `pp-${Date.now()}`;
      const newRec: ProcessParamMaster = {
        id: newId,
        org: '昇兴集团',
        productCode: formState.productCode.trim(),
        productName: `产品 ${formState.productCode.trim()}`,
        productSpec: '2090360',
        productVersion: formState.version.trim() || '01',
        craftVersion: '01',
        opName: formState.opCode.trim(),
        opCode: formState.opCode.trim(),
        standardHours: formState.standardHours.trim(),
        remark: formState.remark.trim(),
      };
      setRows((prev) => [newRec, ...prev]);
      setActiveDetailId(newId);
      onShowToast(closeAfter ? '工艺参数新增成功' : '工艺参数已暂存（不退出）', 'success');
      if (closeAfter) {
        setIsFormModalOpen(false);
      } else {
        setFormMode('edit');
        setEditingId(newId);
      }
    } else {
      if (editingId) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? {
                  ...r,
                  craftVersion: formState.version.trim() || r.craftVersion,
                  standardHours: formState.standardHours.trim(),
                  remark: formState.remark.trim(),
                }
              : r
          )
        );
      }
      onShowToast(closeAfter ? '工艺参数修改已保存' : '工艺参数已暂存（不退出）', 'success');
      if (closeAfter) {
        setIsFormModalOpen(false);
      }
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先选择要删除的工艺参数', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      desc: `确定要删除选中的 ${selectedIds.length} 条工艺参数吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedIds);
        setRows((prev) => prev.filter((r) => !delSet.has(r.id)));
        setSelectedIds([]);
        onShowToast(`已删除 ${delSet.size} 条工艺参数`, 'success');
      },
    });
  };

  const handleRowDispatch = (row: ProcessParamMaster) => {
    setOpenMoreId(null);
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setDispatchRows((prev) => [
      {
        id: `ds-${Date.now()}`,
        org: '昇兴集团-中山制罐厂',
        time: nowStr,
        operator: '潘鑫',
      },
      ...prev,
    ]);
    onShowToast(`已下发「${row.productCode} / ${row.opName}」工艺参数至生产工厂`, 'success');
  };

  const handleRowCopy = (row: ProcessParamMaster) => {
    setOpenMoreId(null);
    const cloned: ProcessParamMaster = {
      ...row,
      id: `pp-${Date.now()}`,
      craftVersion: String(Number(row.craftVersion || '1') + 1).padStart(2, '0'),
    };
    setRows((prev) => [cloned, ...prev]);
    onShowToast(`已复制工艺参数（新工艺版本 ${cloned.craftVersion}）`, 'success');
  };

  const handleRowDelete = (row: ProcessParamMaster) => {
    setOpenMoreId(null);
    setConfirmState({
      isOpen: true,
      title: '删除工艺参数',
      desc: `确定要删除「${row.productCode} / ${row.opName}」工艺参数吗？删除后不可恢复。`,
      onConfirm: () => {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        setSelectedIds((prev) => prev.filter((id) => id !== row.id));
        onShowToast(`已删除工艺参数 ${row.opName}`, 'success');
      },
    });
  };

  // Modal param sub-table handlers
  const handleAddModalParam = () => {
    setModalParams((prev) => [
      ...prev,
      {
        id: `mp-row-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        code: '',
        name: '',
        item: '',
        type: '记录值',
      },
    ]);
    onShowToast('已新增一行参数', 'info');
  };

  const handleBatchDeleteModalParams = () => {
    if (selectedModalParamIds.length === 0) {
      onShowToast('请先勾选要删除的参数行', 'warning');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      desc: `确定删除选中的 ${selectedModalParamIds.length} 行参数吗？删除后不可恢复。`,
      onConfirm: () => {
        const delSet = new Set(selectedModalParamIds);
        setModalParams((prev) => prev.filter((p) => !delSet.has(p.id)));
        setSelectedModalParamIds([]);
        onShowToast(`已删除 ${delSet.size} 行参数`, 'success');
      },
    });
  };

  // F5 Material Picker handlers
  const openMaterialPicker = (rowId: string) => {
    setPickTargetRowId(rowId);
    setPickKeyword('');
    setPickAppliedKeyword('');
    setPickSelectedCode(null);
    setIsPickModalOpen(true);
  };

  const handleConfirmPick = () => {
    if (!pickSelectedCode) {
      onShowToast('请先选择一个物料代码', 'warning');
      return;
    }
    const found = MATERIAL_PICK_OPTIONS.find((m) => m.code === pickSelectedCode);
    if (found && pickTargetRowId) {
      setModalParams((prev) =>
        prev.map((p) =>
          p.id === pickTargetRowId
            ? { ...p, code: found.code, name: found.name.replace(/\.\.\.$/, '') }
            : p
        )
      );
      onShowToast(`已选择物料：${found.code}`, 'success');
    }
    setIsPickModalOpen(false);
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

  const allMatSelected =
    matRows.length > 0 && matRows.every((m) => selectedMatIds.includes(m.id));
  const allDispatchSelected =
    dispatchRows.length > 0 && dispatchRows.every((d) => selectedDispatchIds.includes(d.id));
  const allModalParamsSelected =
    modalParams.length > 0 && modalParams.every((p) => selectedModalParamIds.includes(p.id));

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
              <Sliders className="w-5 h-5 text-[#2563EB]" />
              <span className="text-base font-bold text-[#1E293B]">工序工艺参数</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <label className="text-[#1E40AF] font-medium whitespace-nowrap">组织机构</label>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="h-8 px-2.5 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="全部">全部</option>
                <option value="昇兴集团">昇兴集团</option>
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

        {!filterCollapsed && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-0.5 pl-1">
            {/* 产品料号 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium w-16 text-right">产品料号</label>
              <select
                value={pnOp}
                onChange={(e) => setPnOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={pnFilter}
                  onChange={(e) => setPnFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请选择"
                  className="h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-40 font-mono outline-none focus:border-[#2563EB]"
                />
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 生产工序 */}
            <div className="flex items-center gap-1.5">
              <label className="text-[#1E40AF] font-medium w-16 text-right">生产工序</label>
              <select
                value={opOp}
                onChange={(e) => setOpOp(e.target.value as MatchOp)}
                className="h-8 px-2 border border-[#E5E9F0] rounded-lg bg-[#FFFFFF] text-[#1E293B] outline-none cursor-pointer"
              >
                <option value="contains">包含</option>
                <option value="equals">等于</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={opFilter}
                  onChange={(e) => setOpFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="请选择"
                  className="h-8 pl-2.5 pr-7 border border-[#E5E9F0] rounded-lg bg-white text-[#1E293B] w-40 outline-none focus:border-[#2563EB]"
                />
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card 1: 主参数列表 */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden relative">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>
              已选 <strong className="font-mono tabular-nums text-[#1E293B]">{selectedIds.length}</strong> 项
            </span>
            <span aria-hidden="true">·</span>
            <span>
              当前匹配 <strong className="font-mono tabular-nums text-[#1E293B]">{sortedRows.length}</strong> 条工艺参数
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => openFormModal('add')}
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
            <button
              type="button"
              onClick={() => onShowToast('数据已刷新', 'info')}
              className="h-8 w-8 border border-[#E5E9F0] rounded-lg bg-white text-[#1E40AF] hover:bg-[#EDF2F7] transition flex items-center justify-center cursor-pointer"
              title="刷新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
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
                const isDetailActive = activeDetailRow?.id === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('input')) return;
                      setActiveDetailId(row.id);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EBF2FF]/70 hover:bg-[#EBF2FF]'
                        : isDetailActive
                        ? 'bg-[#F0F7FF] hover:bg-[#EBF2FF]/60'
                        : 'hover:bg-[#F4F6F9]'
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
                      const val = String(row[col.key] ?? '');
                      const isSpecHl = isDetailActive && col.key === 'productSpec';
                      return (
                        <td
                          key={`${row.id}-${String(col.key)}-${idx}`}
                          className={`p-2.5 border-r border-[#EDF2F7] ${
                            col.key === 'productCode' ||
                            col.key === 'productSpec' ||
                            col.key === 'productVersion' ||
                            col.key === 'craftVersion' ||
                            col.key === 'opCode'
                              ? 'font-mono tabular-nums'
                              : ''
                          } ${
                            isSpecHl
                              ? 'bg-[#EBF2FF] ring-1 ring-inset ring-[#91CAFF] font-semibold text-[#1E40AF]'
                              : col.highlight
                              ? 'bg-blue-50/20'
                              : ''
                          }`}
                        >
                          {col.key === 'productCode' ? (
                            <span className="font-bold text-[#1E40AF]">{val}</span>
                          ) : (
                            <span className="text-[#1E293B]">{val}</span>
                          )}
                        </td>
                      );
                    })}
                    <td
                      className={`p-2.5 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                        isSelected ? 'bg-[#EBF2FF]' : isDetailActive ? 'bg-[#F0F7FF]' : 'bg-white'
                      }`}
                    >
                      <div className="inline-flex items-center gap-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDetailId(row.id);
                            onShowToast(`已查看「${row.opName}」的物料参数明细`, 'info');
                          }}
                          className="text-[#1E40AF] hover:text-[#165DFF] hover:underline font-medium cursor-pointer"
                        >
                          查看
                        </button>
                        <button
                          type="button"
                          onClick={() => openFormModal('edit', row)}
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
                                onClick={() => handleRowDispatch(row)}
                                className="w-full px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#EBF2FF] hover:text-[#165DFF] flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>下发</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRowCopy(row)}
                                className="w-full px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#EBF2FF] hover:text-[#165DFF] flex items-center gap-1.5 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>复制</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRowDelete(row)}
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
                    暂无匹配的工艺参数记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Main Table Pagination */}
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
            <option value={50}>50 条/页</option>
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

      {/* Card 2: 物料参数明细 */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#1E293B]">物料参数明细</span>
            {activeDetailRow && (
              <>
                <span className="text-[#CBD5E1]">·</span>
                <span className="font-semibold text-[#165DFF]">
                  {activeDetailRow.opName} / {activeDetailRow.opCode}
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-[#64748B]">
            共 <strong className="font-mono text-[#1E293B]">{matRows.length}</strong> 项明细
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allMatSelected}
                    onChange={(e) =>
                      setSelectedMatIds(e.target.checked ? matRows.map((m) => m.id) : [])
                    }
                    className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                  />
                </th>
                {[
                  '物料料号',
                  '物料名称',
                  '项目名称',
                  '项目类型',
                  '必须标示',
                  '固定值',
                  '下限值',
                  '上限值',
                  '单位',
                ].map((label) => (
                  <th key={label} className="p-2.5 border-b border-r last:border-r-0 border-[#E5E9F0]">
                    <div className="inline-flex items-center gap-1">
                      <span>{label}</span>
                      <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {matRows.map((m) => {
                const checked = selectedMatIds.includes(m.id);
                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      checked ? 'bg-[#EBF2FF]/60' : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedMatIds((prev) =>
                            prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                          )
                        }
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] font-mono text-[#1E40AF] font-medium">
                      {m.matNo}
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7]">{m.matName}</td>
                    <td className="p-2.5 border-r border-[#EDF2F7] font-medium">{m.itemName}</td>
                    <td className="p-2.5 border-r border-[#EDF2F7] text-[#64748B]">{m.itemType}</td>
                    <td className="p-2.5 border-r border-[#EDF2F7]">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={m.required}
                        onClick={() => {
                          const nextVal = !m.required;
                          setMatRows((prev) =>
                            prev.map((x) => (x.id === m.id ? { ...x, required: nextVal } : x))
                          );
                          onShowToast(`必须标示已${nextVal ? '开启' : '关闭'}`, 'info');
                        }}
                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${
                          m.required ? 'bg-[#165DFF]' : 'bg-[#CBD5E1]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            m.required ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7] font-mono">{m.fixedVal}</td>
                    <td className="p-2.5 border-r border-[#EDF2F7] font-mono">{m.lowVal}</td>
                    <td className="p-2.5 border-r border-[#EDF2F7] font-mono">{m.highVal}</td>
                    <td className="p-2.5">{m.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-2.5 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{matRows.length}</strong> 条
          </span>
          <span className="w-7 h-7 border border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold font-mono rounded-lg flex items-center justify-center">
            1
          </span>
          <span className="text-[#64748B]">10 条/页</span>
        </div>
      </div>

      {/* Card 3: 下发组织记录 */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF2F7] bg-[#FFFFFF]">
          <span className="text-xs font-bold text-[#1E293B]">下发组织记录</span>
          <span className="text-xs text-[#64748B]">
            共 <strong className="font-mono text-[#1E293B]">{dispatchRows.length}</strong> 条记录
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#FFFFFF] text-[#1E40AF] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allDispatchSelected}
                    onChange={(e) =>
                      setSelectedDispatchIds(e.target.checked ? dispatchRows.map((d) => d.id) : [])
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
                    <span>下发人员</span>
                    <ArrowUpDown className="w-3 h-3 text-[#C5C8BE]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {dispatchRows.map((d) => {
                const checked = selectedDispatchIds.includes(d.id);
                return (
                  <tr
                    key={d.id}
                    className={`transition-colors ${
                      checked ? 'bg-[#EBF2FF]/60' : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <td className="p-2.5 border-r border-[#EDF2F7] text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedDispatchIds((prev) =>
                            prev.includes(d.id) ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                          )
                        }
                        className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer align-middle"
                      />
                    </td>
                    <td className="p-2.5 border-r border-[#EDF2F7]">{d.org}</td>
                    <td className="p-2.5 border-r border-[#EDF2F7] font-mono">{d.time}</td>
                    <td className="p-2.5">{d.operator}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-2.5 border-t border-[#EDF2F7] text-xs text-[#1E40AF] bg-[#FFFFFF]">
          <span>
            共计 <strong className="font-mono tabular-nums text-[#1E293B]">{dispatchRows.length}</strong> 条
          </span>
          <span className="w-7 h-7 border border-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold font-mono rounded-lg flex items-center justify-center">
            1
          </span>
          <span className="text-[#64748B]">10 条/页</span>
        </div>
      </div>

      {/* F2 / F3 新增 / 修改-工艺参数弹窗 */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {formMode === 'add' ? '+新增-工艺参数' : '修改-工艺参数'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">
                    <span className="text-[#EA580C] mr-0.5">*</span>产品料号
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly={formMode === 'edit'}
                      value={formState.productCode}
                      onChange={(e) => {
                        setFormState((prev) => ({ ...prev, productCode: e.target.value }));
                        if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, productCode: false }));
                      }}
                      placeholder="请输入或点击右侧选择"
                      className={`w-full h-8 pl-3 pr-8 border rounded-lg font-mono outline-none ${
                        formMode === 'edit'
                          ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                          : formErrors.productCode
                          ? 'bg-white border-[#EA580C]'
                          : 'bg-white border-[#E5E9F0] focus:border-[#2563EB]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formMode === 'add') {
                          setFormState((prev) => ({ ...prev, productCode: '10034111' }));
                          setFormErrors((prev) => ({ ...prev, productCode: false }));
                          onShowToast('已选择产品料号 10034111', 'info');
                        }
                      }}
                      className="absolute right-2 top-2 text-[#64748B] hover:text-[#165DFF] cursor-pointer"
                      title="选择产品料号"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {formErrors.productCode && (
                    <span className="text-[11px] text-[#EA580C]">请选择产品料号</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">
                    <span className="text-[#EA580C] mr-0.5">*</span>生产工序
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly={formMode === 'edit'}
                      value={formState.opCode}
                      onChange={(e) => {
                        setFormState((prev) => ({ ...prev, opCode: e.target.value }));
                        if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, opCode: false }));
                      }}
                      placeholder="请输入或点击右侧选择"
                      className={`w-full h-8 pl-3 pr-8 border rounded-lg font-mono outline-none ${
                        formMode === 'edit'
                          ? 'bg-[#F4F6F9] text-[#64748B] border-[#E5E9F0] cursor-not-allowed'
                          : formErrors.opCode
                          ? 'bg-white border-[#EA580C]'
                          : 'bg-white border-[#E5E9F0] focus:border-[#2563EB]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formMode === 'add') {
                          setFormState((prev) => ({ ...prev, opCode: '105004-23' }));
                          setFormErrors((prev) => ({ ...prev, opCode: false }));
                          onShowToast('已选择生产工序 105004-23（包装）', 'info');
                        }
                      }}
                      className="absolute right-2 top-2 text-[#64748B] hover:text-[#165DFF] cursor-pointer"
                      title="选择生产工序"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {formErrors.opCode && (
                    <span className="text-[11px] text-[#EA580C]">请选择生产工序</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">版本</label>
                  <input
                    type="text"
                    value={formState.version}
                    onChange={(e) => setFormState((prev) => ({ ...prev, version: e.target.value }))}
                    placeholder="请输入版本号，如 03"
                    className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#1E40AF] font-medium">标准工时</label>
                  <input
                    type="text"
                    value={formState.standardHours}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, standardHours: e.target.value }))
                    }
                    placeholder="请输入"
                    className="h-8 px-3 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[#1E40AF] font-medium">备注</label>
                  <textarea
                    value={formState.remark}
                    maxLength={80}
                    onChange={(e) => setFormState((prev) => ({ ...prev, remark: e.target.value }))}
                    placeholder="请输入"
                    rows={2}
                    className="px-3 py-2 border border-[#E5E9F0] rounded-lg bg-white outline-none focus:border-[#2563EB] resize-y"
                  />
                  <div
                    className={`text-right text-[11px] font-mono ${
                      formState.remark.length >= 80 ? 'text-[#EA580C]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {formState.remark.length} / 80
                  </div>
                </div>
              </div>

              {/* Sub-table toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EDF2F7]">
                <span className="font-bold text-[#1E293B]">物料参数明细</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddModalParam}
                    className="h-8 px-3 bg-[#165DFF] text-white rounded-lg hover:bg-[#0E4FD6] transition flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchDeleteModalParams}
                    className="h-8 px-3 border border-[#EA580C]/50 bg-white text-[#EA580C] hover:bg-[#EA580C]/10 rounded-lg transition flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>批量删除</span>
                  </button>
                </div>
              </div>

              {/* Sub-table */}
              <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[740px]">
                  <thead className="bg-[#F4F6F9] text-[#1E40AF] font-semibold">
                    <tr>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0] w-10 text-center">
                        <input
                          type="checkbox"
                          checked={allModalParamsSelected}
                          onChange={(e) =>
                            setSelectedModalParamIds(
                              e.target.checked ? modalParams.map((p) => p.id) : []
                            )
                          }
                          className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                        />
                      </th>
                      {formMode === 'edit' && (
                        <th className="p-2.5 border-b border-r border-[#E5E9F0] w-12 text-center">
                          编号
                        </th>
                      )}
                      <th className="p-2.5 border-b border-r border-[#E5E9F0] w-44">物料代码</th>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0] w-48">物料名称</th>
                      <th className="p-2.5 border-b border-r border-[#E5E9F0]">
                        {formMode === 'edit' && <span className="text-[#EA580C] mr-0.5">*</span>}
                        项目名称
                      </th>
                      <th className="p-2.5 border-b border-[#E5E9F0] w-40">
                        <span className="text-[#EA580C] mr-0.5">*</span>项目类型
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF2F7]">
                    {modalParams.length === 0 ? (
                      <tr>
                        <td
                          colSpan={formMode === 'edit' ? 6 : 5}
                          className="py-12 text-center text-[#94A3B8]"
                        >
                          <Inbox className="w-8 h-8 mx-auto mb-1.5 text-[#CBD5E1]" />
                          <span>暂无数据</span>
                        </td>
                      </tr>
                    ) : (
                      modalParams.map((p, idx) => {
                        const checked = selectedModalParamIds.includes(p.id);
                        return (
                          <tr
                            key={p.id}
                            className={checked ? 'bg-[#EBF2FF]/60' : 'hover:bg-[#F8FAFC]'}
                          >
                            <td className="p-2 border-r border-[#EDF2F7] text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedModalParamIds((prev) =>
                                    prev.includes(p.id)
                                      ? prev.filter((id) => id !== p.id)
                                      : [...prev, p.id]
                                  )
                                }
                                className="w-3.5 h-3.5 accent-[#165DFF] cursor-pointer"
                              />
                            </td>
                            {formMode === 'edit' && (
                              <td className="p-2 border-r border-[#EDF2F7] text-center font-mono text-[#64748B]">
                                {idx + 2}
                              </td>
                            )}
                            <td className="p-2 border-r border-[#EDF2F7]">
                              <div className="relative">
                                <input
                                  type="text"
                                  readOnly
                                  value={p.code}
                                  onClick={() => openMaterialPicker(p.id)}
                                  placeholder="请选择"
                                  className="w-full h-7 pl-2 pr-7 border border-[#E5E9F0] rounded bg-white font-mono cursor-pointer outline-none focus:border-[#2563EB]"
                                />
                                <button
                                  type="button"
                                  onClick={() => openMaterialPicker(p.id)}
                                  className="absolute right-1.5 top-1.5 text-[#64748B] hover:text-[#165DFF] cursor-pointer"
                                  title="选择物料代码"
                                >
                                  <Search className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-2 border-r border-[#EDF2F7]">
                              <input
                                type="text"
                                readOnly
                                value={p.name}
                                className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-[#F4F6F9] text-[#64748B] outline-none"
                              />
                            </td>
                            <td className="p-2 border-r border-[#EDF2F7]">
                              <input
                                type="text"
                                value={p.item}
                                onChange={(e) =>
                                  setModalParams((prev) =>
                                    prev.map((x) =>
                                      x.id === p.id ? { ...x, item: e.target.value } : x
                                    )
                                  )
                                }
                                placeholder="请输入"
                                className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none focus:border-[#2563EB]"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={p.type}
                                onChange={(e) =>
                                  setModalParams((prev) =>
                                    prev.map((x) =>
                                      x.id === p.id
                                        ? {
                                            ...x,
                                            type: e.target.value as ModalParamRow['type'],
                                          }
                                        : x
                                    )
                                  )
                                }
                                className="w-full h-7 px-2 border border-[#E5E9F0] rounded bg-white outline-none cursor-pointer"
                              >
                                <option value="">请选择</option>
                                <option value="记录值">记录值</option>
                                <option value="固定值">固定值</option>
                                <option value="公式">公式</option>
                                <option value="枚举">枚举</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
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
      {isPickModalOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPickModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#EDF2F7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-[#1E293B]">物料代码 选择</h3>
              <button
                type="button"
                onClick={() => setIsPickModalOpen(false)}
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
                              name="matPickRadio"
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
                onClick={() => setIsPickModalOpen(false)}
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
