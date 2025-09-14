import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n'; // Initialize i18n
import { ThemeProvider } from './contexts/ThemeContext';

const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Login = React.lazy(() => import('./pages/Login/Login'));
const Users = React.lazy(() => import('./pages/Users/Users'));
const Shops = React.lazy(() => import('./pages/Shops/Shops'));
const ShopDetails = React.lazy(() => import('./pages/Shops/ShopDetails'));
const Products = React.lazy(() => import('./pages/Products/Products'));
const Categories = React.lazy(() => import('./pages/Categories/Categories'));
const Orders = React.lazy(() => import('./pages/Orders/Orders'));
const Couriers = React.lazy(() => import('./pages/Couriers/Couriers'));
const SupportTickets = React.lazy(() => import('./pages/SupportTickets/SupportTickets'));
// const Outreach = React.lazy(() => import('./pages/Outreach/Outreach')); // Temporarily disabled
const Settings = React.lazy(() => import('./pages/Settings/Settings'));

// Remove mock authentication state as we're using the real auth store

function ProtectedLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-72 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/shops/:shopId" element={<ShopDetails />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/couriers" element={<Couriers />} />
              <Route path="/support-tickets" element={<SupportTickets />} />
              {/* <Route path="/outreach" element={<Outreach />} /> // Temporarily disabled */}
              <Route path="/settings" element={<Settings />} />
              {/* Add more protected routes here */}
            </Route>
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
}

// Create a client for React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss pauseOnHover />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
); 