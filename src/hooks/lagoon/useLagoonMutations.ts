'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import {
  useAccount,
  useWriteContract,
  useChainId,
  useSwitchChain,
  usePublicClient,
} from 'wagmi';
import { parseUnits, type Abi } from 'viem';
import type { Vault } from '@lagoon-protocol/v0-core';
import ERC20_ABI from '@/lib/abis/ERC20.abi';
import { config } from '@/lib/wagmi-config';
import { TRUMARKET_LAGOON_VAULT_ADDRESS } from '@/integrations/lagoon/constants';
import { getExpectedLagoonChain } from '@/integrations/lagoon/constants';
import {
  lagoonClaimSharesWrite,
  lagoonRequestDepositWrite,
  lagoonRequestRedeemWrite,
  lagoonWithdrawAfterRedeemWrite,
} from '@/integrations/lagoon/lagoonActions';
import type { LagoonAsyncFlowStatus } from '@/integrations/lagoon/lagoonTypes';

const erc20Abi = ERC20_ABI as Abi;

function isWalletUserRejection(err: unknown): boolean {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code?: number | string }).code;
    if (code === 4001 || code === 'ACTION_REJECTED') return true;
  }
  const s = String(err instanceof Error ? err.message : err).toLowerCase();
  return (
    s.includes('user rejected') ||
    s.includes('rejected the request') ||
    s.includes('denied transaction') ||
    s.includes('user denied') ||
    (s.includes('transaction signature') && s.includes('denied'))
  );
}

function formatTransactionError(err: unknown): string {
  if (isWalletUserRejection(err)) {
    return 'Transaction was rejected by the user';
  }
  return err instanceof Error ? err.message : 'Transaction failed';
}

function invalidateLagoonQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userAddress?: string,
) {
  queryClient.invalidateQueries({ queryKey: ['lagoon', 'vault'] });
  queryClient.invalidateQueries({ queryKey: ['lagoon', 'activity'] });
  queryClient.invalidateQueries({ queryKey: ['lagoon', 'user'] });
  queryClient.invalidateQueries({ queryKey: ['lagoon', 'walletBalance'] });
  if (userAddress) {
    queryClient.invalidateQueries({
      queryKey: ['lagoon', 'user', TRUMARKET_LAGOON_VAULT_ADDRESS, userAddress],
    });
  }
}

export function useLagoonMutations(assetDecimals: number) {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const expected = getExpectedLagoonChain();

  const [flowStatus, setFlowStatus] = useState<LagoonAsyncFlowStatus>('idle');
  const [flowMessage, setFlowMessage] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const ensureCorrectChain = useCallback(async () => {
    if (chainId !== expected.id) {
      if (!switchChainAsync) throw new Error(`Switch your wallet to ${expected.name}.`);
      await switchChainAsync({ chainId: expected.id });
    }
  }, [chainId, expected.id, expected.name, switchChainAsync]);

  const waitHash = useCallback(
    async (hash: `0x${string}`) => {
      setFlowStatus('pending_confirm');
      await waitForTransactionReceipt(config, { hash });
      invalidateLagoonQueries(queryClient, address);
    },
    [queryClient, address],
  );

  const requestDeposit = useCallback(
    async (amountHuman: string, vaultRef: Vault) => {
      if (!address) throw new Error('Connect a wallet to deposit.');
      if (!publicClient) throw new Error('No network connection.');
      await ensureCorrectChain();
      const assets = parseUnits(amountHuman, assetDecimals);
      if (assets <= BigInt(0)) throw new Error('Enter a positive amount.');

      setFlowMessage(null);
      setFlowStatus('pending_wallet');

      const allowance = (await publicClient.readContract({
        address: vaultRef.asset,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, vaultRef.address],
      })) as bigint;

      if (allowance < assets) {
        const approveHash = await writeContractAsync({
          address: vaultRef.asset,
          abi: erc20Abi,
          functionName: 'approve',
          args: [vaultRef.address, assets],
        });
        await waitHash(approveHash);
      }

      const dep = lagoonRequestDepositWrite(vaultRef, assets, address, address);
      const hash = await writeContractAsync({
        address: dep.address,
        abi: dep.abi,
        functionName: dep.functionName,
        args: [...dep.args],
        value: dep.value,
      });
      await waitHash(hash);
      toast.success('Deposit submitted successfully!');
      setFlowStatus('idle');
    },
    [address, assetDecimals, ensureCorrectChain, publicClient, waitHash, writeContractAsync],
  );

  const claimShares = useCallback(
    async (vaultRef: Vault, shares: bigint) => {
      if (!address) throw new Error('Connect a wallet.');
      await ensureCorrectChain();
      if (shares <= BigInt(0)) throw new Error('Nothing to claim.');
      setFlowStatus('pending_wallet');
      const w = lagoonClaimSharesWrite(vaultRef, shares, address, address);
      const hash = await writeContractAsync({
        address: w.address,
        abi: w.abi,
        functionName: w.functionName,
        args: [...w.args],
      });
      await waitHash(hash);
      setFlowStatus('success');
    },
    [address, ensureCorrectChain, waitHash, writeContractAsync],
  );

  const requestRedeem = useCallback(
    async (amountHuman: string, vaultRef: Vault, shareDecimals: number) => {
      if (!address) throw new Error('Connect a wallet.');
      await ensureCorrectChain();
      const shares = parseUnits(amountHuman, shareDecimals);
      if (shares <= BigInt(0)) throw new Error('Enter a positive share amount.');
      setFlowStatus('pending_wallet');
      const w = lagoonRequestRedeemWrite(vaultRef, shares, address, address);
      const hash = await writeContractAsync({
        address: w.address,
        abi: w.abi,
        functionName: w.functionName,
        args: [...w.args],
      });
      await waitHash(hash);
      setFlowStatus('success');
    },
    [address, ensureCorrectChain, waitHash, writeContractAsync],
  );

  const withdrawAssets = useCallback(
    async (vaultRef: Vault, assets: bigint) => {
      if (!address) throw new Error('Connect a wallet.');
      await ensureCorrectChain();
      if (assets <= BigInt(0)) throw new Error('Nothing to withdraw.');
      setFlowStatus('pending_wallet');
      const w = lagoonWithdrawAfterRedeemWrite(vaultRef, assets, address, address);
      const hash = await writeContractAsync({
        address: w.address,
        abi: w.abi,
        functionName: w.functionName,
        args: [...w.args],
      });
      await waitHash(hash);
      setFlowStatus('success');
    },
    [address, ensureCorrectChain, waitHash, writeContractAsync],
  );

  const resetFlow = useCallback(() => {
    setFlowStatus('idle');
    setFlowMessage(null);
  }, []);

  const run = useCallback(async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      const msg = formatTransactionError(e);
      setFlowStatus('error');
      setFlowMessage(msg);
      toast.error(msg);
    }
  }, []);

  return {
    requestDeposit: (amount: string, v: Vault) => run(() => requestDeposit(amount, v)),
    claimShares: (v: Vault, shares: bigint) => run(() => claimShares(v, shares)),
    requestRedeem: (amount: string, v: Vault, sd: number) =>
      run(() => requestRedeem(amount, v, sd)),
    withdrawAssets: (v: Vault, assets: bigint) => run(() => withdrawAssets(v, assets)),
    flowStatus,
    flowMessage,
    resetFlow,
  };
}
