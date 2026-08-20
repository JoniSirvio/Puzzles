'use client';

import { ArrowUpDown, ChevronDown } from 'lucide-react';

interface SortControlsProps {
  value: string;
  onChange: (val: string) => void;
}

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div className="relative inline-flex items-center shrink-0">
      <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b5d] pointer-events-none stroke-[2]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Järjestä palapelit"
        className="bg-[#f4f8f5] border border-[#d2e6db] rounded-xl pl-10 pr-9 py-2.5 text-base sm:text-xs font-bold text-[#0f291e] hover:border-[#a7f3d0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all appearance-none cursor-pointer min-h-[44px]"
      >
        <option value="">Järjestys: Uusimmat / Oletus</option>
        <option value="price-asc">Hinta: Alin ensin</option>
        <option value="price-desc">Hinta: Korkein ensin</option>
        <option value="pieces-desc">Paloja: Eniten ensin</option>
        <option value="title">Nimi: A - Z</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b5d] pointer-events-none stroke-[2]" />
    </div>
  );
}
