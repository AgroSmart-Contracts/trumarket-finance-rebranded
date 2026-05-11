'use client';

import type { Vault } from '@lagoon-protocol/v0-core';
import type { User as LagoonUser } from '@lagoon-protocol/v0-core';
import { formatTokenAmount } from '@/integrations/lagoon/lagoonFormatters';
import {
  poolAccentLabelClass,
  poolActionCardClass,
  poolMutedOnDark,
} from '@/components/pool/poolTheme';
import { TruMarketPrimaryButton } from '@/components/ui/trumarket-buttons';
import { PoolPositionPendingSettlements } from '@/components/pool/PoolPositionPendingSettlements';

interface PoolPositionSidebarProps {
  vault: Vault;
  underlyingSymbol: string;
  assetDecimals: number;
  shareDecimals: number;
  user: LagoonUser | undefined;
  userLoading: boolean;
  onClaim: () => void;
  onWithdraw: () => void;
  claimBusy: boolean;
  withdrawBusy: boolean;
}

export function PoolPositionSidebar({
  vault,
  underlyingSymbol,
  assetDecimals,
  shareDecimals,
  user,
  userLoading,
  onClaim,
  onWithdraw,
  claimBusy,
  withdrawBusy,
}: PoolPositionSidebarProps) {
  const canClaim = user && user.maxMint > BigInt(0);
  const canWithdraw = user && user.maxWithdraw > BigInt(0);
  const pendingDepositAssets =
    user && user.pendingDepositRequest > BigInt(0)
      ? user.pendingDepositRequest
      : user && user.hasDepositRequestOnboarded && user.claimableDepositRequestActualized > BigInt(0)
        ? user.claimableDepositRequestActualized
        : BigInt(0);
  const pendingRedeemSharesFromAssets =
    user && user.pendingRedeemRequestInAssets > BigInt(0)
      ? vault.convertToShares(user.pendingRedeemRequestInAssets)
      : BigInt(0);
  const pendingRedeemSharesFromPositionRaw =
    user
      ? user.positionInShares -
        user.balance -
        user.maxMint -
        user.pendingDepositRequestInShares
      : BigInt(0);
  const pendingRedeemSharesFromPosition =
    pendingRedeemSharesFromPositionRaw > BigInt(0) ? pendingRedeemSharesFromPositionRaw : BigInt(0);
  const pendingRedeemShares =
    user && user.hasRedeemRequestOnboarded && user.maxRedeem > BigInt(0)
      ? user.maxRedeem
      : pendingRedeemSharesFromAssets > BigInt(0)
        ? pendingRedeemSharesFromAssets
        : pendingRedeemSharesFromPosition > BigInt(0)
          ? pendingRedeemSharesFromPosition
          : BigInt(0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#0F172B]">Position</h3>
        {userLoading ? (
          <p className="mt-3 text-sm text-[#62748E]">Loading…</p>
        ) : !user ? (
          <p className="mt-3 text-sm text-[#62748E]">
            Connect your wallet to see pool shares and balances.
          </p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-2 border-b border-[#F1F5F9] pb-2">
              <span className="text-[#62748E]">Pool shares</span>
              <span className="text-right font-medium text-[#0F172B]">
                {formatTokenAmount(user.balance, shareDecimals)} {vault.symbol}
              </span>
            </div>
            {user.maxMint > BigInt(0) && (
              <div className="flex justify-between gap-2 text-amber-800">
                <span>Not claimed</span>
                <span className="font-medium">
                  {formatTokenAmount(user.maxMint, shareDecimals)} {vault.symbol}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <span className="text-[#62748E]">Est. value</span>
              <span className="font-medium text-[#0F172B]">
                {formatTokenAmount(user.positionInAssets, assetDecimals)} {underlyingSymbol}
              </span>
            </div>
            <PoolPositionPendingSettlements
              vaultSymbol={vault.symbol ?? '—'}
              underlyingSymbol={underlyingSymbol}
              assetDecimals={assetDecimals}
              shareDecimals={shareDecimals}
              pendingDepositAssets={pendingDepositAssets}
              pendingRedeemShares={pendingRedeemShares}
            />
          </div>
        )}
      </div>

      {user && (
        <>
          <div className={poolActionCardClass}>
            <p className={poolAccentLabelClass}>Shares available to claim</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0F172B]">
              {formatTokenAmount(user.maxMint, shareDecimals)}{' '}
              <span className="text-lg font-normal text-[#62748E]">{vault.symbol}</span>
            </p>
            <p className={poolMutedOnDark}>
              When the latest settlement completes, claim your pool shares here.
            </p>
            <TruMarketPrimaryButton
              className="mt-4"
              disabled={!canClaim || claimBusy}
              onClick={onClaim}
            >
              {claimBusy ? 'Confirm in wallet…' : 'Claim'}
            </TruMarketPrimaryButton>
          </div>

          <div className={poolActionCardClass}>
            <p className={poolAccentLabelClass}>Assets available to withdraw</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0F172B]">
              {formatTokenAmount(user.maxWithdraw, assetDecimals)}{' '}
              <span className="text-lg font-normal text-[#62748E]">{underlyingSymbol}</span>
            </p>
            <p className={poolMutedOnDark}>
              After redemption settles, withdraw underlying to your wallet.
            </p>
            <TruMarketPrimaryButton
              className="mt-4"
              disabled={!canWithdraw || withdrawBusy}
              onClick={onWithdraw}
            >
              {withdrawBusy ? 'Confirm in wallet…' : 'Withdraw'}
            </TruMarketPrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}
