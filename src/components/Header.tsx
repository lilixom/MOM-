import React from 'react';
import { History, Menu, RotateCcw, User } from 'lucide-react';

import { MOM_IMPORTED_LEAVES } from '../data/momImportedMenu';

export type TabType =
  | 'tab-calendar'
  | 'tab-plan-order'
  | 'tab-work-order'
  | 'tab-mfg-order'
  | 'tab-schedule'
  | 'tab-sales-capacity'
  | 'tab-kit'
  | 'tab-changeover'
  | 'tab-actual'
  | `mom:${string}`;

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentVersion: string;
  onToggleVersionDrawer: () => void;
  onOpenMobileSidebar?: () => void;
  onResetDemoData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentVersion,
  onToggleVersionDrawer,
  onOpenMobileSidebar,
  onResetDemoData,
}) => {
  const getBreadcrumb = (tab: TabType): { module: string; group?: string; label: string } => {
    if (tab.startsWith('mom:')) {
      const pageId = tab.slice(4);
      const leaf = MOM_IMPORTED_LEAVES[pageId];
      if (leaf) {
        return {
          module: leaf.module,
          group: leaf.group && leaf.group !== '默认' ? leaf.group : undefined,
          label: leaf.name,
        };
      }
      return { module: 'MOM', label: pageId };
    }
    switch (tab) {
      case 'tab-calendar':
        return { module: '基础配置', label: '工厂日历' };
      case 'tab-changeover':
        return { module: '基础配置', label: '标准换型工时' };
      case 'tab-actual':
        return { module: '基础配置', label: '实际换型工时' };
      case 'tab-plan-order':
        return { module: '计划管理', label: '计划单' };
      case 'tab-work-order':
        return { module: '计划管理', label: '工单管理' };
      case 'tab-mfg-order':
        return { module: '计划管理', label: '制令单' };
      case 'tab-schedule':
        return { module: '计划管理', label: '计划日排产' };
      case 'tab-sales-capacity':
        return { module: '计划管理', label: '销售订单与产能负荷' };
      case 'tab-kit':
        return { module: '计划管理', label: '齐套分析' };
      default:
        return { module: '计划管理', label: '计划日排产' };
    }
  };

  const crumb = getBreadcrumb(activeTab);

  return (
    <header className="h-16 bg-[#0B2860] border-b border-[#183E84] text-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-sm">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-[#C8DAFA] hover:text-white hover:bg-[#14397D] rounded-lg transition cursor-pointer shrink-0"
            title="打开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-[#9BB8EB] truncate">
            <span>【昇兴集团-中山制罐工厂】</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white truncate">
            <span className="text-[#9BB8EB] font-normal">MOM</span>
            <span className="text-[#4B74BE]">/</span>
            <span className="text-[#9BB8EB] font-normal">{crumb.module}</span>
            {crumb.group && (
              <>
                <span className="text-[#4B74BE]">/</span>
                <span className="text-[#9BB8EB] font-normal">{crumb.group}</span>
              </>
            )}
            <span className="text-[#4B74BE]">/</span>
            <span className="text-white font-bold truncate">{crumb.label}</span>
          </div>
        </div>
      </div>

      {/* Right: Operator & Actions */}
      <div className="flex items-center gap-2.5 text-xs shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 text-[#DCE7FA] bg-[#14397D] px-3 py-1.5 rounded-lg border border-[#27519D] whitespace-nowrap shrink-0">
          <User className="w-3.5 h-3.5 text-[#9BB8EB]" />
          <span className="text-[#9BB8EB]">经办人:</span>
          <span className="font-semibold text-white">系统管理员</span>
        </div>

        <button
          onClick={onToggleVersionDrawer}
          className="px-3.5 py-1.5 border border-[#27519D] rounded-lg font-medium text-[#E6EEFF] bg-[#14397D] hover:bg-[#1C499A] hover:text-white transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <History className="w-3.5 h-3.5 text-[#9BB8EB]" />
          <span>版本控制 ({currentVersion})</span>
        </button>

        {onResetDemoData && (
          <button
            onClick={onResetDemoData}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 border border-[#27519D] rounded-lg font-medium text-[#E6EEFF] bg-[#14397D] hover:bg-[#1C499A] hover:text-white transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#9BB8EB]" />
            <span>重置演示数据</span>
          </button>
        )}
      </div>
    </header>
  );
};
