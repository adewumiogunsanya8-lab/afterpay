import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CartIcon,
  InfoIcon,
  SparkleIcon,
  TagIcon,
  TruckIcon,
} from "@/components/Icons";

const benefits = [
  { icon: InfoIcon, label: "Clear product details" },
  { icon: TruckIcon, label: "Fast, reliable delivery" },
  { icon: TagIcon, label: "Great deals" },
  { icon: SparkleIcon, label: "Helpful support" },
];

/** Homepage introduction and store artwork. */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8ff] text-ink-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 -top-48 h-[34rem] w-[34rem] rounded-full bg-brand-200/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 left-[24%] h-[30rem] w-[30rem] rounded-full bg-mint-200/10 blur-3xl"
      />

      <div className="container-page relative py-10 sm:py-14 lg:py-16 xl:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-8 xl:gap-12">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-100/75 px-4 py-2.5 text-sm font-semibold text-brand-800">
              <CartIcon className="h-5 w-5 text-brand-700" />
              Shop smarter. Live better.
            </p>

            <h1 className="mt-6 text-[clamp(2.75rem,4.8vw,4.75rem)] font-extrabold leading-[0.99] tracking-[-0.055em] text-ink-950">
              <span className="block">Everything You</span>
              <span className="block">
                Need, <span className="text-brand-600">One Place.</span>
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
              Discover quality products, great prices and a seamless shopping
              experience — all in one store.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-5 xl:gap-x-8">
              {benefits.map((benefit) => (
                <li
                  key={benefit.label}
                  className="flex max-w-32 flex-col items-center text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100/80 text-brand-700">
                    <benefit.icon className="h-7 w-7" />
                  </span>
                  <span className="mt-2.5 text-sm font-medium leading-snug text-ink-800">
                    {benefit.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href="/categories" className="btn btn-primary btn-lg gap-3 px-9">
                Shop now
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-3xl lg:ml-auto">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-ink-950 shadow-[0_28px_70px_-30px_rgb(23_37_84/0.42)] sm:rounded-[2.5rem]">
              <Image
                src="/banner.png"
                alt="Cars, phones and home appliances available in the store"
                width={1536}
                height={1024}
                sizes="(min-width: 1280px) 54vw, (min-width: 1024px) 52vw, 100vw"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
