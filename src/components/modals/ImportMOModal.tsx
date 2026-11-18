import React, { useState, useEffect } from 'react';
import {
  X,
  FileUp,
  Check,
  AlertCircle,
  HelpCircle,
  Search,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';
import { WorkOrder, StatusType } from '../../types';
import { teamOf, FACTORY_LINES } from '../../mockData';
import { toHours, fmtTickHM, ymd, addDays } from '../../utils/timeUtils';

interface ImportMOModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  allDates: string[];
  existingWOs: WorkOrder[];
  onConfirmImportMO: (importedWOs: WorkOrder[], count: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

// MES Manufacturing Order Item from API
export interface MESManufacturingOrder {
  moNo: string;              // 制令单号 e.g. "MO-20260908-01"
  woId: string;              // 关联工单号 e.g. "WO-MO-01"
  line: string;              // 产线 e.g. "10500401"
  team: string;              // 班组 e.g. "SA"
  product: string;           // 产品名称 e.g. "王老吉红罐 310ml"
  matCode: string;           // 物料代码
  date: string;              // 预计开工日期 YYYY-MM-DD
  startTime: string;         // 预计开工时间 e.g. "08:30"
  qty: number;               // 计划数量
  hourCap: number;           // 计划 UPH
  // Calculated fields:
  durationHours: number;     // 计划时长 = 计划数量 / 计划UPH
  endTime: string;           // 预计结束时间 = 预计开工时间 + 计划数量 / 计划UPH
  shift: string;             // 班次 (白班 / 夜班)
  statusInMES: string;       // MES 状态 (如 "已审核下达")
}

export const ImportMOModal: React.FC<ImportMOModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  allDates,
  existingWOs,
  onConfirmImportMO,
  onShowToast,
}) => {
  // API Query states
  const [queryStartDate, setQueryStartDate] = useState<string>(selectedDate);
  const [queryEndDate, setQueryEndDate] = useState<string>(selectedDate);
  const [queryLine, setQueryLine] = useState<string>('all');
  const [isLoadingAPI, setIsLoadingAPI] = useState<boolean>(false);
  const [apiOrders, setApiOrders] = useState<MESManufacturingOrder[]>([]);
  const [selectedMoNos, setSelectedMoNos] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'matchOrAppend' | 'appendOnly'>('matchOrAppend');

  // Initialize dates when opened
  useEffect(() => {
    if (isOpen) {
      setQueryStartDate(selectedDate);
      // Default query range: 3 days
      const endD = ymd(addDays(new Date(selectedDate + 'T00:00:00'), 2));
      setQueryEndDate(endD);
      // Auto-trigger initial API query
      fetchMesOrders(selectedDate, endD, 'all');
    }
  }, [isOpen, selectedDate]);

  // Generate simulated MES API response
  const generateMockMesOrders = (startDate: string, endDate: string, lineFilter: string): MESManufacturingOrder[] => {
    const results: MESManufacturingOrder[] = [];
    const s = new Date(startDate + 'T00:00:00').getTime();
    const e = new Date(endDate + 'T00:00:00').getTime();
    const daySpan = Math.max(1, Math.round((e - s) / 86400000) + 1);

    const productTemplates = [
      { product: '王老吉红罐 310ml', matCode: 'WLJ-310-01', hourCap: 40800, qty: 489600, start: '08:30' },
      { product: '加多宝金罐 310ml', matCode: 'JDB-310-02', hourCap: 39000, qty: 468000, start: '08:30' },
      { product: '青岛啤酒经典 500ml', matCode: 'TS-500-01', hourCap: 38000, qty: 380000, start: '20:30' },
      { product: '雪花勇闯天涯 330ml', matCode: 'SNOW-330-01', hourCap: 40000, qty: 400000, start: '08:30' },
      { product: '百威纯生啤酒 500ml', matCode: 'BW-500-01', hourCap: 36000, qty: 360000, start: '20:30' },
      { product: '喜力星银经典 330ml', matCode: 'HL-330-02', hourCap: 42000, qty: 336000, start: '08:30' },
    ];

    const linesToUse = lineFilter === 'all' ? FACTORY_LINES.slice(0, 6) : [lineFilter];

    let orderSeq = 1;
    for (let dIdx = 0; dIdx < Math.min(daySpan, 7); dIdx++) {
      const curDateObj = addDays(new Date(startDate + 'T00:00:00'), dIdx);
      const curDateStr = ymd(curDateObj);

      linesToUse.forEach((line, lIdx) => {
        const tmpl = productTemplates[(orderSeq + lIdx) % productTemplates.length];
        const durationHours = Math.round((tmpl.qty / tmpl.hourCap) * 10) / 10;
        const startH = toHours(tmpl.start);
        const endH = startH + durationHours;
        const endTime = fmtTickHM(endH);
        const shift = tmpl.start === '20:30' ? '夜班' : '白班';

        const moNo = `MO-${curDateStr.replace(/-/g, '')}-${String(orderSeq).padStart(2, '0')}`;
        const woId = `WO-${moNo}`;

        results.push({
          moNo,
          woId,
          line,
          team: teamOf(line),
          product: tmpl.product,
          matCode: tmpl.matCode,
          date: curDateStr,
          startTime: tmpl.start,
          qty: tmpl.qty,
          hourCap: tmpl.hourCap,
          durationHours,
          endTime,
          shift,
          statusInMES: '已审核下达',
        });
        orderSeq++;
      });
    }

    return results;
  };

  // Check conflicts according to Rule 3:
  // "工单日排产 排产开始、结束日期 存在冲突，或超出日期，不允许导入。"
  const validateOrderConflict = (order: MESManufacturingOrder): {
    hasConflict: boolean;
    reason?: string;
    isExceedDate?: boolean;
    conflictWOId?: string;
  } => {
    const startH = toHours(order.startTime);
    const durationHours = order.qty / order.hourCap;
    const endH = startH + durationHours;

    // 1. Check if exceeding operating day window (08:30 to 08:30+1 = 32.5 hours)
    if (endH > 32.51) {
      return {
        hasConflict: true,
        isExceedDate: true,
        reason: `超出当日排产工作窗（完工时间 ${fmtTickHM(endH)} 超过次日08:30）`,
      };
    }

    // 2. Check overlap against existing work orders on the same line and date
    const sameLineDateWOs = existingWOs.filter(
      (w) => w.line === order.line && (w.date === order.date || (!w.date && order.date === selectedDate))
    );

    for (const wo of sameLineDateWOs) {
      // If updating the same work order, ignore self
      if (wo.moNo === order.moNo || wo.id === order.woId) {
        continue;
      }
      const woStartH = toHours(wo.start);
      const woEndH = toHours(wo.end);

      // Overlap condition: startA < endB && startB < endA
      const overlapStart = Math.max(startH, woStartH);
      const overlapEnd = Math.min(endH, woEndH);
      if (overlapEnd - overlapStart > 0.05) {
        return {
          hasConflict: true,
          conflictWOId: wo.id,
          reason: `与产线已有工单 ${wo.id} (${wo.start}~${wo.end}) 排产时段冲突`,
        };
      }
    }

    return { hasConflict: false };
  };

  // Fetch MES Orders through simulated API
  const fetchMesOrders = (startDate: string, endDate: string, line: string) => {
    setIsLoadingAPI(true);
    setTimeout(() => {
      const orders = generateMockMesOrders(startDate, endDate, line);
      setApiOrders(orders);
      setIsLoadingAPI(false);

      // Auto-select valid non-conflicting orders
      const validNos = orders
        .filter((ord) => !validateOrderConflict(ord).hasConflict)
        .map((o) => o.moNo);
      setSelectedMoNos(validNos);
    }, 400);
  };

  if (!isOpen) return null;

  // Handler for searching API
  const handleSearchAPI = () => {
    if (!queryStartDate || !queryEndDate) {
      onShowToast('请选择完整的查询日期范围', 'warning');
      return;
    }
    if (queryStartDate > queryEndDate) {
      onShowToast('开始日期不能大于结束日期', 'warning');
      return;
    }
    fetchMesOrders(queryStartDate, queryEndDate, queryLine);
  };

  // Toggle single order selection
  const handleToggleSelect = (moNo: string) => {
    setSelectedMoNos((prev) =>
      prev.includes(moNo) ? prev.filter((id) => id !== moNo) : [...prev, moNo]
    );
  };

  // Select all valid orders
  const handleSelectAllValid = () => {
    const validNos = apiOrders
      .filter((ord) => !validateOrderConflict(ord).hasConflict)
      .map((o) => o.moNo);

    if (selectedMoNos.length === validNos.length) {
      setSelectedMoNos([]);
    } else {
      setSelectedMoNos(validNos);
    }
  };

  // Confirm import selected manufacturing orders
  const handleExecuteImport = () => {
    const targetOrders = apiOrders.filter((o) => selectedMoNos.includes(o.moNo));

    if (targetOrders.length === 0) {
      onShowToast('⚠️ 请至少勾选一张制令单！', 'warning');
      return;
    }

    // Double check conflict rule #3
    const conflictItems = targetOrders
      .map((ord) => ({ ord, check: validateOrderConflict(ord) }))
      .filter((item) => item.check.hasConflict);

    if (conflictItems.length > 0) {
      const first = conflictItems[0];
      onShowToast(`⚠️ 制令单 ${first.ord.moNo} 存在排产冲突或超出日期，不允许导入！`, 'error');
      return;
    }

    // Build the imported work orders mapping
    // 规则 2：
    // 制令单 计划数量 -> 工单日排产 计划数量
    // 制令单 预计开工时间 -> 工单日排产 排产开始日期
    // 制令单 预计开工时间 + 计划数量/计划UPH -> 工单日排产 排产结束日期
    // 状态 -> 'locked' (已锁定(已生成制令单))
    const updatedExisting = [...existingWOs];

    targetOrders.forEach((row, index) => {
      const newWO: WorkOrder = {
        id: row.woId,
        moNo: row.moNo,
        line: row.line,
        team: row.team,
        product: row.product,
        matCode: row.matCode,
        status: 'locked' as StatusType, // 导入后状态置为已锁定
        shift: row.shift,
        hourCap: row.hourCap,
        changeover: 0.5,
        otherStop: 0,
        start: row.startTime,
        end: row.endTime,
        actual: null,
        selected: false,
        generated: true, // 标记已生成制令单
        date: row.date,
        planQty: row.qty,
      };

      if (importMode === 'matchOrAppend') {
        const existingIndex = updatedExisting.findIndex(
          (w) => w.id === row.woId || (w.moNo && w.moNo === row.moNo)
        );
        if (existingIndex >= 0) {
          // Update and lock existing work order
          updatedExisting[existingIndex] = {
            ...updatedExisting[existingIndex],
            moNo: row.moNo,
            status: 'locked',
            generated: true,
            planQty: row.qty,
            product: row.product,
            matCode: row.matCode,
            start: row.startTime,
            end: row.endTime,
            date: row.date,
          };
        } else {
          updatedExisting.push(newWO);
        }
      } else {
        // Append only
        let uniqueId = newWO.id;
        if (updatedExisting.some((w) => w.id === uniqueId)) {
          uniqueId = `${uniqueId}_IMP${index + 1}`;
        }
        updatedExisting.push({ ...newWO, id: uniqueId });
      }
    });

    onConfirmImportMO(updatedExisting, targetOrders.length);
    onClose();
  };

  // Selected orders count and quantity
  const activeSelectedOrders = apiOrders.filter((o) => selectedMoNos.includes(o.moNo));
  const totalSelectedQty = activeSelectedOrders.reduce((sum, o) => sum + o.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-[#E8E4D9]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E8E4D9] flex items-center justify-between bg-[#FCFAF7] shrink-0">
          <div className="text-base font-bold text-[#4A4E44] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5A634D]/10 flex items-center justify-center text-[#5A634D]">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>导入制令单（MES API 在线查询与锁定）</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200">
                  导入后自动锁定工单
                </span>
              </div>
              <p className="text-[11px] text-[#7D8471] font-normal">
                通过 MES API 接口按开工日期范围拉取制令单，自动校验排产时段与冲突后确认导入
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9DA391] hover:text-[#4A4E44] rounded-lg hover:bg-[#F0EEE6] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Rule banner conforming strictly to user requirements */}
          <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5 shadow-2xs">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold block text-blue-900">制令单导入规则说明：</span>
              <p className="text-blue-800">
                1. 按日期范围查询预计开工时间制令单后，选择制令单确认系统将自动匹配或追加对应工单日排产，并将排产状态置为<b>「已锁定(已生成制令单)」</b>。
              </p>
              <p className="text-blue-800">
                2. <b>计划排程映射：</b>制令单计划数量 → 工单日排产计划数量；制令单预计开工时间 → 工单日排产排产开始日期；制令单预计开工时间 + 计划数量/计划UPH → 工单日排产排产结束日期。
              </p>
              <p className="text-rose-800 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>3. 工单日排产 排产开始、结束日期 存在冲突，或超出日期，不允许导入。</span>
              </p>
            </div>
          </div>

          {/* Query Filter Toolbar */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E8E4D9] shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#5A634D]" />
                  <span className="font-semibold text-[#4A4E44]">预计开工日期:</span>
                  <input
                    type="date"
                    value={queryStartDate}
                    onChange={(e) => setQueryStartDate(e.target.value)}
                    className="p-1.5 px-2 bg-[#FCFAF7] border border-[#E8E4D9] rounded-lg text-xs font-mono text-[#4A4E44] focus:outline-none focus:border-[#5A634D]"
                  />
                  <span className="text-[#9DA391] font-bold">~</span>
                  <input
                    type="date"
                    value={queryEndDate}
                    onChange={(e) => setQueryEndDate(e.target.value)}
                    className="p-1.5 px-2 bg-[#FCFAF7] border border-[#E8E4D9] rounded-lg text-xs font-mono text-[#4A4E44] focus:outline-none focus:border-[#5A634D]"
                  />
                </div>

                {/* Quick Range Presets */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setQueryStartDate(selectedDate);
                      setQueryEndDate(selectedDate);
                      fetchMesOrders(selectedDate, selectedDate, queryLine);
                    }}
                    className="px-2 py-1 bg-[#F0EEE6] hover:bg-[#E8E4D9] rounded-md text-[11px] text-[#5A634D] transition cursor-pointer"
                  >
                    当天
                  </button>
                  <button
                    onClick={() => {
                      setQueryStartDate(selectedDate);
                      const end3 = ymd(addDays(new Date(selectedDate + 'T00:00:00'), 2));
                      setQueryEndDate(end3);
                      fetchMesOrders(selectedDate, end3, queryLine);
                    }}
                    className="px-2 py-1 bg-[#F0EEE6] hover:bg-[#E8E4D9] rounded-md text-[11px] text-[#5A634D] transition cursor-pointer"
                  >
                    未来3天
                  </button>
                  <button
                    onClick={() => {
                      setQueryStartDate(selectedDate);
                      const end7 = ymd(addDays(new Date(selectedDate + 'T00:00:00'), 6));
                      setQueryEndDate(end7);
                      fetchMesOrders(selectedDate, end7, queryLine);
                    }}
                    className="px-2 py-1 bg-[#F0EEE6] hover:bg-[#E8E4D9] rounded-md text-[11px] text-[#5A634D] transition cursor-pointer"
                  >
                    未来7天
                  </button>
                </div>

                {/* Line selector */}
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#5A634D]" />
                  <span className="font-semibold text-[#4A4E44]">产线:</span>
                  <select
                    value={queryLine}
                    onChange={(e) => setQueryLine(e.target.value)}
                    className="p-1.5 px-2 bg-[#FCFAF7] border border-[#E8E4D9] rounded-lg text-xs text-[#4A4E44] focus:outline-none"
                  >
                    <option value="all">全部线体</option>
                    {FACTORY_LINES.map((line) => (
                      <option key={line} value={line}>
                        {line} ({teamOf(line)}组)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearchAPI}
                disabled={isLoadingAPI}
                className="px-4 py-1.5 bg-[#5A634D] text-white rounded-xl text-xs font-semibold hover:bg-[#4A4E44] transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLoadingAPI ? '正在调用 API 查询...' : '查询 MES 制令单'}</span>
              </button>
            </div>
          </div>

          {/* API Result List Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#4A4E44]">
                  MES 制令单列表（已检索到 {apiOrders.length} 条）
                </span>
                <span className="text-[#7D8471]">
                  已勾选: <b className="text-amber-700 font-mono">{selectedMoNos.length}</b> 张
                  {totalSelectedQty > 0 && `（计划数量: ${totalSelectedQty.toLocaleString()} 件）`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllValid}
                  className="px-2.5 py-1 border border-[#E8E4D9] rounded-lg bg-white hover:bg-[#F0EEE6] text-[11px] font-medium text-[#5A634D] transition cursor-pointer"
                >
                  {selectedMoNos.length > 0 && selectedMoNos.length === apiOrders.filter((o) => !validateOrderConflict(o).hasConflict).length
                    ? '取消全选'
                    : '勾选所有无冲突制令单'}
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="border border-[#E8E4D9] rounded-xl overflow-x-auto max-h-[360px] bg-white shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FCFAF7] text-[#5A634D] sticky top-0 border-b border-[#E8E4D9] z-10">
                  <tr>
                    <th className="p-2.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          apiOrders.length > 0 &&
                          selectedMoNos.length === apiOrders.filter((o) => !validateOrderConflict(o).hasConflict).length
                        }
                        onChange={handleSelectAllValid}
                        className="rounded accent-[#5A634D] cursor-pointer"
                        title="全选合规制令单"
                      />
                    </th>
                    <th className="p-2.5">制令单号</th>
                    <th className="p-2.5">工单号</th>
                    <th className="p-2.5">产线/班组</th>
                    <th className="p-2.5">品名规格</th>
                    <th className="p-2.5 text-right">计划数量</th>
                    <th className="p-2.5 text-right">计划UPH</th>
                    <th className="p-2.5">预计开工时间</th>
                    <th className="p-2.5">预计完工时间 (计算)</th>
                    <th className="p-2.5 text-center">冲突校验</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EEE6]">
                  {isLoadingAPI ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#7D8471]">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5A634D] mb-2" />
                        <span>正在从 MES 系统拉取待排产制令单数据...</span>
                      </td>
                    </tr>
                  ) : apiOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#7D8471]">
                        <span>所选日期范围内未查询到待排产制令单，请调整日期重新查询。</span>
                      </td>
                    </tr>
                  ) : (
                    apiOrders.map((ord) => {
                      const conflict = validateOrderConflict(ord);
                      const isSelected = selectedMoNos.includes(ord.moNo);

                      return (
                        <tr
                          key={ord.moNo}
                          className={`transition ${
                            conflict.hasConflict
                              ? 'bg-rose-50/40 opacity-80'
                              : isSelected
                              ? 'bg-amber-50/60'
                              : 'hover:bg-[#F9F7F2]'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={conflict.hasConflict}
                              onChange={() => handleToggleSelect(ord.moNo)}
                              className="rounded accent-[#5A634D] cursor-pointer disabled:cursor-not-allowed"
                              title={conflict.hasConflict ? conflict.reason : '勾选导入'}
                            />
                          </td>

                          {/* MO No */}
                          <td className="p-2.5 font-mono font-bold text-[#2D3325]">
                            {ord.moNo}
                          </td>

                          {/* WO No */}
                          <td className="p-2.5 font-mono text-[#5A634D]">{ord.woId}</td>

                          {/* Line */}
                          <td className="p-2.5 text-[#4A4E44]">
                            <span className="font-semibold">{ord.line}</span>
                            <span className="ml-1 text-[11px] text-[#7D8471]">({ord.team})</span>
                          </td>

                          {/* Product */}
                          <td className="p-2.5 max-w-[170px] truncate" title={ord.product}>
                            <div className="text-[#2D3325] font-medium">{ord.product}</div>
                            <div className="text-[10px] text-[#7D8471] font-mono">{ord.matCode}</div>
                          </td>

                          {/* Qty */}
                          <td className="p-2.5 text-right font-mono font-bold text-[#2D3325]">
                            {ord.qty.toLocaleString()} 件
                          </td>

                          {/* UPH */}
                          <td className="p-2.5 text-right font-mono text-[#5A634D]">
                            {ord.hourCap.toLocaleString()}/h
                          </td>

                          {/* Start Time */}
                          <td className="p-2.5 font-mono text-[#2D3325]">
                            <div>{ord.date}</div>
                            <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>{ord.startTime}</span>
                            </div>
                          </td>

                          {/* End Time = start + qty/UPH */}
                          <td className="p-2.5 font-mono">
                            <div className="text-amber-900 font-semibold">{ord.endTime}</div>
                            <div className="text-[10px] text-[#7D8471]" title="开工时间 + (计划数量 / 计划UPH)">
                              ({ord.durationHours}h 工时)
                            </div>
                          </td>

                          {/* Conflict Status */}
                          <td className="p-2.5 text-center">
                            {conflict.hasConflict ? (
                              <div
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300"
                                title={conflict.reason}
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>
                                  {conflict.isExceedDate ? '超出日期' : '时段冲突'}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>可导入</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom hint for conflict filtering */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#7D8471] px-1">
              <span>* 存在排产冲突或超出日期范围的制令单已被智能保护并禁用勾选。</span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 可导入
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></span> 冲突/超期禁用
              </span>
            </div>
          </div>

          {/* Merge Strategy Option */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4D9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#4A4E44]">排产工单合并方式：</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[#4A4E44]">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'matchOrAppend'}
                  onChange={() => setImportMode('matchOrAppend')}
                  className="accent-[#5A634D]"
                />
                <span>匹配现有工单并锁定（推荐）</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[#4A4E44] ml-2">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'appendOnly'}
                  onChange={() => setImportMode('appendOnly')}
                  className="accent-[#5A634D]"
                />
                <span>作为新工单追加</span>
              </label>
            </div>

            <div className="text-[11px] text-[#7D8471]">
              导入后工单状态变更为：
              <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold border border-amber-200">
                已锁定(已生成制令单)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#E8E4D9] flex items-center justify-between bg-[#FCFAF7] shrink-0">
          <div className="text-xs text-[#5A634D]">
            <span>
              已选择 <b className="text-amber-800 font-bold">{selectedMoNos.length}</b> 张制令单
              {selectedMoNos.length > 0 && `（计划总量: ${totalSelectedQty.toLocaleString()} 件）`}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E8E4D9] rounded-xl text-xs font-medium text-[#5A634D] bg-white hover:bg-[#F0EEE6] transition cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={selectedMoNos.length === 0}
              className="px-5 py-2 bg-[#5A634D] text-white rounded-xl text-xs font-semibold hover:bg-[#4A4E44] transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>
                确认导入所选制令单并锁定
                {selectedMoNos.length > 0 ? ` (${selectedMoNos.length} 张)` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
