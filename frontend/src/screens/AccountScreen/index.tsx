import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import ProfileHeader from '../../components/ProfileHeader';
import TabBar from '../../components/TabBar';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchCurrentUser, updateCurrentUser } from '../../services/userService';
import type { User } from '@yaqiin/shared/types/user';
import { toast } from 'react-toastify';

const AccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });

  const updateUserMutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
      toast.success(t('account.updateSuccess'));
    },
    onError: () => {
      toast.error(t('account.updateFailed'));
    },
  });

  const handleEdit = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = () => {
    updateUserMutation.mutate(editData);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
        <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
          <div
            className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
            style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
          >
            <ProfileHeader title={t('account.title')} />
            <div className="w-full bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10">
              <div className="text-gray-400 text-center">{t('account.loading')}</div>
            </div>
          </div>
        </div>
        <TabBar current="Profile" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
        <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
          <div
            className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
            style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
          >
            <ProfileHeader title={t('account.title')} />
            <div className="w-full bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10">
              <div className="text-red-400 text-center">{t('account.failedToLoad')}</div>
            </div>
          </div>
        </div>
        <TabBar current="Profile" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
        >
          <ProfileHeader title={t('account.title')} />
          
          <div className="w-full bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10">
            <div className="text-xl font-bold text-[#232c43] text-center mt-2 mb-6">
              {t('account.info')}
            </div>
            
            <div className="w-full space-y-4">
              {/* First Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#232c43] mb-1">
                  {t('account.firstName')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#232c43] text-gray-700 bg-white"
                    placeholder={t('account.firstName')}
                  />
                ) : (
                  <div className="text-gray-700 py-2">
                    {user.firstName || t('account.noData')}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#232c43] mb-1">
                  {t('account.lastName')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#232c43] text-gray-700 bg-white"
                    placeholder={t('account.lastName')}
                  />
                ) : (
                  <div className="text-gray-700 py-2">
                    {user.lastName || t('account.noData')}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#232c43] mb-1">
                  {t('account.phoneNumber')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#232c43] text-gray-700 bg-white"
                    placeholder={t('account.phoneNumber')}
                  />
                ) : (
                  <div className="text-gray-700 py-2">
                    {user.phoneNumber || t('account.noData')}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#232c43] mb-1">
                  {t('account.email')}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#232c43] text-gray-700 bg-white"
                    placeholder={t('account.email')}
                  />
                ) : (
                  <div className="text-gray-700 py-2">
                    {user.email || t('account.noData')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={updateUserMutation.isPending}
                      className="flex-1 bg-[#232c43] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#1a2332] transition disabled:opacity-50"
                    >
                      {updateUserMutation.isPending ? t('account.loading') : t('account.save')}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={updateUserMutation.isPending}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
                    >
                      {t('account.cancel')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="flex-1 bg-[#232c43] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#1a2332] transition flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:pencil" className="text-lg" />
                    {t('account.edit')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <TabBar current="Profile" />
    </div>
  );
};

export default AccountScreen; 