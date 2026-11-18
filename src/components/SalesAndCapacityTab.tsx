import React, { useState } from 'react';
import { SalesOrder, WorkOrder } from '../types';
import {
  SO_14_DAYS,
  ALL_30_DAYS,
  FACTORY_LINES,
  teamOf,
} from '../mockData';
import { Search, ExternalLink, ShoppingBag, BarChart3, TrendingUp, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { TabType } from './Header';

interface SalesAndCapacityTabProps {
  salesOrders: SalesOrder[];
  workOrders: WorkOrder[];
  onSelectDate: (d: string) => void;
  onSelectTab: (tab: TabType) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SalesAndCapacityTab: React.FC<SalesAndCapacityTabProps> = ({
  salesOrders,
  workOrders,
  onSelectDate,
  onSelectTab,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState('昇兴集团');
  const [startDate, setStartDate] = useState('2026-01-04');
  const [endDate, setEndDate] = useState('2026-01-25');
  const [viewMode, setViewMode] = useState<'day' | 'six' | 'month'>('day');
  const [selectedLine, setSelectedLine] = useState('');

  // N-1 Delivery Check Logic for Sales Orders
  const soShipCheck = (r: SalesOrder) => {
    const res: Array<{
      ship: number;
      avail: number;
      prodBefore: number;
      ok: boolean;
    } | null> = [];
    let cum = 0;
    let sat = 0;
    let total = 0;

    r.shipPlan.forEach((ship, i) => {
      const prodBefore = cum;
      if (ship > 0) {
        const avail = r.inventory + prodBefore;
        const ok = avail >= ship;
        res.push({ ship, avail, prodBefore, ok });
        if (ok) sat++;
        total++;
      } else {
        res.push(null);
      }
      cum += r.prodPlan[i] || 0;
    });

    return { res, sat, total };
  };

  const handleGotoWO = (woId: string) => {
    const gr = workOrders.find((g) => g.id === woId);
    if (gr) {
      onSelectDate(gr.date);
    }
    onSelectTab('tab-schedule');
    onShowToast(`📍 已跳转至计划日排产，已定位工单 ${woId}（${gr ? gr.date : ''}）`, 'info');
  };

  const filteredOrders = salesOrders.filter((so) => {
    const matchesSearch =
      so.soNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.matCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'delay') return matchesSearch && so.status.label.includes('延期');
    if (statusFilter === 'normal') return matchesSearch && !so.status.label.includes('延期');
    return matchesSearch;
  });

  // Overview Metrics
  const totalOrders = salesOrders.length;
  const totalUnscheduled = salesOrders.reduce((acc, cur) => acc + cur.unschedQty, 0);
  const total14DayShip = salesOrders.reduce(
    (acc, cur) => acc + cur.shipPlan.reduce((a, b) => a + (b || 0), 0),
    0
  );

  let fulfilledCount = 0;
  let totalPointsCount = 0;
  salesOrders.forEach((so) => {
    const chk = soShipCheck(so);
    fulfilledCount += chk.sat;
    totalPointsCount += chk.total;
  });
  const satisfyRate = totalPointsCount > 0 ? Math.round((fulfilledCount / totalPointsCount) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#165DFF]/10 flex items-center justify-center text-[#1E40AF] shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1E293B]">{totalOrders}</div>
            <div className="text-xs text-[#64748B] mt-0.5">活跃销售订单总数</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EA580C]/15 flex items-center justify-center text-[#EA580C] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#EA580C]">
              {(totalUnscheduled / 10000).toFixed(2)} <span className="text-xs font-normal">万件</span>
            </div>
            <div className="text-xs text-[#64748B] mt-0.5">未排产订单需求总量</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 flex items-center justify-center text-[#2563EB] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1E293B]">
              {(total14DayShip / 10000).toFixed(2)} <span className="text-xs font-normal">万件</span>
            </div>
            <div className="text-xs text-[#64748B] mt-0.5">近14天计划出货需求</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E9F0] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">{satisfyRate}%</div>
            <div className="text-xs text-[#64748B] mt-0.5">N-1 出货齐套满足率</div>
          </div>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs p-4">
        <div className="text-xs font-bold text-[#1E293B] mb-2.5 flex items-center gap-1.5">
          <Search className="w-4 h-4 text-[#2563EB]" />
          <span>🔍 查询条件</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] whitespace-nowrap">组织:</span>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B]"
            >
              <option>昇兴集团</option>
              <option>三片事业部</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] whitespace-nowrap">预计时间:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1 border border-[#E5E9F0] rounded-xl text-[#1E293B] bg-white"
            />
            <span className="text-[#64748B]">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1 border border-[#E5E9F0] rounded-xl text-[#1E293B] bg-white"
            />
          </div>

          <div className="inline-flex border border-[#E5E9F0] rounded-xl overflow-hidden bg-white p-0.5">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                viewMode === 'day' ? 'bg-[#2563EB] text-white font-medium' : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
            >
              天
            </button>
            <button
              onClick={() => setViewMode('six')}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                viewMode === 'six' ? 'bg-[#2563EB] text-white font-medium' : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
            >
              六天
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                viewMode === 'month' ? 'bg-[#2563EB] text-white font-medium' : 'text-[#1E40AF] hover:bg-[#EDF2F7]'
              }`}
            >
              本月
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] whitespace-nowrap">线体:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B]"
            >
              <option value="">全部</option>
              {FACTORY_LINES.map((l) => (
                <option key={l} value={l}>
                  {l} ({teamOf(l)})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onShowToast('✅ 查询过滤成功', 'success')}
            className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#165DFF] transition shadow-2xs cursor-pointer"
          >
            查询
          </button>
        </div>
      </div>

      {/* Sales Orders Section */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-3.5 px-5 border-b border-[#E5E9F0] flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1E293B]">📋 销售订单列表</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBF2FF] text-[#1E40AF] font-medium">
              近14天出货计划与N-1判定
            </span>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索订单号/科号/品名..."
                className="pl-8 pr-3 py-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] text-xs focus:outline-none focus:border-[#2563EB] w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border border-[#E5E9F0] rounded-xl bg-white text-[#1E293B] text-xs"
            >
              <option value="all">全部状态</option>
              <option value="normal">正常交付</option>
              <option value="delay">延期风险</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="p-2.5 px-5 border-b border-[#E5E9F0] bg-white flex items-center gap-4 text-xs text-[#1E293B] flex-wrap">
          <span className="font-semibold text-[#1E40AF]">图例说明:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            <span>满足 (N-1出货时库存+前一日生产足量)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
            <span>不足 (需要优先安排产线排产)</span>
          </span>
        </div>

        {/* Sales Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-max">
            <thead>
              <tr className="bg-[#FFFFFF] text-[#1E40AF] border-b border-[#E5E9F0] font-semibold">
                <th className="p-2.5 border-r border-[#E5E9F0] text-left sticky left-0 z-20 bg-[#FFFFFF]">
                  销售订单号
                </th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-right">科号</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-left max-w-[180px]">品名</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-center">开始时间</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-center">结束时间</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-right">订单数量(万)</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-right">未交付(万)</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>已排(万)</span>
                    <div className="group relative inline-flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 text-[#64748B] hover:text-[#1E40AF] cursor-pointer" />
                      <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block bg-[#0F172A] text-white text-[11px] font-normal rounded px-2.5 py-1 shadow-lg whitespace-nowrap z-30">
                        排产量 = 当前线体实际排产工单
                      </div>
                    </div>
                  </div>
                </th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-right text-red-600 font-bold">未排(万)</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-right font-bold text-[#1E293B]">
                  期初库存(万)
                </th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-center">状态</th>
                <th className="p-2.5 border-r border-[#E5E9F0] text-left min-w-[140px]">关联工单</th>
                {SO_14_DAYS.map((d) => (
                  <th key={d.key} className="p-2 border-r border-[#E5E9F0] text-center min-w-[55px]">
                    <div>{d.label}</div>
                    <div className="text-[9px] text-[#64748B] font-normal">周{d.weekday}</div>
                  </th>
                ))}
                <th className="p-2.5 border-r border-[#E5E9F0] text-right font-bold text-[#1E40AF] bg-[#EBF2FF]/50">
                  近14天(万)
                </th>
                <th className="p-2.5 text-center font-bold text-[#1E40AF] bg-[#EBF2FF]/50">
                  出货满足<br />(N-1)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9F0]/60 text-[#1E293B]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={14 + SO_14_DAYS.length} className="p-8 text-center text-[#64748B]">
                    没有检索到符合条件的销售订单
                  </td>
                </tr>
              ) : (
                filteredOrders.map((r) => {
                  const chk = soShipCheck(r);
                  const soSum = r.shipPlan.reduce((a, b) => a + (b || 0), 0);
                  const allOk = chk.total > 0 && chk.sat === chk.total;

                  return (
                    <tr key={r.soNo} className="hover:bg-white/80 transition">
                      <td className="p-2.5 font-mono font-bold text-[#1E293B] sticky left-0 z-10 bg-white border-r border-[#E5E9F0]/50">
                        {r.soNo}
                      </td>
                      <td className="p-2.5 text-right font-mono">{r.matCode}</td>
                      <td
                        className="p-2.5 truncate max-w-[180px] font-medium"
                        title={r.name}
                      >
                        {r.name}
                      </td>
                      <td className="p-2.5 text-center text-[#64748B] font-mono text-[11px]">
                        {r.startDate}
                      </td>
                      <td className="p-2.5 text-center text-[#64748B] font-mono text-[11px]">
                        {r.endDate}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold">
                        {(r.orderQty / 10000).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {(r.unDeliv / 10000).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {(r.schedQty / 10000).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-red-600">
                        {(r.unschedQty / 10000).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#1E293B]">
                        {(r.inventory / 10000).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status.cls}`}
                        >
                          {r.status.label}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1">
                          {r.woList.map((wo) => (
                            <button
                              key={wo}
                              onClick={() => handleGotoWO(wo)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#165DFF]/10 text-[#1E40AF] border border-[#165DFF]/20 hover:bg-[#165DFF] hover:text-white transition cursor-pointer flex items-center gap-0.5"
                              title="点击跳转排产日日历并定位该工单"
                            >
                              <span>{wo}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Ship Plan 14 Days */}
                      {r.shipPlan.map((v, i) => {
                        const c = chk.res[i];
                        if (v > 0 && c) {
                          return (
                            <td
                              key={i}
                              className={`p-2 text-right font-mono font-bold ${
                                c.ok
                                  ? 'bg-emerald-100/90 text-emerald-900'
                                  : 'bg-amber-100/90 text-amber-900'
                              }`}
                              title={`库存 ${(r.inventory / 10000).toFixed(2)}万 + 截至前一日排产 ${(c.prodBefore / 10000).toFixed(2)}万 = 可用 ${(c.avail / 10000).toFixed(2)}万｜出货需求 ${(v / 10000).toFixed(2)}万 → ${
                                c.ok ? '满足(N-1)' : '不足(N-1)'
                              }`}
                            >
                              {(v / 10000).toFixed(2)}
                            </td>
                          );
                        }
                        return (
                          <td key={i} className="p-2 text-right text-[#64748B]/40 font-mono">
                            —
                          </td>
                        );
                      })}

                      <td className="p-2.5 text-right font-mono font-bold text-[#1E40AF] bg-[#FFFFFF]">
                        {(soSum / 10000).toFixed(2)}
                      </td>
                      <td
                        className={`p-2.5 text-center font-bold font-mono ${
                          chk.total === 0
                            ? 'text-[#64748B]'
                            : allOk
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        {chk.total > 0 ? `${chk.sat}/${chk.total}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30-Day Capacity Load Matrix */}
      <div className="bg-white rounded-2xl border border-[#E5E9F0] shadow-2xs overflow-hidden">
        <div className="p-3.5 px-5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-bold text-[#1E293B]">📊 30天产线产能负荷矩阵</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBF2FF] text-[#1E40AF] font-medium">
              自动关联排产需求
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300" />
              正常 (&le;60%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300" />
              繁忙 (61%-85%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-300" />
              超载 (&gt;85%)
            </span>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse min-w-max">
            <thead>
              <tr className="bg-[#FFFFFF] text-[#1E40AF] border-b border-[#E5E9F0] font-semibold">
                <th className="p-2 border-r border-[#E5E9F0] text-left sticky left-0 z-20 bg-[#FFFFFF] min-w-[110px]">
                  <div className="flex items-center gap-1">
                    <span>产线名称 / 班组</span>
                    <div className="group relative inline-flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 text-[#64748B] hover:text-[#1E40AF] cursor-pointer" />
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block bg-[#0F172A] text-white text-[11px] font-normal rounded px-2.5 py-1 shadow-lg whitespace-nowrap z-30">
                        排产量 = 当前线体实际排产工单
                      </div>
                    </div>
                  </div>
                </th>
                {ALL_30_DAYS.map((d) => (
                  <th
                    key={d.key}
                    className={`p-1.5 border-r border-[#E5E9F0] min-w-[50px] ${
                      d.isToday
                        ? 'border-l-2 border-l-[#165DFF] bg-[#EBF2FF] text-[#1E293B] font-bold'
                        : ''
                    }`}
                  >
                    <div>{d.label}</div>
                    <div className="text-[9px] text-[#64748B] font-normal">
                      {d.weekday}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9F0]/60">
              {FACTORY_LINES.filter((l) => !selectedLine || l === selectedLine).map((lineCode) => {
                const team = teamOf(lineCode);
                return (
                  <tr key={lineCode} className="hover:bg-white/80 transition">
                    <td className="p-2 border-r border-[#E5E9F0] text-left font-semibold sticky left-0 z-10 bg-white text-[#1E293B]">
                      <div>{lineCode}</div>
                      <div className="text-[10px] text-[#64748B]">{team}</div>
                    </td>
                    {ALL_30_DAYS.map((d, i) => {
                      let load =
                        i < 3
                          ? 10
                          : i < 10
                          ? 45
                          : i < 20
                          ? 65
                          : 20;
                      if (team === 'SA') load = Math.min(load + 20, 95);
                      const isWknd = d.date.getDay() === 0 || d.date.getDay() === 6;

                      let loadClass = 'bg-emerald-50 text-emerald-800';
                      if (load > 85) loadClass = 'bg-red-100 text-red-800 font-bold';
                      else if (load > 60) loadClass = 'bg-amber-100 text-amber-800';

                      return (
                        <td
                          key={d.key}
                          className={`p-1.5 border-r border-[#E5E9F0] text-center font-mono ${loadClass} ${
                            isWknd ? 'opacity-80' : ''
                          } ${d.isToday ? 'border-l-2 border-l-[#165DFF]' : ''}`}
                          title={`${team} | ${lineCode} | ${d.label}: ${load}%`}
                        >
                          {load}%
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
