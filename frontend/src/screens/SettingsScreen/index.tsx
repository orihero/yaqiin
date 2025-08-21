import React from 'react';
import ProfileHeader from '../../components/ProfileHeader';
import TabBar from '../../components/TabBar';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
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
  
  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
        >
          <ProfileHeader title={t('settings.title')} />
          
          <div className="w-full bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10">
            <div className="text-xl font-bold text-[#232c43] text-center mt-2 mb-4">{t('settings.title')}</div>
            <div className="w-full flex flex-col gap-4 mb-8">
              <label className="text-base font-semibold text-[#232c43] mb-1" htmlFor="lang-select">{t('settings.language')}</label>
              <select
                id="lang-select"
                className="border rounded px-4 py-2 text-base text-[#232c43] bg-white focus:outline-none"
                value={lang}
                onChange={handleLangChange}
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <TabBar current="Profile" />
    </div>
  );
};

export default SettingsScreen; 