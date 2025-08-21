import { Icon } from "@iconify/react";
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from "@yaqiin/shared/utils/formatPrice";
import React from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { toast } from 'react-toastify';
import TabBar from "../../components/TabBar";
import { createOrder } from '../../services/orderService';
import type { CartItem as CartItemType } from "../../store/cartStore";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from '../../store/userStore';
import Lottie from "lottie-react";
import emptyBoxAnimation from '../../assets/animations/empty-box.json';

type CartItemProps = {
    item: CartItemType;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
};

function CartItem({ item, updateQuantity, removeFromCart }: CartItemProps) {
    const [showDelete, setShowDelete] = React.useState(false);
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setShowDelete(true),
        onSwipedRight: () => setShowDelete(false),
        delta: 50,
        trackMouse: true,
    });
    const handleMinus = () => {
        if (item.quantity > 1) {
            updateQuantity(item.product._id, item.quantity - 1);
        } else {
            setShowDelete(true);
        }
    };
    const { t } = useTranslation();
    return (
        <div className="relative">
            <div
                {...swipeHandlers}
                className={`flex items-center bg-[#F6F6F6] pl-4 pr-2 rounded-2xl transition-transform duration-300 ${showDelete ? "translate-x-[-80px]" : ""
                    }`}
                style={{ position: "relative", zIndex: 1 }}
            >
                <img
                    src={
                        item.product.images?.[0] ||
                        "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png"
                    }
                    alt={
                        item.product.name?.uz ||
                        item.product.name?.ru ||
                        "Product"
                    }
                    className="w-20 h-20 rounded-xl object-cover mr-4"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                            "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png";
                    }}
                />
                <div className="flex-1 flex flex-col justify-between">
                    <div className="font-semibold text-base text-[#232c43]">
                        {item.product.name?.uz ||
                            item.product.name?.ru ||
                            t('productCard.product')}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                        {item.product.nutritionalInfo?.calories
                            ? `${item.product.nutritionalInfo.calories} cal`
                            : ""}
                    </div>
                    <div className="text-[#ff7a00] font-bold text-base">
                        {formatPrice(item.product.price || item.product.basePrice)}
                        <span className="text-xs font-normal text-gray-400">
                            /{t('productCard.kg')}
                        </span>
                    </div>
                </div>
                {/* Controls: plus, count, minus in a single column */}
                <div className="flex flex-col items-center ml-4 gap-1">
                    <button
                        className="w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold text-lg"
                        onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                        }
                    >
                        <Icon
                            icon="mdi:plus"
                            className="text-[#232c43] text-base"
                        />
                    </button>
                    <div className="w-8 h-8 flex items-center justify-center bg-[#232c43] rounded-lg text-white font-bold text-base">
                        {item.quantity}
                    </div>
                    <button
                        className="w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold text-lg"
                        onClick={handleMinus}
                    >
                        <Icon
                            icon="mdi:minus"
                            className="text-[#232c43] text-base"
                        />
                    </button>
                </div>
            </div>
            {/* Delete button slides in from the right, tall rounded-rectangle, orange */}
            <div
                className={`absolute top-0 right-0 h-full flex items-center pr-2 transition-all duration-300 ${showDelete
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                    }`}
                style={{ zIndex: 2 }}
            >
                <button
                    className="bg-[#ff7a00] rounded-xl px-4 py-3 flex items-center justify-center shadow-lg h-16"
                    onClick={() => removeFromCart(item.product._id)}
                >
                    <Icon icon="mdi:delete" className="text-white text-xl" />
                </button>
            </div>
        </div>
    );
}

const MyCartScreen = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getShopId, hasMultipleShops } = useCartStore();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = useUserStore(state => state.user);
    const setUser = useUserStore(state => state.setUser);
    // Fetch user if not loaded
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            if (!user) {
                const res = await import('../../services/userService');
                const u = await res.fetchCurrentUser();
                setUser(u, localStorage.getItem('token') || '');
                return u;
            }
            return user;
        }
    });

    const [isCheckoutLoading, setCheckoutLoading] = React.useState(false);
    const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

    const getTotal = () => cart.reduce((sum, item) => sum + (item.product.price || item.product.basePrice) * item.quantity, 0);

    // Helper: get default address
    const getDefaultAddress = (userObj: any) => {
        if (!userObj?.addresses || userObj.addresses.length === 0) return null;
        return userObj.addresses.find((a: any) => a.isDefault) || userObj.addresses[0];
    };

    // Helper: get shopId (all items must be from same shop)
    const getShopIdFromCart = () => {
        return getShopId();
    };

    // Helper: build items array
    const buildOrderItems = () => cart.map(item => {
        const price = item.product.price || item.product.basePrice;
        return {
            productId: item.product._id,
            name: item.product.name.uz || item.product.name.ru || '',
            price: price,
            quantity: item.quantity,
            unit: item.product.unit,
            subtotal: price * item.quantity,
            image: item.product.images?.[0] || '',
        };
    });

    // Helper: build pricing
    const buildPricing = () => {
        const itemsTotal = getTotal();
        const deliveryFee = 0; // TODO: calculate or fetch delivery fee
        const serviceFee = 0; // TODO: calculate or fetch service fee
        const tax = 0;
        const discount = 0;
        const total = itemsTotal + deliveryFee + serviceFee + tax - discount;
        return { itemsTotal, deliveryFee, serviceFee, tax, discount, total };
    };

    const handleCheckout = async () => {
        setCheckoutError(null);
        setCheckoutLoading(true);
        try {
            const userObj = userData || user;
            if (!userObj) throw new Error(t('cart.userNotLoaded') || 'User not loaded');
            const address = getDefaultAddress(userObj);
            if (!address) throw new Error(t('cart.noAddress') || 'No delivery address found.');
            const shopId = getShopIdFromCart();
            console.log('====================================');
            console.log(JSON.stringify({ userObj, address, shopId }, null, 2));
            console.log('====================================');
            if (!shopId) throw new Error(t('cart.multipleShops') || 'All items must be from the same shop.');
            const items = buildOrderItems();
            const payload: any = {
                shopId,
                items,
                deliveryAddress: {
                    title: address.title,
                    street: address.street,
                    city: address.city,
                    district: address.district,
                    coordinates: address.coordinates,
                    notes: address.notes || '',
                },
                paymentMethod: 'cash_on_delivery',
            };
            await createOrder(payload);
            clearCart();
            toast.success(t('cart.orderSuccess') || 'Order placed successfully!');
            navigate('/orders');
        } catch (err: any) {
            const fallback = t('cart.checkoutFailed') || 'Checkout failed';
            setCheckoutError(err?.message || fallback);
            toast.error(err?.message || fallback);
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
            {/* Main Content Card */}
            <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
                <div
                    className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
                    style={{
                        minHeight: "calc(100vh - 70px)",
                        maxHeight: "calc(100vh - 70px)",
                    }}
                >
                    {/* Header with Total and Checkout */}
                    <div className="flex items-center justify-between mb-6 pt-6 px-0">
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-[#232c43] leading-tight">
                                {t('home.title1')} {t('home.title2')}
                            </h1>
                        </div>
                        {cart.length > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">
                                        {t('cart.totalAmount')}
                                    </div>
                                    <div className="text-sm font-semibold text-[#232c43]">
                                        {formatPrice(getTotal())}
                                    </div>
                                </div>
                                <button
                                    className="bg-[#232c43] text-white rounded-full px-4 py-2 text-sm font-semibold shadow-md disabled:opacity-60"
                                    disabled={isCheckoutLoading || isUserLoading}
                                    onClick={handleCheckout}
                                >
                                    {isCheckoutLoading ? t('cart.processing') || 'Processing...' : t('cart.checkout')}
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Cart Items */}
                    <div className="flex flex-col gap-4 mb-6 p-4">
                        {cart.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                <Lottie animationData={emptyBoxAnimation} />
                                {t('cart.empty')}
                            </div>
                        )}
                        {cart.map((item) => (
                            <CartItem
                                key={item.product._id}
                                item={item}
                                updateQuantity={updateQuantity}
                                removeFromCart={removeFromCart}
                            />
                        ))}
                    </div>
                    {/* Error Message */}
                    {checkoutError && cart.length > 0 && (
                        <div className="text-center text-red-500 mb-2 text-sm px-4">{checkoutError}</div>
                    )}
                </div>
            </div>
            {/* Bottom Navigation */}
            <TabBar current="My Cart" />
        </div>
    );
};

export default MyCartScreen;
