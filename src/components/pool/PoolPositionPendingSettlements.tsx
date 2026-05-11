'use client';

import type { ReactNode } from 'react';
import { formatTokenAmount } from '@/integrations/lagoon/lagoonFormatters';

export interface PoolPositionPendingSettlementsProps {
  vaultSymbol: string;
  underlyingSymbol: string;
  assetDecimals: number;
  shareDecimals: number;
  /** Pending deposit in underlying assets (silo), awaiting settlement. */
  pendingDepositAssets: bigint;
  /** Pending redemption in pool shares, awaiting settlement. */
  pendingRedeemShares: bigint;
}

const shareAccentClass = 'font-medium text-[#0D9488]';

/** Hide rows that would display as "0" due to rounding (same idea as deposits). */
function isVisibleTokenAmount(value: bigint, decimals: number): boolean {
  if (value <= BigInt(0)) return false;
  const fmt = formatTokenAmount(value, decimals).replace(/,/g, '');
  const n = parseFloat(fmt);
  return Number.isFinite(n) && n > 0;
}

function PendingBlock({
  title,
  children,
  footnote,
}: {
  title: string;
  children: ReactNode;
  footnote: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">{title}</p>
      <p className="mt-1.5 text-sm tabular-nums text-[#0F172B]">{children}</p>
      <p className="mt-1.5 text-[11px] leading-snug text-[#94A3B8]">{footnote}</p>
    </div>
  );
}

export function PoolPositionPendingSettlements({
  vaultSymbol,
  underlyingSymbol,
  assetDecimals,
  shareDecimals,
  pendingDepositAssets,
  pendingRedeemShares,
}: PoolPositionPendingSettlementsProps) {
  const showDeposit = isVisibleTokenAmount(pendingDepositAssets, assetDecimals);
  const showRedeem = isVisibleTokenAmount(pendingRedeemShares, shareDecimals);
  if (!showDeposit && !showRedeem) return null;

  return (
    <div className="mt-4 space-y-4 border-t border-[#F1F5F9] pt-4">
      {showDeposit && (
        <PendingBlock
          title="Deposited"
          footnote="Your deposit is pending the next settlement."
        >
          <span>{formatTokenAmount(pendingDepositAssets, assetDecimals)}</span>{' '}
          <span>{underlyingSymbol}</span>
          <span className="text-[#94A3B8]"> → </span>
          <span className={shareAccentClass}>{vaultSymbol}</span>
        </PendingBlock>
      )}
      {showRedeem && (
        <PendingBlock
          title="Redemption submitted"
          footnote="Your redemption is pending the next settlement."
        >
          <span className={shareAccentClass}>
            {formatTokenAmount(pendingRedeemShares, shareDecimals)} {vaultSymbol}
          </span>
          <span className="text-[#94A3B8]"> → </span>
          <span>{underlyingSymbol}</span>
        </PendingBlock>
      )}
    </div>
  );
}
