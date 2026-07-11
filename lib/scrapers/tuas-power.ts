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

const TUAS_POWER_URL = "https://www.savewithtuas.com/business/our-business-plans/";

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function htmlToText(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n"),
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function todayDate() {
  return new Date().toLocaleDateString("en-CA");
}

type BusinessUsageBand = {
  label: "< 4 MWh" | ">= 4 MWh";
  startMarker: string;
  nextSectionMarker?: string;
};

const businessUsageBands: BusinessUsageBand[] = [
  {
    label: "< 4 MWh",
    startMarker: "cam_ppb_container_12",
    nextSectionMarker: "cam_ppb_container_22",
  },
  {
    label: ">= 4 MWh",
    startMarker: "cam_ppb_container_22",
  },
];

function extractBusinessSection(html: string, band: BusinessUsageBand) {
  const { label, startMarker, nextSectionMarker } = band;
  const startIndex = html.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(`Could not find the Tuas Power ${label} business plan section.`);
  }

  const endIndex = nextSectionMarker
    ? html.indexOf(nextSectionMarker, startIndex + startMarker.length)
    : -1;

  return html.slice(startIndex, endIndex === -1 ? undefined : endIndex);
}

function parseBusinessSection(params: {
  sectionText: string;
  usageBand: BusinessUsageBand["label"];
  now: string;
  priceDate: string;
}): ScrapedWebsitePrice[] {
  const { sectionText, usageBand, now, priceDate } = params;
  const planPattern =
    /PowerPAK\s+(\d+)\s+(\d+)\s+Months\s+Fixed Rate\s+\(GST inclusive\)\s+([0-9.]+)¢\s+\/kWh\s+Market Development and Systems Charge\s+\(MDSC\)\s+([0-9.]+)\s+¢\/kWh\s+\(GST inclusive\)\s+Carbon Tax\s+([0-9.]+)\s+¢\/kWh\s+\(GST inclusive\)/gi;

  return Array.from(sectionText.matchAll(planPattern)).map((match) => {
    const planNumber = Number(match[1]);
    const contractMonths = Number(match[2]);
    const centsPerKwh = Number(match[3]);
    const mdscCentsPerKwh = Number(match[4]);
    const carbonTaxCentsPerKwh = Number(match[5]);
    const rate = Number((centsPerKwh / 100).toFixed(4));
    const thirdPartyCharge = Number(((mdscCentsPerKwh + carbonTaxCentsPerKwh) / 100).toFixed(4));
    const effectiveRate = Number((rate + thirdPartyCharge).toFixed(4));

    return {
      company_id: "tuas",
      plan_name: `PowerPAK ${planNumber} (${usageBand})`,
      plan_type: "Fixed",
      contract_months: contractMonths,
      rate,
      gst_status: "included",
      third_party_charge: thirdPartyCharge,
      effective_rate: effectiveRate,
      source_url: TUAS_POWER_URL,
      notes: `Business plan for ${usageBand}. Fixed rate scraped as ${centsPerKwh} c/kWh GST inclusive. MDSC: ${mdscCentsPerKwh} c/kWh GST inclusive. Carbon tax: ${carbonTaxCentsPerKwh} c/kWh GST inclusive.`,
      price_date: priceDate,
      updated_at: now,
    };
  });
}

export async function scrapeTuasPowerWebsitePrices(): Promise<ScrapedWebsitePrice[]> {
  const response = await fetch(TUAS_POWER_URL, {
    cache: "no-store",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; TuasPowerDashboardBot/0.1; +https://www.savewithtuas.com/)",
    },
  });

  if (!response.ok) {
    throw new Error(`Tuas Power page returned ${response.status}`);
  }

  const html = await response.text();
  const now = new Date().toISOString();
  const priceDate = todayDate();
  const prices: ScrapedWebsitePrice[] = businessUsageBands.flatMap((band) =>
    parseBusinessSection({
      sectionText: htmlToText(extractBusinessSection(html, band)),
      usageBand: band.label,
      now,
      priceDate,
    }),
  );

  if (prices.length === 0) {
    throw new Error("Could not extract any Tuas Power business plan prices from the page.");
  }

  return prices;
}
