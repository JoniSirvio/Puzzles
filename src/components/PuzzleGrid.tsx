'use client';

import { Puzzle } from '@/lib/scrapers/types';
import { PuzzleCard } from './PuzzleCard';
import { AlertCircle, RefreshCw, SearchX } from 'lucide-react';

interface PuzzleGridProps {
  puzzles: Puzzle[];
  loading: boolean;
  error?: string;
  onRetry?: () => void;
  onSearchSuggestion?: (query: string) => void;
}

export function PuzzleGrid({ puzzles, loading, error, onRetry, onSearchSuggestion }: PuzzleGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-pulse flex flex-col h-[390px]"
          >
            <div className="bg-slate-200/80 aspect-square w-full" />
            <div className="p-5 flex-1 flex flex-col space-y-3">
              <div className="h-3 bg-slate-200 rounded-md w-1/3" />
              <div className="h-4 bg-slate-200 rounded-md w-5/6" />
              <div className="h-4 bg-slate-200 rounded-md w-2/3" />
              <div className="mt-auto pt-3 flex justify-between items-end">
                <div className="space-y-1 w-1/3">
                  <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                  <div className="h-5 bg-slate-200 rounded w-full" />
                </div>
                <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-6 h-6 stroke-[2]" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Tuotteiden lataus epäonnistui</h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yritä uudelleen</span>
          </button>
        )}
      </div>
    );
  }

  if (puzzles.length === 0) {
    const suggestions = ['Ravensburger', 'Muumi', 'Clementoni', 'Cobble Hill', 'Educa'];

    return (
      <div className="bg-white border border-[#d2e6db] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-14 h-14 bg-[#f4f8f5] text-[#047857] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#d2e6db]">
          <SearchX className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-[#0f291e] mb-1">Palapelejä ei löytynyt</h3>
        <p className="text-xs text-[#4a6b5d] mb-6 leading-relaxed">
          Hakuehdoillasi ei löytynyt yhtään palapeliä. Kokeile jotain suosittua hakusanaa:
        </p>

        {onSearchSuggestion && (
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => onSearchSuggestion(sug)}
                className="text-xs font-bold text-[#047857] bg-[#e6f4ed] hover:bg-[#a7f3d0] px-3 py-1.5 rounded-xl border border-[#a7f3d0] transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {puzzles.map((puzzle) => (
        <PuzzleCard key={puzzle.id} puzzle={puzzle} />
      ))}
    </div>
  );
}
