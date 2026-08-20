'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, X, AlertCircle } from 'lucide-react';
import { signInWithEmail, registerWithEmail } from '@/lib/firebase/auth';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Lock background scroll when open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      closeAuthModal();
    } catch (err: any) {
      console.error(err);
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Virheellinen sähköposti tai salasana.'
          : err.code === 'auth/email-already-in-use'
          ? 'Tämä sähköposti on jo rekisteröity.'
          : err.code === 'auth/weak-password'
          ? 'Salasanan tulee olla vähintään 6 merkkiä pitkä.'
          : err.message || 'Kirjautuminen epäonnistui. Yritä uudelleen.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#d2e6db] p-5 sm:p-6 overflow-hidden transform transition-all duration-300 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden flex items-center justify-center pt-1 pb-3">
          <div className="w-12 h-1.25 bg-[#d2e6db] rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Sulje ikkuna"
          className="absolute top-4 right-4 p-2 rounded-xl text-[#4a6b5d] hover:text-[#0f291e] hover:bg-[#f0f7f3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Quiet Header */}
        <div className="space-y-1.5 mb-5 pr-6">
          <div className="w-10 h-10 rounded-2xl bg-[#e6f4ed] border border-[#a7f3d0] text-[#064e3b] flex items-center justify-center mb-3">
            <LogIn className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 id="auth-modal-title" className="text-lg sm:text-xl font-black text-[#0f291e] tracking-tight">
            {isRegister ? 'Luo maksuton tili' : 'Kirjaudu Sisään'}
          </h2>
          <p className="text-xs text-[#4a6b5d] font-semibold leading-relaxed">
            {isRegister
              ? 'Tallenna omat palapelisi ja seuraa kokoamistasi.'
              : 'Syötä tunnuksesi avataksesi oman palapelikokoelmasi.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-bold leading-tight">{error}</span>
          </div>
        )}

        {/* Email Form - text-base for iOS Safari auto-zoom prevention */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#0f291e] mb-1">
              Sähköpostiosoite
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nimi@esimerkki.fi"
              className="w-full bg-[#f4f8f5] border border-[#d2e6db] rounded-xl px-3.5 py-2.5 text-base sm:text-xs font-semibold text-[#0f291e] placeholder:text-[#4a6b5d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0f291e] mb-1">Salasana</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f4f8f5] border border-[#d2e6db] rounded-xl px-3.5 py-2.5 text-base sm:text-xs font-semibold text-[#0f291e] placeholder:text-[#4a6b5d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#064e3b] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm shadow-[#064e3b]/20 mt-1 focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[48px] flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Käsitellään...' : isRegister ? 'Rekisteröidy' : 'Kirjaudu'}
          </button>
        </form>

        <div className="mt-4 pt-3.5 border-t border-[#f0f7f3] text-center">
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsRegister(!isRegister);
            }}
            className="text-xs font-bold text-[#047857] hover:text-[#064e3b] hover:underline transition-colors min-h-[44px] inline-flex items-center justify-center px-2"
          >
            {isRegister
              ? 'Onko sinulla jo tili? Kirjaudu sisään'
              : 'Eikö sinulla ole tiliä? Rekisteröidy tästä'}
          </button>
        </div>
      </div>
    </div>
  );
}
