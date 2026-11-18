import React, { useState } from 'react';
import { KitItem, StatusType } from '../types';
import { STATUS_MAP } from '../mockData';
import { Package, Search, Download } from 'lucide-react';

interface KitTabProps {
  kitData: KitItem[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const KitTab: React.FC<KitTabProps> = ({ kitData, onShowToast }) => {
  const [filterWo, setFilterWo] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filtered = kitData.filter((k) => {
    const matchWo =
      !filterWo ||
      k.wo.toLowerCase().includes(filterWo.toLowerCase()) ||
      k.name.toLowerCase().includes(filterWo.toLowerCase());
    const matchStatus = !filterStatus || k.status === filterStatus;
    return matchWo && matchStatus;
  });

  const countByStatus = (st: StatusType) => kitData.filter((k) => k.status === st).length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-2xs">
          <div className="text-2xl font-bold text-blue-600">
            {countByStatus('scheduled' as StatusType) + countByStatus('lack' as StatusType) + countByStatus('rest' as StatusType)}
          </div>
          <div className="text-xs text-[#9DA391] mt-0.5 font-medium">已排产</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-2xs">
          <div className="text-2xl font-bold text-emerald-600">
            {countByStatus('kitted' as StatusType) + countByStatus('saving' as StatusType)}
          </div>
          <div className="text-xs text-[#9DA391] mt-0.5 font-medium">已齐套</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-2xs">
          <div className="text-2xl font-bold text-amber-600">
            {countByStatus('locked' as StatusType) + countByStatus('maint' as StatusType)}
          </div>
          <div className="text-xs text-[#9DA391] mt-0.5 font-medium">已锁定</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-2xs">
          <div className="text-2xl font-bold text-purple-600">
            {countByStatus('produced' as StatusType) + countByStatus('normal' as StatusType)}
          </div>
          <div className="text-xs text-[#9DA391] mt-0.5 font-medium">已生产</div>
        </div>
      </div>

      {/* Main Kit Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-2xs p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EEE6] pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#7D8471]" />
            <span className="text-base font-bold text-[#4A4E44]">齐套分析</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#9DA391]">工单/品名:</span>
              <input
                type="text"
                placeholder="搜索工单/品名"
                value={filterWo}
                onChange={(e) => setFilterWo(e.target.value)}
                className="p-1.5 border border-[#E8E4D9] rounded-xl w-36 bg-white text-[#4A4E44]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#9DA391]">状态:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-1.5 border border-[#E8E4D9] rounded-xl bg-white text-[#4A4E44] cursor-pointer"
              >
                <option value="">全部状态</option>
                <option value="scheduled">已排产</option>
                <option value="kitted">已齐套</option>
                <option value="locked">已锁定</option>
                <option value="produced">已生产</option>
              </select>
            </div>

            <button
              onClick={() => onShowToast('📤 齐套分析报表已导出', 'success')}
              className="px-3.5 py-1.5 border border-[#E8E4D9] rounded-xl font-medium text-[#5A634D] hover:bg-[#F0EEE6] transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
          </div>
        </div>

        {/* Kit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((k) => {
            const st = STATUS_MAP[k.status];
            const pct = Math.round((k.ready / (k.need || 1)) * 100);

            return (
              <div
                key={k.wo}
                className="border border-[#E8E4D9] rounded-xl p-3.5 bg-[#FCFAF7] shadow-2xs hover:border-[#7D8471] transition space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#4A4E44]">
                    {k.wo}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}
                  >
                    {st.label}
                  </span>
                </div>

                <div className="text-[#5A634D] truncate font-medium" title={k.name}>
                  {k.name}
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-[#E8E4D9] pt-2">
                  <span className="text-[#9DA391]">齐套率</span>
                  <span
                    className={`font-bold text-sm ${
                      pct >= 100 ? 'text-[#5A634D]' : 'text-[#F27D52]'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#9DA391]">需求 / 实备</span>
                  <span className="font-mono font-semibold text-[#4A4E44]">
                    {k.need.toLocaleString()} / {k.ready.toLocaleString()}
                  </span>
                </div>

                {k.missing > 0 && (
                  <div className="flex items-center justify-between text-[#F27D52] font-bold bg-[#F27D52]/10 p-1.5 rounded-lg border border-[#F27D52]/20">
                    <span>缺料数量</span>
                    <span className="font-mono">{k.missing.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#F0EEE6] space-y-1">
                  {k.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] text-[#5A634D]"
                    >
                      <span>
                        {it.m} · 需求 {it.q.toLocaleString()}
                      </span>
                      <span
                        className={`font-mono font-semibold ${
                          it.r < it.q ? 'text-[#F27D52]' : 'text-[#5A634D]'
                        }`}
                      >
                        实备 {it.r.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {!filtered.length && (
            <div className="col-span-full text-center py-10 text-[#9DA391]">
              无匹配的齐套数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
