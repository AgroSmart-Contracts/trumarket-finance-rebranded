import * as React from 'react';
import { cn } from '@/lib/utils';

const PRIMARY =
  'bg-[#4E8C37] text-white hover:bg-[#3A6A28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C37] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const PRIMARY_DISABLED = 'disabled:pointer-events-none disabled:opacity-50 disabled:hover:bg-[#4E8C37]';

/** Same visual as `TruMarketPrimaryButton` for `<Link className={cn(trumarketPrimaryLinkClass(), 'w-full')} />`. */
export function trumarketPrimaryLinkClass() {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
    PRIMARY,
  );
}

/** TruMarket primary CTA: white label on brand green (`COLORS.primary.green`). */
export const TruMarketPrimaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean }
>(({ className, fullWidth = true, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
      PRIMARY,
      PRIMARY_DISABLED,
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  />
));
TruMarketPrimaryButton.displayName = 'TruMarketPrimaryButton';

export const trumarketSecondaryBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';

const SECONDARY_LIGHT =
  'border border-[#CBD5E1] bg-white text-[#0F172B] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C37]/40 focus-visible:ring-offset-2';

const SECONDARY_DARK =
  'border border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a101d]';

export type TruMarketSecondaryVariant = 'light' | 'dark';

/** Use on `<Link className={cn(trumarketSecondaryLinkClass('light'), 'w-full')} />` when a link should match secondary buttons. */
export function trumarketSecondaryLinkClass(variant: TruMarketSecondaryVariant = 'light') {
  return cn(trumarketSecondaryBaseClass, variant === 'dark' ? SECONDARY_DARK : SECONDARY_LIGHT);
}

/** Outline / secondary actions (e.g. “View activity”). Use `variant="dark"` on navy pool panels. */
export const TruMarketSecondaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    fullWidth?: boolean;
    variant?: TruMarketSecondaryVariant;
  }
>(({ className, fullWidth = false, variant = 'light', type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      trumarketSecondaryBaseClass,
      variant === 'dark' ? SECONDARY_DARK : SECONDARY_LIGHT,
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  />
));
TruMarketSecondaryButton.displayName = 'TruMarketSecondaryButton';
