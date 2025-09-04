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
        setError(err?.message || t('myShop.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [user, t]);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 90px)', maxHeight: 'calc(100vh - 90px)' }}
        >
          <ProfileHeader title={t('myShop.title')} />
          
          <div className="w-full bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10">
            {loading ? (
              <div className="text-gray-400 text-center">{t('common.loading')}</div>
            ) : error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : !user?.shopId ? (
              <div className="text-gray-400 text-center">{t('myShop.noShopAssigned')}</div>
            ) : !shop ? (
              <div className="text-gray-400 text-center">{t('myShop.shopNotFound')}</div>
            ) : (
              <>
                {/* Shop Logo */}
                {shop.logo && (
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-[#f8f8f8]">
                    <img
                      src={shop.logo}
                      alt={t('myShop.shopLogo')}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Shop Photo */}
                {shop.photo && (
                  <div className="w-full h-32 rounded-2xl overflow-hidden mb-4">
                    <img
                      src={shop.photo}
                      alt={t('myShop.shopPhoto')}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="text-2xl font-bold text-[#232c43] text-center mt-2 mb-2">{shop.name}</div>
                
                {shop.status !== 'active' && (
                  <div className="text-xs text-red-500 mb-2">
                    {t('shop.status')}: {t(`shop.statuses.${shop.status}`)}
                  </div>
                )}
                
                {shop.description && (
                  <div className="text-[#232c43] text-center mb-4 text-sm">{shop.description}</div>
                )}
                
                <div className="w-full flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#232c43] text-sm">{t('shop.contact')}:</span>
                    <span className="text-gray-800 text-sm">
                      {shop.contactInfo.phoneNumber}
                      {shop.contactInfo.email && `, ${shop.contactInfo.email}`}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#232c43] text-sm">{t('shop.address')}:</span>
                    <span className="text-gray-800 text-sm">
                      {shop.address.street}, {shop.address.city}, {shop.address.district}
                    </span>
                  </div>
                </div>
                
                {shop.rating && (
                  <div className="text-sm text-yellow-500 mb-3">
                    {t('shop.rating')}: {shop.rating.average.toFixed(1)} ⭐ ({shop.rating.totalReviews} {t('shop.reviews')})
                  </div>
                )}
                
                <div className="text-xs text-gray-600 mt-2">
                  {t('shop.createdAt')}: {new Date(shop.createdAt).toLocaleDateString()}
                </div>
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