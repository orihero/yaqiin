import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSetting, createSetting, deleteSetting } from '../../services/settingService';
import type { Setting } from '@yaqiin/shared/types/setting';
import SettingFormModal from './components/SettingFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

// Simple iOS-style Switch component
const Switch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 border-none focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-400'}`}
    onClick={() => onChange(!checked)}
    type="button"
    aria-pressed={checked}
    style={{ boxShadow: checked ? '0 0 0 2px #22c55e33' : '0 0 0 1px #8884' }}
  >
    <span
      className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}
      style={{ boxShadow: '0 2px 8px 0 #0002' }}
    />
  </button>
);

const Settings: React.FC = () => {
  const { t } = useTranslation();
  
  const TABS = [
    { key: 'featureFlags', label: t('settings.featureFlags') },
    // Future tabs can be added here
  ];
  const [currentTab, setCurrentTab] = useState('featureFlags');
  const [showModal, setShowModal] = useState(false);
  const [editFlag, setEditFlag] = useState<Setting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Setting | null>(null);
  const queryClient = useQueryClient();

  // Fetch all settings, filter for those with flagType
  const { data, isLoading, isError, error } = useQuery<Setting[], Error>({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const res = await getSettings(1, 100); // get up to 100 settings
      return (res.data as Setting[]).filter((s) => s.flagType);
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: Partial<Setting>) => createSetting(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: Partial<Setting> & { _id: string }) => updateSetting(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setEditFlag(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setDeleteTarget(null);
    },
  });

  const handleFlagChange = (setting: Setting, newValue: any) => {
    updateMutation.mutate({ ...setting, value: newValue });
  };

  const handleAdd = () => {
    setEditFlag(null);
    setShowModal(true);
  };

  const handleEdit = (flag: Setting) => {
    setEditFlag(flag);
    setShowModal(true);
  };

  const handleDelete = (flag: Setting) => {
    setDeleteTarget(flag);
  };

  const handleModalSubmit = (values: any) => {
    if (editFlag) {
      updateMutation.mutate({ ...editFlag, ...values });
    } else {
      createMutation.mutate({ ...values, type: 'system' });
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('navigation.settings')}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={handleAdd}
        >
          + Add Feature Flag
        </button>
      </div>
      {/* Tab Bar */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${currentTab === tab.key ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            onClick={() => setCurrentTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {currentTab === 'featureFlags' && (
        <div className="bg-[#232b42] rounded-xl overflow-x-auto p-8 text-gray-200">
          {isLoading && <div>Loading feature flags...</div>}
          {isError && <div className="text-red-400">Error: {error?.message || 'Failed to load feature flags.'}</div>}
          {!isLoading && !isError && (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-2 px-4">Key</th>
                  <th className="py-2 px-4">Type</th>
                  <th className="py-2 px-4">Value</th>
                  <th className="py-2 px-4">Options</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((flag) => (
                  <tr key={flag._id} className="border-b border-gray-700 last:border-b-0">
                    <td className="py-2 px-4 font-mono">{flag.key}</td>
                    <td className="py-2 px-4 capitalize">{flag.flagType}</td>
                    <td className="py-2 px-4">
                      {flag.flagType === 'bool' && (
                        <Switch
                          checked={!!flag.value}
                          onChange={v => handleFlagChange(flag, v)}
                        />
                      )}
                      {flag.flagType === 'text' && (
                        <input
                          className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 w-64"
                          type="text"
                          value={typeof flag.value === 'string' ? flag.value : ''}
                          onChange={e => handleFlagChange(flag, e.target.value)}
                          disabled={updateMutation.isPending}
                        />
                      )}
                      {flag.flagType === 'select' && (
                        <select
                          className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 w-40"
                          value={typeof flag.value === 'string' ? flag.value : ''}
                          onChange={e => handleFlagChange(flag, e.target.value)}
                          disabled={updateMutation.isPending}
                        >
                          {flag.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {flag.flagType === 'select' && flag.options?.join(', ')}
                    </td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs"
                        onClick={() => handleEdit(flag)}
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-xs"
                        onClick={() => handleDelete(flag)}
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Add/Edit Modal */}
      <SettingFormModal
        open={showModal || !!editFlag}
        onClose={() => { setShowModal(false); setEditFlag(null); }}
        onSubmit={handleModalSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        error={createMutation.error?.message || updateMutation.error?.message || null}
        setting={editFlag || undefined}
      />
      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Feature Flag"
        description={`Are you sure you want to delete the feature flag "${deleteTarget?.key}"? This action cannot be undone.`}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
      />
    </div>
  );
};

export default Settings; 