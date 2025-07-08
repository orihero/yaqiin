import React from 'react';
import type { Category } from '@yaqiin/shared/types/category';

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  onApply: () => void;
}

const recentSearches = [
  'Fresh fruit',
  'Fresh vegetable',
  'Fast-food',
  'Cold drinks',
];

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  open,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  onApply,
}) => {
  const [selectedRecent, setSelectedRecent] = React.useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-30">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 shadow-lg animate-slide-up relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold text-[#232c43]">Filter</span>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <svg width="24" height="24" fill="none" stroke="#232c43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        {/* Price Range */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-[#232c43] mb-2">Price Range</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">${priceRange[0]}</span>
            <input
              type="range"
              min={10}
              max={50}
              value={priceRange[0]}
              onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="flex-1 accent-[#ff7a00]"
            />
            <input
              type="range"
              min={10}
              max={50}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="flex-1 accent-[#ff7a00]"
            />
            <span className="text-xs text-gray-400">${priceRange[1]}</span>
          </div>
          {/* Histogram placeholder */}
          <div className="h-10 flex items-end gap-1 mb-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1 bg-gray-200 rounded" style={{ height: `${10 + Math.random() * 30}px` }} />
            ))}
          </div>
        </div>
        {/* Categories */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-[#232c43] mb-2">Categories</div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat._id}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedCategory === cat._id ? 'bg-[#232c43] text-white' : 'bg-gray-100 text-[#232c43]'}`}
                onClick={() => setSelectedCategory(cat._id)}
              >
                {cat.name.uz || cat.name.ru}
              </button>
            ))}
          </div>
        </div>
        {/* Recently Search */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-[#232c43] mb-2">Recently Search</div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(rs => (
              <button
                key={rs}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedRecent === rs ? 'bg-[#232c43] text-white' : 'bg-gray-100 text-[#232c43]'}`}
                onClick={() => setSelectedRecent(rs)}
              >
                {rs}
              </button>
            ))}
          </div>
        </div>
        {/* Apply Now Button */}
        <button
          className="w-full bg-[#232c43] text-white rounded-full py-4 text-lg font-bold shadow-md"
          onClick={onApply}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default FilterBottomSheet; 