'use client';

import { SUPPORTED_STORES } from '@/lib/scrapers';

interface StoreFilterProps {
  selectedStore: string;
  onSelectStore: (storeId: string) => void;
}

export function StoreFilter({ selectedStore, onSelectStore }: StoreFilterProps) {
  const enabledStores = SUPPORTED_STORES.filter((store) => store.enabled);

  return (
    <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* Kaikki kaupat Option */}
      <button
        onClick={() => onSelectStore('all')}
        aria-pressed={selectedStore === 'all'}
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 min-h-[44px] rounded-xl transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047857] ${
          selectedStore === 'all'
            ? 'bg-[#064e3b] text-white shadow-sm shadow-[#064e3b]/20 border border-emerald-700/50'
            : 'bg-[#f0f7f3] text-[#0f291e] hover:bg-[#e2f0e8] active:bg-[#d4e8dd] border border-[#d2e6db]'
        }`}
      >
        <span>Kaikki kaupat</span>
      </button>

      {enabledStores.map((store) => {
        const isSelected = selectedStore === store.id;
        return (
          <button
            key={store.id}
            onClick={() => onSelectStore(store.id)}
            aria-pressed={isSelected}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 min-h-[44px] rounded-xl transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047857] ${
              isSelected
                ? 'bg-[#064e3b] text-white shadow-sm shadow-[#064e3b]/20 border border-emerald-700/50'
                : 'bg-[#f0f7f3] text-[#0f291e] hover:bg-[#e2f0e8] active:bg-[#d4e8dd] border border-[#d2e6db]'
            }`}
          >
            <span>{store.name}</span>
          </button>
        );
      })}
    </div>
  );
}
