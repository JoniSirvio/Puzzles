'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Puzzle, Library, LogIn, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

export function Header() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const { stats } = useLibrary();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#fbfaf6]/95 backdrop-blur-md border-b border-[#e2ede7]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo Link */}
        <Link
          href="/"
          className="font-black text-xl tracking-tight text-[#0f291e] hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <span className="bg-[#064e3b] text-emerald-400 p-1.5 rounded-xl shadow-xs">
            <Puzzle className="w-5 h-5" />
          </span>
          <span>Puzzles</span>
        </Link>

        {/* Desktop Navigation & User Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-[#f0f7f3] p-1 rounded-xl border border-[#d2e6db]">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 ${
                pathname === '/'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#0f291e] hover:bg-[#e2f0e8]'
              }`}
            >
              <Puzzle className="w-4 h-4" />
              <span>Selaa Valikoimaa</span>
            </Link>

            <Link
              href="/omatsivut"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 relative ${
                pathname === '/omatsivut'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#0f291e] hover:bg-[#e2f0e8]'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Omat Palapelit</span>
              {user && stats.total > 0 && (
                <span className="ml-1 bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  {stats.total}
                </span>
              )}
            </Link>
          </nav>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div
                title={user.email || 'Kirjautunut'}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#d2e6db] text-xs font-bold text-[#0f291e] min-h-[44px]"
              >
                {user.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.photoURL}
                    alt="Käyttäjä"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#047857]" />
                )}
                <span className="max-w-[120px] truncate">{user.displayName || user.email}</span>
              </div>

              <button
                onClick={logout}
                title="Kirjaudu ulos"
                aria-label="Kirjaudu ulos"
                className="p-2.5 rounded-xl bg-white border border-[#d2e6db] text-[#4a6b5d] hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-2 bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Kirjaudu</span>
            </button>
          )}
        </div>

        {/* Mobile Burger Menu Button */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Sulje valikko' : 'Avaa valikko'}
            aria-expanded={mobileMenuOpen}
            className="p-2.5 rounded-xl bg-[#f0f7f3] border border-[#d2e6db] text-[#0f291e] hover:bg-[#e2f0e8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Burger Dropdown Navigation Panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#e2ede7] bg-[#fbfaf6] shadow-xl animate-fadeIn">
          <nav className="p-4 space-y-2">
            {/* 1. Selaa Valikoimaa */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] border ${
                pathname === '/'
                  ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-[#0f291e] hover:bg-[#f0f7f3] border-[#d2e6db]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  pathname === '/'
                    ? 'bg-emerald-800 text-emerald-300'
                    : 'bg-[#f0f7f3] text-[#047857]'
                }`}
              >
                <Puzzle className="w-4 h-4" />
              </div>
              <span>Selaa Valikoimaa</span>
            </Link>

            {/* 2. Omat Palapelit */}
            <Link
              href="/omatsivut"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] border ${
                pathname === '/omatsivut'
                  ? 'bg-[#064e3b] text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-[#0f291e] hover:bg-[#f0f7f3] border-[#d2e6db]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    pathname === '/omatsivut'
                      ? 'bg-emerald-800 text-emerald-300'
                      : 'bg-[#f0f7f3] text-[#047857]'
                  }`}
                >
                  <Library className="w-4 h-4" />
                </div>
                <span>Omat Palapelit</span>
              </div>
              {user && stats.total > 0 && (
                <span className="bg-emerald-500 text-white font-black text-xs px-2.5 py-1 rounded-full">
                  {stats.total}
                </span>
              )}
            </Link>

            {/* 3. User Account / Auth Action */}
            <div className="pt-2 border-t border-[#e2ede7]">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#d2e6db]">
                    {user.photoURL ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.photoURL}
                        alt="Käyttäjä"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-[#e6f4ed] text-[#047857] flex items-center justify-center">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#0f291e] block truncate">
                        {user.displayName || user.email}
                      </span>
                      <span className="text-[11px] text-[#4a6b5d] block">Kirjautunut tili</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 min-h-[48px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Kirjaudu ulos</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#064e3b] text-white font-bold text-sm shadow-sm shadow-[#064e3b]/20 min-h-[48px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Kirjaudu Sisään</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
