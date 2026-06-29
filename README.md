# Electricity Rates Dashboard

Internal dashboard for tracking and comparing electricity price quotes across Singapore electricity retailers.

## Retailers

- Geneco
- Flo Energy
- Pacific Light
- Senoko Energy
- Tuas Power

## Current Features

- Website/Base Prices tab with sample public website rates
- User-Inputted Quotes tab with sample employee-entered quotes
- Retailer tabs inside each price source
- Filters for contract length, GST status, plan type, and search
- Cross-retailer comparison sorted by effective rate
- Separate display of listed rate, GST status, third-party charges, and effective rate
- Sample handling for Senoko third-party charges

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal. It is usually:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js may use another port such as:

```text
http://localhost:3001
```

## Useful Commands

Run the app locally:

```bash
npm run dev
```

Check that the app builds successfully:

```bash
npm run build
```

Start a production build after running `npm run build`:

```bash
npm run start
```

## Project Structure

```text
app/
  globals.css   Main dashboard styling
  layout.tsx    App layout and metadata
  page.tsx      Dashboard UI, tabs, filters, and sample quote data
```

## Notes

The dashboard currently uses hardcoded sample data. Later, this can be replaced with Supabase data for:

- Retailer records
- Website/base prices
- Manually entered customer quotes
- Scrape history and scrape success/failure logs

Website scraping can be added later, one retailer at a time. Public website data may require a browser-based scraper if the rates are rendered with JavaScript.
