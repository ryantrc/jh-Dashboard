import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electricity Rates Dashboard",
  description: "Internal dashboard for tracking electricity retailer rates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
