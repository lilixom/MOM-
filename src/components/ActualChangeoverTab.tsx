import React, { useState, useMemo } from 'react';
import { WorkOrder } from '../types';
import { ClipboardList, Download, Edit3, Check, X, Info, Search, Filter } from 'lucide-react';
import { FACTORY_LINES, teamOf, WO_MASTER, ACTUAL_CO_BY_TYPE } from '../mockData';

interface ActualChangeoverTabProps {
  workOrders: WorkOrder[];
  onUpdateWorkOrders: (workOrders: WorkOrder[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ActualChangeoverTab: React.FC<ActualChangeoverTabProps> = ({
  workOrders,
  onUpdateWorkOrders,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Editing state for actual changeover
  const [editingWoId, setEditingWoId] = useState<string | null>(null);
  const [editActTimeWO, setEditActTimeWO] = useState<number>(0);

  // Derive generated shop orders from schedule workOrders
  const generatedWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => wo.generated);
  }, [workOrders]);

  // Sort chronologically (date, then start time)
  const sortedWOs = useMemo(() => {
    return [...workOrders].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start.localeCompare(b.start);
    });
  }, [workOrders]);

  // Build full actual changeover rows with previous shop order lookup
  const tableRows = useMemo(() => {
    return generatedWorkOrders.map((wo) => {
      const lineTeam = wo.team || teamOf(wo.line);
      const cmd = `ZL-${wo.id}`;
      const matCode =
        wo.matCode ||
        WO_MASTER[wo.id]?.mat ||
        (wo.product.includes('泰奇') ? '10024249' : wo.product.includes('牛磺酸') ? '10011888' : '10022364');

      // Find previous work order on the same line
      const lineWOs = sortedWOs.filter((r) => r.line === wo.line);
      const currentIndex = lineWOs.findIndex((r) => r.id === wo.id);
      const prevWO = currentIndex > 0 ? lineWOs[currentIndex - 1] : null;

      const prevCmd = prevWO ? (prevWO.generated ? `ZL-${prevWO.id}` : `GD-${prevWO.id}`) : '—';
      const prevMatCode = prevWO
        ? prevWO.matCode ||
          WO_MASTER[prevWO.id]?.mat ||
          (prevWO.product.includes('泰奇') ? '10024249' : '10022364')
        : '—';
      const prevProductName = prevWO ? prevWO.product : '—';

      const stdTimeWO = wo.changeover || 0.5;
      const actTimeWO =
        wo.changeoverActual != null
          ? wo.changeoverActual
          : wo.coType && ACTUAL_CO_BY_TYPE[wo.coType]
          ? ACTUAL_CO_BY_TYPE[wo.coType]
          : Number((stdTimeWO * 0.9).toFixed(1));

      return {
        woId: wo.id,
        date: wo.date,
        line: lineTeam,
        lineCode: wo.line,
        wo: wo.id,
        cmd,
        matCode,
        productName: wo.product,
        capPerHr: wo.hourCap,
        prevCmd,
        prevMatCode,
        prevProductName,
        stdTimeWO,
        actTimeWO,
        coType: wo.coType,
        coDesc: wo.coDesc,
        shift: wo.shift,
      };
    });
  }, [generatedWorkOrders, sortedWOs]);

  // Filter rows
  const filtered = useMemo(() => {
    return tableRows.filter((r) => {
      if (selectedLine && r.line !== selectedLine && r.lineCode !== selectedLine) return false;
      if (selectedDateFilter && r.date !== selectedDateFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match =
          r.line.toLowerCase().includes(term) ||
          r.lineCode.toLowerCase().includes(term) ||
          r.wo.toLowerCase().includes(term) ||
          r.cmd.toLowerCase().includes(term) ||
          r.matCode.toLowerCase().includes(term) ||
          r.productName.toLowerCase().includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [tableRows, selectedLine, selectedDateFilter, searchTerm]);

  // Start editing
  const handleStartEdit = (row: (typeof tableRows)[0]) => {
    setEditingWoId(row.woId);
    setEditActTimeWO(row.actTimeWO);
  };

  // Save edit
  const handleSaveEdit = (woId: string) => {
    const updated = workOrders.map((wo) =>
      wo.id === woId ? { ...wo, changeoverActual: editActTimeWO } : wo
    );
    onUpdateWorkOrders(updated);
    setEditingWoId(null);
    onShowToast(`✅ 已更新制令单 ZL-${woId} 的实际换型工时为 ${editActTimeWO}h`, 'success');
  };

  const handleCancelEdit = () => {
    setEditingWoId(null);
  };

  const allDates = Array.from(new Set(tableRows.map((r) => r.date))).sort();

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-2xs p-4 space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EEE6] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7D8471]/10 flex items-center justify-center text-[#7D8471]">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#4A4E44]">实际换型工时维护</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                数据源：计划日排产已生成制令单（{generatedWorkOrders.length} 张）
              </span>
            </div>
            <p className="text-[11px] text-[#9DA391] mt-0.5">
              自动汇聚计划日排产已下发的制令单，并计算上下单换型标准及实际工时对比
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => onShowToast(`已导出 ${filtered.length} 条已生成制令单换型记录`, 'success')}
            className="px-3.5 py-1.5 border border-[#E8E4D9] rounded-xl font-medium text-[#5A634D] hover:bg-[#F0EEE6] transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出制令单换型数据</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="flex items-center gap-2.5 flex-wrap text-xs bg-[#FCFAF7] p-3 rounded-xl border border-[#E8E4D9]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#9DA391] font-medium">线体:</span>
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="p-1.5 border border-[#E8E4D9] rounded-xl bg-white text-[#4A4E44] text-xs cursor-pointer"
          >
            <option value="">全部线体</option>
            {FACTORY_LINES.map((line) => (
              <option key={line} value={teamOf(line)}>
                {teamOf(line)} ({line})
              </option>
            ))}
          </select>
        </div>

        {allDates.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#9DA391] font-medium">排产日期:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="p-1.5 border border-[#E8E4D9] rounded-xl bg-white text-[#4A4E44] text-xs cursor-pointer"
            >
              <option value="">全部日期</option>
              {allDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索工单/制令单/料号/品名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-1.5 pl-7 border border-[#E8E4D9] rounded-xl w-56 bg-white text-[#4A4E44] text-xs"
            />
            <Search className="w-3.5 h-3.5 text-[#9DA391] absolute left-2 top-2.5" />
          </div>
        </div>

        {(selectedLine || selectedDateFilter || searchTerm) && (
          <button
            onClick={() => {
              setSelectedLine('');
              setSelectedDateFilter('');
              setSearchTerm('');
            }}
            className="text-xs text-[#7D8471] hover:underline cursor-pointer"
          >
            清空筛选
          </button>
        )}

        <div className="ml-auto text-xs text-[#9DA391]">
          展示 <b className="text-[#4A4E44]">{filtered.length}</b> / {tableRows.length} 条已生成制令单
        </div>
      </div>

      {/* Table Area */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#FCFAF7] rounded-xl border border-[#E8E4D9] space-y-2">
          <ClipboardList className="w-10 h-10 text-[#9DA391] mx-auto opacity-50" />
          <div className="text-sm font-bold text-[#4A4E44]">
            {generatedWorkOrders.length === 0
              ? '暂无已生成的制令单'
              : '未找到匹配的制令单换型记录'}
          </div>
          <p className="text-xs text-[#9DA391] max-w-md mx-auto">
            {generatedWorkOrders.length === 0
              ? '请先前往「计划日排产」页面，勾选待排产工单并点击「生成制令单」，生成后的制令单将自动同步至此进行换型工时维护。'
              : '请尝试切换或清除上方线体、日期及关键词筛选条件。'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#E8E4D9] rounded-xl">
          <table className="w-full text-left border-collapse text-xs min-w-max">
            <thead className="bg-[#FCFAF7] text-[#5A634D] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-[#E8E4D9]">排产日期</th>
                <th className="p-2.5 border-b border-[#E8E4D9]">线体</th>
                <th className="p-2.5 border-b border-[#E8E4D9]">工单</th>
                <th className="p-2.5 border-b border-[#E8E4D9]">制令单</th>
                <th className="p-2.5 border-b border-[#E8E4D9]">料号</th>
                <th className="p-2.5 border-b border-[#E8E4D9] max-w-[180px]">品名</th>
                <th className="p-2.5 border-b border-[#E8E4D9] text-right">小时产能</th>
                <th className="p-2.5 border-b border-[#E8E4D9]">上一个制令单</th>
                <th className="p-2.5 border-b border-[#E8E4D9]">上一个料号</th>
                <th className="p-2.5 border-b border-[#E8E4D9] max-w-[160px]">上一个品名</th>
                <th className="p-2.5 border-b border-[#E8E4D9] text-right text-[#F27D52] font-bold">
                  标准换型工时<br />(工单)
                </th>
                <th className="p-2.5 border-b border-[#E8E4D9] text-right font-bold text-[#4A4E44]">
                  实际换型工时<br />(工单)
                </th>
                <th className="p-2.5 border-b border-[#E8E4D9] text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE6]">
              {filtered.map((r) => {
                const isEditing = editingWoId === r.woId;
                return (
                  <tr key={r.woId} className="hover:bg-[#F9F7F2]">
                    <td className="p-2.5 font-mono text-[#5A634D]">{r.date}</td>
                    <td className="p-2.5 font-bold text-[#4A4E44]">
                      {r.line} <span className="text-[10px] text-[#9DA391] font-normal">({r.lineCode})</span>
                    </td>
                    <td className="p-2.5 font-mono font-semibold text-[#5A634D]">{r.wo}</td>
                    <td className="p-2.5 font-mono text-blue-700 font-semibold">{r.cmd}</td>
                    <td className="p-2.5 font-mono text-[#9DA391]">{r.matCode}</td>
                    <td className="p-2.5 truncate max-w-[180px] text-[#4A4E44]" title={r.productName}>
                      {r.productName}
                    </td>
                    <td className="p-2.5 text-right font-mono text-[#4A4E44]">
                      {r.capPerHr.toLocaleString()}
                    </td>
                    <td className="p-2.5 font-mono text-[#9DA391]">{r.prevCmd}</td>
                    <td className="p-2.5 font-mono text-[#9DA391]">{r.prevMatCode}</td>
                    <td className="p-2.5 truncate max-w-[160px] text-[#9DA391]" title={r.prevProductName}>
                      {r.prevProductName}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#F27D52]">
                      {r.stdTimeWO} h
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#4A4E44]">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="24"
                            value={editActTimeWO}
                            onChange={(e) => setEditActTimeWO(parseFloat(e.target.value) || 0)}
                            className="w-14 p-1 border border-blue-400 rounded text-right font-mono font-bold text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <span className="text-gray-400 text-[11px]">h</span>
                        </div>
                      ) : (
                        <span>{r.actTimeWO} h</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(r.woId)}
                            className="px-2 py-1 text-[11px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title="保存"
                          >
                            <Check className="w-3 h-3" />
                            <span>保存</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-[11px] border border-[#E8E4D9] rounded-lg hover:bg-[#F0EEE6] text-[#5A634D] transition cursor-pointer"
                            title="取消"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="px-2 py-1 text-[11px] border border-[#E8E4D9] rounded-lg hover:bg-[#F0EEE6] text-[#5A634D] transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>编辑工时</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
