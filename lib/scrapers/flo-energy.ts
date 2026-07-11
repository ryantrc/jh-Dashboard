type FloPropositionPrice = {
  price: number;
  priceComponentType: string;
};

type FloProposition = {
  description: string;
  reference: string;
  pricingType: string;
  duration: number;
  startDate: string;
  customerSegment: string;
  acquisitionType: string;
  propositionPrices: FloPropositionPrice[];
};

export type ScrapedFloWebsitePrice = {
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

const FLO_ENERGY_URL = "https://floenergy.sg/business/priceplan";
const GST_RATE = 1.09;

function todayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function extractNextData(html: string) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );

  if (!match) {
    throw new Error("Could not find Flo Energy page data.");
  }

  return JSON.parse(match[1]) as {
    props?: {
      pageProps?: {
        allWebsiteActivePropositions?: FloProposition[];
      };
    };
  };
}

function getLatestNewBusinessPropositions(propositions: FloProposition[]) {
  const latestByDuration = new Map<number, FloProposition>();

  for (const proposition of propositions) {
    if (
      proposition.customerSegment !== "Business" ||
      proposition.acquisitionType !== "New" ||
      proposition.pricingType !== "Fixed"
    ) {
      continue;
    }

    const current = latestByDuration.get(proposition.duration);

    if (!current || proposition.startDate > current.startDate) {
      latestByDuration.set(proposition.duration, proposition);
    }
  }

  return Array.from(latestByDuration.values()).sort((a, b) => b.duration - a.duration);
}

function sumPriceComponents(proposition: FloProposition) {
  return proposition.propositionPrices.reduce((sum, component) => sum + component.price, 0);
}

export async function scrapeFloEnergyWebsitePrices(): Promise<ScrapedFloWebsitePrice[]> {
  const response = await fetch(FLO_ENERGY_URL, {
    cache: "no-store",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; ElectricityRatesDashboardBot/0.1; +https://floenergy.sg/)",
    },
  });

  if (!response.ok) {
    throw new Error(`Flo Energy page returned ${response.status}`);
  }

  const html = await response.text();
  const pageData = extractNextData(html);
  const propositions = pageData.props?.pageProps?.allWebsiteActivePropositions ?? [];
  const selectedPropositions = getLatestNewBusinessPropositions(propositions);
  const now = new Date().toISOString();
  const priceDate = todayDate();

  const prices: ScrapedFloWebsitePrice[] = selectedPropositions.map((proposition) => {
    const beforeGstRate = Number(sumPriceComponents(proposition).toFixed(4));
    const gstInclusiveRate = Number((beforeGstRate * GST_RATE).toFixed(4));

    return {
      company_id: "flo",
      plan_name: proposition.description,
      plan_type: "Fixed",
      contract_months: proposition.duration,
      rate: gstInclusiveRate,
      gst_status: "included",
      third_party_charge: 0,
      effective_rate: gstInclusiveRate,
      source_url: FLO_ENERGY_URL,
      notes: `Business new customer fixed plan. Website lists ${Number(
        (beforeGstRate * 100).toFixed(2),
      )} c/kWh before GST and ${Number((gstInclusiveRate * 100).toFixed(2))} c/kWh GST inclusive. Reference: ${proposition.reference}.`,
      price_date: priceDate,
      updated_at: now,
    };
  });

  if (prices.length === 0) {
    throw new Error("Could not extract any Flo Energy business plan prices from the page.");
  }

  return prices;
}
