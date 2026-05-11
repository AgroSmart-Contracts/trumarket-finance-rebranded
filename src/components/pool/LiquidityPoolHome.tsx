'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { ArrowRight, BarChart3, DollarSign, Landmark, LineChart } from 'lucide-react';
import { useLagoonVault } from '@/hooks/lagoon/useLagoonVault';
import { usePublishedDeals } from '@/hooks/usePublishedDeals';
import { TRUMARKET_LAGOON_VAULT_ADDRESS } from '@/integrations/lagoon/constants';
import { formatCompactNumber } from '@/lib/formatters';
import { formatTokenAmount, shortenAddress, vaultStateLabel } from '@/integrations/lagoon/lagoonFormatters';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/ui/MetricCard';
import { Sparkline } from '@/components/ui/Sparkline';
import { PoolFundedDealsContext } from '@/components/pool/PoolFundedDealsContext';
import { PoolPriceChart } from '@/components/pool/PoolPriceChart';
import { trumarketPrimaryLinkClass } from '@/components/ui/trumarket-buttons';
import { base } from 'wagmi/chains';

export default function LiquidityPoolHome() {
  const { deals, loading: dealsLoading } = usePublishedDeals();
  const vaultQuery = useLagoonVault();
  const vaultData = vaultQuery.data;

  const v = vaultData?.vault;
  const u = vaultData?.underlying;
  const derived = vaultData?.derived;

  const programsCount = deals.filter((d) => d.status !== 'finished').length;
  /** Aligned with `DealsInvestorDashboard` — fixed display value until sourced from analytics. */
  const dealValueGenerated = 13_400_000;
  const totalDealsCount = deals.length;

  /**
   * ALL APR (net, linear): oldest → latest Lagoon subgraph period summary only (same PPS + time window).
   * Not mixed with live `derived` PPS or wall-clock “now”. Configure `NEXT_PUBLIC_LAGOON_SUBGRAPH_URL`.
   */
  const estimatedAprLabel = useMemo(() => {
    const allApr = vaultData?.allApr;
    if (allApr != null && Number.isFinite(allApr.aprPercent)) {
      return `${allApr.aprPercent.toFixed(2)}%`;
    }
    return '—';
  }, [vaultData?.allApr]);

  if (vaultQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#62748E]">
        Loading TruMarket Liquidity Pool…
      </div>
    );
  }

  if (vaultQuery.isError || !v || !u || !derived) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-900">
        <p className="font-medium">Could not load pool data</p>
        <p className="mt-2">{vaultQuery.error?.message || 'Unknown error'}</p>
        <p className="mt-3 text-xs text-red-800">
          Connect to {base.name} in your wallet. Vault {shortenAddress(TRUMARKET_LAGOON_VAULT_ADDRESS)}
        </p>
      </div>
    );
  }

  const tvlHuman = Number(formatUnits(v.totalAssets, u.decimals));
  const tvlLabel = `${formatCompactNumber(tvlHuman)} ${u.symbol}`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F8FAFC] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4E8C37]">
              TruMarket · Base
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#0F172B] sm:text-3xl">
              TruMarket Liquidity Pool
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#62748E]">
              One Lagoon vault pools liquidity for TruMarket trade finance. Deposit the underlying
              token, receive pool shares after settlement, and track allocations for reporting.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#62748E]">
              <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5">{base.name}</span>
              <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5">Asset {u.symbol}</span>
              <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5">
                {vaultStateLabel(v.state)}
              </span>
              <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5">
                Programs: {dealsLoading ? '…' : programsCount}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-stretch sm:items-center">
            <Link
              href="/pool"
              className={cn(trumarketPrimaryLinkClass(), 'h-10 w-full sm:w-auto')}
            >
              Invest in pool
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          label="Pool TVL"
          value={tvlLabel}
          icon={Landmark}
          iconColor="#4E8C37"
          iconBackgroundColor="#ECFDF5"
          sparkline={<Sparkline color="#4E8C37" />}
          width="100%"
        />
        <MetricCard
          label="APR (ALL, est.)"
          value={estimatedAprLabel}
          icon={LineChart}
          iconColor="#0F172B"
          iconBackgroundColor="#F1F5F9"
          sparkline={<Sparkline color="#64748B" />}
          width="100%"
        />
        <MetricCard
          label="Deal Value Generated"
          value={`$${formatCompactNumber(dealValueGenerated)}`}
          icon={DollarSign}
          iconColor="#4E8C37"
          iconBackgroundColor="#ECFDF5"
          sparkline={<Sparkline color="#4E8C37" />}
          width="100%"
        />
        <MetricCard
          label="Number of deals"
          value={dealsLoading ? '…' : String(totalDealsCount)}
          icon={BarChart3}
          iconColor="#62748E"
          iconBackgroundColor="#F8FAFC"
          width="100%"
          change={{ value: 'TruMarket', isPositive: true }}
        />
      </div>

      <p className="mt-3 text-xs text-[#94A3B8]">
        TVL uses on-chain vault totals. ALL APR (when shown) is the linear net APR from Lagoon
        subgraph period summaries (oldest → latest period). Chart history uses settlements and
        valuation events. Deal counts use published programs from the database.
      </p>

      <div className="mt-10">
        <PoolPriceChart
          vaultSymbol={v.symbol ?? 'Shares'}
          underlyingSymbol={u.symbol}
          totalAssetsRaw={v.totalAssets}
          assetDecimals={u.decimals}
          history={vaultData?.priceHistory ?? []}
        />
      </div>

      <div className="mt-10">
        <PoolFundedDealsContext deals={deals} loading={dealsLoading} />
      </div>
    </div>
  );
}
