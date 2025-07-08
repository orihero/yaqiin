import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// i18n setup
import './i18n';
import LoadingScreen from './screens/LoadingScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen/index';
import ProductDetails from './screens/ProductDetails';
import MyCartScreen from './screens/MyCartScreen';
import ProfileScreen from './screens/ProfileScreen/index';
import OrderScreen from './screens/OrderScreen';
import { useAuthCheck } from './hooks/useAuthCheck';
import { useUserStore } from './store/userStore';
import api from './services/api';

async function telegramMiniAppAuth(setUser: (user: any, token: string) => void) {
  // @ts-ignore
  const tg = window.Telegram?.WebApp;
  if (tg && tg.initData) {
    try {
      const res = await api.post('/auth/telegram', { initData: tg.initData });
      const { token, user } = res.data.data;
      setUser(user, token);
      localStorage.setItem('token', token);
    } catch (err) {
      // Optionally handle error
    }
  }
}

function App() {
  const setUser = useUserStore((s) => s.setUser);
  React.useEffect(() => {
    telegramMiniAppAuth(setUser);
  }, [setUser]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<MyCartScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/orders" element={<OrderScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss pauseOnHover />
    </QueryClientProvider>
  </React.StrictMode>
); 