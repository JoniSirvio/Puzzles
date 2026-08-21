import { NextRequest, NextResponse } from 'next/server';
import { syncAllStorePuzzles } from '@/lib/scrapers/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 minutes execution time for background catalog sync

export async function GET(request: NextRequest) {
  return handleCronScrape(request);
}

export async function POST(request: NextRequest) {
  return handleCronScrape(request);
}

async function handleCronScrape(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('x-cron-secret') || '';
  const expectedSecret = process.env.CRON_SECRET;

  // Protect execution in production if CRON_SECRET is configured
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Luvaton pyyntö: CRON_SECRET ei täsmää' },
      { status: 401 }
    );
  }

  try {
    console.log('Cron triggered: Starting full catalog sync to Firestore...');
    const summary = await syncAllStorePuzzles();

    return NextResponse.json({
      success: true,
      message: 'Palapelikatalogin päivitys suoritettu onnistuneesti',
      summary,
    });
  } catch (err: any) {
    console.error('Cron scrape virhe:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Tuntematon virhe palapelikatalogin päivityksessä',
      },
      { status: 500 }
    );
  }
}
