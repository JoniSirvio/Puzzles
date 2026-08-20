'use client';

import { useState } from 'react';
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
      onClick={closeAuthModal}
    >
      <div
        className="bg-white rounded-2xl border border-[#d2e6db] shadow-xl max-w-sm w-full p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Sulje ikkuna"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#658577] hover:text-[#0f291e] hover:bg-[#f0f7f3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Quiet Header */}
        <div className="space-y-1.5 mb-5 pr-6">
          <div className="w-9 h-9 rounded-xl bg-[#f0f7f3] border border-[#d2e6db] text-[#064e3b] flex items-center justify-center mb-3">
            <LogIn className="w-4 h-4 stroke-[2]" />
          </div>
          <h2 className="text-lg font-bold text-[#0f291e] tracking-tight">
            {isRegister ? 'Luo maksuton tili' : 'Kirjaudu Sisään'}
          </h2>
          <p className="text-xs text-[#658577] leading-relaxed">
            {isRegister
              ? 'Tallenna omat palapelisi ja seuraa kokoamistasi.'
              : 'Syötä tunnuksesi avataksesi oman palapelikokoelmasi.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{error}</span>
          </div>
        )}

        {/* Quiet Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#0f291e] mb-1">
              Sähköpostiosoite
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nimi@esimerkki.fi"
              className="w-full bg-[#f8faf9] border border-[#d2e6db] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f291e] placeholder:text-[#93b0a2] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0f291e] mb-1">Salasana</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f8faf9] border border-[#d2e6db] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f291e] placeholder:text-[#93b0a2] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#064e3b] hover:bg-[#047857] active:bg-[#035e44] text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-xs mt-1 focus:outline-none focus:ring-2 focus:ring-[#047857] min-h-[44px] flex items-center justify-center disabled:opacity-50"
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
            className="text-xs font-semibold text-[#047857] hover:text-[#064e3b] hover:underline transition-colors"
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
