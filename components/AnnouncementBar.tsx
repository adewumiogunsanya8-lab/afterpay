"use client";

import Link from "next/link";
import { SparkleIcon, TruckIcon } from "@/components/Icons";

/** Sleek top announcement strip with installment & shipping highlights. */
export function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-ink-950 text-ink-200">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(37 99 235 / 0.3) 0%, transparent 35%, transparent 65%, rgb(6 182 212 / 0.22) 100%)",
        }}
      />
      <div className="container-page relative flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 text-[0.6875rem] sm:text-xs">
        <div className="flex items-center gap-2 font-medium text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-mint-500/20 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-mint-300 ring-1 ring-mint-400/30">
            <SparkleIcon className="h-3 w-3" />
            AfterPay 0% APR
          </span>
          <span>Split eligible purchases across 3, 6, 9 or 12 monthly payments</span>
        </div>

        <div className="hidden items-center gap-5 text-ink-300 md:flex">
          <span className="inline-flex items-center gap-1.5">
            <TruckIcon className="h-3.5 w-3.5 text-mint-400" />
            Free US shipping over $75
          </span>
          
          <Link
            href="/#how-it-works"
            className="font-semibold text-mint-300 underline decoration-mint-400/50 underline-offset-4 transition hover:text-white"
          >
            How it works →
          </Link>
        </div>
      </div>
    </div>
  );
}
