import { NextResponse } from "next/server";
import { scrapeGenecoWebsitePrices } from "../../../../lib/scrapers/geneco";
import { createSupabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

async function recordScrapeRun(params: {
  status: "success" | "failed";
  startedAt: string;
  finishedAt: string;
  pricesFound: number;
  errorMessage?: string;
}) {
  const supabase = createSupabaseAdmin();

  await supabase.from("scrape_runs").insert({
    id: Date.now(),
    company_id: "geneco",
    status: params.status,
    started_at: params.startedAt,
    finished_at: params.finishedAt,
    prices_found: params.pricesFound,
    error_message: params.errorMessage ?? null,
    notes: "Geneco website price scrape",
  });
}

export async function GET() {
  const startedAt = new Date().toISOString();

  try {
    const supabase = createSupabaseAdmin();
    const prices = await scrapeGenecoWebsitePrices();

    const { error: deleteError } = await supabase
      .from("website_prices")
      .delete()
      .eq("company_id", "geneco");

    if (deleteError) {
      throw new Error(`Could not replace existing Geneco rows: ${deleteError.message}`);
    }

    const rowIdBase = Date.now();
    const rows = prices.map((price, index) => ({
      id: rowIdBase + index,
      ...price,
    }));

    const { error: insertError } = await supabase.from("website_prices").insert(rows);

    if (insertError) {
      throw new Error(`Could not insert Geneco rows: ${insertError.message}`);
    }

    const finishedAt = new Date().toISOString();
    await recordScrapeRun({
      status: "success",
      startedAt,
      finishedAt,
      pricesFound: prices.length,
    });

    return NextResponse.json({
      ok: true,
      company_id: "geneco",
      prices_found: prices.length,
      prices,
    });
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Unknown scrape error";

    try {
      await recordScrapeRun({
        status: "failed",
        startedAt,
        finishedAt,
        pricesFound: 0,
        errorMessage: message,
      });
    } catch {
      // If admin credentials are missing, returning the original scrape error is clearer.
    }

    return NextResponse.json(
      {
        ok: false,
        company_id: "geneco",
        error: message,
      },
      { status: 500 },
    );
  }
}
