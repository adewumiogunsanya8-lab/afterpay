import {
  CheckIcon,
  ClockIcon,
  TruckIcon,
} from "@/components/Icons";
import { PAY_LATER_STEPS, WHY_AFTERPAY } from "@/data/site";
import { SectionHeader } from "@/components/SectionHeader";

/** "How AfterPay works" — the four steps plus the required disclaimer. */
export function PayLaterSteps({ className }: { className?: string }) {
  return (
    <section id="how-it-works" className={className}>
      <SectionHeader
        eyebrow="How it works"
        title="How AfterPay works"
        description="See how to browse, compare products and review your order."
        align="center"
      />

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PAY_LATER_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="relative card p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="absolute right-4 top-4 text-3xl font-black tabular-nums text-ink-100">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-base font-bold text-white shadow-sm">
              {index + 1}
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.body}</p>
          </li>
        ))}
      </ol>

    </section>
  );
}

/** "Why AfterPay" value props. */
export function WhyAfterPay({ className }: { className?: string }) {
  return (
    <section id="why-afterpay" className={className}>
      <SectionHeader
        eyebrow="Why AfterPay"
        title="Why shop with us"
        description="A straightforward storefront with clear pricing and delivery estimates."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WHY_AFTERPAY.map((item) => (
          <li
            key={item.title}
            className="card flex flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-50">
              <CheckIcon className="h-4 w-4 text-mint-600" />
            </span>
            <h3 className="mt-3.5 text-base font-semibold text-ink-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The trust strip: the guarantees repeated as scannable facts. */
export function TrustSignals({ className }: { className?: string }) {
  const signals = [
    { icon: TruckIcon, title: "Free shipping $75+", body: "Tracked standard delivery across the United States." },
    { icon: ClockIcon, title: "3–12 month plans", body: "Choose the period that fits your month." },
  ];

  return (
    <section id="trust" className={className}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {signals.map((signal) => (
          <li key={signal.title} className="card flex items-start gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
              <signal.icon className="h-4 w-4 text-brand-600" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink-950">{signal.title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{signal.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The "About this site" section shown on the homepage. */
export function AboutSection({ className }: { className?: string }) {
  return (
    <section id="about" className={className}>
      <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-surface p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-100/50 blur-2xl"
        />
        <p className="eyebrow mb-2">About this site</p>
        <h2 className="heading max-w-3xl">Shop, compare and review products</h2>
        <div className="mt-3 grid gap-4 text-sm leading-relaxed text-ink-600 sm:grid-cols-2">
          <p>
            AfterPay is a shopping storefront for customers in the United States, with product
            browsing, search, a cart and a guided checkout. Prices are quoted in US dollars, with
            free standard shipping over $75.
          </p>
          <p>
            Monthly installment estimates help shoppers compare payment periods. Payment options
            and delivery details are shown before order confirmation.
          </p>
        </div>
      </div>
    </section>
  );
}
