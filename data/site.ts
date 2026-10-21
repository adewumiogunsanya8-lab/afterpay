/**
 * Storefront content and links.
 */
export const SITE = {
  name: "AfterPay",
  tagline: "Shop now. Pay over time.",
  description:
    "AfterPay is a US shopping marketplace with clear monthly payment estimates on eligible products.",
} as const;

/** The four steps shown in "How AfterPay Works". */
export const PAY_LATER_STEPS = [
  {
    title: "Choose your product",
    body: "Browse the catalogue and compare monthly installment estimates alongside eligible product prices.",
  },
  {
    title: "Pick your payment plan",
    body: "Select Pay in full or split your purchase across 3, 6, 9 or 12 months. Our live calculator breaks down every payment upfront.",
  },
  {
    title: "Preview your schedule",
    body: "Review the estimated payment schedule, delivery details and order before confirming.",
  },
  {
    title: "Choose your delivery",
    body: "Select standard or express tracked delivery, then review your order details before confirming.",
  },
] as const;

export const WHY_AFTERPAY = [
  {
    title: "One market, one transparent cart",
    body: "Every price, shipping estimate and installment figure is quoted in US dollars, with free standard shipping on orders over $75.",
  },
  {
    title: "Monthly cost shown upfront",
    body: "The monthly installment figure sits next to the price on every product card, so you can judge affordability before you even click.",
  },
  {
    title: "Payment estimates at a glance",
    body: "Compare monthly payment estimates alongside eligible product prices.",
  },
  {
    title: "Free 30-day returns",
    body: "Changed your mind? Returns are free within 30 days, with convenient drop-off points nationwide across the United States.",
  },
  {
    title: "Fast, tracked US delivery",
    body: "Every order ships tracked from an AfterPay fulfilment centre with standard (3–5 days) and express (1–2 days) options.",
  },
  {
    title: "A considered catalogue",
    body: "Explore products with detailed specifications, customer ratings and multiple images.",
  },
] as const;

export const FAQS = [
  {
    question: "How do I place an order?",
    answer:
      "Add products to your cart, enter your contact and delivery details, then review the order before confirming.",
  },
  {
    question: "What currency are prices in?",
    answer: "Every price is quoted in US dollars.",
  },
  {
    question: "How much is shipping?",
    answer:
      "Standard shipping is $4.99 and is free on orders over $75. Express shipping is $14.99. Both are tracked.",
  },
  {
    question: "Which payment periods can I choose?",
    answer:
      "Eligible products can be split across 3, 6, 9 or 12 monthly payments, and you can always pay in full instead. The periods available for a given price are shown on the product page, and you can compare them side by side in the installment calculator before you commit.",
  },
  {
    question: "Can I use a promo code?",
    answer:
      "Not yet. Discounts are already applied to the catalogue so you can see how marked-down products behave across the product page, the category filters and the cart.",
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All categories", href: "/categories" },
      { label: "Deals", href: "/search?deals=1" },
      { label: "New arrivals", href: "/search?sort=newest" },
      { label: "Best sellers", href: "/search?sort=rating" },
    ],
  },
  {
    heading: "Pay over time",
    links: [
      { label: "How AfterPay works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
      { label: "Why AfterPay", href: "/#why-afterpay" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About AfterPay", href: "/#about" },
      { label: "Help centre", href: "/#faq" },
    ],
  },
] as const;
