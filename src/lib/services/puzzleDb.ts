import { adminDb } from '@/lib/firebase/admin';
import { Puzzle } from '@/lib/scrapers/types';

export interface StoredPuzzleDocument extends Puzzle {
  updatedAt: number;
  lastScrapedAt: number;
}

export interface QueryPuzzleOptions {
  storeId?: string;
  search?: string;
  sort?: string;
  pieceCount?: string;
  offset?: number;
  limit?: number;
}

export interface QueryPuzzleResult {
  items: Puzzle[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  storeId: string;
  storeName: string;
}

const COLLECTION_NAME = 'puzzles';

/**
 * Upsert puzzles into Firestore using batch writes (chunked by 450 items per batch)
 */
export async function upsertPuzzles(puzzles: Puzzle[]): Promise<{ updatedCount: number }> {
  if (!puzzles || puzzles.length === 0) return { updatedCount: 0 };

  const now = Date.now();
  const BATCH_SIZE = 450; // Firestore maximum is 500 operations per batch
  let count = 0;

  for (let i = 0; i < puzzles.length; i += BATCH_SIZE) {
    const chunk = puzzles.slice(i, i + BATCH_SIZE);
    const batch = adminDb.batch();

    for (const puzzle of chunk) {
      if (!puzzle.id) continue;
      const ref = adminDb.collection(COLLECTION_NAME).doc(puzzle.id);
      
      const docData: StoredPuzzleDocument = {
        ...puzzle,
        updatedAt: now,
        lastScrapedAt: now,
      };

      batch.set(ref, docData, { merge: true });
      count++;
    }

    await batch.commit();
  }

  return { updatedCount: count };
}

/**
 * Returns total count of puzzle documents in Firestore
 */
export async function getPuzzleCount(): Promise<number> {
  try {
    const snapshot = await adminDb.collection(COLLECTION_NAME).count().get();
    return snapshot.data().count;
  } catch (err) {
    console.error('Error fetching puzzle count:', err);
    return 0;
  }
}

/**
 * Query puzzles from Firestore with store filtering, piece count filtering, tokenized search, sorting, and pagination
 */
export async function queryStoredPuzzles(options: QueryPuzzleOptions = {}): Promise<QueryPuzzleResult> {
  const {
    storeId = 'all',
    search = '',
    sort = '',
    pieceCount = '',
    offset = 0,
    limit = 60,
  } = options;

  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;
  const validLimit = isNaN(limit) || limit <= 0 ? 60 : limit;

  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTION_NAME);

  if (storeId && storeId !== 'all') {
    query = query.where('sourceStore.id', '==', storeId);
  }

  const snapshot = await query.get();
  let items: Puzzle[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id || doc.id,
      title: data.title || '',
      price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
      currency: data.currency || 'EUR',
      imageUrl: data.imageUrl || '',
      productUrl: data.productUrl || '',
      brand: data.brand || undefined,
      pieceCount: data.pieceCount ? parseInt(data.pieceCount, 10) : undefined,
      ean: data.ean || undefined,
      inStock: data.inStock !== false,
      sourceStore: data.sourceStore || { id: 'unknown', name: 'Tuntematon' },
    };
  });

  // 1. Filter by tokenized search query
  if (search.trim()) {
    const searchTerms = search.toLowerCase().trim().split(/\s+/);
    items = items.filter((item) => {
      const targetText = `${item.title} ${item.brand || ''} ${item.pieceCount || ''} ${item.ean || ''}`.toLowerCase();
      return searchTerms.every((term) => targetText.includes(term));
    });
  }

  // 2. Filter by piece count criteria
  if (pieceCount) {
    items = items.filter((item) => {
      if (item.pieceCount === undefined || item.pieceCount === null) return false;
      if (pieceCount === 'under500') return item.pieceCount < 400;
      if (pieceCount === '500') return item.pieceCount >= 400 && item.pieceCount <= 750;
      if (pieceCount === '1000') return item.pieceCount >= 751 && item.pieceCount <= 1250;
      if (pieceCount === '1500+') return item.pieceCount > 1250;
      return true;
    });
  }

  // 3. Sort items
  if (sort === 'price-asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === 'title') {
    items.sort((a, b) => a.title.localeCompare(b.title, 'fi'));
  } else if (sort === 'pieces-desc') {
    items.sort((a, b) => (b.pieceCount || 0) - (a.pieceCount || 0));
  }

  const total = items.length;
  const paginatedItems = items.slice(validOffset, validOffset + validLimit);
  const hasMore = validOffset + validLimit < total;

  let storeName = 'Kaikki kaupat';
  if (storeId !== 'all' && paginatedItems.length > 0) {
    storeName = paginatedItems[0].sourceStore.name;
  }

  return {
    items: paginatedItems,
    total,
    offset: validOffset,
    limit: validLimit,
    hasMore,
    storeId,
    storeName,
  };
}
