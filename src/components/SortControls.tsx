'use client';

import { ArrowUpDown, ChevronDown } from 'lucide-react';

interface SortControlsProps {
  value: string;
  onChange: (val: string) => void;
  compact?: boolean;
}

export function SortControls({ value, onChange, compact = false }: SortControlsProps) {
  return (
    <div className={`relative inline-flex items-center shrink ${compact ? 'max-w-[105px] xs:max-w-[125px] sm:max-w-none' : 'max-w-full'}`}>
      <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a6b5d] pointer-events-none stroke-[2]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Järjestä palapelit"
        className="w-full bg-[#f4f8f5] border border-[#d2e6db] rounded-xl pl-7 pr-6 py-2.5 text-base sm:text-xs font-bold text-[#0f291e] hover:border-[#a7f3d0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all appearance-none cursor-pointer min-h-[44px] truncate"
      >
        <option value="">Järjestys</option>
        <option value="price-asc">Hinta: Alin</option>
        <option value="price-desc">Hinta: Korkein</option>
        <option value="pieces-desc">Paloja: Eniten</option>
        <option value="title">Nimi: A–Z</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a6b5d] pointer-events-none stroke-[2]" />
    </div>
  );
}
