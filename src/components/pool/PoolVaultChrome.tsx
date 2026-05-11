'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { useLagoonVaultContext } from '@/context/lagoon-vault-context';
import { usePublishedDeals } from '@/hooks/usePublishedDeals';
import { useLagoonMutations } from '@/hooks/lagoon/useLagoonMutations';
import { TRUMARKET_LAGOON_VAULT_ADDRESS } from '@/integrations/lagoon/constants';
import { formatBpsRate, formatTokenAmount, shortenAddress, vaultStateLabel } from '@/integrations/lagoon/lagoonFormatters';
import { cn } from '@/lib/utils';
import { PoolPositionSidebar } from '@/components/pool/PoolPositionSidebar';
import { PoolDepositRedeemPanel } from '@/components/pool/PoolDepositRedeemPanel';
import { base } from 'wagmi/chains';
import { RiskBadge } from '@/components/ui/RiskBadge';

const tabs = [
  { href: '/pool', label: 'Overview' },
  { href: '/pool/activity', label: 'Activity' },
  { href: '/pool/details', label: 'Details' },
];

export default function PoolVaultChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { deals, loading: dealsLoading } = usePublishedDeals();
  const { vault, underlying, derived, user, userLoading, vaultLoading, error } =
    useLagoonVaultContext();

  const assetDecimals = underlying?.decimals ?? 18;
  const mutations = useLagoonMutations(assetDecimals);

  const claimBusy =
    mutations.flowStatus === 'pending_wallet' || mutations.flowStatus === 'pending_confirm';
  const withdrawBusy = claimBusy;

  if (vaultLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#62748E]">
        Loading vault…
      </div>
    );
  }

  if (error || !vault || !underlying || !derived) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-red-800">
        <p className="font-medium">Unable to load the TruMarket pool</p>
        <p className="mt-2">{error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  const tvl = `${formatTokenAmount(vault.totalAssets, underlying.decimals, 0)} ${underlying.symbol}`;
  const px = `1 ${vault.symbol} ≈ ${formatTokenAmount(derived.pricePerShareInAsset, underlying.decimals)} ${underlying.symbol}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#62748E] hover:text-[#0F172B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pool overview
        </Link>

        {/* Deal-details–style header */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,28rem)] lg:items-start lg:gap-x-8">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-[#0F172B] sm:text-3xl">
                  {vault.name || 'TruMarket Liquidity Pool'}
                </h1>
                <a
                  href={`https://basescan.org/address/${TRUMARKET_LAGOON_VAULT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full p-1 text-[#62748E] hover:bg-[#F1F5F9]"
                  aria-label="View on Basescan"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <RiskBadge risk="low" size="sm" showLabel />
                <span className="rounded-full bg-[#ECFDF5] px-3 py-0.5 text-xs font-medium text-[#166534]">
                  {vaultStateLabel(vault.state)}
                </span>
                <span className="rounded-full bg-[#F1F5F9] px-3 py-0.5 text-xs text-[#475569]">
                  {base.name}
                </span>
                <span className="rounded-full bg-[#F1F5F9] px-3 py-0.5 text-xs text-[#475569]">
                  Deposit: {underlying.symbol}
                </span>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#62748E]">
                Invest in the TruMarket Lagoon vault on Base. Deposits and redemptions follow Lagoon
                settlement epochs — claim shares after deposits settle, and withdraw underlying after
                redemptions settle.
              </p>
            </div>
            <div className="w-full max-w-md lg:max-w-none">
              <div className="grid w-full grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#62748E]">Total deposited</p>
                  <p className="mt-1 text-lg font-semibold text-[#0F172B]">{tvl}</p>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#62748E]">Price per share</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-[#0F172B]">{px}</p>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#62748E]">Number of deals</p>
                  <p className="mt-1 text-lg font-semibold text-[#0F172B]">
                    {dealsLoading ? '…' : deals.length}
                  </p>
                  <p className="text-[10px] text-[#94A3B8]">TruMarket programs</p>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#62748E]">Fees</p>
                  <p className="mt-1 text-sm font-medium text-[#0F172B]">
                    Mgmt {formatBpsRate(vault.feeRates.managementRate)} · Perf{' '}
                    {formatBpsRate(vault.feeRates.performanceRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap justify-start gap-2" aria-label="Pool sections">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  pathname === t.href
                    ? 'bg-[#4E8C37] text-white shadow-sm'
                    : 'bg-[#F1F5F9] text-[#62748E] hover:bg-[#E2E8F0]',
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">{children}</div>
          <aside className="space-y-4 lg:col-span-4">
            <PoolPositionSidebar
              vault={vault}
              underlyingSymbol={underlying.symbol}
              assetDecimals={underlying.decimals}
              shareDecimals={vault.decimals}
              user={user}
              userLoading={userLoading}
              claimBusy={claimBusy}
              withdrawBusy={withdrawBusy}
              onClaim={() => {
                if (user) void mutations.claimShares(vault, user.maxMint);
              }}
              onWithdraw={() => {
                if (user) void mutations.withdrawAssets(vault, user.maxWithdraw);
              }}
            />
            <PoolDepositRedeemPanel
              vault={vault}
              underlyingSymbol={underlying.symbol}
              assetDecimals={underlying.decimals}
              shareDecimals={vault.decimals}
              user={user}
              userLoading={userLoading}
              mutations={mutations}
            />
            <p className="text-center text-[10px] text-[#94A3B8]">
              Vault {shortenAddress(vault.address, 8, 6)}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
