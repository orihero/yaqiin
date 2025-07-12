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
import { getTelegramInitDataRaw } from './services/telegramInitData';

async function telegramMiniAppAuth(setUser: (user: any, token: string) => void) {
  const initDataRaw = getTelegramInitDataRaw();
  if (initDataRaw) {
    try {
      const res = await api.post('/auth/telegram', { initData: initDataRaw });
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