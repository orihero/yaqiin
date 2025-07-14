import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';
// i18n setup
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import './i18n';
import AccountScreen from './screens/AccountScreen/index';
import HomeScreen from './screens/HomeScreen/index';
import LoadingScreen from './screens/LoadingScreen';
import MyCartScreen from './screens/MyCartScreen';
import MyShopScreen from './screens/MyShopScreen/index';
import OnboardingScreen from './screens/OnboardingScreen';
import OrderScreen from './screens/OrderScreen';
import ProductDetails from './screens/ProductDetails';
import ProfileScreen from './screens/ProfileScreen/index';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen/index';
import api from './services/api';
import { useUserStore } from './store/userStore';

async function telegramMiniAppAuth(setUser: (user: any, token: string) => void) {

  const params = retrieveLaunchParams();
  console.log("params", params);
  if (params.tgWebAppData?.signature) {
    try {
      const telegramId = params.tgWebAppData?.user?.id;
      const res = await api.post('/auth/telegram', { telegramId });
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
    console.log("Tryting to get init data");
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
        <Route path="/account" element={<AccountScreen />} />
        <Route path="/my-shop" element={<MyShopScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/search" element={<SearchScreen />} />
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