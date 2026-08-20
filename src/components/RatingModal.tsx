'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, X, CheckCircle2, Camera, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Puzzle } from '@/lib/scrapers/types';
import { compressImageToWebP } from '@/lib/utils/imageCompressor';

interface RatingModalProps {
  puzzle: Puzzle;
  initialRating?: number;
  initialNotes?: string;
  initialPhotoUrl?: string;
  onSave: (rating: number, notes?: string, userPhotoUrl?: string) => Promise<void>;
  onClose: () => void;
}

export function RatingModal({
  puzzle,
  initialRating = 5,
  initialNotes = '',
  initialPhotoUrl = '',
  onSave,
  onClose,
}: RatingModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [notes, setNotes] = useState(initialNotes);
  const [userPhotoUrl, setUserPhotoUrl] = useState(initialPhotoUrl);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressedWebP = await compressImageToWebP(file);
      setUserPhotoUrl(compressedWebP);
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setUserPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(rating, notes, userPhotoUrl);
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
        className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#d2e6db] p-5 sm:p-6 overflow-hidden transform transition-all duration-300 animate-slideUp max-h-[90vh] overflow-y-auto"
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0f291e] uppercase tracking-wider">
              Lisää Kuva Kootusta Palapelistä (Valinnainen)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {userPhotoUrl ? (
              /* Photo Preview Thumbnail & Actions */
              <div className="relative rounded-2xl overflow-hidden border border-[#d2e6db] bg-[#f4f8f5] group">
                <img
                  src={userPhotoUrl}
                  alt="Oma kuva kootusta palapelistä"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-white text-[#0f291e] rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 text-[#047857]" />
                    <span>Vaihda kuva</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Poista</span>
                  </button>
                </div>
                {/* Mobile permanent touch action bar below preview */}
                <div className="sm:hidden flex items-center justify-between p-2.5 bg-white border-t border-[#d2e6db]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#047857] inline-flex items-center gap-1.5 min-h-[44px] px-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Vaihda kuva</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-bold text-rose-600 inline-flex items-center gap-1.5 min-h-[44px] px-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Poista</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty Upload Trigger Button */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                className="w-full h-32 rounded-2xl border-2 border-dashed border-[#a7f3d0] bg-[#f4f8f5] hover:bg-[#e2f0e8] transition-colors flex flex-col items-center justify-center gap-2 p-4 text-center group cursor-pointer"
              >
                {compressing ? (
                  <div className="flex flex-col items-center gap-1.5 text-[#047857]">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-bold">Käsitellään kuvaa...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white text-[#047857] flex items-center justify-center border border-[#d2e6db] shadow-xs group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0f291e] block">
                        Ota kuva tai valitse galleriasta
                      </span>
                      <span className="text-[11px] font-semibold text-[#4a6b5d]">
                        Korvaa valmiin palapelin tuotekuvan
                      </span>
                    </div>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 2. Star Rating Selection */}
          <div className="text-center pt-2 border-t border-[#f0f7f3]">
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

          {/* 3. Notes Input */}
          <div className="pt-2 border-t border-[#f0f7f3]">
            <label className="block text-xs font-bold text-[#0f291e] mb-1">
              Omat Muistiinpanot (Valinnainen)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Esim. Kiva koota perheen kanssa, laadukkaat palat..."
              className="w-full bg-[#f4f8f5] border border-[#d2e6db] rounded-xl p-3 text-base sm:text-xs font-medium text-[#0f291e] placeholder:text-[#4a6b5d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || compressing}
            className="w-full bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[48px]"
          >
            {loading ? 'Tallennetaan...' : 'Tallenna Kirjastoon'}
          </button>
        </form>
      </div>
    </div>
  );
}
