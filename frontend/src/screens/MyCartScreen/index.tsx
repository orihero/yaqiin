import React from "react";
import { Icon } from "@iconify/react";
import { useCartStore } from "../../store/cartStore";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import TabBar from "../../components/TabBar";
import { useSwipeable } from "react-swipeable";
import type { CartItem as CartItemType } from "../../store/cartStore";

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
    return (
        <div className="relative">
            <div
                {...swipeHandlers}
                className={`flex items-center bg-[#F6F6F6] pl-4 pr-2 rounded-2xl transition-transform duration-300 ${
                    showDelete ? "translate-x-[-80px]" : ""
                }`}
                style={{ position: "relative", zIndex: 1 }}
            >
                <img
                    src={
                        item.product.images?.[0] ||
                        "https://via.placeholder.com/80x80?text=No+Image"
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
                            "https://via.placeholder.com/80x80?text=No+Image";
                    }}
                />
                <div className="flex-1 flex flex-col justify-between">
                    <div className="font-semibold text-base text-[#232c43]">
                        {item.product.name?.uz ||
                            item.product.name?.ru ||
                            "Product"}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                        {item.product.nutritionalInfo?.calories
                            ? `${item.product.nutritionalInfo.calories} cal`
                            : ""}
                    </div>
                    <div className="text-[#ff7a00] font-bold text-base">
                        $
                        {item.product.price?.toFixed
                            ? item.product.price.toFixed(2)
                            : item.product.price}
                        <span className="text-xs font-normal text-gray-400">
                            /kg
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
                    {/* <input
                        type="text"
                        value={item.quantity}
                        className="min-w-4 max-w-20 outline-none text-right"
                        onChange={(e) =>
                            updateQuantity((igd ) => Number(e.target.value || 1))
                        }
                    /> */}
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
                className={`absolute top-0 right-0 h-full flex items-center pr-2 transition-all duration-300 ${
                    showDelete
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
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart } =
        useCartStore();
    const navigate = useNavigate();

    const getTotal = () =>
        cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handleHeaderSearchClick = () => {
        navigate("/search");
    };
    const handleTabChange = (tab: string) => {
        if (tab === "Home") navigate("/");
        else if (tab === "Search") navigate("/search");
        else if (tab === "My Cart") navigate("/cart");
        else if (tab === "Profile") navigate("/profile");
    };

    return (
        <div className="min-h-screen bg-[#fff] flex flex-col relative">
            {/* <Header
        title="My Cart"
        rightIcon="mdi:magnify"
        onRightIconClick={handleHeaderSearchClick}
      /> */}
            <div
                className="max-w-md mx-auto w-full px-0 pt-6 pb-0  flex flex-col z-45"
                style={{ minHeight: "calc(100vh - 75px)" }}
            >
                <div className="bg-white rounded-4xl flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6 px-4">
                        <h1 className="text-3xl font-bold text-[#232c43] leading-tight">
                            Daily
                            <br />
                            Grocery Food
                        </h1>
                        <div
                            className="bg-white rounded-full p-3 shadow flex items-center justify-center"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                        >
                            <Icon
                                icon="mdi:magnify"
                                className="text-2xl text-[#232c43]"
                            />
                        </div>
                    </div>
                    {/* Cart Items */}
                    <div className="flex flex-col gap-4 mb-6 p-4">
                        {cart.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                Your cart is empty.
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
                    {/* Total and Checkout */}
                    <div className="mt-auto pt-4 bg-[#F6F6F6] p-4 rounded-4xl">
                        <div className="flex justify-center items-center mb-4 gap-2">
                            <span className="text-base text-gray-500">
                                Total amount
                            </span>
                            <span className="text-base text-gray-500">
                                ${getTotal().toFixed(2)}
                            </span>
                        </div>
                        <button
                            className="w-full bg-[#232c43] text-white rounded-full py-3 text-lg  shadow-md disabled:opacity-60"
                            disabled={cart.length === 0}
                            onClick={() => {
                                /* handle checkout */
                            }}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
            {/* Bottom Navigation (reuse from HomeScreen if needed) */}
            <TabBar current="My Cart" onTabChange={handleTabChange} />
        </div>
    );
};

export default MyCartScreen;
