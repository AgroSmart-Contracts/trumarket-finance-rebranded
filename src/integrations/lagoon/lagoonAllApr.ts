import { VaultUtils } from '@lagoon-protocol/v0-core';
import { formatUnits } from 'viem';
import type { LagoonPeriodSummary } from './lagoonTypes';

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

/**
 * Linear APR% over a window, matching Lagoon dashboard ALL APR:
 * ((endPps - startPps) / startPps) * (SECONDS_PER_YEAR / elapsedSeconds) * 100
 * No compounding (not APY).
 */
export function computeLinearAprPercent(params: {
  startPps: number;
  endPps: number;
  elapsedSeconds: number;
}): number | null {
  const { startPps, endPps, elapsedSeconds } = params;
  if (
    !Number.isFinite(startPps) ||
    !Number.isFinite(endPps) ||
    !Number.isFinite(elapsedSeconds) ||
    startPps <= 0 ||
    elapsedSeconds <= 0
  ) {
    return null;
  }
  return ((endPps - startPps) / startPps) * (SECONDS_PER_YEAR / elapsedSeconds) * 100;
}

function ppsAtStartFromSummary(
  summary: LagoonPeriodSummary,
  vaultDecimals: number,
  assetDecimals: number,
): bigint {
  const decimalsOffset = BigInt(vaultDecimals - assetDecimals);
  const oneShare = BigInt(10) ** BigInt(vaultDecimals);
  return VaultUtils.convertToAssets(oneShare, {
    decimalsOffset,
    totalAssets: BigInt(summary.totalAssetsAtStart),
    totalSupply: BigInt(summary.totalSupplyAtStart),
  });
}

function netPpsAtEndFromSummary(
  summary: LagoonPeriodSummary,
  vaultDecimals: number,
  assetDecimals: number,
): bigint {
  const decimalsOffset = BigInt(vaultDecimals - assetDecimals);
  const oneShare = BigInt(10) ** BigInt(vaultDecimals);
  return VaultUtils.convertToAssets(oneShare, {
    decimalsOffset,
    totalAssets: BigInt(summary.totalAssetsAtEnd),
    totalSupply: BigInt(summary.netTotalSupplyAtEnd),
  });
}

export type LagoonAllAprDebug = {
  startSummaryId: string;
  endSummaryId: string;
  startTimestampSec: number;
  endTimestampSec: number;
  elapsedSeconds: number;
  startPpsHuman: number;
  endPpsHuman: number;
  rawReturn: number;
  aprPercent: number;
};

/**
 * Subgraph rows with `duration === 0` are open / in-progress: `totalAssetsAtEnd` may still reflect the
 * previous period while `netTotalSupplyAtEnd` already moved, which collapses PPS and breaks ALL APR.
 * Lagoon-style ALL APR should anchor the **end** on the latest **completed** period (`duration > 0`).
 */
function pickLatestCompletedPeriodSummary(sorted: LagoonPeriodSummary[]) {
  for (let i = sorted.length - 1; i >= 0; i--) {
    const row = sorted[i]!;
    if (Number(row.duration) > 0) return row;
  }
  return sorted[sorted.length - 1]!;
}

/**
 * ALL APR (net, linear): since earliest available period summary through the end of the latest **completed**
 * period (latest with `duration > 0`). Start/end PPS and timestamps come only from those subgraph rows.
 */
export function computeLagoonAllNetAprFromPeriodSummaries(params: {
  periodSummaries: LagoonPeriodSummary[];
  vaultDecimals: number;
  assetDecimals: number;
}): { aprPercent: number; debug: LagoonAllAprDebug } | null {
  const { periodSummaries, vaultDecimals, assetDecimals } = params;
  if (periodSummaries.length === 0) return null;

  const sorted = [...periodSummaries].sort(
    (a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp),
  );
  const oldest = sorted[0]!;
  const newest = pickLatestCompletedPeriodSummary(sorted);

  const startPps = ppsAtStartFromSummary(oldest, vaultDecimals, assetDecimals);
  const endPps = netPpsAtEndFromSummary(newest, vaultDecimals, assetDecimals);

  const startTimestampSec = Number(oldest.blockTimestamp);
  const endTimestampSec = Number(newest.blockTimestamp) + Number(newest.duration);
  const elapsedSeconds = endTimestampSec - startTimestampSec;

  const startPpsHuman = Number(formatUnits(startPps, assetDecimals));
  const endPpsHuman = Number(formatUnits(endPps, assetDecimals));

  if (
    !Number.isFinite(startTimestampSec) ||
    !Number.isFinite(endTimestampSec) ||
    elapsedSeconds <= 0 ||
    !Number.isFinite(startPpsHuman) ||
    !Number.isFinite(endPpsHuman) ||
    startPpsHuman <= 0
  ) {
    return null;
  }

  const aprPercent = computeLinearAprPercent({
    startPps: startPpsHuman,
    endPps: endPpsHuman,
    elapsedSeconds,
  });
  if (aprPercent === null || !Number.isFinite(aprPercent)) return null;

  const rawReturn = (endPpsHuman - startPpsHuman) / startPpsHuman;

  return {
    aprPercent,
    debug: {
      startSummaryId: oldest.id,
      endSummaryId: newest.id,
      startTimestampSec,
      endTimestampSec,
      elapsedSeconds,
      startPpsHuman,
      endPpsHuman,
      rawReturn,
      aprPercent,
    },
  };
}
