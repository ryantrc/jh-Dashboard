import { NextResponse } from "next/server";
import { runScrape, scrapers } from "../../../../lib/scrapers/run-scrape";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Run every scraper concurrently. runScrape never throws: each retailer
  // reports its own success/failure and logs its own scrape_runs row, so one
  // broken website never blocks the others.
  const results = await Promise.all(scrapers.map((scraper) => runScrape(scraper)));
  const failedCount = results.filter((result) => !result.ok).length;

  return NextResponse.json(
    {
      ok: failedCount === 0,
      scrapers_run: results.length,
      scrapers_failed: failedCount,
      results: results.map(({ prices: _prices, ...summary }) => summary),
    },
    { status: failedCount === 0 ? 200 : 500 },
  );
}
