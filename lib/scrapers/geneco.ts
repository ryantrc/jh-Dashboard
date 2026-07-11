type GenecoRateArg = {
  PlanName: string;
  ContractDate: string;
  RateReference: string;
  PlanCode: string;
};

type GenecoRateResult = {
  PlanCode: string;
  RateReference: string;
  Rate: number;
  GSTRate: number | null;
};

type GenecoObj = {
  b2bRatesData?: {
    args?: GenecoRateArg[];
    data?: {
      Success?: boolean;
      Result?: GenecoRateResult[];
    };
  };
};

export type ScrapedGenecoWebsitePrice = {
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

const GENECO_URL = "https://geneco.sg/business/";
const DEFAULT_GST_RATE = 1.09;

function todayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function extractGenecoObj(html: string): GenecoObj {
  const marker = "var genecoObj = ";
  const markerIndex = html.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error("Could not find Geneco plan data.");
  }

  const start = html.indexOf("{", markerIndex);

  if (start === -1) {
    throw new Error("Could not find the start of Geneco plan data.");
  }

  let depth = 0;
  let end = -1;

  for (let i = start; i < html.length; i += 1) {
    const char = html[i];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error("Could not parse Geneco plan data.");
  }

  return JSON.parse(html.slice(start, end)) as GenecoObj;
}

function getContractMonths(planName: string) {
  const match = planName.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export async function scrapeGenecoWebsitePrices(): Promise<ScrapedGenecoWebsitePrice[]> {
  const response = await fetch(GENECO_URL, {
    cache: "no-store",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; ElectricityRatesDashboardBot/0.1; +https://geneco.sg/)",
    },
  });

  if (!response.ok) {
    throw new Error(`Geneco page returned ${response.status}`);
  }

  const html = await response.text();
  const genecoObj = extractGenecoObj(html);
  const b2bRatesData = genecoObj.b2bRatesData;

  if (!b2bRatesData?.data?.Success) {
    throw new Error("Geneco business rate data was not successful.");
  }

  const args = b2bRatesData.args ?? [];
  const results = b2bRatesData.data.Result ?? [];
  const planNameByReference = new Map(args.map((arg) => [arg.RateReference, arg.PlanName]));
  const now = new Date().toISOString();
  const priceDate = todayDate();

  const prices: ScrapedGenecoWebsitePrice[] = results.map((result) => {
    const planName = planNameByReference.get(result.RateReference) ?? result.RateReference;
    const gstRate = result.GSTRate ?? DEFAULT_GST_RATE;
    const beforeGstRate = Number(result.Rate.toFixed(4));
    const gstInclusiveRate = Number((beforeGstRate * gstRate).toFixed(4));

    return {
      company_id: "geneco",
      plan_name: planName,
      plan_type: "Fixed",
      contract_months: getContractMonths(planName),
      rate: gstInclusiveRate,
      gst_status: "included",
      third_party_charge: 0,
      effective_rate: gstInclusiveRate,
      source_url: GENECO_URL,
      notes: `Business fixed rate plan. Website lists ${Number(
        (beforeGstRate * 100).toFixed(2),
      )} c/kWh before GST and ${Number(
        (gstInclusiveRate * 100).toFixed(2),
      )} c/kWh GST inclusive. Reference: ${result.RateReference}.`,
      price_date: priceDate,
      updated_at: now,
    };
  });

  if (prices.length === 0) {
    throw new Error("Could not extract any Geneco business plan prices from the page.");
  }

  return prices;
}
