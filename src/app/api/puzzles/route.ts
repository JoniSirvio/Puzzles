import { NextRequest, NextResponse } from 'next/server';
import { getPuzzleCount, queryStoredPuzzles } from '@/lib/services/puzzleDb';
import { getAllScrapers, getScraper } from '@/lib/scrapers';
import { Puzzle } from '@/lib/scrapers/types';
import { syncAllStorePuzzles } from '@/lib/scrapers/sync';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store') || 'all';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const pieceCount = searchParams.get('pieceCount') || '';

  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  try {
    const storedCount = await getPuzzleCount();

    // Primary path: Query Firestore database populated by 9:00 AM Cloud Function
    if (storedCount > 0) {
      const result = await queryStoredPuzzles({
        storeId,
        search,
        sort,
        pieceCount,
        offset: validOffset,
        limit: 60,
      });

      return NextResponse.json(result);
    }

    // Fallback path: If Firestore collection is empty on first boot, trigger background sync and serve live scrapers
    console.warn('Firestore puzzle catalog is empty. Triggering background sync and serving live scrapers fallback...');
    
    // Trigger background sync non-blockingly
    syncAllStorePuzzles().catch((err) =>
      console.error('Initial background sync error:', err)
    );

    // Serve live scraped results so user never sees blank screen
    return serveLiveScrapedFallback({ storeId, validOffset, search, sort, pieceCount });
  } catch (err: any) {
    console.error('Error fetching puzzles from database, falling back to live scrapers:', err);
    return serveLiveScrapedFallback({ storeId, validOffset, search, sort, pieceCount });
  }
}

async function serveLiveScrapedFallback(params: {
  storeId: string;
  validOffset: number;
  search: string;
  sort: string;
  pieceCount: string;
}) {
  const { storeId, validOffset, search, sort, pieceCount } = params;

  let combinedItems: Puzzle[] = [];
  let combinedTotal = 0;
  let hasMore = false;
  let storeName = 'Kaikki kaupat';

  if (storeId === 'all') {
    const scrapers = getAllScrapers();
    const scrapeResults = await Promise.all(
      scrapers.map((scraper) =>
        scraper.scrape({
          offset: validOffset,
          search,
          pieceCount: pieceCount || undefined,
        })
      )
    );

    const itemsByStore = scrapeResults.map((r) => r.items || []);
    const maxLen = Math.max(...itemsByStore.map((arr) => arr.length), 0);

    for (let i = 0; i < maxLen; i++) {
      for (const storeItems of itemsByStore) {
        if (i < storeItems.length) {
          combinedItems.push(storeItems[i]);
        }
      }
    }

    combinedTotal = scrapeResults.reduce((acc, r) => acc + (r.total || 0), 0);
    hasMore = scrapeResults.some((r) => r.hasMore);
  } else {
    const scraper = getScraper(storeId);
    if (!scraper) {
      return NextResponse.json(
        { error: `Tuntematon tai tukematon kauppa: ${storeId}` },
        { status: 400 }
      );
    }

    const result = await scraper.scrape({
      offset: validOffset,
      search,
      pieceCount: pieceCount || undefined,
    });

    combinedItems = result.items || [];
    combinedTotal = result.total || 0;
    hasMore = result.hasMore;
    storeName = result.storeName || storeId;
  }

  let filteredItems = combinedItems;
  if (search.trim()) {
    const searchTerms = search.toLowerCase().trim().split(/\s+/);
    filteredItems = filteredItems.filter((item) => {
      const targetText = `${item.title} ${item.brand || ''} ${item.pieceCount || ''}`.toLowerCase();
      return searchTerms.every((term) => targetText.includes(term));
    });
  }

  if (pieceCount) {
    filteredItems = filteredItems.filter((item) => {
      if (item.pieceCount === undefined || item.pieceCount === null) return false;
      if (pieceCount === 'under500') return item.pieceCount < 400;
      if (pieceCount === '500') return item.pieceCount >= 400 && item.pieceCount <= 750;
      if (pieceCount === '1000') return item.pieceCount >= 751 && item.pieceCount <= 1250;
      if (pieceCount === '1500+') return item.pieceCount > 1250;
      return true;
    });
  }

  if (sort === 'price-asc') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filteredItems.sort((a, b) => b.price - a.price);
  } else if (sort === 'title') {
    filteredItems.sort((a, b) => a.title.localeCompare(b.title, 'fi'));
  } else if (sort === 'pieces-desc') {
    filteredItems.sort((a, b) => (b.pieceCount || 0) - (a.pieceCount || 0));
  }

  return NextResponse.json({
    items: filteredItems,
    total: combinedTotal,
    offset: validOffset,
    limit: 60,
    hasMore: hasMore && filteredItems.length >= 60,
    storeId,
    storeName,
  });
}
