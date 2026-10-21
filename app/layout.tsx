import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { StoreBootstrapLoading } from "@/components/RouteLoading";
import { StoreChrome } from "@/components/StoreChrome";
import { StoreProvider } from "@/lib/store";
import { MarketsProvider } from "@/lib/markets-context";
import { CatalogueProvider } from "@/lib/catalogue-context";
import { primeMarkets } from "@/lib/markets";
import { getCategories, getMarkets } from "@/lib/catalogue";
import { SITE } from "@/data/site";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "buy now pay later",
    "BNPL storefront",
    "installment payments",
    "US e-commerce",
  ],
  robots: { index: false, follow: false },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

async function StorefrontProviders({ children }: { children: ReactNode }) {
  // Keep catalogue reads request-time so the build does not need a database
  // snapshot to render the storefront shell. Isolate this request-time work
  // behind Suspense so a slow database can show a useful fallback immediately.
  await cookies();

  // Markets and categories live in Postgres. They are read once here and handed
  // to the client, which is what lets `formatMoney` and the category dropdowns
  // stay synchronous in the browser.
  const [markets, categories] = await Promise.all([getMarkets(), getCategories()]);

  // Prime the synchronous cache before any child renders, so server components
  // and helpers that call `getMarket()` (e.g. `formatMoney`) resolve correctly.
  primeMarkets(markets);

  return (
    <MarketsProvider markets={markets}>
      <CatalogueProvider categories={categories}>
        <StoreProvider>
          <StoreChrome footer={<Footer />}>{children}</StoreChrome>
        </StoreProvider>
      </CatalogueProvider>
    </MarketsProvider>
  );
}

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink-800">
        <Suspense fallback={<StoreBootstrapLoading />}>
          <StorefrontProviders>{props.children}</StorefrontProviders>
        </Suspense>
      </body>
    </html>
  );
}
