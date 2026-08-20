'use client';

import { useState, useEffect } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { Puzzle } from '@/lib/scrapers/types';

interface RatingModalProps {
  puzzle: Puzzle;
  initialRating?: number;
  initialNotes?: string;
  onSave: (rating: number, notes?: string) => Promise<void>;
  onClose: () => void;
}

export function RatingModal({
  puzzle,
  initialRating = 5,
  initialNotes = '',
  onSave,
  onClose,
}: RatingModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(rating, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-modal-title"
        className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#d2e6db] p-5 sm:p-6 overflow-hidden transform transition-all duration-300 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden flex items-center justify-center pt-1 pb-3">
          <div className="w-12 h-1.25 bg-[#d2e6db] rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Sulje valikko"
          className="absolute top-4 right-4 p-2 rounded-xl text-[#4a6b5d] hover:bg-[#f0f7f3] hover:text-[#0f291e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#e6f4ed] text-[#047857] flex items-center justify-center mx-auto border border-[#a7f3d0]">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 id="rating-modal-title" className="text-lg sm:text-xl font-black text-[#0f291e]">
            Palapeli Koottu!
          </h2>
          <p className="text-xs text-[#4a6b5d] font-semibold leading-snug line-clamp-2 max-w-xs mx-auto">
            {puzzle.title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Selection */}
          <div className="text-center">
            <label className="block text-xs font-bold text-[#0f291e] uppercase tracking-wider mb-2">
              Anna Arvosana (1–5)
            </label>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  aria-label={`Anna ${star} tähteä`}
                  className="p-2 text-amber-400 hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 stroke-[1.5]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes Input - text-base for iOS Safari auto-zoom prevention */}
          <div>
            <label className="block text-xs font-bold text-[#0f291e] mb-1">
              Omat Muistiinpanot (Valinnainen)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Esim. Kiva koota perheen kanssa, laadukkaat palat..."
              className="w-full bg-[#f4f8f5] border border-[#d2e6db] rounded-xl p-3 text-base sm:text-xs font-medium text-[#0f291e] placeholder:text-[#4a6b5d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[48px]"
          >
            Tallenna Kirjastoon
          </button>
        </form>
      </div>
    </div>
  );
}
