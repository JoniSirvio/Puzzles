export interface Puzzle {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  brand?: string;
  pieceCount?: number;
  ean?: string;
  inStock: boolean;
  sourceStore: {
    id: string;
    name: string;
  };
}

export interface ScrapeOptions {
  offset?: number;
  limit?: number;
  search?: string;
  category?: string;
  pieceCount?: string;
}

export interface ScrapeResult {
  items: Puzzle[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  storeId: string;
  storeName: string;
  error?: string;
}

export interface StoreInfo {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  description: string;
}
