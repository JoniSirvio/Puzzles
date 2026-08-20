'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Puzzle, Library, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

export function Header() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const { stats } = useLibrary();

  return (
    <header className="sticky top-0 z-40 bg-[#fbfaf6]/90 backdrop-blur-md border-b border-[#e2ede7]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo Link */}
        <Link href="/" className="font-extrabold text-xl tracking-tight text-[#0f291e] hover:opacity-80 transition-opacity">
          Puzzles
        </Link>

        {/* Navigation & User Menu */}
        <div className="flex items-center gap-3">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-[#f0f7f3] p-1 rounded-xl border border-[#d2e6db]">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#0f291e] hover:bg-[#e2f0e8]'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Selaa Valikoimaa</span>
              <span className="sm:hidden">Haku</span>
            </Link>

            <Link
              href="/omatsivut"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] flex items-center gap-1.5 relative ${
                pathname === '/omatsivut'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#0f291e] hover:bg-[#e2f0e8]'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Omat Palapelit</span>
              {user && stats.total > 0 && (
                <span className="ml-0.5 bg-emerald-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full">
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
                className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#d2e6db] text-xs font-bold text-[#0f291e]"
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
                <span className="max-w-[100px] truncate">{user.displayName || user.email}</span>
              </div>

              <button
                onClick={logout}
                title="Kirjaudu ulos"
                aria-label="Kirjaudu ulos"
                className="p-2 rounded-xl bg-white border border-[#d2e6db] text-[#4a6b5d] hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[44px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Kirjaudu</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
