import type { Vault } from '@lagoon-protocol/v0-core';
import {
  fetchVault,
  fetchUser,
  fetchPendingSettlement,
  fetchSymbol,
  fetchDecimals,
  fetchBalanceOf,
} from '@lagoon-protocol/v0-viem';
import type { PublicClient } from 'viem';
import type { Address } from 'viem';
import { formatUnits, parseAbi, parseAbiItem } from 'viem';
import type { LagoonPeriodSummary, PoolActivityRow, Erc20Meta, PoolPricePoint } from './lagoonTypes';
import { formatTokenAmount } from './lagoonFormatters';

export async function fetchLagoonVault(client: PublicClient, vaultAddress: Address) {
  /** Use `fetchVault` instead of `Vault.fetch`: bundlers (e.g. Turbopack) may load `v0-core` before the v0-viem augment runs, so `Vault.fetch` is undefined. */
  return fetchVault(vaultAddress, client);
}

export async function fetchLagoonUser(
  client: PublicClient,
  vaultAddress: Address,
  userAddress: Address,
) {
  return fetchUser(userAddress, vaultAddress, client);
}

export async function fetchUnderlyingMeta(client: PublicClient, asset: Address): Promise<Erc20Meta> {
  const [symbol, decimals] = await Promise.all([
    fetchSymbol({ address: asset }, client),
    fetchDecimals({ address: asset }, client),
  ]);
  return { address: asset, symbol, decimals };
}

export async function fetchUserAssetBalance(
  client: PublicClient,
  asset: Address,
  user: Address,
): Promise<bigint> {
  return fetchBalanceOf({ address: asset }, user, client);
}

export function deriveVaultMetrics(vault: Vault) {
  const oneShare = BigInt(10) ** BigInt(vault.decimals);
  const pricePerShareInAsset =
    oneShare > BigInt(0) ? vault.convertToAssets(oneShare) : BigInt(0);
  return {
    pricePerShareInAsset,
    shareDecimals: vault.decimals,
    assetDecimals: vault.underlyingDecimals,
  };
}

export async function fetchPoolPendingSettlement(client: PublicClient, vault: Vault) {
  return fetchPendingSettlement(
    {
      address: vault.address,
      pendingSilo: vault.pendingSilo,
      asset: vault.asset,
      depositSettleId: vault.depositSettleId,
      redeemSettleId: vault.redeemSettleId,
    },
    client,
    { revalidate: true },
  );
}

const eventDepositRequest = parseAbiItem(
  'event DepositRequest(address indexed controller, address indexed owner, uint256 indexed requestId, address sender, uint256 assets)',
);
const eventRedeemRequest = parseAbiItem(
  'event RedeemRequest(address indexed controller, address indexed owner, uint256 indexed requestId, address sender, uint256 shares)',
);
const eventSettleDeposit = parseAbiItem(
  'event SettleDeposit(uint40 indexed epochId, uint40 indexed settledId, uint256 totalAssets, uint256 totalSupply, uint256 assetsDeposited, uint256 sharesMinted)',
);
const eventSettleRedeem = parseAbiItem(
  'event SettleRedeem(uint40 indexed epochId, uint40 indexed settledId, uint256 totalAssets, uint256 totalSupply, uint256 assetsWithdrawed, uint256 sharesBurned)',
);
const eventWithdraw = parseAbiItem(
  'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
);
const eventNewTotalAssets = parseAbiItem('event NewTotalAssetsUpdated(uint256 totalAssets)');
const eventDepositSync = parseAbiItem(
  'event DepositSync(address indexed sender, address indexed owner, uint256 assets, uint256 shares)',
);

function buildEventSpecs(assetDecimals: number, shareDecimals: number) {
  return [
    {
      abi: eventDepositRequest,
      name: 'DepositRequest' as const,
      map: (a: Record<string, unknown>) => ({
        kind: 'deposit_request' as const,
        label: 'Deposit request',
        details: `${formatTokenAmount(a.assets as bigint, assetDecimals)} assets`,
      }),
    },
    {
      abi: eventRedeemRequest,
      name: 'RedeemRequest' as const,
      map: (a: Record<string, unknown>) => ({
        kind: 'redeem_request' as const,
        label: 'Redemption request',
        details: `${formatTokenAmount(a.shares as bigint, shareDecimals)} shares`,
      }),
    },
    {
      abi: eventSettleDeposit,
      name: 'SettleDeposit' as const,
      map: (a: Record<string, unknown>) => ({
        kind: 'settle_deposit' as const,
        label: 'Deposit settlement',
        details: `Epoch ${String(a.epochId)} · settled ${String(a.settledId)}`,
      }),
    },
    {
      abi: eventSettleRedeem,
      name: 'SettleRedeem' as const,
      map: (a: Record<string, unknown>) => ({
        kind: 'settle_redeem' as const,
        label: 'Redemption settlement',
        details: `Epoch ${String(a.epochId)} · settled ${String(a.settledId)}`,
      }),
    },
    {
      abi: eventWithdraw,
      name: 'Withdraw' as const,
      map: (a: Record<string, unknown>) => ({
        kind: 'withdraw' as const,
        label: 'Withdraw',
        details: `${formatTokenAmount(a.assets as bigint, assetDecimals)} assets`,
      }),
    },
    {
      abi: eventNewTotalAssets,
      name: 'NewTotalAssetsUpdated' as const,
      map: (a: Record<string, unknown>) => ({
        kind: 'valuation' as const,
        label: 'Valuation update',
        details: `totalAssets ${formatTokenAmount(a.totalAssets as bigint, assetDecimals)}`,
      }),
    },
    {
      abi: eventDepositSync,
      name: 'DepositSync' as const,
      map: (a: Record<string, unknown>) => ({
        kind: 'deposit_sync' as const,
        label: 'Sync deposit',
        details: `${formatTokenAmount(a.assets as bigint, assetDecimals)} assets`,
      }),
    },
  ];
}

export async function fetchPoolActivity(
  client: PublicClient,
  vaultAddress: Address,
  options?: {
    blockWindow?: bigint;
    maxRows?: number;
    assetDecimals?: number;
    shareDecimals?: number;
  },
): Promise<PoolActivityRow[]> {
  const blockWindow = options?.blockWindow ?? BigInt(80_000);
  const maxRows = options?.maxRows ?? 60;
  const assetDecimals = options?.assetDecimals ?? 18;
  const shareDecimals = options?.shareDecimals ?? 18;
  const latest = await client.getBlockNumber();
  const fromBlock = latest > blockWindow ? latest - blockWindow : BigInt(0);

  const specs = buildEventSpecs(assetDecimals, shareDecimals);
  const batches = await Promise.all(
    specs.map(async (spec) => {
      const events = await client.getContractEvents({
        address: vaultAddress,
        abi: [spec.abi],
        eventName: spec.name,
        fromBlock,
        toBlock: latest,
      });
      return events.map((ev) => {
        const mapped = spec.map(ev.args as Record<string, unknown>);
        return {
          kind: mapped.kind,
          label: mapped.label,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
          logIndex: ev.logIndex,
          details: mapped.details,
        } satisfies PoolActivityRow;
      });
    }),
  );

  const merged = batches.flat().sort((a, b) => {
    if (a.blockNumber === b.blockNumber) return b.logIndex - a.logIndex;
    return Number(b.blockNumber - a.blockNumber);
  });
  return merged.slice(0, maxRows);
}

function toTvl(totalAssets: bigint, assetDecimals: number): number | null {
  const assets = Number(formatUnits(totalAssets, assetDecimals));
  if (!Number.isFinite(assets) || assets < 0) return null;
  return assets;
}

function mergeOldestAndNewestEvents<T extends { blockNumber: bigint; logIndex: number | bigint }>(
  sorted: T[],
  maxEach: number,
): T[] {
  if (sorted.length <= maxEach * 2) return sorted;
  const oldest = sorted.slice(0, maxEach);
  const newest = sorted.slice(-maxEach);
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of [...oldest, ...newest]) {
    const k = `${e.blockNumber}-${String(e.logIndex)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  out.sort((a, b) => {
    if (a.blockNumber === b.blockNumber)
      return Number(a.logIndex) - Number(b.logIndex);
    return Number(a.blockNumber - b.blockNumber);
  });
  return out;
}

async function fetchBlockTimestampsMs(
  client: PublicClient,
  blockNumbers: bigint[],
): Promise<Map<string, number>> {
  const unique = [...new Set(blockNumbers.map((b) => b.toString()))];
  const blockPairs = await Promise.all(
    unique.map(async (blockNum) => {
      const n = BigInt(blockNum);
      const block = await client.getBlock({ blockNumber: n });
      return [blockNum, Number(block.timestamp) * 1000] as const;
    }),
  );
  return new Map(blockPairs);
}

/** TVL over time for charts, sourced from settlement and valuation events. */
export async function fetchPoolPriceHistory(
  client: PublicClient,
  vaultAddress: Address,
  options?: {
    blockWindow?: bigint;
    maxRows?: number;
    assetDecimals?: number;
  },
): Promise<PoolPricePoint[]> {
  /** Long lookback so “ALL” APR can anchor to early settlements (not only the latest 80 events). */
  const blockWindow = options?.blockWindow ?? BigInt(50_000_000);
  const maxRows = options?.maxRows ?? 120;
  const assetDecimals = options?.assetDecimals ?? 18;
  const latest = await client.getBlockNumber();
  const fromBlock = latest > blockWindow ? latest - blockWindow : BigInt(0);

  const [depSettles, redSettles, valuationEvents] = await Promise.all([
    client.getContractEvents({
      address: vaultAddress,
      abi: [eventSettleDeposit],
      eventName: 'SettleDeposit',
      fromBlock,
      toBlock: latest,
    }),
    client.getContractEvents({
      address: vaultAddress,
      abi: [eventSettleRedeem],
      eventName: 'SettleRedeem',
      fromBlock,
      toBlock: latest,
    }),
    client.getContractEvents({
      address: vaultAddress,
      abi: [eventNewTotalAssets],
      eventName: 'NewTotalAssetsUpdated',
      fromBlock,
      toBlock: latest,
    }),
  ]);

  const settleSorted = [...depSettles, ...redSettles].sort((a, b) => {
    if (a.blockNumber === b.blockNumber) return Number(a.logIndex - b.logIndex);
    return Number(a.blockNumber - b.blockNumber);
  });
  const settleEvents = mergeOldestAndNewestEvents(settleSorted, maxRows);

  const valuationSorted = [...valuationEvents].sort((a, b) => {
    if (a.blockNumber === b.blockNumber) return Number(a.logIndex - b.logIndex);
    return Number(a.blockNumber - b.blockNumber);
  });
  const valuationSlice = mergeOldestAndNewestEvents(valuationSorted, maxRows);

  const valuationBlocks = valuationSlice.map((e) => e.blockNumber);
  const settleBlocks = settleEvents.map((e) => e.blockNumber);
  const allBlocks = [...new Set([...valuationBlocks, ...settleBlocks].map((b) => b.toString()))].map(
    BigInt,
  );
  const blockTs = await fetchBlockTimestampsMs(client, allBlocks);

  const settlePoints: PoolPricePoint[] = [];

  for (const ev of settleEvents) {
    const args = ev.args as Record<string, unknown>;
    const totalAssets = args.totalAssets as bigint | undefined;
    if (totalAssets === undefined) continue;
    const price = toTvl(totalAssets, assetDecimals);
    const ts = blockTs.get(ev.blockNumber.toString());
    if (price === null || ts === undefined) continue;
    settlePoints.push({ timestampMs: ts, price });
  }

  const valuationNav = await Promise.all(
    valuationSlice.map(async (ev) => {
      const args = ev.args as Record<string, unknown>;
      const totalAssets = args.totalAssets as bigint | undefined;
      if (totalAssets === undefined) return null;
      const price = toTvl(totalAssets, assetDecimals);
      const ts = blockTs.get(ev.blockNumber.toString());
      if (price === null || ts === undefined) return null;
      return { timestampMs: ts, price };
    }),
  );

  const valuationPoints: PoolPricePoint[] = valuationNav.filter(
    (p): p is PoolPricePoint => p !== null,
  );

  /** Merge settlement + valuation so ALL APR can use the earliest NAV in range (not only recent valuations). */
  const points = [...settlePoints, ...valuationPoints].sort((a, b) => a.timestampMs - b.timestampMs);
  return points;
}

const PERIOD_SUMMARIES_PAGE = 500;

/**
 * Paginated `periodSummaries` from the Lagoon subgraph (see Lagoon docs / `THEGRAPH_URLS`).
 * Requires `NEXT_PUBLIC_LAGOON_SUBGRAPH_URL` or `NEXT_PUBLIC_THEGRAPH_URLS` (JSON map by chain id).
 */
export async function fetchLagoonPeriodSummaries(
  subgraphUrl: string,
  vaultAddress: Address,
): Promise<LagoonPeriodSummary[]> {
  const vault = vaultAddress.toLowerCase();
  const out: LagoonPeriodSummary[] = [];
  let skip = 0;
  const debug = process.env.NEXT_PUBLIC_LAGOON_APR_DEBUG === 'true';

  for (;;) {
    const res = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query PeriodSummaries($vault: Bytes!, $first: Int!, $skip: Int!) {
          periodSummaries(
            first: $first
            skip: $skip
            orderBy: blockTimestamp
            orderDirection: asc
            where: { vault: $vault }
          ) {
            id
            vault
            blockNumber
            blockTimestamp
            totalAssetsAtStart
            totalSupplyAtStart
            totalAssetsAtEnd
            totalSupplyAtEnd
            netTotalSupplyAtEnd
            duration
          }
        }`,
        variables: { vault, first: PERIOD_SUMMARIES_PAGE, skip },
      }),
    });

    if (!res.ok) {
      if (debug) {
        console.warn('[Lagoon] periodSummaries HTTP', res.status, await res.text().catch(() => ''));
      }
      return [];
    }

    const json = (await res.json()) as {
      data?: { periodSummaries?: LagoonPeriodSummary[] };
      errors?: { message: string }[];
    };

    if (json.errors?.length) {
      if (debug) {
        console.warn('[Lagoon] periodSummaries GraphQL', json.errors);
      }
      return [];
    }

    const batch = json.data?.periodSummaries ?? [];
    out.push(...batch);
    if (batch.length < PERIOD_SUMMARIES_PAGE) break;
    skip += PERIOD_SUMMARIES_PAGE;
  }

  return out;
}
