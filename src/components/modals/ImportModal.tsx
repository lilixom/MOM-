import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WorkOrder } from '../../types';
import { teamOf } from '../../mockData';
import { durOf } from '../../utils/timeUtils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onConfirmImport: (newWOs: WorkOrder[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onConfirmImport,
  onShowToast,
}) => {
  const [parsedRows, setParsedRows] = useState<any[] | null>(null);
  const [infoText, setInfoText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!json || json.length < 2) {
          throw new Error('表格内容为空或解析失败');
        }

        const header = json[0] || [];
        const findIndex = (names: string[]) => {
          for (const n of names) {
            const i = header.findIndex((h) => h && h.toString().includes(n));
            if (i >= 0) return i;
          }
          return -1;
        };

        const colIndex = {
          ver: findIndex(['版本号']),
          line: findIndex(['产线']),
          team: findIndex(['班组']),
          wo: findIndex(['工单']),
          mat: findIndex(['物料号']),
          name: findIndex(['产品名称']),
          qty: findIndex(['排产数量']),
          sTime: findIndex(['开始时间']),
          eTime: findIndex(['结束时间']),
        };

        const rows: any[] = [];
        for (let i = 1; i < json.length; i++) {
          const r = json[i];
          if (!r || (r[colIndex.wo] == null && r[colIndex.line] == null)) continue;
          const ver = r[colIndex.ver] != null ? Number(r[colIndex.ver]) : 1;
          const qty = r[colIndex.qty] != null ? Number(r[colIndex.qty]) : 0;
          rows.push({
            ver,
            qty,
            line: r[colIndex.line] != null ? String(r[colIndex.line]) : '',
            wo: r[colIndex.wo] != null ? String(r[colIndex.wo]) : '',
            team: r[colIndex.team] != null ? String(r[colIndex.team]) : '',
            name: r[colIndex.name] != null ? String(r[colIndex.name]) : '',
            mat: r[colIndex.mat] != null ? String(r[colIndex.mat]) : '',
            start: r[colIndex.sTime] != null ? String(r[colIndex.sTime]) : '08:30',
            end: r[colIndex.eTime] != null ? String(r[colIndex.eTime]) : '20:30',
          });
        }

        setParsedRows(rows);
        const woSet = new Set(rows.map((r) => r.wo)).size;
        const verSet = [...new Set(rows.map((r) => r.ver))].sort().join('/');
        setInfoText(
          `✅ 解析成功：共 ${rows.length} 条排产记录，涉及 ${woSet} 个工单，版本 ${verSet}`
        );
        onShowToast(`已成功读取 ${rows.length} 条排产记录`, 'success');
      } catch (err: any) {
        setInfoText(`❌ 解析失败：${err.message || '格式无法识别'}`);
        onShowToast('Excel 文件解析失败', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    if (!parsedRows || !parsedRows.length) return;
    const seen: Record<string, boolean> = {};
    const list: WorkOrder[] = parsedRows.map((r, i) => {
      const start = r.start || '08:30';
      const end = r.end || '20:30';
      const dur = durOf(start, end) || 12;
      const hourCap = r.qty > 0 ? Math.round(r.qty / dur) : 40800;
      let id = (r.wo || 'IMP' + i).toString();
      if (seen[id]) id = id + '_' + (r.ver || i);
      seen[id] = true;

      const lineCode = r.line || '10500406';
      return {
        id,
        line: lineCode,
        team: r.team || teamOf(lineCode),
        product: r.name || '半自动批导工单',
        soNo: '',
        status: 'normal',
        shift: '白班',
        hourCap,
        changeover: 0.5,
        otherStop: 1.0,
        start,
        end,
        actual: null,
        selected: false,
        generated: false,
        date: selectedDate,
      };
    });

    onConfirmImport(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-[#E5E9F0]">
        <div className="p-4 px-5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="text-base font-bold text-[#1E293B] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#2563EB]" />
            <span>导入排产（半自动排产批导）</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg hover:bg-[#EDF2F7] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById('importFileInput')?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? 'border-[#2563EB] bg-[#EBF2FF]/50'
                : 'border-[#E5E9F0] bg-white hover:border-[#2563EB] hover:bg-[#FFFFFF]'
            }`}
          >
            <Upload className="w-8 h-8 text-[#2563EB]" />
            <span className="font-semibold text-[#1E293B] text-sm">
              📁 点击或拖拽 Excel 文件到此处
            </span>
            <span className="text-[#64748B]">
              支持半自动排产批导 .xlsx / .xls 模版文件
            </span>
            <input
              type="file"
              id="importFileInput"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
          </div>

          {infoText && (
            <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E9F0] rounded-xl font-medium text-[#1E293B]">
              {infoText}
            </div>
          )}

          {parsedRows && (
            <div className="border border-[#E5E9F0] rounded-xl overflow-x-auto max-h-60 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FFFFFF] text-[#1E40AF] sticky top-0 border-b border-[#E5E9F0]">
                  <tr>
                    <th className="p-2 border-b border-[#E5E9F0]">版本</th>
                    <th className="p-2 border-b border-[#E5E9F0]">产线</th>
                    <th className="p-2 border-b border-[#E5E9F0]">工单号</th>
                    <th className="p-2 border-b border-[#E5E9F0]">物料号</th>
                    <th className="p-2 border-b border-[#E5E9F0] text-right">排产数量</th>
                    <th className="p-2 border-b border-[#E5E9F0]">开始</th>
                    <th className="p-2 border-b border-[#E5E9F0]">结束</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7]">
                  {parsedRows.slice(0, 15).map((r, i) => (
                    <tr key={i} className="hover:bg-[#F4F6F9]">
                      <td className="p-2 text-[#1E293B]">V{r.ver}</td>
                      <td className="p-2 text-[#1E293B]">{r.line}</td>
                      <td className="p-2 font-mono font-semibold text-[#1E40AF]">{r.wo}</td>
                      <td className="p-2 text-[#64748B]">{r.mat}</td>
                      <td className="p-2 text-right font-mono font-bold text-[#2563EB]">
                        {r.qty?.toLocaleString()}
                      </td>
                      <td className="p-2 text-[#1E293B]">{r.start}</td>
                      <td className="p-2 text-[#1E293B]">{r.end}</td>
                    </tr>
                  ))}
                  {parsedRows.length > 15 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-2 text-center text-[#64748B] bg-[#FFFFFF]"
                      >
                        …共 {parsedRows.length} 行数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#E5E9F0] flex justify-end gap-2 bg-[#FFFFFF]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E5E9F0] rounded-xl text-xs font-medium text-[#1E40AF] bg-white hover:bg-[#EDF2F7] transition"
          >
            取消
          </button>
          {parsedRows && (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-medium hover:bg-[#165DFF] transition flex items-center gap-1 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>确认导入（写入 {selectedDate}）</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
