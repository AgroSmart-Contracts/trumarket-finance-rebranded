'use client';

import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLagoonActivity } from '@/hooks/lagoon/useLagoonActivity';
import { useLagoonVaultContext } from '@/context/lagoon-vault-context';
import { shortenAddress } from '@/integrations/lagoon/lagoonFormatters';
import type { PoolActivityKind } from '@/integrations/lagoon/lagoonTypes';
import { cn } from '@/lib/utils';

type ActivityFilter = 'all' | 'deposit' | 'withdraw' | 'valuation' | 'settlement';

function rowMatchesFilter(kind: PoolActivityKind, f: ActivityFilter): boolean {
  if (f === 'all') return true;
  if (f === 'deposit') return kind === 'deposit_request' || kind === 'deposit_sync';
  if (f === 'withdraw') return kind === 'withdraw' || kind === 'redeem_request';
  if (f === 'valuation') return kind === 'valuation';
  if (f === 'settlement') return kind === 'settle_deposit' || kind === 'settle_redeem';
  return true;
}

export function PoolActivityMain() {
  const { vault, underlying } = useLagoonVaultContext();
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const activityQuery = useLagoonActivity({
    assetDecimals: underlying?.decimals,
    shareDecimals: vault?.decimals,
  });

  const rows = useMemo(() => {
    const raw = activityQuery.data ?? [];
    return raw.filter((r) => rowMatchesFilter(r.kind, filter));
  }, [activityQuery.data, filter]);

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#0F172B]">Transaction history</h2>
      <p className="mt-1 text-xs text-[#62748E]">
        Recent vault events from Base (bounded block window). Use Basescan for full history.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['deposit', 'Deposit'],
            ['withdraw', 'Withdraw'],
            ['valuation', 'Valuation'],
            ['settlement', 'Settlement'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              filter === key
                ? 'bg-[#4E8C37] text-white shadow-sm'
                : 'bg-[#F1F5F9] text-[#62748E] hover:bg-[#E2E8F0]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs uppercase tracking-wide text-[#62748E]">
            <tr>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Operation</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Block</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {activityQuery.isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#62748E]">
                  Loading…
                </td>
              </tr>
            )}
            {activityQuery.isError && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-red-600">
                  Failed to load events.
                </td>
              </tr>
            )}
            {!activityQuery.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#62748E]">
                  No rows for this filter.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={`${row.txHash ?? 'x'}-${row.logIndex}-${i}`}
                className="hover:bg-[#F8FAFC]"
              >
                <td className="px-4 py-3 font-mono text-xs text-[#475569]">
                  {row.txHash ? shortenAddress(row.txHash, 8, 6) : '—'}
                </td>
                <td className="px-4 py-3 text-[#0F172B]">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        row.kind === 'deposit_request' || row.kind === 'deposit_sync'
                          ? 'bg-emerald-500'
                          : row.kind === 'redeem_request' || row.kind === 'withdraw'
                            ? 'bg-rose-500'
                            : row.kind === 'valuation'
                              ? 'bg-amber-500'
                              : row.kind === 'settle_deposit' || row.kind === 'settle_redeem'
                                ? 'bg-violet-500'
                                : 'bg-slate-400',
                      )}
                    />
                    {row.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#0F172B]">{row.details ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#62748E]">#{row.blockNumber.toString()}</span>
                    {row.txHash && (
                      <a
                        href={`https://basescan.org/tx/${row.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4E8C37] hover:text-[#3A6A28]"
                        aria-label="View on Basescan"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
