import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

interface ImagePreviewModalProps {
  open: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  images,
  initialIndex = 0,
  onClose
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
          break;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, images.length, onClose]);

  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4 text-white">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          title={t('common.close', 'Close')}
        >
          <Icon icon="mdi:close" width={24} height={24} />
        </button>
      </div>

      {/* Main Image */}
      <div className="flex items-center justify-center h-full">
        <img
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
          }}
        />
      </div>

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            title={t('common.previous', 'Previous')}
          >
            <Icon icon="mdi:chevron-left" width={24} height={24} />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            title={t('common.next', 'Next')}
          >
            <Icon icon="mdi:chevron-right" width={24} height={24} />
          </button>

          {/* Thumbnail Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-12 h-12 rounded border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white opacity-100'
                    : 'border-white/50 opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://via.placeholder.com/48x48?text=Error';
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Keyboard Navigation Hint */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-4 text-white/60 text-xs">
          <div>← → {t('common.navigate', 'Navigate')}</div>
          <div>ESC {t('common.close', 'Close')}</div>
        </div>
      )}
    </div>
  );
};

export default ImagePreviewModal;
