'use client';

import { useCallback, useEffect, useState } from 'react';
import { Puzzle, ScrapeResult } from '@/lib/scrapers/types';
import { StoreFilter } from '@/components/StoreFilter';
import { SearchBar } from '@/components/SearchBar';
import { SortControls } from '@/components/SortControls';
import { PuzzleGrid } from '@/components/PuzzleGrid';
import { Pagination } from '@/components/Pagination';
import { RotateCcw } from 'lucide-react';

const PIECE_COUNT_OPTIONS = [
  { label: 'Kaikki', value: '' },
  { label: '< 500 palaa', value: 'under500' },
  { label: '500–750 palaa', value: '500' },
  { label: '1000 palaa', value: '1000' },
  { label: '1500+ palaa', value: '1500+' },
];

export default function HomePage() {
  const [selectedStore, setSelectedStore] = useState('karkkainen');
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [pieceCount, setPieceCount] = useState('');

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchPuzzles = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const params = new URLSearchParams();
      params.set('store', selectedStore);
      params.set('offset', offset.toString());
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (pieceCount) params.set('pieceCount', pieceCount);

      const res = await fetch(`/api/puzzles?${params.toString()}`);
      const data: ScrapeResult = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Palapelien hakeminen epäonnistui');
      }

      setPuzzles(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Verkkovirhe tuotteita haettaessa');
    } finally {
      setLoading(false);
    }
  }, [selectedStore, offset, search, sort, pieceCount]);

  useEffect(() => {
    fetchPuzzles();
  }, [fetchPuzzles]);

  const handleStoreChange = (newStore: string) => {
    setSelectedStore(newStore);
    setOffset(0);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setOffset(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setPieceCount('');
    setSort('');
    setOffset(0);
  };

  const isFiltered = Boolean(search || pieceCount || sort);

  const getSortLabel = (val: string) => {
    if (val === 'price-asc') return 'Hinta: Alin ensin';
    if (val === 'price-desc') return 'Hinta: Korkein ensin';
    if (val === 'pieces-desc') return 'Paloja: Eniten ensin';
    if (val === 'title') return 'Nimi: A–Z';
    return '';
  };

  const getPieceLabel = (val: string) => {
    const opt = PIECE_COUNT_OPTIONS.find((o) => o.value === val);
    return opt ? opt.label : val;
  };

  return (
    <div className="space-y-6">
      {/* Workspace Control Bar */}
      <section className="bg-white border border-[#d2e6db] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <h2 className="sr-only">Palapelihaku ja suodattimet</h2>
        {/* Store Selection */}
        <StoreFilter
          selectedStore={selectedStore}
          onSelectStore={handleStoreChange}
        />

        <div className="pt-3.5 border-t border-[#f0f7f3] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <SearchBar value={search} onChange={handleSearchChange} />

          {/* Sort Selector */}
          <SortControls value={sort} onChange={setSort} />
        </div>

        {/* Piece Count Filter & Global Reset */}
        <div className="pt-3.5 border-t border-[#f0f7f3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#4a6b5d] mr-1">Palapelin koko:</span>
            {PIECE_COUNT_OPTIONS.map((opt) => {
              const isActive = pieceCount === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setPieceCount(opt.value);
                    setOffset(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#047857] text-white shadow-xs'
                      : 'bg-[#f4f8f5] text-[#0f291e] hover:bg-[#e2f0e8] border border-[#d2e6db]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#047857] hover:text-[#064e3b] hover:underline inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tyhjennä hakuehdot</span>
            </button>
          )}
        </div>

        {/* Active Filter Pills Bar */}
        {isFiltered && (
          <div className="pt-3 border-t border-[#f0f7f3] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#4a6b5d] uppercase tracking-wider">
              Aktiiviset rajaus-ehdot:
            </span>
            {search && (
              <span className="inline-flex items-center gap-1 bg-[#e6f4ed] text-[#064e3b] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#a7f3d0]">
                <span>Haku: &quot;{search}&quot;</span>
                <button
                  onClick={() => setSearch('')}
                  aria-label="Poista hakusana"
                  className="hover:text-emerald-900 font-black ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            {pieceCount && (
              <span className="inline-flex items-center gap-1 bg-[#e6f4ed] text-[#064e3b] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#a7f3d0]">
                <span>Koko: {getPieceLabel(pieceCount)}</span>
                <button
                  onClick={() => setPieceCount('')}
                  aria-label="Poista palapelikoko suodatin"
                  className="hover:text-emerald-900 font-black ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            {sort && (
              <span className="inline-flex items-center gap-1 bg-[#e6f4ed] text-[#064e3b] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#a7f3d0]">
                <span>Järjestys: {getSortLabel(sort)}</span>
                <button
                  onClick={() => setSort('')}
                  aria-label="Poista järjestys"
                  className="hover:text-emerald-900 font-black ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* Results Counter */}
      {!loading && !error && (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold text-[#0f291e]">
            Löytyi <span className="text-[#047857] font-black">{total}</span> palapeliä
            {search && <span> hakusanalla &quot;{search}&quot;</span>}
          </h2>
        </div>
      )}

      {/* Puzzle Grid */}
      <PuzzleGrid
        puzzles={puzzles}
        loading={loading}
        error={error}
        onRetry={fetchPuzzles}
        onSearchSuggestion={handleSearchChange}
      />

      {/* Pagination */}
      {!loading && !error && (
        <Pagination
          offset={offset}
          limit={60}
          total={total}
          onOffsetChange={setOffset}
        />
      )}
    </div>
  );
}
