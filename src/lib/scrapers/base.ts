import { ScrapeOptions, ScrapeResult, StoreInfo } from './types';

export interface PuzzleScraper {
  storeInfo: StoreInfo;
  scrape(options?: ScrapeOptions): Promise<ScrapeResult>;
}
