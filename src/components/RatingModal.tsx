'use client';

import { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl border border-[#e2ede7] shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Sulje"
          className="absolute top-4 right-4 p-2 rounded-xl text-[#4a6b5d] hover:bg-[#f0f7f3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#e6f4ed] text-[#047857] flex items-center justify-center mx-auto border border-[#a7f3d0]">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-xl font-black text-[#0f291e]">Palapeli Koottu!</h2>
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
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 stroke-[1.5]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-[#0f291e] mb-1">
              Omat Muistiinpanot (Valinnainen)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Esim. Kiva koota perheen kanssa, laadukkaat palat..."
              className="w-full bg-[#f4f8f5] border border-[#d2e6db] rounded-xl p-3 text-xs font-medium text-[#0f291e] placeholder:text-[#658577] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 focus:outline-none focus:ring-2 focus:ring-[#047857]"
          >
            Tallenna Kirjastoon
          </button>
        </form>
      </div>
    </div>
  );
}
