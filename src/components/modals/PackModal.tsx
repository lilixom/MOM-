import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { WorkOrder, KitComponent } from '../../types';

interface PackModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  bomComponents: KitComponent[];
  onSavePackEdits: (woId: string, warehouseStock: number[]) => void;
}

export const PackModal: React.FC<PackModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  bomComponents,
  onSavePackEdits,
}) => {
  const [stockValues, setStockValues] = useState<number[]>([]);

  useEffect(() => {
    if (bomComponents.length) {
      setStockValues(bomComponents.map((c) => c.wh));
    }
  }, [bomComponents]);

  if (!isOpen || !workOrder) return null;

  const handleStockChange = (index: number, val: number) => {
    const next = [...stockValues];
    next[index] = Math.max(0, val || 0);
    setStockValues(next);
  };

  const handleSave = () => {
    onSavePackEdits(workOrder.id, stockValues);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 px-5 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div className="text-base font-bold text-blue-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>📦 包材修改</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-blue-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 text-xs">
          <p className="text-gray-600">
            工单 <b className="font-mono text-blue-600">{workOrder.id}</b> ·
            修改「仓库库存」后保存，将影响该工单齐套运算结果；在途数量不可编辑。
          </p>

          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-2 border-b">包材</th>
                <th className="p-2 border-b text-right">仓库库存</th>
                <th className="p-2 border-b text-right">在途</th>
                <th className="p-2 border-b text-right">可用合计</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bomComponents.map((c, i) => {
                const currentWh = stockValues[i] ?? c.wh;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 font-semibold">{c.name}</td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={currentWh}
                        onChange={(e) => handleStockChange(i, parseInt(e.target.value, 10))}
                        className="w-28 p-1 border border-gray-300 rounded text-right font-mono text-xs font-bold text-blue-600"
                      />
                    </td>
                    <td className="p-2 text-right font-mono text-gray-500">
                      {c.transit.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-gray-900">
                      {(currentWh + c.transit).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
