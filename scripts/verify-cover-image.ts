/**
 * One-off: confirm the cover image is the first `product_images` row.
 *
 * Run: `npx tsx scripts/verify-cover-image.ts`
 */
import "dotenv/config";

import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();

  const { rows } = await client.query(
    `select p.slug,
            p.image                                   as products_image,
            (select i.url from product_images i
              where i.product_id = p.id
              order by i.position asc limit 1)         as first_gallery_image,
            (select count(*)::int from product_images i
              where i.product_id = p.id)               as gallery_rows
       from products p
      order by p.slug
      limit 8`,
  );

  console.log("\nCover image check\n" + "=".repeat(78));
  for (const row of rows) {
    const agrees = row.first_gallery_image === row.products_image;
    console.log(`\n${row.slug}  (gallery rows: ${row.gallery_rows})`);
    console.log(`  products.image       : ${row.products_image}`);
    console.log(`  first product_images : ${row.first_gallery_image ?? "(none)"}`);
    console.log(`  cover resolves to    : ${row.first_gallery_image ?? row.products_image}`);
    console.log(`  in sync              : ${agrees ? "yes" : "no (app uses first_gallery_image)"}`);
  }
  console.log("=".repeat(78) + "\n");

  // Show that the stored URL is the short seed form, and that the long
  // fastly.picsum.photos/id/.../hmac=... URL only ever appears after Picsum's
  // own 302 redirect in the browser.
  const { rows: hosts } = await client.query(
    `select regexp_replace(url, '^https?://([^/]+).*$', '\\1') as host, count(*)::int as n
       from product_images
      group by 1
      order by 2 desc`,
  );
  console.log("Hosts stored in product_images.url:");
  for (const row of hosts) console.log(`  ${String(row.host).padEnd(28)} ${row.n}`);

  const { rows: sample } = await client.query(
    `select url from product_images where position = 0 order by product_id limit 1`,
  );
  console.log(`\nStored cover URL : ${sample[0]?.url}`);
  console.log("Resolves via 302 : https://fastly.picsum.photos/id/<n>/800/600.jpg?hmac=...");
  console.log("=".repeat(78) + "\n");

  // Point every cover at a host that permits hotlinking, so the storefront can be
  // checked with real photography instead of the Cloudflare-protected Pixabay
  // download endpoint, which serves a JS challenge rather than an image.
  if (process.argv.includes("--apply-picsum")) {
    const { rowCount } = await client.query(
      `update product_images i
          set url = 'https://picsum.photos/seed/' || p.slug || '/800/600'
         from products p
        where p.id = i.product_id
          and i.position = 0`,
    );
    console.log(`Applied picsum cover URLs to ${rowCount} products.\n`);
  }

  await client.end();
}

main().catch((error) => {
  console.error("CHECK FAILED:", error.message);
  process.exit(1);
});
