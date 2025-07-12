import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetails } from "./hooks/useProductDetails";
import { useCartStore } from "../../store/cartStore";
import { Icon } from "@iconify/react";

const ProductDetails: React.FC = () => {
    const { id: productId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useProductDetails(productId || "");
    const addToCart = useCartStore((state) => state.addToCart);

    if (isLoading) return <div className="text-center py-12">Loading...</div>;
    if (isError || !product)
        return (
            <div className="text-center text-red-400 py-12">
                {error instanceof Error ? error.message : "Product not found."}
            </div>
        );

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Product Image */}
            <div
                className="bg-[#fff] z-45 rounded-[54px]"
                style={{
                    minHeight: "calc(100vh - 80px)",
                    maxHeight: "calc(100vh - 80px)",
                }}
            >
                <div className="w-full bg-[#F6F6F6] h-70 rounded-b-[60px] flex flex-col items-center overflow-hidden">
                    <button
                        className="absolute top-6 left-4 bg-white rounded-full p-2"
                        onClick={() => navigate(-1)}
                    >
                        <Icon
                            icon="mdi:arrow-left"
                            className="text-2xl text-[#232c43]"
                        />
                    </button>
                    <img
                        src={
                            product.images?.[0] ||
                            "https://via.placeholder.com/200x200?text=No+Image"
                        }
                        alt={product.name.uz}
                        className="w-full h-70 object-cover"
                    />
                </div>
                {/* Product Info */}
                <div className="max-w-md mx-auto w-full  flex-1 flex flex-col  z-10">
                    <div className="bg-white px-4 pt-6 pb-8 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-bold text-[#232c43]">
                                {product.name.uz}
                            </h1>
                            <div className="flex items-center gap-2">
                                <button
                                    className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-xl font-bold text-[#232c43]"
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                >
                                    –
                                </button>
                                <span className="font-semibold text-lg text-[#232c43]">
                                    {/* {quantity}{" "} */}
                                    <input
                                        type="text"
                                        value={quantity}
                                        className="min-w-4 max-w-20 outline-none text-right"
                                        onChange={(e) =>
                                            setQuantity(() =>
                                                Number(e.target.value || 1)
                                            )
                                        }
                                    />
                                    <span className="text-base font-normal">
                                        {" "}
                                        {product.unit}
                                    </span>
                                </span>
                                <button
                                    className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-xl font-bold text-[#232c43]"
                                    onClick={() => setQuantity((q) => q + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400 mb-4">
                            {product.isActive
                                ? "Available in stock"
                                : "Out of stock"}
                        </div>
                        <div className="mb-4">
                            <h2 className="font-bold text-[#232c43] mb-1">
                                Product Description
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {product.description?.uz || ""}
                            </p>
                        </div>
                        <div className="mb-4">
                            <h2 className="font-bold text-[#232c43] mb-2">
                                Product Reviews
                            </h2>
                            {/* Placeholder for reviews */}
                            <div className="text-gray-400 text-sm">
                                No reviews yet.
                            </div>
                        </div>
                        <div>
                            <h2 className="font-bold text-[#232c43] mb-2">
                                Similar Products
                            </h2>
                            {/* Placeholder for similar products */}
                            <div className="text-gray-400 text-sm">
                                No similar products yet.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#232c43] h-32  py-5 px-6 flex justify-between items-end z-10 mx-auto">
                <span className="text-white text-2xl font-bold mb-1">
                    {product.price}{" "}
                    <span className="text-base font-normal">
                        /{product.unit}
                    </span>
                </span>
                <button
                    className="bg-white text-[#232c43] font-bold py-3 px-8 rounded-full text-base shadow"
                    onClick={() => addToCart(product, quantity)}
                >
                    Add to cart
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
