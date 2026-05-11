import { State } from '@lagoon-protocol/v0-core';
import { formatUnits } from 'viem';

export function vaultStateLabel(state: State): string {
  switch (state) {
    case State.Open:
      return 'Open';
    case State.Closing:
      return 'Closing';
    case State.Closed:
      return 'Closed';
    default:
      return 'Unknown';
  }
}

export function formatTokenAmount(
  value: bigint,
  decimals: number,
  fractionDigits = 4,
): string {
  if (decimals < 0 || decimals > 36) return '—';
  const s = formatUnits(value, decimals);
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return n.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  });
}

export function shortenAddress(addr: string, left = 6, right = 4): string {
  if (!addr.startsWith('0x') || addr.length < 10) return addr;
  return `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

export function formatBpsRate(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}
