import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({ open, title, description, loading, onCancel, onConfirm }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onCancel}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0 text-center">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p>{description}</p>
        <div className="flex justify-center gap-2 mt-6">
          <button className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-red-500 hover:bg-red-600" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
} 