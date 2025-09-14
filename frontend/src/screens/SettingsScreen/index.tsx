import React from 'react';
import ProfileHeader from '../../components/ProfileHeader';
import TabBar from '../../components/TabBar';
import ThemeToggle from '../../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const LANGS = [
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  const clearUser = useUserStore(state => state.clearUser);
  const [lang, setLang] = React.useState(localStorage.getItem('lang') || 'uz');
  const { t } = useTranslation();

  const handleTabChange = (tab: string) => {
    if (tab === 'Home') navigate('/home');
    else if (tab === 'Search') navigate('/search');
    else if (tab === 'My Cart') navigate('/cart');
    else if (tab === 'Profile') navigate('/profile');
  };
  
  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleLogout = () => {
    if (confirm(t('settings.confirmLogout'))) {
      clearUser();
      navigate('/login');
    }
  };
  
  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white dark:bg-gray-900 rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 90px)', maxHeight: 'calc(100vh - 90px)' }}
        >
          <ProfileHeader title={t('settings.title')} />
          
          <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col relative z-10">
            <div className="text-xl font-bold text-[#232c43] dark:text-white text-center mb-6">{t('settings.title')}</div>
            
            {/* Language Settings */}
            <div className="w-full flex flex-col gap-4 mb-6">
              <label className="text-base font-semibold text-[#232c43] dark:text-white mb-1" htmlFor="lang-select">
                {t('settings.language')}
              </label>
              <select
                id="lang-select"
                className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-[#232c43] dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:border-[#ff7a00]"
                value={lang}
                onChange={handleLangChange}
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Theme Settings */}
            <div className="w-full flex flex-col gap-4 mb-6">
              <label className="text-base font-semibold text-[#232c43] dark:text-white mb-1">
                Theme
              </label>
              <div className="flex items-center justify-between p-4 bg-[#f8f8f8] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Icon icon="mdi:theme-light-dark" className="text-[#ff7a00] text-xl" />
                  <div className="text-left">
                    <div className="font-semibold text-[#232c43] dark:text-white">Dark Mode</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Switch between light and dark themes
                    </div>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Address Management */}
            <div className="w-full flex flex-col gap-4 mb-6">
              <h3 className="text-base font-semibold text-[#232c43] dark:text-white mb-2">
                {t('settings.accountManagement')}
              </h3>
              
              <button
                className="w-full flex items-center justify-between p-4 bg-[#f8f8f8] dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() => navigate('/address')}
              >
                <div className="flex items-center gap-3">
                  <Icon icon="mdi:map-marker" className="text-[#ff7a00] text-xl" />
                  <div className="text-left">
                    <div className="font-semibold text-[#232c43] dark:text-white">{t('address.title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.addresses?.length || 0} {t('address.addresses')}
                    </div>
                  </div>
                </div>
                <Icon icon="mdi:chevron-right" className="text-gray-400 text-xl" />
              </button>

              <button
                className="w-full flex items-center justify-between p-4 bg-[#f8f8f8] dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() => navigate('/my-shop')}
              >
                <div className="flex items-center gap-3">
                  <Icon icon="mdi:store" className="text-[#ff7a00] text-xl" />
                  <div className="text-left">
                    <div className="font-semibold text-[#232c43] dark:text-white">{t('myShop.title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.shopId ? t('myShop.viewShop') : t('myShop.noShopAssigned')}
                    </div>
                  </div>
                </div>
                <Icon icon="mdi:chevron-right" className="text-gray-400 text-xl" />
              </button>
            </div>

            {/* Logout */}
            <div className="w-full flex flex-col gap-4">
              <button
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
                onClick={handleLogout}
              >
                <Icon icon="mdi:logout" className="text-xl" />
                <span className="font-semibold">{t('settings.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <TabBar current="Profile" />
    </div>
  );
};

export default SettingsScreen; 