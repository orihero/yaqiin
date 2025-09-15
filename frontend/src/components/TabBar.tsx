import React from "react";
import { Icon } from "@iconify/react";
import { useCartStore } from '../store/cartStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SafeArea from './SafeArea';

const TabBar: React.FC<{ current: string }> = ({ current }) => {
    const cart = useCartStore(state => state.cart);
    // Count only unique items
    const cartCount = cart.length;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const tabs = [
        { key: "Home", label: t('tabBar.home'), icon: "mdi:home", path: '/home' },
        { key: "Search", label: t('tabBar.search'), icon: "mdi:magnify", path: '/search' },
        { key: "My Cart", label: t('tabBar.cart'), icon: "mdi:cart", path: '/cart' },
        { key: "Profile", label: t('tabBar.profile'), icon: "mdi:account", path: '/profile' },
    ];
    return (
        <SafeArea 
            className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md shadow-lg flex justify-between items-center px-2 py-3 z-40 bg-[#232c43]"
            edges={['bottom']}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`flex flex-col items-center flex-1 ${
                        current === tab.key ? "text-[#fff]" : "text-[#cbcbcb]"
                    }`}
                    onClick={() => navigate(tab.path)}
                    style={{ position: 'relative' }}
                >
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                        <Icon icon={tab.icon} className="text-2xl mb-1" />
                        {tab.key === "My Cart" && cartCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -4,
                                    right: -10,
                                    minWidth: 18,
                                    height: 18,
                                    background: '#ff7a00',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    fontSize: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 5px',
                                    fontWeight: 700,
                                    zIndex: 2,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                                    pointerEvents: 'none',
                                }}
                            >
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </span>
                    <span className="text-xs supreme-ll-black">{tab.label}</span>
                </button>
            ))}
        </SafeArea>
    );
};

export default TabBar;
