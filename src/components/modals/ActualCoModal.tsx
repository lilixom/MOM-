import React, { useState } from 'react';
import { X, Save, ClipboardList } from 'lucide-react';
import { ActualChangeoverItem } from '../../types';

interface ActualCoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveActual: (item: ActualChangeoverItem) => void;
}

export const ActualCoModal: React.FC<ActualCoModalProps> = ({
  isOpen,
  onClose,
  onSaveActual,
}) => {
  const [line, setLine] = useState('SA');
  const [wo, setWo] = useState('001');
  const [cmd, setCmd] = useState('001-003');
  const [actTimeWO, setActTimeWO] = useState(0.6);


  if (!isOpen) return null;

  const handleSave = () => {
    onSaveActual({
      line,
      wo,
      cmd,
      matCode: '10024249',
      productName: '泰奇八宝粥大罐装(侧防腐2504版)空罐-209#430',
      capPerHr: 36000,
      prevCmd: '003-005',
      prevMatCode: '10022364',
      prevProductName: '马口铁三片罐含盖底盖(中山)红牛常规版(2411)',
      stdTimeWO: 0.7,
      actTimeWO: Number(actTimeWO)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 px-5 border-b border-gray-200 flex items-center justify-between bg-purple-50">
          <div className="text-base font-bold text-purple-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            <span>新增 / 修改 — 实际换型工时</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-purple-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">线体</label>
              <select
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
              >
                <option value="SA">SA</option>
                <option value="SB">SB</option>
                <option value="SD">SD</option>
                <option value="SE">SE</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">工单</label>
              <input
                type="text"
                value={wo}
                onChange={(e) => setWo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">制令单</label>
              <input
                type="text"
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">换型类型</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white">
                <option>不同关系互换(整线)</option>
                <option>不同关系互换(半线)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-gray-600 font-semibold mb-1">品名</label>
              <input
                type="text"
                readOnly
                value="泰奇八宝粥大罐装(侧防腐2504版)空罐-209#430"
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                标准换型工时 (工单)
              </label>
              <input
                type="text"
                readOnly
                value="0.7 h"
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-red-600 text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                实际换型工时 (工单)
              </label>
              <input
                type="number"
                step="0.1"
                value={actTimeWO}
                onChange={(e) => setActTimeWO(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold text-blue-600"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-600 font-semibold mb-1">换型说明</label>
              <textarea
                rows={2}
                placeholder="现场现场记录换型实况说明..."
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition flex items-center gap-1 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
