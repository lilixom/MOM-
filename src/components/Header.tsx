import React from 'react';
import { History, Menu, RotateCcw, User } from 'lucide-react';

export type TabType = 'tab-calendar' | 'tab-schedule' | 'tab-sales-capacity' | 'tab-kit' | 'tab-changeover' | 'tab-actual';

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
  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'tab-calendar':
        return '工厂日历';
      case 'tab-schedule':
        return '计划日排产';
      case 'tab-sales-capacity':
        return '销售订单与产能负荷';
      case 'tab-kit':
        return '齐套分析';
      case 'tab-changeover':
        return '标准换型工时';
      case 'tab-actual':
        return '实际换型工时';
      default:
        return '计划日排产';
    }
  };

  return (
    <header className="h-16 bg-[#FCFAF7] border-b border-[#E8E4D9] flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-2xs">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-[#5A634D] hover:text-[#4A4E44] hover:bg-[#F0EEE6] rounded-xl transition"
            title="打开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#9DA391] uppercase">
            CURRENT NODE / PATH
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A4E44]">
            <span className="text-[#9DA391] font-normal">M-ERP</span>
            <span className="text-[#D9C5B2]">/</span>
            <span className="text-[#9DA391] font-normal">生产排产</span>
            <span className="text-[#D9C5B2]">/</span>
            <span className="text-[#5A634D] font-bold">{getTabLabel(activeTab)}</span>
          </div>
        </div>
      </div>

      {/* Right: Operator & Actions */}
      <div className="flex items-center gap-3 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 text-[#5A634D] bg-white px-3 py-1.5 rounded-xl border border-[#E8E4D9]">
          <User className="w-3.5 h-3.5 text-[#9DA391]" />
          <span className="text-[#9DA391]">经办人:</span>
          <span className="font-semibold text-[#4A4E44]">系统管理员</span>
        </div>

        <button
          onClick={onToggleVersionDrawer}
          className="px-3.5 py-1.5 border border-[#E8E4D9] rounded-xl font-medium text-[#5A634D] bg-white hover:bg-[#F0EEE6] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <History className="w-3.5 h-3.5 text-[#7D8471]" />
          <span>版本控制 ({currentVersion})</span>
        </button>

        {onResetDemoData && (
          <button
            onClick={onResetDemoData}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 border border-[#E8E4D9] rounded-xl font-medium text-[#5A634D] bg-white hover:bg-[#F0EEE6] hover:text-[#4A4E44] transition cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#9DA391]" />
            <span>重置演示数据</span>
          </button>
        )}
      </div>
    </header>
  );
};

