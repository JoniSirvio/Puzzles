import { getAllScrapers } from './index';
import { Puzzle } from './types';
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
 * and batch updates/upserts the results into the Firestore 'puzzles' collection.
 */
export async function syncAllStorePuzzles(): Promise<SyncSummary> {
  const startTime = Date.now();
  const scrapers = getAllScrapers();
  const storeResults: SyncStoreResult[] = [];
  let totalPuzzlesSynced = 0;

  for (const scraper of scrapers) {
    const storeId = scraper.storeInfo.id;
    const storeName = scraper.storeInfo.name;
    let pageCount = 0;
    let storeItems: Puzzle[] = [];
    const limit = 60;
    let offset = 0;
    let hasMore = true;
    let storeError: string | undefined = undefined;

    console.log(`Starting full catalog sync for store: ${storeName} (${storeId})...`);

    // Loop through pages until no more items are returned
    while (hasMore && pageCount < 50) {
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

        storeItems.push(...result.items);
        hasMore = result.hasMore && result.items.length > 0;
        offset += limit;

        // Polite delay between page fetches to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err: any) {
        storeError = err.message || 'Scraping virhe';
        console.error(`Unexpected scraping error for ${storeName} page ${pageCount}:`, err);
        break;
      }
    }

    // Deduplicate items by product ID
    const uniqueItemsMap = new Map<string, Puzzle>();
    for (const item of storeItems) {
      if (item.id) {
        uniqueItemsMap.set(item.id, item);
      }
    }
    const uniqueItems = Array.from(uniqueItemsMap.values());

    // Batch upsert to Firestore
    if (uniqueItems.length > 0) {
      try {
        const { updatedCount } = await upsertPuzzles(uniqueItems);
        totalPuzzlesSynced += updatedCount;
        console.log(`Successfully synced ${updatedCount} puzzles for ${storeName}.`);
      } catch (dbErr: any) {
        storeError = dbErr.message || 'Tietokannan tallennusvirhe';
        console.error(`Database save error for ${storeName}:`, dbErr);
      }
    }

    storeResults.push({
      storeId,
      storeName,
      itemCount: uniqueItems.length,
      pagesScraped: pageCount,
      error: storeError,
    });
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
