'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Check, Store, Layers } from 'lucide-react';
import { SUPPORTED_STORES } from '@/lib/scrapers';

const PIECE_COUNT_OPTIONS = [
  { label: 'Kaikki koot', value: '' },
  { label: '< 500 palaa', value: 'under500' },
  { label: '500–750 palaa', value: '500' },
  { label: '1000 palaa', value: '1000' },
  { label: '1500+ palaa', value: '1500+' },
];

interface FilterModalProps {
  selectedStore: string;
  pieceCount: string;
  totalResults: number;
  onApply: (store: string, pieceCount: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export function FilterModal({
  selectedStore,
  pieceCount,
  totalResults,
  onApply,
  onReset,
  onClose,
}: FilterModalProps) {
  const [tempStore, setTempStore] = useState(selectedStore);
  const [tempPieceCount, setTempPieceCount] = useState(pieceCount);

  const enabledStores = SUPPORTED_STORES.filter((s) => s.enabled);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock background scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleApply = () => {
    onApply(tempStore, tempPieceCount);
    onClose();
  };

  const handleReset = () => {
    setTempStore('all');
    setTempPieceCount('');
    onReset();
  };

  const isFiltered = tempStore !== 'all' || tempPieceCount !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Bottom Sheet Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#d2e6db] overflow-hidden flex flex-col max-h-[85vh] transform transition-all duration-300 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.25 bg-[#d2e6db] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f8f5] border-b border-[#e2ede7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#e6f4ed] text-[#047857] flex items-center justify-center border border-[#a7f3d0]">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 id="filter-modal-title" className="text-base font-black text-[#0f291e]">
                Palapelisuodattimet
              </h2>
              <span className="text-xs text-[#4a6b5d] font-semibold">
                Rajaa kauppoja ja palapelin kokoa
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Sulje suodattimet"
            className="p-2 rounded-xl text-[#4a6b5d] hover:bg-[#e2ede7] hover:text-[#0f291e] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* 1. Kauppa Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#047857] uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>Verkkokauppa</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Kaikki kaupat option */}
              <button
                type="button"
                onClick={() => setTempStore('all')}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all min-h-[48px] border ${
                  tempStore === 'all'
                    ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                    : 'bg-[#f4f8f5] text-[#0f291e] hover:bg-[#e2f0e8] border-[#d2e6db]'
                }`}
              >
                <span>Kaikki kaupat</span>
                {tempStore === 'all' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Enabled Scraper Stores */}
              {enabledStores.map((store) => {
                const isSelected = tempStore === store.id;
                return (
                  <button
                    type="button"
                    key={store.id}
                    onClick={() => setTempStore(store.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all min-h-[48px] border ${
                      isSelected
                        ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                        : 'bg-[#f4f8f5] text-[#0f291e] hover:bg-[#e2f0e8] border-[#d2e6db]'
                    }`}
                  >
                    <span>{store.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Piece Count Selection */}
          <div className="space-y-3 pt-4 border-t border-[#f0f7f3]">
            <label className="text-xs font-bold text-[#047857] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Palapelin koko</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {PIECE_COUNT_OPTIONS.map((opt) => {
                const isSelected = tempPieceCount === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setTempPieceCount(opt.value)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                        : 'bg-[#f4f8f5] text-[#0f291e] hover:bg-[#e2f0e8] border-[#d2e6db]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer Controls */}
        <div className="p-4 bg-[#f4f8f5] border-t border-[#e2ede7] flex items-center justify-between gap-3">
          {isFiltered ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-[#047857] hover:text-[#064e3b] hover:underline inline-flex items-center gap-1.5 min-h-[44px] px-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tyhjennä</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 min-h-[48px]"
          >
            <span>Näytä tulokset</span>
            {totalResults > 0 && (
              <span className="bg-emerald-800 text-emerald-200 text-[11px] font-black px-2 py-0.5 rounded-md">
                {totalResults}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
