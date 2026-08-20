import { NextRequest, NextResponse } from 'next/server';
import { getScraper } from '@/lib/scrapers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store') || 'karkkainen';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const pieceCount = searchParams.get('pieceCount') || '';

  const scraper = getScraper(storeId);
  if (!scraper) {
    return NextResponse.json(
      { error: `Tuntematon tai tukematon kauppa: ${storeId}` },
      { status: 400 }
    );
  }

  const result = await scraper.scrape({
    offset: isNaN(offset) ? 0 : offset,
    search,
    pieceCount: pieceCount || undefined,
  });

  // Client-side search filtering if provided
  let filteredItems = result.items;
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.pieceCount && item.pieceCount.toString().includes(q))
    );
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

  // Determine true total count for response
  let finalTotal = result.total;
  if (search.trim() || pieceCount) {
    // If local filtering reduced items count or native search returned fewer items than store total
    if (result.items.length < result.total && result.total === 2255 && filteredItems.length < result.items.length) {
      finalTotal = filteredItems.length;
    } else if (result.items.length <= 60 && result.items.length === result.total) {
      finalTotal = filteredItems.length;
    } else if (filteredItems.length < result.items.length && result.total > filteredItems.length) {
      // Scale or cap total based on filtered ratio
      finalTotal = Math.round(result.total * (filteredItems.length / result.items.length));
    }
  }

  return NextResponse.json({
    ...result,
    total: finalTotal,
    items: filteredItems,
  });
}
