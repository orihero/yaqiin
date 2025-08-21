import React from 'react';
import ProfileHeader from '../../components/ProfileHeader';
import TabBar from '../../components/TabBar';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';
import { getShopById } from '../../services/api';
import type { Shop } from '@yaqiin/shared/types/shop';

const MyShopScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useUserStore(state => state.user);
  const [shop, setShop] = React.useState<Shop | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user && user.shopId) {
          const shopData = await getShopById(user.shopId);
          setShop(shopData);
        } else {
          setShop(null);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load shop');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [user]);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
        >
          <ProfileHeader title={t('myShop.title')} />
          
          <div className="w-full bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10">
            {loading ? (
              <div className="text-gray-400 text-center">{t('profile.loading')}</div>
            ) : error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : !user?.shopId ? (
              <div className="text-gray-400 text-center">{t('myShop.placeholder')}</div>
            ) : !shop ? (
              <div className="text-gray-400 text-center">{t('myShop.placeholder')}</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#232c43] text-center mt-2 mb-2">{shop.name}</div>
                {shop.status !== 'active' && (
                  <div className="text-xs text-red-500 mb-2">{t('shop.status')}: {shop.status}</div>
                )}
                <div className="text-[#232c43] text-center mb-2">{shop.description}</div>
                <div className="w-full flex flex-col gap-2 mb-2">
                  <div><span className="font-semibold text-[#232c43]">{t('shop.contact')}:</span> <span className="text-gray-800">{shop.contactInfo.phoneNumber}{shop.contactInfo.email ? `, ${shop.contactInfo.email}` : ''}</span></div>
                  <div><span className="font-semibold text-[#232c43]">{t('shop.address')}:</span> <span className="text-gray-800">{shop.address.street}, {shop.address.city}, {shop.address.district}</span></div>
                </div>
                {shop.rating && (
                  <div className="text-sm text-yellow-500 mb-2">{t('shop.rating')}: {shop.rating.average} ⭐ ({shop.rating.totalReviews} {t('shop.reviews')})</div>
                )}
                <div className="text-xs text-gray-600 mt-2">{t('shop.createdAt')}: {new Date(shop.createdAt).toLocaleDateString()}</div>
              </>
            )}
          </div>
        </div>
      </div>
      <TabBar current="Profile" />
    </div>
  );
};

export default MyShopScreen; 