import type { Category } from "@/data/types";

/**
 * Starter categories. Product records are created through the admin dashboard.
 */
export const CATEGORIES: Category[] = [
  {
    id: "cat-01",
    name: "Electronics",
    slug: "electronics",
    tagline: "Big screens, big sound, zero upfront stress.",
    description:
      "Televisions, projectors, audio and smart displays from everyday 4K sets to reference-grade home cinema. Every eligible item can be split into an installment schedule at checkout.",
    artKey: "electronics",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Display technology", value: "See listing specification" },
      { label: "Power", value: "Mains powered, 2m cable included" },
    ],
  },
  {
    id: "cat-02",
    name: "Furniture",
    slug: "furniture",
    tagline: "Sofas, tables and storage that arrive when you are ready.",
    description:
      "Living room, dining and office furniture built from solid frames and performance fabrics. Delivery is scheduled around your home and the installment calculator keeps large pieces affordable.",
    artKey: "furniture",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Frame", value: "Kiln-dried hardwood with reinforced joinery" },
      { label: "Assembly", value: "Legs attach on delivery — tools included" },
    ],
  },
  {
    id: "cat-03",
    name: "Home Appliances",
    slug: "home-appliances",
    tagline: "Laundry, cooling and kitchen kit that works every day.",
    description:
      "Energy-labelled appliances for laundry, refrigeration, cooking and climate control, with efficiency ratings and delivery windows.",
    artKey: "appliances",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Energy rating", value: "A–A++" },
      { label: "Installation", value: "Free removal of old unit" },
    ],
  },
  {
    id: "cat-04",
    name: "Mobile & Accessories",
    slug: "mobile-accessories",
    tagline: "Handsets, wearables and the chargers that keep up.",
    description:
      "Phones, tablets, smartwatches, earbuds, power banks and cases. Accessories start under $30 and flagship handsets can be split across 12 monthly payments.",
    artKey: "mobile",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Connectivity", value: "Dual-SIM, 5G ready" },
      { label: "In the box", value: "Device, cable and quick-start guide" },
    ],
  },
  {
    id: "cat-05",
    name: "Gaming",
    slug: "gaming",
    tagline: "Consoles, rigs and peripherals for the whole squad.",
    description:
      "Next-gen consoles, high refresh monitors, racing wheels, headsets, keyboards and gaming chairs. Accessories are under $60; full rigs can be split over 12 payments.",
    artKey: "gaming",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Connectivity", value: "Wired + low-latency wireless" },
      { label: "Compatibility", value: "Cross-platform accessories" },
    ],
  },
  {
    id: "cat-06",
    name: "Fashion",
    slug: "fashion",
    tagline: "Everyday staples and occasion pieces, in two markets.",
    description:
      "Womenswear, menswear, denim, outerwear, shoes, bags and accessories, all priced in US dollars. Runway edits and everyday essentials live side by side.",
    artKey: "fashion",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Fabric", value: "Composition, see garment label" },
      { label: "Fit", value: "True to size — sizing guide included" },
    ],
  },
  {
    id: "cat-07",
    name: "Jewelry",
    slug: "jewelry",
    tagline: "Fine pieces, lab stones and everyday sparkle.",
    description:
      "Engagement rings, tennis bracelets, chains, earrings and watches with carat weights and metal grades. Our highest-value category, up to $10,000.",
    artKey: "jewelry",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Material", value: "14k/18k gold or sterling silver" },
      { label: "Stone", value: "Lab-grown diamond or simulant" },
    ],
  },
  {
    id: "cat-08",
    name: "Fitness Equipment",
    slug: "fitness-equipment",
    tagline: "Home gym kit that survives a 6am session.",
    description:
      "Treadmills, bikes, rows, multi-gyms, dumbbells, benches and recovery kit for a serious home setup, with delivery and in-home assembly options.",
    artKey: "fitness",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Frame", value: "Steel, 12-month warranty" },
      { label: "Max user weight", value: "120–150kg" },
    ],
  },
  {
    id: "cat-09",
    name: "Auto Products",
    slug: "auto-products",
    tagline: "Dash cams, chargers, detailing and workshop tools.",
    description:
      "In-car tech, dash cameras, tyre care, detailing supplies and hand tools. Universal fit listings with nationwide US shipping estimates.",
    artKey: "auto",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Fitment", value: "Universal / check vehicle list" },
      { label: "Power", value: "12V socket or hardwire options" },
    ],
  },
  {
    id: "cat-10",
    name: "Home Improvement",
    slug: "home-improvement",
    tagline: "Tools, paint, storage and garden kit.",
    description:
      "Power tool sets, paint, flooring, shelving, security and outdoor power equipment for weekend projects, with next-day tool rental add-ons.",
    artKey: "homeImprovement",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Power", value: "Corded or 18V battery platform" },
      { label: "Warranty", value: "3-year replacement" },
    ],
  },
  {
    id: "cat-11",
    name: "Photography",
    slug: "photography",
    tagline: "Cameras, glass, lighting and gimbals.",
    description:
      "Mirrorless bodies, compact cameras, prime and zoom lenses, tripods, gimbals and studio lighting. Sensor, ISO and aperture figures throughout.",
    artKey: "photography",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Sensor", value: "Full-frame / APS-C" },
      { label: "Mount", value: "Bayonet mount" },
    ],
  },
  {
    id: "cat-12",
    name: "Music Equipment",
    slug: "music-equipment",
    tagline: "Guitars, keys, drums and studio monitors.",
    description:
      "Acoustic and electric guitars, digital pianos, drum machines, PA systems, studio monitors and DJ gear — playable, recordable and competitively priced.",
    artKey: "music",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Build", value: "Solid wood / metal chassis" },
      { label: "Connectivity", value: "¼\" TRS, MIDI and Bluetooth" },
    ],
  },
  {
    id: "cat-13",
    name: "Toys & Games",
    slug: "toys-games",
    tagline: "Build sets, models, puzzles and family play.",
    description:
      "Ages 3 to adult: construction sets, model kits, board games, puzzles, ride-ons and collectibles. Under $50 makes great gifts.",
    artKey: "toys",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Age range", value: "3+ / 6+ / 14+" },
      { label: "Pieces", value: "Piece count on packaging" },
    ],
  },
  {
    id: "cat-14",
    name: "Wedding",
    slug: "wedding",
    tagline: "Registry, attire and everything for the big day.",
    description:
      "Engagement rings, bridal and groom attire, invitations, decor and registry gifts — with gift registry and split-payment options.",
    artKey: "wedding",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Lead time", value: "2–6 weeks" },
      { label: "Registry", value: "Registry available" },
    ],
  },
  {
    id: "cat-15",
    name: "Travel",
    slug: "travel",
    tagline: "Luggage, cabins and everything for the terminal.",
    description:
      "Hardshell and softside luggage, backpacks, travel accessories, neck pillows, adapters and flight tech for domestic and international trips.",
    artKey: "travel",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Shell", value: "Polycarbonate or ballistic nylon" },
      { label: "Wheels", value: "4 spinner / 2 wheel" },
    ],
  },
  {
    id: "cat-16",
    name: "Outdoor Equipment",
    slug: "outdoor-equipment",
    tagline: "Camping, hiking, cycling and garden kit.",
    description:
      "Tents, sleeping bags, stoves, trekking poles, coolers, bikes, kayaks and garden power tools rated for all-season use.",
    artKey: "outdoor",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Season", value: "3-season / winter rated" },
      { label: "Weight", value: "Packed weight listed" },
    ],
  },
  {
    id: "cat-17",
    name: "Beauty",
    slug: "beauty",
    tagline: "Skincare, fragrance, hair and tools.",
    description:
      "Serums, moisturisers, fragrance, haircare, shave kits and styling tools, with batch numbers, ingredients and refill sizes.",
    artKey: "beauty",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Size", value: "ml / g on packaging" },
      { label: "Suitability", value: "Dermatologist tested" },
    ],
  },
  {
    id: "cat-18",
    name: "Mattresses & Bedroom",
    slug: "mattresses-bedroom",
    tagline: "Mattresses, beds, pillows and bedding.",
    description:
      "Hybrid, foam and pocket-spring mattresses, bed frames, headboards, pillows, duvets and bedroom storage, with 100-night trial messaging.",
    artKey: "mattresses",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Feel", value: "Medium / medium-firm" },
      { label: "Cover", value: "Removable, washable" },
    ],
  },
  {
    id: "cat-19",
    name: "Computers & Office",
    slug: "computers-office",
    tagline: "Laptops, desktops, monitors and desk kit.",
    description:
      "Business laptops, desktops, workstations, monitors, docking stations, chairs and office storage. Spec sheets with 12-month support.",
    artKey: "computers",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Memory", value: "16GB–64GB" },
      { label: "Support", value: "12-month support included" },
    ],
  },
  {
    id: "cat-20",
    name: "Smart Home",
    slug: "smart-home",
    tagline: "Hubs, cameras, locks and lighting.",
    description:
      "Hubs, security cameras, video doorbells, smart locks, lighting, thermostats, sensors and cleaning robots that work in one app.",
    artKey: "smartHome",
    priceRange: { min: 0, max: 0 },
    specs: [
      { label: "Connectivity", value: "Wi-Fi 6 + Thread" },
      { label: "Works with", value: "Alexa, Google, Siri" },
    ],
  },
];

export const CATEGORY_COUNT = CATEGORIES.length;

export const CATEGORIES_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category]),
);

export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug);

