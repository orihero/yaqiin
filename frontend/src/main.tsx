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
import AddressScreen from './screens/AddressScreen/index';
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
  try {
    const params = retrieveLaunchParams();
    console.log("params", params);

    if (params.tgWebAppData?.signature) {
      try {
        const telegramId = params.tgWebAppData?.user?.id;
        console.log("Attempting to authenticate with telegramId:", telegramId);

        const res = await api.post('/auth/telegram', { telegramId });
        const { token, user } = res.data.data;
        setUser(user, token);
        localStorage.setItem('token', token);
        console.log("Telegram authentication successful");
      } catch (err) {
        console.error("Telegram authentication failed:", err);
      }
    } else {
      console.log("No Telegram WebApp signature found");
    }
  } catch (error) {
    console.error("Error in telegramMiniAppAuth:", error);
  }
}

function initializeTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    try {
      // Signal that WebApp is ready
      tg.ready();
      // Request fullscreen expansion
      tg.expand();
      console.log("Telegram WebApp initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing Telegram WebApp:", error);
      return false;
    }
  }
  return false;
}

function App() {
  const setUser = useUserStore((s) => s.setUser);

  // Debug information
  React.useEffect(() => {
    console.log("=== WebApp Debug Information ===");
    console.log("window.Telegram:", !!window.Telegram);
    console.log("window.Telegram?.WebApp:", !!window.Telegram?.WebApp);
    console.log("window.location.href:", window.location.href);
    console.log("User Agent:", navigator.userAgent);
    console.log("=== End Debug Information ===");
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.requestFullscreen();
        window.Telegram.WebApp.lockOrientation('portrait');
        window.Telegram.WebApp.disableVerticalSwipes();
        window.Telegram.WebApp.disableHorizontalSwipes();
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          console.log("Back button pressed");
        });
      }
    } catch (error) {
      console.error("Error initializing Telegram WebApp:", error);
    }
  }, []);

  React.useEffect(() => {
    console.log("Trying to get init data");
    telegramMiniAppAuth(setUser);
  }, [setUser]);

  // Initialize Telegram WebApp
  React.useEffect(() => {
    const success = initializeTelegramWebApp();
    if (!success) {
      console.log("Telegram WebApp not detected - running in browser mode");
    }
  }, []);

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
        <Route path="/address" element={<AddressScreen />} />
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