'use client';

import { SUPPORTED_STORES } from '@/lib/scrapers';
import { Store } from 'lucide-react';

interface StoreFilterProps {
  selectedStore: string;
  onSelectStore: (storeId: string) => void;
}

export function StoreFilter({ selectedStore, onSelectStore }: StoreFilterProps) {
  const enabledStores = SUPPORTED_STORES.filter((store) => store.enabled);
  const upcomingCount = SUPPORTED_STORES.filter((store) => !store.enabled).length;

  return (
    <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-[11px] font-bold text-[#4a6b5d] uppercase tracking-wider flex items-center gap-1.5 mr-1 shrink-0 select-none">
        <Store className="w-3.5 h-3.5 text-[#047857]" />
        Kauppa:
      </span>
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
      {upcomingCount > 0 && (
        <span className="text-xs text-[#4a6b5d]/80 font-medium shrink-0 select-none ml-1">
          {upcomingCount} muuta kauppaa tulossa Phase 2:ssa
        </span>
      )}
    </div>
  );
}
