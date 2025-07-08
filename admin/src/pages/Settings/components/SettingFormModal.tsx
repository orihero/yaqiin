import React from 'react';

interface SettingFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  error?: string | null;
  setting?: any;
}

const SettingFormModal: React.FC<SettingFormModalProps> = ({ open, onClose, onSubmit, loading, error, setting }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 backdrop-blur-sm bg-black/30" onClick={onClose} />
      <div className="w-[400px] bg-[#232b42] p-8 h-full shadow-xl overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{setting ? 'Edit Setting' : 'Add Setting'}</h2>
        {/* Form fields go here */}
        <div className="mt-8 flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white" disabled={loading} onClick={() => onSubmit({})}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
        {error && <div className="text-red-400 mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default SettingFormModal; 