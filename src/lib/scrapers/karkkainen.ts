import { PuzzleScraper } from './base';
import { Puzzle, ScrapeOptions, ScrapeResult, StoreInfo } from './types';

export const KARKKAINEN_STORE_INFO: StoreInfo = {
  id: 'karkkainen',
  name: 'Kärkkäinen',
  url: 'https://www.karkkainen.com/verkkokauppa/palapelit',
  enabled: true,
  description: 'Suomalainen tavaratalon verkkokauppa laajalla palapelivalikoimalla.',
};

export class KarkkainenScraper implements PuzzleScraper {
  storeInfo = KARKKAINEN_STORE_INFO;

  async scrape(options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const offset = options.offset || 0;
    const limit = options.limit || 60;
    const search = options.search?.trim();
    const pieceCount = options.pieceCount;

    const params = new URLSearchParams();
    if (offset > 0) params.set('offset', offset.toString());

    // Use native searchTerm if search text is provided, or if pieceCount is provided without search
    if (search) {
      params.set('searchTerm', search);
    } else if (pieceCount) {
      const term = pieceCount === '1500+' ? '1500' : pieceCount;
      params.set('searchTerm', term);
    }

    const baseUrl = 'https://www.karkkainen.com/verkkokauppa/palapelit';
    const targetUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes in Next.js
      });

      if (!response.ok) {
        throw new Error(`Kärkkäinen server returned status ${response.status}`);
      }

      const html = await response.text();
      const match = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
      );

      if (!match) {
        throw new Error('Could not find __NEXT_DATA__ script tag in Kärkkäinen HTML');
      }

      const data = JSON.parse(match[1]);
      const fallback = data.props?.pageProps?.fallback || {};

      let contents: any[] = [];
      let total = 0;

      for (const key of Object.keys(fallback)) {
        if (key.includes('Product_LISTING')) {
          contents = fallback[key].contents || [];
          total = fallback[key].total || contents.length;
          break;
        }
      }

      const items: Puzzle[] = contents.map((item: any) => {
        // Extract high quality image URL (800x800 sharp image)
        let imageUrl = item.thumbnail || '';
        if (imageUrl) {
          if (/\/c_pad[^/]+\//.test(imageUrl)) {
            imageUrl = imageUrl.replace(/\/c_pad[^/]+\//, '/c_pad,f_auto,h_800,q_auto,w_800/');
          } else {
            imageUrl = imageUrl
              .replace(/([%2C,_])h_\d+/gi, '$1h_800')
              .replace(/([%2C,_])w_\d+/gi, '$1w_800');
          }
        }

        // Find piece count accurately
        let pieceCount: number | undefined;
        
        // 1. Try exact kpl attribute
        const exactPieceAttr = item.attributes?.find(
          (a: any) =>
            a.id === 'Palapelin palojen määrä kpl' ||
            a.name === 'Palapelin palojen määrä kpl'
        );
        if (exactPieceAttr && exactPieceAttr.values?.[0]?.value) {
          const val = parseInt(exactPieceAttr.values[0].value.replace(/\D/g, ''), 10);
          if (!isNaN(val) && val > 0) pieceCount = val;
        }

        // 2. Try title match (e.g. 1000p, 1000 palaa)
        if (!pieceCount && item.name) {
          const titleMatch = item.name.match(/(\d+)\s*(palaa|palan|pala|p\b)/i);
          if (titleMatch) {
            const val = parseInt(titleMatch[1], 10);
            if (!isNaN(val) && val > 0) pieceCount = val;
          }
        }

        // 3. Fallback to range attribute (e.g. 1000-1999 -> 1000)
        if (!pieceCount) {
          const rangeAttr = item.attributes?.find(
            (a: any) =>
              a.id === 'Palapelin palojen määrä' ||
              a.name === 'Palapelin palojen määrä'
          );
          if (rangeAttr && rangeAttr.values?.[0]?.value) {
            const rangeMatch = rangeAttr.values[0].value.match(/^(\d+)/);
            if (rangeMatch) {
              const val = parseInt(rangeMatch[1], 10);
              if (!isNaN(val) && val > 0) pieceCount = val;
            }
          }
        }

        // Extract Brand / Manufacturer
        let brand: string | undefined = item.manufacturer || item.brand;
        if (!brand) {
          const brandAttr = item.attributes?.find(
            (a: any) => a.name === 'Tuotemerkki' || a.id === 'Tuotemerkki'
          );
          if (brandAttr && brandAttr.values?.[0]?.value) {
            brand = brandAttr.values[0].value;
          }
        }

        // Extract Price
        let price = 0;
        if (Array.isArray(item.price) && item.price.length > 0) {
          price = typeof item.price[0].value === 'number' ? item.price[0].value : parseFloat(item.price[0].value) || 0;
        } else if (item.groupingProperties?.groupMinPriceValue) {
          price = parseFloat(item.groupingProperties.groupMinPriceValue) || 0;
        }

        // Extract EAN
        const eanAttr = item.attributes?.find(
          (a: any) => a.name === 'EAN' || a.id === 'EAN'
        );
        const ean = eanAttr?.values?.[0]?.value || undefined;

        // Construct product URL
        const href = item.seo?.href || '';
        const productUrl = href.startsWith('http')
          ? href
          : `https://www.karkkainen.com/verkkokauppa${href.startsWith('/') ? '' : '/'}${href}`;

        return {
          id: `karkkainen-${item.id || item.partNumber || Math.random().toString(36).substring(2, 9)}`,
          title: item.name || 'Palapeli',
          price,
          currency: 'EUR',
          imageUrl,
          productUrl,
          brand,
          pieceCount,
          ean,
          inStock: item.buyable !== false,
          sourceStore: {
            id: KARKKAINEN_STORE_INFO.id,
            name: KARKKAINEN_STORE_INFO.name,
          },
        };
      });

      return {
        items,
        total,
        offset,
        limit,
        hasMore: offset + items.length < total,
        storeId: KARKKAINEN_STORE_INFO.id,
        storeName: KARKKAINEN_STORE_INFO.name,
      };
    } catch (err: any) {
      console.error('KarkkainenScraper error:', err);
      return {
        items: [],
        total: 0,
        offset,
        limit,
        hasMore: false,
        storeId: KARKKAINEN_STORE_INFO.id,
        storeName: KARKKAINEN_STORE_INFO.name,
        error: err.message || 'Virhe ladattaessa tuotteita Kärkkäiseltä',
      };
    }
  }
}
