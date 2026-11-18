import React from 'react';
import { Calendar, Layers, Package, Clock, ClipboardList, Factory, ShoppingBag } from 'lucide-react';
import { TabType } from './Header';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuGroups = [
    {
      title: '基础配置',
      items: [
        { id: 'tab-calendar' as TabType, label: '工厂日历', icon: Calendar, badge: '核心' },
        { id: 'tab-changeover' as TabType, label: '标准换型工时', icon: Clock },
        { id: 'tab-actual' as TabType, label: '实际换型工时', icon: ClipboardList },
      ],
    },
    {
      title: '排产管理',
      items: [
        { id: 'tab-schedule' as TabType, label: '计划日排产', icon: Layers, badge: '12' },
        { id: 'tab-sales-capacity' as TabType, label: '销售与产能负荷', icon: ShoppingBag, badge: '热' },
        { id: 'tab-kit' as TabType, label: '齐套分析', icon: Package, badge: '4' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="w-64 bg-[#1E231B] text-[#D0D4CA] flex flex-col h-full select-none border-r border-[#2B3227]">
      {/* Brand Header */}
      <div className="p-4 px-5 border-b border-[#2B3227] flex items-center gap-3 bg-[#1A1F17]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5A634D] to-[#7D8471] flex items-center justify-center text-white shadow-md shadow-[#5A634D]/20 shrink-0">
          <Factory className="w-5 h-5 text-[#FDFBF7]" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm text-[#F0EEE6] tracking-wide truncate">
            制造业智能 ERP 系统
          </span>
          <span className="text-[10px] text-[#A4B494] font-mono tracking-wider uppercase font-semibold">
            MANUFACTURING ERP
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-[#2B3227]">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3 text-[11px] font-semibold text-[#8C9482] uppercase tracking-wider mb-2">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#5A634D] text-[#FCFAF7] shadow-md shadow-[#5A634D]/30 font-semibold'
                      : 'text-[#B0B8A8] hover:text-[#F0EEE6] hover:bg-[#2A3125]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#FCFAF7]' : 'text-[#8C9482] group-hover:text-[#D0D4CA]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-[#FCFAF7] font-bold'
                          : 'bg-[#2A3125] text-[#8C9482]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / System Status */}
      <div className="p-3.5 px-4 border-t border-[#2B3227] bg-[#171B14] flex items-center justify-between text-xs text-[#8C9482]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A4B494] animate-pulse" />
          <span className="text-[11px] font-mono">ERP 节点正常</span>
        </div>
        <span className="text-[10px] text-[#8C9482] font-mono">v1.27</span>
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
