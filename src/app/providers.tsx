'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LibraryProvider>{children}</LibraryProvider>
    </AuthProvider>
  );
}
