import React, { useEffect, useState } from 'react';
import { Check, ImagePlus, Trash2, X } from 'lucide-react';
import type { MomSpecForm, MomSpecFormField } from '../data/momImportedSpecs';

interface MomCustomFormOverlayProps {
  form: MomSpecForm;
  mode: 'create' | 'edit';
  pageTitle: string;
  initialValues?: Record<string, unknown>;
  onClose: () => void;
  onSubmit: (values: Record<string, string>, keepOpen: boolean) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const MomCustomFormOverlay: React.FC<MomCustomFormOverlayProps> = ({
  form,
  mode,
  pageTitle,
  initialValues,
  onClose,
  onSubmit,
  onShowToast,
}) => {
  const buildInitial = () => {
    const draft: Record<string, string> = {};
    (form.groups || []).forEach((g) => {
      (g.fields || []).forEach((f) => {
        const initVal = initialValues?.[f.key];
        if (initVal !== undefined && initVal !== null && String(initVal) !== '') {
          draft[f.key] = String(initVal);
        } else if (f.type === 'switch') {
          draft[f.key] = f.defaultValue === false ? '停用' : '启用';
        } else if (f.defaultValue !== undefined) {
          draft[f.key] = String(f.defaultValue);
        } else {
          draft[f.key] = '';
        }
      });
    });
    return draft;
  };

  const [values, setValues] = useState<Record<string, string>>(buildInitial);
  const [uploads, setUploads] = useState<Record<string, Array<{ name: string; url: string }>>>({});

  useEffect(() => {
    setValues(buildInitial());
    setUploads({});
  }, [form, mode, initialValues]);

  const validateAndSubmit = (keepOpen: boolean) => {
    for (const g of form.groups || []) {
      for (const f of g.fields || []) {
        if (f.required && !values[f.key]?.trim()) {
          onShowToast(`请填写必填项：${f.label}`, 'warning');
          return;
        }
      }
    }
    onSubmit(values, keepOpen);
    if (keepOpen) {
      setValues(buildInitial());
      setUploads({});
    }
  };

  const handleFileChange = (field: MomSpecFormField, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);
    setUploads((prev) => {
      const existing = prev[field.key] || [];
      const merged = [
        ...existing,
        ...files.map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
        })),
      ].slice(0, 9);
      setValues((vPrev) => ({
        ...vPrev,
        [field.key]: merged.map((m) => m.name).join('、'),
      }));
      return { ...prev, [field.key]: merged };
    });
  };

  const removeUpload = (fieldKey: string, idx: number) => {
    setUploads((prev) => {
      const list = [...(prev[fieldKey] || [])];
      const [removed] = list.splice(idx, 1);
      if (removed?.url) URL.revokeObjectURL(removed.url);
      setValues((vPrev) => ({
        ...vPrev,
        [fieldKey]: list.map((m) => m.name).join('、'),
      }));
      return { ...prev, [fieldKey]: list };
    });
  };

  const isDrawer = form.layout === 'drawer';
  const titleText =
    mode === 'edit'
      ? (form.title || `编辑-${pageTitle}`).replace(/^新增/, '编辑')
      : form.title || `新增-${pageTitle}`;

  const buttons =
    form.buttons && form.buttons.length > 0
      ? form.buttons
      : [
          { text: '取消', type: 'default' },
          { text: '保存并退出', type: 'primary' },
        ];

  const renderField = (f: MomSpecFormField) => {
    const val = values[f.key] ?? '';
    const isOn = val === '启用' || val === '开' || val === '是' || val === 'true';
    const fileItems = uploads[f.key] || [];

    return (
      <div
        key={f.key}
        className={`flex flex-col gap-1.5 ${f.span === 2 ? 'sm:col-span-2' : ''}`}
      >
        <label className="text-xs font-semibold text-[#1E40AF]">
          {f.label}
          {f.required && <span className="text-rose-500 ml-1">*</span>}
        </label>

        {f.type === 'select' ? (
          <select
            value={val}
            onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            className="h-9 px-3 text-xs border border-[#DCE3EE] rounded-lg bg-white text-[#1E293B] outline-none focus:border-[#165DFF]"
          >
            <option value="">{f.ph || '请选择'}</option>
            {(f.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : f.type === 'switch' ? (
          <div className="h-9 flex items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={isOn}
              onClick={() =>
                setValues((prev) => ({ ...prev, [f.key]: isOn ? '停用' : '启用' }))
              }
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                isOn ? 'bg-[#165DFF]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  isOn ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs text-[#475569]">{isOn ? '启用' : '停用'}</span>
          </div>
        ) : f.type === 'upload' ? (
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#165DFF] bg-[#EFF6FF] border border-dashed border-[#93C5FD] rounded-lg hover:bg-[#DBEAFE] cursor-pointer transition">
              <ImagePlus className="w-4 h-4" />
              <span>上传附件 / 现场图片（最多 9 张）</span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                onChange={(e) => handleFileChange(f, e.target.files)}
                className="hidden"
              />
            </label>
            {fileItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {fileItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] text-[#334155]"
                  >
                    <span className="max-w-[140px] truncate">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => removeUpload(f.key, idx)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <input
            type="text"
            value={val}
            onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.ph || `请输入${f.label}`}
            className="h-9 px-3 text-xs border border-[#DCE3EE] rounded-lg bg-white text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#165DFF]"
          />
        )}
        {f.hint && <span className="text-[11px] text-[#64748B]">{f.hint}</span>}
      </div>
    );
  };

  const formBody = (
    <>
      <div className="px-5 py-4 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC] shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#165DFF]" />
          <span className="text-sm font-bold text-[#0F172A]">{titleText}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#EEF2F7] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {(form.groups || []).map((g, gIdx) => (
          <div key={gIdx} className="space-y-3">
            {g.name && (
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#EEF2F7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#165DFF]" />
                <span className="text-xs font-bold text-[#1E40AF]">{g.name}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(g.fields || []).map(renderField)}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3.5 border-t border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-end gap-2 shrink-0">
        {buttons.map((b, idx) => {
          const btnLabel = b.text || b.t || '保存';
          const isPrimary = b.type === 'primary' || !!b.primary;
          const isCancel = b.a === 'cancel' || btnLabel === '取消';
          const isKeepOpen = b.a === 'saveContinue' || btnLabel.includes('不退出');
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (isCancel) onClose();
                else validateAndSubmit(isKeepOpen);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer whitespace-nowrap ${
                isPrimary
                  ? 'bg-[#165DFF] hover:bg-[#1E40AF] text-white'
                  : 'bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#DCE3EE]'
              }`}
            >
              {isPrimary && <Check className="w-3.5 h-3.5" />}
              <span>{btnLabel}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="fixed inset-0 bg-slate-900/40" onClick={onClose} />
        <div
          className="relative z-10 w-full bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
          style={{ maxWidth: form.width ? `${Math.min(Math.max(form.width, 520), 860)}px` : '680px' }}
        >
          {formBody}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
      <div
        className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl w-full max-h-[86vh] flex flex-col overflow-hidden"
        style={{ maxWidth: form.width ? `${Math.min(Math.max(form.width, 560), 860)}px` : '720px' }}
      >
        {formBody}
      </div>
    </div>
  );
};
