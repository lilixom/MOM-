import React, { useState } from 'react';
import {
  TabType,
  Header,
} from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VersionDrawer } from './components/VersionDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { FactoryCalendarTab } from './components/FactoryCalendarTab';
import { ScheduleTab } from './components/ScheduleTab';
import { SalesAndCapacityTab } from './components/SalesAndCapacityTab';
import { KitTab } from './components/KitTab';
import { StandardChangeoverTab } from './components/StandardChangeoverTab';
import { ActualChangeoverTab } from './components/ActualChangeoverTab';
import { PlanOrderTab } from './components/PlanOrderTab';
import { WorkOrderManageTab } from './components/WorkOrderManageTab';
import { MfgOrderTab } from './components/MfgOrderTab';
import { MomImportedPageTab } from './components/MomImportedPageTab';
import { CopperWeighingRecordTab } from './components/CopperWeighingRecordTab';
import { CopperOutsourcingReceiptTab } from './components/CopperOutsourcingReceiptTab';
import { CopperOutsourcingSummaryTab } from './components/CopperOutsourcingSummaryTab';
import { PurchaseOrderTab } from './components/PurchaseOrderTab';
import { SalesDeliveryTab } from './components/SalesDeliveryTab';
import { WarehouseInventoryTab } from './components/WarehouseInventoryTab';
import { SapInventoryTab } from './components/SapInventoryTab';
import { WarehouseModelingTab } from './components/WarehouseModelingTab';
import { ProcessInfoTab } from './components/ProcessInfoTab';
import { ProcessParamTab } from './components/ProcessParamTab';
import { ProcessFileTab } from './components/ProcessFileTab';
import { ProcessSheetTab } from './components/ProcessSheetTab';
import { ProcessOpTemplateTab } from './components/ProcessOpTemplateTab';
import { ProcessSheetTemplateTab } from './components/ProcessSheetTemplateTab';
import { CanSpecMaintTab } from './components/CanSpecMaintTab';
import { PackListConfigTab } from './components/PackListConfigTab';
import { ProcessOpConfigItemTab } from './components/ProcessOpConfigItemTab';
import { CoatingConfigTab } from './components/CoatingConfigTab';
import { ProcessBomTab } from './components/ProcessBomTab';
import { EquipmentModuleTab } from './components/EquipmentModuleTab';
import { ProductionModuleTab } from './components/ProductionModuleTab';
import { PageLogicNoteBlock } from './components/PageLogicNoteBlock';
import { MOM_IMPORTED_LEAVES } from './data/momImportedMenu';
import { PRODUCTION_PAGE_ID_MAP } from './data/productionData';
import { MOM_PAGE_DEFAULT_NOTES } from './data/momPageNotes';

import { ImportModal } from './components/modals/ImportModal';
import { InsertWOModal } from './components/modals/InsertWOModal';
import { GenerateModal } from './components/modals/GenerateModal';
import { KitCheckModal } from './components/modals/KitCheckModal';
import { PackModal } from './components/modals/PackModal';
import { CoModal } from './components/modals/CoModal';
import { ActualCoModal } from './components/modals/ActualCoModal';
import { TimeSlotDrawer } from './components/modals/TimeSlotDrawer';

import {
  WorkOrder,
  FactoryCalState,
  SalesOrder,
  KitItem,
  ChangeoverRule,
  ActualChangeoverItem,
  KitComponent,
  TimeSlotMaintenanceRule,
  PlanOrder,
  WorkOrderManageItem,
  MfgOrderItem,
} from './types';
import {
  DEFAULT_SELECTED_DATE,
  getInitialWorkOrders,
  buildInitialCal,
  INITIAL_SALES_ORDERS,
  INITIAL_KIT_DATA,
  INITIAL_CHANGEOVER_DATA,
  INITIAL_ACTUAL_DATA,
  INITIAL_TIME_SLOT_RULES,
  INITIAL_PLAN_ORDERS,
  INITIAL_WORK_ORDER_MANAGE,
  INITIAL_MFG_ORDERS,
  VERSIONS,
} from './mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('tab-schedule');
  const [currentVersion, setCurrentVersion] = useState('v1.27');
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Main state
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_SELECTED_DATE);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(getInitialWorkOrders);
  const [calState, setCalState] = useState<FactoryCalState>(buildInitialCal);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [kitData, setKitData] = useState<KitItem[]>(INITIAL_KIT_DATA);
  const [changeoverData, setChangeoverData] =
    useState<ChangeoverRule[]>(INITIAL_CHANGEOVER_DATA);
  const [actualData, setActualData] =
    useState<ActualChangeoverItem[]>(INITIAL_ACTUAL_DATA);
  const [timeSlotRules, setTimeSlotRules] =
    useState<TimeSlotMaintenanceRule[]>(INITIAL_TIME_SLOT_RULES);
  const [planOrders, setPlanOrders] = useState<PlanOrder[]>(INITIAL_PLAN_ORDERS);
  const [workOrderManageItems, setWorkOrderManageItems] = useState<WorkOrderManageItem[]>(INITIAL_WORK_ORDER_MANAGE);
  const [mfgOrders, setMfgOrders] = useState<MfgOrderItem[]>(INITIAL_MFG_ORDERS);
  const [isScheduleFrozen, setIsScheduleFrozen] = useState(false);

  // Modals & Drawers state
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isKitCheckModalOpen, setIsKitCheckModalOpen] = useState(false);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [isCoModalOpen, setIsCoModalOpen] = useState(false);
  const [isActualCoModalOpen, setIsActualCoModalOpen] = useState(false);
  const [isTimeSlotDrawerOpen, setIsTimeSlotDrawerOpen] = useState(false);
  const [timeSlotCategory, setTimeSlotCategory] = useState<'slot' | 'operation'>('slot');

  // Kit check state tracking
  const [kitCheckedDate, setKitCheckedDate] = useState<string | null>(null);

  // Selected WO and pack edits
  const [kitWO, setKitWO] = useState<WorkOrder | null>(null);
  const [kitScheduledQty, setKitScheduledQty] = useState<number>(0);
  const [kitComponents, setKitComponents] = useState<KitComponent[]>([]);
  const [packEdits, setPackEdits] = useState<Record<string, number[]>>({});
  const [coToEdit, setCoToEdit] = useState<ChangeoverRule | null>(null);

  const showToast = (
    msg: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetDemoData = () => {
    setWorkOrders(getInitialWorkOrders());
    setCalState(buildInitialCal());
    setSalesOrders(INITIAL_SALES_ORDERS);
    setKitData(INITIAL_KIT_DATA);
    setChangeoverData(INITIAL_CHANGEOVER_DATA);
    setActualData(INITIAL_ACTUAL_DATA);
    setPlanOrders(INITIAL_PLAN_ORDERS);
    setWorkOrderManageItems(INITIAL_WORK_ORDER_MANAGE);
    setMfgOrders(INITIAL_MFG_ORDERS);
    setPackEdits({});
    setKitCheckedDate(null);
    setIsScheduleFrozen(false);
    showToast('🔄 演示数据已恢复初始状态', 'info');
  };

  const handleToggleFreezeSchedule = () => {
    setIsScheduleFrozen((prev) => {
      const next = !prev;
      if (next) {
        showToast('❄️ 排产已冻结！已开启防覆盖保护：禁止甘特图拖拉调整，自动排产禁止覆盖。', 'info');
      } else {
        showToast('🔓 排产已解冻！已恢复甘特图拖拽调整与自动排产功能。', 'success');
      }
      return next;
    });
  };

  // Work Orders Update Handler (Invalidates kit calculation state)
  const handleUpdateWorkOrders = (newWOs: WorkOrder[]) => {
    setWorkOrders(newWOs);
    if (kitCheckedDate !== null) setKitCheckedDate(null);
  };

  // Date Selection Handler
  const handleSelectDate = (d: string) => {
    setSelectedDate(d);
    setKitCheckedDate(null); // Switching date invalidates kit check gate
  };

  // Confirm Import
  const handleConfirmImport = (importedWOs: WorkOrder[]) => {
    const filtered = workOrders.filter((r) => r.date !== selectedDate);
    handleUpdateWorkOrders([...filtered, ...importedWOs]);
    showToast(`✅ 已导入 ${importedWOs.length} 条排产工单（${selectedDate}）`, 'success');
  };

  // Confirm Insert WO
  const handleConfirmInsertWO = (newWO: WorkOrder) => {
    handleUpdateWorkOrders([...workOrders, newWO]);
  };

  // Confirm Generate Shop Orders
  const handleConfirmGenerateShopOrders = (selectedIds: string[], targetDate: string) => {
    const updated = workOrders.map((r) =>
      selectedIds.includes(r.id) ? { ...r, generated: true, selected: false } : r
    );
    handleUpdateWorkOrders(updated);
    showToast(`✅ 已生成 ${selectedIds.length} 张制令单并下发车间（${targetDate}）`, 'success');
  };

  // Kit Check Modal Trigger
  const handleOpenKitCheck = (
    wo: WorkOrder,
    qty: number,
    comps: KitComponent[]
  ) => {
    setKitWO(wo);
    setKitScheduledQty(qty);
    setKitComponents(comps);
    setIsKitCheckModalOpen(true);
    setKitCheckedDate(selectedDate); // Unlocks Shop Order generation
  };

  // Package Modal Trigger
  const handleOpenPack = (wo: WorkOrder, comps: KitComponent[]) => {
    setKitWO(wo);
    setKitComponents(comps);
    setIsPackModalOpen(true);
  };

  const handleSavePackEdits = (woId: string, values: number[]) => {
    setPackEdits((prev) => ({ ...prev, [woId]: values }));
    showToast('📦 包材仓库库存已保存（齐套运算结果同步更新）', 'success');
  };

  // Changeover Rules Add/Edit/Delete/SetDefault
  const handleSaveCoRule = (rule: Partial<ChangeoverRule>) => {
    if (rule.seq) {
      setChangeoverData((prev) =>
        prev.map((c) => {
          if (c.seq === rule.seq) {
            return { ...c, ...rule } as ChangeoverRule;
          }
          return rule.isDefault ? { ...c, isDefault: false } : c;
        })
      );
      showToast('✅ 标准换型工时修改成功', 'success');
    } else {
      const nextSeq = Math.max(0, ...changeoverData.map((c) => c.seq)) + 1;
      const newRule: ChangeoverRule = {
        seq: nextSeq,
        process: rule.process || '401制罐换型',
        code: rule.code || '401' + nextSeq,
        desc: rule.desc || '自定义换型描述',
        hoursH: rule.hoursH || 8,
        hoursM: rule.hoursM || 480,
        createBy: '系统管理员',
        createDate: new Date().toLocaleDateString(),
        modDate: '',
        modBy: '',
        isDefault: !!rule.isDefault,
      };
      setChangeoverData((prev) =>
        rule.isDefault
          ? [...prev.map((c) => ({ ...c, isDefault: false })), newRule]
          : [...prev, newRule]
      );
      showToast('✅ 新增标准换型工时成功', 'success');
    }
  };

  const handleSetDefaultCoRule = (seq: number) => {
    setChangeoverData((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.seq === seq,
      }))
    );
    showToast('✅ 已设为默认标准换型规则（全表中仅保留一个默认）', 'success');
  };

  const handleDeleteCoRule = (seq: number) => {
    if (confirm('确认删除该标准换型规则？')) {
      setChangeoverData((prev) => prev.filter((c) => c.seq !== seq));
      showToast('🗑️ 已删除该标准换型规则', 'info');
    }
  };

  const handleSaveActualCo = (item: ActualChangeoverItem) => {
    setActualData((prev) => [item, ...prev]);
    showToast('✅ 实际换型记录保存成功', 'success');
  };

  const handleOpenTimeSlotDrawer = (category: 'slot' | 'operation' = 'slot') => {
    setTimeSlotCategory(category);
    setIsTimeSlotDrawerOpen(true);
  };

  const handleAddTimeSlotRule = (rule: TimeSlotMaintenanceRule) => {
    setTimeSlotRules((prev) =>
      rule.isDefault
        ? [rule, ...prev.map((r) => ({ ...r, isDefault: false }))]
        : [rule, ...prev]
    );
  };

  const handleSetDefaultTimeSlotRule = (id: string) => {
    setTimeSlotRules((prev) =>
      prev.map((r) => ({
        ...r,
        isDefault: r.id === id,
      }))
    );
    showToast('✅ 已设为默认时段配置（全表中仅保留一个默认）', 'success');
  };

  const handleDeleteTimeSlotRule = (id: string) => {
    setTimeSlotRules((prev) => prev.filter((r) => r.id !== id));
  };

  const allDates = [...new Set(workOrders.map((r) => r.date))].sort();
  if (!allDates.includes(selectedDate)) allDates.unshift(selectedDate);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1E293B] font-sans flex antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentVersion={currentVersion}
          onToggleVersionDrawer={() => setIsVersionDrawerOpen(!isVersionDrawerOpen)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onResetDemoData={handleResetDemoData}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 md:p-6 space-y-4">
          <PageLogicNoteBlock
            pageKey={activeTab}
            defaultNote={MOM_PAGE_DEFAULT_NOTES[activeTab] || ''}
            onShowToast={showToast}
          />
          {activeTab === 'tab-calendar' && (
            <FactoryCalendarTab
              selectedDate={selectedDate}
              calState={calState}
              onUpdateCalState={setCalState}
              workOrders={workOrders}
              onUpdateWorkOrders={handleUpdateWorkOrders}
              onSelectDate={handleSelectDate}
              onOpenTimeSlotDrawer={handleOpenTimeSlotDrawer}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-plan-order' && (
            <PlanOrderTab
              planOrders={planOrders}
              onUpdatePlanOrders={setPlanOrders}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-work-order' && (
            <WorkOrderManageTab
              items={workOrderManageItems}
              onUpdateItems={setWorkOrderManageItems}
              onNavigateToPlanOrder={() => setActiveTab('tab-plan-order')}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-mfg-order' && (
            <MfgOrderTab
              items={mfgOrders}
              onUpdateItems={setMfgOrders}
              onNavigateToPlanOrder={() => setActiveTab('tab-plan-order')}
              onNavigateToWorkOrder={() => setActiveTab('tab-work-order')}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-schedule' && (
            <ScheduleTab
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              workOrders={workOrders}
              onUpdateWorkOrders={handleUpdateWorkOrders}
              calState={calState}
              salesOrders={salesOrders}
              kitData={kitData}
              packEdits={packEdits}
              onOpenInsertModal={() => setIsInsertModalOpen(true)}
              onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
              onOpenKitCheckModal={handleOpenKitCheck}
              onOpenPackModal={handleOpenPack}
              onOpenTimeSlotDrawer={handleOpenTimeSlotDrawer}
              kitCheckedDate={kitCheckedDate}
              isScheduleFrozen={isScheduleFrozen}
              onToggleFreezeSchedule={handleToggleFreezeSchedule}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-sales-capacity' && (
            <SalesAndCapacityTab
              salesOrders={salesOrders}
              workOrders={workOrders}
              onSelectDate={handleSelectDate}
              onSelectTab={setActiveTab}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-kit' && (
            <KitTab kitData={kitData} onShowToast={showToast} />
          )}

          {activeTab === 'tab-changeover' && (
            <StandardChangeoverTab
              changeoverData={changeoverData}
              onOpenAddModal={() => {
                setCoToEdit(null);
                setIsCoModalOpen(true);
              }}
              onEditRule={(rule) => {
                setCoToEdit(rule);
                setIsCoModalOpen(true);
              }}
              onDeleteRule={handleDeleteCoRule}
              onSetDefaultRule={handleSetDefaultCoRule}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-actual' && (
            <ActualChangeoverTab
              workOrders={workOrders}
              onUpdateWorkOrders={handleUpdateWorkOrders}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-process-info' && (
            <ProcessInfoTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-process-param' && (
            <ProcessParamTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-process-file' && (
            <ProcessFileTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-process-sheet' && (
            <ProcessSheetTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-process-op-template' && (
            <ProcessOpTemplateTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-process-sheet-template' && (
            <ProcessSheetTemplateTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-can-spec-maint' && (
            <CanSpecMaintTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-pack-list-config' && (
            <PackListConfigTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-process-op-config-item' && (
            <ProcessOpConfigItemTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-coating-config' && (
            <CoatingConfigTab onShowToast={showToast} />
          )}

          {activeTab === 'tab-process-bom' && (
            <ProcessBomTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p036' && (
            <WarehouseModelingTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p048' && (
            <PurchaseOrderTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p069' && (
            <WarehouseInventoryTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p073' && (
            <SalesDeliveryTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p085' && (
            <SapInventoryTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p112' && (
            <CopperWeighingRecordTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p113' && (
            <CopperOutsourcingSummaryTab onShowToast={showToast} />
          )}

          {activeTab === 'mom:p114' && (
            <CopperOutsourcingReceiptTab onShowToast={showToast} />
          )}

          {activeTab.startsWith('mom:eq-') && (
            <EquipmentModuleTab
              pageKey={activeTab.slice(7)}
              onNavigate={(key) => setActiveTab(`mom:eq-${key}`)}
              onShowToast={showToast}
            />
          )}

          {activeTab.startsWith('mom:') &&
            Boolean(PRODUCTION_PAGE_ID_MAP[activeTab.slice(4)]) && (
              <ProductionModuleTab
                pageKey={PRODUCTION_PAGE_ID_MAP[activeTab.slice(4)]}
                onShowToast={showToast}
              />
            )}

          {activeTab.startsWith('mom:') &&
            !activeTab.startsWith('mom:eq-') &&
            !PRODUCTION_PAGE_ID_MAP[activeTab.slice(4)] &&
            activeTab !== 'mom:p036' &&
            activeTab !== 'mom:p048' &&
            activeTab !== 'mom:p069' &&
            activeTab !== 'mom:p073' &&
            activeTab !== 'mom:p085' &&
            activeTab !== 'mom:p112' &&
            activeTab !== 'mom:p113' &&
            activeTab !== 'mom:p114' && (
              <MomImportedPageTab
                pageId={activeTab.slice(4)}
                leafMeta={MOM_IMPORTED_LEAVES[activeTab.slice(4)]}
                onShowToast={showToast}
              />
            )}
        </main>
      </div>

      {/* Version Control Drawer */}
      <VersionDrawer
        isOpen={isVersionDrawerOpen}
        onClose={() => setIsVersionDrawerOpen(false)}
        versions={VERSIONS}
        currentVersion={currentVersion}
        onSelectVersion={(tag) => {
          setCurrentVersion(tag);
          showToast(`已切换到版本 ${tag}`, 'info');
        }}
      />

      <InsertWOModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        selectedDate={selectedDate}
        onConfirmInsert={handleConfirmInsertWO}
        onShowToast={showToast}
      />

      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        selectedDate={selectedDate}
        allDates={allDates}
        workOrders={workOrders}
        kitData={kitData}
        kitCheckedDate={kitCheckedDate}
        onRunKitCheck={() => {
          setKitCheckedDate(selectedDate);
          showToast('⚡ 全局物料齐套运算完成！已更新物料齐套状态与校验结果', 'success');
        }}
        onConfirmGenerate={handleConfirmGenerateShopOrders}
      />

      <KitCheckModal
        isOpen={isKitCheckModalOpen}
        onClose={() => setIsKitCheckModalOpen(false)}
        workOrder={kitWO}
        scheduledQty={kitScheduledQty}
        bomComponents={kitComponents}
      />

      <PackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        workOrder={kitWO}
        bomComponents={kitComponents}
        onSavePackEdits={handleSavePackEdits}
      />

      <CoModal
        isOpen={isCoModalOpen}
        onClose={() => setIsCoModalOpen(false)}
        ruleToEdit={coToEdit}
        onSaveRule={handleSaveCoRule}
      />

      <ActualCoModal
        isOpen={isActualCoModalOpen}
        onClose={() => setIsActualCoModalOpen(false)}
        onSaveActual={handleSaveActualCo}
      />

      <TimeSlotDrawer
        isOpen={isTimeSlotDrawerOpen}
        onClose={() => setIsTimeSlotDrawerOpen(false)}
        activeCategory={timeSlotCategory}
        onChangeCategory={setTimeSlotCategory}
        selectedDate={selectedDate}
        rules={timeSlotRules}
        onAddRule={handleAddTimeSlotRule}
        onDeleteRule={handleDeleteTimeSlotRule}
        onSetDefaultRule={handleSetDefaultTimeSlotRule}
        onShowToast={showToast}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

