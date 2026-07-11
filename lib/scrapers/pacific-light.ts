export type ScrapedPacificLightWebsitePrice = {
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

const PACIFIC_LIGHT_URL = "https://www.pacificlight.com.sg/business/low-tension-plans";

function todayDate() {
  return new Date().toLocaleDateString("en-CA");
}

export async function scrapePacificLightWebsitePrices(): Promise<
  ScrapedPacificLightWebsitePrice[]
> {
  const response = await fetch(PACIFIC_LIGHT_URL, {
    cache: "no-store",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; ElectricityRatesDashboardBot/0.1; +https://www.pacificlight.com.sg/)",
    },
  });

  if (!response.ok) {
    throw new Error(`Pacific Light page returned ${response.status}`);
  }

  const html = await response.text();
  const now = new Date().toISOString();
  const priceDate = todayDate();
  const planPattern =
    /Budget Planner (\d+)<\/h3>\s*<p[^>]*>(\d+)\s*Months<\/p>\s*<h3[^>]*>([0-9.]+)<\/h3>\s*<p[^>]*>[^<]*kWh<\/p>/gi;

  const prices: ScrapedPacificLightWebsitePrice[] = Array.from(html.matchAll(planPattern)).map(
    (match) => {
      const planNumber = match[1];
      const contractMonths = Number(match[2]);
      const centsPerKwh = Number(match[3]);
      const rate = Number((centsPerKwh / 100).toFixed(4));

      return {
        company_id: "pacific-light",
        plan_name: `Budget Planner ${planNumber}`,
        plan_type: "Fixed",
        contract_months: contractMonths,
        rate,
        gst_status: "included",
        third_party_charge: 0,
        effective_rate: rate,
        source_url: PACIFIC_LIGHT_URL,
        notes: `Business low tension fixed rate plan. Website lists ${centsPerKwh} c/kWh, inclusive of GST and applicable third-party charges.`,
        price_date: priceDate,
        updated_at: now,
      };
    },
  );

  if (prices.length === 0) {
    throw new Error("Could not extract any Pacific Light business plan prices from the page.");
  }

  return prices;
}
