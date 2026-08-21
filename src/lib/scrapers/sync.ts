import { getAllScrapers } from './index';
import { upsertPuzzles } from '@/lib/services/puzzleDb';

export interface SyncStoreResult {
  storeId: string;
  storeName: string;
  itemCount: number;
  pagesScraped: number;
  error?: string;
}

export interface SyncSummary {
  timestamp: number;
  totalPuzzlesSynced: number;
  storeResults: SyncStoreResult[];
  durationMs: number;
}

/**
 * Scrapes the complete product catalog across all enabled store scrapers
 * in parallel and incrementally upserts each page batch into Firestore.
 */
export async function syncAllStorePuzzles(): Promise<SyncSummary> {
  const startTime = Date.now();
  const scrapers = getAllScrapers();
  const storeResults: SyncStoreResult[] = [];
  let totalPuzzlesSynced = 0;

  // Run stores in parallel to maximize throughput
  const storePromises = scrapers.map(async (scraper) => {
    const storeId = scraper.storeInfo.id;
    const storeName = scraper.storeInfo.name;
    let pageCount = 0;
    let storeTotalSynced = 0;
    const limit = 60;
    let offset = 0;
    let hasMore = true;
    let storeError: string | undefined = undefined;

    console.log(`Starting full catalog sync for store: ${storeName} (${storeId})...`);

    while (hasMore && pageCount < 40) {
      try {
        const result = await scraper.scrape({ offset, limit });
        pageCount++;

        if (result.error) {
          storeError = result.error;
          console.warn(`Scraper error for ${storeName} page ${pageCount}:`, result.error);
          break;
        }

        if (!result.items || result.items.length === 0) {
          hasMore = false;
          break;
        }

        // Upsert immediately per page batch to guarantee persistence even if stopped
        const { updatedCount } = await upsertPuzzles(result.items);
        storeTotalSynced += updatedCount;

        hasMore = result.hasMore && result.items.length > 0;
        offset += limit;

        // Small polite delay between requests
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (err: any) {
        storeError = err.message || 'Scraping virhe';
        console.error(`Unexpected scraping error for ${storeName} page ${pageCount}:`, err);
        break;
      }
    }

    return {
      storeId,
      storeName,
      itemCount: storeTotalSynced,
      pagesScraped: pageCount,
      error: storeError,
    };
  });

  const results = await Promise.all(storePromises);
  for (const r of results) {
    storeResults.push(r);
    totalPuzzlesSynced += r.itemCount;
  }

  const durationMs = Date.now() - startTime;
  console.log(`Full catalog sync finished in ${durationMs}ms. Total puzzles synced: ${totalPuzzlesSynced}.`);

  return {
    timestamp: startTime,
    totalPuzzlesSynced,
    storeResults,
    durationMs,
  };
}
