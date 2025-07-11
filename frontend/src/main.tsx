// Extend the Window interface to include Telegram for TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        // Add more mock properties if needed
      };
    };
  }
}
// Mock Telegram WebApp for local development if ?mockTelegram is in the URL
if (window.location.search.includes('mockTelegram')) {
  window.Telegram = {
    WebApp: {
      initData: 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%7D&chat_instance=abcdef1234567890&auth_date=1710000000&hash=abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
      // Add more mock properties if needed
    }
  };
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';
// i18n setup
import './i18n';
import HomeScreen from './screens/HomeScreen/index';
import LoadingScreen from './screens/LoadingScreen';
import MyCartScreen from './screens/MyCartScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import OrderScreen from './screens/OrderScreen';
import ProductDetails from './screens/ProductDetails';
import ProfileScreen from './screens/ProfileScreen/index';
import api from './services/api';
import { useUserStore } from './store/userStore';

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