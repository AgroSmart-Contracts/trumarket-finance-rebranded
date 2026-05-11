import type { Vault } from '@lagoon-protocol/v0-core';
import type { Address } from 'viem';

export function lagoonRequestDepositWrite(
  vault: Vault,
  assets: bigint,
  controller: Address,
  owner: Address,
) {
  return {
    address: vault.address,
    abi: vault.getAbi(),
    functionName: 'requestDeposit' as const,
    args: [assets, controller, owner] as const,
    value: BigInt(0),
  };
}

export function lagoonClaimSharesWrite(
  vault: Vault,
  shares: bigint,
  receiver: Address,
  controller: Address,
) {
  return {
    address: vault.address,
    abi: vault.getAbi(),
    functionName: 'mint' as const,
    args: [shares, receiver, controller] as const,
  };
}

export function lagoonRequestRedeemWrite(
  vault: Vault,
  shares: bigint,
  controller: Address,
  owner: Address,
) {
  return {
    address: vault.address,
    abi: vault.getAbi(),
    functionName: 'requestRedeem' as const,
    args: [shares, controller, owner] as const,
  };
}

export function lagoonWithdrawAfterRedeemWrite(
  vault: Vault,
  assets: bigint,
  receiver: Address,
  controller: Address,
) {
  return {
    address: vault.address,
    abi: vault.getAbi(),
    functionName: 'withdraw' as const,
    args: [assets, receiver, controller] as const,
  };
}
