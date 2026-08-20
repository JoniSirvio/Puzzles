import { NextRequest, NextResponse } from 'next/server';
import { getAllScrapers, getScraper } from '@/lib/scrapers';
import { Puzzle } from '@/lib/scrapers/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store') || 'all';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const pieceCount = searchParams.get('pieceCount') || '';

  const validOffset = isNaN(offset) ? 0 : offset;

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

    // Merge items from all scrapers round-robin style for fair store distribution
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

  // Tokenized Multi-word Search Filtering
  let filteredItems = combinedItems;
  if (search.trim()) {
    const searchTerms = search.toLowerCase().trim().split(/\s+/);
    filteredItems = filteredItems.filter((item) => {
      const targetText = `${item.title} ${item.brand || ''} ${item.pieceCount || ''}`.toLowerCase();
      return searchTerms.every((term) => targetText.includes(term));
    });
  }

  // Piece count filtering
  if (pieceCount) {
    filteredItems = filteredItems.filter((item) => {
      if (item.pieceCount === undefined || item.pieceCount === null) return false;
      if (pieceCount === 'under500') {
        return item.pieceCount < 400;
      }
      if (pieceCount === '500') {
        return item.pieceCount >= 400 && item.pieceCount <= 750;
      }
      if (pieceCount === '1000') {
        return item.pieceCount >= 751 && item.pieceCount <= 1250;
      }
      if (pieceCount === '1500+') {
        return item.pieceCount > 1250;
      }
      return true;
    });
  }

  // Sorting
  if (sort === 'price-asc') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filteredItems.sort((a, b) => b.price - a.price);
  } else if (sort === 'title') {
    filteredItems.sort((a, b) => a.title.localeCompare(b.title, 'fi'));
  } else if (sort === 'pieces-desc') {
    filteredItems.sort((a, b) => (b.pieceCount || 0) - (a.pieceCount || 0));
  }

  // Calculate true total count accurately when search or pieceCount filter is active
  let finalTotal = combinedTotal;
  if (search.trim() || pieceCount) {
    if (!hasMore || filteredItems.length < combinedItems.length) {
      finalTotal = validOffset + filteredItems.length;
    }
  }

  return NextResponse.json({
    items: filteredItems,
    total: finalTotal,
    offset: validOffset,
    limit: 60,
    hasMore: hasMore && filteredItems.length >= 60,
    storeId,
    storeName,
  });
}
