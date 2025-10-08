import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Product } from "@yaqiin/shared/types/product";
import { useTranslation } from 'react-i18next';
import { formatProductPrice } from "@yaqiin/shared/utils/formatProductPrice";
import BottomSheet from "../screens/HomeScreen/components/BottomSheet";

interface ProductQuantitySheetProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onConfirm: (product: Product, quantity: number) => void;
    initialQuantity?: number;
}

const ProductQuantitySheet: React.FC<ProductQuantitySheetProps> = ({
    open,
    product,
    onClose,
    onConfirm,
    initialQuantity = 1,
}) => {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(initialQuantity);

    // Reset quantity when product changes or modal opens
    useEffect(() => {
        if (open) {
            setQuantity(initialQuantity);
        }
    }, [open, initialQuantity, product]);

    const handleConfirm = () => {
        if (product) {
            onConfirm(product, quantity);
        }
    };

    const handleQuantityChange = (value: string) => {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 1) {
            setQuantity(numValue);
        } else if (value === '') {
            setQuantity(1);
        }
    };

    return (
        <BottomSheet open={open} onClose={onClose}>
            {product && (
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-xl mb-2 bg-white flex items-center justify-center overflow-hidden">
                        <img
                            src={
                                product.images?.[0] ||
                                "https://via.placeholder.com/128x128?text=No+Image"
                            }
                            alt={
                                product.name?.uz ||
                                product.name?.ru ||
                                t('productCard.product')
                            }
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="font-semibold text-lg text-[#232c43] mb-1">
                        {product.name?.uz ||
                            product.name?.ru ||
                            "Product"}
                    </div>
                    <div className="text-[#ff7a00] font-bold text-base mb-2">
                        {formatProductPrice(product).price}
                        <span className="text-xs font-normal text-gray-400">
                            /{formatProductPrice(product).unit}
                        </span>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex flex-row items-center gap-4 my-4">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#232c43] text-white text-xl font-bold"
                            onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                            }
                        >
                            <Icon icon="mdi:minus" />
                        </button>
                        <input
                            type="text"
                            value={quantity}
                            className="min-w-4 max-w-20 outline-none text-right text-[#333] text-2xl font-bold"
                            onChange={(e) => handleQuantityChange(e.target.value)}
                        />
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#232c43] text-white text-xl font-bold"
                            onClick={() => setQuantity((q) => q + 1)}
                        >
                            <Icon icon="mdi:plus" />
                        </button>
                    </div>
                    <button
                        className="w-full bg-[#ff7a00] text-white rounded-full py-3 text-lg font-bold mt-2"
                        onClick={handleConfirm}
                    >
                        {t('productCard.addToCart')}
                    </button>
                </div>
            )}
        </BottomSheet>
    );
};

export default ProductQuantitySheet;
