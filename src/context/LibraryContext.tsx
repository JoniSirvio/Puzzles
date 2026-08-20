'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { LibraryStats, LibraryStatus, UserPuzzleItem } from '@/lib/firebase/types';
import { Puzzle } from '@/lib/scrapers/types';
import {
  removeUserPuzzle,
  setUserPuzzleStatus,
  subscribeToUserLibrary,
} from '@/lib/firebase/library';

interface LibraryContextType {
  libraryItems: UserPuzzleItem[];
  libraryMap: Record<string, UserPuzzleItem>;
  stats: LibraryStats;
  getItemStatus: (puzzleId: string) => UserPuzzleItem | undefined;
  toggleWishlist: (puzzle: Puzzle) => Promise<void>;
  toggleOwnedNotDone: (puzzle: Puzzle) => Promise<void>;
  toggleOwnedDone: (
    puzzle: Puzzle,
    rating?: number,
    notes?: string,
    userPhotoUrl?: string
  ) => Promise<void>;
  updateRatingAndNotes: (
    puzzleId: string,
    rating: number,
    notes?: string,
    userPhotoUrl?: string
  ) => Promise<void>;
  removeItem: (puzzleId: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal } = useAuth();
  const [libraryItems, setLibraryItems] = useState<UserPuzzleItem[]>([]);

  useEffect(() => {
    if (!user) {
      setLibraryItems([]);
      return;
    }
    const unsubscribe = subscribeToUserLibrary(user.uid, (items) => {
      setLibraryItems(items);
    });
    return () => unsubscribe();
  }, [user]);

  const libraryMap = useMemo(() => {
    const map: Record<string, UserPuzzleItem> = {};
    libraryItems.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [libraryItems]);

  const stats = useMemo<LibraryStats>(() => {
    let wishlist = 0;
    let ownedNotDone = 0;
    let ownedDone = 0;

    libraryItems.forEach((item) => {
      if (item.status === 'WISHLIST') wishlist++;
      else if (item.status === 'OWNED_NOT_DONE') ownedNotDone++;
      else if (item.status === 'OWNED_DONE') ownedDone++;
    });

    return {
      total: libraryItems.length,
      wishlist,
      ownedNotDone,
      ownedDone,
    };
  }, [libraryItems]);

  const getItemStatus = (puzzleId: string) => libraryMap[puzzleId];

  const requireUser = () => {
    if (!user) {
      openAuthModal();
      return false;
    }
    return true;
  };

  const toggleWishlist = async (puzzle: Puzzle) => {
    if (!requireUser() || !user) return;
    const current = libraryMap[puzzle.id];
    if (current && current.status === 'WISHLIST') {
      await removeUserPuzzle(user.uid, puzzle.id);
    } else {
      await setUserPuzzleStatus(user.uid, puzzle, 'WISHLIST');
    }
  };

  const toggleOwnedNotDone = async (puzzle: Puzzle) => {
    if (!requireUser() || !user) return;
    const current = libraryMap[puzzle.id];
    if (current && current.status === 'OWNED_NOT_DONE') {
      await removeUserPuzzle(user.uid, puzzle.id);
    } else {
      await setUserPuzzleStatus(user.uid, puzzle, 'OWNED_NOT_DONE');
    }
  };

  const toggleOwnedDone = async (
    puzzle: Puzzle,
    rating?: number,
    notes?: string,
    userPhotoUrl?: string
  ) => {
    if (!requireUser() || !user) return;
    const current = libraryMap[puzzle.id];
    if (current && current.status === 'OWNED_DONE') {
      await removeUserPuzzle(user.uid, puzzle.id);
    } else {
      await setUserPuzzleStatus(user.uid, puzzle, 'OWNED_DONE', rating, notes, userPhotoUrl);
    }
  };

  const updateRatingAndNotes = async (
    puzzleId: string,
    rating: number,
    notes?: string,
    userPhotoUrl?: string
  ) => {
    if (!requireUser() || !user) return;
    const current = libraryMap[puzzleId];
    if (current) {
      await setUserPuzzleStatus(
        user.uid,
        current.puzzle,
        current.status,
        rating,
        notes,
        userPhotoUrl
      );
    }
  };

  const removeItem = async (puzzleId: string) => {
    if (!requireUser() || !user) return;
    await removeUserPuzzle(user.uid, puzzleId);
  };

  return (
    <LibraryContext.Provider
      value={{
        libraryItems,
        libraryMap,
        stats,
        getItemStatus,
        toggleWishlist,
        toggleOwnedNotDone,
        toggleOwnedDone,
        updateRatingAndNotes,
        removeItem,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
