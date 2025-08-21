import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOutreach, getOutreachHistory } from '../../services/outreachService';
import { Outreach } from '../../../shared/types';
import OutreachFormModal from './components/OutreachFormModal';

function OutreachPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOutreach, setSelectedOutreach] = useState<Outreach | null>(null);
  const queryClient = useQueryClient();

  const { data: outreachHistory, isLoading } = useQuery({
    queryKey: ['outreach-history'],
    queryFn: getOutreachHistory,
  });

  const createOutreachMutation = useMutation({
    mutationFn: createOutreach,
    onSuccess: () => {
      toast.success(t('outreach.createdSuccessfully'));
      setIsModalOpen(false);
      setSelectedOutreach(null);
      queryClient.invalidateQueries({ queryKey: ['outreach-history'] });
    },
    onError: (error) => {
      toast.error(t('outreach.failedToCreate'));
      console.error('Failed to create outreach:', error);
    },
  });

  const handleCreateOutreach = (data: any) => {
    createOutreachMutation.mutate(data);
  };

  const handleEditOutreach = (outreach: Outreach) => {
    setSelectedOutreach(outreach);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-500 bg-green-100';
      case 'failed':
        return 'text-red-500 bg-red-100';
      case 'draft':
        return 'text-yellow-500 bg-yellow-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'all':
        return t('outreach.targetTypes.all');
      case 'couriers':
        return t('outreach.targetTypes.couriers');
      case 'shop_owners':
        return t('outreach.targetTypes.shopOwners');
      case 'customers':
        return t('outreach.targetTypes.customers');
      default:
        return targetType;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('outreach.title')}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Icon icon="mdi:plus" />
          {t('outreach.createOutreach')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{t('outreach.history')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('outreach.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('outreach.targetType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('outreach.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('outreach.recipients')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('outreach.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {outreachHistory?.map((outreach: Outreach) => (
                <tr key={outreach.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{outreach.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{outreach.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getTargetTypeLabel(outreach.targetType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(outreach.status)}`}>
                      {t(`outreach.statuses.${outreach.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{outreach.recipientCount} {t('outreach.total')}</div>
                    {outreach.status === 'sent' && (
                      <div className="text-xs text-gray-500">
                        {outreach.successCount} {t('outreach.successful')}, {outreach.failureCount} {t('outreach.failed')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(outreach.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditOutreach(outreach)}
                      className="text-cyan-600 hover:text-cyan-900 mr-3"
                    >
                      {t('common.view')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!outreachHistory || outreachHistory.length === 0) && (
            <div className="text-center py-8">
              <Icon icon="mdi:message-outline" className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('outreach.noOutreachFound')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('outreach.clickCreateOutreachToStart')}</p>
            </div>
          )}
        </div>
      </div>

      <OutreachFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOutreach(null);
        }}
        onSubmit={handleCreateOutreach}
        outreach={selectedOutreach}
        isLoading={createOutreachMutation.isPending}
      />
    </div>
  );
}

export default OutreachPage;
