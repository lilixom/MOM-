import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart2,
  BarChart3,
  Box,
  Boxes,
  Calendar,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cpu,
  Database,
  Factory,
  FileBarChart,
  FileCheck2,
  FileCog,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  FolderKanban,
  Gauge,
  GitBranch,
  GitCommitHorizontal,
  Layers,
  LineChart,
  ListChecks,
  Microscope,
  Package,
  PackageCheck,
  PackageSearch,
  Palette,
  PieChart,
  Radio,
  Route,
  ScanBarcode,
  ScanLine,
  Search,
  Settings,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  SlidersHorizontal,
  Table2,
  Tag,
  Tags,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Warehouse,
  Wrench,
  X,
} from 'lucide-react';
import { TabType } from './Header';
import { MOM_IMPORTED_LEAVES, MOM_IMPORTED_MENU } from '../data/momImportedMenu';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

type IconComponent = React.ComponentType<{ className?: string }>;

interface CustomMenuItem {
  id: TabType;
  label: string;
  icon: IconComponent;
  badge?: string;
}

const CUSTOM_BASE_ITEMS: CustomMenuItem[] = [
  { id: 'tab-calendar', label: '工厂日历', icon: Calendar, badge: '核心' },
  { id: 'tab-changeover', label: '标准换型工时', icon: Clock },
  { id: 'tab-actual', label: '实际换型工时', icon: ClipboardList },
];

const CUSTOM_PLAN_ITEMS: CustomMenuItem[] = [
  { id: 'tab-plan-order', label: '计划单', icon: FileSpreadsheet, badge: '4' },
  { id: 'tab-work-order', label: '工单管理', icon: Wrench, badge: '5' },
  { id: 'tab-mfg-order', label: '制令单', icon: FileCheck2, badge: '20' },
  { id: 'tab-schedule', label: '计划日排产', icon: Layers, badge: '12' },
  { id: 'tab-sales-capacity', label: '销售与产能负荷', icon: ShoppingBag, badge: '热' },
  { id: 'tab-kit', label: '齐套分析', icon: Package, badge: '4' },
];

const CUSTOM_PROCESS_ITEMS: CustomMenuItem[] = [
  { id: 'tab-process-info', label: '工序信息', icon: GitBranch, badge: '25' },
  { id: 'tab-process-param', label: '工序工艺参数', icon: Sliders, badge: '11' },
  { id: 'tab-process-file', label: '工艺文件', icon: FileText, badge: '2' },
  { id: 'tab-process-sheet', label: '工艺单', icon: ClipboardList, badge: '10' },
  { id: 'tab-process-op-template', label: '工艺单工序模板', icon: Layers, badge: '10' },
  { id: 'tab-process-sheet-template', label: '工艺单模板', icon: FileCog, badge: '4' },
  { id: 'tab-can-spec-maint', label: '罐型规格维护', icon: Box, badge: '1' },
  { id: 'tab-pack-list-config', label: '包材清单配置', icon: Package, badge: '111' },
  { id: 'tab-process-op-config-item', label: '工艺单工序参数配置', icon: Settings2, badge: '71' },
  { id: 'tab-coating-config', label: '涂料配置', icon: Palette, badge: '15' },
  { id: 'tab-process-bom', label: '工艺单BOM', icon: Boxes, badge: '14' },
];

const MODULE_ICONS: Record<string, IconComponent> = {
  m0: Settings,
  m1: Warehouse,
  m2: Calendar,
  m3: Cpu,
  m4: ShieldCheck,
  m5: BarChart2,
  m6: Wrench,
};

const LEAF_ICON_POOL: Record<string, IconComponent[]> = {
  config: [Sliders, Settings2, FileCog, Database, Tags, Tag, Wrench, FolderKanban],
  list: [FileSpreadsheet, Table2, ClipboardList, ListChecks, FileSearch, PackageSearch, Layers],
  form: [FileCheck2, ClipboardCheck, CheckSquare, FileText, PackageCheck, Truck],
  report: [FileBarChart, BarChart3, TrendingUp, PieChart, LineChart, Table2],
  dashboard: [Gauge, BarChart2, PieChart, TrendingUp, Activity, LineChart],
  trace: [GitBranch, Route, GitCommitHorizontal, ScanLine, FileSearch],
  iot: [Activity, Radio, Cpu, Gauge, LineChart],
  default: [FileText, Table2, ClipboardList, Box, Tag, Sliders, CheckSquare, Layers],
};

function hashCode(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function getGroupIcon(groupName: string): IconComponent {
  if (/系统|条码/.test(groupName)) return ScanBarcode;
  if (/物料|BOM/.test(groupName)) return Boxes;
  if (/业务|模型/.test(groupName)) return FolderKanban;
  if (/采购/.test(groupName)) return ShoppingBag;
  if (/入库/.test(groupName)) return ArrowDownToLine;
  if (/库内/.test(groupName)) return Warehouse;
  if (/出库|发货/.test(groupName)) return ArrowUpFromLine;
  if (/人员/.test(groupName)) return Users;
  if (/检验方案/.test(groupName)) return ListChecks;
  if (/检验执行/.test(groupName)) return ClipboardCheck;
  if (/异常/.test(groupName)) return AlertTriangle;
  if (/仪器/.test(groupName)) return Microscope;
  if (/样品|化学/.test(groupName)) return FlaskConical;
  if (/质量报表|质量数据/.test(groupName)) return ShieldCheck;
  if (/看板/.test(groupName)) return Gauge;
  if (/追溯/.test(groupName)) return GitBranch;
  if (/IOT|采集/.test(groupName)) return Activity;
  if (/资产/.test(groupName)) return Cpu;
  if (/维保/.test(groupName)) return Wrench;
  if (/备件/.test(groupName)) return Package;
  if (/工装/.test(groupName)) return Settings2;
  if (/配置中心/.test(groupName)) return Settings;
  if (/数据|分析|报表/.test(groupName)) return BarChart3;
  if (/工作台/.test(groupName)) return Layers;
  if (/过程管控/.test(groupName)) return SlidersHorizontal;
  if (/查询/.test(groupName)) return FileSearch;
  return FolderKanban;
}

function getLeafIcon(id: string, name: string, arch: string): IconComponent {
  if (/看板/.test(name)) return Gauge;
  if (/追溯|链路/.test(name)) return GitBranch;
  if (/条码|扫码|标签/.test(name)) return ScanBarcode;
  if (/入库|收料/.test(name)) return ArrowDownToLine;
  if (/出库|发料|发货/.test(name)) return ArrowUpFromLine;
  if (/盘点|库位|库存|调拨/.test(name)) return Boxes;
  if (/采购|供应商/.test(name)) return Truck;
  if (/不良|异常|报废|报警|预警/.test(name)) return ShieldAlert;
  if (/化学品|试剂/.test(name)) return FlaskConical;
  if (/仪器|设备|机台/.test(name)) return Cpu;
  if (/人员|员工|班组/.test(name)) return UserCheck;
  if (/检验|抽样|IQC|IPQC|FQC|OQC|QC/i.test(name)) return ClipboardCheck;
  if (/排产|日历|时间|班次|上线/.test(name)) return CalendarClock;
  if (/BOM|物料|替代/.test(name)) return Package;
  if (/工序|工艺|参数/.test(name)) return Wrench;
  if (/SPC|趋势|良率|OEE|分析/i.test(name)) return TrendingUp;

  const pool = LEAF_ICON_POOL[arch] || LEAF_ICON_POOL.default;
  return pool[hashCode(`${id}:${name}`) % pool.length];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [menuSearch, setMenuSearch] = useState('');

  // Track which top-level modules & nested groups are expanded
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    'custom-base': true,
    'custom-process': true,
    m2: true, // 计划管理 expanded by default
    m0: false,
    m1: false,
    m3: true, // 生产管理 expanded so updated & newly imported menus are immediately visible
    m4: false,
    m5: false,
    m6: true, // 设备管理 expanded so newly imported menus are immediately visible
  });

  const [openSubGroups, setOpenSubGroups] = useState<Record<string, boolean>>({
    'm2:默认': true,
    'm2:信息查询': true,
  });

  // Automatically expand active imported page's module & subgroup
  useEffect(() => {
    if (activeTab.startsWith('mom:')) {
      const pageId = activeTab.slice(4);
      const leaf = MOM_IMPORTED_LEAVES[pageId];
      if (leaf) {
        const mod = MOM_IMPORTED_MENU.find((m) => m.name === leaf.module);
        if (mod) {
          setOpenModules((prev) => ({ ...prev, [mod.id]: true }));
          setOpenSubGroups((prev) => ({
            ...prev,
            [`${mod.id}:${leaf.group}`]: true,
          }));
        }
      }
    }
  }, [activeTab]);

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleSubGroup = (key: string) => {
    setOpenSubGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const query = menuSearch.trim().toLowerCase();

  // Search results across both custom & imported pages
  const searchResults = useMemo(() => {
    if (!query) return null;
    const matches: Array<{
      id: TabType;
      label: string;
      path: string;
      icon: IconComponent;
      badge?: string;
    }> = [];

    CUSTOM_BASE_ITEMS.forEach((it) => {
      if (it.label.toLowerCase().includes(query) || '基础配置'.includes(query)) {
        matches.push({
          id: it.id,
          label: it.label,
          path: '基础配置',
          icon: it.icon,
          badge: it.badge,
        });
      }
    });
    CUSTOM_PLAN_ITEMS.forEach((it) => {
      if (it.label.toLowerCase().includes(query) || '计划管理'.includes(query)) {
        matches.push({
          id: it.id,
          label: it.label,
          path: '计划管理',
          icon: it.icon,
          badge: it.badge,
        });
      }
    });
    CUSTOM_PROCESS_ITEMS.forEach((it) => {
      if (it.label.toLowerCase().includes(query) || '工艺管理'.includes(query)) {
        matches.push({
          id: it.id,
          label: it.label,
          path: '工艺管理',
          icon: it.icon,
          badge: it.badge,
        });
      }
    });

    MOM_IMPORTED_MENU.forEach((mod) => {
      mod.groups.forEach((grp) => {
        grp.items.forEach((item) => {
          const full = `${mod.name} ${grp.name} ${item.name} ${item.id}`.toLowerCase();
          if (full.includes(query)) {
            matches.push({
              id: `mom:${item.id}`,
              label: item.name,
              path: grp.name === '默认' ? mod.name : `${mod.name} / ${grp.name}`,
              icon: getLeafIcon(item.id, item.name, item.arch),
              badge: item.id.toUpperCase(),
            });
          }
        });
      });
    });

    return matches;
  }, [query]);

  const m2Module = useMemo(
    () => MOM_IMPORTED_MENU.find((m) => m.id === 'm2'),
    []
  );

  const otherModules = useMemo(
    () => MOM_IMPORTED_MENU.filter((m) => m.id !== 'm2'),
    []
  );

  const renderCustomButton = (item: CustomMenuItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.id)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
          isActive
            ? 'bg-[#165DFF] text-white shadow-sm font-semibold'
            : 'text-[#C8DAFA] hover:text-white hover:bg-[#14397D]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isActive ? 'text-white' : 'text-[#8EB0EC] group-hover:text-white'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums shrink-0 ${
              isActive
                ? 'bg-white/20 text-white font-bold'
                : 'bg-[#133677] text-[#9BB8EB]'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const renderImportedModule = (
    mod: (typeof MOM_IMPORTED_MENU)[number],
    extraCustomItems?: CustomMenuItem[]
  ) => {
    const isOpen = !!openModules[mod.id];
    const ModIcon = MODULE_ICONS[mod.id] || SlidersHorizontal;
    const totalCount =
      mod.groups.reduce((sum, g) => sum + g.items.length, 0) +
      (extraCustomItems ? extraCustomItems.length : 0);

    return (
      <div key={mod.id} className="space-y-1">
        <button
          type="button"
          onClick={() => toggleModule(mod.id)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            isOpen
              ? 'bg-[#103270] text-white'
              : 'text-[#B5CCF4] hover:bg-[#14397D] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ModIcon className="w-4 h-4 text-[#8EB0EC] shrink-0" />
            <span className="truncate">{mod.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono tabular-nums text-[#7FA2E0]">
              {totalCount}
            </span>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#7FA2E0]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#7FA2E0]" />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="pl-2 space-y-1">
            {extraCustomItems && extraCustomItems.length > 0 && (
              <div className="space-y-0.5 pb-1">
                {extraCustomItems.map((it) => renderCustomButton(it))}
              </div>
            )}

            {mod.groups.map((grp) => {
              const subKey = `${mod.id}:${grp.name}`;
              const isSubOpen = !!openSubGroups[subKey];
              const GrpIcon = getGroupIcon(grp.name);

              if (grp.name === '默认') {
                return (
                  <div key={subKey} className="space-y-0.5">
                    {grp.items.map((item) => {
                      const tabId: TabType = `mom:${item.id}`;
                      const isActive = activeTab === tabId;
                      const LeafIcon = getLeafIcon(item.id, item.name, item.arch);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(tabId)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer group ${
                            isActive
                              ? 'bg-[#165DFF] text-white font-semibold shadow-sm'
                              : 'text-[#C8DAFA] hover:text-white hover:bg-[#14397D]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <LeafIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive
                                  ? 'text-white'
                                  : 'text-[#8EB0EC] group-hover:text-white'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>
                          {!item.id.startsWith('prod-') && (
                            <span className="text-[10px] font-mono text-[#7FA2E0] shrink-0 ml-1">
                              {item.id}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div key={subKey} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleSubGroup(subKey)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#8EB0EC] hover:text-white hover:bg-[#113473] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GrpIcon className="w-3.5 h-3.5 text-[#7FA2E0] shrink-0" />
                      <span className="truncate">{grp.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono tabular-nums text-[#6E93D6]">
                        ({grp.items.length})
                      </span>
                      {isSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-[#6E93D6]" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-[#6E93D6]" />
                      )}
                    </div>
                  </button>

                  {isSubOpen && (
                    <div className="pl-2.5 space-y-0.5 border-l border-[#1A428A] ml-2">
                      {grp.items.map((item) => {
                        const tabId: TabType = `mom:${item.id}`;
                        const isActive = activeTab === tabId;
                        const LeafIcon = getLeafIcon(item.id, item.name, item.arch);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(tabId)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer group ${
                              isActive
                                ? 'bg-[#165DFF] text-white font-semibold shadow-sm'
                                : 'text-[#C8DAFA] hover:text-white hover:bg-[#14397D]'
                            }`}
                          >
                            <LeafIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive
                                  ? 'text-white'
                                  : 'text-[#8EB0EC] group-hover:text-white'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="w-64 bg-[#0B2860] text-[#C8DAFA] flex flex-col h-full select-none border-r border-[#183E84]">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#183E84] flex items-center gap-3 bg-[#081F4D] shrink-0">
        <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] flex items-center justify-center shadow-sm shrink-0">
          <Factory className="w-5 h-5 text-[#E61E3C]" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm text-white tracking-wide truncate">
            制造业智能 MOM 系统
          </span>
          <span className="text-[10px] text-[#8EB0EC] font-mono tracking-wider uppercase font-semibold">
            MANUFACTURING MOM
          </span>
        </div>
      </div>

      {/* Menu Search Input */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder="搜索菜单 / 页面 (312)"
            className="w-full h-8 pl-3 pr-8 rounded-md bg-[#113372] border border-[#244D97] text-xs text-white placeholder-[#8CA9DF] outline-none focus:border-[#5D95FF] transition"
          />
          {menuSearch ? (
            <button
              type="button"
              onClick={() => setMenuSearch('')}
              className="absolute right-2 top-2 text-[#8CA9DF] hover:text-white cursor-pointer"
              title="清除搜索"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-[#8CA9DF] absolute right-2.5 top-2.5 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-1.5 px-2.5 space-y-2">
        {searchResults ? (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] text-[#8EB0EC] font-mono">
              匹配结果 ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-[#7FA2E0]">
                未找到匹配的菜单页面
              </div>
            ) : (
              searchResults.slice(0, 80).map((item) => {
                const isActive = activeTab === item.id;
                const ResultIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-[#165DFF] text-white font-semibold'
                        : 'text-[#C8DAFA] hover:text-white hover:bg-[#14397D]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ResultIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive
                              ? 'text-white'
                              : 'text-[#8EB0EC] group-hover:text-white'
                          }`}
                        />
                        <span className="truncate font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono text-[#8EB0EC] shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 pl-5.5 ${
                        isActive ? 'text-white/80' : 'text-[#7FA2E0]'
                      }`}
                    >
                      {item.path}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <>
            {/* 基础配置 (Custom Core Views) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleModule('custom-base')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  openModules['custom-base']
                    ? 'bg-[#103270] text-white'
                    : 'text-[#B5CCF4] hover:bg-[#14397D] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SlidersHorizontal className="w-4 h-4 text-[#8EB0EC] shrink-0" />
                  <span className="truncate">基础配置</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono tabular-nums text-[#7FA2E0]">
                    {CUSTOM_BASE_ITEMS.length}
                  </span>
                  {openModules['custom-base'] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#7FA2E0]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#7FA2E0]" />
                  )}
                </div>
              </button>
              {openModules['custom-base'] && (
                <div className="pl-2 space-y-0.5">
                  {CUSTOM_BASE_ITEMS.map((it) => renderCustomButton(it))}
                </div>
              )}
            </div>

            {/* 计划管理 (Merged Custom Scheduling Views + Imported m2 Items) */}
            {m2Module && renderImportedModule(m2Module, CUSTOM_PLAN_ITEMS)}

            {/* 工艺管理 (Process Management) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleModule('custom-process')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  openModules['custom-process']
                    ? 'bg-[#103270] text-white'
                    : 'text-[#B5CCF4] hover:bg-[#14397D] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch className="w-4 h-4 text-[#8EB0EC] shrink-0" />
                  <span className="truncate">工艺管理</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono tabular-nums text-[#7FA2E0]">
                    {CUSTOM_PROCESS_ITEMS.length}
                  </span>
                  {openModules['custom-process'] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#7FA2E0]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#7FA2E0]" />
                  )}
                </div>
              </button>
              {openModules['custom-process'] && (
                <div className="pl-2 space-y-0.5">
                  {CUSTOM_PROCESS_ITEMS.map((it) => renderCustomButton(it))}
                </div>
              )}
            </div>

            {/* 配置中心 / 仓库管理 / 生产管理 / 质量管理 / 数据中心 */}
            {otherModules.map((mod) => renderImportedModule(mod))}
          </>
        )}
      </div>

      {/* Footer / System Status */}
      <div className="p-3.5 px-4 border-t border-[#183E84] bg-[#081F4D] flex items-center justify-between text-xs text-[#8EB0EC] shrink-0">
        <span className="text-[11px] font-mono">MOM 节点正常</span>
        <span className="text-[10px] text-[#7FA2E0] font-mono">v1.27</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
