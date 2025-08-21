import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

interface OutreachFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  outreach?: any;
  isLoading?: boolean;
}

function OutreachFormModal({ isOpen, onClose, onSubmit, outreach, isLoading }: OutreachFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'all',
    sendImmediately: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (outreach) {
      setFormData({
        title: outreach.title || '',
        message: outreach.message || '',
        targetType: outreach.targetType || 'all',
        sendImmediately: false,
      });
    } else {
      setFormData({
        title: '',
        message: '',
        targetType: 'all',
        sendImmediately: true,
      });
    }
    setErrors({});
  }, [outreach, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('outreach.validation.titleRequired');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('outreach.validation.messageRequired');
    }

    if (formData.message.length > 1000) {
      newErrors.message = t('outreach.validation.messageTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {outreach ? t('outreach.editOutreach') : t('outreach.createOutreach')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('outreach.title')} *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('outreach.titlePlaceholder')}
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Target Type Field */}
          <div>
            <label htmlFor="targetType" className="block text-sm font-medium text-gray-700 mb-2">
              {t('outreach.targetType')} *
            </label>
            <select
              id="targetType"
              value={formData.targetType}
              onChange={(e) => handleInputChange('targetType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">{t('outreach.targetTypes.all')}</option>
              <option value="customers">{t('outreach.targetTypes.customers')}</option>
              <option value="shop_owners">{t('outreach.targetTypes.shopOwners')}</option>
              <option value="couriers">{t('outreach.targetTypes.couriers')}</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {t('outreach.targetTypeDescription')}
            </p>
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              {t('outreach.message')} *
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('outreach.messagePlaceholder')}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message && (
                <p className="text-sm text-red-600">{errors.message}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.message.length}/1000
              </p>
            </div>
          </div>

          {/* Send Immediately Option */}
          {!outreach && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendImmediately"
                checked={formData.sendImmediately}
                onChange={(e) => handleInputChange('sendImmediately', e.target.checked)}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label htmlFor="sendImmediately" className="ml-2 block text-sm text-gray-700">
                {t('outreach.sendImmediately')}
              </label>
            </div>
          )}

          {/* Preview Section */}
          {formData.message && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {t('outreach.preview')}
              </h3>
              <div className="bg-white border rounded-lg p-3">
                <div className="font-medium text-gray-900 mb-2">{formData.title}</div>
                <div className="text-gray-700 whitespace-pre-wrap">{formData.message}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Icon icon="mdi:loading" className="animate-spin" />}
              {outreach ? t('common.update') : t('outreach.sendMessage')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OutreachFormModal;
