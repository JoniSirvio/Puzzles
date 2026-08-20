'use client';

import { useEffect, useRef } from 'react';
import { Heart, Package, CheckCircle2, Trash2, X, Plus, ExternalLink } from 'lucide-react';
import { Puzzle } from '@/lib/scrapers/types';
import { LibraryStatus } from '@/lib/firebase/types';

interface CollectionActionModalProps {
  puzzle: Puzzle;
  currentStatus?: LibraryStatus;
  onSelectWishlist: () => void;
  onSelectOwnedNotDone: () => void;
  onSelectOwnedDone: () => void;
  onRemoveFromLibrary: () => void;
  onClose: () => void;
}

export function CollectionActionModal({
  puzzle,
  currentStatus,
  onSelectWishlist,
  onSelectOwnedNotDone,
  onSelectOwnedDone,
  onRemoveFromLibrary,
  onClose,
}: CollectionActionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scroll on mobile bottom sheet
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formattedPrice = new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: puzzle.currency || 'EUR',
  }).format(puzzle.price);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-modal-title"
        className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#d2e6db] overflow-hidden transform transition-all duration-300 animate-slideUp"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.25 bg-[#d2e6db] rounded-full" />
        </div>

        {/* Header Preview Section */}
        <div className="p-4 sm:p-5 bg-[#f4f8f5] border-b border-[#e2ede7] flex items-center gap-3">
          {/* Puzzle Image Thumbnail */}
          <div className="w-16 h-16 rounded-xl bg-white p-1 border border-[#d2e6db] shrink-0 flex items-center justify-center overflow-hidden">
            {puzzle.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={puzzle.imageUrl}
                alt={puzzle.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <Package className="w-6 h-6 text-[#658577]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#047857] uppercase tracking-wider mb-0.5 truncate">
              <span>{puzzle.sourceStore.name}</span>
              {puzzle.pieceCount && <span>• {puzzle.pieceCount} palaa</span>}
            </div>
            <h3
              id="collection-modal-title"
              className="text-sm font-bold text-[#0f291e] line-clamp-1 leading-snug"
            >
              {puzzle.title}
            </h3>
            <span className="text-xs font-black text-[#0f291e] block mt-0.5">
              {formattedPrice}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Sulje valikko"
            className="p-2 rounded-xl text-[#658577] hover:bg-[#e2ede7] hover:text-[#0f291e] transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Menu Options List */}
        <div className="p-3 sm:p-4 space-y-2">
          <span className="text-[11px] font-bold text-[#4a6b5d] uppercase tracking-wider block px-2 mb-1">
            Siirrä tai lisaa kokoelmaan:
          </span>

          {/* 1. Wishlist Action Button */}
          <button
            onClick={() => {
              onSelectWishlist();
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all min-h-[52px] border ${
              currentStatus === 'WISHLIST'
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                : 'bg-[#f0f7f3]/60 text-[#0f291e] hover:bg-[#e2f0e8] border-[#d2e6db]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentStatus === 'WISHLIST'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-white text-rose-500 border border-rose-100 shadow-2xs'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    currentStatus === 'WISHLIST' ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Toivelistalle</span>
                <span className="text-[11px] text-[#658577] font-medium block">
                  Tallenna haluamiesi palapelien listalle
                </span>
              </div>
            </div>
            {currentStatus === 'WISHLIST' && (
              <span className="text-[11px] font-extrabold bg-rose-200/80 text-rose-800 px-2.5 py-1 rounded-lg">
                Aktiivinen
              </span>
            )}
          </button>

          {/* 2. Owned Not Done Action Button */}
          <button
            onClick={() => {
              onSelectOwnedNotDone();
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all min-h-[52px] border ${
              currentStatus === 'OWNED_NOT_DONE'
                ? 'bg-[#e6f4ed] text-[#047857] border-[#a7f3d0] shadow-xs'
                : 'bg-[#f0f7f3]/60 text-[#0f291e] hover:bg-[#e2f0e8] border-[#d2e6db]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentStatus === 'OWNED_NOT_DONE'
                    ? 'bg-[#a7f3d0] text-[#047857]'
                    : 'bg-white text-[#047857] border border-emerald-100 shadow-2xs'
                }`}
              >
                <Package className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Omistetuksi (Tekemättä)</span>
                <span className="text-[11px] text-[#658577] font-medium block">
                  Omistan palapelin, mutta en ole vielä koonnut
                </span>
              </div>
            </div>
            {currentStatus === 'OWNED_NOT_DONE' && (
              <span className="text-[11px] font-extrabold bg-[#a7f3d0] text-[#047857] px-2.5 py-1 rounded-lg">
                Aktiivinen
              </span>
            )}
          </button>

          {/* 3. Owned Done Action Button */}
          <button
            onClick={() => {
              onSelectOwnedDone();
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all min-h-[52px] border ${
              currentStatus === 'OWNED_DONE'
                ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                : 'bg-[#f0f7f3]/60 text-[#0f291e] hover:bg-[#e2f0e8] border-[#d2e6db]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentStatus === 'OWNED_DONE'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-[#064e3b] border border-emerald-100 shadow-2xs'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Merkitse kootuksi</span>
                <span
                  className={`text-[11px] font-medium block ${
                    currentStatus === 'OWNED_DONE' ? 'text-emerald-200' : 'text-[#658577]'
                  }`}
                >
                  Valmis palapeli + anna tähtiarvosana (1–5)
                </span>
              </div>
            </div>
            {currentStatus === 'OWNED_DONE' && (
              <span className="text-[11px] font-extrabold bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded-lg">
                Koottu
              </span>
            )}
          </button>

          {/* 4. Remove from Library Option (Visible if item is in library) */}
          {currentStatus && (
            <div className="pt-2 border-t border-[#f0f7f3]">
              <button
                onClick={() => {
                  onRemoveFromLibrary();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-50 transition-all min-h-[52px] border border-rose-200/80"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <span>Poista omasta kokoelmasta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
