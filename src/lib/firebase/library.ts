import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { LibraryStatus, UserPuzzleItem } from './types';
import { Puzzle } from '../scrapers/types';

export async function setUserPuzzleStatus(
  userId: string,
  puzzle: Puzzle,
  status: LibraryStatus,
  rating?: number,
  notes?: string
): Promise<void> {
  if (!userId || !puzzle || !puzzle.id) return;

  const itemRef = doc(db, 'users', userId, 'library', puzzle.id);
  const data: Partial<UserPuzzleItem> = {
    id: puzzle.id,
    userId,
    status,
    updatedAt: Date.now(),
    puzzle,
  };

  if (rating !== undefined) data.rating = rating;
  if (notes !== undefined) data.notes = notes;

  await setDoc(itemRef, data, { merge: true });
}

export async function removeUserPuzzle(userId: string, puzzleId: string): Promise<void> {
  if (!userId || !puzzleId) return;
  const itemRef = doc(db, 'users', userId, 'library', puzzleId);
  await deleteDoc(itemRef);
}

export function subscribeToUserLibrary(
  userId: string,
  onUpdate: (items: UserPuzzleItem[]) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const libraryRef = collection(db, 'users', userId, 'library');
  const q = query(libraryRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: UserPuzzleItem[] = snapshot.docs.map((docSnap) => docSnap.data() as UserPuzzleItem);
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore library subscription error:', err);
      onUpdate([]);
    }
  );
}
