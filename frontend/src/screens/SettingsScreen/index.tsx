import React from 'react';
import Header from '../../components/Header';
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
    <div className="min-h-screen bg-[#232c43] flex flex-col items-center pt-6 pb-0">
      <div className="w-full max-w-md px-4">
        <Header title={t('settings.title')} />
      </div>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10 mx-4">
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
      <TabBar current="Profile" />
    </div>
  );
};

export default SettingsScreen; 