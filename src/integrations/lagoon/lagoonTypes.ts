import type { Address } from 'viem';

export type PoolActivityKind =
  | 'deposit_request'
  | 'redeem_request'
  | 'settle_deposit'
  | 'settle_redeem'
  | 'withdraw'
  | 'valuation'
  | 'deposit_sync'
  | 'other';

export interface PoolActivityRow {
  kind: PoolActivityKind;
  label: string;
  txHash?: `0x${string}`;
  blockNumber: bigint;
  logIndex: number;
  details?: string;
}

export interface Erc20Meta {
  address: Address;
  symbol: string;
  decimals: number;
}

export interface VaultDerivedMetrics {
  pricePerShareInAsset: bigint;
  shareDecimals: number;
  assetDecimals: number;
}

export interface PoolPricePoint {
  timestampMs: number;
  price: number;
}

export type LagoonAsyncFlowStatus =
  | 'idle'
  | 'pending_wallet'
  | 'pending_confirm'
  | 'success'
  | 'error';

/** Lagoon subgraph `PeriodSummary` (BigInt fields as string from GraphQL). */
export interface LagoonPeriodSummary {
  id: string;
  vault: string;
  blockNumber: string;
  blockTimestamp: string;
  totalAssetsAtStart: string;
  totalSupplyAtStart: string;
  totalAssetsAtEnd: string;
  totalSupplyAtEnd: string;
  netTotalSupplyAtEnd: string;
  duration: string;
}
