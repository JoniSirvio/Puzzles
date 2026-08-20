'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  onOffsetChange: (newOffset: number) => void;
}

export function Pagination({ offset, limit, total, onOffsetChange }: PaginationProps) {
  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const startItem = offset + 1;
  const endItem = Math.min(offset + limit, total);

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    onOffsetChange(newOffset);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Sivunavigaatio"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#e2ede7] rounded-2xl p-4 shadow-sm mt-10"
    >
      <div className="text-xs text-[#4a6b5d] font-semibold select-none">
        Näytetään tuotteet <span className="text-[#0f291e] font-extrabold">{startItem}–{endItem}</span> / <span className="text-[#0f291e] font-extrabold">{total}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Mene edelliselle sivulle"
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[#d2e6db] bg-[#f4f8f5] text-[#0f291e] hover:bg-[#e2f0e8] active:bg-[#d4e8dd] disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.25]" />
        </button>

        <span className="inline-flex items-center justify-center h-11 px-3.5 bg-[#064e3b] text-white font-extrabold text-xs rounded-xl shadow-xs border border-emerald-700/50 select-none">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Mene seuraavalle sivulle"
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[#d2e6db] bg-[#f4f8f5] text-[#0f291e] hover:bg-[#e2f0e8] active:bg-[#d4e8dd] disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.25]" />
        </button>
      </div>
    </nav>
  );
}
