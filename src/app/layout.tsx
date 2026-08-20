import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';

export const metadata: Metadata = {
  title: 'Puzzles - Palapelien löytöpaikka',
  description: 'Löydä ja vertaile suomalaisten verkkokauppojen palapelejä kootusti yhdestä paikasta.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body className="min-h-screen flex flex-col bg-[#edf3ef] text-[#0f291e] antialiased selection:bg-[#a7f3d0] selection:text-[#064e3b]">
        <Providers>
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Auth Modal */}
          <AuthModal />

          {/* Footer */}
          <footer className="bg-white border-t border-[#e2ede7] py-8 text-center text-xs text-[#4a6b5d]">
            <div className="max-w-7xl mx-auto px-4 space-y-1.5">
              <p className="font-bold text-[#0f291e]">
                Puzzles &copy; {new Date().getFullYear()} – Palapelien löytöpaikka
              </p>
              <p className="text-[#658577] max-w-lg mx-auto">
                Tuotetiedot ja kuva-aineistot haetaan automaattisesti suomalaisten verkkokauppojen julkisista tuotekatalogeista.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
