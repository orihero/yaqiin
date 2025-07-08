import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

const navItems = [
  { name: 'Dashboard', to: '/dashboard', icon: 'mdi:view-dashboard-outline' },
  { name: 'Users', to: '/users', icon: 'mdi:account-group-outline' },
  { name: 'Shops', to: '/shops', icon: 'mdi:storefront-outline' },
  { name: 'Categories', to: '/categories', icon: 'mdi:shape-outline' },
  { name: 'Products', to: '/products', icon: 'mdi:package-variant-closed' },
  { name: 'Orders', to: '/orders', icon: 'mdi:cart-outline' },
  { name: 'Couriers', to: '/couriers', icon: 'mdi:truck-outline' },
  { name: 'Support Tickets', to: '/support-tickets', icon: 'mdi:lifebuoy' },
  { name: 'Settings', to: '/settings', icon: 'mdi:cog-outline' },
];

function Sidebar() {
  return (
    <aside className="h-[92vh] w-64 bg-[#181e2a] rounded-3xl shadow-xl flex flex-col py-8 px-4 fixed top-4 left-4 z-20 border-4 border-[#232c43]">
      <div className="mb-10 flex items-center gap-2 justify-center">
        <span className="text-cyan-400 text-3xl font-bold"><Icon icon="mdi:alpha-m-circle" /></span>
        <span className="text-gray-100 text-xl font-semibold tracking-wide">Admin</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-xl transition-colors font-medium text-gray-300 hover:bg-[#232c43] hover:text-cyan-400 ${
                    isActive ? 'bg-[#232c43] text-cyan-400' : ''
                  }`
                }
              >
                <Icon icon={item.icon} className="text-xl" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar; 