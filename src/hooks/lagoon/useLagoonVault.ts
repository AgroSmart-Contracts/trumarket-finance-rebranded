'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import {
  TRUMARKET_LAGOON_VAULT_ADDRESS,
  LAGOON_QUERY_STALE_MS,
  getExpectedLagoonChain,
  getLagoonSubgraphUrl,
} from '@/integrations/lagoon/constants';
import { computeLagoonAllNetAprFromPeriodSummaries } from '@/integrations/lagoon/lagoonAllApr';
import {
  deriveVaultMetrics,
  fetchLagoonPeriodSummaries,
  fetchLagoonVault,
  fetchPoolPendingSettlement,
  fetchPoolPriceHistory,
  fetchUnderlyingMeta,
} from '@/integrations/lagoon/lagoonQueries';

export function useLagoonVault() {
  const publicClient = usePublicClient();
  const chainId = publicClient?.chain?.id;

  return useQuery({
    queryKey: ['lagoon', 'vault', TRUMARKET_LAGOON_VAULT_ADDRESS, chainId],
    queryFn: async () => {
      if (!publicClient) throw new Error('No RPC client');
      const expected = getExpectedLagoonChain();
      if (publicClient.chain?.id !== expected.id) {
        throw new Error(`Switch wallet to ${expected.name} to load the TruMarket pool.`);
      }
      const vault = await fetchLagoonVault(publicClient, TRUMARKET_LAGOON_VAULT_ADDRESS);
      const subgraphUrl = getLagoonSubgraphUrl(expected.id);
      const [underlying, pendingSettlement, derived, priceHistory, periodSummaries] =
        await Promise.all([
          fetchUnderlyingMeta(publicClient, vault.asset),
          fetchPoolPendingSettlement(publicClient, vault),
          Promise.resolve(deriveVaultMetrics(vault)),
          fetchPoolPriceHistory(publicClient, vault.address, {
            assetDecimals: vault.underlyingDecimals,
          }),
          subgraphUrl
            ? fetchLagoonPeriodSummaries(subgraphUrl, TRUMARKET_LAGOON_VAULT_ADDRESS)
            : Promise.resolve([]),
        ]);

      const allApr = computeLagoonAllNetAprFromPeriodSummaries({
        periodSummaries,
        vaultDecimals: vault.decimals,
        assetDecimals: vault.underlyingDecimals,
      });

      if (process.env.NEXT_PUBLIC_LAGOON_APR_DEBUG === 'true' && allApr) {
        console.info('[Lagoon ALL APR]', {
          startId: allApr.debug.startSummaryId,
          startTs: allApr.debug.startTimestampSec,
          startPps: allApr.debug.startPpsHuman,
          endId: allApr.debug.endSummaryId,
          endTs: allApr.debug.endTimestampSec,
          endPps: allApr.debug.endPpsHuman,
          elapsedSeconds: allApr.debug.elapsedSeconds,
          rawReturn: allApr.debug.rawReturn,
          aprPercent: allApr.debug.aprPercent,
        });
      }

      return { vault, underlying, pendingSettlement, derived, priceHistory, periodSummaries, allApr };
    },
    enabled: !!publicClient,
    staleTime: LAGOON_QUERY_STALE_MS,
  });
}
