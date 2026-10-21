# FlexiBuy — BNPL storefront

> **Get it today. Pay over time.**
>
> A complete, working buy-now-pay-later e-commerce storefront for the
> **United States**, priced in **US dollars**.

**Product, pricing, stock, review, delivery and installment examples are
illustrative.** Payment gateway integration is a planned follow-up.

---

## What is in the box

| Requirement | Delivered |
| --- | --- |
| Admin catalogue CRUD | ✅ products, categories and the US market are managed in `/admin` |
| Starter data | `npm run db:seed` adds the US market and starter categories; it never creates products |
| Supabase Postgres + Prisma migrations | ✅ `prisma/schema.prisma`, `prisma/migrations/*` |
| USD pricing | ✅ `product_prices`, one row per market (US only) |
| Market config (currency, tax, shipping) in the DB | ✅ `markets` table |
| Orders persisted | ✅ `orders` / `order_items` / `order_installments` |
| Product search with autocomplete | ✅ `/search` + `/api/search` + `components/SearchBar.tsx` |
| Category pages: banner, filters, sort, grid, pagination | ✅ `/category/[slug]` |
| Product pages: gallery, specs, reviews, related, bundle, calculator | ✅ `/product/[slug]` |
| Cart with drawer, quantities, shipping + tax estimates | ✅ `/cart`, `components/CartDrawer.tsx` |
| Six-step checkout | ✅ `/checkout`, `components/checkout/*` |
| Installment calculator (3 / 6 / 9 / 12 months) | ✅ `components/InstallmentCalculator.tsx` |
| Responsive: 2 products/row mobile → 4 desktop | ✅ `components/ProductGrid.tsx` |
| Image uploads | Product and category uploads are stored in Supabase Storage |
| Seed data + validation | `prisma/seed.ts` seeds categories and market; `scripts/validate-data.ts` checks stored records |

## Tech

* **Next.js 16.3** (App Router, Turbopack, React 19, `async` params)
* **TypeScript** in strict mode
* **Tailwind CSS v4** with a small in-house design system in `app/globals.css`
* **Supabase Postgres** as the datastore, reached through **Prisma 7** (ORM +
  `pg` driver adapter and migrations; starter categories are seeded explicitly)
* No icon library, no UI kit or state library; payment SDK integration is planned

---

## Data: Supabase + Prisma

The database is the **single source of truth** for catalogue records, market
settings and placed orders. Product records are managed in the admin dashboard. New products can use generated artwork or images uploaded to the public Supabase Storage `images` bucket.

### Schema

`prisma/schema.prisma` (13 tables, snake_case columns so it reads well in the
Supabase SQL editor):

| Table | Purpose |
| --- | --- |
| `markets` | The single market (US): currency, locale, tax rate, shipping, delivery copy (`messaging` jsonb) |
| `categories` | 20 browsable categories + their banner image and price envelope |
| `category_specs` | Spec rows merged into every product in a category |
| `products` | The catalogue: copy, rating, stock, colour, release date, sort position |
| `product_prices` | **One price row per market** — the store is US-only, so one per product |
| `product_images` | Gallery images (position 0 mirrors `products.image`) |
| `product_specs` | Per-product spec rows |
| `product_tags` | Search/filter tags |
| `installment_configs` | BNPL eligibility, suggested period, available periods |
| `reviews` | Persisted customer reviews |
| `orders` | Placed orders, with money **snapshotted** in the order currency |
| `order_items` | Line items, denormalised so an order survives cataloguing changes |
| `order_installments` | The illustrative payment schedule |

Two design points worth knowing:

* **Prices are stored per market.** `product_prices` is keyed by
  `(product, market)`. The current storefront and admin support US/USD only,
  so each product has exactly one price row and `product.price` is the only price.
* **Orders are snapshots.** `orders` and `order_items` copy names, images and
  prices instead of referencing live rows, so re-pricing or deleting a product
  never rewrites history. `order_items.product_id` is `ON DELETE SET NULL`.

### Getting started

```bash
# 1. Install (postinstall regenerates the Prisma client)
npm install

# 2. Add your Supabase database and Storage settings
cp .env.example .env      # fill in PROJECT-REF, database password, URL and secret key

# 3. Create the tables
npm run db:migrate        # applies prisma/migrations/*

# 4. Load the US market and starter categories (no products are seeded)
npm run db:seed

# 5. Create the first admin account (this is not a seed operation)
npm run db:admin -- --email you@example.com --password "use-a-strong-password"

# 6. Start and sign in at /admin/login
npm run dev               # http://localhost:3000
```

The seed supplies the US market and starter categories only. After signing in, add products from `/admin/products`; product records are never created by seeding. The admin account is bootstrapped separately because a new database
has no operator who can sign in yet.

`DATABASE_URL` and `DIRECT_URL` are both needed, and for this project both point at
Supabase's **shared pooler** in `eu-west-1` — it does not expose a
`db.<ref>.supabase.co` direct host, so the session-mode pooler is what runs
migrations. The app uses transaction mode (`:6543`), the CLI uses session mode
(`:5432`) because migrations need session state that transaction mode discards.

Two connection parameters are not optional here, and both are in `.env`:

* **`sslmode=no-verify`** — Supabase serves a self-signed certificate, which both
  the Prisma engine and `node-postgres` reject under `verify-full`
  (`self-signed certificate in certificate chain`, surfaced as `P1001`). This
  still encrypts the connection; it just skips chain verification. For full
  verification in production, download Supabase's root CA and use
  `sslmode=verify-full&sslrootcert=<path>`.
* **`connect_timeout=30`** — Supaviser intermittently takes a while to accept a
  new connection (~1 in 5 timed out when this was measured). The Prisma CLI's
  default is shorter than that and fails before the server is ready.

> If Prisma reports a host you did not expect (e.g. `localhost:5432`), a stale
> `DIRECT_URL` is set in your shell — `dotenv` does not override variables that
> are already exported. Clear it with `Remove-Item Env:DIRECT_URL`.

### Scripts

```bash
npm run db:generate      # regenerate the Prisma client
npm run db:migrate       # create/apply a migration (dev)
npm run db:deploy        # apply migrations (production / CI)
npm run db:seed          # add/update US market and starter categories only
npm run db:reset         # drop, re-migrate, re-seed (destructive)
npm run db:purge-products -- --confirm-project=rqpcdnmbjtqdhtecjawn # products only
npm run db:studio        # Prisma Studio
npm run db:validate      # validate prisma/schema.prisma

npm run validate:data    # verify the catalogue in the live database
npm run lint
npm run build
npm run verify           # schema validation + lint + build (no seed data required)
```

### How the cutover works

| Concern | Where it lives now |
| --- | --- |
| Reading the catalogue | `lib/catalogue.ts` (server-only) — the only read path |
| Prisma client | `lib/db.ts` — singleton, `pg` driver adapter, pooled |
| Markets on the client | `lib/markets.ts` cache + `lib/markets-context.tsx` provider |
| Categories on the client | `lib/catalogue-context.tsx` provider |
| Placing an order | `lib/orders.ts`, exposed as a Server Action in `app/checkout/actions.ts` |
| Seed source data | `prisma/seed/source/` (starter categories and market settings) |

**Why the providers exist.** `formatMoney`, the country selector and the cart
totals need market data *synchronously* while rendering. Markets and categories
now live in Postgres, so the root layout (a Server Component) reads them once
and passes them down. The provider primes a small synchronous cache
(`lib/markets.ts`) during its first render, so client helpers stay plain
functions instead of becoming async or hook-based — and the server HTML and the
first client render still agree, so there are no hydration mismatches.

**Seeding is idempotent and safe to re-run.** It creates or updates the US market and starter categories only. It never creates, updates or deletes products, and it preserves order history.

**Orders are recomputed server-side.** The checkout posts ids and quantities only;
`placeOrder` re-reads prices, tax and shipping from the database and writes the
order, its lines, its schedule and the stock decrement in a single transaction.
The client's totals are never trusted.

---

## Project structure

```
app/
  layout.tsx                  header + footer + cart drawer + store provider
  page.tsx                    homepage (hero, featured, categories, best sellers,
                              new arrivals, deals, how-it-works, why-us,
                              reviews, about section, FAQ)
  categories/page.tsx         database-managed categories
  category/[slug]/page.tsx    listing: filters + sort + grid + pagination
  product/[slug]/page.tsx     database-backed product pages
  search/page.tsx             search results, category-scoped and sorted
  cart/page.tsx               full cart
  checkout/
    page.tsx                   6-step checkout
    actions.ts                 Server Action: submitOrder -> lib/orders.ts
  not-found.tsx
  api/search/route.ts         autocomplete endpoint (server-side search)
  api/product-image/[key]/route.ts   local SVG product-image generator

components/
  Header, AnnouncementBar, CategoryMenu, SearchBar,
  SearchSuggestions, CartDrawer, CartItem, CartTotals, Footer,
  ProductCard, ProductGrid, ProductGallery, ProductImage, ProductFilters,
  SortSelect, Pagination, PriceDisplay, InstallmentCalculator,
  ProductPurchasePanel, ProductReviews, FrequentlyBoughtTogether,
  CategoryCard, Breadcrumbs, SectionHeader, RatingStars, FAQ, Icons,
  Hero, MarketingSections
  checkout/
    CheckoutFlow.tsx          step machine, totals, order placement
    steps.tsx                 contact / address / delivery / payment
    ReviewConfirmation.tsx    review step + confirmation screen
    types.ts                  checkout data model + per-step validation

data/
  types.ts                    shared domain types (Product, Category, Market, ...)
  site.ts                     brand, trust, FAQ and testimonial copy (static)

prisma/
  schema.prisma               13 models - the source of truth for the schema
  migrations/                 committed SQL migrations
  seed.ts                     seeds US market and starter categories only
  seed/source/
    categories.ts             starter categories
    markets.ts                the US/USD market configuration
    images.ts                 category artwork URLs
lib/
  db.ts                       Prisma singleton (pg driver adapter)
  catalogue.ts                ALL catalogue reads (server-only)
  orders.ts                   server-side order placement
  markets.ts                  synchronous market cache (client + server)
  markets-context.tsx         ships markets to the client
  catalogue-context.tsx       ships categories to the client
  installments.ts             installment maths (monthly split, schedule)
  fulfilment.ts               shipping + estimated tax per market
  search.ts                   sorting + autocomplete payload (client-safe)
  format.ts                   currency formatting and market-aware prices
  random.ts                   stable category artwork hash
  store.tsx                   market + cart state (useSyncExternalStore)
  cn.ts                       className joiner
  art/                       category-accurate SVG illustrations
  generated/prisma/           generated Prisma client (gitignored)

scripts/
  validate-data.ts            checks database records; an empty product table is valid
```

---

## Starter data

`npm run db:seed` creates or updates the US market and the bundled starter categories. It does not add products or change existing product records. Create, edit and delete products from `/admin/products`.

### USD is the only currency

`product_prices` is keyed by `(product, market)`. The store ships with a single
market — the United States — so every product has exactly one price row and all
formatting goes through `lib/format.ts` using the `markets` row's locale and
currency. There is no FX conversion anywhere, and the `CountryCode` /
`CurrencyCode` enums each have one member.

The current storefront and admin only support US/USD. Adding another country
requires widening the enums and `CountryCode` / `CurrencyCode` types in
`data/types.ts`, then updating market selection and price handling in the
runtime and admin.

### Managing catalogue data

Use `/admin/markets`, `/admin/categories` and `/admin/products` to create,
edit and delete storefront data. The product form manages prices, stock,
images, tags, specifications and installment settings. Categories manage their artwork style, uploaded banner image and specifications. A category with products cannot be
deleted until those products have been moved or deleted. A market in use by a
product price or order cannot be deleted.

**To load or refresh the starter market and categories:**

```bash
npm run db:seed
```

---

## Product images

The product form uploads one or more JPG, PNG, WebP or AVIF images to the Supabase Storage `images` bucket under `products/`. Category forms upload banner images under `categories/`. The bucket must be public so storefront pages can display its public object URLs.

Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the server `.env`. The secret key is used only by the authenticated upload route and must never be exposed to browser code. The existing generated product artwork remains available when no product image is supplied.

## Markets and currency

The `markets` table defines storefront settings managed from `/admin/markets`.
The application currently supports the United States and USD:

| | 🇺🇸 United States |
| --- | --- |
| Currency | USD ($) |
| Standard shipping | $4.99 (free over $75) |
| Express shipping | $14.99 |
| Estimated tax | 8.25% sales tax |
| Delivery | 3–5 business days (standard), 1–2 (express) |

The store is **US-only**, so there is no country selector and no market state in
the browser. `getMarket()` reads the single row from the synchronous cache in
`lib/markets.ts`, which the root layout primes before rendering. The cart no
longer persists a country to `localStorage` — only the cart itself.

The root layout loads the market once and passes it to `MarketsProvider`, so
client components still read market data synchronously.

---

## Installment financing — what it is and is not

The current calculator divides the product price across the selected period and
shows an estimated schedule. Payment gateway integration is a planned follow-up;
provider-specific terms and eligibility will need to be configured with it.

Rules enforced in the data layer:

* products priced ≥ $400 offer 3/6/9/12 months
* $150–$399 offers 3/6/9
* under $150 offers 3 months only
* products can be marked ineligible for installments in the admin product form

Required disclaimers appear on the homepage, on every product page, in the cart,
in checkout and in the footer:

> Installment examples on this website are illustrative only. Actual financing
> availability, terms, fees, eligibility, and payment schedules depend on the
> financing provider and customer.

Checkout stores order records in Postgres. Payment gateway integration is a
planned follow-up.

---

## Accessibility & UX notes

* Semantic landmarks (`header`/`nav`/`main`/`footer`/`aside`/`article`), one
  `h1` per page, ordered heading levels
* Skip-to-content link and visible `:focus-visible` rings on every interactive
  element
* Search combobox with `aria-expanded`, `aria-controls`, `aria-activedescendant`
  and full arrow/Enter/Escape keyboard support
* Country selector is a proper listbox with `aria-selected` and Escape-to-close
* Cart drawer and mobile menu are `role="dialog" aria-modal`, focus-managed and
  Escape-dismissible; body scroll is locked while open
* Checkout progress is an ordered list with `aria-current="step"`
* Gallery thumbnails are buttons in a labelled group; quantity steppers expose
  `aria-label`s; filter checkboxes have visible labels
* The free-shipping meter is a `progressbar`; pagination controls remain available
* `prefers-reduced-motion` disables all animation
* Colour contrast meets WCAG AA for body text and interactive controls

State is read from `localStorage` through `useSyncExternalStore`, so the server
HTML and the first client render always match — no hydration mismatches.

---

## Responsive behaviour

| Breakpoint | Product grid | Navigation |
| --- | --- | --- |
| `< 640px` (mobile) | 2 per row | hamburger drawer + search toggle |
| `640–1024px` (tablet) | 3 per row | drawer, inline search at `lg` |
| `≥ 1024px` (laptop) | 4 per row | full bar + search + category dropdown |
| `≥ 1280px` (desktop) | 4 per row | Full nav in the header |

---

## Troubleshooting

**`P2028: Unable to start a transaction in the given time`** — Prisma's default
`maxWait` for acquiring a connection is only 2s, which is too short for
Supaviser. The seed passes `maxWait: 30_000`; if you add your own
`$transaction` calls, do the same.

**Product or category page not found** — check that the record exists and has
not been deleted in `/admin`. Catalogue routes resolve from Postgres on request,
so new products and categories do not require another build.

**`This module cannot be imported from a Client Component`** — a `server-only`
import leaked into a module that a CLI script (not a Next.js runtime) loads.
`server-only` throws unless it is resolved under React's `react-server`
condition, which plain `tsx`/Node never uses. `lib/db.ts`, `lib/catalogue.ts`
and `lib/orders.ts` therefore avoid it and rely on the Prisma client being
Node-only. Don't reintroduce it in those files.

**Your `.env` is being ignored** — `dotenv` does **not** override variables that
are already set in the shell. If Prisma reports a host you did not expect (e.g.
`localhost:5432`), a stale `DIRECT_URL` is set in your session. Clear it with
`Remove-Item Env:DIRECT_URL` and re-run.

**`db.<ref>.supabase.co` does not resolve / `tenant/user postgres.<ref> not found`** —
you are on the wrong host. Some Supabase projects do not expose a direct
hostname at all; the dashboard's connection string is authoritative. Copy it
from **Project → Settings → Data API** rather than assembling it — the pooler
host includes the region *and* the cluster number (e.g. `aws-1-eu-west-1`,
where the cluster is `1`, not `0`).

**`self-signed certificate in certificate chain`** — add `uselibpqcompat=true` to
the connection string (see `.env.example`). `pg` otherwise treats
`sslmode=require` as `verify-full`.

**`DATABASE_URL is not set`** — copy `.env.example` to `.env` and fill in your
Supabase connection strings. The app will not fall back to any in-memory data.

**`Can't reach database server`** — check the password is URL-encoded (`@ : / ? #`
must be escaped) and that your IP is allowed in Supabase → Settings → Network.

**`too many connections`** — you are on the direct connection by mistake. Use the
transaction pooler for `DATABASE_URL` (`:6543` + `?pgbouncer=true`) and reserve
`DIRECT_URL` (`:5432`) for the Prisma CLI.

**Migration fails on `CREATE SCHEMA`/DDL** — the CLI is reading the pooled URL.
Confirm `DIRECT_URL` is set; `prisma.config.ts` reads it, not `DATABASE_URL`.

**`P1001` / `Timed out fetching a connection`** — usually an IPv6-only host with
IPv4-only DNS, or a firewall on the pooler. Supabase's IPv4 endpoint works from
most networks.

**Port 3000 in use** — `npm run dev -- -p 3100`.

**"Hydration failed"** — almost always a cached `localStorage` value with an
unexpected shape. Clear site data for `localhost`, or bump `CART_STORAGE_KEY` in
`lib/store.tsx`.

The seed supplies only the US market and starter categories. Dashboard writes update the database-backed storefront directly, and `npm run validate:data` accepts an empty product catalogue.

---

## License / disclaimer

Illustrative content only. All brands, products, prices, reviews and people named
on this site are fictional. FlexiBuy is not a real retailer and is not affiliated
with any real retailer or financing provider. Payment gateway integration is a
planned follow-up.

