'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';
import {
  TRUMARKET_LAGOON_VAULT_ADDRESS,
  LAGOON_QUERY_STALE_MS,
} from '@/integrations/lagoon/constants';
import { fetchLagoonUser, fetchUserAssetBalance } from '@/integrations/lagoon/lagoonQueries';

export function useLagoonUser(enabled: boolean) {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const chainId = publicClient?.chain?.id;

  return useQuery({
    queryKey: ['lagoon', 'user', TRUMARKET_LAGOON_VAULT_ADDRESS, address, chainId],
    queryFn: async () => {
      if (!publicClient || !address) throw new Error('Wallet required');
      return fetchLagoonUser(publicClient, TRUMARKET_LAGOON_VAULT_ADDRESS, address);
    },
    enabled: !!publicClient && !!address && enabled,
    staleTime: LAGOON_QUERY_STALE_MS,
  });
}

export function useLagoonWalletAssetBalance(
  assetAddress: `0x${string}` | undefined,
  enabled: boolean,
) {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  return useQuery({
    queryKey: ['lagoon', 'walletBalance', assetAddress, address, publicClient?.chain?.id],
    queryFn: async () => {
      if (!publicClient || !address || !assetAddress) return BigInt(0);
      return fetchUserAssetBalance(publicClient, assetAddress, address);
    },
    enabled: !!publicClient && !!address && !!assetAddress && enabled,
    staleTime: LAGOON_QUERY_STALE_MS,
  });
}
