'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Etsi palapelin nimellä, valmistajalla (esim. Ravensburger, Clementoni)...',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/') {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b5d] pointer-events-none stroke-[2]" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Etsi palapelejä"
        className="w-full bg-[#f4f8f5] border border-[#d2e6db] rounded-xl pl-10 pr-12 py-2.5 text-xs sm:text-sm font-semibold text-[#0f291e] placeholder:text-[#4a6b5d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all min-h-[44px]"
      />
      {!value && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#4a6b5d] bg-[#e2f0e8] border border-[#d2e6db] rounded pointer-events-none select-none">
          ⌘K
        </kbd>
      )}
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Tyhjennä haku"
          className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#4a6b5d] hover:text-[#0f291e] hover:bg-[#e2f0e8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857]"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}
