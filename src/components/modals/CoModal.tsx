import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { ChangeoverRule } from '../../types';

interface CoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit: ChangeoverRule | null;
  onSaveRule: (rule: Partial<ChangeoverRule>) => void;
}

export const CoModal: React.FC<CoModalProps> = ({
  isOpen,
  onClose,
  ruleToEdit,
  onSaveRule,
}) => {
  const [process, setProcess] = useState('401制罐换型');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [hoursH, setHoursH] = useState(8);
  const [hoursM, setHoursM] = useState(480);
  const [note, setNote] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (ruleToEdit) {
      setProcess(ruleToEdit.process);
      setCode(ruleToEdit.code);
      setDesc(ruleToEdit.desc);
      setHoursH(ruleToEdit.hoursH);
      setHoursM(ruleToEdit.hoursM);
      setIsDefault(!!ruleToEdit.isDefault);
    } else {
      setProcess('401制罐换型');
      setCode('');
      setDesc('');
      setHoursH(8);
      setHoursM(480);
      setNote('');
      setIsDefault(false);
    }
  }, [ruleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleHoursHChange = (h: number) => {
    setHoursH(h);
    setHoursM(Math.round(h * 60));
  };

  const handleSave = () => {
    onSaveRule({
      seq: ruleToEdit?.seq,
      process,
      code: code || '401' + String(Math.floor(Math.random() * 90 + 10)),
      desc: desc || '自定义换型',
      hoursH: Number(hoursH),
      hoursM: Number(hoursM),
      isDefault,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 px-5 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div className="text-base font-bold text-blue-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{ruleToEdit ? '编辑标准换型工时' : '新增标准换型工时'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-blue-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">换型工序</label>
              <input
                type="text"
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">换型编码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="如 40101"
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-600 font-semibold mb-1">换型描述</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="如 不同关系互换（整线）"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                标准工时 (小时 H)
              </label>
              <input
                type="number"
                step="0.1"
                value={hoursH}
                onChange={(e) => handleHoursHChange(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold text-red-600"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                标准工时 (分钟 M)
              </label>
              <input
                type="number"
                value={hoursM}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10) || 0;
                  setHoursM(m);
                  setHoursH(Number((m / 60).toFixed(2)));
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-600 font-semibold mb-1">换型说明</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="换型规则与操作说明..."
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="coIsDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="coIsDefault" className="text-xs text-gray-700 font-medium cursor-pointer flex items-center gap-1 select-none">
                <span>设为默认规则</span>
                <span className="text-[11px] text-gray-400 font-normal">(全表中仅保留一个默认)</span>
              </label>
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
