import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { WorkOrder, KitComponent } from '../../types';

interface KitCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  scheduledQty: number;
  bomComponents: KitComponent[];
}

export const KitCheckModal: React.FC<KitCheckModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  scheduledQty,
  bomComponents,
}) => {
  if (!isOpen || !workOrder) return null;

  const rows = bomComponents.map((c) => {
    const req = Math.round(scheduledQty * (c.q / (scheduledQty || 1)));
    const avail = c.wh + c.transit;
    const ok = avail >= req - 1e-6;
    const gap = ok ? 0 : req - avail;
    return { name: c.name, req, wh: c.wh, transit: c.transit, avail, ok, gap };
  });

  const allOk = rows.every((r) => r.ok);
  const shortN = rows.filter((r) => !r.ok).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 px-5 border-b border-gray-200 flex items-center justify-between bg-teal-50">
          <div className="text-base font-bold text-teal-900 flex items-center gap-2">
            <span>工单齐套运算</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-teal-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="space-y-0.5 text-gray-600">
              <div>
                工单号: <b className="font-mono text-gray-900">{workOrder.id}</b>
              </div>
              <div className="truncate max-w-xs">
                品名: <b className="text-gray-900">{workOrder.product}</b>
              </div>
              <div>
                排产数量:{' '}
                <b className="text-blue-600 font-mono">
                  {scheduledQty.toLocaleString()} 件
                </b>
              </div>
            </div>

            <div>
              {allOk ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />✓ 齐套
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />⚠ 不齐套（{shortN} 项）
                </span>
              )}
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-2 border-b">物料组件</th>
                <th className="p-2 border-b text-right">需求数量</th>
                <th className="p-2 border-b text-right">仓库</th>
                <th className="p-2 border-b text-right">在途</th>
                <th className="p-2 border-b text-right">可用合计</th>
                <th className="p-2 border-b text-center">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, i) => (
                <tr key={i} className={r.ok ? 'hover:bg-gray-50' : 'bg-amber-50/50'}>
                  <td className="p-2 font-semibold">{r.name}</td>
                  <td className="p-2 text-right font-mono">{r.req.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono">{r.wh.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono">{r.transit.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono font-bold">{r.avail.toLocaleString()}</td>
                  <td
                    className={`p-2 text-center font-bold ${
                      r.ok ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {r.ok ? '齐套' : `缺 ${r.gap.toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-gray-700 text-[11px] leading-relaxed">
            齐套规则：
            1、齐套需求 = 排产数量 × BOM用量；可用 = 仓库库存 + 在途数量。可用 ≥ 需求为齐套（绿），否则不齐套（黄）。
            2、在途数量需要同步SAP厂内调拨数据，收货工厂（目前中山） + 未交付， 发货工厂 + 发货时间 +  物料数量 。
            3、系统要配置 发货工厂、收货工厂 运输时间。
            4、到货日期=运输时间 + 发货时间
            4、排产工单齐套计算只对计算时当前库存+到货日期为排产日期的在途数量。
            <b>不齐套不影响制令单下发，仅作备料警示。</b>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
