import { NextResponse } from "next/server";
import { getScraper, runScrape } from "../../../../lib/scrapers/run-scrape";

export const dynamic = "force-dynamic";

const scraper = getScraper("tuas");

export async function GET() {
  const result = await runScrape(scraper);

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
