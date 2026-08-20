import { PuzzleScraper } from './base';
import { Puzzle, ScrapeOptions, ScrapeResult, StoreInfo } from './types';

export const SUOMALAINEN_STORE_INFO: StoreInfo = {
  id: 'suomalainen',
  name: 'Suomalainen Kirjakauppa',
  url: 'https://www.suomalainen.com/collections/palapelit',
  enabled: true,
  description: 'Suomalainen Kirjakauppa valikoima',
};

export class SuomalainenScraper implements PuzzleScraper {
  readonly storeInfo = SUOMALAINEN_STORE_INFO;

  async scrape(options?: ScrapeOptions): Promise<ScrapeResult> {
    const limit = options?.limit || 60;
    const offset = options?.offset || 0;

    try {
      // Calculate Shopify page parameter based on offset
      const page = Math.floor(offset / limit) + 1;

      // Shopify products.json API endpoint for palapelit collection
      const apiUrl = `https://www.suomalainen.com/collections/palapelit/products.json?page=${page}&limit=${limit}`;

      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        throw new Error(`Suomalainen Kirjakauppa API vastasi virheellä: ${res.status}`);
      }

      const data = await res.json();
      const shopifyProducts: any[] = data.products || [];

      let items: Puzzle[] = shopifyProducts.map((p) => this.parseShopifyProduct(p));

      // Filter out accessory items that are not actual puzzles (e.g. palapelimatto/liima)
      items = items.filter((item) => {
        const titleLower = item.title.toLowerCase();
        return !titleLower.includes('palapelimatto') && !titleLower.includes('palapeliliima');
      });

      return {
        items,
        total: shopifyProducts.length >= limit ? 250 : offset + items.length,
        offset,
        limit,
        hasMore: shopifyProducts.length === limit,
        storeId: this.storeInfo.id,
        storeName: this.storeInfo.name,
      };
    } catch (err: any) {
      console.error('SuomalainenScraper virhe:', err);
      return {
        items: [],
        total: 0,
        offset,
        limit,
        hasMore: false,
        storeId: this.storeInfo.id,
        storeName: this.storeInfo.name,
        error: err.message || 'Haku epäonnistui kaupasta Suomalainen Kirjakauppa',
      };
    }
  }

  private parseShopifyProduct(p: any): Puzzle {
    const mainVariant = p.variants && p.variants[0] ? p.variants[0] : {};
    const mainImage = p.images && p.images[0] ? p.images[0] : {};

    // Price parsing
    const priceNum = parseFloat(mainVariant.price || '0');

    // Title parsing
    const title = p.title || 'Palapeli';

    // Piece count parsing via regex
    let pieceCount: number | undefined = undefined;
    const pieceMatch = title.match(/(\d+)\s*(?:palaa|palainen|palan|piece)/i);
    if (pieceMatch) {
      const parsed = parseInt(pieceMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 50000) {
        pieceCount = parsed;
      }
    }

    // Product URL
    const productUrl = `https://www.suomalainen.com/products/${p.handle}`;

    // Brand / Vendor
    const brand = p.vendor && p.vendor !== 'Suomalainen.com' ? p.vendor : undefined;

    // EAN / SKU
    const ean = mainVariant.sku || undefined;

    // Image URL
    const imageUrl = mainImage.src || undefined;

    // Stock availability
    const inStock = mainVariant.available !== false;

    return {
      id: `suomalainen-${p.id}`,
      title,
      price: priceNum,
      currency: 'EUR',
      imageUrl: imageUrl || '',
      productUrl,
      brand,
      pieceCount,
      sourceStore: {
        id: this.storeInfo.id,
        name: this.storeInfo.name,
      },
      ean,
      inStock,
    };
  }
}
