import { PuzzleScraper } from './base';
import { KARKKAINEN_STORE_INFO, KarkkainenScraper } from './karkkainen';
import { StoreInfo } from './types';

export const SUPPORTED_STORES: StoreInfo[] = [
  KARKKAINEN_STORE_INFO,
  {
    id: 'suomalainen',
    name: 'Suomalainen Kirjakauppa',
    url: 'https://www.suomalainen.com',
    enabled: false,
    description: 'Tulossa pian (Phase 2)',
  },
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
};

export function getScraper(storeId: string): PuzzleScraper | null {
  return scrapersMap[storeId] || null;
}

export function getAllScrapers(): PuzzleScraper[] {
  return Object.values(scrapersMap);
}
