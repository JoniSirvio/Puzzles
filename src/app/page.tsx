'use client';

import { useCallback, useEffect, useState } from 'react';
import { Puzzle, ScrapeResult } from '@/lib/scrapers/types';
import { StoreFilter } from '@/components/StoreFilter';
import { SearchBar } from '@/components/SearchBar';
import { SortControls } from '@/components/SortControls';
import { PuzzleGrid } from '@/components/PuzzleGrid';
import { Pagination } from '@/components/Pagination';
import { FilterModal } from '@/components/FilterModal';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { SUPPORTED_STORES } from '@/lib/scrapers';

const PIECE_COUNT_OPTIONS = [
  { label: 'Kaikki', value: '' },
  { label: '< 500 palaa', value: 'under500' },
  { label: '500–750 palaa', value: '500' },
  { label: '1000 palaa', value: '1000' },
  { label: '1500+ palaa', value: '1500+' },
];

export default function HomePage() {
  const [selectedStore, setSelectedStore] = useState('all');
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [pieceCount, setPieceCount] = useState('');

  // Mobile-specific control states
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

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
    setSelectedStore('all');
    setSearch('');
    setPieceCount('');
    setSort('');
    setOffset(0);
  };

  const activeFilterCount =
    (selectedStore !== 'all' ? 1 : 0) + (pieceCount ? 1 : 0) + (search ? 1 : 0);

  const isFiltered = Boolean(search || pieceCount || sort || selectedStore !== 'all');

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

  const getStoreName = (id: string) => {
    if (id === 'all') return 'Kaikki kaupat';
    const st = SUPPORTED_STORES.find((s) => s.id === id);
    return st ? st.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Mobile Control Bar (< sm viewports) */}
      <div className="sm:hidden space-y-3">
        {mobileSearchOpen ? (
          /* Expandable Search Input Slider */
          <div className="flex items-center gap-2 animate-menu-slide-down">
            <SearchBar value={search} onChange={handleSearchChange} />
            <button
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Sulje haku"
              className="p-2.5 bg-white border border-[#d2e6db] text-[#4a6b5d] rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Compact 1-Line Action Bar */
          <div className="flex items-center gap-2 bg-white border border-[#d2e6db] rounded-2xl p-2.5 shadow-xs">
            {/* 1. Expandable Search Trigger Button */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="flex-1 flex items-center gap-2 bg-[#f4f8f5] hover:bg-[#e2f0e8] text-[#4a6b5d] px-3.5 py-2.5 rounded-xl border border-[#d2e6db] font-semibold text-xs transition-colors min-h-[44px]"
            >
              <Search className="w-4 h-4 text-[#047857]" />
              <span className="truncate">{search ? `"${search}"` : 'Etsi palapelejä...'}</span>
            </button>

            {/* 2. Filter Bottom Sheet Trigger Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all min-h-[44px] shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                  : 'bg-[#f4f8f5] text-[#0f291e] border-[#d2e6db] hover:bg-[#e2f0e8]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Suodattimet</span>
              {activeFilterCount > 0 && (
                <span className="bg-emerald-400 text-emerald-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* 3. Sort Select Dropdown */}
            <SortControls value={sort} onChange={setSort} compact />
          </div>
        )}
      </div>

      {/* Desktop Workspace Control Bar (>= sm viewports) */}
      <section className="hidden sm:block bg-white border border-[#d2e6db] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center ${
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
              className="text-xs font-bold text-[#047857] hover:text-[#064e3b] hover:underline inline-flex items-center gap-1 transition-colors self-start sm:self-auto min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tyhjennä hakuehdot</span>
            </button>
          )}
        </div>
      </section>

      {/* Active Filter Pills Bar (both Mobile and Desktop) */}
      {isFiltered && (
        <div className="bg-white border border-[#d2e6db] rounded-2xl p-3 shadow-2xs flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#4a6b5d] uppercase tracking-wider">
            Aktiiviset suodattimet:
          </span>
          {selectedStore !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-[#e6f4ed] text-[#064e3b] text-xs font-bold pl-3 pr-1 py-0.5 rounded-xl border border-[#a7f3d0]">
              <span>Kauppa: {getStoreName(selectedStore)}</span>
              <button
                onClick={() => setSelectedStore('all')}
                aria-label="Poista kauppasuodatin"
                className="hover:text-emerald-900 font-black min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 bg-[#e6f4ed] text-[#064e3b] text-xs font-bold pl-3 pr-1 py-0.5 rounded-xl border border-[#a7f3d0]">
              <span>Haku: &quot;{search}&quot;</span>
              <button
                onClick={() => setSearch('')}
                aria-label="Poista hakusana"
                className="hover:text-emerald-900 font-black min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </span>
          )}
          {pieceCount && (
            <span className="inline-flex items-center gap-1.5 bg-[#e6f4ed] text-[#064e3b] text-xs font-bold pl-3 pr-1 py-0.5 rounded-xl border border-[#a7f3d0]">
              <span>Koko: {getPieceLabel(pieceCount)}</span>
              <button
                onClick={() => setPieceCount('')}
                aria-label="Poista palapelikoko suodatin"
                className="hover:text-emerald-900 font-black min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </span>
          )}
          {sort && (
            <span className="inline-flex items-center gap-1.5 bg-[#e6f4ed] text-[#064e3b] text-xs font-bold pl-3 pr-1 py-0.5 rounded-xl border border-[#a7f3d0]">
              <span>Järjestys: {getSortLabel(sort)}</span>
              <button
                onClick={() => setSort('')}
                aria-label="Poista järjestys"
                className="hover:text-emerald-900 font-black min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

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

      {/* Mobile Filter Bottom Sheet Modal */}
      {showFilterModal && (
        <FilterModal
          selectedStore={selectedStore}
          pieceCount={pieceCount}
          totalResults={total}
          onApply={(store, pieces) => {
            setSelectedStore(store);
            setPieceCount(pieces);
            setOffset(0);
          }}
          onReset={handleResetFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}
