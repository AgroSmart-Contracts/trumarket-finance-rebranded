'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLagoonVaultContext } from '@/context/lagoon-vault-context';
import { formatTokenAmount } from '@/integrations/lagoon/lagoonFormatters';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PoolPriceChart } from '@/components/pool/PoolPriceChart';
import { trumarketSecondaryLinkClass } from '@/components/ui/trumarket-buttons';

export function PoolOverviewMain() {
  const { vault, underlying, derived, pendingSettlement, priceHistory } = useLagoonVaultContext();

  if (!vault || !underlying || !derived) return null;

  const pendingA = pendingSettlement
    ? formatTokenAmount(pendingSettlement.assets, underlying.decimals)
    : '0';
  const pendingS = pendingSettlement
    ? formatTokenAmount(pendingSettlement.shares, vault.decimals)
    : '0';

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <SectionHeader className="mb-4">Pool financials</SectionHeader>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-xl bg-[#F8FAFC] p-8">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[12px] border-[#4E8C37] border-opacity-30 bg-white shadow-inner">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-[#62748E]">
                  Pool TVL
                </p>
                <p className="mt-2 text-xl font-semibold text-[#0F172B]">
                  {formatTokenAmount(vault.totalAssets, underlying.decimals, 0)}
                </p>
                <p className="text-sm text-[#62748E]">{underlying.symbol}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#F1F5F9] py-2">
              <span className="text-[#62748E]">Total supply (shares)</span>
              <span className="font-medium text-[#0F172B]">
                {formatTokenAmount(vault.totalSupply, vault.decimals)} {vault.symbol}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#F1F5F9] py-2">
              <span className="text-[#62748E]">Price per share</span>
              <span className="font-medium text-[#0F172B]">
                {formatTokenAmount(derived.pricePerShareInAsset, underlying.decimals)}{' '}
                {underlying.symbol}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#F1F5F9] py-2">
              <span className="text-[#62748E]">Pending silo (assets / shares)</span>
              <span className="font-medium text-[#0F172B]">
                {pendingA} / {pendingS}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#62748E]">Settlement epochs</span>
              <span className="text-right font-medium text-[#0F172B]">
                Deposit settle #{vault.depositSettleId} · Redeem settle #{vault.redeemSettleId}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/pool/activity" className={cn(trumarketSecondaryLinkClass('light'))}>
            View on-chain activity
          </Link>
        </div>
      </div>

      <PoolPriceChart
        vaultSymbol={vault.symbol ?? 'Shares'}
        underlyingSymbol={underlying.symbol}
        totalAssetsRaw={vault.totalAssets}
        assetDecimals={underlying.decimals}
        history={priceHistory}
      />
    </div>
  );
}
