import { createSupabaseAdmin } from "../supabase-admin";
import { scrapeFloEnergyWebsitePrices } from "./flo-energy";
import { scrapeGenecoWebsitePrices } from "./geneco";
import { scrapePacificLightWebsitePrices } from "./pacific-light";
import { scrapeTuasPowerWebsitePrices } from "./tuas-power";

export type ScrapedWebsitePrice = {
  company_id: string;
  plan_name: string;
  plan_type: string;
  contract_months: number;
  rate: number;
  gst_status: "included" | "excluded" | "unknown";
  third_party_charge: number;
  effective_rate: number;
  source_url: string;
  notes: string;
  price_date: string;
  updated_at: string;
};

export type ScraperDefinition = {
  companyId: string;
  notes: string;
  scrape: () => Promise<ScrapedWebsitePrice[]>;
};

export const scrapers: ScraperDefinition[] = [
  {
    companyId: "tuas",
    notes: "Tuas Power website price scrape",
    scrape: scrapeTuasPowerWebsitePrices,
  },
  {
    companyId: "flo",
    notes: "Flo Energy website price scrape",
    scrape: scrapeFloEnergyWebsitePrices,
  },
  {
    companyId: "pacific-light",
    notes: "Pacific Light website price scrape",
    scrape: scrapePacificLightWebsitePrices,
  },
  {
    companyId: "geneco",
    notes: "Geneco website price scrape",
    scrape: scrapeGenecoWebsitePrices,
  },
];

export function getScraper(companyId: string): ScraperDefinition {
  const scraper = scrapers.find((entry) => entry.companyId === companyId);

  if (!scraper) {
    throw new Error(`No scraper registered for company "${companyId}".`);
  }

  return scraper;
}

export type ScrapeRunResult = {
  ok: boolean;
  company_id: string;
  prices_found: number;
  prices?: ScrapedWebsitePrice[];
  error?: string;
};

async function recordScrapeRun(params: {
  companyId: string;
  companySlot: number;
  notes: string;
  status: "success" | "failed";
  startedAt: string;
  finishedAt: string;
  pricesFound: number;
  errorMessage?: string;
}) {
  const supabase = createSupabaseAdmin();

  // Scrapers can finish in the same millisecond when run concurrently, so a
  // plain Date.now() id could collide. Spacing by company slot keeps ids unique.
  await supabase.from("scrape_runs").insert({
    id: Date.now() * 10 + params.companySlot,
    company_id: params.companyId,
    status: params.status,
    started_at: params.startedAt,
    finished_at: params.finishedAt,
    prices_found: params.pricesFound,
    error_message: params.errorMessage ?? null,
    notes: params.notes,
  });
}

export async function runScrape(definition: ScraperDefinition): Promise<ScrapeRunResult> {
  const startedAt = new Date().toISOString();
  const companySlot = Math.max(scrapers.indexOf(definition), 0);

  try {
    const supabase = createSupabaseAdmin();
    const prices = await definition.scrape();

    const { error: deleteError } = await supabase
      .from("website_prices")
      .delete()
      .eq("company_id", definition.companyId);

    if (deleteError) {
      throw new Error(
        `Could not replace existing ${definition.companyId} rows: ${deleteError.message}`,
      );
    }

    // Same collision guard as scrape_runs: leave room for up to 100 rows per
    // company so concurrent scrapers never generate overlapping ids.
    const rowIdBase = Date.now() * 1000 + companySlot * 100;
    const rows = prices.map((price, index) => ({
      id: rowIdBase + index,
      ...price,
    }));

    const { error: insertError } = await supabase.from("website_prices").insert(rows);

    if (insertError) {
      throw new Error(`Could not insert ${definition.companyId} rows: ${insertError.message}`);
    }

    const finishedAt = new Date().toISOString();
    await recordScrapeRun({
      companyId: definition.companyId,
      companySlot,
      notes: definition.notes,
      status: "success",
      startedAt,
      finishedAt,
      pricesFound: prices.length,
    });

    return {
      ok: true,
      company_id: definition.companyId,
      prices_found: prices.length,
      prices,
    };
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Unknown scrape error";

    try {
      await recordScrapeRun({
        companyId: definition.companyId,
        companySlot,
        notes: definition.notes,
        status: "failed",
        startedAt,
        finishedAt,
        pricesFound: 0,
        errorMessage: message,
      });
    } catch {
      // If admin credentials are missing, returning the original scrape error is clearer.
    }

    return {
      ok: false,
      company_id: definition.companyId,
      prices_found: 0,
      error: message,
    };
  }
}
