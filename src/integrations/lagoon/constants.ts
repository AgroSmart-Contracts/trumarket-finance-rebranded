import { base, baseSepolia } from 'wagmi/chains';
import type { Address } from 'viem';
import { parseEnvChainId } from '@/lib/parse-env-chain-id';

/** Set `NEXT_PUBLIC_LAGOON_VAULT_ADDRESS` in env (no fallback in source). */
export const TRUMARKET_LAGOON_VAULT_ADDRESS = process.env
  .NEXT_PUBLIC_LAGOON_VAULT_ADDRESS as Address;

const envChainId = parseEnvChainId(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID);

export function getExpectedLagoonChain() {
  if (envChainId === baseSepolia.id) return baseSepolia;
  return base;
}

export const LAGOON_QUERY_STALE_MS = 25_000;

/**
 * Lagoon vault subgraph (GraphQL POST) for `periodSummaries`.
 * Set `NEXT_PUBLIC_LAGOON_SUBGRAPH_URL`, or `NEXT_PUBLIC_THEGRAPH_URLS` as JSON `{ "8453": "https://…" }`.
 */
export function getLagoonSubgraphUrl(chainId: number): string | undefined {
  const direct = process.env.NEXT_PUBLIC_LAGOON_SUBGRAPH_URL?.trim();
  if (direct) return direct;
  const raw = process.env.NEXT_PUBLIC_THEGRAPH_URLS?.trim();
  if (!raw) return undefined;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    return map[String(chainId)];
  } catch {
    return undefined;
  }
}
