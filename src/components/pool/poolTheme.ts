import { cn } from '@/lib/utils';

/** Large pool panels (chart, transact) — white surface, TruMarket dashboard. */
export const poolDarkPanelClass = cn(
  'rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172B] shadow-sm',
);

/** Compact action cards (claim / withdraw). */
export const poolActionCardClass = cn(
  'rounded-xl border border-[#E2E8F0] bg-white p-5 text-[#0F172B] shadow-sm',
);

/** Uppercase section label — TruMarket primary green. */
export const poolAccentLabelClass =
  'text-xs font-semibold uppercase tracking-wide text-[#4E8C37]';

/** Secondary / helper copy on light pool cards. */
export const poolMutedOnDark = 'text-xs leading-relaxed text-[#62748E]';
