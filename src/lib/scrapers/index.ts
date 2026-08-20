import { PuzzleScraper } from './base';
import { KARKKAINEN_STORE_INFO, KarkkainenScraper } from './karkkainen';
import { SUOMALAINEN_STORE_INFO, SuomalainenScraper } from './suomalainen';
import { TOKMANNI_STORE_INFO, TokmanniScraper } from './tokmanni';
import { StoreInfo } from './types';

export const SUPPORTED_STORES: StoreInfo[] = [
  KARKKAINEN_STORE_INFO,
  SUOMALAINEN_STORE_INFO,
  TOKMANNI_STORE_INFO,
  {
    id: 'prisma',
    name: 'Prisma',
    url: 'https://www.prisma.fi',
    enabled: false,
    description: 'Tulossa pian (Phase 2)',
  },
  {
    id: 'lautapelit',
    name: 'Lautapelit.fi',
    url: 'https://www.lautapelit.fi',
    enabled: false,
    description: 'Tulossa pian (Phase 2)',
  },
];

const scrapersMap: Record<string, PuzzleScraper> = {
  karkkainen: new KarkkainenScraper(),
  suomalainen: new SuomalainenScraper(),
  tokmanni: new TokmanniScraper(),
};

export function getScraper(storeId: string): PuzzleScraper | null {
  return scrapersMap[storeId] || null;
}

export function getAllScrapers(): PuzzleScraper[] {
  return Object.values(scrapersMap);
}
