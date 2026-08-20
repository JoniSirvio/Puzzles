# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS, Lucide Icons

## Users

Finnish jigsaw puzzle hobbyists, collectors, and gift shoppers looking to discover new puzzles, compare prices, and manage their personal puzzle collection across Finnish online stores.

## Product Purpose

Aggregates jigsaw puzzle listings from various Finnish e-commerce websites into a single unified, fast, high-resolution catalog interface. Helps users easily search, filter by piece count or price, jump to store purchase pages, and track owned or wished-for puzzles.

## Positioning

The dedicated Finnish puzzle discovery & aggregation portal featuring live store catalog scraping, normalized metadata (piece counts, brands, EUR prices), sharp high-resolution image delivery, and direct store links.

## Operating Context

Used on desktop and mobile web browsers when looking for new puzzle releases, comparing prices across Finnish retailers, checking exact piece counts, or managing personal collection lists.

## Capabilities and Constraints

### Phase 1 (Live)
- Live server-side catalog scraping from Kärkkäinen.com via Next.js `__NEXT_DATA__` JSON extraction.
- High-definition `800x800` image URL transformation.
- Fast search, piece-count detection, price sorting, and offset pagination (60 items per page).
- Responsive grid view with store purchase links.

### Phase 2 (Roadmap)
- Database integration (SQLite / Prisma) for collection state.
- Personal collection tracking ("Owned" / "Want to buy").
- Modular scraper adapters for additional Finnish stores (Suomalainen Kirjakauppa, Prisma, Lautapelit.fi).

## Brand Commitments

- **Name**: Puzzles
- **Tone**: Clean, modern, accessible, trustworthy, Finnish-first portal interface.
- **Visuals**: High-resolution imagery, clear piece-count badges, vibrant amber and slate visual hierarchy.

## Evidence on Hand

- Runnable Next.js App Router codebase at `/Users/jonisirvio/Desktop/Puzzles`.
- Verified live scraper engine parsing 2250+ products from Kärkkäinen.

## Product Principles

1. **Fast & Instant Discovery**: Render puzzle listings fast with zero heavy browser overhead.
2. **Visual Quality First**: High-resolution, sharp product imagery so users can inspect puzzle artwork clearly.
3. **Normalized Metadata**: Standardize piece counts, brands, and prices consistently across different store backends.
4. **Extensible Scraper Architecture**: Strategy pattern allowing new Finnish stores to be plugged in seamlessly.
