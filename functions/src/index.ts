import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

/**
 * Scheduled Cloud Function that runs every day at 09:00 AM Europe/Helsinki.
 * Triggers the full catalog scraper endpoint to update Firestore product data.
 */
export const dailyPuzzleScrape = onSchedule(
  {
    schedule: '0 9 * * *',
    timeZone: 'Europe/Helsinki',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async () => {
    logger.info('Käynnistetään päivittäinen palapelihaku klo 09:00 (Europe/Helsinki)...');

    const appHost = process.env.CRON_ENDPOINT_URL || 'https://puzzles-ccfee.web.app/api/cron/scrape';
    const secret = process.env.CRON_SECRET || '';

    try {
      const response = await fetch(appHost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': secret,
        },
      });

      const data = await response.json();
      logger.info('Päivittäinen palapelihaku suoritettu:', data);
    } catch (err) {
      logger.error('Virhe päivittäisessä palapelihaussa:', err);
    }
  }
);
