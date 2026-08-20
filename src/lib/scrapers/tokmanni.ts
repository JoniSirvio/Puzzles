import { PuzzleScraper } from './base';
import { Puzzle, ScrapeOptions, ScrapeResult, StoreInfo } from './types';

export const TOKMANNI_STORE_INFO: StoreInfo = {
  id: 'tokmanni',
  name: 'Tokmanni',
  url: 'https://www.tokmanni.fi/lelut-ja-lastentarvikkeet/lelut/lauta-ja-palapelit/aikuisten-palapelit',
  enabled: true,
  description: 'Tokmanni aikuisten palapelit',
};

export class TokmanniScraper implements PuzzleScraper {
  readonly storeInfo = TOKMANNI_STORE_INFO;

  async scrape(options?: ScrapeOptions): Promise<ScrapeResult> {
    const limit = options?.limit || 60;
    const offset = options?.offset || 0;

    try {
      // Calculate Magento page number
      const page = Math.floor(offset / limit) + 1;
      const targetUrl =
        page > 1
          ? `${this.storeInfo.url}?p=${page}`
          : this.storeInfo.url;

      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        throw new Error(`Tokmanni API vastasi virheellä: ${res.status}`);
      }

      const html = await res.text();

      // Extract dlObjects JSON array embedded in HTML script
      const dlObjectsMatch = html.match(/var dlObjects\s*=\s*(\[[\s\S]*?\]);\s*for/);
      if (!dlObjectsMatch) {
        throw new Error('Tokmanni sivuston dataa ei voitu jäsentää');
      }

      const dlObjects = JSON.parse(dlObjectsMatch[1]);
      const ecommerceObj = dlObjects.find((o: any) => o.ecommerce && o.ecommerce.impressions);
      const impressions: any[] = ecommerceObj?.ecommerce?.impressions || [];

      // Build product URL map from HTML card links
      const productUrlMap: Record<string, string> = {};
      const linkMatches = [...html.matchAll(/href="(https:\/\/www\.tokmanni\.fi\/[^"]+-(\d{8,14}))"/gi)];
      for (const m of linkMatches) {
        const url = m[1];
        const ean = m[2];
        productUrlMap[ean] = url;
      }

      let items: Puzzle[] = impressions.map((item) => {
        const ean = item.id;
        const title = item.name || 'Palapeli';
        const price = parseFloat(item.price || '0');
        const brand = item.brand || undefined;

        // Extract piece count via regex
        let pieceCount: number | undefined = undefined;
        const pieceMatch = title.match(/(\d+)\s*(?:palaa|palainen|palan|piece)/i);
        if (pieceMatch) {
          const parsed = parseInt(pieceMatch[1], 10);
          if (!isNaN(parsed) && parsed > 0 && parsed <= 50000) {
            pieceCount = parsed;
          }
        }

        // Product URL
        const productUrl =
          productUrlMap[ean] ||
          `https://www.tokmanni.fi/palapeli-${ean}`;

        // High-res Cloudinary CDN Image URL
        const imageUrl = `https://res.cloudinary.com/tokmanni/image/upload/c_pad,b_white,f_auto,h_800,w_800/d_default.png/${ean}.png`;

        return {
          id: `tokmanni-${ean}`,
          title,
          price,
          currency: 'EUR',
          imageUrl,
          productUrl,
          brand,
          pieceCount,
          sourceStore: {
            id: this.storeInfo.id,
            name: this.storeInfo.name,
          },
          ean,
          inStock: true,
        };
      });

      // Filter by search query if provided
      if (options?.search) {
        const q = options.search.toLowerCase().trim();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            (item.brand && item.brand.toLowerCase().includes(q)) ||
            (item.pieceCount && item.pieceCount.toString().includes(q))
        );
      }

      // Filter by pieceCount range if provided
      if (options?.pieceCount) {
        const pFilter = options.pieceCount;
        items = items.filter((item) => {
          if (!item.pieceCount) return false;
          if (pFilter === '500') return item.pieceCount >= 400 && item.pieceCount <= 750;
          if (pFilter === '1000') return item.pieceCount >= 751 && item.pieceCount <= 1250;
          if (pFilter === '1500+') return item.pieceCount > 1250;
          return true;
        });
      }

      return {
        items,
        total: impressions.length >= limit ? 120 : offset + items.length,
        offset,
        limit,
        hasMore: impressions.length === limit,
        storeId: this.storeInfo.id,
        storeName: this.storeInfo.name,
      };
    } catch (err: any) {
      console.error('TokmanniScraper virhe:', err);
      return {
        items: [],
        total: 0,
        offset,
        limit,
        hasMore: false,
        storeId: this.storeInfo.id,
        storeName: this.storeInfo.name,
        error: err.message || 'Haku epäonnistui kaupasta Tokmanni',
      };
    }
  }
}
