"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

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

type QuoteFormState = {
  companyId: string;
  planName: string;
  planType: Quote["planType"];
  contractMonths: string;
  rate: string;
  gstStatus: GstStatus;
  thirdPartyCharge: string;
  rangeMin: string;
  rangeMax: string;
  notes: string;
};

type CustomerQuoteRow = {
  id: number;
  company_id: string;
  plan_name: string;
  plan_type: Quote["planType"];
  contract_months: number;
  rate: number | string;
  gst_status: GstStatus;
  third_party_charge: number | string | null;
  effective_rate: number | string;
  quote_range_min: number | string | null;
  quote_range_max: number | string | null;
  notes: string | null;
  quoted_at: string | null;
  updated_at: string | null;
  created_at: string | null;
};

const companies: Company[] = [
  { id: "geneco", name: "Geneco" },
  { id: "flo", name: "Flo Energy" },
  { id: "pacific-light", name: "Pacific Light" },
  { id: "senoko", name: "Senoko Energy" },
  { id: "tuas", name: "Tuas Power", isOwnCompany: true },
];

const initialQuotes: Quote[] = [
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

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function createEmptyQuoteForm(companyId = companies[0].id): QuoteFormState {
  return {
    companyId,
    planName: "",
    planType: "Custom Quote",
    contractMonths: "24",
    rate: "",
    gstStatus: "included",
    thirdPartyCharge: "",
    rangeMin: "",
    rangeMax: "",
    notes: "",
  };
}

function mapCustomerQuoteRow(row: CustomerQuoteRow): Quote {
  const rangeMin = row.quote_range_min === null ? null : Number(row.quote_range_min);
  const rangeMax = row.quote_range_max === null ? null : Number(row.quote_range_max);
  const hasRange =
    rangeMin !== null && rangeMax !== null && !Number.isNaN(rangeMin) && !Number.isNaN(rangeMax);

  return {
    id: `manual-${row.id}`,
    source: "manual",
    companyId: row.company_id,
    planName: row.plan_name,
    planType: row.plan_type,
    contractMonths: row.contract_months,
    rate: Number(row.rate),
    gstStatus: row.gst_status,
    thirdPartyCharge: row.third_party_charge === null ? 0 : Number(row.third_party_charge),
    effectiveRate: Number(row.effective_rate),
    updatedAt: row.quoted_at ?? row.updated_at ?? row.created_at ?? "No date",
    notes: row.notes ?? "",
    quoteRange: hasRange ? { min: rangeMin, max: rangeMax } : undefined,
  };
}

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [activeSource, setActiveSource] = useState<DataSource>("base");
  const [activeCompanyId, setActiveCompanyId] = useState(companies[0].id);
  const [contractFilter, setContractFilter] = useState("all");
  const [gstFilter, setGstFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [quoteForm, setQuoteForm] = useState<QuoteFormState>(() =>
    createEmptyQuoteForm(companies[0].id),
  );
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [quoteFormMessage, setQuoteFormMessage] = useState("");
  const [customerQuoteLoadMessage, setCustomerQuoteLoadMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCustomerQuotes() {
      const { data, error } = await supabase
        .from("customer_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setCustomerQuoteLoadMessage(`Could not load saved quotes: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        setCustomerQuoteLoadMessage("No saved Supabase quotes yet. Showing sample manual quotes.");
        return;
      }

      const baseQuotes = initialQuotes.filter((quote) => quote.source === "base");
      const customerQuotes = (data as CustomerQuoteRow[]).map(mapCustomerQuoteRow);

      setQuotes([...baseQuotes, ...customerQuotes]);
      setCustomerQuoteLoadMessage(`${customerQuotes.length} saved customer quote(s) loaded.`);
    }

    loadCustomerQuotes();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateQuoteForm<Value extends keyof QuoteFormState>(
    field: Value,
    value: QuoteFormState[Value],
  ) {
    setQuoteForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleAddManualQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const rate = Number(quoteForm.rate);
    const thirdPartyCharge =
      quoteForm.thirdPartyCharge.trim() === "" ? 0 : Number(quoteForm.thirdPartyCharge);
    const contractMonths = Number(quoteForm.contractMonths);
    const rangeMin = quoteForm.rangeMin.trim() === "" ? null : Number(quoteForm.rangeMin);
    const rangeMax = quoteForm.rangeMax.trim() === "" ? null : Number(quoteForm.rangeMax);

    if (!quoteForm.planName.trim() || !rate || !contractMonths) {
      setQuoteFormMessage("Add a plan name, listed rate, and contract length.");
      return;
    }

    const hasValidRange =
      rangeMin !== null && rangeMax !== null && !Number.isNaN(rangeMin) && !Number.isNaN(rangeMax);

    const thirdPartyChargeValue = Number.isNaN(thirdPartyCharge) ? 0 : thirdPartyCharge;
    const effectiveRate = rate + thirdPartyChargeValue;
    const today = getTodayDate();
    const quoteId = Date.now();

    setIsSavingQuote(true);
    setQuoteFormMessage("");

    const { error } = await supabase.from("customer_quotes").insert({
      id: quoteId,
      company_id: quoteForm.companyId,
      plan_name: quoteForm.planName.trim(),
      plan_type: quoteForm.planType,
      contract_months: contractMonths,
      rate,
      gst_status: quoteForm.gstStatus,
      third_party_charge: thirdPartyChargeValue,
      effective_rate: effectiveRate,
      quote_range_min: hasValidRange ? rangeMin : null,
      quote_range_max: hasValidRange ? rangeMax : null,
      notes: quoteForm.notes.trim() || "Manually entered quote.",
      quoted_at: today,
      updated_at: new Date().toISOString(),
    });

    setIsSavingQuote(false);

    if (error) {
      setQuoteFormMessage(`Could not save quote: ${error.message}`);
      return;
    }

    const newQuote: Quote = {
      id: `manual-${quoteId}`,
      source: "manual",
      companyId: quoteForm.companyId,
      planName: quoteForm.planName.trim(),
      planType: quoteForm.planType,
      contractMonths,
      rate,
      gstStatus: quoteForm.gstStatus,
      thirdPartyCharge: thirdPartyChargeValue,
      effectiveRate,
      updatedAt: today,
      notes: quoteForm.notes.trim() || "Manually entered quote.",
      quoteRange: hasValidRange ? { min: rangeMin, max: rangeMax } : undefined,
    };

    setQuotes((current) => [newQuote, ...current]);
    setActiveCompanyId(quoteForm.companyId);
    setContractFilter("all");
    setGstFilter("all");
    setPlanTypeFilter("all");
    setSearchFilter("");
    setQuoteForm(createEmptyQuoteForm(quoteForm.companyId));
    setQuoteFormMessage("Quote saved to Supabase.");
  }

  const sourceQuotes = useMemo(
    () => quotes.filter((quote) => quote.source === activeSource),
    [activeSource, quotes],
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
              </button>
            ))}
          </div>

          {activeSource === "manual" ? (
            <form className="manual-form" onSubmit={handleAddManualQuote}>
              <div className="manual-form-header">
                <div>
                  <h3>Add user-inputted quote</h3>
                  <p>Enter a customer quote here. It will be added to the current dashboard view.</p>
                </div>
                <button className="primary-button" disabled={isSavingQuote} type="submit">
                  {isSavingQuote ? "Saving..." : "Add quote"}
                </button>
              </div>

              <div className="manual-form-grid">
                <div className="field">
                  <label htmlFor="quote-company">Retailer</label>
                  <select
                    id="quote-company"
                    onChange={(event) => updateQuoteForm("companyId", event.target.value)}
                    value={quoteForm.companyId}
                  >
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="quote-plan">Plan or quote name</label>
                  <input
                    id="quote-plan"
                    onChange={(event) => updateQuoteForm("planName", event.target.value)}
                    placeholder="e.g. Customer WhatsApp Quote"
                    required
                    value={quoteForm.planName}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quote-type">Plan type</label>
                  <select
                    id="quote-type"
                    onChange={(event) =>
                      updateQuoteForm("planType", event.target.value as Quote["planType"])
                    }
                    value={quoteForm.planType}
                  >
                    <option value="Custom Quote">Custom Quote</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Discount Off Tariff">Discount Off Tariff</option>
                    <option value="Promotional">Promotional</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="quote-months">Contract months</label>
                  <input
                    id="quote-months"
                    min="1"
                    onChange={(event) => updateQuoteForm("contractMonths", event.target.value)}
                    required
                    type="number"
                    value={quoteForm.contractMonths}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quote-rate">Listed rate /kWh</label>
                  <input
                    id="quote-rate"
                    min="0"
                    onChange={(event) => updateQuoteForm("rate", event.target.value)}
                    placeholder="0.2940"
                    required
                    step="0.0001"
                    type="number"
                    value={quoteForm.rate}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quote-gst">GST status</label>
                  <select
                    id="quote-gst"
                    onChange={(event) =>
                      updateQuoteForm("gstStatus", event.target.value as GstStatus)
                    }
                    value={quoteForm.gstStatus}
                  >
                    <option value="included">GST included</option>
                    <option value="excluded">GST excluded</option>
                    <option value="unknown">GST not stated</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="quote-third-party">Third-party charge /kWh</label>
                  <input
                    id="quote-third-party"
                    min="0"
                    onChange={(event) => updateQuoteForm("thirdPartyCharge", event.target.value)}
                    placeholder="0.0000"
                    step="0.0001"
                    type="number"
                    value={quoteForm.thirdPartyCharge}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quote-range-min">Range min /kWh</label>
                  <input
                    id="quote-range-min"
                    min="0"
                    onChange={(event) => updateQuoteForm("rangeMin", event.target.value)}
                    placeholder="Optional"
                    step="0.0001"
                    type="number"
                    value={quoteForm.rangeMin}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quote-range-max">Range max /kWh</label>
                  <input
                    id="quote-range-max"
                    min="0"
                    onChange={(event) => updateQuoteForm("rangeMax", event.target.value)}
                    placeholder="Optional"
                    step="0.0001"
                    type="number"
                    value={quoteForm.rangeMax}
                  />
                </div>
                <div className="field notes-field">
                  <label htmlFor="quote-notes">Notes</label>
                  <textarea
                    id="quote-notes"
                    onChange={(event) => updateQuoteForm("notes", event.target.value)}
                    placeholder="Source, customer segment, screenshot reference, or caveats"
                    rows={3}
                    value={quoteForm.notes}
                  />
                </div>
              </div>
              {quoteFormMessage ? <p className="form-message">{quoteFormMessage}</p> : null}
              {customerQuoteLoadMessage ? (
                <p className="form-message">{customerQuoteLoadMessage}</p>
              ) : null}
            </form>
          ) : null}

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
