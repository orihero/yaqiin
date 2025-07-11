import React, { useState, useEffect } from 'react';

interface SettingFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  error?: string | null;
  setting?: any;
}

const FLAG_TYPES = [
  { value: 'bool', label: 'Boolean' },
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Select' },
];

const SettingFormModal: React.FC<SettingFormModalProps> = ({ open, onClose, onSubmit, loading, error, setting }) => {
  const [form, setForm] = useState<{
    key: string;
    flagType: string;
    value: string | boolean;
    options: string;
    description: string;
    isActive: boolean;
  }>({
    key: '',
    flagType: 'bool',
    value: false,
    options: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (setting) {
      setForm({
        key: setting.key || '',
        flagType: setting.flagType || 'bool',
        value: setting.value ?? (setting.flagType === 'bool' ? false : ''),
        options: Array.isArray(setting.options) ? setting.options.join(', ') : '',
        description: setting.description || '',
        isActive: setting.isActive ?? true,
      });
    } else {
      setForm({ key: '', flagType: 'bool', value: false, options: '', description: '', isActive: true });
    }
  }, [setting, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      // @ts-ignore
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleFlagTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const flagType = e.target.value;
    setForm(f => ({
      ...f,
      flagType,
      value: flagType === 'bool' ? false : '', // always boolean for bool, string for others
      options: flagType === 'select' ? '' : '',
    }));
  };

  const handleValueChange = (v: any) => {
    setForm(f => ({ ...f, value: v }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitObj = {
      ...form,
      options: form.flagType === 'select' ? form.options.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      value: form.flagType === 'bool' ? Boolean(form.value) : form.value,
    };
    onSubmit(submitObj);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 backdrop-blur-sm bg-black/30" onClick={onClose} />
      <div className="w-[400px] bg-[#232b42] p-8 h-full shadow-xl overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{setting ? 'Edit Feature Flag' : 'Add Feature Flag'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Key</label>
            <input name="key" className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" value={form.key} onChange={handleChange} required disabled={!!setting} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Type</label>
            <select name="flagType" className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" value={form.flagType} onChange={handleFlagTypeChange} required disabled={!!setting}>
              {FLAG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {form.flagType === 'bool' && (
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Value</label>
              <input type="checkbox" name="value" checked={!!form.value} onChange={handleChange} />
            </div>
          )}
          {form.flagType === 'text' && (
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Value</label>
              <input name="value" className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" value={typeof form.value === 'string' ? form.value : ''} onChange={handleChange} />
            </div>
          )}
          {form.flagType === 'select' && (
            <>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Options (comma separated)</label>
                <input name="options" className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" value={form.options} onChange={handleChange} required={form.flagType === 'select'} />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Value</label>
                <select name="value" className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" value={typeof form.value === 'string' ? form.value : ''} onChange={handleChange}>
                  {form.options.split(',').map(opt => opt.trim()).filter(Boolean).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Description</label>
            <textarea name="description" className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" value={form.description} onChange={handleChange} />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} />
            <label className="font-semibold">Active</label>
          </div>
          <div className="mt-8 flex justify-end gap-2">
            <button className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose} type="button" disabled={loading}>Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white" disabled={loading} type="submit">{loading ? 'Saving...' : 'Save'}</button>
          </div>
          {error && <div className="text-red-400 mt-4">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default SettingFormModal; 