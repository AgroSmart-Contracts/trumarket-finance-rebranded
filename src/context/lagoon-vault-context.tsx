'use client';

import React, { createContext, useContext } from 'react';
import { useLagoonVault } from '@/hooks/lagoon/useLagoonVault';
import { useLagoonUser } from '@/hooks/lagoon/useLagoonUser';
import type { Vault } from '@lagoon-protocol/v0-core';
import type { User as LagoonUser } from '@lagoon-protocol/v0-core';
import type { Erc20Meta, PoolPricePoint } from '@/integrations/lagoon/lagoonTypes';
import type { LagoonAllAprDebug } from '@/integrations/lagoon/lagoonAllApr';

interface PendingSettlement {
  assets: bigint;
  shares: bigint;
}

export interface LagoonVaultContextValue {
  vault: Vault | undefined;
  underlying: Erc20Meta | undefined;
  derived:
    | {
        pricePerShareInAsset: bigint;
        shareDecimals: number;
        assetDecimals: number;
      }
    | undefined;
  pendingSettlement: PendingSettlement | undefined;
  priceHistory: PoolPricePoint[];
  /** Linear net ALL APR from subgraph period summaries; `undefined` if not loaded or no subgraph. */
  allApr:
    | { aprPercent: number; debug: LagoonAllAprDebug }
    | null
    | undefined;
  user: LagoonUser | undefined;
  userLoading: boolean;
  vaultLoading: boolean;
  error: Error | null;
}

const LagoonVaultContext = createContext<LagoonVaultContextValue | null>(null);

export function LagoonVaultProvider({ children }: { children: React.ReactNode }) {
  const vaultQuery = useLagoonVault();
  const userQuery = useLagoonUser(!!vaultQuery.data);

  const value: LagoonVaultContextValue = {
    vault: vaultQuery.data?.vault,
    underlying: vaultQuery.data?.underlying,
    derived: vaultQuery.data?.derived,
    pendingSettlement: vaultQuery.data?.pendingSettlement,
    priceHistory: vaultQuery.data?.priceHistory ?? [],
    allApr: vaultQuery.data?.allApr,
    user: userQuery.data,
    userLoading: userQuery.isLoading,
    vaultLoading: vaultQuery.isLoading,
    error: (vaultQuery.error as Error | undefined) ?? null,
  };

  return (
    <LagoonVaultContext.Provider value={value}>{children}</LagoonVaultContext.Provider>
  );
}

export function useLagoonVaultContext() {
  const ctx = useContext(LagoonVaultContext);
  if (!ctx) {
    throw new Error('useLagoonVaultContext must be used within LagoonVaultProvider');
  }
  return ctx;
}
