'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { PuzzleGrid } from '@/components/PuzzleGrid';
import { Heart, Package, CheckCircle2, LogIn, Library, Star } from 'lucide-react';
import { LibraryStatus } from '@/lib/firebase/types';

export default function LibraryPage() {
  const { user, openAuthModal } = useAuth();
  const { libraryItems, stats } = useLibrary();
  const [filter, setFilter] = useState<'ALL' | LibraryStatus>('ALL');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white border border-[#d2e6db] rounded-3xl p-8 sm:p-12 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#064e3b] text-emerald-300 flex items-center justify-center mx-auto shadow-md shadow-[#064e3b]/15 border border-emerald-700/40">
            <Library className="w-8 h-8 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-black text-[#0f291e]">Omat Palapelit</h1>
          <p className="text-xs sm:text-sm text-[#4a6b5d] font-medium leading-relaxed max-w-md mx-auto">
            Kirjaudu sisään nähdäksesi oman palapelikokoelmasi, merkitäksesi kootut palapelit ja hallinnoidaksesi toivelistaasi.
          </p>
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-2 bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[44px]"
          >
            <LogIn className="w-4 h-4" />
            <span>Kirjaudu Sisään</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = libraryItems.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const puzzlesToDisplay = filteredItems.map((item) => item.puzzle);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <section className="bg-[#064e3b] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#064e3b]/10 border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-600/40 text-emerald-200 text-xs font-bold">
            <Library className="w-4 h-4 text-emerald-300" />
            <span>Oma Kokoelma</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Omat Palapelit
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
            Seuraa omistamiasi ja kokoamiasi palapelejä sekä tallenna toivelistasi suosikit.
          </p>

          {/* Stats Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-emerald-200 block uppercase tracking-wider">
                Yhteensä
              </span>
              <span className="text-xl font-black text-white">{stats.total}</span>
            </div>

            <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-emerald-200 block uppercase tracking-wider flex items-center justify-center gap-1">
                <Package className="w-3.5 h-3.5 text-emerald-300" />
                Tekemättä
              </span>
              <span className="text-xl font-black text-white">{stats.ownedNotDone}</span>
            </div>

            <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-emerald-200 block uppercase tracking-wider flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Kootut
              </span>
              <span className="text-xl font-black text-white">{stats.ownedDone}</span>
            </div>

            <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-emerald-200 block uppercase tracking-wider flex items-center justify-center gap-1">
                <Heart className="w-3.5 h-3.5 text-emerald-300" />
                Toivelista
              </span>
              <span className="text-xl font-black text-white">{stats.wishlist}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Control Filter Bar */}
      <section className="bg-white border border-[#d2e6db] rounded-2xl p-4 sm:p-5 shadow-sm shadow-[#064e3b]/5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              filter === 'ALL'
                ? 'bg-[#064e3b] text-white shadow-sm border border-emerald-800'
                : 'bg-[#f0f7f3] text-[#0f291e] hover:bg-[#e2f0e8] border border-[#d2e6db]'
            }`}
          >
            Kaikki ({stats.total})
          </button>

          <button
            onClick={() => setFilter('OWNED_NOT_DONE')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              filter === 'OWNED_NOT_DONE'
                ? 'bg-[#064e3b] text-white shadow-sm border border-emerald-800'
                : 'bg-[#f0f7f3] text-[#0f291e] hover:bg-[#e2f0e8] border border-[#d2e6db]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Tekemättä ({stats.ownedNotDone})</span>
          </button>

          <button
            onClick={() => setFilter('OWNED_DONE')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              filter === 'OWNED_DONE'
                ? 'bg-[#064e3b] text-white shadow-sm border border-emerald-800'
                : 'bg-[#f0f7f3] text-[#0f291e] hover:bg-[#e2f0e8] border border-[#d2e6db]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kootut ({stats.ownedDone})</span>
          </button>

          <button
            onClick={() => setFilter('WISHLIST')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              filter === 'WISHLIST'
                ? 'bg-rose-700 text-white shadow-sm border border-rose-800'
                : 'bg-rose-50/80 text-rose-900 hover:bg-rose-100/60 border border-rose-200/80'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Toivelista ({stats.wishlist})</span>
          </button>
        </div>
      </section>

      {/* Grid or Empty state */}
      {puzzlesToDisplay.length > 0 ? (
        <PuzzleGrid puzzles={puzzlesToDisplay} loading={false} />
      ) : (
        <div className="bg-white border border-[#d2e6db] rounded-2xl p-12 text-center max-w-md mx-auto my-8 shadow-sm space-y-3">
          <div className="w-14 h-14 bg-[#f4f8f5] text-[#4a6b5d] rounded-2xl flex items-center justify-center mx-auto border border-[#d2e6db]">
            <Library className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-[#0f291e]">Ei palapelejä tässä näkymässä</h3>
          <p className="text-xs text-[#658577] leading-relaxed">
            Voit lisätä palapelejä kokoelmaasi selaamalla valikoimaa ja painamalla palapelin kohdalla olevaa kuvaketta.
          </p>
        </div>
      )}
    </div>
  );
}
