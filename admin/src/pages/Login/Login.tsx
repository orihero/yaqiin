import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../../store/useLoginMutation';

function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('admin1');
  const [password, setPassword] = useState('test1234');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { mutate, isPending, isError, error, isSuccess } = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate('/');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-[#192132]">
      {/* Left: Welcome Section */}
      <div className="hidden md:flex flex-col justify-center items-start flex-1 px-16 relative overflow-hidden bg-[#1a2235]">
        <div className="absolute -left-32 -top-32 w-[500px] h-[500px] rounded-full border-8 border-[#22304a] opacity-40" />
        <div className="z-10">
          <h1 className="text-4xl font-bold text-white mb-4">{t('login.welcomeTitle')}<br />MDash</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md">{t('login.welcomeSubtitle')}</p>
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2 rounded-full text-base shadow">{t('login.learnMore')}</button>
        </div>
        {/* Logo/graphics bottom right */}
        <div className="absolute bottom-12 left-16 flex gap-6 items-end z-0">
          <span className="bg-cyan-700 rounded-full w-16 h-16 shadow-lg" />
          <span className="bg-cyan-700 rounded-full w-10 h-10 shadow-lg" />
          <span className="bg-cyan-700 rounded-lg w-24 h-8 shadow-lg rotate-12" />
        </div>
      </div>
      {/* Right: Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-[#232c43] rounded-2xl shadow-lg p-10 w-full max-w-md flex flex-col items-center">
          {/* Logo */}
          <Icon icon="mdi:alpha-m-circle" className="text-4xl text-cyan-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">{t('login.signIn')}</h2>
          <div className="text-gray-400 text-sm mb-6">{t('login.adminDashboard')}</div>
          {/* Social login */}
          <div className="flex w-full gap-4 mb-6">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-cyan-500 text-cyan-400 rounded-lg py-2 font-semibold hover:bg-cyan-900 transition">
              <Icon icon="mdi:google" className="text-lg" /> {t('login.google')}
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-cyan-500 text-cyan-400 rounded-lg py-2 font-semibold hover:bg-cyan-900 transition">
              <Icon icon="mdi:facebook" className="text-lg" /> {t('login.facebook')}
            </button>
          </div>
          {/* Divider */}
          <div className="flex items-center w-full mb-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="mx-3 text-gray-500 text-xs">{t('login.orSignInWith')}</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-1" htmlFor="username">{t('login.username')}</label>
              <input
                id="username"
                type="text"
                className="w-full bg-[#202940] rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 outline-none border-none"
                placeholder={t('login.enterUsername')}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-1" htmlFor="password">{t('login.password')}</label>
              <input
                id="password"
                type="password"
                className="w-full bg-[#202940] rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 outline-none border-none"
                placeholder={t('login.enterPassword')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-gray-400 text-sm">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-cyan-500 mr-2"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                {t('login.rememberDevice')}
              </label>
              <a href="#" className="text-cyan-400 text-sm hover:underline">{t('login.forgotPassword')}</a>
            </div>
            {isError && (
              <div className="text-red-400 text-sm mb-2">{(error as Error)?.message}</div>
            )}
            <button
              type="submit"
              className={`w-full bg-cyan-800 text-gray-300 font-semibold py-2 rounded-lg text-lg shadow mb-4 ${isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={isPending}
            >
              {isPending ? t('login.signingIn') : t('login.signIn')}
            </button>
            <div className="text-gray-400 text-sm text-center">
              {t('login.newToMdash')} <a href="#" className="text-cyan-400 hover:underline">{t('login.createAccount')}</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login; 