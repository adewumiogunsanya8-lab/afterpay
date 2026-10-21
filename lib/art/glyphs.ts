import type { CategoryArtKey } from "@/data/types";

/**
 * Category illustration library for the generated product images.
 *
 * Each glyph is a small vector drawing of the product type (a TV is drawn for
 * televisions, a sofa for sofas, a laptop for laptops, …) so generated
 * images stay visually relevant without shipping 400 raster files or
 * depending on external image hosts.
 *
 * Every glyph is authored inside a 320 × 240 box and is tinted at render time
 * by replacing `%INK%` and `%ACCENT%`.
 */
export const GLYPHS: Record<CategoryArtKey, string> = {
  electronics: `
    <rect x="20" y="40" width="280" height="158" rx="12" fill="%ACCENT%" opacity="0.22"/>
    <rect x="34" y="54" width="252" height="130" rx="6" fill="none" stroke="%INK%" stroke-width="7"/>
    <path d="M150 194h20l6 22h-32z" fill="%INK%"/>
    <rect x="112" y="216" width="96" height="9" rx="4.5" fill="%INK%"/>
    <rect x="70" y="90" width="120" height="9" rx="4.5" fill="%ACCENT%"/>
    <rect x="70" y="112" width="80" height="9" rx="4.5" fill="%INK%" opacity="0.35"/>
    <rect x="70" y="134" width="150" height="9" rx="4.5" fill="%INK%" opacity="0.2"/>`,
  furniture: `
    <rect x="26" y="92" width="268" height="86" rx="18" fill="%ACCENT%" opacity="0.25"/>
    <rect x="40" y="58" width="240" height="60" rx="16" fill="%INK%"/>
    <rect x="52" y="120" width="104" height="44" rx="12" fill="%INK%" opacity="0.75"/>
    <rect x="164" y="120" width="104" height="44" rx="12" fill="%INK%" opacity="0.75"/>
    <rect x="20" y="104" width="40" height="82" rx="16" fill="%INK%"/>
    <rect x="260" y="104" width="40" height="82" rx="16" fill="%INK%"/>
    <rect x="44" y="186" width="14" height="22" rx="5" fill="%INK%"/>
    <rect x="262" y="186" width="14" height="22" rx="5" fill="%INK%"/>`,
  appliances: `
    <rect x="76" y="18" width="168" height="204" rx="16" fill="%ACCENT%" opacity="0.22"/>
    <rect x="90" y="32" width="140" height="176" rx="10" fill="none" stroke="%INK%" stroke-width="7"/>
    <path d="M90 108h140" stroke="%INK%" stroke-width="7"/>
    <rect x="104" y="60" width="9" height="34" rx="4.5" fill="%INK%"/>
    <rect x="207" y="60" width="9" height="34" rx="4.5" fill="%INK%"/>
    <rect x="104" y="132" width="9" height="42" rx="4.5" fill="%INK%"/>
    <rect x="140" y="140" width="70" height="24" rx="8" fill="%INK%" opacity="0.3"/>`,
  mobile: `
    <rect x="106" y="14" width="108" height="212" rx="22" fill="%ACCENT%" opacity="0.25"/>
    <rect x="118" y="26" width="84" height="188" rx="14" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="140" y="34" width="40" height="8" rx="4" fill="%INK%"/>
    <rect x="136" y="64" width="48" height="70" rx="8" fill="%INK%" opacity="0.3"/>
    <rect x="136" y="150" width="48" height="9" rx="4.5" fill="%INK%" opacity="0.5"/>
    <rect x="136" y="172" width="30" height="9" rx="4.5" fill="%INK%" opacity="0.5"/>`,
  gaming: `
    <path d="M104 74h112c30 0 48 22 54 52l8 44c5 26-22 40-40 22l-26-24H108l-26 24c-18 18-45 4-40-22l8-44c6-30 24-52 54-52z" fill="%ACCENT%" opacity="0.25"/>
    <path d="M104 74h112c30 0 48 22 54 52l8 44c5 26-22 40-40 22l-26-24H108l-26 24c-18 18-45 4-40-22l8-44c6-30 24-52 54-52z" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="86" y="98" width="34" height="9" rx="4.5" fill="%INK%"/>
    <rect x="98" y="86" width="9" height="34" rx="4.5" fill="%INK%"/>
    <circle cx="224" cy="102" r="16" fill="none" stroke="%INK%" stroke-width="7"/>
    <circle cx="252" cy="126" r="16" fill="none" stroke="%INK%" stroke-width="7"/>`,
  fashion: `
    <path d="M126 34l34 20 34-20 62 34-22 44-20-10v88H106v-88l-20 10-22-44z" fill="%ACCENT%" opacity="0.25"/>
    <path d="M126 34l34 20 34-20 62 34-22 44-20-10v88H106v-88l-20 10-22-44z" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <path d="M126 34l34 34 34-34" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="160" cy="24" r="9" fill="none" stroke="%INK%" stroke-width="7"/>`,
  jewelry: `
    <circle cx="160" cy="150" r="62" fill="none" stroke="%INK%" stroke-width="12"/>
    <circle cx="160" cy="150" r="62" fill="%ACCENT%" opacity="0.15"/>
    <path d="M160 30l34 34-34 44-34-44z" fill="%ACCENT%" opacity="0.5"/>
    <path d="M160 30l34 34-34 44-34-44z" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <path d="M126 64h68" stroke="%INK%" stroke-width="7"/>`,
  fitness: `
    <rect x="30" y="106" width="260" height="18" rx="9" fill="%INK%"/>
    <rect x="46" y="60" width="34" height="110" rx="12" fill="%ACCENT%" opacity="0.6"/>
    <rect x="240" y="60" width="34" height="110" rx="12" fill="%ACCENT%" opacity="0.6"/>
    <rect x="86" y="76" width="20" height="78" rx="9" fill="%INK%" opacity="0.7"/>
    <rect x="214" y="76" width="20" height="78" rx="9" fill="%INK%" opacity="0.7"/>
    <path d="M136 200h48" stroke="%INK%" stroke-width="7" stroke-linecap="round"/>`,
  auto: `
    <path d="M40 148l30-48c6-10 16-16 28-16h124c12 0 22 6 28 16l30 48v34a8 8 0 0 1-8 8h-28a8 8 0 0 1-8-8v-8H74v8a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8z" fill="%ACCENT%" opacity="0.25"/>
    <path d="M40 148l30-48c6-10 16-16 28-16h124c12 0 22 6 28 16l30 48v34a8 8 0 0 1-8 8h-28a8 8 0 0 1-8-8v-8H74v8a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8z" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="88" cy="164" r="20" fill="none" stroke="%INK%" stroke-width="8"/>
    <circle cx="232" cy="164" r="20" fill="none" stroke="%INK%" stroke-width="8"/>`,
  homeImprovement: `
    <rect x="96" y="70" width="120" height="56" rx="12" fill="%ACCENT%" opacity="0.35"/>
    <rect x="96" y="70" width="120" height="56" rx="12" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="216" y="88" width="42" height="20" rx="6" fill="%INK%"/>
    <path d="M136 126l-14 78h58l-12-78z" fill="%INK%" opacity="0.8"/>
    <rect x="258" y="92" width="14" height="12" rx="4" fill="%INK%" opacity="0.5"/>
    <path d="M70 196h180" stroke="%INK%" stroke-width="7" stroke-linecap="round"/>`,
  photography: `
    <rect x="42" y="70" width="236" height="140" rx="16" fill="%ACCENT%" opacity="0.25"/>
    <rect x="42" y="70" width="236" height="140" rx="16" fill="none" stroke="%INK%" stroke-width="7"/>
    <path d="M110 70l16-24h68l16 24" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="160" cy="140" r="48" fill="none" stroke="%INK%" stroke-width="8"/>
    <circle cx="160" cy="140" r="20" fill="%INK%" opacity="0.35"/>
    <rect x="224" y="92" width="26" height="12" rx="6" fill="%INK%" opacity="0.5"/>`,
  music: `
    <circle cx="126" cy="164" r="58" fill="%ACCENT%" opacity="0.3"/>
    <circle cx="126" cy="164" r="58" fill="none" stroke="%INK%" stroke-width="7"/>
    <circle cx="126" cy="164" r="22" fill="none" stroke="%INK%" stroke-width="7"/>
    <path d="M184 150V36l90-22v112" fill="none" stroke="%INK%" stroke-width="9" stroke-linecap="round"/>
    <path d="M184 92l90-22" stroke="%INK%" stroke-width="6" opacity="0.5"/>`,
  toys: `
    <rect x="46" y="120" width="76" height="76" rx="12" fill="%ACCENT%" opacity="0.45"/>
    <rect x="46" y="120" width="76" height="76" rx="12" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="132" y="120" width="76" height="76" rx="12" fill="%INK%" opacity="0.25"/>
    <rect x="132" y="120" width="76" height="76" rx="12" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="218" y="120" width="56" height="76" rx="12" fill="%ACCENT%" opacity="0.25"/>
    <rect x="218" y="120" width="56" height="76" rx="12" fill="none" stroke="%INK%" stroke-width="7"/>
    <circle cx="160" cy="62" r="34" fill="none" stroke="%INK%" stroke-width="7"/>
    <path d="M126 62h68" stroke="%INK%" stroke-width="7"/>`,
  wedding: `
    <circle cx="116" cy="150" r="56" fill="none" stroke="%INK%" stroke-width="11"/>
    <circle cx="204" cy="150" r="56" fill="none" stroke="%INK%" stroke-width="11"/>
    <circle cx="116" cy="150" r="56" fill="%ACCENT%" opacity="0.15"/>
    <path d="M160 30l30 30-30 40-30-40z" fill="%ACCENT%" opacity="0.5"/>
    <path d="M160 30l30 30-30 40-30-40z" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <path d="M130 60h60" stroke="%INK%" stroke-width="7"/>`,
  travel: `
    <rect x="72" y="56" width="176" height="150" rx="18" fill="%ACCENT%" opacity="0.25"/>
    <rect x="72" y="56" width="176" height="150" rx="18" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="122" y="26" width="76" height="34" rx="10" fill="none" stroke="%INK%" stroke-width="8"/>
    <path d="M72 116h176" stroke="%INK%" stroke-width="7"/>
    <circle cx="112" cy="212" r="12" fill="%INK%"/>
    <circle cx="208" cy="212" r="12" fill="%INK%"/>`,
  outdoor: `
    <path d="M24 196L152 44l128 152z" fill="%ACCENT%" opacity="0.3"/>
    <path d="M24 196L152 44l128 152z" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <path d="M152 44l58 152" fill="none" stroke="%INK%" stroke-width="6" opacity="0.55"/>
    <path d="M152 44L94 196" fill="none" stroke="%INK%" stroke-width="6" opacity="0.55"/>
    <path d="M40 208h240" stroke="%INK%" stroke-width="8" stroke-linecap="round"/>`,
  beauty: `
    <rect x="112" y="88" width="96" height="116" rx="16" fill="%ACCENT%" opacity="0.3"/>
    <rect x="112" y="88" width="96" height="116" rx="16" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="136" y="48" width="48" height="44" rx="10" fill="%INK%"/>
    <path d="M148 24h24v26h-24z" fill="%INK%" opacity="0.6"/>
    <rect x="132" y="126" width="56" height="10" rx="5" fill="%INK%" opacity="0.5"/>
    <rect x="132" y="148" width="38" height="10" rx="5" fill="%INK%" opacity="0.35"/>
    <circle cx="238" cy="60" r="16" fill="%ACCENT%" opacity="0.7"/>
    <path d="M238 92c-12 16-18 24-18 32a18 18 0 0 0 36 0c0-8-6-16-18-32z" fill="%ACCENT%"/>`,
  mattresses: `
    <rect x="34" y="96" width="252" height="70" rx="14" fill="%ACCENT%" opacity="0.3"/>
    <rect x="34" y="96" width="252" height="70" rx="14" fill="none" stroke="%INK%" stroke-width="7"/>
    <path d="M34 128h252M34 148h252" stroke="%INK%" stroke-width="4" opacity="0.4"/>
    <rect x="52" y="62" width="96" height="34" rx="14" fill="%INK%" opacity="0.8"/>
    <rect x="44" y="166" width="18" height="34" rx="6" fill="%INK%"/>
    <rect x="258" y="166" width="18" height="34" rx="6" fill="%INK%"/>
    <path d="M34 200h252" stroke="%INK%" stroke-width="7" stroke-linecap="round"/>`,
  computers: `
    <rect x="52" y="34" width="216" height="134" rx="12" fill="%ACCENT%" opacity="0.25"/>
    <rect x="52" y="34" width="216" height="134" rx="12" fill="none" stroke="%INK%" stroke-width="7"/>
    <rect x="76" y="58" width="168" height="86" rx="6" fill="%INK%" opacity="0.2"/>
    <path d="M92 120l40-38 30 28 26-20 34 30z" fill="%INK%" opacity="0.55"/>
    <path d="M20 168h280l-16 34H36z" fill="%INK%"/>
    <path d="M140 182h40" stroke="%ACCENT%" stroke-width="7" stroke-linecap="round"/>`,
  smartHome: `
    <path d="M40 118L160 32l120 86v92a12 12 0 0 1-12 12H52a12 12 0 0 1-12-12z" fill="%ACCENT%" opacity="0.25"/>
    <path d="M40 118L160 32l120 86v92a12 12 0 0 1-12 12H52a12 12 0 0 1-12-12z" fill="none" stroke="%INK%" stroke-width="7" stroke-linejoin="round"/>
    <path d="M118 222v-56a42 42 0 0 1 84 0v56" fill="none" stroke="%INK%" stroke-width="7"/>
    <path d="M136 92a48 48 0 0 1 48 0M120 70a76 76 0 0 1 80 0" fill="none" stroke="%INK%" stroke-width="7" stroke-linecap="round" opacity="0.6"/>`,
};
