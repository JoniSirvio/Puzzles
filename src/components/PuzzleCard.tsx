'use client';

import { useState } from 'react';
import { ExternalLink, Heart, Package, CheckCircle2, Star, Tag, Plus } from 'lucide-react';
import { Puzzle } from '@/lib/scrapers/types';
import { useLibrary } from '@/context/LibraryContext';
import { RatingModal } from './RatingModal';
import { CollectionActionModal } from './CollectionActionModal';

interface PuzzleCardProps {
  puzzle: Puzzle;
}

export function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  const { getItemStatus, toggleWishlist, toggleOwnedNotDone, toggleOwnedDone, removeItem } = useLibrary();
  const libraryItem = getItemStatus(puzzle.id);
  const status = libraryItem?.status;

  const formattedPrice = new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: puzzle.currency || 'EUR',
  }).format(puzzle.price);

  const handleRatingSave = async (rating: number, notes?: string) => {
    await toggleOwnedDone(puzzle, rating, notes);
  };

  return (
    <>
      <article className="group relative flex flex-col bg-white rounded-2xl border border-[#e2ede7] overflow-hidden hover:border-[#a7f3d0] hover:shadow-xl hover:shadow-[#064e3b]/8 transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square w-full bg-[#f4f8f5] overflow-hidden flex items-center justify-center p-5">
          {puzzle.imageUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-[#e6f4ed] animate-pulse" />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={puzzle.imageUrl}
                alt={puzzle.title}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain transition-all duration-500 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } group-hover:scale-105`}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-[#93b0a2] space-y-1">
              <Package className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[10px] font-bold">Ei kuvaa</span>
            </div>
          )}

          {/* Top-Left: Store Badge */}
          <div className="absolute top-3 left-3 max-w-[55%] pointer-events-none z-10">
            <span className="inline-block bg-[#0f291e]/90 backdrop-blur-md text-emerald-100 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs border border-emerald-800/40 truncate max-w-full">
              {puzzle.sourceStore.name}
            </span>
          </div>

          {/* Top-Right: Mobile-First Collection Trigger Button */}
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={() => setShowActionModal(true)}
              title="Lisää tai muokkaa kokoelmassa"
              aria-label="Avaa kokoelmahaldinta"
              className={`p-2 rounded-2xl shadow-md backdrop-blur-md transition-all active:scale-90 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                status === 'WISHLIST'
                  ? 'bg-rose-50/95 text-rose-600 border border-rose-200'
                  : status === 'OWNED_NOT_DONE'
                  ? 'bg-[#e6f4ed]/95 text-[#047857] border border-[#a7f3d0]'
                  : status === 'OWNED_DONE'
                  ? 'bg-[#064e3b] text-white shadow-xs border border-emerald-800'
                  : 'bg-white/95 text-[#047857] hover:bg-[#f0f7f3] border border-[#d2e6db]'
              }`}
            >
              {status === 'WISHLIST' && (
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              )}
              {status === 'OWNED_NOT_DONE' && (
                <Package className="w-4 h-4 text-[#047857]" />
              )}
              {status === 'OWNED_DONE' && (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
              {!status && <Plus className="w-4.5 h-4.5 text-[#047857] stroke-[2.5]" />}
            </button>
          </div>

          {/* Bottom-Left: Piece Count Badge */}
          {puzzle.pieceCount && (
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
              <span className="bg-[#064e3b] text-emerald-50 text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs border border-emerald-700/50">
                {puzzle.pieceCount} palaa
              </span>
            </div>
          )}

          {/* Bottom-Right: In-Stock Indicator */}
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-[#064e3b] text-[10px] font-bold px-2 py-1 rounded-xl border border-[#d2e6db] shadow-2xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  puzzle.inStock !== false ? 'bg-[#059669]' : 'bg-rose-500'
                }`}
              />
              {puzzle.inStock !== false ? 'Varastossa' : 'Tarkista'}
            </span>
          </div>
        </div>

        {/* Card Details */}
        <div className="flex-1 flex flex-col p-5">
          {puzzle.brand && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#047857] uppercase mb-1.5">
              <Tag className="w-3 h-3 text-[#059669]" />
              <span>{puzzle.brand}</span>
            </div>
          )}

          <h3 className="font-bold text-[#0f291e] text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#047857] transition-colors">
            <a
              href={puzzle.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus:outline-none focus-visible:underline"
            >
              {puzzle.title}
            </a>
          </h3>

          {/* Star rating display for completed puzzles if rating exists */}
          {libraryItem?.rating && (
            <div className="mb-2 inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80 self-start">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Arvosana {libraryItem.rating}/5</span>
            </div>
          )}

          <div className="mt-auto pt-3.5 border-t border-[#f0f7f3] flex items-end justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-[#658577] block mb-0.5">Hinta</span>
              <span className="text-lg font-black text-[#0f291e] tracking-tight">
                {formattedPrice}
              </span>
            </div>

            <a
              href={puzzle.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047857] focus-visible:ring-offset-2 shrink-0 min-h-[44px]"
            >
              <span>Katso kaupassa</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.25]" />
            </a>
          </div>
        </div>
      </article>

      {/* Collection Action Modal / Mobile Bottom Sheet */}
      {showActionModal && (
        <CollectionActionModal
          puzzle={puzzle}
          currentStatus={status}
          onSelectWishlist={() => toggleWishlist(puzzle)}
          onSelectOwnedNotDone={() => toggleOwnedNotDone(puzzle)}
          onSelectOwnedDone={() => {
            setShowActionModal(false);
            setShowRatingModal(true);
          }}
          onRemoveFromLibrary={() => removeItem(puzzle.id)}
          onClose={() => setShowActionModal(false)}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          puzzle={puzzle}
          initialRating={libraryItem?.rating || 5}
          initialNotes={libraryItem?.notes || ''}
          onSave={handleRatingSave}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </>
  );
}
