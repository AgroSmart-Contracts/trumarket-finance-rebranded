'use client';

import { useLagoonVaultContext } from '@/context/lagoon-vault-context';
import { TRUMARKET_LAGOON_VAULT_ADDRESS } from '@/integrations/lagoon/constants';
import { shortenAddress, vaultStateLabel } from '@/integrations/lagoon/lagoonFormatters';

export function PoolDetailsMain() {
  const { vault, underlying } = useLagoonVaultContext();
  if (!vault || !underlying) return null;

  const rows: { label: string; value: string }[] = [
    { label: 'Vault address', value: vault.address },
    { label: 'Underlying asset', value: `${underlying.symbol} · ${vault.asset}` },
    { label: 'Share token', value: `${vault.symbol} · ${vault.address}` },
    { label: 'Decimals (share / asset)', value: `${vault.decimals} / ${vault.underlyingDecimals}` },
    { label: 'State', value: vaultStateLabel(vault.state) },
    { label: 'Safe (custody)', value: vault.safe },
    { label: 'Valuation manager', value: vault.valuationManager },
    { label: 'Whitelist active', value: vault.isWhitelistActivated ? 'Yes' : 'No' },
    { label: 'Protocol version', value: String(vault.version) },
  ];

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#0F172B]">Vault details</h2>
      <p className="mt-1 text-sm text-[#62748E]">
        Onchain metadata for the TruMarket Lagoon vault. Explorer:{' '}
        <a
          className="text-[#4E8C37] hover:underline"
          href={`https://basescan.org/address/${TRUMARKET_LAGOON_VAULT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
        >
          Basescan
        </a>
        .
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-col gap-1 border-b border-[#F1F5F9] py-3 last:border-0 sm:flex-row sm:justify-between"
          >
            <dt className="text-[#62748E]">{r.label}</dt>
            <dd className="break-all font-mono text-xs text-[#0F172B] sm:max-w-[60%] sm:text-right">
              {r.value.startsWith('0x') ? (
                <span title={r.value}>{r.value}</span>
              ) : (
                r.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-[#94A3B8]">
        TruMarket vault: {shortenAddress(TRUMARKET_LAGOON_VAULT_ADDRESS, 10, 8)}
      </p>
    </div>
  );
}
