import { Puzzle } from '../scrapers/types';

export type LibraryStatus = 'WISHLIST' | 'OWNED_NOT_DONE' | 'OWNED_DONE';

export interface UserPuzzleItem {
  id: string; // puzzleId
  userId: string;
  status: LibraryStatus;
  rating?: number; // 1-5
  notes?: string;
  updatedAt: number;
  puzzle: Puzzle;
}

export interface LibraryStats {
  total: number;
  wishlist: number;
  ownedNotDone: number;
  ownedDone: number;
}
