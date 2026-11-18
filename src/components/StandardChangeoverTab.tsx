import React, { useState } from 'react';
import { ChangeoverRule } from '../types';
import { Clock, Plus, Download, Edit3, Trash2, Search } from 'lucide-react';

interface StandardChangeoverTabProps {
  changeoverData: ChangeoverRule[];
  onOpenAddModal: () => void;
  onEditRule: (rule: ChangeoverRule) => void;
  onDeleteRule: (seq: number) => void;
  onSetDefaultRule?: (seq: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const StandardChangeoverTab: React.FC<StandardChangeoverTabProps> = ({
  changeoverData,
  onOpenAddModal,
  onEditRule,
  onDeleteRule,
  onSetDefaultRule,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = changeoverData.filter(
    (r) =>
      r.process.includes(searchTerm) ||
      r.code.includes(searchTerm) ||
      r.desc.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-2xs p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EEE6] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#7D8471]" />
          <span className="text-base font-bold text-[#4A4E44]">标准换型工时维护</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 bg-[#7D8471] text-white rounded-xl font-medium hover:bg-[#5A634D] transition flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增</span>
          </button>
          <button
            onClick={() => onShowToast('标准换型工时模版已导出', 'info')}
            className="px-3.5 py-1.5 border border-[#E8E4D9] rounded-xl font-medium text-[#5A634D] hover:bg-[#F0EEE6] transition"
          >
            导出模版
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs bg-[#FCFAF7] p-3 rounded-xl border border-[#E8E4D9]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#9DA391]">工序:</span>
          <select className="p-1.5 border border-[#E8E4D9] rounded-xl bg-white text-[#4A4E44]">
            <option>401制罐换型</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="搜索编码/描述"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-1.5 border border-[#E8E4D9] rounded-xl w-40 bg-white text-[#4A4E44]"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-[#E8E4D9] rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#FCFAF7] text-[#5A634D] font-semibold">
            <tr>
              <th className="p-2.5 border-b border-[#E8E4D9]">序号</th>
              <th className="p-2.5 border-b border-[#E8E4D9]">换型工序</th>
              <th className="p-2.5 border-b border-[#E8E4D9]">换型编码</th>
              <th className="p-2.5 border-b border-[#E8E4D9]">换型描述</th>
              <th className="p-2.5 border-b border-[#E8E4D9] text-right text-[#F27D52] font-bold">
                标准换型工时 (H)
              </th>
              <th className="p-2.5 border-b border-[#E8E4D9] text-right">标准换型工时 (M)</th>
              <th className="p-2.5 border-b border-[#E8E4D9]">新增时间</th>
              <th className="p-2.5 border-b border-[#E8E4D9]">新增人</th>
              <th className="p-2.5 border-b border-[#E8E4D9]">修改时间</th>
              <th className="p-2.5 border-b border-[#E8E4D9]">修改人</th>
              <th className="p-2.5 border-b border-[#E8E4D9] text-center">默认字段</th>
              <th className="p-2.5 border-b border-[#E8E4D9] text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EEE6]">
            {filtered.map((r) => (
              <tr key={r.seq} className="hover:bg-[#F9F7F2]">
                <td className="p-2.5 font-mono text-[#5A634D]">{r.seq}</td>
                <td className="p-2.5 font-medium text-[#4A4E44]">{r.process}</td>
                <td className="p-2.5 font-mono font-bold text-[#7D8471]">{r.code}</td>
                <td className="p-2.5 text-[#4A4E44]">{r.desc}</td>
                <td className="p-2.5 text-right font-mono font-extrabold text-[#F27D52] text-sm">
                  {r.hoursH} h
                </td>
                <td className="p-2.5 text-right font-mono text-[#4A4E44]">{r.hoursM} m</td>
                <td className="p-2.5 text-[#9DA391] font-mono text-[11px]">{r.createDate || '—'}</td>
                <td className="p-2.5 text-[#5A634D]">{r.createBy || '—'}</td>
                <td className="p-2.5 text-[#9DA391] font-mono text-[11px]">{r.modDate || '—'}</td>
                <td className="p-2.5 text-[#5A634D]">{r.modBy || '—'}</td>
                <td className="p-2.5 text-center">
                  {r.isDefault ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] inline-flex items-center gap-0.5">
                      ★ 默认
                    </span>
                  ) : (
                    <button
                      onClick={() => onSetDefaultRule && onSetDefaultRule(r.seq)}
                      className="px-2 py-0.5 text-[11px] border border-[#E8E4D9] rounded-lg hover:bg-[#E8EAE3] text-[#5A634D] transition cursor-pointer"
                      title="设为唯一默认"
                    >
                      设为默认
                    </button>
                  )}
                </td>
                <td className="p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEditRule(r)}
                      className="px-2 py-1 text-[11px] border border-[#E8E4D9] rounded-lg hover:bg-[#E8EAE3] text-[#5A634D] transition"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDeleteRule(r.seq)}
                      className="px-2 py-1 text-[11px] border border-[#F27D52]/30 text-[#F27D52] rounded-lg hover:bg-[#F27D52]/10 transition"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
