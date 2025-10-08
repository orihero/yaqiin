import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

type BottomSheetProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const BottomSheet: React.FC<BottomSheetProps> = ({
    open,
    onClose,
    children,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
            setIsClosing(false);
        } else if (isVisible) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
            }, 250); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [open, isVisible]);

    const handleClose = () => {
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-opacity-30 transition-all duration-250 ${
                    isClosing ? "opacity-0 backdrop-blur-none" : "opacity-100 backdrop-blur-lg"
                }`}
                onClick={handleClose}
            />
            {/* Sheet */}
            <div className={`relative w-full max-w-md bg-white rounded-t-3xl shadow-lg p-6 ${
                isClosing ? "animate-slideDown" : "animate-slideUp"
            }`}>
                <button
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-3xl text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <Icon icon="mdi:close" className="text-2xl" />
                </button>
                {children}
            </div>
            <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        .animate-slideUp {
          animation: slideUp 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-slideDown {
          animation: slideDown 0.25s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
        </div>
    );
};

export default BottomSheet;
