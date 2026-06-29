"use client";

import { useMemo, useState } from "react";

type DataSource = "base" | "manual";
type GstStatus = "included" | "excluded" | "unknown";

type Company = {
  id: string;
  name: string;
  isOwnCompany?: boolean;
};

type Quote = {
  id: string;
  source: DataSource;
  companyId: string;
  planName: string;
  planType: "Fixed" | "Discount Off Tariff" | "Promotional" | "Custom Quote";
  contractMonths: number;
  rate: number;
  gstStatus: GstStatus;
  thirdPartyCharge: number;
  effectiveRate: number;
  updatedAt: string;
  notes: string;
  quoteRange?: {
    min: number;
    max: number;
  };
};

const companies: Company[] = [
  { id: "geneco", name: "Geneco" },
  { id: "flo", name: "Flo Energy" },
  { id: "pacific-light", name: "Pacific Light" },
  { id: "senoko", name: "Senoko Energy" },
  { id: "tuas", name: "Tuas Power", isOwnCompany: true },
];

const quotes: Quote[] = [
  {
    id: "base-geneco-12",
    source: "base",
    companyId: "geneco",
    planName: "Get It Fixed 12",
    planType: "Fixed",
    contractMonths: 12,
    rate: 0.3018,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.3018,
    updatedAt: "2026-06-29",
    notes: "Sample website listed rate. Replace with scraped data later.",
  },
  {
    id: "base-geneco-24",
    source: "base",
    companyId: "geneco",
    planName: "Get It Fixed 24",
    planType: "Fixed",
    contractMonths: 24,
    rate: 0.2988,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2988,
    updatedAt: "2026-06-29",
    notes: "Sample website listed rate.",
  },
  {
    id: "base-flo-12",
    source: "base",
    companyId: "flo",
    planName: "Fixed Saver 12",
    planType: "Fixed",
    contractMonths: 12,
    rate: 0.2999,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2999,
    updatedAt: "2026-06-29",
    notes: "Sample website listed rate.",
  },
  {
    id: "base-flo-24",
    source: "base",
    companyId: "flo",
    planName: "Fixed Saver 24",
    planType: "Fixed",
    contractMonths: 24,
    rate: 0.2969,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2969,
    updatedAt: "2026-06-29",
    notes: "Sample website listed rate.",
  },
  {
    id: "base-pacific-12",
    source: "base",
    companyId: "pacific-light",
    planName: "PowerFIX 12",
    planType: "Fixed",
    contractMonths: 12,
    rate: 0.2971,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2971,
    updatedAt: "2026-06-29",
    notes: "Sample based on the provided screenshot structure.",
  },
  {
    id: "base-pacific-24",
    source: "base",
    companyId: "pacific-light",
    planName: "PowerFIX 24",
    planType: "Fixed",
    contractMonths: 24,
    rate: 0.2971,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2971,
    updatedAt: "2026-06-29",
    notes: "Sample based on the provided screenshot structure.",
  },
  {
    id: "base-pacific-36",
    source: "base",
    companyId: "pacific-light",
    planName: "PowerFIX 36",
    planType: "Fixed",
    contractMonths: 36,
    rate: 0.296,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.296,
    updatedAt: "2026-06-29",
    notes: "Sample based on the provided screenshot structure.",
  },
  {
    id: "base-senoko-12",
    source: "base",
    companyId: "senoko",
    planName: "LifePower 12",
    planType: "Fixed",
    contractMonths: 12,
    rate: 0.2925,
    gstStatus: "included",
    thirdPartyCharge: 0.0083,
    effectiveRate: 0.3008,
    updatedAt: "2026-06-29",
    notes: "Sample rate with third-party charge added for comparison.",
  },
  {
    id: "base-senoko-24",
    source: "base",
    companyId: "senoko",
    planName: "LifePower 24",
    planType: "Fixed",
    contractMonths: 24,
    rate: 0.291,
    gstStatus: "included",
    thirdPartyCharge: 0.0083,
    effectiveRate: 0.2993,
    updatedAt: "2026-06-29",
    notes: "Sample rate with third-party charge added for comparison.",
  },
  {
    id: "base-tuas-12",
    source: "base",
    companyId: "tuas",
    planName: "PowerDo 12",
    planType: "Fixed",
    contractMonths: 12,
    rate: 0.298,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.298,
    updatedAt: "2026-06-29",
    notes: "Internal sample for Tuas Power.",
  },
  {
    id: "base-tuas-24",
    source: "base",
    companyId: "tuas",
    planName: "PowerDo 24",
    planType: "Fixed",
    contractMonths: 24,
    rate: 0.2965,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2965,
    updatedAt: "2026-06-29",
    notes: "Internal sample for Tuas Power.",
  },
  {
    id: "manual-geneco-24",
    source: "manual",
    companyId: "geneco",
    planName: "Sales Quote A",
    planType: "Custom Quote",
    contractMonths: 24,
    rate: 0.294,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.294,
    updatedAt: "2026-06-28",
    notes: "Sample employee-entered quote from a customer conversation.",
    quoteRange: { min: 0.293, max: 0.296 },
  },
  {
    id: "manual-flo-24",
    source: "manual",
    companyId: "flo",
    planName: "Retention Quote",
    planType: "Custom Quote",
    contractMonths: 24,
    rate: 0.2955,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2955,
    updatedAt: "2026-06-27",
    notes: "Sample manual quote.",
    quoteRange: { min: 0.2945, max: 0.297 },
  },
  {
    id: "manual-pacific-36",
    source: "manual",
    companyId: "pacific-light",
    planName: "Customer Screenshot Quote",
    planType: "Custom Quote",
    contractMonths: 36,
    rate: 0.2938,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2938,
    updatedAt: "2026-06-28",
    notes: "Sample manual quote.",
    quoteRange: { min: 0.293, max: 0.295 },
  },
  {
    id: "manual-senoko-24",
    source: "manual",
    companyId: "senoko",
    planName: "Phone Quote",
    planType: "Custom Quote",
    contractMonths: 24,
    rate: 0.2895,
    gstStatus: "excluded",
    thirdPartyCharge: 0.0083,
    effectiveRate: 0.2978,
    updatedAt: "2026-06-26",
    notes: "Sample manual quote. Effective rate includes third-party charge only.",
    quoteRange: { min: 0.288, max: 0.291 },
  },
  {
    id: "manual-tuas-24",
    source: "manual",
    companyId: "tuas",
    planName: "Internal Counter Offer",
    planType: "Custom Quote",
    contractMonths: 24,
    rate: 0.2928,
    gstStatus: "included",
    thirdPartyCharge: 0,
    effectiveRate: 0.2928,
    updatedAt: "2026-06-29",
    notes: "Sample own-company quote.",
    quoteRange: { min: 0.292, max: 0.294 },
  },
];

const sourceLabels: Record<DataSource, string> = {
  base: "Website/Base Prices",
  manual: "User-Inputted Quotes",
};

const gstLabels: Record<GstStatus, string> = {
  included: "GST included",
  excluded: "GST excluded",
  unknown: "GST not stated",
};

function formatRate(rate: number) {
  return `$${rate.toFixed(4)}`;
}

function getCompanyName(companyId: string) {
  return companies.find((company) => company.id === companyId)?.name ?? companyId;
}

export default function Home() {
  const [activeSource, setActiveSource] = useState<DataSource>("base");
  const [activeCompanyId, setActiveCompanyId] = useState(companies[0].id);
  const [contractFilter, setContractFilter] = useState("all");
  const [gstFilter, setGstFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const sourceQuotes = useMemo(
    () => quotes.filter((quote) => quote.source === activeSource),
    [activeSource],
  );

  const filteredQuotes = useMemo(() => {
    return sourceQuotes.filter((quote) => {
      const matchesContract =
        contractFilter === "all" || quote.contractMonths === Number(contractFilter);
      const matchesGst = gstFilter === "all" || quote.gstStatus === gstFilter;
      const matchesPlan = planTypeFilter === "all" || quote.planType === planTypeFilter;
      const matchesSearch =
        searchFilter.trim() === "" ||
        quote.planName.toLowerCase().includes(searchFilter.trim().toLowerCase()) ||
        getCompanyName(quote.companyId)
          .toLowerCase()
          .includes(searchFilter.trim().toLowerCase());

      return matchesContract && matchesGst && matchesPlan && matchesSearch;
    });
  }, [contractFilter, gstFilter, planTypeFilter, searchFilter, sourceQuotes]);

  const activeCompanyQuotes = filteredQuotes.filter(
    (quote) => quote.companyId === activeCompanyId,
  );

  const comparisonQuotes = [...filteredQuotes].sort(
    (first, second) => first.effectiveRate - second.effectiveRate,
  );

  const bestQuote = comparisonQuotes[0];
  const updatedDates = sourceQuotes.map((quote) => quote.updatedAt).sort();
  const lastUpdated = updatedDates[updatedDates.length - 1] ?? "No data";

  const contractOptions = Array.from(
    new Set(sourceQuotes.map((quote) => quote.contractMonths)),
  ).sort((first, second) => first - second);

  const planTypeOptions = Array.from(new Set(sourceQuotes.map((quote) => quote.planType))).sort();

  const averageRate =
    filteredQuotes.length > 0
      ? filteredQuotes.reduce((total, quote) => total + quote.effectiveRate, 0) /
        filteredQuotes.length
      : 0;

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-block">
            <p className="eyebrow">Internal Rates Dashboard</p>
            <h1>Electricity Price Tracker</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <span className="status-dot" />
              Sample data
            </span>
          </div>
        </div>
      </header>

      <div className="page">
        <section className="summary-grid" aria-label="Dashboard summary">
          <div className="summary-card">
            <p className="summary-label">Retailers tracked</p>
            <p className="summary-value">{companies.length}</p>
            <p className="summary-note">Competitors plus Tuas Power</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Visible quotes</p>
            <p className="summary-value">{filteredQuotes.length}</p>
            <p className="summary-note">{sourceLabels[activeSource]}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Best effective rate</p>
            <p className="summary-value">
              {bestQuote ? `${formatRate(bestQuote.effectiveRate)}` : "-"}
            </p>
            <p className="summary-note">
              {bestQuote ? `${getCompanyName(bestQuote.companyId)} - ${bestQuote.planName}` : "-"}
            </p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Average effective rate</p>
            <p className="summary-value">
              {filteredQuotes.length > 0 ? formatRate(averageRate) : "-"}
            </p>
            <p className="summary-note">Last updated {lastUpdated}</p>
          </div>
        </section>

        <section className="panel">
          <div className="main-tabs" role="tablist" aria-label="Price source">
            {(["base", "manual"] as DataSource[]).map((source) => (
              <button
                className={`tab-button ${activeSource === source ? "active" : ""}`}
                key={source}
                onClick={() => {
                  setActiveSource(source);
                  setActiveCompanyId(companies[0].id);
                  setContractFilter("all");
                  setGstFilter("all");
                  setPlanTypeFilter("all");
                  setSearchFilter("");
                }}
                role="tab"
                type="button"
              >
                {sourceLabels[source]}
              </button>
            ))}
          </div>

          <div className="section-head">
            <div>
              <h2>{sourceLabels[activeSource]}</h2>
              <p>
                {activeSource === "base"
                  ? "Website-listed plan rates using mock scraped data. Senoko sample rows show third-party charges separately and include them in the effective comparison rate."
                  : "Employee-entered customer quotes using mock data. Quote ranges are shown where the exact offer may vary."}
              </p>
            </div>
          </div>

          <div className="company-tabs" role="tablist" aria-label="Retailer tabs">
            {companies.map((company) => (
              <button
                className={`tab-button company ${
                  activeCompanyId === company.id ? "active" : ""
                }`}
                key={company.id}
                onClick={() => setActiveCompanyId(company.id)}
                role="tab"
                type="button"
              >
                {company.name}
                {company.isOwnCompany ? " (Our Company)" : ""}
              </button>
            ))}
          </div>

          <div className="filters" aria-label="Quote filters">
            <div className="field">
              <label htmlFor="contract-filter">Contract months</label>
              <select
                id="contract-filter"
                onChange={(event) => setContractFilter(event.target.value)}
                value={contractFilter}
              >
                <option value="all">All contract lengths</option>
                {contractOptions.map((months) => (
                  <option key={months} value={months}>
                    {months} months
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="gst-filter">GST status</label>
              <select
                id="gst-filter"
                onChange={(event) => setGstFilter(event.target.value)}
                value={gstFilter}
              >
                <option value="all">All GST labels</option>
                <option value="included">GST included</option>
                <option value="excluded">GST excluded</option>
                <option value="unknown">GST not stated</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="plan-filter">Plan type</label>
              <select
                id="plan-filter"
                onChange={(event) => setPlanTypeFilter(event.target.value)}
                value={planTypeFilter}
              >
                <option value="all">All plan types</option>
                {planTypeOptions.map((planType) => (
                  <option key={planType} value={planType}>
                    {planType}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="search-filter">Search</label>
              <input
                id="search-filter"
                onChange={(event) => setSearchFilter(event.target.value)}
                placeholder="Company or plan name"
                type="search"
                value={searchFilter}
              />
            </div>
          </div>

          <div className="content-grid">
            <section className="company-panel" aria-label="Company rates">
              <div className="company-panel-header">
                <h3>{getCompanyName(activeCompanyId)} rates</h3>
                <span className="summary-note">
                  {activeCompanyQuotes.length} matching quote
                  {activeCompanyQuotes.length === 1 ? "" : "s"}
                </span>
              </div>

              {activeCompanyQuotes.length > 0 ? (
                <div className="quote-grid">
                  {activeCompanyQuotes.map((quote) => (
                    <article
                      className={`quote-card ${
                        bestQuote?.id === quote.id ? "highlight" : ""
                      }`}
                      key={quote.id}
                    >
                      <div className="quote-topline">
                        <div>
                          <p className="quote-title">{quote.planName}</p>
                          <p className="quote-meta">
                            {quote.contractMonths} months - {quote.planType}
                          </p>
                        </div>
                        <span
                          className={`badge ${
                            quote.gstStatus === "included" ? "gst" : "no-gst"
                          }`}
                        >
                          {gstLabels[quote.gstStatus]}
                        </span>
                      </div>

                      <div className="price" aria-label="Effective rate per kWh">
                        <strong>{formatRate(quote.effectiveRate)}</strong>
                        <span>/kWh</span>
                      </div>

                      <div className="quote-details">
                        <div className="detail-row">
                          <span>Listed rate</span>
                          <span>{formatRate(quote.rate)} /kWh</span>
                        </div>
                        <div className="detail-row">
                          <span>Third-party charge</span>
                          <span>{formatRate(quote.thirdPartyCharge)} /kWh</span>
                        </div>
                        {quote.quoteRange ? (
                          <div className="detail-row">
                            <span>Observed quote range</span>
                            <span>
                              {formatRate(quote.quoteRange.min)} -{" "}
                              {formatRate(quote.quoteRange.max)}
                            </span>
                          </div>
                        ) : null}
                        <div className="detail-row">
                          <span>Updated</span>
                          <span>{quote.updatedAt}</span>
                        </div>
                        <div className="detail-row">
                          <span>Notes</span>
                          <span>{quote.notes}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  No quotes match the current filters for this retailer.
                </div>
              )}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Retailer</th>
                      <th>Plan</th>
                      <th>Months</th>
                      <th>GST</th>
                      <th>Listed</th>
                      <th>Third-party</th>
                      <th>Effective</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCompanyQuotes.map((quote) => (
                      <tr key={`${quote.id}-row`}>
                        <td>{getCompanyName(quote.companyId)}</td>
                        <td>{quote.planName}</td>
                        <td>{quote.contractMonths}</td>
                        <td>{gstLabels[quote.gstStatus]}</td>
                        <td>{formatRate(quote.rate)}</td>
                        <td>{formatRate(quote.thirdPartyCharge)}</td>
                        <td>{formatRate(quote.effectiveRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="comparison-panel" aria-label="Cross-retailer comparison">
              <div className="comparison-header">
                <h3>Compare retailers</h3>
                <span className="summary-note">Lowest first</span>
              </div>
              <div className="comparison-list">
                {comparisonQuotes.map((quote) => (
                  <button
                    className="comparison-row"
                    key={`${quote.id}-comparison`}
                    onClick={() => setActiveCompanyId(quote.companyId)}
                    type="button"
                  >
                    <span>
                      <span className="comparison-name">
                        {getCompanyName(quote.companyId)}
                      </span>
                      <span className="comparison-plan">
                        {quote.planName} - {quote.contractMonths} months
                      </span>
                    </span>
                    <span className="comparison-price">
                      {formatRate(quote.effectiveRate)}
                      <br />
                      <span className="summary-note">/kWh</span>
                    </span>
                  </button>
                ))}
                {comparisonQuotes.length === 0 ? (
                  <div className="empty-state">No quotes match the current filters.</div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
