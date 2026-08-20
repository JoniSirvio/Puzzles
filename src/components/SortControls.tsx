'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, ChevronDown, Check, X } from 'lucide-react';

interface SortControlsProps {
  value: string;
  onChange: (val: string) => void;
  iconOnly?: boolean;
}

const SORT_OPTIONS = [
  { label: 'Uusimmat / Oletus', value: '' },
  { label: 'Hinta: Alin ensin', value: 'price-asc' },
  { label: 'Hinta: Korkein ensin', value: 'price-desc' },
  { label: 'Paloja: Eniten ensin', value: 'pieces-desc' },
  { label: 'Nimi: A–Z', value: 'title' },
];

export function SortControls({ value, onChange, iconOnly = false }: SortControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  // Close desktop popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block shrink-0">
      {/* Trigger Button */}
      {iconOnly ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Järjestä palapelit"
          aria-expanded={isOpen}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center border transition-all focus:outline-none focus:ring-2 focus:ring-[#047857] ${
            value
              ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
              : 'bg-[#f4f8f5] text-[#047857] border-[#d2e6db] hover:bg-[#e2f0e8]'
          }`}
        >
          <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Järjestä palapelit"
          aria-expanded={isOpen}
          className="inline-flex items-center gap-2 bg-[#f4f8f5] border border-[#d2e6db] rounded-xl pl-3.5 pr-3 py-2.5 text-xs font-bold text-[#0f291e] hover:border-[#a7f3d0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all min-h-[44px]"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[#047857] stroke-[2]" />
          <span>Järjestys: {selectedOption.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#4a6b5d] stroke-[2] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      )}

      {/* Custom Sort Menu (Mobile Bottom Sheet & Desktop Floating Dropdown) */}
      {isOpen && (
        <>
          {/* Mobile Bottom Sheet Modal (< sm) */}
          <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center p-0 animate-fadeIn">
            {/* Backdrop */}
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />

            {/* Bottom Sheet Panel */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sort-modal-title"
              className="relative z-10 w-full bg-white rounded-t-3xl shadow-2xl border border-[#d2e6db] p-5 overflow-hidden transform transition-all duration-300 animate-slideUp"
            >
              {/* Drag handle */}
              <div className="flex items-center justify-center pt-1 pb-3">
                <div className="w-12 h-1.25 bg-[#d2e6db] rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e2ede7] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#e6f4ed] text-[#047857] flex items-center justify-center border border-[#a7f3d0]">
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                  <h3 id="sort-modal-title" className="text-base font-black text-[#0f291e]">
                    Järjestä palapelit
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Sulje"
                  className="p-2 rounded-xl text-[#4a6b5d] hover:bg-[#f0f7f3] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all min-h-[48px] border ${
                        isSelected
                          ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                          : 'bg-[#f4f8f5] text-[#0f291e] hover:bg-[#e2f0e8] border-[#d2e6db]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Floating Dropdown (>= sm) */}
          <div className="hidden sm:block absolute right-0 top-full mt-2 w-56 bg-white border border-[#d2e6db] rounded-2xl shadow-xl p-2 z-30 animate-menu-slide-down overflow-hidden">
            <span className="text-[10px] font-bold text-[#4a6b5d] uppercase tracking-wider block px-3 py-1.5 border-b border-[#f0f7f3] mb-1">
              Järjestä hakutulokset:
            </span>
            <div className="space-y-1">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                      isSelected
                        ? 'bg-[#064e3b] text-white shadow-xs'
                        : 'text-[#0f291e] hover:bg-[#f0f7f3]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
