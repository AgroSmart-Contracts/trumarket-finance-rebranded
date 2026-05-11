'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import {
  TRUMARKET_LAGOON_VAULT_ADDRESS,
  LAGOON_QUERY_STALE_MS,
} from '@/integrations/lagoon/constants';
import { fetchPoolActivity } from '@/integrations/lagoon/lagoonQueries';

export function useLagoonActivity(options?: {
  assetDecimals?: number;
  shareDecimals?: number;
  blockWindow?: bigint;
}) {
  const publicClient = usePublicClient();
  const chainId = publicClient?.chain?.id;

  return useQuery({
    queryKey: [
      'lagoon',
      'activity',
      TRUMARKET_LAGOON_VAULT_ADDRESS,
      chainId,
      options?.assetDecimals,
      options?.shareDecimals,
      options?.blockWindow?.toString(),
    ],
    queryFn: async () => {
      if (!publicClient) throw new Error('No RPC client');
      return fetchPoolActivity(publicClient, TRUMARKET_LAGOON_VAULT_ADDRESS, {
        assetDecimals: options?.assetDecimals,
        shareDecimals: options?.shareDecimals,
        blockWindow: options?.blockWindow,
      });
    },
    enabled: !!publicClient,
    staleTime: LAGOON_QUERY_STALE_MS,
  });
}
